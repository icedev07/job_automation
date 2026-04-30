/**
 * Backfill watch: run in background, periodically check DB for jobs that need
 * resume/cover letter and process all of them each cycle, then sleep. Uses
 * ChatGPT UI generation. Stop with Ctrl+C.
 *
 * Env:
 *   BACKFILL_POLL_INTERVAL_SEC  Seconds between DB checks (default 120).
 *
 * Usage: npm run docs:backfill:watch
 */

import "dotenv/config";
import { prisma } from "../lib/prisma";
import { generateResumeAndCoverLetter } from "../lib/generateDocuments";

const POLL_INTERVAL_MS =
  Math.max(30, Number(process.env.BACKFILL_POLL_INTERVAL_SEC) || 120) * 1000;

async function findJobsNeedingDocs() {
  return prisma.jobApplication.findMany({
    where: {
      jobDescription: { isNot: null },
      tailoredResumes: { none: {} },
      coverLetters: { none: {} },
    },
    orderBy: { createdAt: "asc" },
  });
}

async function runOne(job: { id: number; title: string; company: string }) {
  const outputDir = process.env.RESUMES_OUTPUT_DIR || "Resumes";

  const onSignInRequired = () =>
    new Promise<void>((resolve) => {
      console.log("\n📋 Sign-in required. Log in to ChatGPT in the browser, then press ENTER here.\n");
      process.stdin.once("data", () => resolve());
    });

  const opts: {
    outputDir: string;
    saveToDatabase: boolean;
    onChatGPTSignInRequired?: () => Promise<void>;
  } = {
    outputDir,
    saveToDatabase: true,
    onChatGPTSignInRequired: onSignInRequired,
  };
  await generateResumeAndCoverLetter(job.id, opts);
}

async function main() {
  console.log("🔍 Backfill watch started (periodic document generation).");
  console.log(`   Poll interval: ${POLL_INTERVAL_MS / 1000}s | Source: chatgpt-ui`);
  console.log("   Stop with Ctrl+C.\n");

  let handled = 0;
  let failed = 0;

  const shutdown = async () => {
    console.log("\n📊 Backfill watch stopped.");
    if (handled + failed > 0) console.log(`   Generated: ${handled} | Failed: ${failed}`);
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  while (true) {
    try {
      const jobs = await findJobsNeedingDocs();
      if (jobs.length === 0) {
        console.log(`[${new Date().toISOString()}] No jobs needing documents. Next check in ${POLL_INTERVAL_MS / 1000}s.`);
      } else {
        console.log(`[${new Date().toISOString()}] Found ${jobs.length} job(s) needing documents. Processing all.\n`);
        for (const job of jobs) {
          console.log(`  🧠 Job ${job.id}: ${job.title} at ${job.company}`);
          try {
            await runOne(job);
            handled++;
            console.log(`  ✅ Done.\n`);
          } catch (err: any) {
            failed++;
            console.error(`  ❌ Failed: ${err?.message || err}\n`);
          }
        }
        console.log(`  Next check in ${POLL_INTERVAL_MS / 1000}s.\n`);
      }
    } catch (err: any) {
      console.error(`  ⚠️  Error during check: ${err?.message || err}`);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
