import type { Feed, NormalizedJob } from "../types";
import { parseRss, stripHtml } from "../rss";

// We Work Remotely exposes per-category RSS feeds. We default to the
// programming category since that matches the user's target market.
// Multiple categories can be supplied via the search URL (comma-separated)
// in case the user wants to widen the net.
const DEFAULT_CATEGORIES = ["remote-programming-jobs", "remote-full-stack-programming-jobs"];

function categoriesFromUrl(searchUrl: string | undefined): string[] {
  if (!searchUrl) return DEFAULT_CATEGORIES;
  const trimmed = searchUrl.trim();
  if (!trimmed) return DEFAULT_CATEGORIES;
  // Accept either a comma-separated slug list or a full URL like
  // https://weworkremotely.com/categories/remote-programming-jobs
  if (/^https?:/i.test(trimmed)) {
    const m = trimmed.match(/categories\/([^/?#]+)/);
    if (m) return [m[1]];
  }
  return trimmed
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitTitle(rawTitle: string): { company: string; title: string } {
  // WWR titles look like "Company Name: Senior Backend Engineer".
  const idx = rawTitle.indexOf(":");
  if (idx === -1) return { company: "Unknown", title: rawTitle.trim() };
  return {
    company: rawTitle.slice(0, idx).trim() || "Unknown",
    title: rawTitle.slice(idx + 1).trim() || rawTitle.trim(),
  };
}

export const weWorkRemotelyFeed: Feed = {
  key: "weworkremotely",
  label: "We Work Remotely",
  fetch: async ({ maxJobs, searchUrl, signal }) => {
    const categories = categoriesFromUrl(searchUrl);
    const jobs: NormalizedJob[] = [];
    const warnings: string[] = [];

    for (const cat of categories) {
      if (jobs.length >= maxJobs) break;
      const url = `https://weworkremotely.com/categories/${encodeURIComponent(cat)}.rss`;
      try {
        const res = await fetch(url, {
          headers: {
            "User-Agent": "JobFinderBot/1.0 (+https://github.com/job-automation)",
            "Accept": "application/rss+xml, application/xml, text/xml",
          },
          signal,
          cache: "no-store",
        });
        if (!res.ok) {
          warnings.push(`WWR ${cat} responded ${res.status}`);
          continue;
        }
        const xml = await res.text();
        const items = parseRss(xml);
        for (const it of items) {
          const { company, title } = splitTitle(it.title);
          const description = stripHtml(it.contentEncoded || it.description || "");
          jobs.push({
            platform: "weworkremotely",
            title,
            company,
            url: it.link,
            location: "Remote",
            description: description || null,
            salary: null,
          });
          if (jobs.length >= maxJobs) break;
        }
      } catch (err) {
        warnings.push(`WWR ${cat}: ${(err as Error).message}`);
      }
    }

    return {
      jobs,
      warning: warnings.length ? warnings.join("; ") : undefined,
    };
  },
};
