import { rssFeed } from "./rssFactory";

// Nodesk is a static-site remote board with an Atom-style feed.
// User can override the URL if Nodesk renames the feed.
export const nodeskFeed = rssFeed({
  key: "nodesk",
  label: "Nodesk",
  defaultUrl: "https://nodesk.co/remote-jobs/feed.xml",
  splitCompanyFromTitle: true,
  fallbackCompanyFromHost: true,
});
