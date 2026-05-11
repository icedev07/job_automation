export type NormalizedJob = {
  platform: string;
  title: string;
  company: string;
  url: string;
  applyUrl?: string | null;
  location?: string | null;
  description?: string | null;
  salary?: string | null;
};

export type FeedFetchResult = {
  jobs: NormalizedJob[];
  warning?: string;
};

export type FeedFetchOptions = {
  maxJobs: number;
  searchUrl?: string;
  signal?: AbortSignal;
  // Optional pass-through of the full scanner config. Most feeds only need
  // searchUrl, but a few (e.g. mygreenhouse) need extra secrets like a
  // session cookie that we don't want overloaded onto the search-url field.
  config?: Record<string, string>;
};

export type Feed = {
  key: string;
  label: string;
  fetch: (opts: FeedFetchOptions) => Promise<FeedFetchResult>;
};
