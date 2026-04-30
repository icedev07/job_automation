/**
 * Copy JobApplication rows from one user to another for a single local-calendar day.
 * Copies scalar fields + JobDescription (posting text) if present.
 * Does not copy tailored resumes or cover letters.
 *
 * Usage:
 *   npx tsx scripts/copyUserJobsForDate.ts --from=1 --to=2 --date=2026-04-14
 * Omit --date to use today's local date.
 */
import "dotenv/config";
import { ApplicationStatus } from "../generated/prisma";

import { prisma } from "../lib/prisma";

function parseArgs() {
  let fromUserId = 1;
  let toUserId = 2;
  let dateStr: string | null = null;
  for (const a of process.argv.slice(2)) {
    if (a.startsWith("--from=")) fromUserId = Number(a.slice(7));
    else if (a.startsWith("--to=")) toUserId = Number(a.slice(5));
    else if (a.startsWith("--date=")) dateStr = a.slice(7).trim() || null;
  }
  return { fromUserId, toUserId, dateStr };
}

function localDayBounds(dateStr: string | null): { start: Date; end: Date; label: string } {
  if (dateStr) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
    if (!m) {
      throw new Error(`Invalid --date=${dateStr}; use YYYY-MM-DD`);
    }
    const y = Number(m[1]);
    const mo = Number(m[2]) - 1;
    const d = Number(m[3]);
    const start = new Date(y, mo, d, 0, 0, 0, 0);
    const end = new Date(y, mo, d + 1, 0, 0, 0, 0);
    return { start, end, label: dateStr };
  }
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return {
    start,
    end,
    label: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`,
  };
}

async function main() {
  const { fromUserId, toUserId, dateStr } = parseArgs();
  const { start, end, label } = localDayBounds(dateStr);

  const sourceJobs = await prisma.jobApplication.findMany({
    where: {
      userId: fromUserId,
      createdAt: { gte: start, lt: end },
    },
    include: { jobDescription: true },
    orderBy: { id: "asc" },
  });

  if (sourceJobs.length === 0) {
    console.log(
      `No jobs for userId=${fromUserId} with createdAt in local day ${label}.`
    );
    return;
  }

  const toUser = await prisma.user.findUnique({ where: { id: toUserId } });
  if (!toUser) {
    console.error(`Target user id=${toUserId} does not exist. Run: npx tsx scripts/ensureProfileUsers.ts`);
    process.exit(1);
  }

  let created = 0;
  let skippedUrl = 0;
  let skippedTitleCompany = 0;

  for (const j of sourceJobs) {
    const dupUrl = await prisma.jobApplication.findFirst({
      where: { userId: toUserId, externalUrl: j.externalUrl },
    });
    if (dupUrl) {
      skippedUrl++;
      console.log(`Skip (URL exists for target): ${j.company} – ${j.title} [src id=${j.id}]`);
      continue;
    }
    const dupTc = await prisma.jobApplication.findFirst({
      where: { userId: toUserId, title: j.title, company: j.company },
    });
    if (dupTc) {
      skippedTitleCompany++;
      console.log(`Skip (title+company exists for target): ${j.company} – ${j.title} [src id=${j.id}]`);
      continue;
    }

    await prisma.$transaction(async (tx) => {
      const newJob = await tx.jobApplication.create({
        data: {
          userId: toUserId,
          source: j.source,
          jobrightJobId: j.jobrightJobId,
          title: j.title,
          company: j.company,
          location: j.location,
          jobType: j.jobType,
          jobrightMatchScore: j.jobrightMatchScore,
          jobrightBoard: j.jobrightBoard,
          jobrightUrl: j.jobrightUrl,
          externalUrl: j.externalUrl,
          status: ApplicationStatus.SAVED,
          invitedToInterview: false,
          appliedAt: null,
        },
      });
      if (j.jobDescription) {
        await tx.jobDescription.create({
          data: {
            jobApplicationId: newJob.id,
            fullText: j.jobDescription.fullText,
            source: j.jobDescription.source,
          },
        });
      }
    });
    created++;
    console.log(`Created for userId=${toUserId}: ${j.company} – ${j.title} [from id=${j.id}]`);
  }

  console.log(
    JSON.stringify(
      {
        localDay: label,
        fromUserId,
        toUserId,
        sourceCount: sourceJobs.length,
        created,
        skippedUrl,
        skippedTitleCompany,
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
