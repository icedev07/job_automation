import { prisma } from "./prisma";

const CONFIG_KEYS = {
  OPENAI_API_KEY: "openai_api_key",
  OPENAI_MODEL: "openai_model",
  GOOGLE_SHEETS_CREDENTIALS: "google_sheets_credentials",
  GOOGLE_SHEET_ID: "google_sheet_id",
  ADMIN_PASSWORD: "admin_password",
  RESUME_PROMPT_TEMPLATE: "resume_prompt_template",
  COVER_LETTER_PROMPT_TEMPLATE: "cover_letter_prompt_template",
} as const;

export { CONFIG_KEYS };

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
  for (const row of rows) {
    config[row.key] = row.value;
  }
  return config;
}

export async function getConfig() {
  const all = await getAllConfig();
  return {
    openaiApiKey: all[CONFIG_KEYS.OPENAI_API_KEY] || "",
    openaiModel: all[CONFIG_KEYS.OPENAI_MODEL] || "gpt-4o-mini",
    googleSheetsCredentials: all[CONFIG_KEYS.GOOGLE_SHEETS_CREDENTIALS] || "",
    googleSheetId: all[CONFIG_KEYS.GOOGLE_SHEET_ID] || "",
    adminPassword: all[CONFIG_KEYS.ADMIN_PASSWORD] || "admin",
    resumePromptTemplate: all[CONFIG_KEYS.RESUME_PROMPT_TEMPLATE] || "",
    coverLetterPromptTemplate: all[CONFIG_KEYS.COVER_LETTER_PROMPT_TEMPLATE] || "",
  };
}

export function maskApiKey(key: string): string {
  if (!key || key.length < 8) return "****";
  return key.slice(0, 4) + "****" + key.slice(-4);
}
