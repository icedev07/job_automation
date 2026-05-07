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

const DEFAULT_ANALYSIS_PROMPT = `You are a strict job-suitability classifier for a software developer based in {{CURRENT_LOCATION}} who is targeting {{TARGET_MARKET}} positions.

==================== INPUT ====================
JOB_TITLE: {{JOB_TITLE}}
COMPANY: {{COMPANY}}
LOCATION: {{LOCATION}}
DESCRIPTION:
{{DESCRIPTION}}
================================================

==================== HARD REJECT RULES (set approved=false, score 0-30) ====================
R1. Job is NOT a software / engineering / data / ML / DevOps / QA / SRE / web / mobile role (e.g. sales, account manager, marketing, legal, HR, finance, recruiting, customer support, hardware-only roles, on-site lab work).
R2. Job explicitly requires being physically present in a specific country or city OUTSIDE the {{TARGET_MARKET}} (e.g. "must reside in California", "on-site in Tokyo", "this role is US-based", "hybrid 3 days in NYC office", "must have authorization to work in the US/UK/Canada").
R3. Job requires citizenship, security clearance, green card, H-1B sponsorship, or local work authorization that a {{CURRENT_LOCATION}}-based contractor would not have.
R4. Job requires significant travel (>20%) tied to a region outside {{TARGET_MARKET}}.
R5. Job is "remote (US only)", "remote (UK only)", "remote within EMEA" where {{CURRENT_LOCATION}} is excluded, or any geographically restricted remote that excludes {{CURRENT_LOCATION}}.

==================== SOFT SIGNALS ====================
S1. "Remote", "Remote worldwide", "Remote (Europe)", "Remote anywhere" → strong positive.
S2. Company is European, headquartered in {{TARGET_MARKET}}, or hires globally via Deel/Remote.com/contractors → positive.
S3. Tech stack mentioned (any of: TypeScript, JavaScript, Python, Go, Rust, Java, Kotlin, React, Next.js, Node, Django, FastAPI, Spring, Postgres, Kubernetes, AWS, GCP, etc.) → confirms it is a real software role.
S4. Salary listed in EUR/GBP/USD with no geographic restriction → positive.

==================== SCORING RUBRIC ====================
0-30   = clear reject (any R1–R5 hit).
31-59  = ambiguous / soft mismatch (e.g. unclear remote policy, stack acceptable but location unclear) → approved=false.
60-79  = likely good fit (remote-friendly, software role, no clear blockers) → approved=true.
80-100 = strong fit (explicit remote + {{TARGET_MARKET}} or worldwide + clear software role + decent stack) → approved=true.

Approval threshold: approved=true ONLY when score >= 60.

==================== OUTPUT CONTRACT ====================
Return ONE JSON object and NOTHING ELSE.
- No markdown.
- No code fences (no \`\`\`).
- No preamble like "Here is the result".
- No commentary after the JSON.
- Use lowercase booleans (true / false), not True/False/yes/no.
- "reason" must be ONE sentence under 240 characters citing the specific rule(s) that drove the decision.
- "techStack" is an array of bare technology names found in the description; empty array if none / not a software role.

Schema (every key required, exact types):
{"approved": boolean, "score": integer, "reason": string, "techStack": string[]}

Example of a valid REJECTED response:
{"approved": false, "score": 18, "reason": "R1: Account Manager role, not a software/engineering position.", "techStack": []}

Example of a valid APPROVED response:
{"approved": true, "score": 82, "reason": "Remote worldwide Senior Backend Engineer role; European company; Go + Postgres stack; no citizenship requirement.", "techStack": ["Go", "Postgres", "Docker", "Kubernetes"]}

Now analyze the job above and output ONLY the JSON object.`;

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

export type AnalyzeBatchOptions = {
  /** Hard cap on jobs queued in this invocation. */
  limit?: number;
  /** Bail out once we're this close to the function deadline (ms). */
  timeBudgetMs?: number;
};

export async function analyzeAllPending(options: AnalyzeBatchOptions = {}): Promise<{
  analyzed: number;
  approved: number;
  rejected: number;
  skipped: number;
  remaining: number;
  timedOut: boolean;
}> {
  const limit = Math.min(50, Math.max(1, options.limit ?? 8));
  // Vercel hobby/pro caps this route at 60s (vercel.json). Default to 50s of
  // working budget so we always have headroom to return a response and write
  // the final scan log. Each LLM call is 3–10s, so ~5–10 jobs/iteration is
  // realistic; the admin UI loops until pending=0.
  const budgetMs = Math.max(5_000, options.timeBudgetMs ?? 50_000);
  const startedAt = Date.now();

  const pending = await prisma.scrapedJob.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  let approved = 0;
  let rejected = 0;
  let skipped = 0;
  let processed = 0;
  let timedOut = false;

  for (const job of pending) {
    if (Date.now() - startedAt > budgetMs) {
      timedOut = true;
      break;
    }
    const current = await prisma.scrapedJob.findUnique({
      where: { id: job.id },
      select: { status: true },
    });
    if (!current || current.status !== "PENDING") {
      skipped++;
      processed++;
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
    processed++;
  }

  const remaining = await prisma.scrapedJob.count({ where: { status: "PENDING" } });

  return {
    analyzed: processed - skipped,
    approved,
    rejected,
    skipped,
    remaining,
    timedOut,
  };
}
