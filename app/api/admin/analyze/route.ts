import { NextResponse } from "next/server";
import { analyzeAllPending } from "@/lib/jobAnalyzer";
import { syncApprovedJobsToSheet } from "@/lib/googleSheetsSync";

export async function POST() {
  try {
    const result = await analyzeAllPending();

    let syncResult = { synced: 0 };
    try {
      syncResult = await syncApprovedJobsToSheet();
    } catch {
      // sheets sync is optional
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
