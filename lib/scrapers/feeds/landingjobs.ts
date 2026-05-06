import type { Feed, NormalizedJob } from "../types";
import { stripHtml } from "../rss";

// Landing.Jobs public api. Skews EU/dev-heavy, which fits the Armenia → Europe
// target. We default to remote-friendly listings when no filter is supplied.
const LANDING_JOBS_BASE = "https://landing.jobs/api/v1/jobs";

type LandingJobsRaw = {
  id?: number | string;
  title?: string;
  short_description?: string;
  description?: string;
  url?: string;
  company_name?: string;
  city_name?: string;
  country_name?: string;
  location?: string;
  remote?: boolean;
  is_remote?: boolean;
  salary?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
};

type LandingJobsResponse = { jobs?: LandingJobsRaw[] } | LandingJobsRaw[];

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
  return `${LANDING_JOBS_BASE}?${params.toString()}`;
}

function formatSalary(j: LandingJobsRaw): string | null {
  if (j.salary && typeof j.salary === "string") return j.salary;
  const cur = j.salary_currency || "";
  if (j.salary_min && j.salary_max && j.salary_min !== j.salary_max) {
    return `${cur ? cur + " " : ""}${j.salary_min.toLocaleString()} – ${j.salary_max.toLocaleString()}`;
  }
  const single = j.salary_min || j.salary_max;
  if (single) return `${cur ? cur + " " : ""}${single.toLocaleString()}`;
  return null;
}

function locationOf(j: LandingJobsRaw): string | null {
  if (j.is_remote || j.remote) return "Remote";
  if (j.location) return j.location;
  const parts = [j.city_name, j.country_name].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

export const landingJobsFeed: Feed = {
  key: "landingjobs",
  label: "Landing.Jobs",
  fetch: async ({ maxJobs, searchUrl, signal }) => {
    const url = buildUrl(searchUrl, Math.min(200, Math.max(1, maxJobs)));
    const res = await fetch(url, {
      headers: { "User-Agent": "JobFinderBot/1.0", "Accept": "application/json" },
      signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Landing.Jobs responded ${res.status}`);
    const data = (await res.json()) as LandingJobsResponse;
    const list: LandingJobsRaw[] = Array.isArray(data) ? data : Array.isArray(data.jobs) ? data.jobs : [];

    const jobs: NormalizedJob[] = [];
    for (const entry of list) {
      const title = (entry.title || "").trim();
      const company = (entry.company_name || "").trim();
      const u = (entry.url || "").trim();
      if (!title || !company || !u) continue;
      const description = entry.description
        ? stripHtml(entry.description)
        : entry.short_description
        ? stripHtml(entry.short_description)
        : "";
      jobs.push({
        platform: "landingjobs",
        title,
        company,
        url: u,
        location: locationOf(entry),
        description: description || null,
        salary: formatSalary(entry),
      });
      if (jobs.length >= maxJobs) break;
    }

    return { jobs };
  },
};
