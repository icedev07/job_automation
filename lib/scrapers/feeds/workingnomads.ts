import type { Feed, NormalizedJob } from "../types";
import { stripHtml } from "../rss";
import { feedHttpGet, parseJsonOrWarn } from "../http";

// Working Nomads exposes a single public JSON endpoint returning every active
// listing as one flat array — no auth, no pagination, no server-side filter.
//   https://www.workingnomads.com/api/exposed_jobs/
// The site sits behind Cloudflare, so we send a browser-like UA. Filtering is
// done client-side: the user's "search URL" is an optional comma-separated list
// of category keywords (matched case-insensitively against `category_name`,
// e.g. "Development, DevOps, Sysadmin"). Blank keeps every category.
const WORKING_NOMADS_URL = "https://www.workingnomads.com/api/exposed_jobs/";

type WorkingNomadsRaw = {
  url?: string;
  title?: string;
  company_name?: string;
  category_name?: string;
  location?: string;
  description?: string;
  tags?: string;
  pub_date?: string;
};

function parseCategoryFilter(searchUrl: string | undefined): string[] {
  return (searchUrl ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export const workingNomadsFeed: Feed = {
  key: "workingnomads",
  label: "Working Nomads",
  fetch: async ({ maxJobs, searchUrl, signal }) => {
    const categoryFilter = parseCategoryFilter(searchUrl);
    const r = await feedHttpGet("Working Nomads", WORKING_NOMADS_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "Accept": "application/json",
      },
      signal,
      cache: "no-store",
    });
    if (!r.ok) return { jobs: [], warning: r.warning };
    const parsed = parseJsonOrWarn<WorkingNomadsRaw[]>("Working Nomads", r.body);
    if (!parsed.ok) return { jobs: [], warning: parsed.warning };
    const list = Array.isArray(parsed.data) ? parsed.data : [];

    const jobs: NormalizedJob[] = [];
    for (const entry of list) {
      const title = (entry.title || "").trim();
      const company = (entry.company_name || "").trim();
      const u = (entry.url || "").trim();
      if (!title || !company || !u) continue;

      if (categoryFilter.length) {
        const cat = (entry.category_name || "").toLowerCase();
        if (!categoryFilter.some((c) => cat.includes(c))) continue;
      }

      const description = stripHtml(entry.description || "");
      const tags = (entry.tags || "").trim();
      const descWithTags = tags ? `${description}\n\nTags: ${tags}`.trim() : description;

      jobs.push({
        platform: "workingnomads",
        title,
        company,
        url: u,
        location: entry.location || "Remote",
        description: descWithTags || null,
        salary: null,
      });
      if (jobs.length >= maxJobs) break;
    }

    return { jobs };
  },
};
