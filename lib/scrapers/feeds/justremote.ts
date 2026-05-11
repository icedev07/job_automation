import type { Feed, NormalizedJob } from "../types";

// JustRemote is a React SPA with no documented public API. The server still
// embeds the first page of listings in a `window.__PRELOADED_STATE__` blob
// for SSR/SEO, which we parse to obtain ~10 jobs per request without any
// authentication or captcha. The user's `search_url` selects the listing
// page (e.g. "remote-developer-jobs", "remote-design-jobs"); the default
// is the developer board.
const JUSTREMOTE_BASE = "https://justremote.co";
const DEFAULT_PATH = "/remote-developer-jobs";

type JustRemoteRaw = {
  id?: number | string;
  title?: string;
  company_name?: string;
  job_type?: string;
  category?: string;
  href?: string;
  remote_type?: string;
  job_country?: string | null;
  date?: string;
  is_active?: boolean;
};

function resolvePath(searchUrl: string | undefined): string {
  const raw = (searchUrl || "").trim();
  if (!raw) return DEFAULT_PATH;
  if (/^https?:/i.test(raw)) {
    try {
      const u = new URL(raw);
      return u.pathname || DEFAULT_PATH;
    } catch {
      return DEFAULT_PATH;
    }
  }
  return raw.startsWith("/") ? raw : `/${raw}`;
}

// Extract the balanced JSON object that follows
// `window.__PRELOADED_STATE__ =` in the served HTML. Returns null if the
// blob is missing or unparseable.
function extractPreloadedState(html: string): any | null {
  const marker = "window.__PRELOADED_STATE__";
  const i = html.indexOf(marker);
  if (i < 0) return null;
  const eq = html.indexOf("=", i + marker.length);
  if (eq < 0) return null;
  const start = html.indexOf("{", eq);
  if (start < 0) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  let end = -1;
  for (let j = start; j < html.length; j++) {
    const c = html[j];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
    } else if (c === '"') {
      inStr = true;
    } else if (c === "{") {
      depth++;
    } else if (c === "}") {
      depth--;
      if (depth === 0) {
        end = j + 1;
        break;
      }
    }
  }
  if (end < 0) return null;
  try {
    return JSON.parse(html.slice(start, end));
  } catch {
    return null;
  }
}

function absoluteHref(href: string): string {
  if (!href) return "";
  if (/^https?:/i.test(href)) return href;
  return `${JUSTREMOTE_BASE}/${href.replace(/^\/+/, "")}`;
}

function locationOf(entry: JustRemoteRaw): string | null {
  const parts: string[] = [];
  if (entry.remote_type) parts.push(entry.remote_type);
  if (entry.job_country) parts.push(entry.job_country);
  return parts.length ? parts.join(" · ") : "Remote";
}

export const justRemoteFeed: Feed = {
  key: "justremote",
  label: "JustRemote",
  fetch: async ({ maxJobs, searchUrl, signal }) => {
    const url = `${JUSTREMOTE_BASE}${resolvePath(searchUrl)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`JustRemote responded ${res.status}`);
    const html = await res.text();
    const state = extractPreloadedState(html);
    const raw: JustRemoteRaw[] = Array.isArray(state?.homeJobsState?.entity?.jobs)
      ? state.homeJobsState.entity.jobs
      : [];

    const jobs: NormalizedJob[] = [];
    for (const entry of raw) {
      if (entry.is_active === false) continue;
      const title = (entry.title || "").trim();
      const company = (entry.company_name || "").trim();
      const href = absoluteHref((entry.href || "").trim());
      if (!title || !company || !href) continue;
      jobs.push({
        platform: "justremote",
        title,
        company,
        url: href,
        location: locationOf(entry),
        description: null,
        salary: null,
      });
      if (jobs.length >= maxJobs) break;
    }

    const warning = jobs.length === 0 && !state
      ? "JustRemote SSR payload missing — page layout may have changed"
      : undefined;

    return { jobs, warning };
  },
};
