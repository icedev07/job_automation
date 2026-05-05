import { prisma } from "./prisma";
import { generateText } from "./llmClient";
import { getConfig } from "./config";

export type AnalysisResult = {
  approved: boolean;
  score: number;
  reason: string;
  techStack: string[];
  /** When false, extension should not click "Not interested" (e.g. AI provider outage). */
  linkedInDismiss?: boolean;
};

const DEFAULT_ANALYSIS_PROMPT = `You are a job suitability analyzer. Evaluate whether this job is suitable for a software developer located in {{CURRENT_LOCATION}} who is looking for {{TARGET_MARKET}} positions.

JOB TITLE: {{JOB_TITLE}}
COMPANY: {{COMPANY}}
LOCATION: {{LOCATION}}
JOB DESCRIPTION:
{{DESCRIPTION}}

Analyze the following criteria:
1. Is this job remote-friendly or accessible from {{CURRENT_LOCATION}}?
2. Does it target the {{TARGET_MARKET}} market?
3. Does it allow international contractors or remote workers from {{CURRENT_LOCATION}}?
4. Does it require local work authorization or citizenship that the candidate likely does not have?
5. Is the tech stack suitable for a software developer?

Respond in EXACTLY this JSON format, nothing else:
{
  "approved": true or false,
  "score": 0-100 (suitability score),
  "reason": "brief explanation of the decision",
  "techStack": ["list", "of", "technologies", "mentioned"]
}`;

function buildPrompt(
  job: { title: string; company: string; location: string | null; description: string | null },
  config: { targetMarket: string; currentLocation: string; jobAnalysisPrompt: string }
): string {
  const template = config.jobAnalysisPrompt || DEFAULT_ANALYSIS_PROMPT;
  return template
    .replace(/\{\{JOB_TITLE\}\}/g, job.title)
    .replace(/\{\{COMPANY\}\}/g, job.company)
    .replace(/\{\{LOCATION\}\}/g, job.location || "Not specified")
    .replace(/\{\{DESCRIPTION\}\}/g, (job.description || "No description available").substring(0, 6000))
    .replace(/\{\{TARGET_MARKET\}\}/g, config.targetMarket)
    .replace(/\{\{CURRENT_LOCATION\}\}/g, config.currentLocation);
}

function parseAIResponse(text: string): AnalysisResult {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      approved: !!parsed.approved,
      score: Math.min(100, Math.max(0, Number(parsed.score) || 0)),
      reason: String(parsed.reason || ""),
      techStack: Array.isArray(parsed.techStack) ? parsed.techStack.map(String) : [],
    };
  } catch {
    return { approved: false, score: 0, reason: "Failed to parse AI response", techStack: [] };
  }
}

export async function analyzeJob(jobId: number): Promise<AnalysisResult> {
  // atomic check: only analyze if still PENDING (prevents double-analysis race condition)
  const updated = await prisma.scrapedJob.updateMany({
    where: { id: jobId, status: "PENDING" },
    data: { status: "PENDING" },
  });
  if (updated.count === 0) {
    const existing = await prisma.scrapedJob.findUnique({ where: { id: jobId } });
    if (!existing) throw new Error(`Job ${jobId} not found`);
    return {
      approved: existing.status === "APPROVED",
      score: existing.aiScore || 0,
      reason: existing.aiReason || "Already analyzed",
      techStack: existing.techStack?.split(", ") || [],
    };
  }

  const job = await prisma.scrapedJob.findUnique({ where: { id: jobId } });
  if (!job) throw new Error(`Job ${jobId} not found`);

  // skip jobs with no useful description (waste of tokens)
  if (!job.description || job.description.trim().length < 50) {
    await prisma.scrapedJob.update({
      where: { id: jobId },
      data: { status: "REJECTED", aiScore: 0, aiReason: "No description available for analysis" },
    });
    await prisma.analysisLog.create({
      data: {
        scrapedJobId: jobId,
        model: "skipped",
        approved: false,
        score: 0,
        reason: "No description available for analysis",
        tokensUsed: 0,
        durationMs: 0,
      },
    });
    return { approved: false, score: 0, reason: "No description available for analysis", techStack: [] };
  }

  const config = await getConfig();
  const prompt = buildPrompt(job, config);
  const startTime = Date.now();

  let llmResult: { text: string; model: string; tokensUsed: number };
  try {
    llmResult = await generateText(prompt);
  } catch (err: any) {
    const raw = err?.message ?? String(err);
    const logReason = raw.length > 4000 ? raw.slice(0, 4000) : raw;
    const reason =
      raw.length > 700 ? `[analysis failed] ${raw.slice(0, 700)}…` : `[analysis failed] ${raw}`;
    const durationMs = Date.now() - startTime;
    console.error(`[analyzeJob] LLM failed jobId=${jobId}: ${raw}`);
    const u = await prisma.scrapedJob.updateMany({
      where: { id: jobId },
      data: {
        status: "REJECTED",
        aiScore: 0,
        aiReason: reason,
        techStack: null,
      },
    });
    if (u.count > 0) {
      await prisma.analysisLog.create({
        data: {
          scrapedJobId: jobId,
          model: "error",
          approved: false,
          score: 0,
          reason: logReason,
          tokensUsed: 0,
          durationMs,
        },
      });
    }
    return {
      approved: false,
      score: 0,
      reason,
      techStack: [],
      linkedInDismiss: false,
    };
  }

  const result = parseAIResponse(llmResult.text);
  const durationMs = Date.now() - startTime;

  await prisma.scrapedJob.update({
    where: { id: jobId },
    data: {
      status: result.approved ? "APPROVED" : "REJECTED",
      aiScore: result.score,
      aiReason: result.reason,
      techStack: result.techStack.length > 0 ? result.techStack.join(", ") : null,
    },
  });

  await prisma.analysisLog.create({
    data: {
      scrapedJobId: jobId,
      model: llmResult.model,
      approved: result.approved,
      score: result.score,
      reason: result.reason,
      tokensUsed: llmResult.tokensUsed,
      durationMs,
    },
  });

  return result;
}

export async function analyzeAllPending(): Promise<{
  analyzed: number;
  approved: number;
  rejected: number;
  skipped: number;
}> {
  // only fetch PENDING jobs, exclude already analyzed
  const pending = await prisma.scrapedJob.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  let approved = 0;
  let rejected = 0;
  let skipped = 0;

  for (const job of pending) {
    // double-check status hasn't changed since the query
    const current = await prisma.scrapedJob.findUnique({
      where: { id: job.id },
      select: { status: true },
    });
    if (!current || current.status !== "PENDING") {
      skipped++;
      continue;
    }

    try {
      const result = await analyzeJob(job.id);
      if (result.approved) approved++;
      else rejected++;
    } catch (err: any) {
      console.error(`Failed to analyze job ${job.id}: ${err.message}`);
      rejected++;
    }
  }

  return { analyzed: pending.length - skipped, approved, rejected, skipped };
}
