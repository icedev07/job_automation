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
};

export type Feed = {
  key: string;
  label: string;
  fetch: (opts: FeedFetchOptions) => Promise<FeedFetchResult>;
};
