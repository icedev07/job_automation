import type { Feed, NormalizedJob } from "../types";
import { stripHtml } from "../rss";

// The Muse exposes a public, key-less JSON jobs API with real server-side
// category / location / level filters. It is paginated (?page=N, 0-indexed,
// 20 results/page). The user's "search URL" is either a full https url or a
// comma-separated list of "key=value" pairs; repeated keys accumulate, so
// "category=Software Engineering,category=Data Science,location=Berlin, Germany"
// maps to three query params. Filters narrow ~500k listings to the relevant
// slice, then the AI analyzer judges each one.
const THEMUSE_BASE = "https://www.themuse.com/api/public/jobs";
// Bound the work per scan; the scan's time budget (signal) is the primary stop.
const MAX_PAGES = 15;

type MuseRaw = {
  name?: string;
  contents?: string;
  company?: { name?: string };
  locations?: Array<{ name?: string }>;
  refs?: { landing_page?: string };
  levels?: Array<{ name?: string }>;
  publication_date?: string;
};

type MuseResponse = {
  results?: MuseRaw[];
  page?: number;
  page_count?: number;
};

function buildUrl(searchUrl: string | undefined, page: number): string {
  if (searchUrl && /^https?:/i.test(searchUrl.trim())) {
    const u = new URL(searchUrl.trim());
    u.searchParams.set("page", String(page));
    return u.toString();
  }
  const params = new URLSearchParams();
  if (searchUrl) {
    for (const pair of searchUrl.split(",").map((s) => s.trim()).filter(Boolean)) {
      const eq = pair.indexOf("=");
      if (eq <= 0) continue;
      const k = pair.slice(0, eq).trim();
      const v = pair.slice(eq + 1).trim();
      if (k && v) params.append(k, v); // append → repeated keys accumulate
    }
  }
  params.set("page", String(page));
  return `${THEMUSE_BASE}?${params.toString()}`;
}

function locationOf(entry: MuseRaw): string | null {
  const locs = (entry.locations ?? []).map((l) => l.name).filter(Boolean) as string[];
  return locs.length ? locs.join(" / ") : null;
}

export const theMuseFeed: Feed = {
  key: "themuse",
  label: "The Muse",
  fetch: async ({ maxJobs, searchUrl, signal }) => {
    const jobs: NormalizedJob[] = [];
    let pageCount = Infinity;

    for (let page = 0; page < MAX_PAGES && jobs.length < maxJobs && page < pageCount; page++) {
      if (signal?.aborted) break;
      const url = buildUrl(searchUrl, page);
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
          "Accept": "application/json",
        },
        signal,
        cache: "no-store",
      });
      if (!res.ok) {
        if (page === 0) throw new Error(`The Muse responded ${res.status}`);
        break;
      }
      const data = (await res.json()) as MuseResponse;
      const list = Array.isArray(data.results) ? data.results : [];
      if (typeof data.page_count === "number") pageCount = data.page_count;
      if (list.length === 0) break;

      for (const entry of list) {
        const title = (entry.name || "").trim();
        const company = (entry.company?.name || "").trim();
        const u = (entry.refs?.landing_page || "").trim();
        if (!title || !company || !u) continue;

        const description = stripHtml(entry.contents || "");
        const level = (entry.levels ?? []).map((l) => l.name).filter(Boolean).join(", ");
        const descWithLevel = level ? `${description}\n\nLevel: ${level}`.trim() : description;

        jobs.push({
          platform: "themuse",
          title,
          company,
          url: u,
          location: locationOf(entry),
          description: descWithLevel || null,
          salary: null,
        });
        if (jobs.length >= maxJobs) break;
      }
    }

    return { jobs };
  },
};
