import { NextRequest, NextResponse } from "next/server";
import { getAllConfig, getConfig, setConfigValue } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const all = await getAllConfig();
  const config = await getConfig();
  return NextResponse.json({
    // Resolved provider list (handles migration from the legacy ai_provider).
    ai_providers: JSON.stringify(config.aiProviders),
    gemini_api_key: all.gemini_api_key || "",
    gemini_model: all.gemini_model || "gemini-2.5-flash",
    openrouter_api_key: all.openrouter_api_key || "",
    openrouter_model: all.openrouter_model || "auto",
    groq_api_key: all.groq_api_key || "",
    groq_model: all.groq_model || "llama-3.1-8b-instant",
    cerebras_api_key: all.cerebras_api_key || "",
    cerebras_model: all.cerebras_model || "llama-3.3-70b",
    cloudflare_account_id: all.cloudflare_account_id || "",
    cloudflare_api_key: all.cloudflare_api_key || "",
    cloudflare_model: all.cloudflare_model || "@cf/meta/llama-3.1-8b-instruct",
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
