import type { Feed, NormalizedJob } from "../types";
import { stripHtml } from "../rss";

// Jobicy publishes a documented JSON v2 endpoint. Filters can be passed via
// query string; we support the common ones (count, geo, industry, tag).
// The user's "search URL" can be either a full https URL (we honor its query
// string) or a comma-separated list of "key=value" pairs.
const JOBICY_BASE = "https://jobicy.com/api/v2/remote-jobs";

type JobicyRaw = {
  id?: string | number;
  url?: string;
  jobTitle?: string;
  companyName?: string;
  companyLogo?: string;
  jobIndustry?: string | string[];
  jobType?: string | string[];
  jobGeo?: string;
  jobLevel?: string;
  jobExcerpt?: string;
  jobDescription?: string;
  pubDate?: string;
  annualSalaryMin?: string | number;
  annualSalaryMax?: string | number;
  salaryCurrency?: string;
};

type JobicyResponse = { jobs?: JobicyRaw[] };

function buildUrl(searchUrl: string | undefined, count: number): string {
  if (searchUrl && /^https?:/i.test(searchUrl.trim())) {
    const u = new URL(searchUrl.trim());
    if (!u.searchParams.has("count")) u.searchParams.set("count", String(count));
    return u.toString();
  }
  const params = new URLSearchParams();
  if (searchUrl) {
    for (const pair of searchUrl.split(",").map((s) => s.trim()).filter(Boolean)) {
      const [k, v] = pair.split("=").map((s) => s?.trim());
      if (k && v) params.set(k, v);
    }
  }
  if (!params.has("count")) params.set("count", String(count));
  return `${JOBICY_BASE}?${params.toString()}`;
}

function formatSalary(min?: string | number, max?: string | number, currency?: string): string | null {
  const minN = Number(min);
  const maxN = Number(max);
  const cur = (currency || "").trim();
  if (!minN && !maxN) return null;
  if (minN && maxN && minN !== maxN) {
    return `${cur ? cur + " " : ""}${minN.toLocaleString()} – ${maxN.toLocaleString()}`;
  }
  const single = minN || maxN;
  if (!single) return null;
  return `${cur ? cur + " " : ""}${single.toLocaleString()}`;
}

export const jobicyFeed: Feed = {
  key: "jobicy",
  label: "Jobicy",
  fetch: async ({ maxJobs, searchUrl, signal }) => {
    const url = buildUrl(searchUrl, Math.min(50, Math.max(1, maxJobs)));
    const res = await fetch(url, {
      headers: {
        "User-Agent": "JobFinderBot/1.0 (+https://github.com/job-automation)",
        "Accept": "application/json",
      },
      signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Jobicy responded ${res.status}`);
    const data = (await res.json()) as JobicyResponse;
    const list = Array.isArray(data.jobs) ? data.jobs : [];

    const jobs: NormalizedJob[] = [];
    for (const entry of list) {
      const title = (entry.jobTitle || "").trim();
      const company = (entry.companyName || "").trim();
      const url = (entry.url || "").trim();
      if (!title || !company || !url) continue;
      const description = stripHtml(entry.jobDescription || entry.jobExcerpt || "");
      jobs.push({
        platform: "jobicy",
        title,
        company,
        url,
        location: entry.jobGeo || "Remote",
        description: description || null,
        salary: formatSalary(entry.annualSalaryMin, entry.annualSalaryMax, entry.salaryCurrency),
      });
      if (jobs.length >= maxJobs) break;
    }

    return { jobs };
  },
};
