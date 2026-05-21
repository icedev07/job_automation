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

// Pull a retry hint out of a Gemini quota error. The SDK surfaces the REST
// error body verbatim, which carries  "retryDelay":"34s"  on 429 responses.
function parseGeminiRetryMs(msg: string): number {
  const m = msg.match(/retryDelay["'\s:]+(\d+(?:\.\d+)?)s/i);
  return m ? Math.round(parseFloat(m[1]) * 1000) : 0;
}

export async function generateWithGemini(
  prompt: string,
  apiKey: string,
  model: string,
  signal?: AbortSignal,
): Promise<LLMResult> {
  const order = [model, ...GEMINI_FALLBACK_MODELS.filter((m) => m !== model)];
  const attempts: string[] = [];
  let rateLimited = false;
  let retryMs = 0;
  let daily = false;

  for (const m of order) {
    if (signal?.aborted) throw new Error("LLM call aborted");
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
      // 429 / RESOURCE_EXHAUSTED is a back-off signal, not a model fault: every
      // fallback model shares the same per-project quota, so stop here and
      // surface a rate-limit error instead of letting the caller mark the job
      // REJECTED.
      if (/\b429\b|RESOURCE_EXHAUSTED|too many requests|quota/i.test(msg)) {
        rateLimited = true;
        retryMs = Math.max(retryMs, parseGeminiRetryMs(msg));
        if (/per[- ]?day|daily|PerDay/i.test(msg)) daily = true;
        break;
      }
    }
  }

  if (rateLimited) {
    // A daily cap will not clear in seconds — park the provider for a good
    // while even if the error carried a short retry hint.
    throw new LLMRateLimitedError(
      daily
        ? "Gemini free daily quota reached — resets at midnight Pacific time"
        : `Gemini rate-limited (retry in ${Math.ceil((retryMs || 60_000) / 1000)}s)`,
      daily ? Math.max(retryMs, 60 * 60_000) : retryMs || 60_000,
      daily,
    );
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
    // OpenRouter's genuinely-free chat variants all carry the ":free" suffix.
    // Filtering on $0 prompt/completion pricing alone also lets through
    // preview / cloaked models — e.g. google/lyria-* (audio generation, billed
    // via other pricing fields) and openrouter/owl-alpha (gated by a data-
    // policy guardrail). Those 402/404 on every call and just burn the per-day
    // free request budget, so require the explicit free marker.
    if (!id.endsWith(":free")) continue;
    const pricing = m?.pricing || {};
    const hasPaidField = ["prompt", "completion", "request", "image"].some(
      (k) => Number(pricing[k] ?? 0) > 0,
    );
    if (hasPaidField) continue;
    // Must emit text to return a chat completion — skip image/audio models.
    const outputs = m?.architecture?.output_modalities;
    if (Array.isArray(outputs) && outputs.length > 0 && !outputs.includes("text")) {
      continue;
    }
    free.push({ id, ctx: Number(m?.context_length || 0) });
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

// ============================================================================
// Generic OpenAI-compatible providers — Groq & Cerebras
// ----------------------------------------------------------------------------
// Both expose the exact OpenAI POST /chat/completions contract, so one client
// serves both; only the base URL and model list differ. Each takes an ordered
// model list so a renamed or retired model id self-heals to the next candidate
// instead of breaking the provider outright.
// ============================================================================

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const CEREBRAS_BASE_URL = "https://api.cerebras.ai/v1";

const GROQ_FALLBACK_MODELS = [
  "llama-3.1-8b-instant",
  "llama-3.3-70b-versatile",
  "openai/gpt-oss-20b",
];
const CEREBRAS_FALLBACK_MODELS = ["llama-3.3-70b", "llama3.1-8b", "gpt-oss-120b"];

// Put the configured model first, then the fallbacks (de-duplicated).
function buildModelOrder(preferred: string, fallback: string[]): string[] {
  const p = (preferred || "").trim();
  if (!p) return [...fallback];
  return [p, ...fallback.filter((m) => m !== p)];
}

async function generateWithOpenAICompatible(
  providerLabel: string,
  baseUrl: string,
  apiKey: string,
  models: string[],
  prompt: string,
  signal?: AbortSignal,
): Promise<LLMResult> {
  const attempts: string[] = [];

  for (const m of models) {
    if (signal?.aborted) throw new Error("LLM call aborted");
    let res: Response;
    try {
      res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: m,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          // Generous ceiling for the JSON verdict(s); the model stops earlier.
          // Kept modest so prompt + output stay inside small free-tier windows
          // (Cerebras' free tier caps context at ~8K tokens).
          max_tokens: 1500,
        }),
        signal,
      });
    } catch (e: any) {
      attempts.push(`${m}: ${String(e?.message || e)}`);
      continue;
    }

    // 429 → provider-wide throttle. Groq/Cerebras free tiers rate-limit at the
    // organisation level, so switching model cannot help — surface a rate-limit
    // error so the caller (or the rotation pool) backs off cleanly.
    if (res.status === 429) {
      const body = await res.text();
      const waitMs = parseRetryAfterMs(res, body) || 60_000;
      const daily =
        /per[- ]?day|requests per day|tokens per day|\bRPD\b|\bTPD\b|daily/i.test(body);
      throw new LLMRateLimitedError(
        daily
          ? `${providerLabel} free daily quota reached`
          : `${providerLabel} rate-limited (retry in ${Math.ceil(waitMs / 1000)}s)`,
        // A daily cap will not clear in seconds — keep the provider parked.
        daily ? Math.max(waitMs, 60 * 60_000) : waitMs,
        daily,
      );
    }

    if (!res.ok) {
      // A bad/retired model id (400/404) just falls through to the next one.
      const body = await res.text();
      attempts.push(`${m}: HTTP ${res.status} ${body.slice(0, 200)}`);
      continue;
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "";
    if (!text) {
      attempts.push(`${m}: empty response`);
      continue;
    }
    const tokensUsed =
      (data?.usage?.prompt_tokens || 0) + (data?.usage?.completion_tokens || 0);
    return { text, model: m, tokensUsed };
  }

  throw new Error(
    `${providerLabel}: all ${models.length} model attempts failed → ${attempts.join(" | ")}`,
  );
}

export async function generateWithGroq(
  prompt: string,
  apiKey: string,
  model: string,
  signal?: AbortSignal,
): Promise<LLMResult> {
  return generateWithOpenAICompatible(
    "Groq",
    GROQ_BASE_URL,
    apiKey,
    buildModelOrder(model, GROQ_FALLBACK_MODELS),
    prompt,
    signal,
  );
}

export async function generateWithCerebras(
  prompt: string,
  apiKey: string,
  model: string,
  signal?: AbortSignal,
): Promise<LLMResult> {
  return generateWithOpenAICompatible(
    "Cerebras",
    CEREBRAS_BASE_URL,
    apiKey,
    buildModelOrder(model, CEREBRAS_FALLBACK_MODELS),
    prompt,
    signal,
  );
}

// ============================================================================
// Smart Rotation
// ----------------------------------------------------------------------------
// Pools every provider that has an API key and tries them in priority order.
// When a provider is rate-limited it is parked on a cooldown (until its
// retry-after / daily reset) and the next provider is used. Two priority
// orders stop the scanner and the extension from fighting over one provider:
//   - "batch"  → big-context providers first   (Gemini, OpenRouter)
//   - "single" → fast high-volume providers first (Cerebras, Groq)
// Cooldowns live in module memory; on Vercel that survives for the life of a
// warm function — exactly the span of one analyze-all-pending run.
// ============================================================================

export type LLMPurpose = "single" | "batch";

type RotationConfig = Awaited<ReturnType<typeof getConfig>>;
type RotationProviderId = "gemini" | "groq" | "cerebras" | "openrouter";

type RotationProvider = {
  id: RotationProviderId;
  label: string;
  // Rough upper bound (chars) on a prompt this provider's free-tier context
  // can hold. A batched prompt that exceeds it is routed to a bigger-context
  // provider instead of being sent on a guaranteed failure.
  maxPromptChars: number;
  keyOf: (c: RotationConfig) => string;
  run: (prompt: string, c: RotationConfig, signal?: AbortSignal) => Promise<LLMResult>;
};

const ROTATION_PROVIDERS: Record<RotationProviderId, RotationProvider> = {
  gemini: {
    id: "gemini",
    label: "Gemini",
    maxPromptChars: 900_000,
    keyOf: (c) => c.geminiApiKey,
    run: (prompt, c, signal) =>
      generateWithGemini(prompt, c.geminiApiKey, c.geminiModel || "gemini-2.5-flash", signal),
  },
  openrouter: {
    id: "openrouter",
    label: "OpenRouter",
    maxPromptChars: 200_000,
    keyOf: (c) => c.openrouterApiKey,
    run: (prompt, c, signal) =>
      generateWithOpenRouter(
        prompt,
        c.openrouterApiKey,
        c.openrouterModel || OPENROUTER_AUTO,
        signal,
      ),
  },
  cerebras: {
    id: "cerebras",
    label: "Cerebras",
    maxPromptChars: 16_000,
    keyOf: (c) => c.cerebrasApiKey,
    run: (prompt, c, signal) =>
      generateWithCerebras(prompt, c.cerebrasApiKey, c.cerebrasModel, signal),
  },
  groq: {
    id: "groq",
    label: "Groq",
    maxPromptChars: 14_000,
    keyOf: (c) => c.groqApiKey,
    run: (prompt, c, signal) => generateWithGroq(prompt, c.groqApiKey, c.groqModel, signal),
  },
};

const ROTATION_ORDER: Record<LLMPurpose, RotationProviderId[]> = {
  // One job at a time (extension): fast, high daily-volume providers first.
  single: ["cerebras", "groq", "gemini", "openrouter"],
  // Batched many-job prompts (scanner): big-context providers first.
  batch: ["gemini", "openrouter", "cerebras", "groq"],
};

// A transient (non-rate-limit) failure parks the provider briefly so the next
// call in the same run reaches a healthy provider first.
const TRANSIENT_COOLDOWN_MS = 45_000;

const providerCooldownUntil = new Map<RotationProviderId, number>();

function cooldownRemainingMs(id: RotationProviderId): number {
  return Math.max(0, (providerCooldownUntil.get(id) || 0) - Date.now());
}

async function generateWithRotation(
  prompt: string,
  config: RotationConfig,
  purpose: LLMPurpose,
  signal?: AbortSignal,
): Promise<LLMResult> {
  const withKey = ROTATION_ORDER[purpose]
    .map((id) => ROTATION_PROVIDERS[id])
    .filter((p) => p.keyOf(config).trim().length > 0);

  if (withKey.length === 0) {
    throw new Error(
      "Smart Rotation is selected but no provider API keys are set. Add at least one key (Gemini, Groq, Cerebras or OpenRouter) in /admin/settings.",
    );
  }

  // Drop providers whose free-tier context cannot hold this prompt.
  const pool = withKey.filter((p) => prompt.length <= p.maxPromptChars);
  if (pool.length === 0) {
    throw new Error(
      `Prompt is ${prompt.length} chars — larger than any configured rotation provider can accept. Lower the analyzer batch size in /admin/scanners.`,
    );
  }

  const attempts: string[] = [];
  let soonestRetryMs = Infinity;

  for (const p of pool) {
    const cd = cooldownRemainingMs(p.id);
    if (cd > 0) {
      soonestRetryMs = Math.min(soonestRetryMs, cd);
      attempts.push(`${p.label}: cooling down ${Math.ceil(cd / 1000)}s`);
      continue;
    }
    if (signal?.aborted) throw new Error("LLM call aborted");

    try {
      const result = await p.run(prompt, config, signal);
      // Tag the model with its provider so AnalysisLog shows the rotation path.
      return { ...result, model: `${p.id}:${result.model}` };
    } catch (e: any) {
      if (e?.message === "LLM call aborted") throw e;
      const cooldown =
        e instanceof LLMRateLimitedError ? e.retryAfterMs : TRANSIENT_COOLDOWN_MS;
      providerCooldownUntil.set(p.id, Date.now() + cooldown);
      soonestRetryMs = Math.min(soonestRetryMs, cooldown);
      attempts.push(`${p.label}: ${String(e?.message || e)}`);
      console.warn(
        `[rotation] ${p.label} unavailable (cooling ${Math.ceil(cooldown / 1000)}s): ${String(
          e?.message || e,
        )}`,
      );
    }
  }

  // Every provider in the pool is unavailable. Surface a rate-limit error so
  // the analyzer pauses cleanly and leaves the rows PENDING for a later pass,
  // rather than a plain error that would mass-reject the batch.
  throw new LLMRateLimitedError(
    `All rotation providers unavailable → ${attempts.join(" | ")}`,
    Number.isFinite(soonestRetryMs) ? soonestRetryMs : 60_000,
    false,
  );
}

export async function generateText(
  prompt: string,
  signal?: AbortSignal,
  purpose: LLMPurpose = "single",
): Promise<LLMResult> {
  const config = await getConfig();

  if (config.aiProvider === "rotation") {
    return generateWithRotation(prompt, config, purpose, signal);
  }

  if (config.aiProvider === "gemini") {
    if (!config.geminiApiKey) {
      throw new Error("Gemini API key not configured. Go to /admin/settings to set it.");
    }
    return generateWithGemini(
      prompt,
      config.geminiApiKey,
      config.geminiModel || "gemini-2.5-flash",
      signal,
    );
  }

  if (config.aiProvider === "groq") {
    if (!config.groqApiKey) {
      throw new Error("Groq API key not configured. Go to /admin/settings to set it.");
    }
    return generateWithGroq(prompt, config.groqApiKey, config.groqModel, signal);
  }

  if (config.aiProvider === "cerebras") {
    if (!config.cerebrasApiKey) {
      throw new Error("Cerebras API key not configured. Go to /admin/settings to set it.");
    }
    return generateWithCerebras(prompt, config.cerebrasApiKey, config.cerebrasModel, signal);
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
