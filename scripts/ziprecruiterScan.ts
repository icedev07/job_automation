/**
 * ZipRecruiter scan: click job cards in the left panel; extract job description from right pane;
 * click Apply to open real jobsite URL; save to JobApplication + JobDescription.
 * Uses persistent context (logged-in). Max jobs per run: ZIPRECRUITER_MAX_JOBS_PER_RUN (default 2).
 * Run: npm run ziprecruiter:scan
 *
 * WORKFLOW:
 * 1. Find left-pane job cards.
 * 2. For each card: read title + company from card. If card shows "1-Click Apply", skip (do not open pane).
 * 3. Click card to load right pane. Get right panel text; if title/company Unknown, parse from panel.
 * 4. If right pane shows "1-Click Apply", skip.
 * 5. Extract job description, click Apply → new tab with real jobsite URL.
 * 6. upsertJobApplication + saveJobDescription. Close new tab.
 */

import "dotenv/config";
import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import * as fs from "fs";
import * as path from "path";

import { findDuplicateJob } from "../lib/jobDuplicateDetection";
import { upsertJobApplication } from "../lib/jobApplications";
import { prisma } from "../lib/prisma";

// URL used for job scan: set ZIPRECRUITER_SEARCH_URL in .env, or this default is used.
// For remote jobs: use location=Remote+%28USA%29 (or copy the URL from ZipRecruiter after
// running your search in the browser — if ZipRecruiter changed their site, the address bar URL is the one that works).
const DEFAULT_ZIPRECRUITER_URL =
  "https://www.ziprecruiter.com/jobs-search?search=Machine+Learning+Engineer&location=Remote+%28USA%29&days=5&page=1";
const ZIPRECRUITER_SEARCH_URL =
  process.env.ZIPRECRUITER_SEARCH_URL || DEFAULT_ZIPRECRUITER_URL;
const MAX_JOBS_PER_RUN = Number(process.env.ZIPRECRUITER_MAX_JOBS_PER_RUN ?? 2);
const USER_ID = Number(process.env.JOBBOT_USER_ID ?? 1);

/** Run a promise with a timeout; on timeout return the fallback. */
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

/** Log a step and return a function that logs elapsed ms when called. */
function logTimed(label: string): () => void {
  const start = Date.now();
  return () => {
    const ms = Date.now() - start;
    console.log(`     ⏱️ ${label}: ${ms} ms`);
  };
}

function expandPath(dir: string | undefined): string {
  const home = process.env.HOME || process.env.USERPROFILE || process.cwd();
  if (!dir) return path.join(home, ".jobbot", "ziprecruiter");
  const cleanPath = dir.split(/\s+/)[0].trim().replace(/^["']|["']$/g, "");
  return cleanPath.replace(/\$HOME|^~/, home);
}

const PERSISTENT_CONTEXT_DIR = expandPath(process.env.ZIPRECRUITER_CONTEXT_DIR);

function findChromeExecutable(): string | undefined {
  if (process.env.ZIPRECRUITER_CHROME_PATH && fs.existsSync(process.env.ZIPRECRUITER_CHROME_PATH)) {
    return process.env.ZIPRECRUITER_CHROME_PATH;
  }
  const localAppData = process.env.LOCALAPPDATA;
  const programFiles = process.env["ProgramFiles"];
  const programFilesX86 = process.env["ProgramFiles(x86)"];
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    localAppData && path.join(localAppData, "Google", "Chrome", "Application", "chrome.exe"),
    programFiles && path.join(programFiles, "Google", "Chrome", "Application", "chrome.exe"),
    programFilesX86 && path.join(programFilesX86, "Google", "Chrome", "Application", "chrome.exe"),
  ].filter(Boolean) as string[];
  return candidates.find((p) => fs.existsSync(p));
}

type PlaywrightCookie = {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
};

function loadCookiesFromFile(filePath: string): PlaywrightCookie[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);
  const arr = Array.isArray(data) ? data : data.cookies || data || [];
  return arr
    .filter((c: any) => c.name && c.value)
    .map((c: any) => {
      const dom = String(c.domain || c.host || c.hostKey || ".ziprecruiter.com").trim();
      const domain = c.hostOnly ? dom : dom.startsWith(".") ? dom : dom ? `.${dom}` : ".ziprecruiter.com";
      const expires = c.expirationDate != null ? Math.floor(Number(c.expirationDate)) : undefined;
      const sameSite = c.sameSite === "no_restriction" ? "None" : c.sameSite === "lax" ? "Lax" : c.sameSite === "strict" ? "Strict" : undefined;
      return {
        name: String(c.name),
        value: String(c.value),
        domain,
        path: String(c.path || c.pathKey || "/"),
        ...(expires && expires > 0 && { expires }),
        ...(c.httpOnly != null && { httpOnly: !!c.httpOnly }),
        ...(c.secure != null && { secure: !!c.secure }),
        ...(sameSite && { sameSite: sameSite as "Strict" | "Lax" | "None" }),
      };
    });
}

async function isCloudflareChallenge(page: any): Promise<boolean> {
  try {
    const hasVerify = await page.locator("text=Verify you are human").count() > 0;
    const hasSecurity = await page.locator("text=Performing security verification").count() > 0;
    return !!(hasVerify || hasSecurity);
  } catch {
    return false;
  }
}

function isTruthy(val: string | undefined): boolean {
  return ["1", "true", "yes", "y", "on"].includes((val || "").toLowerCase());
}

/** Reject EEO/voluntary disclosure text (same logic as Jobright). Don't reject long job descriptions that only mention EEO at the end. */
function looksLikeEeoOrApplicationForm(text: string): boolean {
  if (!text || text.length >= 600) return false;
  const lower = text.toLowerCase();
  const eeoMarkers = [
    "eeo",
    "equal employment",
    "voluntary self",
    "race/ethnicity",
    "disability status",
    "veteran status",
    "government id",
    "i identify as",
    "please select",
    "decline to",
  ];
  let matchCount = 0;
  for (const m of eeoMarkers) if (lower.includes(m)) matchCount++;
  if (matchCount >= 3) return true;
  if (matchCount >= 2 && text.length < 400) return true;
  if (lower.includes("disability status") && lower.includes("please select")) return true;
  return false;
}

/** Wait for job description content to appear in the right panel (often loaded after pane is visible). */
async function waitForJobDescriptionContent(page: any): Promise<void> {
  const container = page.locator("[data-testid='job-details-scroll-container'], [data-testid='right-pane']").first();
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    const text = (await container.innerText().catch(() => ""))?.trim() || "";
    if (text.length >= 100) return;
    if (text.includes("Job description") && text.length >= 50) return;
    await page.waitForTimeout(400);
  }
}

/** Wait for right pane to show content for this job (contains title or company) so we don't read stale content. */
async function waitForRightPaneToShowJob(page: any, title: string, company: string): Promise<void> {
  const container = page.locator("[data-testid='job-details-scroll-container'], [data-testid='right-pane']").first();
  const deadline = Date.now() + 6000;
  const titleSnippet = (title || "").trim().slice(0, 40);
  const companySnippet = (company || "").trim().slice(0, 30);
  while (Date.now() < deadline) {
    const text = (await container.innerText().catch(() => "")) || "";
    if (titleSnippet && titleSnippet !== "Unknown" && text.includes(titleSnippet)) return;
    if (companySnippet && companySnippet !== "Unknown" && text.includes(companySnippet)) return;
    if (text.length >= 200) return;
    await page.waitForTimeout(300);
  }
}

/** Parse job title and company from right pane text (first substantial lines often are title, company). */
function parseTitleCompanyFromRightPane(text: string): { title: string; company: string } {
  const lines = (text || "")
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !/^(Full-time|Part-time|Contract|Posted|Apply|Save|Share|Job description|About us|Requirements)$/i.test(l));
  const title = lines[0] && lines[0].length >= 2 ? lines[0] : "";
  const company = lines[1] && lines[1].length >= 2 ? lines[1] : "";
  return { title, company };
}

/** Extract job description from the right panel.
 * ZipRecruiter DOM: h2 "Job description" then a sibling div with text-primary whitespace-pre-line wrap-anywhere
 * containing the description (p, strong, ul, li). Sometimes inside a flex wrapper (flex flex-col gap-y-[16px]).
 */
async function extractJobDescriptionFromRightPanel(page: any): Promise<string> {
  await waitForJobDescriptionContent(page);

  const scrollContainer = page.locator("[data-testid='job-details-scroll-container'], [data-testid='right-pane']").first();
  // Scroll "Job description" into view so lazy-loaded or below-fold content is rendered
  try {
    const h2Desc = scrollContainer.locator("h2").filter({ hasText: /Job description/i }).first();
    if ((await h2Desc.count()) > 0) {
      await h2Desc.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(600);
    }
  } catch {
    // ignore
  }

  // 1) Primary: div that is the immediate sibling of h2 "Job description".
  try {
    const h2 = page.locator("[data-testid='job-details-scroll-container'] h2, [data-testid='right-pane'] h2").filter({ hasText: /Job description/i });
    if ((await h2.count()) > 0) {
      for (const i of [1, 2, 3]) {
        const nextDiv = h2.first().locator(`xpath=following-sibling::div[${i}]`);
        if ((await nextDiv.count()) > 0) {
          const text = (await nextDiv.first().innerText().catch(() => ""))?.trim() || "";
          if (text.length >= 80 && !looksLikeEeoOrApplicationForm(text)) return text;
        }
      }
      // Next sibling might be a wrapper: take first descendant div with substantial text
      const afterH2 = h2.first().locator("xpath=following-sibling::*[1]//div[string-length(normalize-space(.)) >= 80][1]");
      if ((await afterH2.count()) > 0) {
        const text = (await afterH2.first().innerText().catch(() => ""))?.trim() || "";
        if (text.length >= 80 && !looksLikeEeoOrApplicationForm(text)) return text;
      }
    }
  } catch {
    // ignore and fall through
  }

  // 2) Div with whitespace-pre-line inside the flex wrapper that follows "Job description" (gap-y wrapper).
  const descriptionBodySelectors = [
    "[data-testid='job-details-scroll-container'] div.flex.flex-col div[class*='whitespace-pre-line'][class*='text-primary']",
    "[data-testid='right-pane'] div.flex.flex-col div[class*='whitespace-pre-line'][class*='text-primary']",
    "[data-testid='job-details-scroll-container'] div[class*='gap-y'] div[class*='whitespace-pre-line']",
    "[data-testid='job-details-scroll-container'] div.text-primary.whitespace-pre-line.wrap-anywhere",
    "[data-testid='job-details-scroll-container'] div[class*='whitespace-pre-line'][class*='text-primary']",
    "[data-testid='right-pane'] div[class*='whitespace-pre-line'][class*='text-primary']",
    "[data-testid='job-details-scroll-container'] div[class*='whitespace-pre-line']",
    "[data-testid='right-pane'] div[class*='whitespace-pre-line']",
    "[data-testid='job-details-scroll-container'] div[class*='wrap-anywhere'][class*='whitespace-pre-line']",
    "[data-testid='right-pane'] div[class*='wrap-anywhere'][class*='whitespace-pre-line']",
    "[data-testid='job-details-scroll-container'] div[class*='text-primary']",
    "[data-testid='right-pane'] div[class*='text-primary']",
  ];
  for (const sel of descriptionBodySelectors) {
    try {
      const el = page.locator(sel).first();
      if ((await el.count()) === 0) continue;
      const text = (await el.innerText().catch(() => ""))?.trim() || "";
      if (text.length < 50) continue;
      if (looksLikeEeoOrApplicationForm(text)) continue;
      return text;
    } catch {
      continue;
    }
  }

  // Fallback: full scroll container or right pane
  const rightPanelSelectors = [
    "[data-testid='job-details-scroll-container']",
    "[data-testid='right-pane'] [data-testid='job-details-scroll-container']",
    "[data-testid='right-pane']",
  ];
  for (const sel of rightPanelSelectors) {
    try {
      const el = page.locator(sel).first();
      if ((await el.count()) === 0) continue;
      const text = (await el.innerText().catch(() => ""))?.trim() || "";
      if (text.length < 50) continue;
      if (looksLikeEeoOrApplicationForm(text)) continue;
      return text;
    } catch {
      continue;
    }
  }

  // Last resort: parse from full right pane text — take everything after "Job description" heading.
  // Only stop at clear UI lines (Apply, Save job, Share). Try both scroll container and right-pane.
  try {
    const containers = [
      page.locator("[data-testid='job-details-scroll-container']").first(),
      page.locator("[data-testid='right-pane']").first(),
    ];
    let best = "";
    for (const container of containers) {
      if ((await container.count()) === 0) continue;
      const fullText = (await container.innerText().catch(() => ""))?.trim() || "";
      const re = /\bJob description\b/gi;
      let match;
      while ((match = re.exec(fullText)) !== null) {
        let desc = fullText.slice(match.index + match[0].length).trim();
        desc = desc.replace(/^\s*[\r\n]+\s*/, "");
        const stopMatch = desc.match(/\n\s*(Apply|Save job|Share)\s*$/im);
        if (stopMatch && stopMatch.index != null && stopMatch.index > 80) desc = desc.slice(0, stopMatch.index).trim();
        if (desc.length >= 80 && desc.length > best.length && !looksLikeEeoOrApplicationForm(desc)) best = desc;
      }
    }
    if (best) return best;
  } catch {
    // ignore
  }
  return "";
}

/** Left-pane pagination. ZipRecruiter uses an <a title="Next Page"> with href like /jobs-search/2?..., not a button. */
const PAGINATION_NEXT_SELECTORS = [
  "a[title='Next Page']",
  "div.pagination_container_two_pane a[title='Next Page']",
  "div.pagination_container_two_pane button[title='Next Page']",
  "button[title='Next Page']",
  "button[aria-label='Next Page']",
  "[aria-label='Next Page']",
  "a[aria-label*='Next']",
  "nav a:has-text('Next')",
  "nav button:has-text('Next')",
  ".pagination_container_two_pane button:has-text('Next')",
  "button:has-text('Next')",
  "a[href*='/jobs-search/']:has-text('Next')",
];

/** Get next page URL. ZipRecruiter uses path /jobs-search/1, /jobs-search/2; fallback to ?page=N. */
function getNextPageUrl(currentUrl: string): string | null {
  try {
    const u = new URL(currentUrl);
    const path = u.pathname;
    // Path-based: /jobs-search/1 or /jobs-search/2 etc.
    const pathMatch = path.match(/^(\/jobs-search)\/(\d+)\/?$/);
    if (pathMatch) {
      const num = parseInt(pathMatch[2], 10);
      if (Number.isFinite(num) && num >= 1) {
        u.pathname = `${pathMatch[1]}/${num + 1}`;
        return u.toString();
      }
    }
    // Path without number: /jobs-search -> /jobs-search/2
    if (path.replace(/\/$/, "") === "/jobs-search") {
      u.pathname = "/jobs-search/2";
      return u.toString();
    }
    // Query-based fallback: ?page=1 -> ?page=2
    const p = u.searchParams.get("page");
    const num = p ? parseInt(p, 10) : 1;
    if (Number.isFinite(num) && num >= 1) {
      u.searchParams.set("page", String(num + 1));
      return u.toString();
    }
    return null;
  } catch {
    return null;
  }
}

/** Right-pane Apply button selectors (ZipRecruiter). */
const APPLY_BUTTON_SELECTORS = [
  "[data-testid='right-pane'] a:has-text('Apply')",
  "[data-testid='right-pane'] button:has-text('Apply')",
  "[data-testid='job-details-scroll-container'] a:has-text('Apply')",
  "[data-testid='job-details-scroll-container'] button:has-text('Apply')",
  "[data-testid='right-pane'] >> a[href]:has-text('Apply')",
  "a:has-text('Apply Now')",
  "button:has-text('Apply Now')",
];

/**
 * Click Apply in the right pane, wait for new tab to open and load, then return the real jobsite URL.
 * Rejects LinkedIn, Lever, ZipRecruiter (no external), and empty/unreachable.
 * Caller must close the new tab and bring ZipRecruiter page back to front when done.
 */
async function clickApplyAndGetRealJobUrl(
  page: any,
  context: any
): Promise<{ url: string; newPage: any } | null> {
  const rightPane = page.locator("[data-testid='right-pane'], [data-testid='job-details-scroll-container']").first();
  let applyEl = null;
  for (const sel of APPLY_BUTTON_SELECTORS) {
    const el = rightPane.locator(sel).first();
    if ((await el.count()) > 0 && (await el.isVisible().catch(() => false))) {
      applyEl = el;
      break;
    }
  }
  if (!applyEl) {
    const inPage = page.locator("a:has-text('Apply'), button:has-text('Apply')").first();
    if ((await inPage.count()) > 0 && (await inPage.isVisible().catch(() => false))) applyEl = inPage;
  }
  if (!applyEl) {
    console.log("  ⚠️ Apply button not found in right pane");
    return null;
  }

  const pagesBefore = context.pages();
  const pagePromise = context.waitForEvent("page", { timeout: 20000 }).catch(() => null);
  await applyEl.click({ timeout: 10000 }).catch(() => null);
  await page.waitForTimeout(2500);

  let newPage = await pagePromise;
  if (!newPage) {
    const pagesAfter = context.pages();
    const added = pagesAfter.filter((p: any) => !pagesBefore.includes(p));
    if (added.length > 0) newPage = added[0];
  }
  if (!newPage) {
    console.log("  ⚠️ No new tab opened after Apply click");
    return null;
  }

  // Capture main document response status (so we can reject 403 Forbidden)
  let mainDocStatus: number | null = null;
  newPage.on("response", (response: any) => {
    if (response.request().resourceType() === "document") {
      mainDocStatus = response.status();
    }
  });

  // New tab may open on ZipRecruiter or about:blank then redirect to company site. Wait for URL to settle.
  const waitForCompanyUrlMs = 25000;
  const pollIntervalMs = 1500;
  let url = newPage.url().trim();
  const startWait = Date.now();
  while (Date.now() - startWait < waitForCompanyUrlMs) {
    url = newPage.url().trim();
    const isBlank = !url || url === "about:blank" || url.startsWith("about:");
    const isZipRecruiter = url.toLowerCase().includes("ziprecruiter.com");
    if (!isBlank && !isZipRecruiter) {
      break;
    }
    await new Promise((r) => setTimeout(r, pollIntervalMs));
  }
  url = newPage.url().trim();

  // Wait for the company page to finish loading
  try {
    await newPage.waitForLoadState("load", { timeout: 20000 }).catch(() =>
      newPage.waitForLoadState("domcontentloaded", { timeout: 10000 })
    );
    await newPage.waitForTimeout(500);
  } catch {
    // use URL we have
  }
  url = newPage.url().trim();

  if (!url || url === "about:blank" || url.startsWith("about:")) {
    console.log("  ⏭️ Skip: no valid URL (about:blank or empty)");
    await newPage.close().catch(() => {});
    return null;
  }
  if (url.toLowerCase().includes("ziprecruiter.com")) {
    console.log("  ⏭️ Skip: Apply did not leave ZipRecruiter (waited for company URL)");
    await newPage.close().catch(() => {});
    return null;
  }
  if (mainDocStatus === 403) {
    console.log("  ⏭️ Skip: 403 Forbidden (company site blocked access)");
    await newPage.close().catch(() => {});
    return null;
  }
  if (url.toLowerCase().includes("linkedin.com")) {
    console.log("  ⏭️ Skip: LinkedIn URL (rejected)");
    await newPage.close().catch(() => {});
    return null;
  }
  if (url.toLowerCase().includes("lever.co") || url.toLowerCase().includes("jobs.lever.co")) {
    console.log("  ⏭️ Skip: Lever URL (rejected)");
    await newPage.close().catch(() => {});
    return null;
  }

  return { url, newPage };
}

async function ensureUserExists(userId: number): Promise<number> {
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: { email: "user@jobbot.local", passwordHash: "dummy" },
    });
  }
  return user.id;
}

async function saveJobDescription(jobApplicationId: number, description: string) {
  await prisma.jobDescription.upsert({
    where: { jobApplicationId },
    create: { jobApplicationId, fullText: description, source: "company_site" },
    update: { fullText: description },
  });
}

async function main() {
  console.log("\n🔍 ZipRecruiter Scanner\n");
  console.log(`Max jobs per run: ${MAX_JOBS_PER_RUN} (set ZIPRECRUITER_MAX_JOBS_PER_RUN in .env)`);
  console.log(`Search URL (from ZIPRECRUITER_SEARCH_URL or default):`);
  console.log(`  ${ZIPRECRUITER_SEARCH_URL}`);
  console.log("  (For remote jobs, use a URL with location=Remote (USA), or copy from ZipRecruiter after searching in the browser.)");
  console.log("(Detailed timing is logged below so you can see where time is spent.)\n");

  const actualUserId = await ensureUserExists(USER_ID);

  if (!fs.existsSync(PERSISTENT_CONTEXT_DIR)) {
    console.error("❌ Context directory not found. Run: npm run ziprecruiter:init");
    process.exit(1);
  }

  const cookiesFile =
    process.env.ZIPRECRUITER_COOKIES_FILE ||
    path.join(path.dirname(PERSISTENT_CONTEXT_DIR), "ziprecruiter-cookies.json");
  if (!fs.existsSync(cookiesFile)) {
    console.warn("⚠️ No cookie file. Run nodriver or init first: npm run ziprecruiter:nodriver");
  }

  const chromePath = findChromeExecutable();
  if (!chromePath) {
    console.error("❌ Chrome not found. Set ZIPRECRUITER_CHROME_PATH.");
    process.exit(1);
  }

  chromium.use(StealthPlugin());

  let done = logTimed("launch browser (persistent context)");
  const context = await chromium.launchPersistentContext(PERSISTENT_CONTEXT_DIR, {
    executablePath: chromePath,
    headless: false,
    viewport: { width: 1920, height: 1080 },
    locale: "en-US",
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--no-sandbox",
    ],
  });
  done();

  const page = context.pages()[0] || (await context.newPage());
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    if (!(window as any).chrome) (window as any).chrome = { runtime: {} };
  });

  if (fs.existsSync(cookiesFile)) {
    const cookies = loadCookiesFromFile(cookiesFile);
    await context.addCookies(cookies);
    console.log(`Loaded ${cookies.length} cookies.\n`);
  }

  done = logTimed("page.goto (domcontentloaded)");
  await page.goto(ZIPRECRUITER_SEARCH_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  done();

  if (await isCloudflareChallenge(page)) {
    if (isTruthy(process.env.ZIPRECRUITER_UNATTENDED)) {
      const maxWaitMs = Math.max(60, Number(process.env.ZIPRECRUITER_CF_WAIT_SECONDS ?? 300)) * 1000;
      console.log(`⚠️ Cloudflare detected. Unattended mode: waiting up to ${Math.round(maxWaitMs / 1000)}s...`);
      const start = Date.now();
      while (Date.now() - start < maxWaitMs) {
        await page.waitForTimeout(1500);
        if (!(await isCloudflareChallenge(page))) break;
      }
      if (await isCloudflareChallenge(page)) {
        console.log("❌ Cloudflare still present after unattended wait. Exiting.");
        await context.close();
        process.exit(1);
      }
      console.log("✅ Cloudflare cleared. Continuing scan.");
    } else {
      console.log("⚠️ Complete Cloudflare verification in the browser, then press ENTER.");
      await new Promise<void>((r) => process.stdin.once("data", () => r()));
    }
  }

  done = logTimed("wait for first job card visible");
  await page.locator("div.job_result_two_pane_v2").first().waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
  done();

  // Left panel: one card per job. ZipRecruiter uses div.job_result_two_pane_v2 per result (contains company link a[href*='/co/'] and title).
  done = logTimed("find card selector + query all cards");
  const leftPanelCardSelectors = [
    "div.job_result_two_pane_v2",
    "[data-testid='left-pane'] article",
    "[data-testid='left-pane'] [data-testid*='job-card']",
    "[data-testid='left-pane'] >> li",
    "[data-testid*='job-card']",
    "article[data-testid*='job']",
    "article",
    "[data-testid='left-pane'] a[href*='ziprecruiter'][href*='/j/']",
    "[data-testid='left-pane'] a[href*='ziprecruiter']",
  ];

  let usedCardSelector = "";
  for (const sel of leftPanelCardSelectors) {
    const list = await page.locator(sel).all();
    if (list.length >= 1) {
      usedCardSelector = sel;
      console.log(`Found ${list.length} job cards in left panel (selector: ${sel})`);
      console.log("Cards do not disappear after scan; we track card index so we don't re-scan the same one.\n");
      break;
    }
  }
  done();

  if (!usedCardSelector) {
    console.log("No job cards found. Check selectors or run: npm run explore:ziprecruiter");
    await context.close();
    process.exit(0);
  }

  let processed = 0;
  let cardIndex = 0;
  const scanStart = Date.now();
  /** First card (title||company) on current page—used to detect when URL pagination returns the same page. */
  let firstCardSignature: string | null = null;

  while (processed < MAX_JOBS_PER_RUN) {
    const cardLoopStart = Date.now();
    console.log(`\n  --- Card #${cardIndex + 1} (index ${cardIndex}) ---`);

    let step = logTimed("re-query card list (DOM)");
    const cards = await page.locator(usedCardSelector).all();
    step();
    if (cardIndex >= cards.length) {
      // Remember first card on this page so we can detect "same page" after URL nav
      let signatureBeforeNav: string | null = null;
      if (cards.length > 0) {
        const c0 = cards[0];
        const t0 = (await c0.locator("h2, h3, [class*='title']").first().innerText().catch(() => ""))?.trim() || "";
        const co0 = (await c0.locator("[data-testid='job-card-company'], [class*='company']").first().innerText().catch(() => ""))?.trim() || "";
        signatureBeforeNav = `${t0}|||${co0}`;
      }

      // Go to next page by URL only (preserves search filters: remote, salary, etc.).
      // Clicking the Next button can load a different URL that drops filters and shows all jobs.
      let nextClicked = false;
      const currentUrl = page.url();
      const nextUrl = getNextPageUrl(currentUrl);
      if (nextUrl && nextUrl !== currentUrl) {
        console.log(`  📄 No more cards on this page; navigating to next page via URL (keeps filters)...`);
        console.log(`     Next URL: ${nextUrl}`);
        step = logTimed("goto next page URL + wait for cards");
        await page.goto(nextUrl, { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
        const urlAfter = page.url();
        console.log(`     After load: ${urlAfter}`);
        await page.waitForTimeout(2000);
        await page.locator(usedCardSelector).first().waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
        step();
        const newCards = await page.locator(usedCardSelector).all();
        if (newCards.length > 0) {
          const c0 = newCards[0];
          const t0 = (await c0.locator("h2, h3, [class*='title']").first().innerText().catch(() => ""))?.trim() || "";
          const co0 = (await c0.locator("[data-testid='job-card-company'], [class*='company']").first().innerText().catch(() => ""))?.trim() || "";
          const newFirstSignature = `${t0}|||${co0}`;
          if (signatureBeforeNav != null && newFirstSignature === signatureBeforeNav) {
            console.log(`  ⚠️ Same page loaded again (first card unchanged). ZipRecruiter may ignore page param. Stopping pagination.`);
            break;
          }
          cardIndex = 0;
          firstCardSignature = newFirstSignature;
          nextClicked = true;
        }
      }
      // Fallback: click Next button (may lose filters on ZipRecruiter).
      if (!nextClicked) {
        for (const sel of PAGINATION_NEXT_SELECTORS) {
          const nextBtn = page.locator(sel).first();
          if ((await nextBtn.count()) === 0) continue;
          const disabled = await nextBtn.getAttribute("disabled").catch(() => null);
          if (disabled != null) break;
          const visible = await nextBtn.isVisible().catch(() => false);
          if (!visible) continue;
          console.log(`  📄 Navigating via Next button (URL pagination failed; filters may be lost)...`);
          step = logTimed("click Next Page + wait for new cards");
          await nextBtn.click({ timeout: 8000 }).catch(() => {});
          await page.waitForTimeout(2000);
          await page.locator(usedCardSelector).first().waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
          step();
          cardIndex = 0;
          firstCardSignature = null;
          nextClicked = true;
          break;
        }
      }
      if (!nextClicked) {
        console.log(`No more cards and no next page URL. Done.`);
        break;
      }
      continue;
    }

    const card = cards[cardIndex];
    try {
      // 1) Read title and company from card. ZipRecruiter: title in h2, company in a[href*='/co/'], "1 click apply" in card text.
      step = logTimed("read title + company from card");
      const CARD_READ_TIMEOUT_MS = 5000;
      const readCard = async () => {
        const [t1, t2, t3, c1, c2, coHref] = await Promise.all([
          card.locator("h2").first().innerText().catch(() => ""),
          card.locator("h3, [class*='title']").first().innerText().catch(() => ""),
          card.locator("button[class*='text-primary'], [class*='break-words'][class*='text-primary']").first().innerText().catch(() => ""),
          card.locator("a[href*='/co/']").first().innerText().catch(() => ""),
          card.locator("[data-testid='job-card-company'], [class*='company']").first().innerText().catch(() => ""),
          card.locator("a[href*='/co/']").first().getAttribute("href").catch(() => ""),
        ]);
        const title = (t1 || t2 || t3 || "").trim() || "Unknown";
        let company = (c1 || c2 || "").trim();
        if (!company && coHref) {
          const match = coHref.match(/\/co\/([^/]+)/);
          if (match) company = match[1].replace(/-/g, " ").trim();
        }
        company = company || "Unknown";
        return { title, company };
      };
      let { title: titleRead, company: companyRead } = await withTimeout(
        readCard(),
        CARD_READ_TIMEOUT_MS,
        { title: "Unknown", company: "Unknown" }
      );
      let title = titleRead;
      let company = companyRead;
      const viewButton = card.locator("button[aria-label^='View ']").first();
      const jobLink = card.locator("a[href*='ziprecruiter']").first();
      // Job-specific link (ZipRecruiter uses /j/ for job detail); avoid company link a[href*='/co/'].
      const jobDetailLink = card.locator("a[href*='ziprecruiter'][href*='/j/']").first();
      const hasViewBtn = (await viewButton.count()) > 0;
      const hasLink = (await jobLink.count()) > 0;
      const hasJobDetailLink = (await jobDetailLink.count()) > 0;
      if (title === "Unknown" && hasViewBtn) {
        const aria = await viewButton.getAttribute("aria-label").catch(() => null);
        if (aria && /^View\s+/i.test(aria)) title = aria.replace(/^View\s+/i, "").trim() || title;
      }
      step();

      // 2) If card shows 1-Click Apply, skip without opening pane.
      const cardText = await withTimeout(card.innerText().catch(() => ""), 2000, "");
      const isOneClickFromCard = /1\s*[- ]?\s*click\s*apply/i.test(cardText);
      if (isOneClickFromCard) {
        console.log(`  📄 ${title} @ ${company} [1-Click]`);
        console.log(`  ⏭️ Skip: 1-Click Apply job (not saved)`);
        console.log(`     ⏱️ card total: ${Date.now() - cardLoopStart} ms\n`);
        cardIndex++;
        continue;
      }

      // 3) Click the card to load job in right pane.
      step = logTimed("click job card (link or card) + wait for right pane");
      if (hasViewBtn) {
        await viewButton.click();
      } else if (hasLink) {
        await jobLink.click();
      } else {
        await card.click();
      }
      const rightPane = page.locator("[data-testid='job-details-scroll-container'], [data-testid='right-pane']").first();
      await rightPane.waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(1200);
      step();

      step = logTimed("wait for right pane to show this job");
      await waitForRightPaneToShowJob(page, title, company);
      step();

      step = logTimed("get right panel text");
      const rightPanelText = (await page.locator("[data-testid='job-details-scroll-container'], [data-testid='right-pane']").first().innerText().catch(() => "")) || "";
      step();

      // 4) If we got Unknown from card, get title/company from right pane (company is in a[data-testid='job-card-company'] or a[href*='/co/']).
      if (title === "Unknown" || company === "Unknown") {
        const parsed = parseTitleCompanyFromRightPane(rightPanelText);
        if (parsed.title) title = parsed.title;
        if (parsed.company) company = parsed.company;
        if (company === "Unknown") {
          const companyFromPane = await page
            .locator("[data-testid='job-card-company'], [data-testid='job-details-scroll-container'] a[href*='/co/'], [data-testid='right-pane'] a[href*='/co/']")
            .first()
            .innerText()
            .catch(() => "");
          if (companyFromPane?.trim()) company = companyFromPane.trim();
        }
        if (title === "Unknown") {
          const titleFromPane = await page
            .locator("[data-testid='job-details-scroll-container'] h1, [data-testid='right-pane'] h1")
            .first()
            .innerText()
            .catch(() => "");
        if (titleFromPane?.trim()) title = titleFromPane.trim();
      }
      }

      // 5) If right pane shows 1-Click Apply, skip (we only save jobs that open real jobsite URL).
      const isOneClickFromPane = /1\s*[- ]?\s*click\s*apply/i.test(rightPanelText);
      if (isOneClickFromPane) {
        console.log(`  📄 ${title} @ ${company} [1-Click]`);
        console.log(`  ⏭️ Skip: 1-Click Apply job (not saved)`);
        console.log(`     ⏱️ card total: ${Date.now() - cardLoopStart} ms\n`);
        cardIndex++;
        continue;
      }

      console.log(`  📄 ${title} @ ${company}`);

      step = logTimed("extract job description from right panel");
      let description = await extractJobDescriptionFromRightPanel(page);
      if (!description.trim()) {
        await page.waitForTimeout(1500);
        description = await extractJobDescriptionFromRightPanel(page);
      }
      step();
      if (!description.trim()) {
        console.log(`  ⏭️ Skip: no description`);
        console.log(`     ⏱️ card total: ${Date.now() - cardLoopStart} ms\n`);
        cardIndex++;
        continue;
      }

      step = logTimed("click Apply and wait for new tab (real jobsite URL)");
      const applyResult = await clickApplyAndGetRealJobUrl(page, context);
      step();
      if (!applyResult) {
        console.log(`     ⏱️ card total: ${Date.now() - cardLoopStart} ms\n`);
        cardIndex++;
        continue;
      }
      const { url: jobUrl, newPage: applyTab } = applyResult;
      console.log(`  🔗 Real jobsite URL: ${jobUrl}`);

      step = logTimed("duplicate check (normalized URL / title+company)");
      const duplicate = await findDuplicateJob({
        userId: actualUserId,
        externalUrl: jobUrl,
        title,
        company,
      });
      step();
      if (duplicate) {
        console.log(`  ⏭️ Skip: duplicate (${duplicate.reason}) – already have this job`);
        await applyTab.close().catch(() => {});
        await page.bringToFront();
        console.log(`     ⏱️ card total: ${Date.now() - cardLoopStart} ms\n`);
        cardIndex++;
        continue;
      }

      step = logTimed("upsertJobApplication (DB)");
      const saved = await upsertJobApplication({
        userId: actualUserId,
        source: "ziprecruiter",
        title,
        company,
        externalUrl: jobUrl,
      });
      step();
      if (!saved) {
        console.log(`  ⏭️ Skip: filtered by title or URL (e.g. principal, icims)`);
        await applyTab.close().catch(() => {});
        await page.bringToFront();
        await page.waitForTimeout(300);
        cardIndex++;
        continue;
      }
      step = logTimed("saveJobDescription (DB)");
      if (description.trim()) await saveJobDescription(saved.id, description.trim());
      step();

      await applyTab.close().catch(() => {});
      await page.bringToFront();
      await page.waitForTimeout(300);

      processed++;
      console.log(`  ✅ Saved real URL + description (${description.length} chars)`);
      console.log(`     ⏱️ card total: ${Date.now() - cardLoopStart} ms\n`);
      cardIndex++;
    } catch (e: any) {
      console.error(`  ❌ Error: ${e.message}`);
      console.log(`     ⏱️ card total: ${Date.now() - cardLoopStart} ms\n`);
      cardIndex++;
    }
  }

  const totalMs = Date.now() - scanStart;
  console.log(`\n✅ Done. Processed ${processed} job(s). Total scan time: ${(totalMs / 1000).toFixed(1)} s`);
  await context.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
