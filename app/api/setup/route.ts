import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const hasTable = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables WHERE table_name = 'AppConfig'
      )
    `;

    if (hasTable[0]?.exists) {
      return NextResponse.json({ status: "already_initialized", message: "Database tables already exist." });
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

    return NextResponse.json({ status: "success", message: "All tables created successfully." });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
