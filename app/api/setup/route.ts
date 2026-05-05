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

const DEFAULT_ANALYSIS_PROMPT = `You are a job suitability analyzer. Evaluate whether this job is suitable for a software developer located in {{CURRENT_LOCATION}} who is looking for {{TARGET_MARKET}} positions.

JOB TITLE: {{JOB_TITLE}}
COMPANY: {{COMPANY}}
LOCATION: {{LOCATION}}
JOB DESCRIPTION:
{{DESCRIPTION}}

Analyze the following criteria:
1. Is this job remote-friendly or accessible from {{CURRENT_LOCATION}}?
2. Does it target the {{TARGET_MARKET}} market?
3. Does it allow international contractors or remote workers from {{CURRENT_LOCATION}}?
4. Does it require local work authorization or citizenship that the candidate likely does not have?
5. Is the tech stack suitable for a software developer?

Respond in EXACTLY this JSON format, nothing else:
{
  "approved": true or false,
  "score": 0-100 (suitability score),
  "reason": "brief explanation of the decision",
  "techStack": ["list", "of", "technologies", "mentioned"]
}`;

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
