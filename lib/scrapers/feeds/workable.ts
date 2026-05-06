import type { Feed, NormalizedJob } from "../types";
import { stripHtml } from "../rss";

// Workable v3 public api: https://apply.workable.com/api/v3/accounts/{slug}/jobs
// Comma-separated company slugs in the search-url field.
type WorkableJob = {
  shortcode?: string;
  title?: string;
  url?: string;
  application_url?: string;
  full_title?: string;
  shortlink?: string;
  city?: string;
  country?: string;
  remote?: boolean;
  description?: string;
  requirements?: string;
  benefits?: string;
};

type WorkableResponse = { results?: WorkableJob[] };

function parseSlugs(searchUrl: string | undefined): string[] {
  if (!searchUrl) return [];
  return searchUrl
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = s.match(/(?:apply\.)?workable\.com\/(?:api\/v\d+\/accounts\/)?([^/?#]+)/i);
      return m ? m[1] : s;
    });
}

function joinDescription(j: WorkableJob): string {
  const blocks = [j.description, j.requirements, j.benefits]
    .filter((s): s is string => Boolean(s))
    .map((s) => stripHtml(s).trim())
    .filter(Boolean);
  return blocks.join("\n\n");
}

function locationOf(j: WorkableJob): string | null {
  if (j.remote) return "Remote";
  const parts = [j.city, j.country].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

export const workableFeed: Feed = {
  key: "workable",
  label: "Workable (multi-company)",
  fetch: async ({ maxJobs, searchUrl, signal }) => {
    const slugs = parseSlugs(searchUrl);
    if (slugs.length === 0) {
      return {
        jobs: [],
        warning:
          "no workable company slugs configured — paste a comma-separated list (e.g. canva,gitlab,n26) in the search url field.",
      };
    }
    const jobs: NormalizedJob[] = [];
    const warnings: string[] = [];
    for (const slug of slugs) {
      if (jobs.length >= maxJobs) break;
      const url = `https://apply.workable.com/api/v3/accounts/${encodeURIComponent(slug)}/jobs`;
      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "JobFinderBot/1.0", "Accept": "application/json" },
          signal,
          cache: "no-store",
        });
        if (!res.ok) {
          warnings.push(`${slug}: ${res.status}`);
          continue;
        }
        const data = (await res.json()) as WorkableResponse;
        const list = Array.isArray(data.results) ? data.results : [];
        for (const j of list) {
          const title = (j.title || j.full_title || "").trim();
          const u = (j.url || j.shortlink || "").trim();
          if (!title || !u) continue;
          jobs.push({
            platform: "workable",
            title,
            company: slug,
            url: u,
            applyUrl: j.application_url || null,
            location: locationOf(j),
            description: joinDescription(j) || null,
            salary: null,
          });
          if (jobs.length >= maxJobs) break;
        }
      } catch (err) {
        warnings.push(`${slug}: ${(err as Error).message}`);
      }
    }
    return { jobs, warning: warnings.length ? warnings.join("; ") : undefined };
  },
};
