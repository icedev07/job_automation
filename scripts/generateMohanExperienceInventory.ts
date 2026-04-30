/**
 * Generate Resumes_Mohan/Mohan_experience_inventory.md from:
 * - Mohan base resume sample (.docx)
 * - Aggregated text from stored JobDescription rows for userId=2
 *
 * Usage: npx tsx scripts/generateMohanExperienceInventory.ts
 * Optional: --out=Resumes_Mohan/Mohan_experience_inventory.md
 */
import "dotenv/config";
import * as path from "path";
import * as fs from "fs";
import { prisma } from "../lib/prisma";

const mammoth = require("mammoth");

const STOPWORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "are", "you", "your", "our", "their", "will",
  "have", "has", "had", "into", "about", "who", "what", "when", "where", "how", "why", "all", "any",
  "can", "should", "could", "would", "were", "was", "is", "to", "of", "in", "on", "at", "as", "by",
  "or", "an", "a", "we", "us", "they", "them", "it", "its", "be", "been", "not", "but", "may", "more",
  "most", "such", "than", "then", "there", "these", "those", "very", "also", "just", "only", "both",
  "other", "some", "any", "each", "every", "same", "work", "team", "role", "job", "company", "time",
  "years", "year", "day", "remote", "full", "part", "new", "opportunity", "looking", "join", "make",
  "including", "across", "based", "global", "world", "best", "great", "strong", "high", "well",
]);

function normalizeWord(w: string): string {
  return w.toLowerCase().replace(/[^a-z0-9+#]/g, "");
}

function topTermsFromText(text: string, limit: number): { term: string; count: number }[] {
  const words = (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map(normalizeWord)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  const freq = new Map<string, number>();
  for (const w of words) {
    if (w.length < 3) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term, count]) => ({ term, count }));
}

function extractBetween(text: string, startRe: RegExp, endRe: RegExp): string {
  const s = text.search(startRe);
  if (s < 0) return "";
  const after = text.slice(s);
  const startMatch = after.match(startRe);
  if (!startMatch) return "";
  const rest = after.slice(startMatch.index! + startMatch[0].length);
  const end = rest.search(endRe);
  const body = end < 0 ? rest : rest.slice(0, end);
  return body.replace(/\r/g, "").trim();
}

function bulletLinesFromBlock(block: string, max: number): string[] {
  const lines = block.split(/\n/).map((l) => l.trim());
  const out: string[] = [];
  for (const line of lines) {
    if (/^[-•*]\s+/.test(line) || /^\d+[.)]\s+/.test(line)) {
      const cleaned = line.replace(/^[-•*]\s+/, "").replace(/^\d+[.)]\s+/, "").trim();
      if (cleaned.length > 15 && cleaned.length < 400) out.push(cleaned);
    }
    if (out.length >= max) break;
  }
  return out;
}

async function loadBaseResumeText(): Promise<string> {
  const cwd = process.cwd();
  const candidates = [
    process.env.MOHAN_RESUME_SAMPLE_PATH,
    path.join(cwd, "Resumes_Mohan", "Templates", "Mohan Sha_Sample.docx"),
    path.join(cwd, "Resumes_Mohan", "Templates", "Mohan_Sha_Sample.docx"),
  ].filter(Boolean) as string[];

  for (const p of candidates) {
    const resolved = path.isAbsolute(p) ? p : path.join(cwd, p);
    if (fs.existsSync(resolved)) {
      const buf = fs.readFileSync(resolved);
      const result = await mammoth.extractRawText({ buffer: buf });
      return result.value || "";
    }
  }
  throw new Error("Mohan sample resume not found. Set MOHAN_RESUME_SAMPLE_PATH or add Mohan Sha_Sample.docx.");
}

async function main() {
  const outArg = process.argv.find((a) => a.startsWith("--out="));
  const outPath = outArg
    ? outArg.split("=")[1].trim()
    : path.join(process.cwd(), "Resumes_Mohan", "Mohan_experience_inventory.md");

  const baseResume = await loadBaseResumeText();
  const jdRows = await prisma.jobDescription.findMany({
    where: { jobApplication: { userId: 2 } },
    select: { fullText: true },
    orderBy: { id: "desc" },
    take: 500,
  });

  const jdBlob = jdRows.map((r) => r.fullText).join("\n\n--- JD SEPARATOR ---\n\n");
  const jdTerms = topTermsFromText(jdBlob, 55);
  const resumeTerms = topTermsFromText(baseResume, 35);

  const summary = extractBetween(
    baseResume,
    /SUMMARY/i,
    /^(SKILLS|TOOLS|PROFESSIONAL EXPERIENCE|EXPERIENCE)/im
  );
  const skills = extractBetween(baseResume, /^SKILLS/im, /^(TOOLS|PROFESSIONAL EXPERIENCE|EXPERIENCE)/im);
  const tools = extractBetween(baseResume, /^TOOLS/im, /^(PROFESSIONAL EXPERIENCE|EXPERIENCE)/im);
  const experience = extractBetween(
    baseResume,
    /PROFESSIONAL EXPERIENCE|EXPERIENCE/i,
    /^EDUCATION/im
  );

  const firstRoleBullets = experience ? bulletLinesFromBlock(experience.split(/\n\n+/)[0] || experience, 8) : [];

  const mergedForDomains = new Set<string>();
  for (const { term } of jdTerms.slice(0, 40)) mergedForDomains.add(term);
  for (const { term } of resumeTerms.slice(0, 25)) mergedForDomains.add(term);

  const domainHints = [
    "backend",
    "frontend",
    "fullstack",
    "full-stack",
    "devops",
    "sre",
    "platform",
    "cloud",
    "kubernetes",
    "docker",
    "terraform",
    "microservices",
    "api",
    "python",
    "java",
    "typescript",
    "react",
    "node",
    "golang",
    "go",
    "aws",
    "gcp",
    "azure",
    "sql",
    "postgresql",
    "mongodb",
    "redis",
    "kafka",
    "data",
    "ml",
    "machine",
    "learning",
    "ai",
    "security",
    "ci/cd",
    "kubernetes",
  ].filter((d) => mergedForDomains.has(d) || jdBlob.toLowerCase().includes(d));

  const oneLine =
    summary
      .split(/\n/)
      .map((l) => l.trim())
      .find((l) => l.length > 40 && l.length < 350) ||
    "Senior software engineer with strong delivery across backend, cloud, and platform engineering; use base resume + JD themes below for role-specific emphasis.";

  const generatedAt = new Date().toISOString();

  const md = `# Mohan — expanded experience inventory (auto-generated)

*Generated ${generatedAt} from \`Mohan Sha_Sample.docx\` (or MOHAN_RESUME_SAMPLE_PATH) and **${jdRows.length}** stored job descriptions (userId=2). Edit freely — re-run \`npx tsx scripts/generateMohanExperienceInventory.ts\` to refresh aggregates.*

## One-line positioning

- ${oneLine}

## Domains & themes (from your applications + resume vocabulary)

Common technical themes seen across stored job postings (frequent stems):

${jdTerms
  .slice(0, 35)
  .map((t) => `- **${t.term}** (${t.count} mentions across aggregated JD text)`)
  .join("\n")}

Resume-heavy terms (for overlap with your sample):

${resumeTerms
  .slice(0, 20)
  .map((t) => `- ${t.term}`)
  .join("\n")}

Suggested emphasis buckets (appear in JD corpus or resume — check what matches your truth):

${[
  ...new Set([
    ...domainHints,
    "distributed systems",
    "reliability",
    "scalability",
  ]),
]
  .slice(0, 18)
  .map((d) => `- ${d}`)
  .join("\n")}

## Stack & tools (from sample resume — extend manually if needed)

**SKILLS (excerpt from sample):**

\`\`\`text
${skills.slice(0, 2500) || "(no SKILLS section detected)"}
\`\`\`

**TOOLS (if present):**

\`\`\`text
${tools.slice(0, 1200) || "(none or not detected)"}
\`\`\`

## Representative bullets (pulled from first experience block in sample)

${firstRoleBullets.length ? firstRoleBullets.map((b, i) => `${i + 1}. ${b}`).join("\n\n") : "*(No bullet lines detected — add bullets manually.)*"}

## SUMMARY section from sample (reference)

\`\`\`text
${summary.slice(0, 1800) || "(empty)"}
\`\`\`

## How to use with tailoring

- The generator **merges** this file with the **full base resume** and each **job description** so Mohan-specific prompts can stress breadth and JD alignment without inventing employers or dates.
- Add **extra** projects, stacks, or leadership scope below that are not in the Word sample.

## Manual additions (optional)

- **Stretch angles:** When a JD asks for X, I can credibly point to: *(your notes)*

---

*Keep claims truthful. This file is a prompt aid; employers and dates must stay consistent with the base resume.*
`;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, md, "utf-8");
  console.log(`Wrote ${outPath} (${jdRows.length} JDs, ${baseResume.length} chars base resume)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
