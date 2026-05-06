import { rssFeed } from "./rssFactory";

// Jobspresso publishes a WordPress-style RSS feed at /feed.
export const jobspressoFeed = rssFeed({
  key: "jobspresso",
  label: "Jobspresso",
  defaultUrl: "https://jobspresso.co/feed/",
  splitCompanyFromTitle: true,
  fallbackCompanyFromHost: true,
});
