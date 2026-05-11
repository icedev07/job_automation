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

// Verified working slugs (count of jobs returned at probe time) — picked for
// remote-friendly tech hiring. Keep this list short enough to fit one scan
// run inside Vercel's 60s budget; the user can override or extend via the
// search-url field. Companies confirmed live by direct API probe.
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

function parseSlugs(searchUrl: string | undefined): string[] {
  if (!searchUrl || !searchUrl.trim()) return GREENHOUSE_DEFAULT_SLUGS;
  const tokens = searchUrl
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const t of tokens) {
    // `@curated` expands to the bundled 540-slug list scraped from the
    // awesome-easy-apply community index. Mixed use is allowed:
    // `@curated, mycompany` appends a custom slug to the curated set.
    if (/^@curated$/i.test(t)) {
      out.push(...(curatedSlugs as string[]));
      continue;
    }
    const m = t.match(/boards(?:-api)?\.greenhouse\.io\/(?:v\d+\/boards\/)?([^/?#]+)/i);
    out.push(m ? m[1] : t);
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

export const greenhouseFeed: Feed = {
  key: "greenhouse",
  label: "Greenhouse (multi-company)",
  fetch: async ({ maxJobs, searchUrl, signal }) => {
    const slugs = parseSlugs(searchUrl);
    const jobs: NormalizedJob[] = [];
    const warnings: string[] = [];
    // Per-company cap so one giant board (Stripe has 495+) doesn't starve the
    // others. Spread the maxJobs budget evenly across configured companies,
    // with a floor of 5 so small boards still contribute meaningfully.
    const perCompany = Math.max(5, Math.ceil(maxJobs / Math.max(1, slugs.length)));
    for (const slug of slugs) {
      if (jobs.length >= maxJobs) break;
      const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(slug)}/jobs?content=true`;
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36",
            "Accept": "application/json",
          },
          signal,
          cache: "no-store",
        });
        if (!res.ok) {
          warnings.push(`${slug}: ${res.status}`);
          continue;
        }
        const data = (await res.json()) as GreenhouseResponse;
        const list = Array.isArray(data.jobs) ? data.jobs : [];
        let takenFromThisCompany = 0;
        for (const entry of list) {
          if (takenFromThisCompany >= perCompany) break;
          const title = (entry.title || "").trim();
          const u = (entry.absolute_url || "").trim();
          if (!title || !u) continue;
          jobs.push({
            platform: "greenhouse",
            title,
            company: (entry.company_name || slug).trim(),
            url: u,
            location: entry.location?.name || null,
            description: entry.content ? stripHtml(entry.content) : null,
            salary: findSalary(entry.metadata),
          });
          takenFromThisCompany++;
          if (jobs.length >= maxJobs) break;
        }
      } catch (err) {
        warnings.push(`${slug}: ${(err as Error).message}`);
      }
    }
    return {
      jobs,
      warning: warnings.length ? warnings.join("; ") : undefined,
    };
  },
};
