/**
 * Shared skip rules for jobs (full and 1-Click).
 * Applied so the same title/URL/company filters are used everywhere.
 */

/** Skip adding jobs whose title contains any of these words (case-insensitive). */
export const TITLE_SKIP_WORDS = [
  // "principal",
  "vice president",
];

/** Skip adding jobs whose external URL contains any of these strings (case-insensitive). */
export const URL_SKIP_SUBSTRINGS = [
  "nvidia",
  "redhat",
  "pinterest",
  "metacareer",
  "alignerr",
  "capitalone",
  "hackajob",
  "generalmotors",
  "allstate",
  "micro1",
  "expedia",
  "reddit",
  "horizontaltalent",
  "fleetai.com",
  "shieldai",
  "metacareers",
  "dayforcehcm",
  "griddynamics",
  "www.usajobs.gov",
  "usajobs.gov",
  "gdit",
  "hopper",
  "libertymutualgroup",
  "smarterdx",
  "caci",

];

/** Skip adding jobs whose company name contains any of these strings (case-insensitive). */
export const COMPANY_SKIP_SUBSTRINGS = [
  "Alignerr",
  "NVIDIA",
  "Pinterest",
  "Meta",
  "Innovaccer",
  "PathAI",
  "Instacart",
];

export function shouldSkipJob(params: {
  title: string;
  company: string;
  externalUrl: string;
}): boolean {
  const titleLower = (params.title || "").trim().toLowerCase();
  if (TITLE_SKIP_WORDS.some((w) => titleLower.includes(w))) {
    return true;
  }
  const urlLower = (params.externalUrl || "").toLowerCase();
  if (URL_SKIP_SUBSTRINGS.some((s) => urlLower.includes(s.toLowerCase()))) {
    return true;
  }
  const companyLower = (params.company || "").toLowerCase();
  if (COMPANY_SKIP_SUBSTRINGS.some((s) => companyLower.includes(s.toLowerCase()))) {
    return true;
  }
  return false;
}

/**
 * Rules we can evaluate from the Jobright card alone (title + company).
 * URL-based skips still require opening the apply flow.
 */
export function shouldSkipJobFromCardFields(params: { title: string; company: string }): boolean {
  const titleLower = (params.title || "").trim().toLowerCase();
  if (TITLE_SKIP_WORDS.some((w) => titleLower.includes(w))) {
    return true;
  }
  const companyLower = (params.company || "").toLowerCase();
  if (COMPANY_SKIP_SUBSTRINGS.some((s) => companyLower.includes(s.toLowerCase()))) {
    return true;
  }
  return false;
}

/** True when the apply URL alone matches URL_SKIP_SUBSTRINGS (e.g. after opening a new tab, before full load). */
export function shouldSkipJobFromApplyUrl(url: string): boolean {
  const urlLower = (url || "").toLowerCase();
  return URL_SKIP_SUBSTRINGS.some((s) => urlLower.includes(s.toLowerCase()));
}
