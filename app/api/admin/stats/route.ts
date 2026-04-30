import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [totalJobs, totalOneClick, totalResumes, totalCoverLetters, recentScans] = await Promise.all([
    prisma.jobApplication.count(),
    prisma.oneClickJob.count(),
    prisma.tailoredResume.count(),
    prisma.coverLetter.count(),
    prisma.scanLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  return NextResponse.json({
    totalJobs,
    totalOneClick,
    totalResumes,
    totalCoverLetters,
    recentScans,
  });
}
