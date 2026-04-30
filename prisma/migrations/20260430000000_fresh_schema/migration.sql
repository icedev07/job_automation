-- Fresh schema: drop all old tables and create new ones for the Job Finder redesign.

-- Drop old tables (cascade to remove foreign keys)
DROP TABLE IF EXISTS "CoverLetter" CASCADE;
DROP TABLE IF EXISTS "TailoredResume" CASCADE;
DROP TABLE IF EXISTS "JobDescription" CASCADE;
DROP TABLE IF EXISTS "JobApplication" CASCADE;
DROP TABLE IF EXISTS "OneClickJob" CASCADE;
DROP TABLE IF EXISTS "Resume" CASCADE;
DROP TABLE IF EXISTS "UserProfile" CASCADE;
DROP TABLE IF EXISTS "GenerationLog" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "ScanLog" CASCADE;
DROP TABLE IF EXISTS "SkipRule" CASCADE;
DROP TABLE IF EXISTS "AppConfig" CASCADE;
DROP TABLE IF EXISTS "AnalysisLog" CASCADE;
DROP TABLE IF EXISTS "ScrapedJob" CASCADE;

-- Drop old enums
DROP TYPE IF EXISTS "ApplicationStatus" CASCADE;
DROP TYPE IF EXISTS "JobType" CASCADE;
DROP TYPE IF EXISTS "SkipRuleType" CASCADE;
DROP TYPE IF EXISTS "JobStatus" CASCADE;

-- Create enums
CREATE TYPE "SkipRuleType" AS ENUM ('TITLE', 'COMPANY', 'URL');
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- ScrapedJob
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

CREATE UNIQUE INDEX "ScrapedJob_platform_url_key" ON "ScrapedJob"("platform", "url");
CREATE UNIQUE INDEX "ScrapedJob_platform_title_company_key" ON "ScrapedJob"("platform", "title", "company");

-- AppConfig
CREATE TABLE "AppConfig" (
    "key" VARCHAR(255) NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("key")
);

-- SkipRule
CREATE TABLE "SkipRule" (
    "id" SERIAL NOT NULL,
    "type" "SkipRuleType" NOT NULL,
    "pattern" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkipRule_pkey" PRIMARY KEY ("id")
);

-- ScanLog
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

-- AnalysisLog
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

ALTER TABLE "AnalysisLog" ADD CONSTRAINT "AnalysisLog_scrapedJobId_fkey" FOREIGN KEY ("scrapedJobId") REFERENCES "ScrapedJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
