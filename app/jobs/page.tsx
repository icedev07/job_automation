import { prisma } from "@/lib/prisma";

import JobsTable from "./JobsTable";

async function getJobs(userId?: number) {
  try {
    const jobs = await prisma.jobApplication.findMany({
      where: userId ? { userId } : {},
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

    // Shape data for the UI: add flags and drop relation arrays (serialize for client)
    return jobs.map((job) => {
      const { jobDescription, tailoredResumes, coverLetters, ...rest } = job;
      return {
        ...rest,
        createdAt: job.createdAt.toISOString(),
        jobType: job.jobType ?? "REMOTE",
        hasDescription: !!jobDescription,
        hasResume: (tailoredResumes ?? []).length > 0,
        hasCoverLetter: (coverLetters ?? []).length > 0,
      };
    });
  } catch (err) {
    console.error("getJobs error:", err);
    throw err;
  }
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams?: { userId?: string };
}) {
  let jobs: Awaited<ReturnType<typeof getJobs>>;
  let error: string | null = null;
  const userIdFromQuery = searchParams?.userId ? Number(searchParams.userId) : NaN;
  const userId = Number.isFinite(userIdFromQuery) && userIdFromQuery > 0
    ? userIdFromQuery
    : Number(process.env.JOBBOT_USER_ID ?? 1);

  try {
    jobs = await getJobs(userId);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    error = `Failed to load jobs: ${message}. Check that the database is running and DATABASE_URL in .env is correct.`;
    jobs = [];
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 600, marginBottom: "1rem" }}>
        Saved Job Applications
      </h1>
      {error && (
        <p style={{ color: "#c00", marginBottom: "1rem" }}>{error}</p>
      )}
      {!error && (
        <>
          {jobs.length === 0 && (
            <p style={{ color: "#555", marginBottom: "1rem" }}>
              No jobs for this profile yet. Use <strong>Add job (manual)</strong> below, or run a scan / import for this user.
            </p>
          )}
          <JobsTable key={userId} initialJobs={jobs} userId={userId} />
        </>
      )}
    </main>
  );
}

