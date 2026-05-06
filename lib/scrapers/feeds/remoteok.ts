import type { Feed, NormalizedJob } from "../types";
import { stripHtml } from "../rss";

// RemoteOK exposes a single public JSON endpoint. The first array element is
// metadata ("legal" notice + last refresh) and must be discarded.
const REMOTEOK_URL = "https://remoteok.com/api";

type RemoteOkRaw = {
  id?: string | number;
  slug?: string;
  position?: string;
  company?: string;
  description?: string;
  tags?: string[];
  location?: string;
  url?: string;
  apply_url?: string;
  date?: string;
  salary_min?: number;
  salary_max?: number;
  // metadata row
  legal?: string;
};

function formatSalary(min?: number, max?: number): string | null {
  if (!min && !max) return null;
  if (min && max && min !== max) return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
  const single = min || max || 0;
  if (!single) return null;
  return `$${single.toLocaleString()}`;
}

export const remoteOkFeed: Feed = {
  key: "remoteok",
  label: "RemoteOK",
  fetch: async ({ maxJobs, signal }) => {
    const res = await fetch(REMOTEOK_URL, {
      headers: {
        "User-Agent": "JobFinderBot/1.0 (+https://github.com/job-automation)",
        "Accept": "application/json",
      },
      signal,
      // Bypass any caching at the edge
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`RemoteOK responded ${res.status}`);
    const raw = (await res.json()) as RemoteOkRaw[];
    if (!Array.isArray(raw)) throw new Error("RemoteOK response was not an array");

    const jobs: NormalizedJob[] = [];
    for (const entry of raw) {
      if (entry.legal) continue; // metadata row
      const title = (entry.position || "").trim();
      const company = (entry.company || "").trim();
      const url = (entry.url || "").trim();
      if (!title || !company || !url) continue;

      const descriptionHtml = entry.description || "";
      const description = stripHtml(descriptionHtml);
      const tagList = Array.isArray(entry.tags) ? entry.tags.filter(Boolean) : [];
      const descriptionWithTags = tagList.length
        ? `${description}\n\nTags: ${tagList.join(", ")}`.trim()
        : description;

      jobs.push({
        platform: "remoteok",
        title,
        company,
        url,
        applyUrl: entry.apply_url || undefined,
        location: entry.location || "Remote",
        description: descriptionWithTags || null,
        salary: formatSalary(entry.salary_min, entry.salary_max),
      });

      if (jobs.length >= maxJobs) break;
    }

    return { jobs };
  },
};
