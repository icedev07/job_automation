import { prisma } from "@/lib/prisma";
import OneClickJobsTable from "./OneClickJobsTable";

type OneClickJobRow = {
  id: number;
  source: string;
  title: string;
  company: string;
  externalUrl: string;
  fullText: string;
  appliedAt: Date | null;
  createdAt: Date;
};

async function getOneClickJobs(userId?: number): Promise<Array<OneClickJobRow & { appliedAt: string | null; createdAt: string }>> {
  const delegate = (prisma as any).oneClickJob;
  if (delegate && typeof delegate.findMany === "function") {
    const jobs = await delegate.findMany({
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
    return jobs.map((j: OneClickJobRow) => ({
      ...j,
      createdAt: j.createdAt.toISOString(),
      appliedAt: j.appliedAt?.toISOString() ?? null,
    }));
  }
  const raw = userId
    ? await prisma.$queryRaw<Array<Record<string, unknown>>>`
        SELECT id, "userId", source, title, company, "externalUrl", "fullText", "appliedAt", "createdAt"
        FROM "OneClickJob"
        WHERE "userId" = ${userId}
        ORDER BY "createdAt" DESC
      `
    : await prisma.$queryRaw<Array<Record<string, unknown>>>`
        SELECT id, "userId", source, title, company, "externalUrl", "fullText", "appliedAt", "createdAt"
        FROM "OneClickJob"
        ORDER BY "createdAt" DESC
      `;
  return raw.map((row) => {
    const createdAtVal = row.createdAt ?? row.createdat;
    const appliedAtVal = row.appliedAt ?? row.appliedat;
    const createdAt = createdAtVal instanceof Date ? createdAtVal : new Date(String(createdAtVal));
    const appliedAt = appliedAtVal != null ? (appliedAtVal instanceof Date ? appliedAtVal : new Date(String(appliedAtVal))) : null;
    return {
      id: Number(row.id),
      source: String(row.source ?? ""),
      title: String(row.title ?? ""),
      company: String(row.company ?? ""),
      externalUrl: String(row.externalUrl ?? row.externalurl ?? ""),
      fullText: String(row.fullText ?? row.fulltext ?? ""),
      appliedAt: appliedAt?.toISOString() ?? null,
      createdAt: createdAt.toISOString(),
    };
  });
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
