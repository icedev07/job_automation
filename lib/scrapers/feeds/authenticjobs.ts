import { rssFeed } from "./rssFactory";

// Authentic Jobs historically exposes a global RSS feed; the user can
// override the URL via search-url to point at a category-specific feed.
export const authenticJobsFeed = rssFeed({
  key: "authenticjobs",
  label: "Authentic Jobs",
  defaultUrl: "https://authenticjobs.com/rss/all.xml",
  splitCompanyFromTitle: true,
  fallbackCompanyFromHost: true,
});
