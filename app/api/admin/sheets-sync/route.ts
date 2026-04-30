import { NextResponse } from "next/server";
import { fullSyncToSheet } from "@/lib/googleSheetsSync";

export async function POST() {
  try {
    const result = await fullSyncToSheet();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
