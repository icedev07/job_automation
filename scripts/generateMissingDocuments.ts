import "dotenv/config";
import { prisma } from "../lib/prisma";
import { generateResumeAndCoverLetter } from "../lib/generateDocuments";

async function main() {
  console.log("Backfill: Generate documents for existing jobs via OpenAI API");

  const jobsNeedingDocs = await prisma.jobApplication.findMany({
    where: {
      jobDescription: { isNot: null },
      tailoredResumes: { none: {} },
      coverLetters: { none: {} },
    },
    orderBy: { createdAt: "asc" },
  });

  if (jobsNeedingDocs.length === 0) {
    console.log("No jobs found that need document generation.");
    return;
  }

  console.log(`Found ${jobsNeedingDocs.length} job(s) needing documents.`);

  let successCount = 0;
  let failureCount = 0;

  for (const job of jobsNeedingDocs) {
    console.log(`\n[${job.id}] ${job.title} at ${job.company}`);
    try {
      const result = await generateResumeAndCoverLetter(job.id, { saveToDatabase: true });
      console.log(`  OK — model: ${result.model}, tokens: ${result.tokensUsed}`);
      successCount++;
    } catch (error: any) {
      console.error(`  FAIL — ${error.message || error}`);
      failureCount++;
    }
  }

  console.log(`\nDone. Success: ${successCount}, Failed: ${failureCount}`);
}

main()
  .catch((err) => {
    console.error("Unexpected error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
