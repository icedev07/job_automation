import { NextRequest, NextResponse } from "next/server";
import { getAllConfig, setConfigValue, maskApiKey } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const all = await getAllConfig();
  return NextResponse.json({
    openai_api_key_masked: all.openai_api_key ? maskApiKey(all.openai_api_key) : "",
    openai_model: all.openai_model || "gpt-4o-mini",
    google_sheet_id: all.google_sheet_id || "",
    google_sheets_credentials: all.google_sheets_credentials ? true : false,
    admin_password_set: !!all.admin_password,
    resume_prompt_template: all.resume_prompt_template || "",
    cover_letter_prompt_template: all.cover_letter_prompt_template || "",
  });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const entries = Object.entries(body) as [string, string][];
  for (const [key, value] of entries) {
    if (typeof value === "string" && value.trim()) {
      await setConfigValue(key, value.trim());
    }
  }
  return NextResponse.json({ ok: true });
}
