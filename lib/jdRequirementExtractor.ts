/**
 * Heuristic extraction of JD structure for prompt injection (no LLM).
 * Best-effort: works well on English postings with clear Requirements / Qualifications sections.
 */

export type JDRequirements = {
  /** Bullet-sized lines the model should try to address */
  mustHaves: string[];
  niceToHaves: string[];
  /** Short context from the top of the posting */
  domainContext: string;
  /**
   * Tech / product terms detected in the JD (for ATS-style keyword coverage in prompts).
   * Longest phrases first; deduped.
   */
  techKeywords: string[];
};

function dedupeCap(arr: string[], max: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of arr) {
    const t = s.replace(/\s+/g, " ").trim();
    if (t.length < 10 || t.length > 450) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= max) break;
  }
  return out;
}

function stripBullet(line: string): string {
  return line.replace(/^[-•*]\s*/, "").replace(/^\d+[.)]\s*/, "").trim();
}

/**
 * Pull bullets/lines after common requirement-style headings until the next major section.
 */
export function extractJDRequirements(fullText: string): JDRequirements {
  const raw = (fullText || "").replace(/\r/g, "");
  const lines = raw.split(/\n/).map((l) => l.trim()).filter(Boolean);

  const mustHaves: string[] = [];
  const niceToHaves: string[] = [];

  const mustHeader =
    /^(requirements|qualifications|minimum\s+qualifications|required\s+qualifications|what\s+you\s*(?:'|’)?ll\s+bring|what\s+we\s*(?:'|’)?re\s+looking\s+for|what\s+we\s+are\s+looking\s+for|what\s+we\s+look\s+for|you\s+have|you\s+bring|must\s+have|must-have|who\s+you\s+are|skills?\s*(?:&|and)?\s*experience|technical\s+skills|key\s+skills|what\s+we\s+are\s+seeking)/i;
  const niceHeader = /^(nice\s+to\s+have|preferred|bonus|plus|optional)/i;
  const stopHeader =
    /^(responsibilities|what\s+you\s*(?:'|’)?ll\s+do|what\s+you\s+will\s+do|about\s+(?:the\s+)?role|benefits|what\s+we\s+offer|company|equal\s+opportunity|salary|apply|how\s+to\s+apply|candidate\s+safety)/i;

  let mode: "none" | "must" | "nice" = "none";

  for (const line of lines) {
    if (mustHeader.test(line)) {
      mode = "must";
      continue;
    }
    if (niceHeader.test(line)) {
      mode = "nice";
      continue;
    }
    if (stopHeader.test(line)) {
      mode = "none";
      continue;
    }

    const cleaned = stripBullet(line);
    if (cleaned.length < 12) continue;
    if (mode === "must") mustHaves.push(cleaned);
    if (mode === "nice") niceToHaves.push(cleaned);
  }

  // Fallback: if we found almost nothing, take lines that look like skill/requirement lines
  if (mustHaves.length < 3) {
    const techish =
      /\b(\d+\+?\s*years?|experience\s+with|proficient\s+in|strong\s+in|knowledge\s+of|familiar(?:ity)?\s+with|hands-on|expertise\s+in|strong\s+track\s+record|prior\s+work|building\s+|design(?:ing)?\s+)\b/i;
    for (const line of lines) {
      const cleaned = stripBullet(line);
      if (cleaned.length < 20 || cleaned.length > 400) continue;
      if (techish.test(cleaned)) mustHaves.push(cleaned);
    }
  }

  const paras = raw.split(/\n\s*\n+/).filter((p) => p.trim().length > 40);
  const domainContext = (paras[0] || raw.slice(0, 600)).slice(0, 650).trim();
  const techKeywords = extractJdTechKeywords(raw);

  return {
    mustHaves: dedupeCap(mustHaves, 22),
    niceToHaves: dedupeCap(niceToHaves, 12),
    domainContext,
    techKeywords,
  };
}

/** Multi-word and single-token tech / product phrases to match in JD text (longest match wins via sort). */
const JD_TECH_PHRASES: string[] = [
  "Endpoint Security",
  "Network Extension",
  "Network extensions",
  "System Extension",
  "Instruments",
  "Xcode",
  "Visual Regression",
  "Contract Testing",
  "Large Language Model",
  "Machine Learning",
  "Data Lineage",
  "GitHub Actions",
  "GitLab CI",
  "CircleCI",
  "Buildkite",
  "Argo CD",
  "ArgoCD",
  "Elastic Stack",
  "Apache Kafka",
  "PostgreSQL",
  "TimescaleDB",
  "MongoDB",
  "Redis",
  "GraphQL",
  "REST API",
  "Spring Boot",
  "FastAPI",
  "Django",
  "Flask",
  "Node.js",
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "TypeScript",
  "JavaScript",
  "Kubernetes",
  "Terraform",
  "Ansible",
  "Prometheus",
  "Grafana",
  "Datadog",
  "OpenTelemetry",
  "Microservices",
  "Event-Driven",
  "Serverless",
  "AWS Lambda",
  "Google Cloud",
  "Azure DevOps",
  "Playwright",
  "Cypress",
  "Selenium",
  "JUnit",
  "Jest",
  "Swift",
  "Objective-C",
  "macOS",
  "iOS",
  "Android",
  "Kotlin",
  "Ruby on Rails",
  "Ruby",
  "Rails",
  "Elixir",
  "Phoenix",
  "Scala",
  "Go",
  "Golang",
  "Rust",
  "C#",
  ".NET",
  "ASP.NET",
  "PHP",
  "Laravel",
  "Docker",
  "Helm",
  "Istio",
  "gRPC",
  "WebSockets",
  "CI/CD",
  "DevOps",
  "SRE",
  "Observability",
  "Elasticsearch",
  "Snowflake",
  "Databricks",
  "PyTorch",
  "TensorFlow",
  "LangChain",
  "LLM",
  "RAG",
  "SQL",
  "NoSQL",
  "ETL",
  "Airflow",
  "Spark",
  "DLP",
  "EDR",
  "SIEM",
  "OAuth",
  "SAML",
  "IAM",
  "SOC 2",
  "GDPR",
  "HIPAA",
  "PCI-DSS",
  "Python",
  "Java",
  "Vue",
  "GCP",
  "AWS",
  "Azure",
];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Extract technology and product terms present in the JD for prompt injection (ATS / recruiter-AI alignment).
 */
export function extractJdTechKeywords(fullText: string): string[] {
  const raw = (fullText || "").replace(/\r/g, " ");
  const sorted = [...JD_TECH_PHRASES].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`\\b(?:${sorted.map(escapeRegExp).join("|")})\\b`, "gi");
  const seen = new Set<string>();
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(pattern.source, pattern.flags);
  while ((m = re.exec(raw)) !== null) {
    const canonical = sorted.find((p) => p.toLowerCase() === m![0].toLowerCase()) || m[0];
    const key = canonical.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(canonical);
    if (out.length >= 48) break;
  }
  return out;
}

export function formatJDRequirementsForPrompt(req: JDRequirements): string {
  const must =
    req.mustHaves.length > 0
      ? req.mustHaves.map((s, i) => `${i + 1}. ${s}`).join("\n")
      : "(No clear Requirements section found — infer must-haves from the full JOB DESCRIPTION.)";
  const nice =
    req.niceToHaves.length > 0
      ? req.niceToHaves.map((s, i) => `${i + 1}. ${s}`).join("\n")
      : "(None extracted.)";
  const kw =
    req.techKeywords && req.techKeywords.length > 0
      ? req.techKeywords.join(", ")
      : "(No dedicated tech list extracted — still mirror language from the JOB DESCRIPTION verbatim where credible.)";
  return `ROLE CONTEXT (opening of posting):\n${req.domainContext}\n\nINFERRED MUST-HAVE / REQUIREMENT LINES:\n${must}\n\nNICE-TO-HAVE (if any):\n${nice}\n\nJD TECH / PRODUCT TERMS (detected in posting — prioritize verbatim use in SUMMARY, SKILLS, and per-role Technologies & lines for ATS and recruiter-AI matching):\n${kw}`;
}
