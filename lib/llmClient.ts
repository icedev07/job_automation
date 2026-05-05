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

async function callOpenRouter(apiKey: string, model: string, prompt: string) {
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
  });
  return res;
}

async function generateWithOpenRouter(prompt: string, apiKey: string, model: string): Promise<LLMResult> {
  const useAuto = !model || model === OPENROUTER_AUTO;
  let order: string[];

  if (useAuto) {
    try {
      order = await fetchOpenRouterFreeModels(apiKey);
      if (order.length === 0) order = OPENROUTER_STATIC_FALLBACK;
    } catch (e) {
      order = OPENROUTER_STATIC_FALLBACK;
    }
  } else {
    let dynamic: string[] = [];
    try {
      dynamic = await fetchOpenRouterFreeModels(apiKey);
    } catch (e) {
      dynamic = OPENROUTER_STATIC_FALLBACK;
    }
    order = [model, ...dynamic.filter((m) => m !== model)];
  }

  const attempts: string[] = [];

  for (const m of order) {
    try {
      const res = await callOpenRouter(apiKey, m, prompt);

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
      attempts.push(`${m}: ${String(e?.message || e)}`);
    }
  }

  throw new Error(`OpenRouter: all ${order.length} free model attempts failed → ${attempts.join(" | ")}`);
}

export { fetchOpenRouterFreeModels, callOpenRouter };

export async function generateText(prompt: string): Promise<LLMResult> {
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
      config.openrouterModel || OPENROUTER_AUTO
    );
  }

  if (!config.openaiApiKey) {
    throw new Error("OpenAI API key not configured. Go to /admin/settings to set it.");
  }
  return generateWithOpenAI(prompt, config.openaiApiKey, config.openaiModel || "gpt-4o-mini");
}
