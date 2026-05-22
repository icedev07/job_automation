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
  generateWithCloudflare,
} from "@/lib/llmClient";

export const dynamic = "force-dynamic";

// vercel.json caps this route at 30s. Bound every connection test well under
// that ceiling so the function always finishes and returns a JSON body — a
// function killed at the 30s wall sends the browser an empty response, which
// the settings page can only report as the opaque "Unexpected end of JSON
// input" with no clue as to the real cause.
const TEST_DEADLINE_MS = 20_000;

// Race a promise that cannot be cancelled (the Gemini SDK ignores AbortSignal)
// against a stopwatch, so one hung request cannot eat the whole function
// budget. AbortSignal-aware calls also get a real signal where possible.
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)),
        ms,
      ),
    ),
  ]);
}

export async function POST(req: NextRequest) {
  // Everything runs inside one try: a bad request body, a DB error in
  // getConfig(), or any unexpected throw must still leave as JSON. A route
  // handler that throws returns an empty 500 body, which is exactly what the
  // browser was reporting as "Unexpected end of JSON input".
  try {
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
        const result = await withTimeout(
          m.generateContent("Reply with the single word: OK"),
          TEST_DEADLINE_MS,
          "Gemini request",
        );
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
      // One shared deadline covers the model lookup and every ping below; once
      // it fires, in-flight and future fetches abort and the loop falls through
      // to its JSON return instead of running the function out of time.
      const signal = AbortSignal.timeout(TEST_DEADLINE_MS);

      let liveFreeModels: string[] = [];
      try {
        liveFreeModels = await fetchOpenRouterFreeModels(apiKey, signal);
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
          const res = await callOpenRouter(apiKey, m, "Reply with the single word: OK", signal);
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
          AbortSignal.timeout(TEST_DEADLINE_MS),
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
          AbortSignal.timeout(TEST_DEADLINE_MS),
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

    if (target === "cloudflare") {
      if (!config.cloudflareAccountId) {
        return NextResponse.json({ ok: false, error: "Cloudflare account id is empty in DB" });
      }
      if (!config.cloudflareApiKey) {
        return NextResponse.json({ ok: false, error: "Cloudflare API token is empty in DB" });
      }
      const keyPreview =
        config.cloudflareApiKey.slice(0, 6) + "..." + config.cloudflareApiKey.slice(-4);
      const requested = config.cloudflareModel || "@cf/meta/llama-3.1-8b-instruct";
      try {
        const r = await generateWithCloudflare(
          "Reply with the single word: OK",
          config.cloudflareAccountId,
          config.cloudflareApiKey,
          requested,
          AbortSignal.timeout(TEST_DEADLINE_MS),
        );
        return NextResponse.json({
          ok: true,
          keyPreview,
          accountId: config.cloudflareAccountId.slice(0, 6) + "...",
          requestedModel: requested,
          modelUsed: r.model,
          sample: r.text.slice(0, 200),
        });
      } catch (e: any) {
        return NextResponse.json({
          ok: false,
          keyPreview,
          requestedModel: requested,
          error: String(e?.message || e),
        });
      }
    }

    if (target === "rotation") {
      // Test exactly the providers the user has ticked in Settings.
      const selected = config.aiProviders;
      if (selected.length === 0) {
        return NextResponse.json({
          ok: false,
          error: "No providers selected. Tick at least one provider in Settings.",
        });
      }
      const out: Record<string, any> = {};
      let anyOk = false;
      const ping = "Reply with the single word: OK";
      // Share the budget across every ticked provider — each call gets whatever
      // time is left, so a slow first provider cannot starve the function.
      const startedAt = Date.now();
      const remaining = () => Math.max(1_000, TEST_DEADLINE_MS - (Date.now() - startedAt));

      for (const id of selected) {
        try {
          if (id === "gemini") {
            if (!config.geminiApiKey) {
              out.gemini = "no key — skipped";
              continue;
            }
            const r = await withTimeout(
              generateWithGemini(ping, config.geminiApiKey, config.geminiModel || "gemini-2.5-flash"),
              remaining(),
              "Gemini",
            );
            out.gemini = `OK · ${r.model}`;
            anyOk = true;
          } else if (id === "groq") {
            if (!config.groqApiKey) {
              out.groq = "no key — skipped";
              continue;
            }
            const r = await generateWithGroq(
              ping,
              config.groqApiKey,
              config.groqModel,
              AbortSignal.timeout(remaining()),
            );
            out.groq = `OK · ${r.model}`;
            anyOk = true;
          } else if (id === "cerebras") {
            if (!config.cerebrasApiKey) {
              out.cerebras = "no key — skipped";
              continue;
            }
            const r = await generateWithCerebras(
              ping,
              config.cerebrasApiKey,
              config.cerebrasModel,
              AbortSignal.timeout(remaining()),
            );
            out.cerebras = `OK · ${r.model}`;
            anyOk = true;
          } else if (id === "openrouter") {
            if (!config.openrouterApiKey) {
              out.openrouter = "no key — skipped";
              continue;
            }
            const orSignal = AbortSignal.timeout(remaining());
            const models = await fetchOpenRouterFreeModels(config.openrouterApiKey, orSignal);
            const model = models[0] || "meta-llama/llama-3.2-3b-instruct:free";
            const res = await callOpenRouter(config.openrouterApiKey, model, ping, orSignal);
            out.openrouter = res.ok ? `OK · ${model}` : `FAILED · HTTP ${res.status}`;
            if (res.ok) anyOk = true;
          } else if (id === "cloudflare") {
            if (!config.cloudflareAccountId || !config.cloudflareApiKey) {
              out.cloudflare = "no account id / token — skipped";
              continue;
            }
            const r = await generateWithCloudflare(
              ping,
              config.cloudflareAccountId,
              config.cloudflareApiKey,
              config.cloudflareModel || "@cf/meta/llama-3.1-8b-instruct",
              AbortSignal.timeout(remaining()),
            );
            out.cloudflare = `OK · ${r.model}`;
            anyOk = true;
          }
        } catch (e: any) {
          out[id] = `FAILED · ${String(e?.message || e).slice(0, 160)}`;
        }
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
        const meta = await withTimeout(
          sheets.spreadsheets.get({ spreadsheetId: config.googleSheetId }),
          TEST_DEADLINE_MS,
          "Google Sheets request",
        );
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
  } catch (e: any) {
    // Last line of defence: the handler threw before any branch could answer
    // (malformed body, DB failure, etc.). Return JSON so the settings page can
    // show the real reason instead of choking on an empty body.
    return NextResponse.json({
      ok: false,
      error: `Connection test could not run: ${String(e?.message || e)}`,
    });
  }
}
