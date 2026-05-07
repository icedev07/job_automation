import { NextRequest, NextResponse } from "next/server";
import { analyzeAllPending } from "@/lib/jobAnalyzer";
import { syncApprovedJobsToSheet } from "@/lib/googleSheetsSync";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { limit?: number; timeBudgetMs?: number } = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  try {
    const result = await analyzeAllPending({
      limit: body.limit,
      timeBudgetMs: body.timeBudgetMs,
    });

    let syncResult = { synced: 0 };
    try {
      syncResult = await syncApprovedJobsToSheet();
    } catch {
      // sheets sync is optional — never block the analyze cycle on it
    }

    return NextResponse.json({
      success: true,
      ...result,
      sheetsSynced: syncResult.synced,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
