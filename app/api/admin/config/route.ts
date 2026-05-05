import { NextRequest, NextResponse } from "next/server";
import { getAllConfig, setConfigValue, maskApiKey } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const all = await getAllConfig();
  return NextResponse.json({
    ai_provider: all.ai_provider || "gemini",
    openai_api_key_masked: all.openai_api_key ? maskApiKey(all.openai_api_key) : "",
    openai_model: all.openai_model || "gpt-4o-mini",
    gemini_api_key_masked: all.gemini_api_key ? maskApiKey(all.gemini_api_key) : "",
    gemini_model: all.gemini_model || "gemini-1.5-flash",
    google_sheet_id: all.google_sheet_id || "",
    google_sheets_credentials: !!all.google_sheets_credentials,
    target_market: all.target_market || "",
    current_location: all.current_location || "",
    job_analysis_prompt: all.job_analysis_prompt || "",
    sheet_columns: all.sheet_columns || "",
    admin_password_set: !!all.admin_password,
  });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string" && value.trim()) {
      await setConfigValue(key, value.trim());
    }
  }
  return NextResponse.json({ ok: true });
}
