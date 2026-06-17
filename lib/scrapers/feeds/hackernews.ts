import type { Feed, NormalizedJob } from "../types";
import { stripHtml, decodeEntities } from "../rss";

// Hacker News "Who is hiring?" — the canonical hidden job source. On the first
// business day of every month, user `whoishiring` posts an "Ask HN: Who is
// hiring?" thread; each top-level comment is one job posting, by convention
// formatted as a pipe-delimited header line:
//   "Company | Role | Location | REMOTE/ONSITE | tech | apply-url"
// followed by free-text details.
//
// We resolve it zero-auth in two cheap calls against the public HN Algolia API:
//   1. search_by_date for the latest `author_whoishiring` story, filtered to the
//      "Who is hiring?" thread (NOT the sibling "Who wants to be hired?").
//   2. items/<id> returns the whole comment tree (text included) in one shot,
//      so we avoid 500 separate per-comment fetches.
//
// The user's "search URL" is an optional comma-separated keyword filter applied
// to each posting's text (OR semantics), e.g. "remote, europe". Default keeps
// remote-friendly posts; blank keeps everything.
const ALGOLIA_SEARCH =
  "https://hn.algolia.com/api/v1/search_by_date?tags=story,author_whoishiring&query=who%20is%20hiring&hitsPerPage=30";
const ALGOLIA_ITEM = "https://hn.algolia.com/api/v1/items/";

type AlgoliaHit = {
  objectID?: string;
  title?: string;
  created_at_i?: number;
};

type AlgoliaSearch = { hits?: AlgoliaHit[] };

type AlgoliaComment = {
  id?: number;
  text?: string | null;
  author?: string | null;
  type?: string;
  children?: AlgoliaComment[];
};

type AlgoliaItem = {
  id?: number;
  title?: string;
  children?: AlgoliaComment[];
};

function parseKeywordFilter(searchUrl: string | undefined): string[] {
  return (searchUrl ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

// Pick the newest genuine "Who is hiring?" story, excluding the sibling
// "Who wants to be hired?" thread (same author + timestamp).
function pickHiringThread(hits: AlgoliaHit[]): AlgoliaHit | null {
  const candidates = hits
    .filter((h) => h.objectID)
    .filter((h) => /who\s+is\s+hiring/i.test(h.title || ""))
    .filter((h) => !/wants?\s+to\s+be\s+hired/i.test(h.title || ""))
    .filter((h) => !/freelancer/i.test(h.title || ""));
  if (candidates.length === 0) return null;
  return candidates.reduce((newest, h) =>
    (h.created_at_i || 0) > (newest.created_at_i || 0) ? h : newest,
  );
}

// First external apply link in the raw comment HTML (href or bare URL),
// skipping links back to HN itself.
function extractApplyUrl(rawHtml: string): string | null {
  const urls: string[] = [];
  const hrefRe = /href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = hrefRe.exec(rawHtml)) !== null) urls.push(m[1]);
  const bareRe = /(https?:\/\/[^\s"'<>)]+)/gi;
  while ((m = bareRe.exec(rawHtml)) !== null) urls.push(m[1]);
  for (const u of urls) {
    // HN encodes hrefs as HTML entities (&#x2F; for "/", &amp; for "&", …).
    const decoded = decodeEntities(u);
    if (!/ycombinator\.com|news\.ycombinator/i.test(decoded)) return decoded;
  }
  return null;
}

function clip(s: string, max: number): string {
  const t = s.trim();
  return t.length > max ? t.slice(0, max).trim() : t;
}

// Best-effort parse of the pipe-delimited header convention. The full text is
// always kept as the description, so even an imperfect header still feeds the
// AI analyzer a complete posting.
function parsePosting(plain: string): { company: string; title: string; location: string | null } {
  const firstLine = (plain.split("\n").find((l) => l.trim().length > 0) || "").trim();
  const segments = firstLine.split("|").map((s) => s.trim()).filter(Boolean);

  if (segments.length >= 2) {
    const company = clip(segments[0], 120) || "Unknown";
    const title = clip(segments[1], 160) || "Open role";
    const locSeg = segments
      .slice(2)
      .find((s) => /remote|onsite|hybrid|worldwide|europe|[A-Za-z]+,\s*[A-Za-z]/i.test(s));
    // A segment can still carry trailing prose if a post omitted a separator —
    // cut at the first sentence / double-space boundary and clip short.
    const location = locSeg
      ? clip(locSeg.split(/\s{2,}|\.\s/)[0], 60)
      : /\bremote\b/i.test(plain)
        ? "Remote"
        : null;
    return { company, title, location };
  }

  // No clean header — derive a company from the first line and flag the role
  // generically so the row is still meaningful in the dashboard.
  const company = clip(firstLine.replace(/[|–-].*$/, ""), 80) || "HN (Who is hiring)";
  return {
    company,
    title: clip(firstLine, 160) || "Open role (HN Who is hiring)",
    location: /\bremote\b/i.test(plain) ? "Remote" : null,
  };
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      "Accept": "application/json",
    },
    signal,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Hacker News responded ${res.status}`);
  return (await res.json()) as T;
}

export const hackerNewsFeed: Feed = {
  key: "hnwhoishiring",
  label: "Hacker News — Who is hiring?",
  fetch: async ({ maxJobs, searchUrl, signal }) => {
    const keywordFilter = searchUrl != null ? parseKeywordFilter(searchUrl) : ["remote"];

    const search = await getJson<AlgoliaSearch>(ALGOLIA_SEARCH, signal);
    const thread = pickHiringThread(search.hits ?? []);
    if (!thread?.objectID) {
      return { jobs: [], warning: "No 'Who is hiring?' thread found via HN Algolia search" };
    }

    const item = await getJson<AlgoliaItem>(`${ALGOLIA_ITEM}${thread.objectID}`, signal);
    const comments = Array.isArray(item.children) ? item.children : [];

    const jobs: NormalizedJob[] = [];
    for (const c of comments) {
      if (jobs.length >= maxJobs) break;
      if (signal?.aborted) break;
      const rawText = c.text;
      if (!rawText || typeof rawText !== "string") continue; // deleted / empty

      const plain = stripHtml(rawText);
      if (plain.length < 20) continue; // not a real posting

      if (keywordFilter.length) {
        const hay = plain.toLowerCase();
        if (!keywordFilter.some((k) => hay.includes(k))) continue;
      }

      const { company, title, location } = parsePosting(plain);
      const commentId = c.id;
      if (!commentId) continue;

      jobs.push({
        platform: "hnwhoishiring",
        title,
        company,
        // The HN comment permalink is stable and unique — ideal for dedup. The
        // employer's own apply link (when present) goes in applyUrl.
        url: `https://news.ycombinator.com/item?id=${commentId}`,
        applyUrl: extractApplyUrl(rawText),
        location,
        description: plain,
        salary: null,
      });
    }

    const warning = jobs.length === 0
      ? `Thread "${thread.title}" had no postings matching the filter`
      : undefined;
    return { jobs, warning };
  },
};
