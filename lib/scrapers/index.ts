import type { Feed, FeedFetchResult, NormalizedJob } from "./types";
import { remoteOkFeed } from "./feeds/remoteok";
import { weWorkRemotelyFeed } from "./feeds/weworkremotely";
import { jobicyFeed } from "./feeds/jobicy";
import { remotiveFeed } from "./feeds/remotive";
import { greenhouseFeed } from "./feeds/greenhouse";
import { leverFeed } from "./feeds/lever";
import { workableFeed } from "./feeds/workable";
import { ashbyFeed } from "./feeds/ashby";
import { landingJobsFeed } from "./feeds/landingjobs";
import { remoteesFeed } from "./feeds/remotees";
import { jobspressoFeed } from "./feeds/jobspresso";
import { authenticJobsFeed } from "./feeds/authenticjobs";
import { nodeskFeed } from "./feeds/nodesk";
import { upsertScrapedJob } from "../scrapedJobs";
import { getConfigValue } from "../config";

const FEEDS: Feed[] = [
  // single-endpoint json feeds
  remoteOkFeed,
  remotiveFeed,
  jobicyFeed,
  landingJobsFeed,
  // RSS-driven boards (default URL, user can override)
  weWorkRemotelyFeed,
  remoteesFeed,
  jobspressoFeed,
  authenticJobsFeed,
  nodeskFeed,
  // multi-company ATS
  greenhouseFeed,
  leverFeed,
  workableFeed,
  ashbyFeed,
];

export const FEED_KEYS = FEEDS.map((f) => f.key);

export function getFeed(key: string): Feed | undefined {
  return FEEDS.find((f) => f.key === key);
}

export type ScanOutcome = {
  found: number;
  saved: number;
  skipped: number;
  warning?: string;
};

export async function runFeedScan(key: string): Promise<ScanOutcome> {
  const feed = getFeed(key);
  if (!feed) throw new Error(`Unknown scanner: ${key}`);

  const [maxRaw, urlRaw, enabledRaw] = await Promise.all([
    getConfigValue(`${key}_max_jobs`),
    getConfigValue(`${key}_search_url`),
    getConfigValue(`${key}_enabled`),
  ]);

  if (enabledRaw === "false") {
    return { found: 0, saved: 0, skipped: 0, warning: "scanner disabled" };
  }

  const maxJobs = Math.min(200, Math.max(1, Number(maxRaw) || 25));

  const result: FeedFetchResult = await feed.fetch({
    maxJobs,
    searchUrl: urlRaw || undefined,
  });

  let saved = 0;
  let skipped = 0;
  for (const job of result.jobs) {
    const persisted = await persistJob(job);
    if (persisted === "saved") saved++;
    else skipped++;
  }

  return {
    found: result.jobs.length,
    saved,
    skipped,
    warning: result.warning,
  };
}

async function persistJob(job: NormalizedJob): Promise<"saved" | "duplicate" | "skipped"> {
  const result = await upsertScrapedJob({
    platform: job.platform,
    title: job.title,
    company: job.company,
    url: job.url,
    location: job.location ?? null,
    description: job.description ?? null,
    salary: job.salary ?? null,
    manualApplyUrl: job.applyUrl ?? null,
  });
  if (!result) return "skipped";
  return result.created ? "saved" : "duplicate";
}
