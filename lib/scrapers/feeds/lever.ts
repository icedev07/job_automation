import type { Feed, NormalizedJob } from "../types";
import { stripHtml } from "../rss";

// Lever postings api: https://api.lever.co/v0/postings/{slug}?mode=json
// Public, no auth. The user supplies a comma-separated list of slugs.
type LeverPosting = {
  id?: string;
  text?: string;
  hostedUrl?: string;
  applyUrl?: string;
  categories?: { team?: string; location?: string; commitment?: string };
  description?: string;
  descriptionPlain?: string;
  lists?: Array<{ text?: string; content?: string }>;
};

function parseSlugs(searchUrl: string | undefined): string[] {
  if (!searchUrl) return [];
  return searchUrl
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = s.match(/(?:api\.)?lever\.co\/(?:v\d+\/postings\/)?([^/?#]+)/i);
      return m ? m[1] : s;
    });
}

function buildDescription(posting: LeverPosting): string {
  const parts: string[] = [];
  if (posting.descriptionPlain) {
    parts.push(posting.descriptionPlain);
  } else if (posting.description) {
    parts.push(stripHtml(posting.description));
  }
  if (Array.isArray(posting.lists)) {
    for (const block of posting.lists) {
      if (block.text) parts.push(`\n${block.text}`);
      if (block.content) parts.push(stripHtml(block.content));
    }
  }
  return parts.join("\n").trim();
}

export const leverFeed: Feed = {
  key: "lever",
  label: "Lever (multi-company)",
  fetch: async ({ maxJobs, searchUrl, signal }) => {
    const slugs = parseSlugs(searchUrl);
    if (slugs.length === 0) {
      return {
        jobs: [],
        warning:
          "no lever company slugs configured — paste a comma-separated list (e.g. netflix,palantir,figma) in the search url field.",
      };
    }
    const jobs: NormalizedJob[] = [];
    const warnings: string[] = [];
    for (const slug of slugs) {
      if (jobs.length >= maxJobs) break;
      const url = `https://api.lever.co/v0/postings/${encodeURIComponent(slug)}?mode=json`;
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
        const list = (await res.json()) as LeverPosting[];
        if (!Array.isArray(list)) continue;
        for (const posting of list) {
          const title = (posting.text || "").trim();
          const u = (posting.hostedUrl || posting.applyUrl || "").trim();
          if (!title || !u) continue;
          jobs.push({
            platform: "lever",
            title,
            company: slug,
            url: u,
            applyUrl: posting.applyUrl || null,
            location: posting.categories?.location || null,
            description: buildDescription(posting) || null,
            salary: null,
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
