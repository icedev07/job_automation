import "dotenv/config";
import { prisma } from "../lib/prisma";

function looksLikeApplyFormUi(text: string): boolean {
  if (!text || text.length < 100) return false;
  const lower = text.toLowerCase();

  const markerCount = [
    "autofill with mygreenhouse",
    "preferred first name",
    "first name*",
    "last name*",
    "email*",
    "resume/cv",
    "enter manually",
    "results available.use up and down to choose options",
  ].filter((m) => lower.includes(m)).length;

  const hasCountryPhoneList =
    (lower.includes("united states +1") || lower.includes("afghanistan +93")) &&
    (lower.includes("zimbabwe +263") || lower.includes("vietnam +84"));

  return markerCount >= 3 || hasCountryPhoneList;
}

async function main() {
  const apply = process.argv.includes("--apply") || process.env.npm_config_apply === "true";
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : undefined;

  if (limitArg && (!Number.isFinite(limit) || (limit as number) <= 0)) {
    throw new Error(`Invalid --limit value: ${limitArg}`);
  }

  console.log("🔎 Scanning JobDescription rows for form-UI garbage...");

  const all = await prisma.jobDescription.findMany({
    include: {
      jobApplication: {
        select: {
          id: true,
          title: true,
          company: true,
          externalUrl: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });

  const bad = all.filter((d) => looksLikeApplyFormUi(d.fullText));
  const selected = typeof limit === "number" ? bad.slice(0, limit) : bad;

  if (selected.length === 0) {
    console.log("✅ No bad form-UI descriptions found.");
    return;
  }

  console.log(`⚠️ Found ${selected.length} bad description(s)${limit ? ` (limited from ${bad.length})` : ""}.`);
  for (const d of selected) {
    const ja = d.jobApplication;
    console.log(`- JD ${d.id} | Job ${ja.id}: ${ja.company} – ${ja.title}`);
  }

  if (!apply) {
    console.log("\n[DRY RUN] No rows deleted.");
    console.log('Run with "--apply" to delete these JobDescription rows.');
    return;
  }

  const ids = selected.map((d) => d.id);
  const result = await prisma.jobDescription.deleteMany({
    where: { id: { in: ids } },
  });

  console.log(`\n🧹 Deleted ${result.count} JobDescription row(s).`);
}

main()
  .catch((err) => {
    console.error("❌ cleanupBadJobDescriptions failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

