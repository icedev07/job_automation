import { NextRequest } from "next/server";

import { generateResumeAndCoverLetter } from "@/lib/generateDocuments";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobApplicationId = Number(params.id);

    if (isNaN(jobApplicationId)) {
      return new Response(
        JSON.stringify({ error: "Invalid job application ID" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    let body: any = {};
    try {
      const bodyText = await req.text();
      if (bodyText) {
        body = JSON.parse(bodyText);
      }
    } catch (e) {
      // Use defaults if body parsing fails
    }

    const jobRow = await prisma.jobApplication.findUnique({
      where: { id: jobApplicationId },
      select: { userId: true },
    });
    const defaultOutputDir =
      jobRow?.userId === 2
        ? (process.env.MOHAN_RESUMES_OUTPUT_DIR || "Resumes_Mohan").trim()
        : (process.env.RESUMES_OUTPUT_DIR || "Resumes").trim();
    const outputDir =
      typeof body.outputDir === "string" && body.outputDir.trim()
        ? body.outputDir.trim()
        : defaultOutputDir;

    const options = {
      outputDir,
      saveToDatabase: body.saveToDatabase !== false,
      resumeTemplatePath: body.resumeTemplatePath,
      coverLetterTemplatePath: body.coverLetterTemplatePath,
    };

    // No longer need baseResumeId - we use the template .docx file directly
    const result = await generateResumeAndCoverLetter(
      jobApplicationId,
      options
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Resume and cover letter generated successfully",
        ...result,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
