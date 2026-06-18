import type { Feed, NormalizedJob } from "../types";
import { decodeEntities } from "../rss";
import curatedSlugs from "./greenhouse-curated-slugs.json";

// Greenhouse exposes a fully public, no-auth jobs api per company board:
//   https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true
// A single call returns EVERY active job for the board (no pagination — the
// response carries `meta.total`) and, with `content=true`, inlines the full
// description, departments and offices. So every field below costs zero extra
// requests.
//
// The user supplies a comma-separated list of slugs in the search-url field,
// optionally mixed with filter tokens (all opt-in — absent ⇒ legacy behaviour):
//   @curated            expand the bundled live-only slug list
//   @since=N / @days=N   keep only jobs posted/updated within N days
//   @remote             keep only remote / work-from-anywhere roles
//   @kw=term            keep only jobs whose title or department contains term
//   @loc=keyword        keep only jobs whose location/office contains keyword
// e.g. "@curated, @remote, @since=7, @kw=engineer".
type GreenhouseJob = {
  id: number;
  internal_job_id?: number;
  requisition_id?: string | null;
  title: string;
  absolute_url: string;
  location?: { name?: string } | null;
  offices?: Array<{ name?: string; location?: string | null }> | null;
  departments?: Array<{ name?: string }> | null;
  content?: string;
  metadata?: Array<{ name?: string; value?: unknown; value_type?: string }> | null;
  company_name?: string;
  updated_at?: string;
  first_published?: string;
  application_deadline?: { date?: string } | string | null;
};

type GreenhouseResponse = { jobs?: GreenhouseJob[]; meta?: { total?: number } };

// Curated remote-tech defaults. Verified live on probe; the user can override
// or extend via the search-url field. The full `@curated` list lives in
// greenhouse-curated-slugs.json and is pre-pruned so every entry currently
// returns 200 on the public boards api.
export const GREENHOUSE_DEFAULT_SLUGS = [
  "stripe",
  "anthropic",
  "cloudflare",
  "mongodb",
  "samsara",
  "roblox",
  "airbnb",
  "gitlab",
  "intercom",
  "figma",
  "fivetran",
  "robinhood",
  "lyft",
  "asana",
  "instacart",
  "postman",
  "dropbox",
  "vercel",
  "duolingo",
  "discord",
  "newrelic",
  "amplitude",
  "mixpanel",
  "webflow",
  "algolia",
  "airtable",
  "modernhealth",
];

// Hard limits so a misconfigured search_url cannot starve the function.
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,60}$/i;
const PER_SLUG_TIMEOUT_MS = 8_000;
const MAX_CONCURRENT = 6;
const MAX_WARNING_CHARS = 600;
const DESCRIPTION_MAX_CHARS = 25_000;
const DAY_MS = 86_400_000;

// Cloudflare / generic anti-bot interstitials, served with a 200 or 403. A board
// API is JSON, so any of these in the body means we were challenged, not served.
const CHALLENGE_RE =
  /Just a moment|cf-browser-verification|Attention Required|cf-chl-|__cf_chl|enable JavaScript and cookies/i;

const BROWSER_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36";

// ---------------------------------------------------------------------------
// Config / token parsing
// ---------------------------------------------------------------------------

type Filters = {
  maxAgeDays: number | null;
  keywords: string[];
  locations: string[];
  remoteOnly: boolean;
};

type ParsedConfig = { slugs: string[]; filters: Filters };

// Extract a board slug from a bare slug or any Greenhouse board URL. Covers the
// classic host (boards.greenhouse.io / boards-api.greenhouse.io), the modern
// host (job-boards.greenhouse.io), the EU host (boards.eu.greenhouse.io,
// job-boards.eu.greenhouse.io) and the embed form (…/embed/job_board?for=slug).
const HOST_RE =
  /(?:job-)?boards(?:-api)?(?:\.eu)?\.greenhouse\.io\/(?:embed\/job_board\/?\?for=|v\d+\/boards\/)?([a-z0-9-]+)/i;

function extractSlug(token: string): string | null {
  // The embed form carries the slug in a `for=` query param; prefer it so we
  // never mistake the `embed` path segment for the slug.
  const forMatch = token.match(/[?&]for=([a-z0-9-]+)/i);
  const hostMatch = token.match(HOST_RE);
  const candidate = forMatch ? forMatch[1] : hostMatch ? hostMatch[1] : token;
  return SLUG_PATTERN.test(candidate) ? candidate.toLowerCase() : null;
}

function parseConfig(searchUrl: string | undefined): ParsedConfig {
  const filters: Filters = { maxAgeDays: null, keywords: [], locations: [], remoteOnly: false };
  if (!searchUrl || !searchUrl.trim()) {
    return { slugs: GREENHOUSE_DEFAULT_SLUGS, filters };
  }
  const tokens = searchUrl
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const t of tokens) {
    if (/^@curated$/i.test(t)) {
      out.push(...(curatedSlugs as string[]));
      continue;
    }
    const since = t.match(/^@(?:since|days)=(\d{1,4})$/i);
    if (since) {
      filters.maxAgeDays = Math.max(0, parseInt(since[1], 10));
      continue;
    }
    const kw = t.match(/^@kw=(.+)$/i);
    if (kw) {
      const v = kw[1].trim().toLowerCase();
      if (v) filters.keywords.push(v);
      continue;
    }
    const loc = t.match(/^@loc=(.+)$/i);
    if (loc) {
      const v = loc[1].trim().toLowerCase();
      if (v) filters.locations.push(v);
      continue;
    }
    if (/^@remote$/i.test(t)) {
      filters.remoteOnly = true;
      continue;
    }
    const slug = extractSlug(t);
    if (slug) out.push(slug);
  }
  // de-dup while preserving order; fall back to defaults if the field held only
  // filter tokens and no slugs.
  const slugs = Array.from(new Set(out));
  return { slugs: slugs.length ? slugs : GREENHOUSE_DEFAULT_SLUGS, filters };
}

// ---------------------------------------------------------------------------
// HTML → plain text (Greenhouse `content`)
// ---------------------------------------------------------------------------

// Greenhouse `content` is HTML-entity-encoded once the JSON parser has resolved
// the outer string. Encoding depth is NOT uniform: most boards single-encode
// (stripe: "&lt;p&gt;") but some mix layers (duolingo single-encodes tags yet
// double-encodes ampersands as "&amp;amp;"). So decode to a fixed point (bounded
// to a few passes) BEFORE converting block tags to line breaks / bullets and
// stripping the rest — otherwise leftover "&amp;" / "&#39;" survive into the
// stored description and degrade both human review and AI classification.
function decodeEntitiesFully(s: string): string {
  let prev = s;
  for (let i = 0; i < 4; i++) {
    const next = decodeEntities(prev);
    if (next === prev) return next;
    prev = next;
  }
  return prev;
}

function htmlToText(html: string): string {
  if (!html) return "";
  const text = decodeEntitiesFully(html)
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(?:p|div|section|article|h[1-6]|tr|ul|ol|blockquote)\s*>/gi, "\n\n")
    .replace(/<\s*li[^>]*>/gi, "• ")
    .replace(/<\/\s*li\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text.length > DESCRIPTION_MAX_CHARS ? text.slice(0, DESCRIPTION_MAX_CHARS) : text;
}

// ---------------------------------------------------------------------------
// Salary extraction
// ---------------------------------------------------------------------------

function coerceNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/[, ]/g, ""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

// metadata[].value is not always a primitive: structured pay is an object, a
// multi-select is an array, a yes/no facet is a boolean. Never stringify an
// object straight to "[object Object]".
function formatMetaValue(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === "string") return v.trim() || null;
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : null;
  if (typeof v === "boolean") return null;
  if (Array.isArray(v)) {
    const parts = v
      .map((x) => (typeof x === "string" ? x.trim() : typeof x === "number" ? String(x) : ""))
      .filter(Boolean);
    return parts.length ? parts.join(" – ") : null;
  }
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    const cur =
      typeof o.currency === "string" ? o.currency : typeof o.unit === "string" ? o.unit : "";
    const min = coerceNumber(o.min_value ?? o.min ?? o.minValue);
    const max = coerceNumber(o.max_value ?? o.max ?? o.maxValue);
    if (min == null && max == null) return null;
    const range = [min, max].filter((n): n is number => n != null).map((n) => n.toLocaleString()).join(" – ");
    return `${cur} ${range}`.trim() || null;
  }
  return null;
}

function findSalary(meta?: GreenhouseJob["metadata"]): string | null {
  if (!Array.isArray(meta)) return null;
  const hit = meta.find((m) => /salary|compensation|\bpay\b/i.test(m?.name || ""));
  if (!hit) return null;
  return formatMetaValue(hit.value);
}

const CUR = String.raw`(?:US\$|USD|CA\$|CAD|AU\$|A\$|AUD|NZ\$|€|EUR|£|GBP|\$)`;
// currency + figure, optional "<dash|to> + currency? + figure". Figures must
// look like real money (thousands separator, k/m suffix, or 4-6 digits) so we
// don't match "$5" out of "$5M ARR".
const SALARY_RE = new RegExp(
  String.raw`(?:up to\s+)?${CUR}\s?\d{1,3}(?:[.,]\d{3})*(?:\.\d+)?\s?[kKmM]?(?:\s?(?:[-–—]|to)\s?${CUR}?\s?\d{1,3}(?:[.,]\d{3})*(?:\.\d+)?\s?[kKmM]?)?`,
  "g",
);

// Pull a pay band out of a (decoded) description. US/EU pay-transparency law
// puts the band in the body even when the structured metadata omits it. Returns
// the matched substring verbatim — we store salary as free text, so there is no
// risky number scaling.
function parseSalaryRange(text: string): string | null {
  if (!text) return null;
  const slice = text.slice(0, 12_000);
  let fallback: string | null = null;
  SALARY_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = SALARY_RE.exec(slice)) !== null) {
    const raw = m[0].trim();
    // Must contain a salary-shaped number, not a lone "$5".
    if (!/(\d[.,]\d{3})|[kK]\b|\d{4,}/.test(raw)) continue;
    const after = slice.slice(m.index + raw.length, m.index + raw.length + 18).toLowerCase();
    // Reject valuations / revenue / funding figures.
    if (/^\s*(?:m\b|mm\b|million|bn\b|billion|b\b|\+?\s*arr|\s*in\s+(?:revenue|funding|sales))/.test(after)) {
      continue;
    }
    if (/[-–—]|to/.test(raw)) return raw; // a real range — best signal
    if (!fallback) fallback = raw; // remember a single figure as a fallback
  }
  return fallback;
}

// ---------------------------------------------------------------------------
// Field extraction & filtering
// ---------------------------------------------------------------------------

const REMOTE_RE = /\b(?:remote|anywhere|work from home|wfh|distributed|telecommute)\b/i;

function officeStrings(entry: GreenhouseJob): string[] {
  if (!Array.isArray(entry.offices)) return [];
  const out: string[] = [];
  for (const o of entry.offices) {
    const n = (o?.name || "").trim();
    const l = (o?.location || "").trim();
    if (n) out.push(n);
    if (l) out.push(l);
  }
  return out;
}

function locationText(entry: GreenhouseJob): string {
  const parts = [(entry.location?.name || "").trim(), ...officeStrings(entry)].filter(Boolean);
  return parts.join(" ");
}

// "Posted" time for recency sorting and the @since freshness filter. Prefer
// first_published (when the role first went live) over updated_at: some boards
// (stripe) re-stamp updated_at on every job during routine re-indexing, which
// would make @since meaningless. Fall back to updated_at only when a board omits
// first_published.
function postedMs(entry: GreenhouseJob): number | null {
  const fp = Date.parse(entry.first_published || "");
  if (!Number.isNaN(fp)) return fp;
  const ua = Date.parse(entry.updated_at || "");
  return Number.isNaN(ua) ? null : ua;
}

function deadlineMs(d: GreenhouseJob["application_deadline"]): number | null {
  if (!d) return null;
  const s = typeof d === "string" ? d : typeof d === "object" ? d.date : undefined;
  if (!s) return null;
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : t;
}

// Cheap, allocation-light checks applied before we build the full job (so we
// never run htmlToText / the salary regex on a job we are about to drop).
function passesFilters(entry: GreenhouseJob, f: Filters, now: number): boolean {
  const locText = locationText(entry).toLowerCase();
  const title = (entry.title || "").toLowerCase();
  if (f.remoteOnly && !REMOTE_RE.test(`${title} ${locText}`)) return false;
  if (f.keywords.length) {
    const dept = Array.isArray(entry.departments)
      ? entry.departments.map((d) => (d?.name || "").toLowerCase()).join(" ")
      : "";
    if (!f.keywords.some((k) => title.includes(k) || dept.includes(k))) return false;
  }
  if (f.locations.length && !f.locations.some((k) => locText.includes(k))) return false;
  // Drop a posting whose application deadline has already passed (always — a
  // closed role is never worth analyzing or surfacing).
  const dl = deadlineMs(entry.application_deadline);
  if (dl != null && dl < now) return false;
  if (f.maxAgeDays != null) {
    const r = postedMs(entry);
    if (r == null || r < now - f.maxAgeDays * DAY_MS) return false;
  }
  return true;
}

function titleizeSlug(slug: string): string {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function buildJob(entry: GreenhouseJob, slug: string): NormalizedJob {
  const title = entry.title!.trim();
  const url = entry.absolute_url!.trim();
  const body = entry.content ? htmlToText(entry.content) : "";
  const dept = (entry.departments?.[0]?.name || "").trim();
  const description = body
    ? dept
      ? `Department: ${dept}\n\n${body}`
      : body
    : null;
  // Top-level location is preferred; some boards leave it blank but populate
  // offices, so fall back to the office name/location.
  const location =
    (entry.location?.name || "").trim() ||
    (entry.offices?.[0]?.location || "").trim() ||
    (entry.offices?.[0]?.name || "").trim() ||
    null;
  const company = (entry.company_name || "").trim() || titleizeSlug(slug);
  const salary = findSalary(entry.metadata) ?? (body ? parseSalaryRange(body) : null);
  return {
    platform: "greenhouse",
    title,
    company,
    url,
    location,
    description,
    salary,
  };
}

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

function summarizeWarnings(warnings: { slug: string; reason: string }[]): string | undefined {
  if (warnings.length === 0) return undefined;
  const byReason = new Map<string, string[]>();
  for (const w of warnings) {
    const arr = byReason.get(w.reason) ?? [];
    arr.push(w.slug);
    byReason.set(w.reason, arr);
  }
  const parts: string[] = [];
  for (const [reason, slugs] of byReason) {
    const sample = slugs.slice(0, 3).join(", ");
    parts.push(`${slugs.length} ${reason}${slugs.length > 3 ? ` (first: ${sample})` : `: ${sample}`}`);
  }
  let out = parts.join("; ");
  if (out.length > MAX_WARNING_CHARS) out = out.slice(0, MAX_WARNING_CHARS - 1) + "…";
  return out;
}

type SlugResult = { jobs: GreenhouseJob[]; metaTotal: number; warning?: string };

async function fetchSlug(slug: string, parentSignal: AbortSignal | undefined): Promise<SlugResult> {
  const controller = new AbortController();
  const onParentAbort = () => controller.abort();
  if (parentSignal) {
    if (parentSignal.aborted) return { jobs: [], metaTotal: 0, warning: "aborted" };
    parentSignal.addEventListener("abort", onParentAbort, { once: true });
  }
  const timer = setTimeout(() => controller.abort(), PER_SLUG_TIMEOUT_MS);
  // Slugs are validated to /^[a-z0-9][a-z0-9-]{0,60}$/ and lowercased in
  // parseConfig, so no escaping is needed here.
  const url = `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": BROWSER_UA, Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    const body = await res.text();
    if (!res.ok) {
      const reason =
        res.status === 429
          ? "rate-limited"
          : res.status === 403 || res.status === 503
            ? "blocked (anti-bot / server IP)"
            : `HTTP ${res.status}`;
      return { jobs: [], metaTotal: 0, warning: reason };
    }
    // A 200 that is actually an anti-bot interstitial or maintenance page is not
    // JSON — classify it clearly instead of throwing on JSON.parse.
    if (CHALLENGE_RE.test(body.slice(0, 4000))) {
      return { jobs: [], metaTotal: 0, warning: "blocked (anti-bot challenge)" };
    }
    let data: GreenhouseResponse;
    try {
      data = JSON.parse(body) as GreenhouseResponse;
    } catch {
      return { jobs: [], metaTotal: 0, warning: "non-JSON response" };
    }
    return {
      jobs: Array.isArray(data.jobs) ? data.jobs : [],
      metaTotal: typeof data.meta?.total === "number" ? data.meta.total : 0,
    };
  } catch (err) {
    const msg = (err as Error).message || String(err);
    const reason = /abort/i.test(msg) ? "timed out" : `fetch error (${msg.slice(0, 60)})`;
    return { jobs: [], metaTotal: 0, warning: reason };
  } finally {
    clearTimeout(timer);
    if (parentSignal) parentSignal.removeEventListener("abort", onParentAbort);
  }
}

async function runWithConcurrency<T>(
  items: string[],
  worker: (item: string) => Promise<T>,
  concurrency: number,
  shouldStop: () => boolean,
): Promise<T[]> {
  const results: T[] = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      if (shouldStop()) return;
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await worker(items[i]);
    }
  });
  await Promise.all(runners);
  return results;
}

export const greenhouseFeed: Feed = {
  key: "greenhouse",
  label: "Greenhouse (multi-company)",
  fetch: async ({ maxJobs, searchUrl, signal }) => {
    const { slugs, filters } = parseConfig(searchUrl);
    if (slugs.length === 0) {
      return { jobs: [], warning: "no valid slugs after parsing search_url" };
    }

    // Per-company cap so one giant board (Stripe has 500+) doesn't starve the
    // others. The maxJobs budget is spread across configured companies, floor 5
    // so small boards still contribute meaningfully.
    const perCompany = Math.max(5, Math.ceil(maxJobs / Math.max(1, slugs.length)));
    const warnings: { slug: string; reason: string }[] = [];
    const now = Date.now();

    // Each worker fetches one board, applies the cheap filters, sorts the
    // survivors newest-first, truncates to the per-company cap, and builds the
    // full job (description/salary) only for those survivors. We stop dispatching
    // new boards once enough companies have returned jobs to fill maxJobs via the
    // round-robin below — so a 350-slug @curated scan with maxJobs=200 no longer
    // fetches every board only to discard most of them.
    let companiesWithJobs = 0;
    let stopEarly = false;

    const pools = await runWithConcurrency(
      slugs,
      async (slug): Promise<NormalizedJob[]> => {
        const { jobs: raw, metaTotal, warning } = await fetchSlug(slug, signal);
        if (warning) {
          warnings.push({ slug, reason: warning });
        } else if (raw.length === 0 && metaTotal > 0) {
          // The board reports jobs but the list came back empty — usually a
          // renamed/privated board. Surface it instead of failing silently.
          warnings.push({ slug, reason: "returned 0 of expected jobs" });
        }
        const built = raw
          .filter((e) => (e.title || "").trim() && (e.absolute_url || "").trim())
          .filter((e) => passesFilters(e, filters, now))
          .map((e) => ({ e, r: postedMs(e) ?? 0 }))
          .sort((a, b) => b.r - a.r)
          .slice(0, perCompany)
          .map(({ e }) => buildJob(e, slug));
        if (built.length > 0) {
          companiesWithJobs++;
          // Round-robin takes ≥1 job from each company, so maxJobs companies is
          // always enough to fill the budget.
          if (companiesWithJobs >= maxJobs) stopEarly = true;
        }
        return built;
      },
      MAX_CONCURRENT,
      () => stopEarly,
    );

    // Round-robin across companies (newest job from each first, then the second
    // newest from each, …) so the budget is spread fairly rather than drained by
    // the first few alphabetical slugs. Dedup the same posting surfaced under two
    // boards (parent brand + subsidiary) by URL.
    const jobs: NormalizedJob[] = [];
    const seenUrl = new Set<string>();
    const livePools = pools.filter((p): p is NormalizedJob[] => Array.isArray(p) && p.length > 0);
    for (let depth = 0; jobs.length < maxJobs; depth++) {
      let progressed = false;
      for (const pool of livePools) {
        const job = pool[depth];
        if (!job) continue;
        progressed = true;
        if (seenUrl.has(job.url)) continue;
        seenUrl.add(job.url);
        jobs.push(job);
        if (jobs.length >= maxJobs) break;
      }
      if (!progressed) break;
    }

    return {
      jobs,
      warning: summarizeWarnings(warnings),
    };
  },
};
