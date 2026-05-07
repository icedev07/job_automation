import { rssFeed } from "./rssFactory";

// Jobspresso's `/feed/` is the empty WordPress blog feed; the real listings
// are at `/jobs/feed/`. Verified manually returning ~150KB of items.
export const jobspressoFeed = rssFeed({
  key: "jobspresso",
  label: "Jobspresso",
  defaultUrl: "https://jobspresso.co/jobs/feed/",
  splitCompanyFromTitle: true,
  fallbackCompanyFromHost: true,
});
