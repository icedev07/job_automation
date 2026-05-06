import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_SHEET_COLUMNS = JSON.stringify([
  { key: "title", label: "Title" },
  { key: "company", label: "Company" },
  { key: "location", label: "Location" },
  { key: "url", label: "URL" },
  { key: "platform", label: "Source" },
  { key: "aiScore", label: "AI Score" },
  { key: "techStack", label: "Tech Stack" },
  { key: "salary", label: "Salary" },
  { key: "createdAt", label: "Date Found" },
]);

const DEFAULT_ANALYSIS_PROMPT = `You are a strict job-suitability classifier for a software developer based in {{CURRENT_LOCATION}} who is targeting {{TARGET_MARKET}} positions.

==================== INPUT ====================
JOB_TITLE: {{JOB_TITLE}}
COMPANY: {{COMPANY}}
LOCATION: {{LOCATION}}
DESCRIPTION:
{{DESCRIPTION}}
================================================

==================== HARD REJECT RULES (set approved=false, score 0-30) ====================
R1. Job is NOT a software / engineering / data / ML / DevOps / QA / SRE / web / mobile role (e.g. sales, account manager, marketing, legal, HR, finance, recruiting, customer support, hardware-only roles, on-site lab work).
R2. Job explicitly requires being physically present in a specific country or city OUTSIDE the {{TARGET_MARKET}} (e.g. "must reside in California", "on-site in Tokyo", "this role is US-based", "hybrid 3 days in NYC office", "must have authorization to work in the US/UK/Canada").
R3. Job requires citizenship, security clearance, green card, H-1B sponsorship, or local work authorization that a {{CURRENT_LOCATION}}-based contractor would not have.
R4. Job requires significant travel (>20%) tied to a region outside {{TARGET_MARKET}}.
R5. Job is "remote (US only)", "remote (UK only)", "remote within EMEA" where {{CURRENT_LOCATION}} is excluded, or any geographically restricted remote that excludes {{CURRENT_LOCATION}}.

==================== SOFT SIGNALS ====================
S1. "Remote", "Remote worldwide", "Remote (Europe)", "Remote anywhere" → strong positive.
S2. Company is European, headquartered in {{TARGET_MARKET}}, or hires globally via Deel/Remote.com/contractors → positive.
S3. Tech stack mentioned (any of: TypeScript, JavaScript, Python, Go, Rust, Java, Kotlin, React, Next.js, Node, Django, FastAPI, Spring, Postgres, Kubernetes, AWS, GCP, etc.) → confirms it is a real software role.
S4. Salary listed in EUR/GBP/USD with no geographic restriction → positive.

==================== SCORING RUBRIC ====================
0-30   = clear reject (any R1–R5 hit).
31-59  = ambiguous / soft mismatch (e.g. unclear remote policy, stack acceptable but location unclear) → approved=false.
60-79  = likely good fit (remote-friendly, software role, no clear blockers) → approved=true.
80-100 = strong fit (explicit remote + {{TARGET_MARKET}} or worldwide + clear software role + decent stack) → approved=true.

Approval threshold: approved=true ONLY when score >= 60.

==================== OUTPUT CONTRACT ====================
Return ONE JSON object and NOTHING ELSE.
- No markdown.
- No code fences (no \`\`\`).
- No preamble like "Here is the result".
- No commentary after the JSON.
- Use lowercase booleans (true / false), not True/False/yes/no.
- "reason" must be ONE sentence under 240 characters citing the specific rule(s) that drove the decision.
- "techStack" is an array of bare technology names found in the description; empty array if none / not a software role.

Schema (every key required, exact types):
{"approved": boolean, "score": integer, "reason": string, "techStack": string[]}

Example of a valid REJECTED response:
{"approved": false, "score": 18, "reason": "R1: Account Manager role, not a software/engineering position.", "techStack": []}

Example of a valid APPROVED response:
{"approved": true, "score": 82, "reason": "Remote worldwide Senior Backend Engineer role; European company; Go + Postgres stack; no citizenship requirement.", "techStack": ["Go", "Postgres", "Docker", "Kubernetes"]}

Now analyze the job above and output ONLY the JSON object.`;

async function seedDefaults() {
  const defaults: Record<string, string> = {
    admin_password: "admin",
    ai_provider: "gemini",
    openai_model: "gpt-4o-mini",
    gemini_model: "gemini-2.5-flash",
    openrouter_model: "auto",
    target_market: "Europe, Eastern Europe, Remote worldwide",
    current_location: "Armenia",
    job_analysis_prompt: DEFAULT_ANALYSIS_PROMPT,
    sheet_columns: DEFAULT_SHEET_COLUMNS,
    linkedin_sheet_tab: "LinkedIn",
  };

  for (const [key, value] of Object.entries(defaults)) {
    await prisma.appConfig.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
}

export async function GET() {
  try {
    const hasTable = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables WHERE table_name = 'AppConfig'
      )
    `;

    if (hasTable[0]?.exists) {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ExtensionLog" (
          "id" SERIAL NOT NULL,
          "level" VARCHAR(20) NOT NULL DEFAULT 'info',
          "message" TEXT NOT NULL,
          "sessionId" VARCHAR(100),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ExtensionLog_pkey" PRIMARY KEY ("id")
        );
      `).catch(() => {});
      await seedDefaults();
      return NextResponse.json({ status: "already_initialized", message: "Database tables already exist. Default config values seeded." });
    }

    await prisma.$executeRawUnsafe(`
      CREATE TYPE "SkipRuleType" AS ENUM ('TITLE', 'COMPANY', 'URL');
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    `).catch(() => {});

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "ScrapedJob" (
        "id" SERIAL NOT NULL,
        "platform" VARCHAR(50) NOT NULL,
        "title" TEXT NOT NULL,
        "company" TEXT NOT NULL,
        "location" TEXT,
        "url" VARCHAR(2048) NOT NULL,
        "manualApplyUrl" VARCHAR(2048),
        "description" TEXT,
        "salary" TEXT,
        "techStack" TEXT,
        "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
        "aiScore" INTEGER,
        "aiReason" TEXT,
        "sheetSynced" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ScrapedJob_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "ScrapedJob_platform_url_key" ON "ScrapedJob"("platform", "url");`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "ScrapedJob_platform_title_company_key" ON "ScrapedJob"("platform", "title", "company");`);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "AppConfig" (
        "key" VARCHAR(255) NOT NULL,
        "value" TEXT NOT NULL,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("key")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "SkipRule" (
        "id" SERIAL NOT NULL,
        "type" "SkipRuleType" NOT NULL,
        "pattern" TEXT NOT NULL,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "SkipRule_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "ScanLog" (
        "id" SERIAL NOT NULL,
        "board" VARCHAR(50) NOT NULL,
        "jobsFound" INTEGER NOT NULL DEFAULT 0,
        "jobsSaved" INTEGER NOT NULL DEFAULT 0,
        "errors" TEXT,
        "durationMs" INTEGER,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ScanLog_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE "AnalysisLog" (
        "id" SERIAL NOT NULL,
        "scrapedJobId" INTEGER NOT NULL,
        "model" VARCHAR(100) NOT NULL,
        "approved" BOOLEAN NOT NULL,
        "score" INTEGER,
        "reason" TEXT,
        "tokensUsed" INTEGER,
        "durationMs" INTEGER,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AnalysisLog_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "AnalysisLog" ADD CONSTRAINT "AnalysisLog_scrapedJobId_fkey"
      FOREIGN KEY ("scrapedJobId") REFERENCES "ScrapedJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ExtensionLog" (
        "id" SERIAL NOT NULL,
        "level" VARCHAR(20) NOT NULL DEFAULT 'info',
        "message" TEXT NOT NULL,
        "sessionId" VARCHAR(100),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ExtensionLog_pkey" PRIMARY KEY ("id")
      );
    `);

    await seedDefaults();

    return NextResponse.json({ status: "success", message: "All tables created and defaults seeded." });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
