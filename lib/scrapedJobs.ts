import { prisma } from "./prisma";
import { shouldSkipJob } from "./jobSkipRules";

export async function upsertScrapedJob(params: {
  platform: string;
  title: string;
  company: string;
  url: string;
  location?: string | null;
  description?: string | null;
  salary?: string | null;
}): Promise<{ id: number; title: string; company: string } | null> {
  const { platform, title, company, url, location, description, salary } = params;

  if (await shouldSkipJob({ title, company, externalUrl: url })) {
    return null;
  }

  const existing = await prisma.scrapedJob.findFirst({
    where: { platform, url },
  });
  if (existing) return { id: existing.id, title: existing.title, company: existing.company };

  const titleDupe = await prisma.scrapedJob.findFirst({
    where: { platform, title, company },
  });
  if (titleDupe) return { id: titleDupe.id, title: titleDupe.title, company: titleDupe.company };

  const job = await prisma.scrapedJob.create({
    data: {
      platform,
      title,
      company,
      url,
      location: location || null,
      description: description || null,
      salary: salary || null,
    },
  });

  return { id: job.id, title: job.title, company: job.company };
}

export async function saveJobDescription(jobId: number, description: string) {
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
  const byUrl = await prisma.scrapedJob.findFirst({
    where: { platform: params.platform, url: params.url },
    select: { id: true },
  });
  if (byUrl) return true;

  const byTitle = await prisma.scrapedJob.findFirst({
    where: { platform: params.platform, title: params.title, company: params.company },
    select: { id: true },
  });
  return !!byTitle;
}
