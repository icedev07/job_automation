import { prisma } from "./prisma";

const FALLBACK_TITLE_SKIP = ["vice president"];
const FALLBACK_URL_SKIP = [
  "nvidia", "redhat", "pinterest", "metacareer", "alignerr",
  "capitalone", "hackajob", "generalmotors", "allstate", "micro1",
  "expedia", "reddit", "horizontaltalent", "fleetai.com", "shieldai",
  "metacareers", "dayforcehcm", "griddynamics", "www.usajobs.gov",
  "usajobs.gov", "gdit", "hopper", "libertymutualgroup", "smarterdx", "caci",
];
const FALLBACK_COMPANY_SKIP = [
  "Alignerr", "NVIDIA", "Pinterest", "Meta", "Innovaccer", "PathAI", "Instacart",
];

let cachedRules: { title: string[]; url: string[]; company: string[] } | null = null;
let cacheTime = 0;
const CACHE_TTL_MS = 60_000;

async function loadRules() {
  const now = Date.now();
  if (cachedRules && now - cacheTime < CACHE_TTL_MS) return cachedRules;

  try {
    const rules = await prisma.skipRule.findMany({ where: { active: true } });
    cachedRules = { title: [], url: [], company: [] };
    for (const rule of rules) {
      if (rule.type === "TITLE") cachedRules.title.push(rule.pattern);
      else if (rule.type === "URL") cachedRules.url.push(rule.pattern);
      else if (rule.type === "COMPANY") cachedRules.company.push(rule.pattern);
    }
    if (cachedRules.title.length === 0 && cachedRules.url.length === 0 && cachedRules.company.length === 0) {
      cachedRules.title = FALLBACK_TITLE_SKIP;
      cachedRules.url = FALLBACK_URL_SKIP;
      cachedRules.company = FALLBACK_COMPANY_SKIP;
    }
    cacheTime = now;
    return cachedRules;
  } catch {
    return {
      title: FALLBACK_TITLE_SKIP,
      url: FALLBACK_URL_SKIP,
      company: FALLBACK_COMPANY_SKIP,
    };
  }
}

export function invalidateSkipRuleCache() {
  cachedRules = null;
  cacheTime = 0;
}

export async function shouldSkipJob(params: {
  title: string;
  company: string;
  externalUrl: string;
}): Promise<boolean> {
  const rules = await loadRules();
  const titleLower = (params.title || "").trim().toLowerCase();
  if (rules.title.some((w) => titleLower.includes(w.toLowerCase()))) return true;
  const urlLower = (params.externalUrl || "").toLowerCase();
  if (rules.url.some((s) => urlLower.includes(s.toLowerCase()))) return true;
  const companyLower = (params.company || "").toLowerCase();
  if (rules.company.some((s) => companyLower.includes(s.toLowerCase()))) return true;
  return false;
}

export async function shouldSkipJobFromCardFields(params: { title: string; company: string }): Promise<boolean> {
  const rules = await loadRules();
  const titleLower = (params.title || "").trim().toLowerCase();
  if (rules.title.some((w) => titleLower.includes(w.toLowerCase()))) return true;
  const companyLower = (params.company || "").toLowerCase();
  if (rules.company.some((s) => companyLower.includes(s.toLowerCase()))) return true;
  return false;
}

export async function shouldSkipJobFromApplyUrl(url: string): Promise<boolean> {
  const rules = await loadRules();
  const urlLower = (url || "").toLowerCase();
  return rules.url.some((s) => urlLower.includes(s.toLowerCase()));
}
