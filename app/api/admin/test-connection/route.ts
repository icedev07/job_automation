import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { google } from "googleapis";
import { getConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { target } = await req.json();
  const config = await getConfig();

  if (target === "gemini") {
    if (!config.geminiApiKey) {
      return NextResponse.json({ ok: false, error: "Gemini API key is empty in DB" });
    }
    const model = config.geminiModel || "gemini-2.5-flash";
    try {
      const genAI = new GoogleGenerativeAI(config.geminiApiKey);
      const m = genAI.getGenerativeModel({ model });
      const result = await m.generateContent("Reply with the single word: OK");
      const text = result.response.text().trim();
      return NextResponse.json({
        ok: true,
        model,
        keyPreview: config.geminiApiKey.slice(0, 6) + "..." + config.geminiApiKey.slice(-4),
        sample: text.slice(0, 200),
      });
    } catch (e: any) {
      return NextResponse.json({
        ok: false,
        model,
        keyPreview: config.geminiApiKey.slice(0, 6) + "..." + config.geminiApiKey.slice(-4),
        error: String(e?.message || e),
      });
    }
  }

  if (target === "openai") {
    if (!config.openaiApiKey) {
      return NextResponse.json({ ok: false, error: "OpenAI API key is empty in DB" });
    }
    try {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${config.openaiApiKey}` },
      });
      if (!res.ok) {
        const body = await res.text();
        return NextResponse.json({ ok: false, error: `OpenAI ${res.status}: ${body.slice(0, 300)}` });
      }
      return NextResponse.json({
        ok: true,
        keyPreview: config.openaiApiKey.slice(0, 7) + "..." + config.openaiApiKey.slice(-4),
      });
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: String(e?.message || e) });
    }
  }

  if (target === "sheets") {
    if (!config.googleSheetsCredentials) {
      return NextResponse.json({ ok: false, error: "Service Account JSON is empty" });
    }
    if (!config.googleSheetId) {
      return NextResponse.json({ ok: false, error: "Google Sheet ID is empty" });
    }
    try {
      const credentials = JSON.parse(config.googleSheetsCredentials);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
      const sheets = google.sheets({ version: "v4", auth });
      const meta = await sheets.spreadsheets.get({
        spreadsheetId: config.googleSheetId,
      });
      return NextResponse.json({
        ok: true,
        sheetTitle: meta.data.properties?.title || "(unknown)",
        tabs: meta.data.sheets?.map((s) => s.properties?.title).filter(Boolean) || [],
        serviceAccount: credentials.client_email || "(no client_email field)",
      });
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: String(e?.message || e) });
    }
  }

  return NextResponse.json({ ok: false, error: "Unknown target" }, { status: 400 });
}
