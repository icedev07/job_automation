import { rssFeed } from "./rssFactory";

// Authentic Jobs historically exposes a global RSS feed; the user can
// override the URL via search-url to point at a category-specific feed.
export const authenticJobsFeed = rssFeed({
  key: "authenticjobs",
  label: "Authentic Jobs",
  // Verified: /rss/all.xml is 404, /feed returns ~117KB.
  defaultUrl: "https://authenticjobs.com/feed",
  splitCompanyFromTitle: true,
  fallbackCompanyFromHost: true,
});
