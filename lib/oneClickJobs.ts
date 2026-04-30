/**
 * One-Click / Easy Apply jobs: saved to OneClickJob table (no tailored docs).
 * Used by ZipRecruiter (and later Simplify) when the job has 1-Click Apply.
 */

import type { OneClickJob } from "../generated/prisma";
import { findDuplicateAcrossAllJobs, normalizeCompanyStrict, normalizeTitleForDedup } from "./jobDuplicateDetection";
import { prisma } from "./prisma";
import { shouldSkipJob } from "./jobSkipRules";

export async function upsertOneClickJob(params: {
  userId: number;
  source: string;
  title: string;
  company: string;
  externalUrl: string;
  fullText: string;
}): Promise<OneClickJob | null> {
  const { userId, source, title, company, externalUrl, fullText } = params;

  if (await shouldSkipJob({ title, company, externalUrl })) {
    return null;
  }

  const existingByUrl = await prisma.oneClickJob.findFirst({
    where: { userId, externalUrl },
  });

  if (existingByUrl) {
    return prisma.oneClickJob.update({
      where: { id: existingByUrl.id },
      data: { source, title, company, fullText },
    });
  }

  // Skip if same job already exists in full jobs (avoid duplicate across tables)
  const crossDuplicate = await findDuplicateAcrossAllJobs({ title, company, userId });
  if (crossDuplicate?.table === "JobApplication") {
    return null;
  }

  // Same job (title+company) already in OneClickJob? Update that row instead of creating a second one.
  const normTitle = normalizeTitleForDedup(title);
  const normCompany = normalizeCompanyStrict(company);
  const existingOneClick = await prisma.oneClickJob.findMany({
    where: { userId },
    select: { id: true, title: true, company: true },
  });
  for (const row of existingOneClick) {
    if (
      normalizeCompanyStrict(row.company) === normCompany &&
      normalizeTitleForDedup(row.title) === normTitle
    ) {
      return prisma.oneClickJob.update({
        where: { id: row.id },
        data: { source, title, company, externalUrl, fullText },
      });
    }
  }

  return prisma.oneClickJob.create({
    data: {
      userId,
      source,
      title,
      company,
      externalUrl,
      fullText,
    },
  });
}
