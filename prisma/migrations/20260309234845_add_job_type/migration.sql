-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');

-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "jobType" "JobType" NOT NULL DEFAULT 'REMOTE';
