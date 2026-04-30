import * as fs from "fs";
import * as path from "path";

import { NextRequest, NextResponse } from "next/server";

import { generateFolderName, removeJobOutputFolder } from "@/lib/documentGenerator";
import { prisma } from "@/lib/prisma";

function resolveOutputBaseDir(userId: number): string {
  const cwd = process.cwd();
  const raw =
    userId === 2
      ? (process.env.MOHAN_RESUMES_OUTPUT_DIR || "Resumes_Mohan").trim()
      : (process.env.RESUMES_OUTPUT_DIR || "Resumes").trim();
  return path.isAbsolute(raw) ? raw : path.join(cwd, raw);
}

/**
 * DELETE — remove TailoredResume + CoverLetter rows, set status to SAVED, and remove the
 * on-disk output folder (DOCX, PDF, job description txt — PDFs removed explicitly first).
 */
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
      select: { id: true, company: true, title: true, userId: true },
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

    const outputBase = resolveOutputBaseDir(job.userId);
    const folderPath = path.join(outputBase, generateFolderName(job.company, job.title));
    const resolvedBase = path.resolve(outputBase);
    const resolvedFolder = path.resolve(folderPath);
    const rel = path.relative(resolvedBase, resolvedFolder);
    const underOutput =
      rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel);

    let deletedOutputFolder = false;
    let deletedPdfFiles = 0;
    if (underOutput && fs.existsSync(resolvedFolder)) {
      const out = removeJobOutputFolder(outputBase, job.company, job.title);
      deletedOutputFolder = out.removed;
      deletedPdfFiles = out.deletedPdfFiles;
    }

    return NextResponse.json({
      success: true,
      jobId: jobApplicationId,
      company: job.company,
      title: job.title,
      deletedTailoredResumes: r.count,
      deletedCoverLetters: c.count,
      status: "SAVED",
      deletedOutputFolder,
      deletedPdfFiles,
      outputFolder: deletedOutputFolder ? resolvedFolder : undefined,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to reset documents";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
