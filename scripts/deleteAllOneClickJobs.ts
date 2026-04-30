/**
 * Delete all rows from OneClickJob table.
 * Run: npx tsx scripts/deleteAllOneClickJobs.ts
 */
import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  try {
    const result = await prisma.oneClickJob.deleteMany({});
    console.log(`Deleted ${result.count} row(s) from OneClickJob.`);
  } catch (e) {
    const deleted = await prisma.$executeRawUnsafe('DELETE FROM "OneClickJob"');
    console.log(`Deleted ${deleted} row(s) from OneClickJob (raw).`);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
