import { prisma } from "./prisma";
import { shouldSkipJob } from "./jobSkipRules";

function normalizeUrl(raw: string): string {
  try {
    const u = new URL(raw);
    u.searchParams.delete("utm_source");
    u.searchParams.delete("utm_medium");
    u.searchParams.delete("utm_campaign");
    u.searchParams.delete("utm_content");
    u.searchParams.delete("utm_term");
    u.searchParams.delete("ref");
    u.searchParams.delete("refId");
    u.searchParams.delete("clickId");
    u.searchParams.delete("trk");
    u.searchParams.delete("source");
    u.hash = "";
    let path = u.pathname.replace(/\/+$/, "");
    u.pathname = path || "/";
    const s = u.toString();
    return s.length <= 2048 ? s : s.slice(0, 2048);
  } catch {
    const t = raw.trim();
    return t.length <= 2048 ? t : t.slice(0, 2048);
  }
}

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeCompany(company: string): string {
  return company
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/,?\s*(inc\.?|llc|ltd\.?|corp\.?|co\.?|gmbh|s\.?a\.?)$/i, "")
    .trim();
}

export async function upsertScrapedJob(params: {
  platform: string;
  title: string;
  company: string;
  url: string;
  location?: string | null;
  description?: string | null;
  salary?: string | null;
  manualApplyUrl?: string | null;
}): Promise<{ id: number; title: string; company: string; created: boolean } | null> {
  const { platform, title, company, url, location, description, salary, manualApplyUrl } = params;

  if (await shouldSkipJob({ title, company, externalUrl: url })) {
    return null;
  }

  const normUrl = normalizeUrl(url);
  const normTitle = normalizeTitle(title);
  const normCompany = normalizeCompany(company);
  const normManual =
    typeof manualApplyUrl === "string" && manualApplyUrl.trim().length > 0
      ? normalizeUrl(manualApplyUrl.trim())
      : null;

  async function persistManual(jobId: number) {
    if (!normManual) return;
    await prisma.scrapedJob.updateMany({
      where: { id: jobId },
      data: { manualApplyUrl: normManual },
    });
  }

  // same-platform URL dedup
  const byUrl = await prisma.scrapedJob.findFirst({
    where: { platform, url: normUrl },
  });
  if (byUrl) {
    await persistManual(byUrl.id);
    return { id: byUrl.id, title: byUrl.title, company: byUrl.company, created: false };
  }

  // same-platform title+company dedup
  const byTitle = await prisma.scrapedJob.findFirst({
    where: { platform, title, company },
  });
  if (byTitle) {
    await persistManual(byTitle.id);
    return { id: byTitle.id, title: byTitle.title, company: byTitle.company, created: false };
  }

  // cross-platform dedup: same normalized title+company on any platform
  const crossPlatform = await prisma.$queryRaw<{ id: number; title: string; company: string }[]>`
    SELECT id, title, company FROM "ScrapedJob"
    WHERE LOWER(TRIM(title)) = ${normTitle}
      AND LOWER(TRIM(
        REGEXP_REPLACE(company, ',?\s*(inc\.?|llc|ltd\.?|corp\.?|co\.?|gmbh|s\.?a\.?)$', '', 'i')
      )) = ${normCompany}
    LIMIT 1
  `;
  if (crossPlatform.length > 0) {
    await persistManual(crossPlatform[0].id);
    return { id: crossPlatform[0].id, title: crossPlatform[0].title, company: crossPlatform[0].company, created: false };
  }

  const job = await prisma.scrapedJob.create({
    data: {
      platform,
      title,
      company,
      url: normUrl,
      manualApplyUrl: normManual,
      location: location || null,
      description: description || null,
      salary: salary || null,
    },
  });

  return { id: job.id, title: job.title, company: job.company, created: true };
}

export async function saveJobDescription(jobId: number, description: string) {
  const job = await prisma.scrapedJob.findUnique({
    where: { id: jobId },
    select: { description: true },
  });
  if (job?.description && job.description.length >= description.length) return;

  await prisma.scrapedJob.update({
    where: { id: jobId },
    data: { description },
  });
}

export async function getPendingJobs(limit = 50) {
  return prisma.scrapedJob.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: limit,
  });
}

export async function getApprovedUnsyncedJobs() {
  return prisma.scrapedJob.findMany({
    where: { status: "APPROVED", sheetSynced: false },
    orderBy: { createdAt: "asc" },
  });
}

export async function markSheetSynced(ids: number[]) {
  await prisma.scrapedJob.updateMany({
    where: { id: { in: ids } },
    data: { sheetSynced: true },
  });
}

export async function isDuplicate(params: {
  platform: string;
  url: string;
  title: string;
  company: string;
}): Promise<boolean> {
  const normUrl = normalizeUrl(params.url);
  const normTitle = normalizeTitle(params.title);
  const normCompany = normalizeCompany(params.company);

  const byUrl = await prisma.scrapedJob.findFirst({
    where: { platform: params.platform, url: normUrl },
    select: { id: true },
  });
  if (byUrl) return true;

  const byTitle = await prisma.scrapedJob.findFirst({
    where: { platform: params.platform, title: params.title, company: params.company },
    select: { id: true },
  });
  if (byTitle) return true;

  // cross-platform check
  const crossPlatform = await prisma.$queryRaw<{ id: number }[]>`
    SELECT id FROM "ScrapedJob"
    WHERE LOWER(TRIM(title)) = ${normTitle}
      AND LOWER(TRIM(
        REGEXP_REPLACE(company, ',?\s*(inc\.?|llc|ltd\.?|corp\.?|co\.?|gmbh|s\.?a\.?)$', '', 'i')
      )) = ${normCompany}
    LIMIT 1
  `;
  return crossPlatform.length > 0;
}
