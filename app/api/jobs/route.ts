import { NextRequest } from "next/server";

import { findDuplicateJob } from "@/lib/jobDuplicateDetection";
import { upsertJobApplication } from "@/lib/jobApplications";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userIdParam = searchParams.get("userId");

  const userId = userIdParam ? Number(userIdParam) : undefined;

  const sourceFilter = searchParams.get("source"); // optional: jobright, ziprecruiter

  const jobs = await prisma.jobApplication.findMany({
    where: {
      ...(userId ? { userId } : {}),
      ...(sourceFilter ? { source: sourceFilter } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      company: true,
      source: true,
      externalUrl: true,
      jobType: true,
      invitedToInterview: true,
      createdAt: true,
      jobrightMatchScore: true,
      jobDescription: {
        select: {
          id: true,
        },
      },
      tailoredResumes: {
        select: {
          id: true,
        },
      },
      coverLetters: {
        select: {
          id: true,
        },
      },
    },
  });

  // Add flags to match page.tsx structure
  const jobsWithFlags = jobs.map((job) => ({
    ...job,
    hasDescription: !!job.jobDescription,
    hasResume: job.tailoredResumes.length > 0,
    hasCoverLetter: job.coverLetters.length > 0,
  }));

  return new Response(JSON.stringify(jobsWithFlags), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

/** Create a job manually (e.g. from ZipRecruiter: you surf, copy URL + description, add here). */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId: bodyUserId,
      title,
      company,
      externalUrl,
      jobDescription,
      source = "ziprecruiter",
      jobType: bodyJobType,
    } = body;

    if (!externalUrl || typeof externalUrl !== "string" || !externalUrl.trim()) {
      return new Response(
        JSON.stringify({ error: "externalUrl is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!jobDescription || typeof jobDescription !== "string") {
      return new Response(
        JSON.stringify({ error: "jobDescription is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    if (!jobDescription.trim()) {
      return new Response(
        JSON.stringify({ error: "jobDescription cannot be empty" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const requestedUserId =
      typeof bodyUserId === "number"
        ? bodyUserId
        : typeof bodyUserId === "string"
          ? Number(bodyUserId)
          : NaN;
    const explicitProfile =
      Number.isFinite(requestedUserId) && requestedUserId > 0;
    const userId = explicitProfile
      ? requestedUserId
      : Number(process.env.JOBBOT_USER_ID ?? 1);

    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user && !explicitProfile) {
      user = await prisma.user.findFirst();
    }
    if (!user) {
      const msg = explicitProfile
        ? `No user with id ${userId} in the database. The "Mohan" / profile picker uses fixed ids (1, 2); create that User row or add jobs from a profile that exists.`
        : "No user found. Run app setup or create a user.";
      return new Response(JSON.stringify({ error: msg }), {
        status: explicitProfile ? 400 : 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const allowedSources = [
      "jobright",
      "ziprecruiter",
      "linkedin",
      "himalayas",
      "jobgether",
      "hiringcafe",
      "otta",
      "simplify",
      "dice",
      "glassdoor",
      "weworkremotely",
      "remoteineurope",
      "euremotejobs",
      "telegram",
    ];
    const jobSource =
      typeof source === "string" && allowedSources.includes(source) ? source : "ziprecruiter";

    const allowedJobTypes = ["REMOTE", "HYBRID", "ONSITE"];
    const jobType =
      typeof bodyJobType === "string" && allowedJobTypes.includes(bodyJobType.toUpperCase())
        ? (bodyJobType.toUpperCase() as "REMOTE" | "HYBRID" | "ONSITE")
        : "REMOTE";

    const trimTitle = (title && String(title).trim()) || "Unknown";
    const trimCompany = (company && String(company).trim()) || "Unknown";
    const trimUrl = externalUrl.trim();

    const duplicate = await findDuplicateJob({
      userId: user.id,
      externalUrl: trimUrl,
      title: trimTitle,
      company: trimCompany,
    });

    if (duplicate) {
      const existing = await prisma.jobApplication.findUnique({
        where: { id: duplicate.job.id },
        select: {
          id: true,
          title: true,
          company: true,
          source: true,
          externalUrl: true,
          jobType: true,
          invitedToInterview: true,
          createdAt: true,
          jobrightMatchScore: true,
          jobDescription: { select: { id: true } },
          tailoredResumes: { select: { id: true } },
          coverLetters: { select: { id: true } },
        },
      });
      if (existing) {
        const reasonMessages: Record<string, string> = {
          exact_url: "Same job URL already saved.",
          normalized_url: "Same job link already saved (URL matches after normalizing).",
          exact_title_company: "Same job already saved (same company and job title).",
          normalized_title_company: "Same job already saved (company and title match after normalizing).",
        };
        const existingLabel = `${existing.company} – ${existing.title}`;
        return new Response(
          JSON.stringify({
            duplicate: true,
            existingId: existing.id,
            reason: duplicate.reason,
            message: reasonMessages[duplicate.reason] || "This job already exists in your list.",
            existingLabel,
            job: {
              ...existing,
              hasDescription: !!existing.jobDescription,
              hasResume: (existing.tailoredResumes ?? []).length > 0,
              hasCoverLetter: (existing.coverLetters ?? []).length > 0,
            },
          }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const job = await upsertJobApplication({
      userId: user.id,
      source: jobSource,
      title: trimTitle,
      company: trimCompany,
      externalUrl: trimUrl,
      jobType,
    });

    if (!job) {
      return new Response(
        JSON.stringify({
          error: "Job not added: filtered by title or URL (e.g. principal, icims).",
        }),
        { status: 422, headers: { "Content-Type": "application/json" } }
      );
    }

    await prisma.jobDescription.upsert({
      where: { jobApplicationId: job.id },
      create: {
        jobApplicationId: job.id,
        fullText: jobDescription.trim(),
        source: "manual",
      },
      update: { fullText: jobDescription.trim() },
    });

    const created = await prisma.jobApplication.findUnique({
      where: { id: job.id },
      select: {
        id: true,
        title: true,
        company: true,
        source: true,
        externalUrl: true,
        jobType: true,
        invitedToInterview: true,
        createdAt: true,
        jobrightMatchScore: true,
        jobDescription: { select: { id: true } },
        tailoredResumes: { select: { id: true } },
        coverLetters: { select: { id: true } },
      },
    });

    const out = {
      ...created,
      hasDescription: true,
      hasResume: (created?.tailoredResumes ?? []).length > 0,
      hasCoverLetter: (created?.coverLetters ?? []).length > 0,
    };

    return new Response(JSON.stringify(out), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("POST /api/jobs error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to create job" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

