import type { Feed, FeedFetchResult, NormalizedJob } from "./types";
import { remoteOkFeed } from "./feeds/remoteok";
import { weWorkRemotelyFeed } from "./feeds/weworkremotely";
import { jobicyFeed } from "./feeds/jobicy";
import { greenhouseFeed } from "./feeds/greenhouse";
import { leverFeed } from "./feeds/lever";
import { ashbyFeed } from "./feeds/ashby";
import { landingJobsFeed } from "./feeds/landingjobs";
import { jobspressoFeed } from "./feeds/jobspresso";
import { authenticJobsFeed } from "./feeds/authenticjobs";
import { nodeskFeed } from "./feeds/nodesk";
import { justRemoteFeed } from "./feeds/justremote";
import { upsertScrapedJob } from "../scrapedJobs";
import { getAllConfig } from "../config";

const FEEDS: Feed[] = [
  // single-endpoint json feeds
  remoteOkFeed,
  jobicyFeed,
  landingJobsFeed,
  // RSS-driven boards (default URL, user can override)
  weWorkRemotelyFeed,
  jobspressoFeed,
  authenticJobsFeed,
  nodeskFeed,
  // SPA boards with no public api — scraped from embedded SSR payload
  justRemoteFeed,
  // multi-company ATS
  greenhouseFeed,
  leverFeed,
  ashbyFeed,
];

export const FEED_KEYS = FEEDS.map((f) => f.key);

export function getFeed(key: string): Feed | undefined {
  return FEEDS.find((f) => f.key === key);
}

export type ScanOutcome = {
  found: number;
  saved: number;
  refreshed: number;
  rescanned: number;
  skipped: number;
  warning?: string;
};

export async function runFeedScan(key: string, preloadedConfig?: Record<string, string>): Promise<ScanOutcome> {
  const feed = getFeed(key);
  if (!feed) throw new Error(`Unknown scanner: ${key}`);

  // One config read per scan (or zero, if the caller already loaded it). The
  // earlier per-key getConfigValue() pattern hit Supabase's 15-client pool
  // limit when scanning all 11 sources back-to-back.
  const config = preloadedConfig ?? (await getAllConfig());

  if (config[`${key}_enabled`] === "false") {
    return { found: 0, saved: 0, refreshed: 0, rescanned: 0, skipped: 0, warning: "scanner disabled" };
  }

  const maxJobs = Math.min(200, Math.max(1, Number(config[`${key}_max_jobs`]) || 25));
  const rescanAfterDays = Math.max(0, Number(config["scanner_rescan_after_days"]) || 0);

  const result: FeedFetchResult = await feed.fetch({
    maxJobs,
    searchUrl: config[`${key}_search_url`] || undefined,
  });

  let saved = 0;
  let refreshed = 0;
  let rescanned = 0;
  let skipped = 0;
  for (const job of result.jobs) {
    const outcome = await persistJob(job, rescanAfterDays);
    if (outcome === "saved") saved++;
    else if (outcome === "rescanned") rescanned++;
    else if (outcome === "refreshed") refreshed++;
    else skipped++;
  }

  return {
    found: result.jobs.length,
    saved,
    refreshed,
    rescanned,
    skipped,
    warning: result.warning,
  };
}

async function persistJob(
  job: NormalizedJob,
  rescanAfterDays: number,
): Promise<"saved" | "rescanned" | "refreshed" | "skipped"> {
  const result = await upsertScrapedJob({
    platform: job.platform,
    title: job.title,
    company: job.company,
    url: job.url,
    location: job.location ?? null,
    description: job.description ?? null,
    salary: job.salary ?? null,
    manualApplyUrl: job.applyUrl ?? null,
    rescanAfterDays,
  });
  if (!result) return "skipped";
  if (result.created) return "saved";
  if (result.rescanned) return "rescanned";
  if (result.refreshed) return "refreshed";
  return "skipped";
}
