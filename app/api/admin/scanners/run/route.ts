import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FEED_KEYS, getFeed, runFeedScan } from "@/lib/scrapers";
import { analyzeAllPending } from "@/lib/jobAnalyzer";
import { getAllConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

type RunOutcome = {
  board: string;
  jobsFound: number;
  jobsSaved: number;
  jobsRefreshed: number;
  jobsRescanned: number;
  durationMs: number;
  error?: string;
  warning?: string;
};

async function runOne(board: string, preloadedConfig?: Record<string, string>): Promise<RunOutcome> {
  const startedAt = Date.now();
  let outcome: RunOutcome = { board, jobsFound: 0, jobsSaved: 0, jobsRefreshed: 0, jobsRescanned: 0, durationMs: 0 };
  try {
    if (!getFeed(board)) {
      throw new Error(
        `Scanner "${board}" is not implemented in the cloud runner. ` +
          `Available: ${FEED_KEYS.join(", ")}.`,
      );
    }
    const result = await runFeedScan(board, preloadedConfig);
    outcome = {
      board,
      jobsFound: result.found,
      jobsSaved: result.saved,
      jobsRefreshed: result.refreshed,
      jobsRescanned: result.rescanned,
      durationMs: Date.now() - startedAt,
      warning: result.warning,
    };
  } catch (err) {
    outcome = {
      board,
      jobsFound: 0,
      jobsSaved: 0,
      jobsRefreshed: 0,
      jobsRescanned: 0,
      durationMs: Date.now() - startedAt,
      error: (err as Error).message || String(err),
    };
  }

  await prisma.scanLog.create({
    data: {
      board: outcome.board,
      jobsFound: outcome.jobsFound,
      // Persist saved + rescanned in jobsSaved column so dashboards keep their meaning
      // (rescanned rows go back into PENDING and need fresh analysis, just like new ones).
      jobsSaved: outcome.jobsSaved + outcome.jobsRescanned,
      errors: outcome.error || outcome.warning || null,
      durationMs: outcome.durationMs,
    },
  });

  return outcome;
}

export async function POST(req: NextRequest) {
  let body: { board?: string } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const board = (body.board || "").trim();

  if (!board) {
    return NextResponse.json({ success: false, error: "board is required" }, { status: 400 });
  }

  if (board === "all") {
    const sharedConfig = await getAllConfig();
    const outcomes: RunOutcome[] = [];
    for (const key of FEED_KEYS) {
      outcomes.push(await runOne(key, sharedConfig));
    }
    const totalSaved = outcomes.reduce((s, o) => s + o.jobsSaved, 0);
    const totalFound = outcomes.reduce((s, o) => s + o.jobsFound, 0);
    const errors = outcomes.filter((o) => o.error).map((o) => `${o.board}: ${o.error}`);
    return NextResponse.json({
      success: errors.length === 0,
      jobsFound: totalFound,
      jobsSaved: totalSaved,
      outcomes,
      ...(errors.length ? { error: errors.join("; ") } : {}),
    });
  }

  const outcome = await runOne(board);
  if (outcome.error) {
    return NextResponse.json(
      { success: false, error: outcome.error, ...outcome },
      { status: 500 },
    );
  }
  return NextResponse.json({
    success: true,
    jobsFound: outcome.jobsFound,
    jobsSaved: outcome.jobsSaved,
    durationMs: outcome.durationMs,
    warning: outcome.warning,
  });
}

export async function GET(req: NextRequest) {
  // Allow Vercel cron to trigger via GET. Optionally protect with CRON_SECRET.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") || "";
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
  }
  const sharedConfig = await getAllConfig();
  const outcomes: RunOutcome[] = [];
  for (const key of FEED_KEYS) {
    outcomes.push(await runOne(key, sharedConfig));
  }
  const totalSaved = outcomes.reduce((s, o) => s + o.jobsSaved, 0);
  const totalFound = outcomes.reduce((s, o) => s + o.jobsFound, 0);

  // Chain analysis on the cron path so freshly-scraped jobs are filtered in
  // the same run. The cron has the same 60s budget as the manual route, and
  // scraping already used some of it — pass whatever's left so analyze bails
  // cleanly instead of being killed mid-call. The next cron tick will pick up
  // the remaining pending rows.
  const budgetUsedSoFar = outcomes.reduce((sum, o) => sum + (o.durationMs || 0), 0);
  const remainingBudget = Math.max(5_000, 55_000 - budgetUsedSoFar);
  let analyzed:
    | { analyzed: number; approved: number; rejected: number; skipped: number; remaining: number; timedOut: boolean }
    | { error: string } = { analyzed: 0, approved: 0, rejected: 0, skipped: 0, remaining: 0, timedOut: false };
  try {
    analyzed = await analyzeAllPending({ timeBudgetMs: remainingBudget });
  } catch (err) {
    analyzed = { error: (err as Error).message };
  }

  return NextResponse.json({
    success: true,
    jobsFound: totalFound,
    jobsSaved: totalSaved,
    outcomes,
    analyzed,
  });
}
