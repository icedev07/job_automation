import type { Feed, NormalizedJob } from "../types";
import { stripHtml } from "../rss";

// MyGreenhouse is the candidate-side aggregator portal (my.greenhouse.io) that
// surfaces jobs from every employer who opted into MyGreenhouse. It has no
// public api — the candidate UI calls /jobs.json behind a Rails passwordless
// session. We replicate that by sending the user's pasted session cookie
// verbatim. The cookie lives ~14 days, after which the user re-pastes.
//
// Required config keys:
//   mygreenhouse_session_cookie  Full Cookie header value as copied from
//                                browser DevTools (Application → Cookies on
//                                my.greenhouse.io). MUST include _session_id;
//                                MYGREENHOUSE-XSRF-TOKEN is also recommended.
// Optional config keys:
//   mygreenhouse_xsrf_token      Value of the MYGREENHOUSE-XSRF-TOKEN cookie,
//                                sent as an X-CSRF-Token header. Most GETs do
//                                not require it but Rails apps occasionally do.

const MYGH_BASE = "https://my.greenhouse.io";
const JOBS_JSON = `${MYGH_BASE}/jobs.json`;
const MAX_PAGES = 25;

type MyGhJobRaw = Record<string, unknown> & {
  id?: number | string;
  title?: string;
  name?: string;
  company?: string;
  company_name?: string;
  employer_name?: string;
  employer?: { name?: string } | string;
  location?: string | { name?: string };
  locations?: Array<{ name?: string } | string>;
  url?: string;
  absolute_url?: string;
  href?: string;
  apply_url?: string;
  description?: string;
  content?: string;
  updated_at?: string;
  posted_at?: string;
  created_at?: string;
};

function extractString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (value && typeof value === "object" && "name" in (value as any)) {
    const n = (value as { name?: unknown }).name;
    if (typeof n === "string") return n.trim();
  }
  return "";
}

function extractLocation(entry: MyGhJobRaw): string | null {
  const single = extractString(entry.location);
  if (single) return single;
  if (Array.isArray(entry.locations) && entry.locations.length) {
    const parts = entry.locations.map(extractString).filter(Boolean);
    if (parts.length) return parts.join(", ");
  }
  return null;
}

function extractCompany(entry: MyGhJobRaw): string {
  const candidates = [entry.company_name, entry.company, entry.employer_name];
  for (const c of candidates) {
    const v = extractString(c);
    if (v) return v;
  }
  const emp = extractString(entry.employer);
  return emp || "Unknown";
}

function extractUrl(entry: MyGhJobRaw): { url: string; applyUrl?: string } {
  const url = extractString(entry.absolute_url) || extractString(entry.url) || extractString(entry.href);
  const applyUrl = extractString(entry.apply_url);
  return { url, applyUrl: applyUrl || undefined };
}

function pickJobsArray(payload: unknown): MyGhJobRaw[] {
  if (Array.isArray(payload)) return payload as MyGhJobRaw[];
  if (payload && typeof payload === "object") {
    for (const key of ["jobs", "data", "results", "items", "postings"]) {
      const v = (payload as Record<string, unknown>)[key];
      if (Array.isArray(v)) return v as MyGhJobRaw[];
    }
  }
  return [];
}

function pickNextCursor(payload: unknown, jobs: MyGhJobRaw[]): string | null {
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    for (const key of ["next_search_after", "search_after", "next_cursor", "next"]) {
      const v = obj[key];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    const meta = obj.meta as Record<string, unknown> | undefined;
    if (meta) {
      for (const key of ["next_search_after", "search_after", "next_cursor", "next"]) {
        const v = meta[key];
        if (typeof v === "string" && v.trim()) return v.trim();
      }
    }
  }
  // Fallback: derive next cursor from the last job's timestamp, matching the
  // search_after pattern in the UI URL the user shared.
  const last = jobs[jobs.length - 1];
  if (last) {
    for (const key of ["updated_at", "posted_at", "created_at"]) {
      const v = (last as Record<string, unknown>)[key];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return null;
}

function buildPageUrl(baseUrl: string, searchAfter: string | null): string {
  const u = new URL(baseUrl);
  if (searchAfter) u.searchParams.set("search_after", searchAfter);
  return u.toString();
}

function looksLikeSignInRedirect(res: Response, body: string): boolean {
  if (res.status === 401) return true;
  if (res.redirected && /\/users\/sign_in/i.test(res.url)) return true;
  if (res.status === 406 && body.length === 0) return true;
  if (/sign[_ ]in/i.test(body) && body.length < 4000) return true;
  return false;
}

export const myGreenhouseFeed: Feed = {
  key: "mygreenhouse",
  label: "MyGreenhouse (authenticated)",
  fetch: async ({ maxJobs, searchUrl, signal, config }) => {
    const cookie = (config?.mygreenhouse_session_cookie || "").trim();
    if (!cookie) {
      return {
        jobs: [],
        warning: "session cookie not configured — paste from browser DevTools (Application → Cookies on my.greenhouse.io)",
      };
    }
    const xsrf = (config?.mygreenhouse_xsrf_token || "").trim();
    const baseUrl = (searchUrl || "").trim().startsWith("http")
      ? (searchUrl as string).trim()
      : JOBS_JSON;

    const jobs: NormalizedJob[] = [];
    const seen = new Set<string>();
    let cursor: string | null = null;
    let warning: string | undefined;

    for (let page = 0; page < MAX_PAGES; page++) {
      const url = buildPageUrl(baseUrl, page === 0 ? null : cursor);
      const headers: Record<string, string> = {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": `${MYGH_BASE}/jobs`,
        "Cookie": cookie,
      };
      if (xsrf) headers["X-CSRF-Token"] = xsrf;

      const res = await fetch(url, { headers, signal, redirect: "manual", cache: "no-store" });
      const body = await res.text();

      if (looksLikeSignInRedirect(res, body)) {
        warning = "session expired — sign in again at my.greenhouse.io and paste the fresh cookie";
        break;
      }
      if (!res.ok && res.status !== 200) {
        warning = `MyGreenhouse responded ${res.status}`;
        break;
      }

      let payload: unknown;
      try {
        payload = JSON.parse(body);
      } catch {
        warning = "response was not JSON (the page layout may have changed)";
        break;
      }

      const list = pickJobsArray(payload);
      if (list.length === 0) break;

      let addedThisPage = 0;
      for (const entry of list) {
        const title = extractString(entry.title) || extractString(entry.name);
        const { url: jobUrl, applyUrl } = extractUrl(entry);
        if (!title || !jobUrl) continue;
        if (seen.has(jobUrl)) continue;
        seen.add(jobUrl);
        const description = entry.description ?? entry.content ?? "";
        jobs.push({
          platform: "mygreenhouse",
          title,
          company: extractCompany(entry),
          url: jobUrl,
          applyUrl: applyUrl,
          location: extractLocation(entry),
          description: typeof description === "string" && description ? stripHtml(description) : null,
          salary: null,
        });
        addedThisPage++;
        if (jobs.length >= maxJobs) break;
      }

      if (jobs.length >= maxJobs) break;
      const next = pickNextCursor(payload, list);
      if (!next || next === cursor) break;
      cursor = next;
      if (addedThisPage === 0) break;
    }

    return { jobs, warning };
  },
};
