import { prisma } from "./prisma";
import { generateText, LLMRateLimitedError } from "./llmClient";
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

// ----------------------------------------------------------------------------
// Batched analysis. On the OpenRouter free tier (~20 req/min, ~50 req/day) the
// bottleneck is the NUMBER of requests, not their latency — adding parallelism
// cannot beat 20 req/min. Packing 8–12 jobs into one prompt turns an 80-job
// backlog into ~10 calls instead of 80, which is what makes a full run both
// finish (under the daily cap) and finish fast.
// ----------------------------------------------------------------------------

type PendingJobRow = {
  id: number;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
};

// Per-job description budget inside a batched prompt. Smaller than the 6000
// used for single-job analysis so 8–12 jobs still fit a free model's context
// window comfortably; role / location / remote signals live near the top.
const BATCH_DESCRIPTION_LIMIT = 4000;

// Pull the rules + rubric out of an analysis-prompt template so the batch
// prompt reuses the exact criteria the single-job path uses. Falls back to the
// default template if a customised prompt dropped the section markers.
function extractRulesCore(template: string): string {
  const slice = (t: string): string | null => {
    const start = t.search(/={3,}\s*HARD REJECT RULES/i);
    const end = t.search(/={3,}\s*OUTPUT CONTRACT/i);
    if (start !== -1 && end !== -1 && end > start) return t.slice(start, end).trim();
    return null;
  };
  return slice(template) ?? slice(DEFAULT_ANALYSIS_PROMPT) ?? DEFAULT_ANALYSIS_PROMPT;
}

function buildBatchPrompt(
  jobs: PendingJobRow[],
  config: { targetMarket: string; currentLocation: string; jobAnalysisPrompt: string },
): string {
  const rules = extractRulesCore(config.jobAnalysisPrompt || DEFAULT_ANALYSIS_PROMPT)
    .replace(/\{\{TARGET_MARKET\}\}/g, config.targetMarket)
    .replace(/\{\{CURRENT_LOCATION\}\}/g, config.currentLocation);

  const jobBlocks = jobs
    .map((j) => {
      const desc = (j.description || "No description available").substring(0, BATCH_DESCRIPTION_LIMIT);
      return `### JOB id=${j.id}\nJOB_TITLE: ${j.title}\nCOMPANY: ${j.company}\nLOCATION: ${j.location || "Not specified"}\nDESCRIPTION:\n${desc}`;
    })
    .join("\n\n");

  return `You are a strict job-suitability classifier for a software developer based in ${config.currentLocation} who is targeting ${config.targetMarket} positions.

You will be given ${jobs.length} job postings. Analyze EACH ONE INDEPENDENTLY against the rules below — a verdict on one job must never influence another.

${rules}

==================== INPUT — ${jobs.length} JOBS ====================
${jobBlocks}
================================================

==================== OUTPUT CONTRACT ====================
Return ONE JSON array and NOTHING ELSE.
- No markdown, no code fences (no \`\`\`), no preamble, no commentary.
- The array MUST contain exactly ${jobs.length} objects — one per job above.
- Each object schema (every key required, exact types):
  {"id": integer, "approved": boolean, "score": integer, "reason": string, "techStack": string[]}
- "id" MUST equal the id= value of the job it judges; never invent or omit an id.
- Use lowercase booleans (true / false).
- "reason" is ONE sentence under 240 characters citing the rule(s) that drove the decision.
- "techStack" is an array of bare technology names found in that job's description; empty array if none.
- approved=true ONLY when score >= 60.

Example for two jobs with ids 11 and 12:
[{"id":11,"approved":false,"score":18,"reason":"R1: Account Manager role, not a software position.","techStack":[]},{"id":12,"approved":true,"score":82,"reason":"Remote worldwide backend role; European company; Go + Postgres stack.","techStack":["Go","Postgres"]}]

Now analyze all ${jobs.length} jobs and output ONLY the JSON array.`;
}

// Parse the model's JSON array into a verdict-by-job-id map. A missing or
// malformed element is simply omitted — the caller leaves any unmatched job
// PENDING for a later pass rather than guessing a verdict.
function parseBatchResponse(text: string): Map<number, AnalysisResult> {
  const out = new Map<number, AnalysisResult>();
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return out;
  let arr: unknown;
  try {
    arr = JSON.parse(match[0]);
  } catch {
    return out;
  }
  if (!Array.isArray(arr)) return out;
  for (const el of arr as any[]) {
    const id = Number(el?.id);
    if (!Number.isInteger(id)) continue;
    out.set(id, {
      approved: !!el?.approved,
      score: Math.min(100, Math.max(0, Number(el?.score) || 0)),
      reason: String(el?.reason || ""),
      techStack: Array.isArray(el?.techStack) ? el.techStack.map(String) : [],
    });
  }
  return out;
}

export async function analyzeJob(jobId: number, signal?: AbortSignal): Promise<AnalysisResult> {
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
    llmResult = await generateText(prompt, signal);
  } catch (err: any) {
    // Rate-limit / quota errors are surfaced to the caller without marking the
    // job REJECTED — the row stays PENDING so the next batch can retry once
    // the provider window resets.
    if (err instanceof LLMRateLimitedError) {
      throw err;
    }
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
  /** Hard cap on jobs fetched in this invocation. */
  limit?: number;
  /** Bail out once we're this close to the function deadline (ms). */
  timeBudgetMs?: number;
  /** Override the configured inter-request delay (ms). 0 disables pacing. */
  requestDelayMs?: number;
  /** Override how many jobs are packed into one LLM call. */
  batchSize?: number;
};

// Leave at least this much wall-clock for the response + post-batch sheets
// sync. Without this floor a slow LLM call can push the function past Vercel's
// 60s cap and the user sees a generic FUNCTION_INVOCATION_TIMEOUT instead of a
// graceful "batch partial, click again" message.
const HEADROOM_MS = 12_000;
// Refuse to start a new batched LLM call without at least this much working
// time before the kill-timer. A batched call (8–12 job descriptions in, a JSON
// array out) typically lands in 8–18s on a free model; this floor stops us
// from starting one we cannot finish before the abort fires.
const MIN_BATCH_BUDGET_MS = 18_000;

async function delay(ms: number, signal?: AbortSignal): Promise<void> {
  if (ms <= 0) return;
  return new Promise((resolve) => {
    if (signal?.aborted) return resolve();
    const t = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(t);
          resolve();
        },
        { once: true },
      );
    }
  });
}

/**
 * Analyze one chunk of jobs with a SINGLE LLM call. Jobs with no usable
 * description are rejected locally (no tokens spent). Jobs the model omits
 * from its response are left PENDING and picked up on a later pass. A
 * LLMRateLimitedError is allowed to propagate so the caller can stop cleanly.
 */
async function analyzeBatch(
  jobs: PendingJobRow[],
  config: Awaited<ReturnType<typeof getConfig>>,
  signal?: AbortSignal,
): Promise<{ approved: number; rejected: number; resolved: number; unresolved: number }> {
  let approved = 0;
  let rejected = 0;
  let resolved = 0;

  // No-description jobs never reach the LLM — same rule as the single-job path.
  const needsLlm: PendingJobRow[] = [];
  for (const job of jobs) {
    if (!job.description || job.description.trim().length < 50) {
      const u = await prisma.scrapedJob.updateMany({
        where: { id: job.id, status: "PENDING" },
        data: { status: "REJECTED", aiScore: 0, aiReason: "No description available for analysis" },
      });
      if (u.count > 0) {
        await prisma.analysisLog.create({
          data: {
            scrapedJobId: job.id,
            model: "skipped",
            approved: false,
            score: 0,
            reason: "No description available for analysis",
            tokensUsed: 0,
            durationMs: 0,
          },
        });
        rejected++;
        resolved++;
      }
    } else {
      needsLlm.push(job);
    }
  }

  if (needsLlm.length === 0) {
    return { approved, rejected, resolved, unresolved: 0 };
  }

  const prompt = buildBatchPrompt(needsLlm, config);
  const startTime = Date.now();
  const llmResult = await generateText(prompt, signal);
  const durationMs = Date.now() - startTime;
  const verdicts = parseBatchResponse(llmResult.text);

  // One call covers the whole chunk — split its cost across the per-job logs.
  const perJobDuration = Math.round(durationMs / needsLlm.length);
  const perJobTokens = Math.round((llmResult.tokensUsed || 0) / needsLlm.length);

  let unresolved = 0;
  for (const job of needsLlm) {
    const v = verdicts.get(job.id);
    if (!v) {
      unresolved++; // model dropped this id — leave PENDING for the next pass
      continue;
    }
    const u = await prisma.scrapedJob.updateMany({
      where: { id: job.id, status: "PENDING" },
      data: {
        status: v.approved ? "APPROVED" : "REJECTED",
        aiScore: v.score,
        aiReason: v.reason,
        techStack: v.techStack.length > 0 ? v.techStack.join(", ") : null,
      },
    });
    if (u.count === 0) continue; // already analyzed by a concurrent run
    await prisma.analysisLog.create({
      data: {
        scrapedJobId: job.id,
        model: llmResult.model,
        approved: v.approved,
        score: v.score,
        reason: v.reason,
        tokensUsed: perJobTokens,
        durationMs: perJobDuration,
      },
    });
    if (v.approved) approved++;
    else rejected++;
    resolved++;
  }

  return { approved, rejected, resolved, unresolved };
}

export async function analyzeAllPending(options: AnalyzeBatchOptions = {}): Promise<{
  analyzed: number;
  approved: number;
  rejected: number;
  skipped: number;
  remaining: number;
  timedOut: boolean;
  rateLimited?: boolean;
  rateLimitReason?: string;
  retryAfterMs?: number;
  batchError?: string;
}> {
  const config = await getConfig();
  const batchSize = Math.min(12, Math.max(1, options.batchSize ?? config.analyzerBatchSize));
  // Vercel caps this route at 60s. Keep 48s of working budget so there is
  // always headroom to return a response and run the post-batch sheets sync.
  const budgetMs = Math.max(5_000, options.timeBudgetMs ?? 48_000);
  // Fetch enough rows for several chunks; the wall-clock budget is the real
  // stop. The admin UI loops the route until remaining = 0.
  const fetchLimit = Math.min(60, Math.max(batchSize, options.limit ?? batchSize * 4));
  const requestDelayMs = Math.max(0, options.requestDelayMs ?? config.analyzerRequestDelayMs);
  const startedAt = Date.now();
  // Latest moment we may still be running an LLM call. Used both for the hard
  // abort timer and the per-chunk go/no-go check so the two never disagree.
  const deadline = budgetMs - HEADROOM_MS;

  const batchController = new AbortController();
  // Hard kill the in-flight LLM call once we're inside the headroom window.
  const killTimer = setTimeout(() => batchController.abort(), Math.max(1_000, deadline));

  const pending = await prisma.scrapedJob.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: fetchLimit,
  });

  let approved = 0;
  let rejected = 0;
  let analyzed = 0;
  let timedOut = false;
  let rateLimited = false;
  let rateLimitReason: string | undefined;
  let retryAfterMs: number | undefined;
  let batchError: string | undefined;

  try {
    for (let i = 0; i < pending.length; i += batchSize) {
      // Only start a chunk if it has a full working window before the abort.
      if (deadline - (Date.now() - startedAt) < MIN_BATCH_BUDGET_MS) {
        timedOut = true;
        break;
      }
      const chunk = pending.slice(i, i + batchSize);
      try {
        const r = await analyzeBatch(chunk, config, batchController.signal);
        approved += r.approved;
        rejected += r.rejected;
        analyzed += r.resolved;
        // A chunk that resolves nothing means the model failed outright
        // (garbage output, or aborted mid-flight). Retrying identical content
        // would just fail again — stop cleanly and leave the rows PENDING.
        if (r.resolved === 0) {
          batchError = "AI returned no usable verdicts for this batch";
          break;
        }
      } catch (err: any) {
        if (err instanceof LLMRateLimitedError) {
          rateLimited = true;
          rateLimitReason = err.message;
          retryAfterMs = err.retryAfterMs;
          break;
        }
        // Generic LLM / network failure: leave the whole chunk PENDING (never
        // mass-reject a batch over one transient outage) and stop.
        console.error(`analyzeBatch failed: ${err?.message || err}`);
        batchError = String(err?.message || err).slice(0, 300);
        break;
      }

      // Small courtesy pause between batched calls. With ~8 jobs per call this
      // is far under the free-tier 20 req/min ceiling.
      if (i + batchSize < pending.length && requestDelayMs > 0) {
        const left = deadline - (Date.now() - startedAt);
        if (left < MIN_BATCH_BUDGET_MS) {
          timedOut = true;
          break;
        }
        await delay(Math.min(requestDelayMs, left - MIN_BATCH_BUDGET_MS), batchController.signal);
      }
    }
  } finally {
    clearTimeout(killTimer);
  }

  const remaining = await prisma.scrapedJob.count({ where: { status: "PENDING" } });

  return {
    analyzed,
    approved,
    rejected,
    skipped: 0,
    remaining,
    timedOut,
    ...(rateLimited ? { rateLimited: true, rateLimitReason, retryAfterMs } : {}),
    ...(batchError ? { batchError } : {}),
  };
}
