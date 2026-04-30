import { prisma } from "./prisma";
import { generateResumeText, generateCoverLetterText } from "./llmClient";

const PROMPT_VERSION = "openai-api-v1";

export async function generateResumeAndCoverLetter(
  jobApplicationId: number,
  options: {
    saveToDatabase?: boolean;
    customResumePrompt?: string;
    customCoverLetterPrompt?: string;
  } = {}
) {
  const { saveToDatabase = true } = options;

  const job = await prisma.jobApplication.findUnique({
    where: { id: jobApplicationId },
    include: {
      jobDescription: true,
      user: true,
    },
  });

  if (!job) throw new Error(`Job application ${jobApplicationId} not found`);
  if (!job.jobDescription) throw new Error(`No job description for job ${jobApplicationId}`);

  const profile = await prisma.userProfile.findFirst({
    where: { email: job.user.email },
  });

  let baseResumeText = "";
  if (profile?.baseResumeText) {
    baseResumeText = profile.baseResumeText;
  } else {
    const resume = await prisma.resume.findFirst({
      where: { userId: job.userId },
      orderBy: { updatedAt: "desc" },
    });
    if (!resume) throw new Error(`No base resume found for user ${job.userId}`);
    baseResumeText = resume.rawText;
  }

  const jobDescription = job.jobDescription.fullText;
  const startTime = Date.now();

  const resumeResult = await generateResumeText(
    baseResumeText,
    jobDescription,
    options.customResumePrompt
  );

  const coverLetterResult = await generateCoverLetterText(
    baseResumeText,
    jobDescription,
    job.company,
    job.title,
    options.customCoverLetterPrompt
  );

  const durationMs = Date.now() - startTime;

  if (saveToDatabase) {
    let baseResumeId: number;
    const existingResume = await prisma.resume.findFirst({
      where: { userId: job.userId },
      orderBy: { updatedAt: "desc" },
    });
    if (existingResume) {
      baseResumeId = existingResume.id;
    } else {
      const newResume = await prisma.resume.create({
        data: {
          userId: job.userId,
          name: "Auto-created base resume",
          rawText: baseResumeText,
        },
      });
      baseResumeId = newResume.id;
    }

    await prisma.tailoredResume.create({
      data: {
        jobApplicationId,
        baseResumeId,
        llmModel: resumeResult.model,
        promptVersion: PROMPT_VERSION,
        outputText: resumeResult.text,
      },
    });

    await prisma.coverLetter.create({
      data: {
        jobApplicationId,
        baseResumeId,
        llmModel: coverLetterResult.model,
        promptVersion: PROMPT_VERSION,
        outputText: coverLetterResult.text,
      },
    });

    await prisma.generationLog.create({
      data: {
        jobApplicationId,
        model: resumeResult.model,
        promptVersion: PROMPT_VERSION,
        success: true,
        tokensUsed: resumeResult.tokensUsed + coverLetterResult.tokensUsed,
        durationMs,
      },
    });
  }

  return {
    resumeText: resumeResult.text,
    coverLetterText: coverLetterResult.text,
    model: resumeResult.model,
    tokensUsed: resumeResult.tokensUsed + coverLetterResult.tokensUsed,
  };
}
