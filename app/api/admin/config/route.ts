import { NextRequest, NextResponse } from "next/server";
import { getAllConfig, setConfigValue } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const all = await getAllConfig();
  return NextResponse.json({
    ai_provider: all.ai_provider || "gemini",
    openai_api_key: all.openai_api_key || "",
    openai_model: all.openai_model || "gpt-4o-mini",
    gemini_api_key: all.gemini_api_key || "",
    gemini_model: all.gemini_model || "gemini-2.5-flash",
    openrouter_api_key: all.openrouter_api_key || "",
    openrouter_model: all.openrouter_model || "deepseek/deepseek-chat-v3-0324:free",
    google_sheet_id: all.google_sheet_id || "",
    google_sheets_credentials: all.google_sheets_credentials || "",
    target_market: all.target_market || "",
    current_location: all.current_location || "",
    job_analysis_prompt: all.job_analysis_prompt || "",
    sheet_columns: all.sheet_columns || "",
    linkedin_sheet_tab: all.linkedin_sheet_tab || "LinkedIn",
    extension_api_key: all.extension_api_key || "",
    admin_password_set: !!all.admin_password,
  });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    if (typeof value !== "string") continue;
    if (key === "admin_password" && !value.trim()) continue;
    await setConfigValue(key, value);
  }
  return NextResponse.json({ ok: true });
}
