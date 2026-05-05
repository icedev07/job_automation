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

// Curated OpenRouter free-tier models (the `:free` suffix marks no-cost models
// available without a credit card). The chain is tried in order if any model
// is rate-limited, deprecated, or temporarily unavailable. Update by checking
// https://openrouter.ai/models?max_price=0
export const OPENROUTER_FREE_MODELS = [
  "deepseek/deepseek-chat-v3-0324:free",
  "deepseek/deepseek-r1:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
  "qwen/qwen-2.5-72b-instruct:free",
  "nvidia/llama-3.1-nemotron-70b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
];

async function generateWithOpenRouter(prompt: string, apiKey: string, model: string): Promise<LLMResult> {
  const order = [model, ...OPENROUTER_FREE_MODELS.filter((m) => m !== model)];
  const attempts: string[] = [];

  for (const m of order) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://job-automation-ten.vercel.app",
          "X-Title": "Job Finder",
        },
        body: JSON.stringify({
          model: m,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
        }),
      });

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

  throw new Error(`OpenRouter: all model attempts failed → ${attempts.join(" | ")}`);
}

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
      config.openrouterModel || OPENROUTER_FREE_MODELS[0]
    );
  }

  if (!config.openaiApiKey) {
    throw new Error("OpenAI API key not configured. Go to /admin/settings to set it.");
  }
  return generateWithOpenAI(prompt, config.openaiApiKey, config.openaiModel || "gpt-4o-mini");
}
