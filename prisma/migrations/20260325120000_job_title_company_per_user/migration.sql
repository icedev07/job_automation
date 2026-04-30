-- Allow the same job title+company for different users (e.g. Jiayong + Mohan both saving the same role).
DROP INDEX IF EXISTS "JobApplication_title_company_key";

CREATE UNIQUE INDEX "JobApplication_userId_title_company_key" ON "JobApplication"("userId", "title", "company");
