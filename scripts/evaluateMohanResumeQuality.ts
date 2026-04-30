/**
 * Heuristic quality report: Mohan tailored resume text vs stored job description.
 * Metrics: keyword coverage (top JD terms found in resume), resume length, JD length.
 *
 * Usage: npx tsx scripts/evaluateMohanResumeQuality.ts
 * Optional: --limit=50   (only first N jobs for quick run)
 * Optional: --jobId=3576 (single-job report: coverage, misses, excerpts, prompt versions)
 */
import "dotenv/config";
import { prisma } from "../lib/prisma";

const STOPWORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "are", "you", "your", "our", "their",
  "will", "have", "has", "had", "into", "about", "who", "what", "when", "where", "how", "why",
  "all", "any", "can", "should", "could", "would", "were", "was", "is", "to", "of", "in", "on",
  "at", "as", "by", "or", "an", "a", "we", "us", "they", "them", "it", "its", "be", "been",
]);

function normalize(text: string): string {
  return (text || "").toLowerCase().replace(/[^a-z0-9+#.\s]/g, " ");
}

function topKeywords(text: string, limit: number): string[] {
  const words = normalize(text)
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w);
}

function coveragePercent(jdKeywords: string[], resumeNorm: string): number {
  if (jdKeywords.length === 0) return 0;
  let hits = 0;
  for (const k of jdKeywords) {
    if (resumeNorm.includes(k)) hits++;
  }
  return (hits / jdKeywords.length) * 100;
}

function keywordMisses(jdKeywords: string[], resumeNorm: string): string[] {
  return jdKeywords.filter((k) => !resumeNorm.includes(k));
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

async function main() {
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : undefined;
  const jobIdArg = process.argv.find((a) => a.startsWith("--jobId="));
  const filterJobId =
    jobIdArg && Number.isFinite(Number(jobIdArg.split("=")[1])) && Number(jobIdArg.split("=")[1]) > 0
      ? Number(jobIdArg.split("=")[1])
      : undefined;

  if (filterJobId != null) {
    const job = await prisma.jobApplication.findFirst({
      where: {
        id: filterJobId,
        userId: 2,
        jobDescription: { isNot: null },
        tailoredResumes: { some: {} },
      },
      include: {
        jobDescription: true,
        tailoredResumes: { orderBy: { createdAt: "desc" }, take: 1 },
        coverLetters: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    if (!job) {
      throw new Error(
        `Job ${filterJobId} not found for userId=2, or missing JD / tailored resume.`
      );
    }
    const jd = job.jobDescription!.fullText;
    const resume = job.tailoredResumes[0]?.outputText ?? "";
    const cover = job.coverLetters[0]?.outputText ?? "";
    const jdKeywords = topKeywords(jd, 45);
    const resumeNorm = normalize(resume);
    const cov = coveragePercent(jdKeywords, resumeNorm);
    const misses = keywordMisses(jdKeywords, resumeNorm);
    console.log(
      JSON.stringify(
        {
          focusJob: {
            jobId: job.id,
            company: job.company,
            title: job.title,
            coveragePercent: Math.round(cov * 10) / 10,
            jdChars: jd.length,
            resumeChars: resume.length,
            coverChars: cover.length,
            promptVersion: {
              resume: job.tailoredResumes[0]?.promptVersion,
              cover: job.coverLetters[0]?.promptVersion,
            },
            llmModel: {
              resume: job.tailoredResumes[0]?.llmModel,
              cover: job.coverLetters[0]?.llmModel,
            },
            topJdKeywordsNotInResume: misses,
            resumeExcerpt: resume.slice(0, 1800),
            coverLetterExcerpt: cover.slice(0, 1200),
          },
          note:
            "coveragePercent = share of top-45 JD keyword stems found in resume (heuristic, not ATS).",
        },
        null,
        2
      )
    );
    return;
  }

  const jobs = await prisma.jobApplication.findMany({
    where: {
      userId: 2,
      jobDescription: { isNot: null },
      tailoredResumes: { some: {} },
    },
    include: {
      jobDescription: true,
      tailoredResumes: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { id: "asc" },
    ...(typeof limit === "number" && Number.isFinite(limit) && limit > 0 ? { take: limit } : {}),
  });

  const rows: Array<{
    jobId: number;
    company: string;
    title: string;
    jdChars: number;
    resumeChars: number;
    keywordCount: number;
    coveragePercent: number;
  }> = [];

  for (const job of jobs) {
    const jd = job.jobDescription!.fullText;
    const resume = job.tailoredResumes[0]?.outputText ?? "";
    const jdKeywords = topKeywords(jd, 45);
    const resumeNorm = normalize(resume);
    const cov = coveragePercent(jdKeywords, resumeNorm);
    rows.push({
      jobId: job.id,
      company: job.company,
      title: job.title,
      jdChars: jd.length,
      resumeChars: resume.length,
      keywordCount: jdKeywords.length,
      coveragePercent: Math.round(cov * 10) / 10,
    });
  }

  const covs = rows.map((r) => r.coveragePercent);
  const mean = covs.length ? covs.reduce((a, b) => a + b, 0) / covs.length : 0;
  const sorted = [...rows].sort((a, b) => a.coveragePercent - b.coveragePercent);
  const bottom = sorted.slice(0, Math.min(8, sorted.length));
  const top = sorted.slice(-Math.min(8, sorted.length)).reverse();

  console.log(
    JSON.stringify(
      {
        userId: 2,
        evaluatedJobs: rows.length,
        note:
          "coveragePercent = share of top-45 JD keyword stems found in resume (heuristic, not ATS).",
        summary: {
          coveragePercent: {
            min: covs.length ? Math.min(...covs) : 0,
            max: covs.length ? Math.max(...covs) : 0,
            mean: Math.round(mean * 10) / 10,
            median: Math.round(median(covs) * 10) / 10,
          },
          resumeChars: {
            min: rows.length ? Math.min(...rows.map((r) => r.resumeChars)) : 0,
            max: rows.length ? Math.max(...rows.map((r) => r.resumeChars)) : 0,
            median: median(rows.map((r) => r.resumeChars)),
          },
        },
        lowestCoverage: bottom,
        highestCoverage: top,
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
