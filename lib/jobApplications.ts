import { ApplicationStatus } from "../generated/prisma";
import type { JobApplication } from "../generated/prisma";
import type { JobType } from "../generated/prisma";

import { findDuplicateAcrossAllJobs } from "./jobDuplicateDetection";
import { shouldSkipJob } from "./jobSkipRules";
import { prisma } from "./prisma";

export async function upsertJobApplication(params: {
  userId: number;
  source?: string;  // jobright, ziprecruiter, etc. (default: jobright)
  title: string;
  company: string;
  externalUrl: string;
  jobrightUrl?: string | null;
  location?: string | null;
  jobType?: JobType;  // remote, hybrid, onsite (default: REMOTE)
  jobrightMatchScore?: number | null;
  jobrightBoard?: string | null;
  jobrightJobId?: string | null;
}): Promise<JobApplication | null> {
  const {
    userId,
    source = "jobright",
    title,
    company,
    externalUrl,
    jobrightUrl,
    location,
    jobType = "REMOTE",
    jobrightMatchScore,
    jobrightBoard,
    jobrightJobId,
  } = params;

  if (await shouldSkipJob({ title, company, externalUrl })) {
    return null;
  }

  // Skip if same job already exists in 1-Click jobs (avoid duplicate across tables)
  const crossDuplicate = await findDuplicateAcrossAllJobs({ title, company, userId });
  if (crossDuplicate?.table === "OneClickJob") {
    return null;
  }

  // Same title+company for this user only (different users may save the same posting)
  const duplicateSameUser = await prisma.jobApplication.findFirst({
    where: {
      userId,
      title,
      company,
    },
  });

  if (duplicateSameUser) {
    return duplicateSameUser;
  }

  // Find existing record using the compound unique constraint (userId + externalUrl)
  const existing = await prisma.jobApplication.findFirst({
    where: {
      userId,
      externalUrl,
    },
  });

  if (existing) {
    // Update existing record
    return prisma.jobApplication.update({
      where: { id: existing.id },
      data: {
        source,
        title,
        company,
        jobrightUrl,
        location,
        jobrightMatchScore,
        jobrightBoard,
        jobrightJobId,
      },
    });
  } else {
    // Create new record
    return prisma.jobApplication.create({
      data: {
        userId,
        source,
        title,
        company,
        externalUrl,
        jobrightUrl,
        location,
        jobType,
        jobrightMatchScore,
        jobrightBoard,
        jobrightJobId,
        status: ApplicationStatus.SAVED,
      },
    });
  }
}

