import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobApplicationId = parseInt(params.id, 10);
    if (!Number.isFinite(jobApplicationId) || jobApplicationId < 1) {
      return NextResponse.json({ error: "Invalid job application ID" }, { status: 400 });
    }

    const job = await prisma.jobApplication.findUnique({
      where: { id: jobApplicationId },
      select: { id: true, company: true, title: true },
    });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const [r, c] = await Promise.all([
      prisma.tailoredResume.deleteMany({ where: { jobApplicationId } }),
      prisma.coverLetter.deleteMany({ where: { jobApplicationId } }),
    ]);

    await prisma.jobApplication.update({
      where: { id: jobApplicationId },
      data: { status: "SAVED" },
    });

    return NextResponse.json({
      success: true,
      jobId: jobApplicationId,
      company: job.company,
      title: job.title,
      deletedTailoredResumes: r.count,
      deletedCoverLetters: c.count,
      status: "SAVED",
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to reset documents";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
