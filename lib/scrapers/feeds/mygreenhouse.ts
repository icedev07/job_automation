import type { Feed, FeedFetchResult, NormalizedJob } from "../types";
import { stripHtml } from "../rss";

// MyGreenhouse (my.greenhouse.io) is the candidate-side aggregator portal that
// surfaces remote-friendly jobs from every employer on Greenhouse plus a few
// other ATSs. It is NOT a JSON API — it is an Inertia.js single-page app behind
// a Rails passwordless session. We replicate the browser exactly:
//
//   Step A (cheap, always): an Inertia "partial reload" of /jobs returns the
//     job-search results as JSON. We paginate it with work_type[]=remote so
//     only remote roles are ever pulled. Each result is THIN — it has a title,
//     company, location and work type, but NO description.
//
//   Step B (enrichment): most results link to job-boards.greenhouse.io, which
//     has a clean public API (boards-api.greenhouse.io) carrying the full
//     description. We call that per job. Non-Greenhouse links get a best-effort
//     page fetch; whatever B cannot resolve keeps a synthesized thin
//     description so the job still reaches the AI analyzer instead of being
//     dropped.
//
// Required config key:
//   mygreenhouse_session_cookie  The Cookie header value from a logged-in
//                                my.greenhouse.io tab. Only `_session_id` is
//                                actually needed — these are GET requests, so
//                                Rails does not check a CSRF token.
// Optional config key:
//   mygreenhouse_search_url      Extra query params (e.g. "date_posted=past_day")
//                                merged into the job-search request.

const MYGH_BASE = "https://my.greenhouse.io";
const JOBS_PATH = `${MYGH_BASE}/jobs`;
const INERTIA_COMPONENT = "job_search";
const INERTIA_PARTIAL_DATA = "jobPosts,moreResultsAvailable,page";
const MAX_PAGES = 30;
const PORTAL_TIMEOUT_MS = 12_000;
const ENRICH_TIMEOUT_MS = 10_000;
const ENRICH_CONCURRENCY = 6;
const DESCRIPTION_MAX_CHARS = 8_000;
// A non-Greenhouse page must yield at least this much visible text to be
// trusted as a real description; below it we assume a JS-only SPA and keep the
// thin fallback.
const MIN_SCRAPED_DESCRIPTION = 400;

const BROWSER_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const WORK_TYPE_LABEL: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  in_person: "In-person",
};

// ---------------------------------------------------------------------------
// Raw shapes
// ---------------------------------------------------------------------------

type JobPostRaw = {
  id?: number | string;
  title?: string;
  companyName?: string;
  publicUrl?: string;
  viewJobPath?: string | null;
  locations?: unknown;
  workType?: string;
  payRanges?: unknown;
};

type GreenhouseApiJob = {
  title?: string;
  content?: string;
  location?: { name?: string } | string | null;
  company_name?: string;
  metadata?: Array<{ name?: string; value?: unknown }>;
};

// ---------------------------------------------------------------------------
// Cookie handling
// ---------------------------------------------------------------------------

// Users routinely paste only the session VALUE — DevTools → Application →
// Cookies shows the bare value when a single cookie row is selected. A value
// with no "=" cannot be read as a Cookie header, so wrap it as the _session_id
// pair instead of rejecting a paste that is actually correct.
function normalizeCookieInput(raw: string): string {
  const s = (raw || "").trim();
  if (!s || s.includes("=")) return s;
  return `_session_id=${s}`;
}

// Parse "k1=v1; k2=v2" into a map. Values are kept verbatim; we send the whole
// original string back as the Cookie header anyway.
function parseCookieHeader(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const piece of raw.split(/;\s*/)) {
    if (!piece) continue;
    const idx = piece.indexOf("=");
    if (idx <= 0) continue;
    const name = piece.slice(0, idx).trim();
    if (name) out[name] = piece.slice(idx + 1).trim();
  }
  return out;
}

// Greenhouse/Rails can rotate the session cookie name; match anything that
// looks like one rather than hard-coding `_session_id`.
function hasSessionCookie(jar: Record<string, string>): boolean {
  return Object.keys(jar).some(
    (n) => /^_session_id$/i.test(n) || /_session(_id)?$/i.test(n) || /^_[a-z0-9_-]+_session$/i.test(n),
  );
}

// ---------------------------------------------------------------------------
// HTML / Inertia helpers
// ---------------------------------------------------------------------------

function htmlAttrUnescape(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

// The Inertia app embeds its asset version inside the <div id="app" data-page>
// blob. We must send that exact version on every partial reload or the server
// answers 409 (asset-version mismatch).
function extractInertiaVersion(html: string): string | null {
  const m = html.match(/\bdata-page="([^"]*)"/);
  if (!m) return null;
  try {
    const json = JSON.parse(htmlAttrUnescape(m[1]));
    const v = json?.version;
    return typeof v === "string" && v ? v : null;
  } catch {
    return null;
  }
}

function looksLikeSignIn(res: Response, body: string): boolean {
  if (res.status === 401 || res.status === 403) return true;
  if (res.status >= 300 && res.status < 400) {
    const loc = res.headers.get("location") || "";
    if (/\/users\/sign_in|\/login/i.test(loc)) return true;
  }
  if (res.redirected && /\/users\/sign_in/i.test(res.url)) return true;
  if (/<title>[^<]*sign in/i.test(body)) return true;
  return false;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  parentSignal: AbortSignal | undefined,
): Promise<Response> {
  const controller = new AbortController();
  const onParentAbort = () => controller.abort();
  if (parentSignal) {
    if (parentSignal.aborted) throw new Error("aborted");
    parentSignal.addEventListener("abort", onParentAbort, { once: true });
  }
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
    if (parentSignal) parentSignal.removeEventListener("abort", onParentAbort);
  }
}

// ---------------------------------------------------------------------------
// Search filters
// ---------------------------------------------------------------------------
// The four facets my.greenhouse.io exposes in its own job-search UI. The values
// below are the exact query tokens the portal uses; the admin Scanners page
// renders matching dropdowns / checkboxes that write them into config.
//   date_posted        single  →  ?date_posted=past_day
//   salary             single  →  ?salary=more_than_100k
//   work_type[]        multi   →  ?work_type[]=remote&work_type[]=hybrid
//   employment_type[]  multi   →  ?employment_type[]=full_time

const DATE_POSTED_VALUES = ["past_day", "past_five_days", "past_ten_days", "past_thirty_days"];
const SALARY_VALUES = [
  "less_than_40k", "more_than_40k", "more_than_60k", "more_than_80k", "more_than_100k",
  "more_than_120k", "more_than_140k", "more_than_160k", "more_than_180k", "more_than_200k",
];
const WORK_TYPE_VALUES = ["remote", "hybrid", "in_person"];
const EMPLOYMENT_TYPE_VALUES = ["full_time", "part_time", "contract", "temporary"];

type MyGreenhouseFilters = {
  datePosted: string;
  salary: string;
  workTypes: string[];
  employmentTypes: string[];
};

// Keep only the comma-separated tokens that are real, recognized values, so a
// stale or hand-edited config can never push a bad param at the portal.
function parseAllowedCsv(raw: string | undefined, allowed: string[]): string[] {
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter((s) => allowed.includes(s));
}

function parseFilters(config: Record<string, string> | undefined): MyGreenhouseFilters {
  const c = config || {};
  const datePosted = c.mygreenhouse_date_posted || "";
  const salary = c.mygreenhouse_salary || "";
  return {
    datePosted: DATE_POSTED_VALUES.includes(datePosted) ? datePosted : "",
    salary: SALARY_VALUES.includes(salary) ? salary : "",
    // Never configured → remote-only, this scanner's historical behaviour.
    // Configured but empty → no work-type filter (the user opted into all).
    workTypes:
      "mygreenhouse_work_types" in c
        ? parseAllowedCsv(c.mygreenhouse_work_types, WORK_TYPE_VALUES)
        : ["remote"],
    employmentTypes: parseAllowedCsv(c.mygreenhouse_employment_types, EMPLOYMENT_TYPE_VALUES),
  };
}

// ---------------------------------------------------------------------------
// URL building
// ---------------------------------------------------------------------------

function buildJobsUrl(
  filters: MyGreenhouseFilters,
  extraParams: Record<string, string>,
  page: number,
): string {
  const u = new URL(JOBS_PATH);
  for (const wt of filters.workTypes) u.searchParams.append("work_type[]", wt);
  for (const et of filters.employmentTypes) u.searchParams.append("employment_type[]", et);
  if (filters.datePosted) u.searchParams.set("date_posted", filters.datePosted);
  if (filters.salary) u.searchParams.set("salary", filters.salary);
  // Raw escape-hatch params from the search-url field win over the facets.
  for (const [k, v] of Object.entries(extraParams)) u.searchParams.set(k, v);
  u.searchParams.set("page", String(page));
  return u.toString();
}

// Parse "date_posted=past_day, salary=true" style overrides from the search-url
// config field. http(s) values are ignored — the endpoint is fixed.
function parseExtraParams(searchUrl: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!searchUrl || /^https?:/i.test(searchUrl.trim())) return out;
  for (const piece of searchUrl.split(/[,&\n]/)) {
    const idx = piece.indexOf("=");
    if (idx <= 0) continue;
    const k = piece.slice(0, idx).trim();
    const v = piece.slice(idx + 1).trim();
    if (k && v && k !== "page" && k !== "work_type[]") out[k] = v;
  }
  return out;
}

// Drop the my.greenhouse tracking param so the same job always dedupes to one
// canonical URL.
function canonicalizeUrl(raw: string): string {
  try {
    const u = new URL(raw);
    u.searchParams.delete("gh_src");
    return u.toString();
  } catch {
    return raw;
  }
}

// job-boards.greenhouse.io/{token}/jobs/{id} → the clean public boards API.
function parseGreenhouseBoard(raw: string): { token: string; id: string } | null {
  const m = raw.match(/(?:job-boards|boards)\.greenhouse\.io\/([^/?#]+)\/jobs\/(\d+)/i);
  return m ? { token: m[1], id: m[2] } : null;
}

// ---------------------------------------------------------------------------
// Field extraction
// ---------------------------------------------------------------------------

function extractThinLocation(entry: JobPostRaw): string | null {
  const locs = entry.locations;
  if (Array.isArray(locs)) {
    const parts = locs
      .map((l) => (typeof l === "string" ? l : l && typeof l === "object" ? (l as any).name : ""))
      .map((s) => String(s || "").trim())
      .filter(Boolean);
    if (parts.length) return parts.join(", ");
  }
  return null;
}

function extractApiLocation(loc: GreenhouseApiJob["location"]): string | null {
  if (!loc) return null;
  if (typeof loc === "string") return loc.trim() || null;
  return (loc.name || "").trim() || null;
}

function findApiSalary(meta: GreenhouseApiJob["metadata"]): string | null {
  if (!Array.isArray(meta)) return null;
  const hit = meta.find((m) => /salary|compensation|pay/i.test(m?.name || ""));
  const v = hit?.value;
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function formatPayRanges(payRanges: unknown): string | null {
  if (!Array.isArray(payRanges) || payRanges.length === 0) return null;
  const r = payRanges[0];
  if (!r || typeof r !== "object") return null;
  const o = r as Record<string, unknown>;
  const cur = typeof o.currency === "string" ? o.currency : "";
  const min = typeof o.min === "number" ? o.min : typeof o.minValue === "number" ? o.minValue : null;
  const max = typeof o.max === "number" ? o.max : typeof o.maxValue === "number" ? o.maxValue : null;
  if (min == null && max == null) return null;
  const range = [min, max].filter((n) => n != null).join("–");
  return `${cur}${range}`.trim() || null;
}

// Thin description used when B cannot resolve a real one — kept above the
// analyzer's 50-char minimum so the job is still classified, not auto-rejected.
function synthDescription(entry: JobPostRaw, company: string, location: string | null): string {
  const wt = WORK_TYPE_LABEL[entry.workType || ""] || entry.workType || "";
  return [
    `${entry.title || "Untitled role"} at ${company}.`,
    `Location: ${location || "not specified"}.`,
    wt ? `Work type: ${wt}.` : "",
    "Aggregated MyGreenhouse listing — the full description was not retrieved; classify suitability from the title, company, location and work type above.",
  ]
    .filter(Boolean)
    .join(" ");
}

function htmlPageToText(html: string): string {
  const cleaned = html.replace(/<(script|style|noscript|svg|head)\b[^>]*>[\s\S]*?<\/\1>/gi, " ");
  return stripHtml(cleaned).replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

// ---------------------------------------------------------------------------
// Concurrency
// ---------------------------------------------------------------------------

async function mapWithConcurrency<T>(
  items: T[],
  worker: (item: T) => Promise<void>,
  concurrency: number,
  shouldStop: () => boolean,
): Promise<void> {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (!shouldStop()) {
      const i = cursor++;
      if (i >= items.length) return;
      await worker(items[i]);
    }
  });
  await Promise.all(runners);
}

// ---------------------------------------------------------------------------
// Step B — description enrichment
// ---------------------------------------------------------------------------

type EnrichTarget = { job: NormalizedJob; sourceUrl: string };

async function enrichFromGreenhouse(
  token: string,
  id: string,
  signal: AbortSignal | undefined,
): Promise<{ description: string; location: string | null; salary: string | null } | null> {
  const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(token)}/jobs/${id}`;
  const res = await fetchWithTimeout(
    url,
    { headers: { "User-Agent": BROWSER_UA, Accept: "application/json" }, cache: "no-store" },
    ENRICH_TIMEOUT_MS,
    signal,
  );
  if (!res.ok) return null;
  const data = (await res.json()) as GreenhouseApiJob;
  const description = data.content ? stripHtml(data.content) : "";
  if (description.length < 50) return null;
  return {
    description: description.slice(0, DESCRIPTION_MAX_CHARS),
    location: extractApiLocation(data.location),
    salary: findApiSalary(data.metadata),
  };
}

async function enrichFromPage(
  url: string,
  signal: AbortSignal | undefined,
): Promise<string | null> {
  const res = await fetchWithTimeout(
    url,
    { headers: { "User-Agent": BROWSER_UA, Accept: "text/html,*/*" }, redirect: "follow", cache: "no-store" },
    ENRICH_TIMEOUT_MS,
    signal,
  );
  if (!res.ok) return null;
  const text = htmlPageToText(await res.text());
  if (text.length < MIN_SCRAPED_DESCRIPTION) return null;
  return text.slice(0, DESCRIPTION_MAX_CHARS);
}

async function enrichOne(target: EnrichTarget, signal: AbortSignal | undefined): Promise<void> {
  const gh = parseGreenhouseBoard(target.sourceUrl);
  try {
    if (gh) {
      const r = await enrichFromGreenhouse(gh.token, gh.id, signal);
      if (r) {
        target.job.description = r.description;
        if (r.location) target.job.location = r.location;
        if (r.salary && !target.job.salary) target.job.salary = r.salary;
      }
      return;
    }
    const text = await enrichFromPage(target.sourceUrl, signal);
    if (text) target.job.description = text;
  } catch {
    // Best-effort: any failure leaves the synthesized thin description in place.
  }
}

// ---------------------------------------------------------------------------
// Feed
// ---------------------------------------------------------------------------

export const myGreenhouseFeed: Feed = {
  key: "mygreenhouse",
  label: "MyGreenhouse (authenticated)",
  fetch: async ({ maxJobs, searchUrl, signal, config }): Promise<FeedFetchResult> => {
    const cookie = normalizeCookieInput(config?.mygreenhouse_session_cookie || "");
    if (!cookie) {
      return {
        jobs: [],
        warning:
          "session cookie not configured — paste the Cookie header value (it must include _session_id) from a logged-in my.greenhouse.io tab",
      };
    }
    const cookieJar = parseCookieHeader(cookie);
    if (Object.keys(cookieJar).length === 0) {
      return { jobs: [], warning: "session cookie is empty or malformed — re-copy it from DevTools" };
    }

    const extraParams = parseExtraParams(searchUrl);
    const filters = parseFilters(config);
    const baseHeaders: Record<string, string> = {
      "User-Agent": BROWSER_UA,
      "Accept-Language": "en-US,en;q=0.9",
      Cookie: cookie,
    };

    // --- get the Inertia asset version (and prove the session is alive) ---
    let version: string;
    try {
      const htmlRes = await fetchWithTimeout(
        buildJobsUrl(filters, extraParams, 1),
        {
          headers: {
            ...baseHeaders,
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
          redirect: "manual",
          cache: "no-store",
        },
        PORTAL_TIMEOUT_MS,
        signal,
      );
      const htmlBody = await htmlRes.text();
      if (looksLikeSignIn(htmlRes, htmlBody)) {
        const names = Object.keys(cookieJar).sort().join(", ") || "(none)";
        return {
          jobs: [],
          warning: hasSessionCookie(cookieJar)
            ? `session expired (my.greenhouse.io redirected to sign-in). Sign in again and paste a fresh cookie. Cookies sent: ${names}.`
            : `cookie has no recognizable session value (sent: ${names}). Copy the Cookie header from a logged-in my.greenhouse.io tab.`,
        };
      }
      const v = extractInertiaVersion(htmlBody);
      if (!v) {
        return { jobs: [], warning: "could not read the Inertia page version — my.greenhouse.io layout may have changed" };
      }
      version = v;
    } catch (err) {
      const msg = (err as Error).message || String(err);
      return {
        jobs: [],
        warning: /abort/i.test(msg)
          ? "request timed out — my.greenhouse.io is slow or unreachable"
          : `network error reaching my.greenhouse.io: ${msg.slice(0, 160)}`,
      };
    }

    // --- Step A: paginate the thin job-search results ---
    const targets: EnrichTarget[] = [];
    const seen = new Set<string>();
    let warning: string | undefined;

    for (let page = 1; page <= MAX_PAGES; page++) {
      if (signal?.aborted) {
        warning = warning || "scan aborted before completion";
        break;
      }
      let res: Response;
      let body: string;
      try {
        res = await fetchWithTimeout(
          buildJobsUrl(filters, extraParams, page),
          {
            headers: {
              ...baseHeaders,
              Accept: "text/html, application/xhtml+xml",
              "X-Inertia": "true",
              "X-Inertia-Version": version,
              "X-Inertia-Partial-Component": INERTIA_COMPONENT,
              "X-Inertia-Partial-Data": INERTIA_PARTIAL_DATA,
              "X-Requested-With": "XMLHttpRequest",
              Referer: JOBS_PATH,
            },
            redirect: "manual",
            cache: "no-store",
          },
          PORTAL_TIMEOUT_MS,
          signal,
        );
        body = await res.text();
      } catch (err) {
        const msg = (err as Error).message || String(err);
        warning = /abort/i.test(msg) ? "request timed out mid-scan" : `network error mid-scan: ${msg.slice(0, 140)}`;
        break;
      }

      if (looksLikeSignIn(res, body)) {
        warning = "session expired mid-scan — paste a fresh my.greenhouse.io cookie";
        break;
      }
      // 409 = the app was redeployed and our asset version is stale.
      if (res.status === 409) {
        warning = "my.greenhouse.io was updated mid-scan (version changed) — re-run the scan";
        break;
      }
      if (!res.ok) {
        warning = `my.greenhouse.io responded HTTP ${res.status}`;
        break;
      }

      let payload: any;
      try {
        payload = JSON.parse(body);
      } catch {
        warning = "job-search response was not JSON (the portal layout may have changed)";
        break;
      }

      const props = payload?.props || {};
      const list: JobPostRaw[] = Array.isArray(props.jobPosts) ? props.jobPosts : [];
      for (const entry of list) {
        const title = (entry.title || "").trim();
        const rawUrl = (entry.publicUrl || "").trim();
        if (!title || !rawUrl) continue;
        const url = canonicalizeUrl(rawUrl);
        if (seen.has(url)) continue;
        seen.add(url);

        const company = (entry.companyName || "").trim() || "Unknown";
        const location = extractThinLocation(entry);
        targets.push({
          sourceUrl: rawUrl,
          job: {
            platform: "mygreenhouse",
            title,
            company,
            url,
            location,
            description: synthDescription(entry, company, location),
            salary: formatPayRanges(entry.payRanges),
          },
        });
        if (targets.length >= maxJobs) break;
      }

      if (targets.length >= maxJobs) break;
      if (props.moreResultsAvailable !== true) break;
      if (list.length === 0) break;
    }

    // --- Step B: enrich descriptions (Greenhouse boards API, else page fetch) ---
    if (targets.length > 0 && !signal?.aborted) {
      await mapWithConcurrency(
        targets,
        (t) => enrichOne(t, signal),
        ENRICH_CONCURRENCY,
        () => !!signal?.aborted,
      );
    }

    const jobs = targets.map((t) => t.job);
    const enriched = jobs.filter(
      (j) => j.description != null && !j.description.includes("Aggregated MyGreenhouse listing"),
    ).length;
    if (jobs.length > 0) {
      const note = `${enriched}/${jobs.length} jobs got a full description`;
      warning = warning ? `${warning}; ${note}` : note;
    }

    return { jobs, warning };
  },
};
