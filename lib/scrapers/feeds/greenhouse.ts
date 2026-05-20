import type { Feed, NormalizedJob } from "../types";
import { stripHtml } from "../rss";
import curatedSlugs from "./greenhouse-curated-slugs.json";

// Greenhouse exposes a fully public, no-auth jobs api per company board:
//   https://boards-api.greenhouse.io/v1/boards/{slug}/jobs?content=true
// The user supplies a comma-separated list of slugs in the search-url field.
type GreenhouseJob = {
  id: number;
  title: string;
  absolute_url: string;
  location?: { name?: string };
  content?: string;
  metadata?: Array<{ name: string; value?: string | null }>;
  company_name?: string;
};

type GreenhouseResponse = { jobs?: GreenhouseJob[] };

// Curated remote-tech defaults. Verified live on probe; the user can override
// or extend via the search-url field. The 353-slug `@curated` list lives in
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

function parseSlugs(searchUrl: string | undefined): string[] {
  if (!searchUrl || !searchUrl.trim()) return GREENHOUSE_DEFAULT_SLUGS;
  const tokens = searchUrl
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const t of tokens) {
    // `@curated` expands to the bundled live-only slug list pruned from the
    // awesome-easy-apply community index. Mixed use is allowed:
    // `@curated, mycompany` appends a custom slug to the curated set.
    if (/^@curated$/i.test(t)) {
      out.push(...(curatedSlugs as string[]));
      continue;
    }
    const m = t.match(/boards(?:-api)?\.greenhouse\.io\/(?:v\d+\/boards\/)?([^/?#]+)/i);
    const candidate = m ? m[1] : t;
    if (SLUG_PATTERN.test(candidate)) out.push(candidate.toLowerCase());
  }
  // de-dup while preserving order
  return Array.from(new Set(out));
}

function findSalary(meta?: GreenhouseJob["metadata"]): string | null {
  if (!Array.isArray(meta)) return null;
  const hit = meta.find((m) => /salary|compensation|pay/i.test(m?.name || ""));
  if (!hit) return null;
  const v = (hit.value || "").toString().trim();
  return v || null;
}

function summarizeWarnings(warnings: { slug: string; reason: string }[]): string | undefined {
  if (warnings.length === 0) return undefined;
  const byReason = new Map<string, string[]>();
  for (const w of warnings) {
    const k = w.reason;
    const arr = byReason.get(k) ?? [];
    arr.push(w.slug);
    byReason.set(k, arr);
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

async function fetchSlug(
  slug: string,
  parentSignal: AbortSignal | undefined,
): Promise<{ jobs: GreenhouseJob[]; warning?: string }> {
  const controller = new AbortController();
  const onParentAbort = () => controller.abort();
  if (parentSignal) {
    if (parentSignal.aborted) return { jobs: [], warning: "aborted" };
    parentSignal.addEventListener("abort", onParentAbort, { once: true });
  }
  const timer = setTimeout(() => controller.abort(), PER_SLUG_TIMEOUT_MS);
  const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(slug)}/jobs?content=true`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
        "Accept": "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) {
      return { jobs: [], warning: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as GreenhouseResponse;
    const list = Array.isArray(data.jobs) ? data.jobs : [];
    return { jobs: list };
  } catch (err) {
    const msg = (err as Error).message || String(err);
    const reason = /abort/i.test(msg) ? "timed out" : `fetch error (${msg.slice(0, 60)})`;
    return { jobs: [], warning: reason };
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
    const slugs = parseSlugs(searchUrl);
    if (slugs.length === 0) {
      return { jobs: [], warning: "no valid slugs after parsing search_url" };
    }

    // Per-company cap so one giant board (Stripe has 495+) doesn't starve the
    // others. Spread the maxJobs budget evenly across configured companies,
    // with a floor of 5 so small boards still contribute meaningfully.
    const perCompany = Math.max(5, Math.ceil(maxJobs / Math.max(1, slugs.length)));
    const warnings: { slug: string; reason: string }[] = [];
    const jobs: NormalizedJob[] = [];
    let stopEarly = false;

    const results = await runWithConcurrency(
      slugs,
      async (slug) => {
        const { jobs: raw, warning } = await fetchSlug(slug, signal);
        if (warning) warnings.push({ slug, reason: warning });
        return { slug, raw } as const;
      },
      MAX_CONCURRENT,
      () => stopEarly,
    );

    for (const r of results) {
      if (!r) continue;
      let takenFromThisCompany = 0;
      for (const entry of r.raw) {
        if (takenFromThisCompany >= perCompany) break;
        const title = (entry.title || "").trim();
        const u = (entry.absolute_url || "").trim();
        if (!title || !u) continue;
        jobs.push({
          platform: "greenhouse",
          title,
          company: (entry.company_name || r.slug).trim(),
          url: u,
          location: entry.location?.name || null,
          description: entry.content ? stripHtml(entry.content) : null,
          salary: findSalary(entry.metadata),
        });
        takenFromThisCompany++;
        if (jobs.length >= maxJobs) {
          stopEarly = true;
          break;
        }
      }
      if (jobs.length >= maxJobs) break;
    }

    return {
      jobs,
      warning: summarizeWarnings(warnings),
    };
  },
};
