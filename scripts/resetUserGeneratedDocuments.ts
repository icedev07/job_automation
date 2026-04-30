/**
 * Delete generated TailoredResume / CoverLetter rows (and matching on-disk outputs) so jobs can be regenerated.
 * On-disk cleanup removes PDFs (DOCX→PDF outputs) explicitly, then deletes the whole job output folder.
 * Optionally deletes base Resume rows for that user so the next run recreates from .docx templates.
 *
 * Usage:
 *   npx tsx scripts/resetUserGeneratedDocuments.ts --userId=2 --on=2026-04-02 --dry-run
 *   npx tsx scripts/resetUserGeneratedDocuments.ts --userId=2 --on=2026-04-02 --yes
 *   npx tsx scripts/resetUserGeneratedDocuments.ts --userId=2 --all --yes
 *   npx tsx scripts/resetUserGeneratedDocuments.ts --userId=2 --all --yes --keep-base-resume
 *
 * --on=YYYY-MM-DD uses UTC midnight–to–next-day for createdAt on TailoredResume and CoverLetter.
 */
import "dotenv/config";
import * as path from "path";
import { removeJobOutputFolder } from "../lib/documentGenerator";
import { prisma } from "../lib/prisma";

function parseArgs(): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (const a of process.argv.slice(2)) {
    if (a === "--dry-run") {
      out.dryRun = true;
      continue;
    }
    if (a === "--yes") {
      out.yes = true;
      continue;
    }
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
    else if (a.startsWith("--")) out[a.slice(2)] = true;
  }
  return out;
}

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
  const args = parseArgs();
  const userId = Number(args.userId ?? 2);
  const on = String(args.on ?? "").trim();
  const all = args.all === true || String(args.all) === "true";
  const dryRun = args.dryRun === true;
  const keepBaseResume =
    args["keep-base-resume"] === true || String(args["keep-base-resume"]) === "true";
  const confirmed = args.yes === true || process.argv.includes("--yes");

  if (!Number.isFinite(userId) || userId < 1) {
    throw new Error("Invalid --userId");
  }
  if (!all && !on) {
    throw new Error("Pass --on=YYYY-MM-DD (UTC day) or --all");
  }

  const outputDir =
    userId === 2
      ? (process.env.MOHAN_RESUMES_OUTPUT_DIR || "Resumes_Mohan").trim()
      : (process.env.RESUMES_OUTPUT_DIR || "Resumes").trim();
  const baseOut = path.isAbsolute(outputDir) ? outputDir : path.join(process.cwd(), outputDir);

  const dateFilter =
    all || !on
      ? {}
      : (() => {
          const { start, end } = dayBoundsUtc(on);
          return { createdAt: { gte: start, lt: end } as const };
        })();

  const tailoredWhere = { jobApplication: { userId }, ...dateFilter };
  const coverWhere = { jobApplication: { userId }, ...dateFilter };

  const tailoredList = await prisma.tailoredResume.findMany({
    where: tailoredWhere,
    select: { id: true, jobApplicationId: true, createdAt: true },
  });
  const coverList = await prisma.coverLetter.findMany({
    where: coverWhere,
    select: { id: true, jobApplicationId: true, createdAt: true },
  });

  const jobIds = new Set<number>();
  for (const r of tailoredList) jobIds.add(r.jobApplicationId);
  for (const r of coverList) jobIds.add(r.jobApplicationId);

  console.log(
    JSON.stringify(
      {
        userId,
        mode: all ? "all" : `on=${on} UTC`,
        tailoredRows: tailoredList.length,
        coverRows: coverList.length,
        affectedJobIds: [...jobIds].sort((a, b) => a - b),
        outputDir: baseOut,
        dryRun,
      },
      null,
      2
    )
  );

  if (dryRun) {
    return;
  }

  if (!confirmed) {
    console.error("Re-run with --yes to apply (or --dry-run to preview).");
    process.exit(2);
  }

  const delT = await prisma.tailoredResume.deleteMany({ where: tailoredWhere });
  const delC = await prisma.coverLetter.deleteMany({ where: coverWhere });

  const jobsToCheck = [...jobIds];
  const removedFolders: string[] = [];
  let totalPdfFilesRemoved = 0;

  for (const jobId of jobsToCheck) {
    const left = await prisma.tailoredResume.count({ where: { jobApplicationId: jobId } });
    if (left === 0) {
      await prisma.jobApplication.update({
        where: { id: jobId },
        data: { status: "SAVED" },
      });
    }
  }

  const jobsMeta =
    jobsToCheck.length === 0
      ? []
      : await prisma.jobApplication.findMany({
          where: { id: { in: jobsToCheck }, userId },
          select: { id: true, company: true, title: true },
        });

  for (const j of jobsMeta) {
    const left = await prisma.tailoredResume.count({ where: { jobApplicationId: j.id } });
    if (left > 0) continue;
    const { deletedPdfFiles, removed, folderPath } = removeJobOutputFolder(baseOut, j.company, j.title);
    totalPdfFilesRemoved += deletedPdfFiles;
    if (removed) removedFolders.push(folderPath);
  }

  let deletedResumes = 0;
  if (!keepBaseResume) {
    const resumes = await prisma.resume.findMany({ where: { userId }, select: { id: true } });
    for (const { id } of resumes) {
      const [t, c] = await Promise.all([
        prisma.tailoredResume.count({ where: { baseResumeId: id } }),
        prisma.coverLetter.count({ where: { baseResumeId: id } }),
      ]);
      if (t + c === 0) {
        await prisma.resume.delete({ where: { id } });
        deletedResumes += 1;
      }
    }
    if (deletedResumes === 0 && resumes.length > 0) {
      console.warn(
        "[docs:reset-user] Kept Resume row(s): other TailoredResume/CoverLetter still reference them. Next generate still uses existing rawText unless you run a full wipe (--all) or remove older generated rows."
      );
    }
  }

  console.log(
    JSON.stringify(
      {
        deletedTailoredResumes: delT.count,
        deletedCoverLetters: delC.count,
        deletedBaseResumes: deletedResumes,
        removedFolders: removedFolders.length,
        deletedPdfFiles: totalPdfFilesRemoved,
        keptBaseResume: keepBaseResume,
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
