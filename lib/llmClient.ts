import OpenAI from "openai";
import { getConfig } from "./config";

let cachedClient: OpenAI | null = null;
let cachedKey = "";

function getClient(apiKey: string): OpenAI {
  if (cachedClient && cachedKey === apiKey) return cachedClient;
  cachedClient = new OpenAI({ apiKey });
  cachedKey = apiKey;
  return cachedClient;
}

export type LLMResult = {
  text: string;
  model: string;
  tokensUsed: number;
};

export async function generateText(prompt: string): Promise<LLMResult> {
  const config = await getConfig();
  if (!config.openaiApiKey) {
    throw new Error("OpenAI API key not configured. Go to /admin/settings to set it.");
  }

  const client = getClient(config.openaiApiKey);
  const model = config.openaiModel || "gpt-4o-mini";

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
