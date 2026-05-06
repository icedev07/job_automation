import type { Feed, NormalizedJob } from "../types";
import { stripHtml } from "../rss";

// Remotive publishes a free JSON endpoint covering hundreds of companies.
// Filters: category=software-dev, search=react, etc. The user's search-url
// can be a full URL or a comma-separated `key=value` list.
const REMOTIVE_BASE = "https://remotive.com/api/remote-jobs";

type RemotiveRaw = {
  id?: string | number;
  url?: string;
  title?: string;
  company_name?: string;
  category?: string;
  job_type?: string;
  candidate_required_location?: string;
  salary?: string;
  description?: string;
  publication_date?: string;
};

type RemotiveResponse = { jobs?: RemotiveRaw[] };

function buildUrl(searchUrl: string | undefined, count: number): string {
  if (searchUrl && /^https?:/i.test(searchUrl.trim())) {
    const u = new URL(searchUrl.trim());
    if (!u.searchParams.has("limit")) u.searchParams.set("limit", String(count));
    return u.toString();
  }
  const params = new URLSearchParams();
  if (searchUrl) {
    for (const pair of searchUrl.split(",").map((s) => s.trim()).filter(Boolean)) {
      const [k, v] = pair.split("=").map((s) => s?.trim());
      if (k && v) params.set(k, v);
    }
  }
  if (!params.has("limit")) params.set("limit", String(count));
  if (!params.has("category")) params.set("category", "software-dev");
  return `${REMOTIVE_BASE}?${params.toString()}`;
}

export const remotiveFeed: Feed = {
  key: "remotive",
  label: "Remotive",
  fetch: async ({ maxJobs, searchUrl, signal }) => {
    const url = buildUrl(searchUrl, Math.min(200, Math.max(1, maxJobs)));
    const res = await fetch(url, {
      headers: {
        "User-Agent": "JobFinderBot/1.0 (+https://github.com/job-automation)",
        "Accept": "application/json",
      },
      signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Remotive responded ${res.status}`);
    const data = (await res.json()) as RemotiveResponse;
    const list = Array.isArray(data.jobs) ? data.jobs : [];

    const jobs: NormalizedJob[] = [];
    for (const entry of list) {
      const title = (entry.title || "").trim();
      const company = (entry.company_name || "").trim();
      const u = (entry.url || "").trim();
      if (!title || !company || !u) continue;
      jobs.push({
        platform: "remotive",
        title,
        company,
        url: u,
        location: entry.candidate_required_location || "Remote",
        description: stripHtml(entry.description || "") || null,
        salary: entry.salary || null,
      });
      if (jobs.length >= maxJobs) break;
    }

    return { jobs };
  },
};
