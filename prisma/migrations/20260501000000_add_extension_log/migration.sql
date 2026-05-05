-- CreateTable
CREATE TABLE "ExtensionLog" (
    "id" SERIAL NOT NULL,
    "level" VARCHAR(20) NOT NULL DEFAULT 'info',
    "message" TEXT NOT NULL,
    "sessionId" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExtensionLog_pkey" PRIMARY KEY ("id")
);
