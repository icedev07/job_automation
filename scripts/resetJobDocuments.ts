/**
 * Delete generated documents (TailoredResume + CoverLetter) for one job so backfill can regenerate.
 * Usage:
 *   npx tsx scripts/resetJobDocuments.ts --last --userId=2
 *   npx tsx scripts/resetJobDocuments.ts --jobId=<id> [--userId=2]
 *   npx tsx scripts/resetJobDocuments.ts --company=n8n --title-contains="Core Workflow Engine" [--userId=2]
 *   npx tsx scripts/resetJobDocuments.ts "--company=greenslate,softgic" --on=2026-04-06 --userId=2
 *     (comma or semicolon between fragments; quote in PowerShell; --on=YYYY-MM-DD filters JobApplication.createdAt UTC)
 */
import "dotenv/config";
import { prisma } from "../lib/prisma";

function dayBoundsUtc(ymd: string): { start: Date; end: Date } {
  const start = new Date(`${ymd}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) {
    throw new Error(`Invalid --on date (use YYYY-MM-DD): ${ymd}`);
  }
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

async function main() {
  const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const m = a.match(/^--([^=]+)=(.*)$/);
      return m ? [m[1], m[2]] : [a, true];
    })
  );

  const userId = Number(args.userId ?? "2");
  const company = String(args.company ?? "").trim();
  const titleContains = String(args["title-contains"] ?? "").trim();
  const on = String(args.on ?? "").trim();
  const jobIdArg = args.jobId != null ? Number(args.jobId) : NaN;
  const useLast =
    process.argv.includes("--last") ||
    args.last === true ||
    String(args.last ?? "").toLowerCase() === "true";

  // Batch: multiple companies / name fragments on one calendar day (UTC)
  if (company && !titleContains && !useLast && !(Number.isFinite(jobIdArg) && jobIdArg > 0)) {
    if (!on) {
      throw new Error(
        "When using --company without --title-contains, pass --on=YYYY-MM-DD (UTC) so only that day’s rows are reset."
      );
    }
    const { start, end } = dayBoundsUtc(on);
    const fragments = company
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (fragments.length === 0) {
      throw new Error("Empty --company");
    }
    const jobs = await prisma.jobApplication.findMany({
      where: {
        userId,
        createdAt: { gte: start, lt: end },
        OR: fragments.map((f) => ({
          company: { contains: f, mode: "insensitive" as const },
        })),
      },
      orderBy: { id: "asc" },
    });
    if (jobs.length === 0) {
      throw new Error(`No jobs for userId=${userId} matching company fragment(s) on ${on} (UTC).`);
    }
    const results: unknown[] = [];
    for (const j of jobs) {
      const [r, c] = await Promise.all([
        prisma.tailoredResume.deleteMany({ where: { jobApplicationId: j.id } }),
        prisma.coverLetter.deleteMany({ where: { jobApplicationId: j.id } }),
      ]);
      await prisma.jobApplication.update({
        where: { id: j.id },
        data: { status: "SAVED" },
      });
      results.push({
        jobId: j.id,
        company: j.company,
        title: j.title,
        deletedTailoredResumes: r.count,
        deletedCoverLetters: c.count,
        statusSetTo: "SAVED",
      });
    }
    console.log(JSON.stringify({ batch: true, onUtc: on, count: results.length, jobs: results }, null, 2));
    return;
  }

  let job = null;
  if (useLast) {
    job = await prisma.jobApplication.findFirst({
      where: { userId },
      orderBy: { id: "desc" },
    });
  } else if (Number.isFinite(jobIdArg) && jobIdArg > 0) {
    job = await prisma.jobApplication.findFirst({
      where: { id: jobIdArg, userId },
    });
  } else if (company && titleContains) {
    job = await prisma.jobApplication.findFirst({
      where: {
        userId,
        company: { contains: company, mode: "insensitive" },
        title: { contains: titleContains, mode: "insensitive" },
      },
    });
  } else {
    throw new Error(
      "Usage: npx tsx scripts/resetJobDocuments.ts --last [--userId=2]\n" +
        "   or: npx tsx scripts/resetJobDocuments.ts --jobId=<id> [--userId=2]\n" +
        "   or: npx tsx scripts/resetJobDocuments.ts --company=n8n --title-contains=\"Core Workflow\" [--userId=2]\n" +
        "   or: npx tsx scripts/resetJobDocuments.ts --company=greenslate,softgic --on=YYYY-MM-DD --userId=2"
    );
  }

  if (!job) {
    throw new Error("Job not found for the given criteria.");
  }

  const [r, c] = await Promise.all([
    prisma.tailoredResume.deleteMany({ where: { jobApplicationId: job.id } }),
    prisma.coverLetter.deleteMany({ where: { jobApplicationId: job.id } }),
  ]);

  await prisma.jobApplication.update({
    where: { id: job.id },
    data: { status: "SAVED" },
  });

  console.log(
    JSON.stringify(
      {
        jobId: job.id,
        company: job.company,
        title: job.title,
        deletedTailoredResumes: r.count,
        deletedCoverLetters: c.count,
        statusSetTo: "SAVED",
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
  .finally(async () => {
    await prisma.$disconnect();
  });
