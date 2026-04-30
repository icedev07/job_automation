import { JobApplication } from "../generated/prisma";

import { prisma } from "./prisma";

/**
 * Normalize URL for duplicate detection: same job can be linked with
 * different query params, trailing slash, or encoding.
 */
export function normalizeUrl(url: string): string {
  const raw = String(url).trim();
  if (!raw) return "";

  try {
    const u = new URL(raw);
    const protocol = u.protocol.toLowerCase();
    const host = u.hostname.toLowerCase();
    const pathname = u.pathname.replace(/\/+$/, "") || "/";
    const search = u.searchParams.toString()
      ? "?" + [...u.searchParams.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => `${k}=${v}`).join("&")
      : "";
    return `${protocol}//${host}${pathname}${search}`;
  } catch {
    return raw.toLowerCase().replace(/\/+$/, "");
  }
}

/**
 * Normalize title or company for duplicate detection: trim, collapse spaces,
 * lowercase, remove common punctuation/suffixes that don't change identity.
 */
export function normalizeTitleOrCompany(s: string): string {
  const t = String(s)
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, ""); // strip zero-width chars
  return t;
}

/**
 * Stricter company normalization: drop common legal suffixes so
 * "Acme Inc." and "Acme Inc" and "Acme" can match.
 */
export function normalizeCompanyStrict(company: string): string {
  let c = normalizeTitleOrCompany(company);
  const suffixes = [
    /\s*,\s*inc\.?$/i,
    /\s+inc\.?$/i,
    /\s*,\s*llc\.?$/i,
    /\s+llc\.?$/i,
    /\s*,\s*ltd\.?$/i,
    /\s+ltd\.?$/i,
    /\s*,\s*corp\.?$/i,
    /\s+corp\.?$/i,
    /\s*,\s*co\.?$/i,
    /\s+co\.?$/i,
    /\s*,\s*limited$/i,
    /\s+limited$/i,
  ];
  for (const re of suffixes) {
    c = c.replace(re, "").trim();
  }
  return c;
}

/**
 * Normalize job title for cross-table duplicate check: trim, lowercase, collapse spaces,
 * and strip common role prefixes/suffixes that don't change job identity.
 */
export function normalizeTitleForDedup(title: string): string {
  let t = normalizeTitleOrCompany(title);
  const stripPatterns = [
    /^\s*(senior|sr\.?|lead|principal|staff|junior|jr\.?)\s+/i,
    /\s*[-–—|]\s*(remote|hybrid|onsite)\s*$/i,
    /\s*\(\s*remote\s*\)\s*$/i,
    /\s*\(\s*hybrid\s*\)\s*$/i,
    /\s*-\s*remote\s*$/i,
    /\s*,?\s*remote\s*$/i,
  ];
  for (const re of stripPatterns) {
    t = t.replace(re, "").trim();
  }
  return t.replace(/\s+/g, " ").trim();
}

export type DuplicateReason = "exact_url" | "normalized_url" | "exact_title_company" | "normalized_title_company";

export interface DuplicateMatch {
  job: JobApplication;
  reason: DuplicateReason;
}

/**
 * Same URL but different role (e.g. same career page, different job) should not
 * be treated as duplicate. Only treat URL match as duplicate when the job title
 * refers to the same role (normalized title equal).
 */
function sameRole(normTitleA: string, normTitleB: string): boolean {
  if (!normTitleA || !normTitleB) return true; // no title to compare, treat as same
  return normTitleA === normTitleB;
}

/**
 * True when the two URLs point to different job postings (e.g. different path segments).
 * Used to allow same company + similar title when apply links are different (e.g. Gem job IDs).
 */
function urlsPointToDifferentJobs(urlA: string, urlB: string): boolean {
  try {
    const pathA = new URL(urlA.trim()).pathname.replace(/\/+$/, "") || "/";
    const pathB = new URL(urlB.trim()).pathname.replace(/\/+$/, "") || "/";
    return pathA !== pathB;
  } catch {
    return urlA.trim() !== urlB.trim();
  }
}

/**
 * Find an existing job that should be considered a duplicate for this applicant only (`userId`).
 * Mohan and Jiayong may each have their own row for the same posting.
 *
 * - URL duplicate: same (exact or normalized) URL and same role (normalized title).
 * - Title+company duplicate: same company and same job title (exact or normalized).
 */
export async function findDuplicateJob(params: {
  userId: number;
  externalUrl: string;
  title: string;
  company: string;
}): Promise<DuplicateMatch | null> {
  const { userId, externalUrl, title, company } = params;
  const normUrl = normalizeUrl(externalUrl);
  const normTitle = normalizeTitleOrCompany(title);
  const normCompany = normalizeCompanyStrict(company);

  const jobs = await prisma.jobApplication.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      company: true,
      externalUrl: true,
      source: true,
      status: true,
      jobType: true,
      invitedToInterview: true,
      createdAt: true,
      updatedAt: true,
      appliedAt: true,
      userId: true,
      jobrightJobId: true,
      location: true,
      jobrightMatchScore: true,
      jobrightBoard: true,
      jobrightUrl: true,
    },
  });

  for (const job of jobs) {
    const jobNormTitle = normalizeTitleOrCompany(job.title);
    const urlExact = job.externalUrl === externalUrl.trim();
    const urlNormalized = normUrl && normalizeUrl(job.externalUrl) === normUrl;
    if (urlExact && sameRole(jobNormTitle, normTitle)) {
      return { job, reason: "exact_url" };
    }
    if (urlNormalized && sameRole(jobNormTitle, normTitle)) {
      return { job, reason: "normalized_url" };
    }
  }

  const trimmedUrl = externalUrl.trim();
  for (const job of jobs) {
    if (job.title === title.trim() && job.company === company.trim()) {
      if (urlsPointToDifferentJobs(trimmedUrl, job.externalUrl)) continue;
      return { job, reason: "exact_title_company" };
    }
    const jobNormTitle = normalizeTitleOrCompany(job.title);
    const jobNormCompany = normalizeCompanyStrict(job.company);
    if (normTitle && normCompany && jobNormTitle === normTitle && jobNormCompany === normCompany) {
      if (urlsPointToDifferentJobs(trimmedUrl, job.externalUrl)) continue;
      return { job, reason: "normalized_title_company" };
    }
  }

  return null;
}

export type CrossTableDuplicate = { table: "JobApplication" | "OneClickJob"; id: number };

/**
 * Same job may exist for different applicants; this only compares within `userId`.
 * Used to avoid duplicates across Full jobs vs 1-click jobs for one person.
 */
export async function findDuplicateAcrossAllJobs(params: {
  title: string;
  company: string;
  userId: number;
}): Promise<CrossTableDuplicate | null> {
  const { title, company, userId } = params;
  const normTitle = normalizeTitleForDedup(title);
  const normCompany = normalizeCompanyStrict(company);
  const normTitleExact = normalizeTitleOrCompany(title);
  if (!normTitle || !normCompany) return null;

  const whereUser = { userId };

  const [fullJobs, oneClickJobs] = await Promise.all([
    prisma.jobApplication.findMany({
      where: whereUser,
      select: { id: true, title: true, company: true },
    }),
    prisma.oneClickJob.findMany({
      where: whereUser,
      select: { id: true, title: true, company: true },
    }),
  ]);

  const matches = (row: { title: string; company: string }) => {
    const rTitleExact = normalizeTitleOrCompany(row.title);
    const rTitle = normalizeTitleForDedup(row.title);
    const rCompany = normalizeCompanyStrict(row.company);
    if (rCompany !== normCompany) return false;
    return rTitleExact === normTitleExact || rTitle === normTitle;
  };

  for (const job of fullJobs) {
    if (matches(job)) return { table: "JobApplication", id: job.id };
  }
  for (const job of oneClickJobs) {
    if (matches(job)) return { table: "OneClickJob", id: job.id };
  }
  return null;
}
