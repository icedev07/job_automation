import { rssFeed } from "./rssFactory";

// Nodesk is a static-site remote board with an Atom-style feed.
// User can override the URL if Nodesk renames the feed.
export const nodeskFeed = rssFeed({
  key: "nodesk",
  label: "Nodesk",
  // Verified: only /remote-jobs/index.xml works (Hugo-generated atom feed).
  defaultUrl: "https://nodesk.co/remote-jobs/index.xml",
  splitCompanyFromTitle: true,
  fallbackCompanyFromHost: true,
});
