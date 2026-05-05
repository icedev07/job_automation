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

const GEMINI_FALLBACK_MODELS = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-8b"];

async function generateWithGemini(prompt: string, apiKey: string, model: string): Promise<LLMResult> {
  const order = [model, ...GEMINI_FALLBACK_MODELS.filter((m) => m !== model)];
  let lastErr: Error | null = null;

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
      lastErr = e instanceof Error ? e : new Error(String(e?.message || e));
    }
  }

  throw lastErr || new Error("Gemini: all model attempts failed");
}

export async function generateText(prompt: string): Promise<LLMResult> {
  const config = await getConfig();

  if (config.aiProvider === "gemini") {
    if (!config.geminiApiKey) {
      throw new Error("Gemini API key not configured. Go to /admin/settings to set it.");
    }
    return generateWithGemini(prompt, config.geminiApiKey, config.geminiModel || "gemini-1.5-flash");
  }

  if (!config.openaiApiKey) {
    throw new Error("OpenAI API key not configured. Go to /admin/settings to set it.");
  }
  return generateWithOpenAI(prompt, config.openaiApiKey, config.openaiModel || "gpt-4o-mini");
}
