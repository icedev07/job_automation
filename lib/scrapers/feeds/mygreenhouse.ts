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
//                                MYGREENHOUSE-XSRF-TOKEN is auto-extracted from
//                                this string when present.
// Optional config keys:
//   mygreenhouse_xsrf_token      Decoded value of the MYGREENHOUSE-XSRF-TOKEN
//                                cookie. Optional override — when blank the
//                                feed extracts and URL-decodes it from the
//                                cookie string above. Sent as X-CSRF-Token.

const MYGH_BASE = "https://my.greenhouse.io";
const JOBS_JSON = `${MYGH_BASE}/jobs.json`;
const MAX_PAGES = 25;
const PER_REQUEST_TIMEOUT_MS = 12_000;

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

// Parse "k1=v1; k2=v2" cookie header into a plain map. Values are returned
// verbatim — URL-decoding is left to the caller because the X-CSRF-Token
// header requires the decoded form but the Cookie header requires the raw form.
function parseCookieHeader(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const piece of raw.split(/;\s*/)) {
    if (!piece) continue;
    const idx = piece.indexOf("=");
    if (idx <= 0) continue;
    const name = piece.slice(0, idx).trim();
    const value = piece.slice(idx + 1).trim();
    if (name) out[name] = value;
  }
  return out;
}

function safeUrlDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// Pull the XSRF token out of the cookie header if the user did not supply it
// separately, and URL-decode it (Rails stores `+/=` as `%2B%2F%3D` in cookies).
function resolveXsrfToken(cookieJar: Record<string, string>, override: string): string | null {
  const explicit = override.trim();
  if (explicit) {
    // If the user pasted the raw cookie value into the override field, decode it.
    return explicit.includes("%") ? safeUrlDecode(explicit) : explicit;
  }
  const fromJar = cookieJar["MYGREENHOUSE-XSRF-TOKEN"];
  if (fromJar) return safeUrlDecode(fromJar);
  return null;
}

// True when the response body looks like the Rails sign-in HTML page rather
// than the JSON jobs feed. The candidate portal serves the sign-in page with
// status 200 and `text/html`, so we have to sniff the body.
function looksLikeHtml(body: string): boolean {
  const head = body.slice(0, 200).trimStart().toLowerCase();
  return head.startsWith("<!doctype") || head.startsWith("<html");
}

function looksLikeSignInRedirect(res: Response, body: string, contentType: string): boolean {
  if (res.status === 401 || res.status === 403) return true;
  if (res.status >= 300 && res.status < 400) {
    const loc = res.headers.get("location") || "";
    if (/\/users\/sign_in|\/login/i.test(loc)) return true;
  }
  if (res.redirected && /\/users\/sign_in/i.test(res.url)) return true;
  if (res.status === 406 && body.length === 0) return true;
  if (/text\/html/i.test(contentType) && looksLikeHtml(body)) return true;
  if (/sign[_ ]in|please log in|session expired/i.test(body) && body.length < 8_000) return true;
  return false;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  parentSignal: AbortSignal | undefined,
): Promise<Response> {
  const controller = new AbortController();
  const onParentAbort = () => controller.abort();
  if (parentSignal) {
    if (parentSignal.aborted) throw new Error("aborted");
    parentSignal.addEventListener("abort", onParentAbort, { once: true });
  }
  const timer = setTimeout(() => controller.abort(), PER_REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
    if (parentSignal) parentSignal.removeEventListener("abort", onParentAbort);
  }
}

// Rails / Greenhouse can rotate the exact session cookie name (e.g.
// _session_id vs _my_greenhouse_session vs _greenhouse_session). Match
// anything that looks like a session cookie instead of hard-coding one name.
function hasSessionCookie(jar: Record<string, string>): boolean {
  for (const name of Object.keys(jar)) {
    if (/^_session_id$/i.test(name)) return true;
    if (/_session(_id)?$/i.test(name)) return true;
    if (/^_[a-z0-9_-]+_session$/i.test(name)) return true;
  }
  return false;
}

// We only block when the cookie text is empty / clearly malformed. If the
// session cookie is present but under an unexpected name, send the request
// anyway and let the real HTTP response (sign-in redirect, 401, 422 CSRF)
// surface the actual failure with a precise message.
function validateCookieJar(jar: Record<string, string>): string | null {
  if (Object.keys(jar).length === 0) {
    return "session cookie is empty or malformed — paste the full Cookie header value from DevTools (Application → Cookies on my.greenhouse.io)";
  }
  return null;
}

export const myGreenhouseFeed: Feed = {
  key: "mygreenhouse",
  label: "MyGreenhouse (authenticated)",
  fetch: async ({ maxJobs, searchUrl, signal, config }) => {
    const cookie = (config?.mygreenhouse_session_cookie || "").trim();
    if (!cookie) {
      return {
        jobs: [],
        warning:
          "session cookie not configured — paste from browser DevTools (Application → Cookies on my.greenhouse.io)",
      };
    }
    const cookieJar = parseCookieHeader(cookie);
    const validationWarning = validateCookieJar(cookieJar);
    if (validationWarning) {
      return { jobs: [], warning: validationWarning };
    }

    const xsrfDecoded = resolveXsrfToken(cookieJar, config?.mygreenhouse_xsrf_token || "");
    const baseUrl = (searchUrl || "").trim().startsWith("http")
      ? (searchUrl as string).trim()
      : JOBS_JSON;

    const jobs: NormalizedJob[] = [];
    const seen = new Set<string>();
    let cursor: string | null = null;
    let warning: string | undefined;
    let consecutiveEmptyPages = 0;

    for (let page = 0; page < MAX_PAGES; page++) {
      if (signal?.aborted) {
        warning = warning || "scan aborted before completion";
        break;
      }
      const url = buildPageUrl(baseUrl, page === 0 ? null : cursor);
      const headers: Record<string, string> = {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-US,en;q=0.9",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": `${MYGH_BASE}/jobs`,
        "Origin": MYGH_BASE,
        "Cookie": cookie,
      };
      if (xsrfDecoded) headers["X-CSRF-Token"] = xsrfDecoded;

      let res: Response;
      try {
        res = await fetchWithTimeout(
          url,
          { headers, redirect: "manual", cache: "no-store" },
          signal,
        );
      } catch (err) {
        const msg = (err as Error).message || String(err);
        warning = /abort/i.test(msg) ? "request timed out (12s) — my.greenhouse.io is slow or unreachable" : `network error: ${msg.slice(0, 200)}`;
        break;
      }
      const body = await res.text();
      const contentType = res.headers.get("content-type") || "";

      if (looksLikeSignInRedirect(res, body, contentType)) {
        const names = Object.keys(cookieJar).sort();
        const hasSession = hasSessionCookie(cookieJar);
        warning = hasSession
          ? `session expired or invalid (server redirected to sign-in). Sign in again at my.greenhouse.io and paste a fresh cookie. Cookies sent: ${names.join(", ") || "(none)"}.`
          : `cookie does not contain a recognizable session value (sent: ${names.join(", ") || "(none)"}). Make sure you copied the Cookie header from a logged-in my.greenhouse.io tab, not from a different domain.`;
        break;
      }

      // Server signals CSRF mismatch with 422 or {"error":"InvalidAuthenticityToken"}.
      if (res.status === 422 || /invalidauthenticitytoken|csrf/i.test(body.slice(0, 400))) {
        warning =
          "CSRF token rejected — the MYGREENHOUSE-XSRF-TOKEN value in the cookie may not match the active session. Re-copy the cookie immediately after signing in.";
        break;
      }
      if (res.status === 429) {
        warning = "rate-limited by my.greenhouse.io (HTTP 429) — try again in a few minutes";
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
        warning = looksLikeHtml(body)
          ? "received HTML page instead of JSON — session likely expired"
          : "response was not JSON (the page layout may have changed)";
        break;
      }

      const list = pickJobsArray(payload);
      if (list.length === 0) {
        consecutiveEmptyPages++;
        if (consecutiveEmptyPages >= 2) break;
        continue;
      }
      consecutiveEmptyPages = 0;

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
