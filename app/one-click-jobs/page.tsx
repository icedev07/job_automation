import { prisma } from "@/lib/prisma";
import OneClickJobsTable from "./OneClickJobsTable";

async function getOneClickJobs(userId?: number) {
  const jobs = await prisma.oneClickJob.findMany({
    where: userId ? { userId } : {},
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      source: true,
      title: true,
      company: true,
      externalUrl: true,
      fullText: true,
      appliedAt: true,
      createdAt: true,
    },
  });
  return jobs.map((j) => ({
    ...j,
    createdAt: j.createdAt.toISOString(),
    appliedAt: j.appliedAt?.toISOString() ?? null,
  }));
}

export default async function OneClickJobsPage({
  searchParams,
}: {
  searchParams?: { userId?: string };
}) {
  const userIdFromQuery = searchParams?.userId ? Number(searchParams.userId) : NaN;
  const userId = Number.isFinite(userIdFromQuery) && userIdFromQuery > 0
    ? userIdFromQuery
    : Number(process.env.JOBBOT_USER_ID ?? 1);
  const jobs = await getOneClickJobs(userId);

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 600, marginBottom: "1rem" }}>
        1-Click jobs
      </h1>
      <p style={{ marginBottom: "1rem", color: "#555", fontSize: "0.875rem" }}>
        Easy Apply jobs from ZipRecruiter (and later Simplify). Open the link to apply with one click; no docs needed.
      </p>
      <OneClickJobsTable key={userId} initialJobs={jobs} userId={userId} />
    </main>
  );
}
