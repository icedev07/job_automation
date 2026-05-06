import type { Feed, NormalizedJob } from "../types";
import { stripHtml } from "../rss";

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

function parseSlugs(searchUrl: string | undefined): string[] {
  if (!searchUrl) return [];
  return searchUrl
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      // accept full board url or bare slug
      const m = s.match(/boards(?:-api)?\.greenhouse\.io\/(?:v\d+\/boards\/)?([^/?#]+)/i);
      return m ? m[1] : s;
    });
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
    if (slugs.length === 0) {
      return {
        jobs: [],
        warning:
          "no greenhouse company slugs configured — paste a comma-separated list (e.g. stripe,vercel,airbnb) in the search url field.",
      };
    }
    const jobs: NormalizedJob[] = [];
    const warnings: string[] = [];
    for (const slug of slugs) {
      if (jobs.length >= maxJobs) break;
      const url = `https://boards-api.greenhouse.io/v1/boards/${encodeURIComponent(slug)}/jobs?content=true`;
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "JobFinderBot/1.0",
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
        for (const entry of list) {
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
