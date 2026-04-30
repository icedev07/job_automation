import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [totalJobs, pendingJobs, approvedJobs, rejectedJobs, syncedJobs, recentScans] = await Promise.all([
    prisma.scrapedJob.count(),
    prisma.scrapedJob.count({ where: { status: "PENDING" } }),
    prisma.scrapedJob.count({ where: { status: "APPROVED" } }),
    prisma.scrapedJob.count({ where: { status: "REJECTED" } }),
    prisma.scrapedJob.count({ where: { sheetSynced: true } }),
    prisma.scanLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return NextResponse.json({
    totalJobs,
    pendingJobs,
    approvedJobs,
    rejectedJobs,
    syncedJobs,
    recentScans,
  });
}
