/**
 * Generate tailored resume and cover letter via ChatGPT web UI (Playwright).
 * Used for ChatGPT-based document generation.
 * Session: Playwright loads cookies from `CHATGPT_COOKIES_FILE` (default `~/.jobbot/chatgpt-cookies.json`).
 * Refresh that file after logging into a different ChatGPT account: `npm run chatgpt:seleniumbase` (export cookies), or copy a new JSON from another machine.
 * Uses Chrome + StealthPlugin (like ZipRecruiter) so Cloudflare does not reappear.
 */

import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import * as path from "path";
import * as fs from "fs";
import { extractJDRequirements, formatJDRequirementsForPrompt, type JDRequirements } from "./jdRequirementExtractor";
import { loadMohanExperienceInventory } from "./mohanExperienceInventory";
import { getJobbotDir } from "./jobbotDir";

const CHATGPT_URL = "https://chat.openai.com";

/** When set, Mohan (userId=2) uses inventory + JD requirement extraction in prompts. Jiayong unchanged. */
export type BuildPromptOptions = {
  userId?: number;
  /** Optional; loaded from disk for Mohan when omitted */
  experienceInventory?: string;
  /** Job posting title (as stored on the application); used in Mohan resume prompt and should be passed whenever available */
  jobTitle?: string;
};

chromium.use(StealthPlugin());

function findChromeExecutable(): string | undefined {
  if (process.env.CHATGPT_CHROME_PATH && fs.existsSync(process.env.CHATGPT_CHROME_PATH)) {
    return process.env.CHATGPT_CHROME_PATH;
  }
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

export function getChatGPTContextDir(): string {
  const home = process.env.USERPROFILE || process.env.HOME || ".";
  const dir = process.env.CHATGPT_CONTEXT_DIR;
  if (!dir) return path.join(getJobbotDir(), "chatgpt");
  const clean = dir.split(/\s+/)[0].trim().replace(/^["']|["']$/g, "");
  return path.resolve(clean.replace(/^~/, home));
}

function getChatGPTCookiesPath(): string {
  if (process.env.CHATGPT_COOKIES_FILE) {
    const clean = process.env.CHATGPT_COOKIES_FILE.split(/\s+/)[0].trim().replace(/^["']|["']$/g, "");
    return path.resolve(clean.replace(/^~/, process.env.USERPROFILE || process.env.HOME || "."));
  }
  return path.join(getJobbotDir(), "chatgpt-cookies.json");
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

function sanitizeCookieForPlaywright(c: PlaywrightCookie): PlaywrightCookie | null {
  const name = String(c.name || "").trim();
  const value = String(c.value || "");
  let domain = String(c.domain || "").trim();
  const path = String(c.path || "/").trim() || "/";
  if (!name || !value || !domain) return null;
  if (!domain.startsWith(".")) domain = `.${domain}`;

  const out: PlaywrightCookie = { name, value, domain, path };
  if (typeof c.httpOnly === "boolean") out.httpOnly = c.httpOnly;
  if (typeof c.secure === "boolean") out.secure = c.secure;
  if (typeof c.expires === "number" && Number.isFinite(c.expires) && c.expires > 0) out.expires = c.expires;
  // Only set sameSite when it is valid; omit if uncertain to avoid protocol rejections.
  if (c.sameSite === "Strict" || c.sameSite === "Lax" || c.sameSite === "None") {
    out.sameSite = c.sameSite;
  }
  // Browser protocol rejects SameSite=None without secure.
  if (out.sameSite === "None" && !out.secure) {
    delete out.sameSite;
  }
  return out;
}

function loadChatGPTSessionFromFile(filePath: string): { cookies: PlaywrightCookie[]; userAgent?: string } {
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);
  const arr = Array.isArray(data) ? data : data.cookies || data || [];
  const cookies = arr
    .filter((c: any) => c.name && c.value)
    .map((c: any) => {
      const dom = String(c.domain || c.host || c.hostKey || ".openai.com").trim();
      const domain = c.hostOnly ? dom : dom.startsWith(".") ? dom : dom ? `.${dom}` : ".openai.com";
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
  const userAgent = typeof data.userAgent === "string" ? data.userAgent : undefined;
  return { cookies, userAgent };
}

function buildDefaultResumePrompt(baseResume: string, jobDescription: string): string {
  return `Your role is to act as a talented, human-centered resume writer who helps tailor my resume to each job description while making it sound authentic, specific, and grounded in real-world experience.

BASE RESUME:
${baseResume}

JOB DESCRIPTION:
${jobDescription}

INSTRUCTIONS:
Preserve the same section structure used by the BASE RESUME.
If the BASE RESUME includes a TOOLS section, keep TOOLS as its own section in the output.
Section headings should remain in this order:
- SUMMARY
- SKILLS
- TOOLS (only when present in BASE RESUME)
- PROFESSIONAL EXPERIENCE
- EDUCATION

Do not change my name, company names, employment dates, or high-level role titles.

IMPORTANT: Do NOT modify the EDUCATION section. Keep it exactly as it appears in the base resume.

PROFESSIONAL EXPERIENCE – structure for each role:
- First line: Title | Company | Location | Date (unchanged).
- Next line: Exactly one line in parentheses that briefly describes the company or the scope of the role (e.g. "(Meta builds foundational AI systems and large-scale ML infrastructure serving billions of users.)"). Use factual, one-sentence context so readers get quick orientation.
- Then bullet points, then "Technologies & Skills: ..." as below.

You can modify the technologies, tools, and skills mentioned in the Summary, Professional Experience, Skills, and Work History bullet points to align naturally with the target job.

CRITICAL - Technologies & Skills Sections:
- Each work experience section ends with a "Technologies & Skills:" line listing the tech stack used at that company
- You MUST tailor these "Technologies & Skills:" sections to align with the job description
- This is one of the MOST IMPORTANT parts of tailoring - these sections directly show relevant tech experience
- For each work experience:
  * Include ALL technologies from the job description that are relevant to that role/company
  * Remove technologies that are NOT mentioned in the job description (unless they're core to that company's work)
  * Add new technologies from the job description that make sense for that work experience context
  * Prioritize technologies that appear in both the job description AND are relevant to that company's work
- Keep the exact format: "Technologies & Skills:" followed by a list separated by " · " (middle dot)
- These tech skills sections are company-specific and should reflect what was realistically used at that company
- Make sure technologies from the job description appear in the most relevant work experience(s)

Focus on:
- Including all important keywords, tools, and technologies from the job description
- Naturally integrating them into the bullet points and project descriptions, especially within my most recent roles
- Emphasizing the target tech stack across the resume, even if it means adjusting tools or languages already written
- Reflecting those tools in real, concrete use cases or project examples, not just buzzwords
- Writing in a clear, natural tone that feels like a person describing meaningful work, not a keyword-stuffed list

The final result should be a complete, tailored resume in plain text—clear, specific, and human—without generic language or explanations.

CRITICAL: Return ONLY the complete tailored resume text. Do NOT include any preamble, explanation, or conversational text. Start directly with the resume header (name, title, contact information).`;
}

function buildMohanResumePrompt(
  baseResume: string,
  jobDescription: string,
  experienceInventory: string,
  jdReq: JDRequirements,
  jobPostingTitle: string
): string {
  const invBlock =
    experienceInventory.trim().length > 0
      ? experienceInventory.trim()
      : "(No separate inventory file yet — rely on BASE RESUME plus JOB DESCRIPTION; user may add Resumes_Mohan/Mohan_experience_inventory.md.)";

  const reqBlock = formatJDRequirementsForPrompt(jdReq);
  const titleLine =
    jobPostingTitle.trim().length > 0
      ? jobPostingTitle.trim()
      : "(Title not provided — infer target role from the JOB DESCRIPTION only.)";

  return `Your role is an expert resume writer for a senior software engineer with broad, cross-domain experience. The BASE RESUME is a partial snapshot; the EXPANDED EXPERIENCE INVENTORY may list additional truthful scope, stacks, and wins — use BOTH so the tailored resume reflects full capability, not only what fits on the one-page sample.

TARGET JOB TITLE (context only — do NOT paste this string verbatim into the headline or into employer role titles):
${titleLine}

BASE RESUME (structure and facts to preserve):
${baseResume}

EXPANDED EXPERIENCE INVENTORY (truthful extra detail — use to reframe and select emphasis; do not contradict employers or dates):
${invBlock}

JOB DESCRIPTION:
${jobDescription}

${reqBlock}

MOHAN-SPECIFIC INSTRUCTIONS:
- Tailor aggressively to this JD: reorder emphasis, summary, skills, and bullets so the reader sees direct relevance to THIS role family (backend, frontend, full-stack, data, platform, security, QA, etc.) as appropriate.
- Address the INFERRED MUST-HAVE lines: for each, add or sharpen at least one bullet (or summary sentence) that shows clear relevance. BASE RESUME and INVENTORY are **starting detail**, not an exhaustive list of everything the candidate has done — use credible senior-engineering scope to connect real roles to the JD (including stacks, domains, and patterns that fit the work even if every keyword is not spelled out in BASE/INVENTORY). Prefer concrete outcomes and tech over buzzwords.
- **ATS / recruiter-AI alignment:** The prompt block above includes **JD TECH / PRODUCT TERMS** (when extractable). Treat these as a **coverage checklist**: work as many as reasonably fit into SUMMARY, SKILLS, bullets, and each role’s **Technologies & Skills:** line — use **verbatim wording** from the JD where possible (e.g. exact framework, cloud, or security product names). If the list has **10+** terms, aim to surface **at least 10** distinct terms across the resume body; if fewer were extracted, surface **all** that credibly fit. Spread terms across **multiple** employers so one role is not the only keyword block.
- **Name technologies plainly:** For languages and stacks the JD cares about (e.g. Python, JavaScript, TypeScript, Swift, React, Kubernetes), use the **standard names** in SKILLS or tech lines. Do **not** substitute vague hedges like "JavaScript-aligned" or "Python-adjacent" when a direct name applies.
- Do NOT fabricate employment, certifications, or degrees.
- Keep each role at the same employer and in the same timeline/order as the base resume.
- Preserve company names, locations, and date ranges exactly for each role line.

TITLE AND HEADLINE (Mohan — nuanced, not a copy of the posting):
- Do NOT put the TARGET JOB TITLE line word-for-word as the resume headline or as any employer Title segment. Hiring managers should see credible senior titles that *fit* the JD, not a duplicate of the ad.
- Immediately under name/contact, include ONE headline line with EXACTLY ONE pipe "|" (two short segments only — left: senior role type, right: ONE concise theme). Example shape: "Senior Software Engineer | Cloud Platform Systems". Do NOT add a second or third pipe, do NOT turn the headline into a long comma list of technologies (put those in SKILLS or bullets). Keep the whole headline under ~85 characters so it fits one visual line.
- **Per-employer, JD-relative titles (required):** For EACH role, the Title segment (text before the first "|") must reflect how **that specific employer’s work** connects to **this posting** — not a single template with only the company name swapped. Use BASE + INVENTORY + the role’s parenthetical company line: pick a **different truthful facet** per employer (e.g. platform/DevOps vs data/streaming vs product APIs vs ads/monetization vs intern scope) so each title would still make sense if you hid the company name. A reader skimming titles should see **four distinct emphases**, not four near-identical "Senior Software Engineer …" lines.
- After drafting, **self-check:** if any two Title segments differ only by punctuation or would read as the same role copy-pasted, rewrite until each has a distinct, employer-grounded emphasis that still honestly matches the JD.
- For EACH employer in PROFESSIONAL EXPERIENCE, you MUST revise the Title segment when the base wording is generic or a poor match for this JD. Use truthful reframes from BASE + INVENTORY: add scope qualifiers (platform, backend, full-stack, data, developer experience, etc.) that match what that job actually entailed and what this posting cares about. Each employer should read as intentionally framed for this opportunity — not identical copy across roles, and not identical to the base unless already specific.
- CRITICAL — avoid repetitive title clauses: Do NOT append the same JD theme after every role (e.g. repeating "— Backend and Cloud Systems", "— Frontend & Web Systems", or any identical phrase on every employer). That reads robotic and unnatural.
- CRITICAL — one coherent Title segment (before "|"): Do NOT chain a long legacy title with a second clause that contradicts it (example to avoid: "Senior DevOps Engineer / Acting Lead … — Frontend & Web Systems"). Readers see that as keyword stuffing. If the JD emphasizes front-end but the role was primarily platform/DevOps, keep an employer-accurate title and show front-end work in bullets and tech lines — or use ONE short truthful blended title, not two unrelated clauses glued with an em dash.
- Vary the Title segment per employer: media vs streaming data vs cinema vs internship; different seniority or stack emphasis. No copy-paste suffix across four jobs.
- If the base used the same title at multiple employers, differentiate with truthful emphasis per company (still one Title segment per line, concise).

- Preserve section order: SUMMARY, SKILLS, TOOLS (if in base), PROFESSIONAL EXPERIENCE, EDUCATION. Do not modify EDUCATION text.
- SKILLS (and TOOLS if present): put each category or line of skills on its own row and start EVERY row with a bullet character "• " (including lines like "• Languages: Python, Go" or "• Cloud & Infra: AWS, Kubernetes"). Do not output the SKILLS block as a single unbulleted paragraph — the Word template expects bullet-prefixed lines.
- Professional experience must keep the same number of roles as base resume and follow this strict per-role format:
  1) First line: Title | Company | Location | Date  (Company/Location/Date must match base; Title: senior, standard phrasing, JD-aligned themes, truthful)
  2) Next line: one parenthetical company/context line
  3) Then bullets
  4) Then one "Technologies & Skills:" line using middle dot separators
- Keyword discipline: every JD or checklist term you include should appear in a **concrete** bullet or tech line (not a naked comma list in the headline). Prefer **one** clear mention over duplicate stuffing.

CRITICAL: Return ONLY the complete tailored resume plain text. No preamble. Start with the resume header (name, title, contact).`;
}

export function buildResumePrompt(
  baseResume: string,
  jobDescription: string,
  options?: BuildPromptOptions
): string {
  if (options?.userId === 2) {
    const inv = (options.experienceInventory ?? loadMohanExperienceInventory()).trim();
    const jdReq = extractJDRequirements(jobDescription);
    const jobTitle = (options.jobTitle ?? "").trim();
    return buildMohanResumePrompt(baseResume, jobDescription, inv, jdReq, jobTitle);
  }
  return buildDefaultResumePrompt(baseResume, jobDescription);
}

function buildDefaultCoverLetterPrompt(
  baseResume: string,
  jobDescription: string,
  companyName: string,
  jobTitle: string
): string {
  return `Your role is to act as a talented, creative cover letter writer who writes compelling, story-like cover letters that connect candidates to job opportunities.

CANDIDATE'S RESUME:
${baseResume.substring(0, 2000)}... (summary of candidate's background)

JOB DESCRIPTION:
${jobDescription}

COMPANY: ${companyName}
POSITION: ${jobTitle}

INSTRUCTIONS:
1. **Style**: Write in a story-like, creative, verbal style - make it engaging, personal, and memorable
2. **No Bullets**: Do NOT use bullet points, bullet symbols (-), or lists
3. **Length**: Write at least 12 sentences (aim for 3-4 paragraphs)
4. **Personalization**: 
   - Directly address the company and specific role
   - Weave in specific experiences from the candidate's background that relate to the job description
   - Show how the candidate's skills and experiences align with what the company needs
5. **Enthusiasm**: Convey genuine enthusiasm for the role and the company
6. **Structure**: 
   - Opening: Hook that connects candidate's journey to this opportunity
   - Body (2-3 paragraphs): Specific examples of relevant experience, skills, and achievements
   - Closing: Strong conclusion expressing eagerness for an interview
7. **Tone**: Professional but warm, confident but humble, authentic and human
8. **Specificity**: Reference specific technologies, projects, or achievements from the resume that match the job requirements

CRITICAL: Return ONLY the cover letter body text. Do NOT include:
- Salutations (e.g., "Dear Hiring Manager,")
- Closings (e.g., "Sincerely," or "Best regards,")
- Your name or signature
- Any preamble or explanation

Start directly with the first paragraph of the cover letter.`;
}

function buildMohanCoverLetterPrompt(
  baseResume: string,
  jobDescription: string,
  companyName: string,
  jobTitle: string,
  experienceInventory: string,
  jdReq: JDRequirements
): string {
  const invBlock =
    experienceInventory.trim().length > 0
      ? experienceInventory.trim()
      : "(Inventory file optional — use full resume context below.)";
  const reqBlock = formatJDRequirementsForPrompt(jdReq);

  return `Your role is to write a compelling, narrative cover letter for a senior engineer with broad software experience. Use the full BASE RESUME plus the EXPANDED INVENTORY to show fit even when the posting emphasizes stacks or domains beyond the short resume sample.

BASE RESUME (full text):
${baseResume}

EXPANDED EXPERIENCE INVENTORY:
${invBlock}

JOB DESCRIPTION:
${jobDescription}

${reqBlock}

COMPANY: ${companyName}
POSITION: ${jobTitle}

MOHAN-SPECIFIC INSTRUCTIONS:
- No bullet points or lists. At least 14 sentences, 3–4 paragraphs.
- Connect the role's core problems (from the JD) to concrete experience from the resume or inventory.
- **Mirror JD language:** weave in several **exact** technology or domain phrases from the JOB DESCRIPTION or the **JD TECH / PRODUCT TERMS** line above (when present) so automated screeners and humans see alignment — without inventing employers or dates.
- Where the JD asks for something adjacent to the strongest evidence, bridge with transfer and patterns (no fabricated jobs or credentials).
- Name specific technologies and outcomes when they appear in the materials above.
- Tone: confident, senior, collaborative; avoid generic AI filler.

CRITICAL: Return ONLY the cover letter body. No salutation, closing, or signature. Start with the first paragraph.`;
}

export function buildCoverLetterPrompt(
  baseResume: string,
  jobDescription: string,
  companyName: string,
  jobTitle: string,
  options?: BuildPromptOptions
): string {
  if (options?.userId === 2) {
    const inv = (options.experienceInventory ?? loadMohanExperienceInventory()).trim();
    const jdReq = extractJDRequirements(jobDescription);
    return buildMohanCoverLetterPrompt(baseResume, jobDescription, companyName, jobTitle, inv, jdReq);
  }
  return buildDefaultCoverLetterPrompt(baseResume, jobDescription, companyName, jobTitle);
}

function isLoginPage(page: any): Promise<boolean> {
  return page.evaluate(() => {
    const url = window.location.href;
    return /auth\/login|auth\/callback|\/login/i.test(url) || url.includes("/auth/");
  });
}

async function waitForComposerOrLoginPrompt(page: any, timeoutMs: number = 15000): Promise<"composer" | "login"> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isLoginPage(page)) return "login";
    const textbox = page.getByRole("textbox", { name: /message|send a message|chat/i }).first();
    const editable = page.locator('[contenteditable="true"]').first();
    const textarea = page.locator('textarea[placeholder*="Message"], textarea[placeholder*="message"]').first();
    for (const loc of [textbox, editable, textarea]) {
      try {
        await loc.waitFor({ state: "visible", timeout: 2000 });
        return "composer";
      } catch {
        /* try next */
      }
    }
    await page.waitForTimeout(1500);
  }
  return "login";
}

/** Wait until the ChatGPT composer is visible (or login prompt; then onSignInRequired is called). Exported for backfill script. */
export async function waitForComposer(
  page: any,
  timeoutMs: number = 60000,
  onSignInRequired?: () => Promise<void>
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = await waitForComposerOrLoginPrompt(page, 10000);
    if (result === "composer") return;
    if (onSignInRequired) {
      await onSignInRequired();
      await page.waitForTimeout(3000);
      continue;
    }
    throw new Error(
      "ChatGPT sign-in required. Export a fresh session: npm run chatgpt:seleniumbase (log in, press ENTER), or set CHATGPT_COOKIES_FILE to a valid cookie JSON, then try again."
    );
  }
  throw new Error(
    "ChatGPT composer not found. Ensure you are logged in: npm run chatgpt:seleniumbase to refresh cookies, or check CHATGPT_COOKIES_FILE / CHATGPT_CONTEXT_DIR."
  );
}

/** Send a message and return the assistant reply text. Exported for backfill script. */
export async function sendMessageAndGetReply(page: any, prompt: string): Promise<string> {
  const selectors = [
    'textarea[placeholder*="Message"], textarea[placeholder*="message"]',
    '[contenteditable="true"]',
    'div[role="textbox"]',
  ];
  let filled = false;
  for (const sel of selectors) {
    try {
      const el = page.locator(sel).first();
      await el.waitFor({ state: "visible", timeout: 5000 });
      await el.click();
      await el.fill("");
      await el.fill(prompt);
      filled = true;
      break;
    } catch {
      /* continue */
    }
  }
  if (!filled) await page.keyboard.type(prompt, { delay: 10 });

  const sendButton = page.locator('button[type="submit"]').or(page.getByRole("button", { name: /send|submit/i }).last());
  await sendButton.first().click();

  await page.waitForTimeout(3000);
  const lastAssistant = page.locator('[data-message-author-role="assistant"]').last();
  await lastAssistant.waitFor({ state: "visible", timeout: 120000 });

  const contentEl = lastAssistant.locator('div[class*="markdown"]').first();
  let prevLen = 0;
  let stableCount = 0;
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(1000);
    const current = await contentEl.textContent();
    const len = (current || "").length;
    if (len === prevLen && len > 0) {
      stableCount++;
      if (stableCount >= 3) break;
    } else stableCount = 0;
    prevLen = len;
  }
  await page.waitForTimeout(1000);

  const parts = await lastAssistant.locator('div[class*="markdown"]').allTextContents();
  return (parts.join("\n\n").trim() || (await contentEl.textContent()) || "").trim();
}

/** Start a new chat (click New chat or go to base URL) and wait for composer. Exported for backfill script. */
export async function startNewChat(page: any): Promise<void> {
  try {
    const clicked = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href="/"], a[href="/chat"], [data-testid="new-chat-link"], nav a, aside a');
      for (let i = 0; i < links.length; i++) {
        const t = ((links[i] as HTMLElement).textContent || "").trim().toLowerCase();
        const h = (links[i].getAttribute("href") || "");
        if (t.indexOf("new chat") >= 0 || h === "/" || h === "/chat") {
          (links[i] as HTMLElement).click();
          return true;
        }
      }
      const btn = document.querySelector('button[aria-label*="New chat"], button[aria-label*="new chat"]');
      if (btn) {
        (btn as HTMLElement).click();
        return true;
      }
      return false;
    });
    if (!clicked) {
      await page.goto(CHATGPT_URL, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(1500);
    }
  } catch {
    await page.goto(CHATGPT_URL, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
  }
  await page.waitForTimeout(2000);
  await waitForComposer(page, 30000);
}

export type GenerateViaChatGPTUiOptions = {
  contextDir?: string;
  headless?: boolean;
  /** When sign-in is required (e.g. in CLI script), wait for user to log in and resolve */
  onSignInRequired?: () => Promise<void>;
};

/** Options for creating a long-lived ChatGPT browser page (e.g. backfill). */
export type CreateChatGPTPageOptions = {
  contextDir?: string;
  headless?: boolean;
};

async function launchChatGPTPersistentSession(
  contextDir: string,
  headless: boolean
): Promise<{ page: any; context: any }> {
  if (!fs.existsSync(contextDir)) {
    fs.mkdirSync(contextDir, { recursive: true });
  }

  const chromePath = findChromeExecutable();
  const cookiesPath = getChatGPTCookiesPath();
  let session: { cookies: PlaywrightCookie[]; userAgent?: string } | null = null;
  if (fs.existsSync(cookiesPath)) {
    session = loadChatGPTSessionFromFile(cookiesPath);
  }

  const launchOpts: Record<string, unknown> = {
    headless,
    viewport: { width: 1280, height: 800 },
    locale: "en-US",
    args: ["--disable-blink-features=AutomationControlled", "--disable-dev-shm-usage", "--no-sandbox"],
  };
  if (chromePath) {
    launchOpts.executablePath = chromePath;
  }
  if (session?.userAgent) {
    launchOpts.userAgent = session.userAgent;
  }

  const context = await chromium.launchPersistentContext(contextDir, launchOpts);
  const page = context.pages()[0] ?? (await context.newPage());
  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    if (!(window as any).chrome) (window as any).chrome = { runtime: {} };
  });

  if (session) {
    const sanitized = session.cookies
      .map((c) => sanitizeCookieForPlaywright(c))
      .filter((c): c is PlaywrightCookie => Boolean(c));
    await context.clearCookies();
    try {
      await context.addCookies(sanitized);
    } catch {
      try {
        const minimal = sanitized.map((c) => ({
          name: c.name,
          value: c.value,
          domain: c.domain,
          path: c.path,
        }));
        await context.addCookies(minimal);
      } catch {
        console.warn("⚠️  Could not import ChatGPT cookies; continuing with persistent profile session.");
      }
    }
  }

  await page.waitForTimeout(1000 + Math.floor(Math.random() * 1000));
  await page.goto(CHATGPT_URL, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);

  return { page, context };
}

/**
 * Create a browser context and page on ChatGPT. Caller must call waitForComposer(page) and own the loop.
 * Returns { page, close }. Use for backfill scripts that process many jobs in one session.
 */
export async function createChatGPTBrowserPage(
  options: CreateChatGPTPageOptions = {}
): Promise<{ page: any; close: () => Promise<void> }> {
  const contextDir = options.contextDir ?? getChatGPTContextDir();
  const headless = options.headless ?? false;
  const { page, context } = await launchChatGPTPersistentSession(contextDir, headless);
  return {
    page,
    close: async () => {
      await context.close();
    },
  };
}

/**
 * Generate tailored resume and cover letter text via ChatGPT web UI.
 * Launches browser, sends prompts, captures replies. Uses persistent context so login is reused.
 */
export async function generateResumeAndCoverLetterViaChatGPTUi(
  params: {
    baseResumeText: string;
    jobDescription: string;
    company: string;
    role: string;
    /** When 2 (Mohan), uses expanded inventory + JD requirement prompts. */
    userId?: number;
    experienceInventory?: string;
  },
  options: GenerateViaChatGPTUiOptions = {}
): Promise<{ resumeText: string; coverLetterText: string }> {
  const { contextDir = getChatGPTContextDir(), headless = false, onSignInRequired } = options;

  const { page, context } = await launchChatGPTPersistentSession(contextDir, headless);

  try {
    await waitForComposer(page, 60000, onSignInRequired);

    const promptOpts: BuildPromptOptions | undefined =
      params.userId === 2
        ? {
            userId: 2,
            experienceInventory:
              params.experienceInventory ?? loadMohanExperienceInventory(),
            jobTitle: params.role,
          }
        : undefined;

    const resumeText = await sendMessageAndGetReply(
      page,
      buildResumePrompt(params.baseResumeText, params.jobDescription, promptOpts)
    );
    await page.waitForTimeout(2000);

    const coverLetterText = await sendMessageAndGetReply(
      page,
      buildCoverLetterPrompt(
        params.baseResumeText,
        params.jobDescription,
        params.company,
        params.role,
        promptOpts
      )
    );

    return { resumeText, coverLetterText };
  } finally {
    await context.close();
  }
}
