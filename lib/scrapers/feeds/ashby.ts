import type { Feed, NormalizedJob } from "../types";
import { stripHtml } from "../rss";

// Ashby public posting api: https://api.ashbyhq.com/posting-api/job-board/{slug}
// Comma-separated company slugs in the search-url field.
type AshbyJob = {
  id?: string;
  title?: string;
  jobUrl?: string;
  applyUrl?: string;
  location?: string;
  isRemote?: boolean;
  descriptionHtml?: string;
  descriptionPlain?: string;
  department?: string;
  team?: string;
  employmentType?: string;
  compensation?: { compensationTierSummary?: string };
};

type AshbyResponse = { jobs?: AshbyJob[] };

function parseSlugs(searchUrl: string | undefined): string[] {
  if (!searchUrl) return [];
  return searchUrl
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = s.match(/(?:api\.)?ashbyhq\.com\/(?:posting-api\/job-board\/)?([^/?#]+)/i);
      return m ? m[1] : s;
    });
}

export const ashbyFeed: Feed = {
  key: "ashby",
  label: "Ashby (multi-company)",
  fetch: async ({ maxJobs, searchUrl, signal }) => {
    const slugs = parseSlugs(searchUrl);
    if (slugs.length === 0) {
      return {
        jobs: [],
        warning:
          "no ashby company slugs configured — paste a comma-separated list (e.g. ramp,ashbyhq) in the search url field.",
      };
    }
    const jobs: NormalizedJob[] = [];
    const warnings: string[] = [];
    for (const slug of slugs) {
      if (jobs.length >= maxJobs) break;
      const url = `https://api.ashbyhq.com/posting-api/job-board/${encodeURIComponent(slug)}?includeCompensation=true`;
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
        const data = (await res.json()) as AshbyResponse;
        const list = Array.isArray(data.jobs) ? data.jobs : [];
        for (const j of list) {
          const title = (j.title || "").trim();
          const u = (j.jobUrl || j.applyUrl || "").trim();
          if (!title || !u) continue;
          const description = j.descriptionPlain || stripHtml(j.descriptionHtml || "");
          jobs.push({
            platform: "ashby",
            title,
            company: slug,
            url: u,
            applyUrl: j.applyUrl || null,
            location: j.isRemote ? "Remote" : j.location || null,
            description: description || null,
            salary: j.compensation?.compensationTierSummary || null,
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
