/**
 * Output JSON array of jobs needing docs with pre-built prompts for nodriver backfill.
 * Used by the Python nodriver script so ChatGPT interaction stays in the same browser.
 *
 * Usage: npx tsx scripts/getJobsForSeleniumBackfill.ts
 * Output: one JSON line per job or a JSON array to stdout
 */

import "dotenv/config";
import * as path from "path";
import * as fs from "fs";
import { prisma } from "../lib/prisma";
import { buildResumePrompt, buildCoverLetterPrompt } from "../lib/chatgptUiClient";
import { loadMohanExperienceInventory } from "../lib/mohanExperienceInventory";
import { extractTextFromResumeTemplate } from "../lib/documentGenerator";

const mammoth = require("mammoth");

/** Match lib/generateDocuments.ts: Mohan (userId 2) never uses Jiayong samples/templates. */
async function getBaseResumeTextForUser(userId: number): Promise<string> {
  const cwd = process.cwd();

  const mohanSamples = [
    process.env.MOHAN_RESUME_SAMPLE_PATH?.trim(),
    path.join(cwd, "Resumes_Mohan", "Templates", "Mohan Sha_Sample.docx"),
    path.join(cwd, "Resumes_Mohan", "Templates", "Mohan_Sha_Sample.docx"),
    path.join(cwd, "Resumes", "Templates", "Mohan Sha_Sample.docx"),
    path.join(cwd, "Mohan Sha.docx"),
  ].filter((p): p is string => Boolean(p));

  const jiayongSamples = [
    process.env.RESUME_SAMPLE_PATH?.trim(),
    path.join(cwd, "Resumes", "Templates", "Jiayong Lin_Sample.docx"),
  ].filter((p): p is string => Boolean(p));

  const mohanTemplates = [
    path.join(cwd, "Resumes_Mohan", "Templates", "Mohan_Sha.docx"),
    path.join(cwd, "Resumes", "Templates", "Mohan Sha.docx"),
  ];
  const jiayongTemplate = path.join(cwd, "Resumes", "Templates", "Jiayong Lin.docx");

  async function trySample(paths: string[]): Promise<string | null> {
    for (const raw of paths) {
      const p = path.isAbsolute(raw) ? raw : path.join(cwd, raw);
      if (!fs.existsSync(p)) continue;
      const buffer = fs.readFileSync(p);
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    return null;
  }

  if (userId === 2) {
    const fromSample = await trySample(mohanSamples);
    if (fromSample) return fromSample;
    for (const t of mohanTemplates) {
      if (fs.existsSync(t)) return extractTextFromResumeTemplate(t);
    }
    throw new Error(
      "getJobsForSeleniumBackfill: no Mohan base resume found (userId=2). Set MOHAN_RESUME_SAMPLE_PATH or add Mohan sample/template files. Refusing Jiayong's resume."
    );
  }

  const fromSample = await trySample(jiayongSamples);
  if (fromSample) return fromSample;
  return extractTextFromResumeTemplate(jiayongTemplate);
}

async function main() {
  const filterJobIdRaw = process.env.CHATGPT_BACKFILL_JOB_ID?.trim();
  const filterUserIdRaw = process.env.CHATGPT_BACKFILL_USER_ID?.trim();
  const filterJobId =
    filterJobIdRaw && Number.isFinite(Number(filterJobIdRaw)) && Number(filterJobIdRaw) > 0
      ? Number(filterJobIdRaw)
      : undefined;
  const filterUserId =
    filterUserIdRaw && Number.isFinite(Number(filterUserIdRaw)) && Number(filterUserIdRaw) > 0
      ? Number(filterUserIdRaw)
      : undefined;

  const jobs = await prisma.jobApplication.findMany({
    where: {
      ...(filterJobId ? { id: filterJobId } : {}),
      ...(filterUserId ? { userId: filterUserId } : {}),
      jobDescription: { isNot: null },
      tailoredResumes: { none: {} },
      coverLetters: { none: {} },
    },
    include: { jobDescription: true },
    orderBy: { createdAt: "asc" },
  });

  if (jobs.length === 0) {
    console.log(JSON.stringify([]));
    await prisma.$disconnect();
    return;
  }

  const resumeCache = new Map<number, string>();
  async function baseTextFor(jobUserId: number): Promise<string> {
    if (!resumeCache.has(jobUserId)) {
      resumeCache.set(jobUserId, await getBaseResumeTextForUser(jobUserId));
    }
    return resumeCache.get(jobUserId)!;
  }

  const mohanInventoryCache = { loaded: false, text: "" as string };
  function mohanInventory(): string {
    if (!mohanInventoryCache.loaded) {
      mohanInventoryCache.text = loadMohanExperienceInventory();
      mohanInventoryCache.loaded = true;
    }
    return mohanInventoryCache.text;
  }

  const out: Array<{ jobId: number; company: string; role: string; resumePrompt: string; coverLetterPrompt: string }> = [];

  for (const job of jobs) {
    const baseResumeText = await baseTextFor(job.userId);
    const jobDescription = job.jobDescription!.fullText;
    const promptOpts =
      job.userId === 2
        ? {
            userId: 2 as const,
            experienceInventory: mohanInventory(),
            jobTitle: job.title,
          }
        : undefined;
    const resumePrompt = buildResumePrompt(baseResumeText, jobDescription, promptOpts);
    const coverLetterPrompt = buildCoverLetterPrompt(
      baseResumeText,
      jobDescription,
      job.company,
      job.title,
      promptOpts
    );
    out.push({
      jobId: job.id,
      company: job.company,
      role: job.title,
      resumePrompt,
      coverLetterPrompt,
    });
  }

  console.log(JSON.stringify(out));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
