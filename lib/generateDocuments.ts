import { prisma } from "./prisma";
import { generateResumeAndCoverLetterViaChatGPTUi } from "./chatgptUiClient";
import { loadMohanExperienceInventory } from "./mohanExperienceInventory";
import {
  saveResumeAsDocx,
  saveCoverLetterAsDocx,
  saveJobDescriptionAsTxt,
  extractTextFromResumeTemplate,
} from "./documentGenerator";
import { parseResumeText, ParsedResume } from "./resumeParser";
import * as path from "path";
import * as fs from "fs";

// Use dynamic import for mammoth
const mammoth = require("mammoth");

const PROMPT_VERSION = "chatgpt-ui-only";
const PROMPT_VERSION_MOHAN = "chatgpt-ui-mohan-inventory-v9-jd-tech-ats-keywords";

function sanitizeRoleForTitle(role: string): string {
  return (role || "")
    .replace(/\(.*?\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectRoleSpecialization(role: string): string {
  const r = sanitizeRoleForTitle(role).toLowerCase();
  if (r.includes("ranking") || r.includes("search") || r.includes("relevance")) {
    return "Search and Ranking Systems";
  }
  if (r.includes("full.stack") || r.includes("fullstack") || r.includes("full stack")) {
    return "Full-Stack Product Engineering";
  }
  if (r.includes("frontend") || r.includes("front-end") || r.includes("react") || r.includes("ui engineer")) {
    return "Frontend & Web Systems";
  }
  if (r.includes("devops") || r.includes("sre") || r.includes("site reliability")) {
    return "DevOps & Reliability";
  }
  if (r.includes("kubernetes") || r.includes("k8s")) {
    return "Kubernetes & Cloud Infrastructure";
  }
  if (r.includes("data engineer") || r.includes("data platform") || r.includes("etl")) {
    return "Data Platform Engineering";
  }
  if (r.includes(".net") || r.includes("c#")) {
    return ".NET Backend Systems";
  }
  if (r.includes("python")) {
    return "Python Backend Systems";
  }
  if (r.includes("machine learning") || r.includes("ml") || r.includes("ai")) {
    return "ML Platform Systems";
  }
  if (r.includes("backend")) {
    return "Backend Platform Systems";
  }
  if (r.includes("platform")) {
    return "Cloud Platform Systems";
  }
  return "Backend and Cloud Systems";
}

/**
 * Strip trailing "— {theme}" when it matches this posting’s specialization (any bucket).
 * Stops the model from pasting the same JD theme after every employer (backend, frontend, etc.).
 */
function stripMohanJdThemeSuffix(titleSegment: string, jobPostingTitle: string): string {
  const spec = detectRoleSpecialization(jobPostingTitle);
  if (!spec || !titleSegment.trim()) return titleSegment;
  const escaped = spec.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`\\s*[—\\-–]\\s*${escaped}\\s*$`, "i");
  const trimmed = titleSegment.replace(re, "").trim();
  return trimmed.length > 0 ? trimmed : titleSegment;
}

/**
 * DOCX fallbacks when the model leaves titles unchanged: align to posting *themes* via specialization,
 * not by pasting the job listing title (reads more natural on a resume).
 */
function resolveMohanTitleOverrides(jobTitle: string): { headlineTitle: string; firstCompanyTitle: string } {
  const specialization = detectRoleSpecialization(jobTitle);
  const headlineTitle = `Senior Software Engineer | ${specialization}`;
  const firstCompanyBase =
    process.env.MOHAN_FIRST_COMPANY_BASE_TITLE?.trim() ||
    "Senior DevOps Engineer / Acting Lead - Developer Experience & Platform";
  // Theme lives in the headline only; appending the same bucket after a long base title reads robotic/contradictory.
  const firstCompanyTitle = firstCompanyBase;
  return { headlineTitle, firstCompanyTitle };
}

function getRoleTitleFromExperienceHeader(block: string): string | null {
  const first = (block || "")
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  if (!first || !first.includes("|")) return null;
  const role = first.split("|")[0]?.trim();
  return role || null;
}

function getHeadlineTitleFromParsedHeader(header: string): string | null {
  const lines = (header || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  for (const line of lines) {
    if (/@/.test(line)) continue;
    if (/\+?\d[\d\s()-]{6,}/.test(line)) continue;
    if (line.includes("|")) return line;
  }
  return null;
}

/** Keep Mohan’s header line scannable: one pipe, two short clauses (model often over-stuffs). */
const MOHAN_HEADLINE_MAX_CHARS = 88;
const MOHAN_HEADLINE_LEFT_MAX = 42;
const MOHAN_HEADLINE_RIGHT_MAX = 44;

function compactMohanHeadline(raw: string): string {
  const h = (raw || "").replace(/\s+/g, " ").trim();
  if (!h) return h;
  const parts = h.split("|").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return "";
  const left0 = parts[0];
  const right0 = parts.length >= 2 ? parts[1] : "";
  let left = left0;
  let right = right0;
  if (left.length > MOHAN_HEADLINE_LEFT_MAX) {
    left = `${left0.slice(0, MOHAN_HEADLINE_LEFT_MAX - 1).trim()}…`;
  }
  if (right) {
    if (right.length > MOHAN_HEADLINE_RIGHT_MAX) {
      let r = right.slice(0, MOHAN_HEADLINE_RIGHT_MAX - 1).trim();
      const cut = r.lastIndexOf(" ");
      if (cut > 18) r = r.slice(0, cut);
      right = `${r}…`;
    }
    let out = `${left} | ${right}`;
    if (out.length > MOHAN_HEADLINE_MAX_CHARS) {
      const room = Math.max(12, MOHAN_HEADLINE_MAX_CHARS - 3 - left.length);
      if (right.length > room) {
        let r2 = right.slice(0, room - 1).trim();
        const cut2 = r2.lastIndexOf(" ");
        if (cut2 > 10) r2 = r2.slice(0, cut2);
        right = `${r2}…`;
      }
      out = `${left} | ${right}`;
    }
    return out;
  }
  return left.length > MOHAN_HEADLINE_MAX_CHARS ? `${left.slice(0, MOHAN_HEADLINE_MAX_CHARS - 1)}…` : left;
}

function normalizeTitleLineForCompare(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/\s+/g, " ")
    .replace(/[·|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Prefer LLM headline when it differs from base; else job-posting-driven fallback. */
function resolveMohanHeadlineForDocx(
  tailoredHeader: string,
  baseHeader: string,
  jobPostingTitle: string
): string {
  const tailored = getHeadlineTitleFromParsedHeader(tailoredHeader);
  const base = getHeadlineTitleFromParsedHeader(baseHeader);
  const fallback = resolveMohanTitleOverrides(jobPostingTitle);
  if (!tailored) {
    return compactMohanHeadline(fallback.headlineTitle);
  }
  if (normalizeTitleLineForCompare(tailored) === normalizeTitleLineForCompare(base)) {
    return compactMohanHeadline(fallback.headlineTitle);
  }
  return compactMohanHeadline(tailored);
}

/**
 * Prefer LLM first-role title when it differs from base.
 * When the model echoes the base title, keep that employer-specific base title (same as roles 2–4),
 * not a hardcoded fallback — otherwise every DOCX shows the same first-company title and looks untailored.
 */
function resolveMohanFirstCompanyTitleForDocx(
  tailoredBlock: string,
  baseBlock: string,
  jobPostingTitle: string
): string {
  const tailored = getRoleTitleFromExperienceHeader(tailoredBlock);
  const base = getRoleTitleFromExperienceHeader(baseBlock);
  const fallback = resolveMohanTitleOverrides(jobPostingTitle);
  if (!tailored) {
    if (base?.trim()) return stripMohanJdThemeSuffix(base.trim(), jobPostingTitle);
    return fallback.firstCompanyTitle;
  }
  if (normalizeTitleLineForCompare(tailored) === normalizeTitleLineForCompare(base)) {
    const b = (base || tailored || "").trim();
    return stripMohanJdThemeSuffix(b, jobPostingTitle);
  }
  return stripMohanJdThemeSuffix(tailored, jobPostingTitle);
}

/**
 * Roles 2–4: prefer model output when it differs from base; else base title only (no appended JD theme).
 */
function resolveMohanLaterCompanyTitleForDocx(
  tailoredBlock: string,
  baseBlock: string,
  jobPostingTitle: string
): string {
  const tailored = getRoleTitleFromExperienceHeader(tailoredBlock);
  const base = getRoleTitleFromExperienceHeader(baseBlock) ?? "";
  if (tailored && normalizeTitleLineForCompare(tailored) !== normalizeTitleLineForCompare(base)) {
    return stripMohanJdThemeSuffix(tailored.trim(), jobPostingTitle);
  }
  const b = (base || tailored || "").trim();
  return b;
}

function resolveResumeSamplePath(userId?: number): string {
  const cwd = process.cwd();
  const isMohan = userId === 2;
  const candidates = isMohan
    ? [
        process.env.MOHAN_RESUME_SAMPLE_PATH,
        path.join(cwd, "Resumes_Mohan", "Templates", "Mohan Sha_Sample.docx"),
        path.join(cwd, "Resumes_Mohan", "Templates", "Mohan_Sha_Sample.docx"),
        path.join(cwd, "Resumes", "Templates", "Mohan Sha_Sample.docx"),
        path.join(cwd, "Mohan Sha.docx"),
      ]
    : [
        process.env.RESUME_SAMPLE_PATH,
        path.join(cwd, "Resumes", "Templates", "Jiayong Lin_Sample.docx"),
        process.env.MOHAN_RESUME_SAMPLE_PATH,
        path.join(cwd, "Resumes", "Templates", "Mohan Sha_Sample.docx"),
        path.join(cwd, "Mohan Sha.docx"),
      ];
  const filtered = candidates.filter((v): v is string => Boolean(v && v.trim()));

  for (const candidate of filtered) {
    const resolved = path.isAbsolute(candidate) ? candidate : path.join(cwd, candidate);
    if (fs.existsSync(resolved)) return resolved;
  }

  if (isMohan) {
    throw new Error(
      "No Mohan resume sample found for userId=2. Add a .docx under Resumes_Mohan/Templates/ or Resumes/Templates/Mohan Sha_Sample.docx, or set MOHAN_RESUME_SAMPLE_PATH. " +
        "Refusing to use another user's sample."
    );
  }
  return path.join(cwd, "Resumes", "Templates", "Jiayong Lin_Sample.docx");
}

function resolveResumeTemplatePath(userId?: number, customTemplatePath?: string): string {
  const cwd = process.cwd();
  const isMohan = userId === 2;
  const candidates = isMohan
    ? [
        customTemplatePath,
        process.env.MOHAN_RESUME_TEMPLATE_PATH,
        path.join(cwd, "Resumes_Mohan", "Templates", "Mohan_Sha.docx"),
        path.join(cwd, "Resumes", "Templates", "Mohan Sha.docx"),
      ]
    : [
        customTemplatePath,
        process.env.RESUME_TEMPLATE_PATH,
        path.join(cwd, "Resumes", "Templates", "Jiayong Lin.docx"),
        process.env.MOHAN_RESUME_TEMPLATE_PATH,
        path.join(cwd, "Resumes_Mohan", "Templates", "Mohan_Sha.docx"),
        path.join(cwd, "Resumes", "Templates", "Mohan Sha.docx"),
      ];
  const filtered = candidates.filter((v): v is string => Boolean(v && v.trim()));

  for (const candidate of filtered) {
    const resolved = path.isAbsolute(candidate) ? candidate : path.join(cwd, candidate);
    if (fs.existsSync(resolved)) return resolved;
  }

  if (isMohan) {
    throw new Error(
      "No Mohan resume template .docx found for userId=2. Set MOHAN_RESUME_TEMPLATE_PATH or add Resumes_Mohan/Templates/Mohan_Sha.docx. Refusing to use Jiayong's template."
    );
  }
  return path.join(cwd, "Resumes", "Templates", "Jiayong Lin.docx");
}

function resolveCoverLetterTemplatePath(userId?: number, customTemplatePath?: string): string {
  const cwd = process.cwd();
  const isMohan = userId === 2;
  const candidates = isMohan
    ? [
        customTemplatePath,
        process.env.MOHAN_COVER_LETTER_TEMPLATE_PATH,
        path.join(cwd, "Resumes_Mohan", "Templates", "Cover Letter.docx"),
      ]
    : [
        customTemplatePath,
        process.env.COVER_LETTER_TEMPLATE_PATH,
        path.join(cwd, "Resumes", "Templates", "Cover Letter.docx"),
        process.env.MOHAN_COVER_LETTER_TEMPLATE_PATH,
        path.join(cwd, "Resumes_Mohan", "Templates", "Cover Letter.docx"),
      ];
  const filtered = candidates.filter((v): v is string => Boolean(v && v.trim()));

  for (const candidate of filtered) {
    const resolved = path.isAbsolute(candidate) ? candidate : path.join(cwd, candidate);
    if (fs.existsSync(resolved)) return resolved;
  }

  if (isMohan) {
    throw new Error(
      "No Mohan cover letter template found for userId=2. Set MOHAN_COVER_LETTER_TEMPLATE_PATH or add Resumes_Mohan/Templates/Cover Letter.docx. Refusing to use the shared Resumes/Templates path."
    );
  }
  return path.join(cwd, "Resumes", "Templates", "Cover Letter.docx");
}

export async function generateResumeAndCoverLetter(
  jobApplicationId: number,
  options: {
    outputDir?: string;
    saveToDatabase?: boolean;
    resumeTemplatePath?: string;
    coverLetterTemplatePath?: string;
    /** Called when ChatGPT sign-in is required (e.g. wait for user to press Enter in CLI). */
    onChatGPTSignInRequired?: () => Promise<void>;
  } = {}
): Promise<{
  resumePath: string;
  coverLetterPath: string;
  jobDescriptionPath: string;
  tailoredResumeId?: number;
  coverLetterId?: number;
}> {
  const {
    saveToDatabase = true,
    resumeTemplatePath,
    coverLetterTemplatePath,
    onChatGPTSignInRequired,
  } = options;
  const effectiveModel = "chatgpt-ui";

  // Fetch job application and related data
  const jobApplication = await prisma.jobApplication.findUnique({
    where: { id: jobApplicationId },
    include: {
      jobDescription: true,
    },
  });

  if (!jobApplication) {
    throw new Error(`Job application ${jobApplicationId} not found`);
  }

  if (!jobApplication.jobDescription) {
    throw new Error(`Job description not found for job application ${jobApplicationId}`);
  }

  const defaultOutputDir =
    jobApplication.userId === 2
      ? (process.env.MOHAN_RESUMES_OUTPUT_DIR || "Resumes_Mohan").trim()
      : (process.env.RESUMES_OUTPUT_DIR || "Resumes").trim();
  const outputDir =
    typeof options.outputDir === "string" && options.outputDir.trim()
      ? options.outputDir.trim()
      : defaultOutputDir;

  const jobDescription = jobApplication.jobDescription.fullText;
  const company = jobApplication.company;
  const role = jobApplication.title;

  // Extract text from sample file (full resume content)
  const resumeSamplePath = resolveResumeSamplePath(jobApplication.userId);
  const resumeTemplate = resolveResumeTemplatePath(jobApplication.userId, resumeTemplatePath);
  const coverLetterTemplate = resolveCoverLetterTemplatePath(jobApplication.userId, coverLetterTemplatePath);
  console.log(
    `[Docs] jobId=${jobApplicationId} userId=${jobApplication.userId} paths: sample="${resumeSamplePath}", resumeTemplate="${resumeTemplate}", coverLetterTemplate="${coverLetterTemplate}", outputDir="${outputDir}"`
  );

  console.log(`📄 Extracting full resume from sample file: ${resumeSamplePath}`);
  let baseResumeText: string;
  
  if (fs.existsSync(resumeSamplePath)) {
    const buffer = fs.readFileSync(resumeSamplePath);
    const result = await mammoth.extractRawText({ buffer });
    baseResumeText = result.value;
    console.log(`✅ Extracted ${baseResumeText.length} characters from sample file`);
  } else {
    // Fallback to template or text file
    baseResumeText = await extractTextFromResumeTemplate(resumeTemplate);
    console.log(`⚠️  Sample file not found, using template (${baseResumeText.length} chars)`);
  }

  // Parse resume into sections
  const parsedResume = parseResumeText(baseResumeText);
  console.log(`📋 Parsed resume: ${parsedResume.workExperiences.length} work experiences, Tools section ${parsedResume.tools ? "found" : "not found"}, Education preserved`);

  let tailoredResumeText: string;
  let coverLetterText: string;

  console.log(`🤖 Generating resume + cover letter via ChatGPT UI for ${company} - ${role}...`);
  const mohanInventory =
    jobApplication.userId === 2 ? loadMohanExperienceInventory() : "";
  const result = await generateResumeAndCoverLetterViaChatGPTUi(
    {
      baseResumeText,
      jobDescription,
      company,
      role,
      userId: jobApplication.userId,
      ...(jobApplication.userId === 2 ? { experienceInventory: mohanInventory } : {}),
    },
    { onSignInRequired: onChatGPTSignInRequired }
  );
  tailoredResumeText = result.resumeText;
  coverLetterText = result.coverLetterText;
  validateGeneratedContentOrThrow({
    baseResumeText,
    resumeText: tailoredResumeText,
    coverLetterText,
    company,
    role,
  });

  // Parse the tailored resume to extract sections (excluding Education)
  const tailoredParsed = parseResumeText(tailoredResumeText);
  tailoredParsed.education = parsedResume.education;
  if (!tailoredParsed.tools && parsedResume.tools) {
    tailoredParsed.tools = parsedResume.tools;
  }
  const mohanDocxOptions =
    jobApplication.userId === 2
      ? {
          headlineTitle: resolveMohanHeadlineForDocx(tailoredParsed.header, parsedResume.header, role),
          firstCompanyTitle: resolveMohanFirstCompanyTitleForDocx(
            tailoredParsed.workExperiences[0] || "",
            parsedResume.workExperiences[0] || "",
            role
          ),
          secondCompanyTitle: resolveMohanLaterCompanyTitleForDocx(
            tailoredParsed.workExperiences[1] || "",
            parsedResume.workExperiences[1] || "",
            role
          ),
          thirdCompanyTitle: resolveMohanLaterCompanyTitleForDocx(
            tailoredParsed.workExperiences[2] || "",
            parsedResume.workExperiences[2] || "",
            role
          ),
          fourthCompanyTitle: resolveMohanLaterCompanyTitleForDocx(
            tailoredParsed.workExperiences[3] || "",
            parsedResume.workExperiences[3] || "",
            role
          ),
        }
      : undefined;

  // Save documents to filesystem (using templates to preserve styling)
  // Pass parsed resume sections to replace placeholders in template
  const resumePath = await saveResumeAsDocx(
    {
      summary: tailoredParsed.summary,
      skills: tailoredParsed.skills,
      tools: tailoredParsed.tools,
      workExperiences: tailoredParsed.workExperiences,
      education: tailoredParsed.education, // Preserved from original
    },
    company,
    role,
    outputDir,
    resumeTemplate,
    mohanDocxOptions
  );
  console.log(`✅ Saved styled resume to: ${resumePath}`);

  const coverLetterPath = await saveCoverLetterAsDocx(
    coverLetterText,
    company,
    role,
    outputDir,
    coverLetterTemplate
  );
  console.log(`✅ Saved styled cover letter to: ${coverLetterPath}`);

  const jobDescriptionPath = await saveJobDescriptionAsTxt(
    jobDescription,
    company,
    role,
    outputDir
  );
  console.log(`✅ Saved job description to: ${jobDescriptionPath}`);

  // Save to database if requested
  let tailoredResumeId: number | undefined;
  let coverLetterId: number | undefined;

  const effectivePromptVersion =
    jobApplication.userId === 2 ? PROMPT_VERSION_MOHAN : PROMPT_VERSION;

  if (saveToDatabase) {
    // Base resume row must belong to the same user as the job (e.g. Mohan userId=2).
    const ownerId = jobApplication.userId;
    const user = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!user) {
      throw new Error(`No user with id ${ownerId} (job owner). Run npm run profiles:ensure or fix JobApplication.userId.`);
    }

    let baseResume = await prisma.resume.findFirst({
      where: { userId: ownerId },
    });

    if (!baseResume) {
      baseResume = await prisma.resume.create({
        data: {
          userId: ownerId,
          name: "Template Resume",
          rawText: baseResumeText,
        },
      });
    }

    // Save tailored resume to database
    const tailoredResume = await prisma.tailoredResume.create({
      data: {
        jobApplicationId,
        baseResumeId: baseResume.id,
        llmModel: effectiveModel,
        promptVersion: effectivePromptVersion,
        outputText: tailoredResumeText,
      },
    });
    tailoredResumeId = tailoredResume.id;

    // Save cover letter to database
    const coverLetter = await prisma.coverLetter.create({
      data: {
        jobApplicationId,
        baseResumeId: baseResume.id,
        llmModel: effectiveModel,
        promptVersion: effectivePromptVersion,
        outputText: coverLetterText,
      },
    });
    coverLetterId = coverLetter.id;

    // Update job application status
    await prisma.jobApplication.update({
      where: { id: jobApplicationId },
      data: {
        status: "READY_TO_APPLY",
      },
    });
  }

  return {
    resumePath,
    coverLetterPath,
    jobDescriptionPath,
    tailoredResumeId,
    coverLetterId,
  };
}

function cleanLlmOutput(text: string): string {
  if (!text) return "";
  let cleanText = text.trim();
  
  // Remove markdown code block ticks if present
  cleanText = cleanText.replace(/^```[\w]*\n?/gm, "").replace(/```$/gm, "");
  
  // Remove common ChatGPT conversational preambles
  const preamblePatterns = [
    /^Certainly!.*?\n\n/is,
    /^Here is.*?\n\n/is,
    /^I'll write.*?\n\n/is,
    /^Here's.*?\n\n/is,
    /^Sure,.*?\n\n/is,
    /^Below is.*?\n\n/is,
    /^I have tailored.*?\n\n/is,
  ];
  
  for (const pattern of preamblePatterns) {
    cleanText = cleanText.replace(pattern, "");
  }
  
  return cleanText.trim();
}

function normalizeCompact(text: string): string {
  return (text || "").replace(/\s+/g, " ").trim().toLowerCase();
}

function countResumeSectionHeadingLines(text: string): number {
  const t = text || "";
  let hits = 0;
  if (/^\s*SUMMARY\s*$/im.test(t)) hits++;
  if (/^\s*SKILLS\s*$/im.test(t)) hits++;
  if (/^\s*(PROFESSIONAL\s+EXPERIENCE|EXPERIENCE)\s*$/im.test(t)) hits++;
  if (/^\s*EDUCATION\s*$/im.test(t)) hits++;
  return hits;
}

/**
 * Strict structure check: true when text looks like an actual resume layout.
 * Avoids false positives from cover letters that mention "experience" in prose.
 */
function looksLikeResumeDocument(text: string): boolean {
  const t = text || "";
  if (!t.trim()) return false;
  const headingHits = countResumeSectionHeadingLines(t);
  const hasTechLine = /\bTechnologies\s*&\s*Skills\s*:/i.test(t);
  // Resume-like if it has multiple heading lines, or one heading + tech line marker.
  return headingHits >= 2 || (headingHits >= 1 && hasTechLine);
}

/** Phrases that indicate pasted resume structure — not "I have experience with X" in prose. */
function coverLetterLooksLikeResumePaste(text: string): boolean {
  const t = text || "";
  return (
    /^\s*SUMMARY\s*$/im.test(t) ||
    /^\s*PROFESSIONAL EXPERIENCE\s*$/im.test(t) ||
    /^\s*SKILLS\s*$/im.test(t) ||
    /^\s*EDUCATION\s*$/im.test(t) ||
    /\bTechnologies\s*&\s*Skills\s*:/i.test(t)
  );
}

function looksLikeCoverLetterDocument(text: string): boolean {
  const t = text || "";
  if (!t.trim()) return false;
  if (coverLetterLooksLikeResumePaste(t)) return false;
  // Paragraphs: blank lines OR several logical lines (models often use single \n between paragraphs).
  const byBlank = t.split(/\n\s*\n/).filter((p) => p.trim().length > 25).length;
  const lines = t.split(/\n/).map((l) => l.trim()).filter((l) => l.length > 35);
  return byBlank >= 2 || lines.length >= 3 || t.length >= 320;
}

function validateGeneratedContentOrThrow(input: {
  baseResumeText: string;
  resumeText: string;
  coverLetterText: string;
  company: string;
  role: string;
}): void {
  const resume = (input.resumeText || "").trim();
  const cover = (input.coverLetterText || "").trim();
  const base = (input.baseResumeText || "").trim();
  const ctx = `${input.company} - ${input.role}`;

  if (resume.length < 500) {
    throw new Error(`[Docs Validation] Resume output too short for ${ctx}.`);
  }
  if (cover.length < 250) {
    throw new Error(`[Docs Validation] Cover letter output too short for ${ctx}.`);
  }

  const resumeLooksResume = looksLikeResumeDocument(resume);
  const coverLooksResume = looksLikeResumeDocument(cover);
  const coverLooksCover = looksLikeCoverLetterDocument(cover);

  if (!resumeLooksResume && coverLooksResume) {
    throw new Error(
      `[Docs Validation] Detected resume/cover swap for ${ctx}: cover looks like a resume while resume does not.`
    );
  }
  if (coverLooksResume) {
    throw new Error(`[Docs Validation] Cover letter looks like a resume for ${ctx}.`);
  }
  if (!resumeLooksResume) {
    throw new Error(`[Docs Validation] Resume format looks invalid for ${ctx}.`);
  }
  if (!coverLooksCover) {
    throw new Error(`[Docs Validation] Cover letter format looks invalid for ${ctx}.`);
  }

  const baseN = normalizeCompact(base);
  const resumeN = normalizeCompact(resume);
  if (baseN && resumeN && baseN === resumeN) {
    throw new Error(`[Docs Validation] Resume appears unchanged from template for ${ctx}.`);
  }
}

/**
 * Save pre-generated resume and cover letter (e.g. from nodriver backfill).
 * Fetches job and base resume text, parses, writes docx + txt, updates DB.
 */
export async function saveGeneratedDocumentsOnly(
  jobApplicationId: number,
  rawTailoredResumeText: string,
  rawCoverLetterText: string,
  options: { outputDir?: string; saveToDatabase?: boolean } = {}
): Promise<{
  resumePath: string;
  coverLetterPath: string;
}> {
  const saveToDatabase = options.saveToDatabase !== false;

  const tailoredResumeText = cleanLlmOutput(rawTailoredResumeText);
  const coverLetterText = cleanLlmOutput(rawCoverLetterText);

  const jobApplication = await prisma.jobApplication.findUnique({
    where: { id: jobApplicationId },
    include: { jobDescription: true },
  });
  if (!jobApplication?.jobDescription) {
    throw new Error(`Job ${jobApplicationId} not found or missing description`);
  }

  const defaultOutputDir =
    jobApplication.userId === 2
      ? (process.env.MOHAN_RESUMES_OUTPUT_DIR || "Resumes_Mohan").trim()
      : (process.env.RESUMES_OUTPUT_DIR || "Resumes").trim();
  const outputDir =
    typeof options.outputDir === "string" && options.outputDir.trim()
      ? options.outputDir.trim()
      : defaultOutputDir;

  const jobDescription = jobApplication.jobDescription.fullText;
  const company = jobApplication.company;
  const role = jobApplication.title;

  const resumeSamplePath = resolveResumeSamplePath(jobApplication.userId);
  const resumeTemplate = resolveResumeTemplatePath(jobApplication.userId);
  const coverLetterTemplate = resolveCoverLetterTemplatePath(jobApplication.userId);
  console.log(
    `[Docs Backfill] jobId=${jobApplicationId} userId=${jobApplication.userId} paths: sample="${resumeSamplePath}", resumeTemplate="${resumeTemplate}", coverLetterTemplate="${coverLetterTemplate}", outputDir="${outputDir}"`
  );

  let baseResumeText: string;
  if (fs.existsSync(resumeSamplePath)) {
    const buffer = fs.readFileSync(resumeSamplePath);
    const result = await mammoth.extractRawText({ buffer });
    baseResumeText = result.value;
  } else {
    baseResumeText = await extractTextFromResumeTemplate(resumeTemplate);
  }
  validateGeneratedContentOrThrow({
    baseResumeText,
    resumeText: tailoredResumeText,
    coverLetterText,
    company,
    role,
  });

  const parsedResume = parseResumeText(baseResumeText);
  const tailoredParsed = parseResumeText(tailoredResumeText);
  tailoredParsed.education = parsedResume.education;
  if (!tailoredParsed.tools && parsedResume.tools) {
    tailoredParsed.tools = parsedResume.tools;
  }
  const mohanDocxOptions =
    jobApplication.userId === 2
      ? {
          headlineTitle: resolveMohanHeadlineForDocx(tailoredParsed.header, parsedResume.header, role),
          firstCompanyTitle: resolveMohanFirstCompanyTitleForDocx(
            tailoredParsed.workExperiences[0] || "",
            parsedResume.workExperiences[0] || "",
            role
          ),
          secondCompanyTitle: resolveMohanLaterCompanyTitleForDocx(
            tailoredParsed.workExperiences[1] || "",
            parsedResume.workExperiences[1] || "",
            role
          ),
          thirdCompanyTitle: resolveMohanLaterCompanyTitleForDocx(
            tailoredParsed.workExperiences[2] || "",
            parsedResume.workExperiences[2] || "",
            role
          ),
          fourthCompanyTitle: resolveMohanLaterCompanyTitleForDocx(
            tailoredParsed.workExperiences[3] || "",
            parsedResume.workExperiences[3] || "",
            role
          ),
        }
      : undefined;

  const resumePath = await saveResumeAsDocx(
    {
      summary: tailoredParsed.summary,
      skills: tailoredParsed.skills,
      tools: tailoredParsed.tools,
      workExperiences: tailoredParsed.workExperiences,
      education: tailoredParsed.education,
    },
    company,
    role,
    outputDir,
    resumeTemplate,
    mohanDocxOptions
  );

  const coverLetterPath = await saveCoverLetterAsDocx(
    coverLetterText,
    company,
    role,
    outputDir,
    coverLetterTemplate
  );

  await saveJobDescriptionAsTxt(jobDescription, company, role, outputDir);

  if (saveToDatabase) {
    const ownerId = jobApplication.userId;
    const user = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!user) {
      throw new Error(`No user with id ${ownerId} (job owner).`);
    }

    let baseResume = await prisma.resume.findFirst({ where: { userId: ownerId } });
    if (!baseResume) {
      baseResume = await prisma.resume.create({
        data: { userId: ownerId, name: "Template Resume", rawText: baseResumeText },
      });
    }

    const backfillPromptVersion =
      jobApplication.userId === 2 ? PROMPT_VERSION_MOHAN : PROMPT_VERSION;

    await prisma.tailoredResume.create({
      data: {
        jobApplicationId,
        baseResumeId: baseResume.id,
        llmModel: "chatgpt-ui",
        promptVersion: backfillPromptVersion,
        outputText: tailoredResumeText,
      },
    });
    await prisma.coverLetter.create({
      data: {
        jobApplicationId,
        baseResumeId: baseResume.id,
        llmModel: "chatgpt-ui",
        promptVersion: backfillPromptVersion,
        outputText: coverLetterText,
      },
    });
    await prisma.jobApplication.update({
      where: { id: jobApplicationId },
      data: { status: "READY_TO_APPLY" },
    });
  }

  return { resumePath, coverLetterPath };
}
