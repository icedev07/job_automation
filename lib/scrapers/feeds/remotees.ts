import { rssFeed } from "./rssFactory";

// Remotees aggregates remote-only listings across many company boards.
// Default points at the global "all jobs" feed; user can paste a category
// or company-specific feed url in the search-url field.
export const remoteesFeed = rssFeed({
  key: "remotees",
  label: "Remotees",
  defaultUrl: "https://remotees.com/feed",
  splitCompanyFromTitle: true,
  fallbackCompanyFromHost: true,
});
