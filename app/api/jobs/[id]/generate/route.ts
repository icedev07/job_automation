import { NextRequest, NextResponse } from "next/server";
import { generateResumeAndCoverLetter } from "@/lib/generateDocuments";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobApplicationId = Number(params.id);
    if (isNaN(jobApplicationId)) {
      return NextResponse.json({ error: "Invalid job application ID" }, { status: 400 });
    }

    const job = await prisma.jobApplication.findUnique({
      where: { id: jobApplicationId },
      include: { jobDescription: true },
    });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (!job.jobDescription) {
      return NextResponse.json({ error: "No job description available" }, { status: 400 });
    }

    const result = await generateResumeAndCoverLetter(jobApplicationId, {
      saveToDatabase: true,
    });

    return NextResponse.json({
      success: true,
      message: "Resume and cover letter generated successfully",
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
