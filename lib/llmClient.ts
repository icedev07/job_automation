import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getConfig } from "./config";

let cachedOpenAI: OpenAI | null = null;
let cachedOpenAIKey = "";

function getOpenAIClient(apiKey: string): OpenAI {
  if (cachedOpenAI && cachedOpenAIKey === apiKey) return cachedOpenAI;
  cachedOpenAI = new OpenAI({ apiKey });
  cachedOpenAIKey = apiKey;
  return cachedOpenAI;
}

export type LLMResult = {
  text: string;
  model: string;
  tokensUsed: number;
};

async function generateWithOpenAI(prompt: string, apiKey: string, model: string): Promise<LLMResult> {
  const client = getOpenAIClient(apiKey);
  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  const text = response.choices[0]?.message?.content || "";
  const tokensUsed =
    (response.usage?.prompt_tokens || 0) + (response.usage?.completion_tokens || 0);

  return { text, model, tokensUsed };
}

const GEMINI_FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash-lite",
];

async function generateWithGemini(prompt: string, apiKey: string, model: string): Promise<LLMResult> {
  const order = [model, ...GEMINI_FALLBACK_MODELS.filter((m) => m !== model)];
  const attempts: string[] = [];

  for (const m of order) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const genModel = genAI.getGenerativeModel({ model: m });
      const result = await genModel.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      const usage = response.usageMetadata;
      const tokensUsed =
        (usage?.promptTokenCount || 0) + (usage?.candidatesTokenCount || 0);
      return { text, model: m, tokensUsed };
    } catch (e: any) {
      const msg = String(e?.message || e);
      attempts.push(`${m}: ${msg}`);
    }
  }

  throw new Error(`Gemini: all model attempts failed → ${attempts.join(" | ")}`);
}

// Special sentinel meaning "discover free models live from OpenRouter".
export const OPENROUTER_AUTO = "auto";

// Last-resort static list, only used if /models endpoint is unreachable.
const OPENROUTER_STATIC_FALLBACK = [
  "meta-llama/llama-3.2-3b-instruct:free",
  "google/gemma-2-9b-it:free",
  "mistralai/mistral-7b-instruct:free",
];

let cachedFreeModels: { ids: string[]; ts: number } | null = null;
const MODELS_TTL_MS = 10 * 60 * 1000;

async function fetchOpenRouterFreeModels(apiKey: string): Promise<string[]> {
  if (cachedFreeModels && Date.now() - cachedFreeModels.ts < MODELS_TTL_MS) {
    return cachedFreeModels.ids;
  }

  const res = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    throw new Error(`OpenRouter /models HTTP ${res.status}: ${await res.text().then((s) => s.slice(0, 200))}`);
  }
  const data = await res.json();
  const list: any[] = Array.isArray(data?.data) ? data.data : [];

  const free: { id: string; ctx: number }[] = [];
  for (const m of list) {
    const id = String(m?.id || "");
    if (!id) continue;
    const promptPrice = Number(m?.pricing?.prompt ?? "1");
    const completionPrice = Number(m?.pricing?.completion ?? "1");
    if (promptPrice === 0 && completionPrice === 0) {
      free.push({ id, ctx: Number(m?.context_length || 0) });
    }
  }

  // Prefer larger context windows first (better job description handling).
  free.sort((a, b) => b.ctx - a.ctx);
  const ids = free.map((m) => m.id);

  cachedFreeModels = { ids, ts: Date.now() };
  return ids;
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  prompt: string,
  signal?: AbortSignal,
) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://job-automation-ten.vercel.app",
      "X-Title": "Job Finder",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    }),
    signal,
  });
  return res;
}

// Thrown when the provider tells us to back off. The analyzer treats this as
// a clean batch stop (leaves the row PENDING) rather than a per-job failure
// that would otherwise mark every queued job REJECTED.
export class LLMRateLimitedError extends Error {
  retryAfterMs: number;
  daily: boolean;
  constructor(message: string, retryAfterMs: number, daily = false) {
    super(message);
    this.name = "LLMRateLimitedError";
    this.retryAfterMs = retryAfterMs;
    this.daily = daily;
  }
}

// Free-tier safety: cap how many models we try per single LLM call. OpenRouter
// shares the per-minute budget across every free model, so cycling through 30+
// of them on a 429 just wastes the function's wall-clock without ever
// succeeding. Three tries is plenty for true model-specific failures (model
// went offline, invalid prompt schema, etc.).
const OPENROUTER_MAX_MODEL_ATTEMPTS = 3;
// Hard cap on how long we'll wait inside a single LLM call before giving up
// and surfacing a rate-limit error to the caller.
const OPENROUTER_MAX_WAIT_MS = 4_000;

function parseRetryAfterMs(res: Response, body: string): number {
  const retryAfter = res.headers.get("retry-after");
  if (retryAfter) {
    const secs = Number(retryAfter);
    if (!Number.isNaN(secs) && secs > 0) return Math.round(secs * 1000);
    const asDate = Date.parse(retryAfter);
    if (!Number.isNaN(asDate)) return Math.max(0, asDate - Date.now());
  }
  const reset = res.headers.get("x-ratelimit-reset");
  if (reset) {
    const ts = Number(reset);
    if (!Number.isNaN(ts) && ts > 0) {
      // OpenRouter uses unix milliseconds.
      const delta = ts > 10 ** 12 ? ts - Date.now() : ts * 1000 - Date.now();
      if (delta > 0) return Math.min(delta, 60_000);
    }
  }
  // Body sometimes carries the hint when headers are missing.
  const m = body.match(/retry[_ -]?after[^0-9]{0,8}(\d{1,5})/i);
  if (m) return Number(m[1]) * 1000;
  return 0;
}

async function generateWithOpenRouter(
  prompt: string,
  apiKey: string,
  model: string,
  signal?: AbortSignal,
): Promise<LLMResult> {
  const useAuto = !model || model === OPENROUTER_AUTO;
  let order: string[];

  if (useAuto) {
    try {
      order = await fetchOpenRouterFreeModels(apiKey);
      if (order.length === 0) order = OPENROUTER_STATIC_FALLBACK;
    } catch {
      order = OPENROUTER_STATIC_FALLBACK;
    }
  } else {
    let dynamic: string[] = [];
    try {
      dynamic = await fetchOpenRouterFreeModels(apiKey);
    } catch {
      dynamic = OPENROUTER_STATIC_FALLBACK;
    }
    order = [model, ...dynamic.filter((m) => m !== model)];
  }

  // Trim to the small attempt cap so a single LLM call cannot eat the 60s
  // function budget by walking the entire free-model list.
  order = order.slice(0, OPENROUTER_MAX_MODEL_ATTEMPTS);

  const attempts: string[] = [];

  for (const m of order) {
    if (signal?.aborted) throw new Error("LLM call aborted");
    try {
      const res = await callOpenRouter(apiKey, m, prompt, signal);

      if (res.status === 429) {
        const body = await res.text();
        const waitMs = parseRetryAfterMs(res, body);
        const daily = /per[- ]?day|daily|free-models-per-day|free_models_per_day/i.test(body);
        // Stop the batch immediately for daily-cap or long waits; let the
        // caller surface the message and the user can retry later.
        if (daily || waitMs === 0 || waitMs > OPENROUTER_MAX_WAIT_MS) {
          throw new LLMRateLimitedError(
            daily
              ? "OpenRouter free daily quota reached — wait until tomorrow or add credits"
              : `OpenRouter rate-limited (retry in ${Math.ceil((waitMs || 60_000) / 1000)}s)`,
            waitMs || 60_000,
            daily,
          );
        }
        // Short wait — sleep then retry the SAME model (don't move on, since
        // every free model shares the same budget anyway).
        await new Promise((r) => setTimeout(r, waitMs));
        const retryRes = await callOpenRouter(apiKey, m, prompt, signal);
        if (retryRes.status === 429) {
          const retryBody = await retryRes.text();
          const retryWait = parseRetryAfterMs(retryRes, retryBody) || 60_000;
          throw new LLMRateLimitedError(
            `OpenRouter still rate-limited after backoff (retry in ${Math.ceil(retryWait / 1000)}s)`,
            retryWait,
            false,
          );
        }
        if (!retryRes.ok) {
          attempts.push(`${m}: HTTP ${retryRes.status} after retry`);
          continue;
        }
        const data = await retryRes.json();
        const text = data?.choices?.[0]?.message?.content || "";
        if (!text) {
          attempts.push(`${m}: empty after retry`);
          continue;
        }
        const tokensUsed = (data?.usage?.prompt_tokens || 0) + (data?.usage?.completion_tokens || 0);
        return { text, model: m, tokensUsed };
      }

      if (res.status === 402) {
        const body = await res.text();
        throw new LLMRateLimitedError(
          `OpenRouter rejected: insufficient credits (${body.slice(0, 160)})`,
          24 * 60 * 60_000,
          true,
        );
      }

      if (!res.ok) {
        const body = await res.text();
        attempts.push(`${m}: HTTP ${res.status} ${body.slice(0, 200)}`);
        continue;
      }

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content || "";
      if (!text) {
        attempts.push(`${m}: empty response (${JSON.stringify(data).slice(0, 200)})`);
        continue;
      }
      const tokensUsed = (data?.usage?.prompt_tokens || 0) + (data?.usage?.completion_tokens || 0);
      return { text, model: m, tokensUsed };
    } catch (e: any) {
      if (e instanceof LLMRateLimitedError) throw e;
      attempts.push(`${m}: ${String(e?.message || e)}`);
    }
  }

  throw new Error(`OpenRouter: all ${order.length} free model attempts failed → ${attempts.join(" | ")}`);
}

export { fetchOpenRouterFreeModels, callOpenRouter };

export async function generateText(prompt: string, signal?: AbortSignal): Promise<LLMResult> {
  const config = await getConfig();

  if (config.aiProvider === "gemini") {
    if (!config.geminiApiKey) {
      throw new Error("Gemini API key not configured. Go to /admin/settings to set it.");
    }
    return generateWithGemini(prompt, config.geminiApiKey, config.geminiModel || "gemini-2.5-flash");
  }

  if (config.aiProvider === "openrouter") {
    if (!config.openrouterApiKey) {
      throw new Error("OpenRouter API key not configured. Go to /admin/settings to set it.");
    }
    return generateWithOpenRouter(
      prompt,
      config.openrouterApiKey,
      config.openrouterModel || OPENROUTER_AUTO,
      signal,
    );
  }

  if (!config.openaiApiKey) {
    throw new Error("OpenAI API key not configured. Go to /admin/settings to set it.");
  }
  return generateWithOpenAI(prompt, config.openaiApiKey, config.openaiModel || "gpt-4o-mini");
}
