import { prisma } from "./prisma";

export const CONFIG_KEYS = {
  AI_PROVIDER: "ai_provider",
  OPENAI_API_KEY: "openai_api_key",
  OPENAI_MODEL: "openai_model",
  GEMINI_API_KEY: "gemini_api_key",
  GEMINI_MODEL: "gemini_model",
  OPENROUTER_API_KEY: "openrouter_api_key",
  OPENROUTER_MODEL: "openrouter_model",
  GOOGLE_SHEETS_CREDENTIALS: "google_sheets_credentials",
  GOOGLE_SHEET_ID: "google_sheet_id",
  ADMIN_PASSWORD: "admin_password",
  TARGET_MARKET: "target_market",
  CURRENT_LOCATION: "current_location",
  JOB_ANALYSIS_PROMPT: "job_analysis_prompt",
  SHEET_COLUMNS: "sheet_columns",
  LINKEDIN_SHEET_TAB: "linkedin_sheet_tab",
  EXTENSION_API_KEY: "extension_api_key",
  ANALYZER_REQUEST_DELAY_MS: "analyzer_request_delay_ms",
} as const;

export async function getConfigValue(key: string): Promise<string | null> {
  const row = await prisma.appConfig.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setConfigValue(key: string, value: string): Promise<void> {
  await prisma.appConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function getAllConfig(): Promise<Record<string, string>> {
  const rows = await prisma.appConfig.findMany();
  const config: Record<string, string> = {};
  for (const row of rows) config[row.key] = row.value;
  return config;
}

export async function getConfig() {
  const all = await getAllConfig();
  const envAdmin = process.env.ADMIN_PASSWORD?.trim();
  const dbAdmin = all[CONFIG_KEYS.ADMIN_PASSWORD]?.trim();
  const adminPassword =
    envAdmin && envAdmin.length > 0 ? envAdmin : dbAdmin || "admin";

  return {
    aiProvider: (all[CONFIG_KEYS.AI_PROVIDER] || "gemini") as "openai" | "gemini" | "openrouter",
    openaiApiKey: all[CONFIG_KEYS.OPENAI_API_KEY] || "",
    openaiModel: all[CONFIG_KEYS.OPENAI_MODEL] || "gpt-4o-mini",
    geminiApiKey: all[CONFIG_KEYS.GEMINI_API_KEY] || "",
    geminiModel: all[CONFIG_KEYS.GEMINI_MODEL] || "gemini-2.5-flash",
    openrouterApiKey: all[CONFIG_KEYS.OPENROUTER_API_KEY] || "",
    openrouterModel: all[CONFIG_KEYS.OPENROUTER_MODEL] || "auto",
    googleSheetsCredentials: all[CONFIG_KEYS.GOOGLE_SHEETS_CREDENTIALS] || "",
    googleSheetId: all[CONFIG_KEYS.GOOGLE_SHEET_ID] || "",
    adminPassword,
    targetMarket: all[CONFIG_KEYS.TARGET_MARKET] || "Europe, Eastern Europe, Remote worldwide",
    currentLocation: all[CONFIG_KEYS.CURRENT_LOCATION] || "Armenia",
    jobAnalysisPrompt: all[CONFIG_KEYS.JOB_ANALYSIS_PROMPT] || "",
    sheetColumns: all[CONFIG_KEYS.SHEET_COLUMNS] || "",
    linkedinSheetTab: all[CONFIG_KEYS.LINKEDIN_SHEET_TAB] || "LinkedIn",
    extensionApiKey: all[CONFIG_KEYS.EXTENSION_API_KEY] || "",
    // Inter-request pacing for the LLM. Default 2500ms keeps OpenRouter free
    // tier (20 req/min) safely under the per-minute cap with margin for the
    // network round-trip. Set to 0 to disable when using a paid model.
    analyzerRequestDelayMs: Math.max(
      0,
      Number(all[CONFIG_KEYS.ANALYZER_REQUEST_DELAY_MS]) || 2_500,
    ),
  };
}

export const DEFAULT_SHEET_COLUMNS = [
  { key: "title", label: "Title" },
  { key: "company", label: "Company" },
  { key: "location", label: "Location" },
  { key: "url", label: "URL" },
  { key: "platform", label: "Source" },
  { key: "aiScore", label: "AI Score" },
  { key: "techStack", label: "Tech Stack" },
  { key: "salary", label: "Salary" },
  { key: "createdAt", label: "Date Found" },
];

export function getSheetColumns(configValue: string) {
  if (!configValue) return DEFAULT_SHEET_COLUMNS;
  try {
    const parsed = JSON.parse(configValue);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}
  return DEFAULT_SHEET_COLUMNS;
}

export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}
