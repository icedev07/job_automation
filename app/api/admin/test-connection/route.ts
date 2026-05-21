import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { google } from "googleapis";
import { getConfig } from "@/lib/config";
import {
  fetchOpenRouterFreeModels,
  callOpenRouter,
  generateWithGemini,
  generateWithGroq,
  generateWithCerebras,
} from "@/lib/llmClient";

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

  if (target === "openrouter") {
    const apiKey = config.openrouterApiKey;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "OpenRouter API key is empty in DB" });
    }
    const keyPreview = apiKey.slice(0, 8) + "..." + apiKey.slice(-4);
    const requested = config.openrouterModel || "auto";

    let liveFreeModels: string[] = [];
    try {
      liveFreeModels = await fetchOpenRouterFreeModels(apiKey);
    } catch (e: any) {
      return NextResponse.json({
        ok: false,
        keyPreview,
        requestedModel: requested,
        error: `Could not list models: ${String(e?.message || e)}`,
      });
    }

    if (liveFreeModels.length === 0) {
      return NextResponse.json({
        ok: false,
        keyPreview,
        requestedModel: requested,
        error: "No free models returned by /v1/models for this account",
      });
    }

    const order =
      requested === "auto"
        ? liveFreeModels
        : [requested, ...liveFreeModels.filter((m) => m !== requested)];

    // Walking all ~29 free models on a quota-blocked account just burns the
    // day's remaining free requests for no new information — a few is enough.
    const MAX_TEST_ATTEMPTS = 5;
    const attempts: string[] = [];
    let quotaBlocked = false;
    let requestedModelDead = false;

    for (const m of order.slice(0, MAX_TEST_ATTEMPTS)) {
      try {
        const res = await callOpenRouter(apiKey, m, "Reply with the single word: OK");
        const body = await res.text();

        // 429 (free-models-per-day) and 402 (no credits) are account-wide:
        // no other free model will behave differently, so stop walking here.
        if (res.status === 429 || res.status === 402) {
          quotaBlocked = true;
          attempts.push(`${m}: HTTP ${res.status} ${body.slice(0, 160)}`);
          break;
        }
        if (!res.ok) {
          if (res.status === 404 && m === requested && requested !== "auto") {
            requestedModelDead = true;
          }
          attempts.push(`${m}: HTTP ${res.status} ${body.slice(0, 160)}`);
          continue;
        }
        const data = JSON.parse(body);
        const sample = (data?.choices?.[0]?.message?.content || "").trim();
        if (!sample) {
          attempts.push(`${m}: empty response`);
          continue;
        }
        return NextResponse.json({
          ok: true,
          keyPreview,
          requestedModel: requested,
          modelUsed: m,
          freeModelsAvailable: liveFreeModels.length,
          firstFreeModels: liveFreeModels.slice(0, 8),
          sample: sample.slice(0, 200),
        });
      } catch (e: any) {
        attempts.push(`${m}: ${String(e?.message || e)}`);
      }
    }

    const hints: string[] = [];
    if (requestedModelDead) {
      hints.push(
        `Configured model "${requested}" no longer has any endpoints on OpenRouter — ` +
          `set OpenRouter Model back to "auto" or pick a live :free model.`,
      );
    }
    if (quotaBlocked) {
      hints.push(
        "OpenRouter free-tier quota is exhausted for this account. :free models are " +
          "capped at ~50 requests/day until the account makes a one-time 10-credit " +
          "purchase (which unlocks 1000/day) — see https://openrouter.ai/settings/credits. " +
          "Smart Rotation (Gemini/Groq/Cerebras) keeps analysis running in the meantime.",
      );
    }

    return NextResponse.json({
      ok: false,
      keyPreview,
      requestedModel: requested,
      freeModelsAvailable: liveFreeModels.length,
      firstFreeModels: liveFreeModels.slice(0, 8),
      error:
        (hints.length ? hints.join(" ") + " " : "") +
        `(${attempts.length} attempt${attempts.length === 1 ? "" : "s"} failed: ` +
        `${attempts.slice(0, 5).join(" | ")})`,
    });
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

  if (target === "groq") {
    if (!config.groqApiKey) {
      return NextResponse.json({ ok: false, error: "Groq API key is empty in DB" });
    }
    const keyPreview = config.groqApiKey.slice(0, 6) + "..." + config.groqApiKey.slice(-4);
    try {
      const r = await generateWithGroq(
        "Reply with the single word: OK",
        config.groqApiKey,
        config.groqModel,
      );
      return NextResponse.json({
        ok: true,
        keyPreview,
        requestedModel: config.groqModel,
        modelUsed: r.model,
        sample: r.text.slice(0, 200),
      });
    } catch (e: any) {
      return NextResponse.json({
        ok: false,
        keyPreview,
        requestedModel: config.groqModel,
        error: String(e?.message || e),
      });
    }
  }

  if (target === "cerebras") {
    if (!config.cerebrasApiKey) {
      return NextResponse.json({ ok: false, error: "Cerebras API key is empty in DB" });
    }
    const keyPreview =
      config.cerebrasApiKey.slice(0, 6) + "..." + config.cerebrasApiKey.slice(-4);
    try {
      const r = await generateWithCerebras(
        "Reply with the single word: OK",
        config.cerebrasApiKey,
        config.cerebrasModel,
      );
      return NextResponse.json({
        ok: true,
        keyPreview,
        requestedModel: config.cerebrasModel,
        modelUsed: r.model,
        sample: r.text.slice(0, 200),
      });
    } catch (e: any) {
      return NextResponse.json({
        ok: false,
        keyPreview,
        requestedModel: config.cerebrasModel,
        error: String(e?.message || e),
      });
    }
  }

  if (target === "rotation") {
    if (
      !config.geminiApiKey &&
      !config.groqApiKey &&
      !config.cerebrasApiKey &&
      !config.openrouterApiKey
    ) {
      return NextResponse.json({
        ok: false,
        error: "No rotation provider keys set. Add a Gemini, Groq, Cerebras or OpenRouter key.",
      });
    }
    const out: Record<string, any> = {};
    let anyOk = false;
    const ping = "Reply with the single word: OK";

    if (config.geminiApiKey) {
      try {
        const r = await generateWithGemini(ping, config.geminiApiKey, config.geminiModel || "gemini-2.5-flash");
        out.gemini = `OK · ${r.model}`;
        anyOk = true;
      } catch (e: any) {
        out.gemini = `FAILED · ${String(e?.message || e).slice(0, 160)}`;
      }
    } else {
      out.gemini = "no key — skipped";
    }

    if (config.groqApiKey) {
      try {
        const r = await generateWithGroq(ping, config.groqApiKey, config.groqModel);
        out.groq = `OK · ${r.model}`;
        anyOk = true;
      } catch (e: any) {
        out.groq = `FAILED · ${String(e?.message || e).slice(0, 160)}`;
      }
    } else {
      out.groq = "no key — skipped";
    }

    if (config.cerebrasApiKey) {
      try {
        const r = await generateWithCerebras(ping, config.cerebrasApiKey, config.cerebrasModel);
        out.cerebras = `OK · ${r.model}`;
        anyOk = true;
      } catch (e: any) {
        out.cerebras = `FAILED · ${String(e?.message || e).slice(0, 160)}`;
      }
    } else {
      out.cerebras = "no key — skipped";
    }

    if (config.openrouterApiKey) {
      try {
        const models = await fetchOpenRouterFreeModels(config.openrouterApiKey);
        const model = models[0] || "meta-llama/llama-3.2-3b-instruct:free";
        const res = await callOpenRouter(config.openrouterApiKey, model, ping);
        if (res.ok) {
          out.openrouter = `OK · ${model}`;
          anyOk = true;
        } else {
          out.openrouter = `FAILED · HTTP ${res.status}`;
        }
      } catch (e: any) {
        out.openrouter = `FAILED · ${String(e?.message || e).slice(0, 160)}`;
      }
    } else {
      out.openrouter = "no key — skipped";
    }

    return NextResponse.json({ ok: anyOk, ...out });
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
