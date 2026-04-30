-- CreateTable
CREATE TABLE "OneClickJob" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "source" VARCHAR(50) NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "externalUrl" VARCHAR(2048) NOT NULL,
    "fullText" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OneClickJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OneClickJob_userId_externalUrl_key" ON "OneClickJob"("userId", "externalUrl");

-- AddForeignKey
ALTER TABLE "OneClickJob" ADD CONSTRAINT "OneClickJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
