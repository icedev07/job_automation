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
    throw new Error("OpenAI API key not configured. Go to /admin/api-keys to set it.");
  }

  const client = getClient(config.openaiApiKey);
  const model = config.openaiModel || "gpt-4o-mini";

  const response = await client.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const text = response.choices[0]?.message?.content || "";
  const tokensUsed =
    (response.usage?.prompt_tokens || 0) + (response.usage?.completion_tokens || 0);

  return { text, model, tokensUsed };
}

export async function generateResumeText(
  baseResume: string,
  jobDescription: string,
  customPromptTemplate?: string
): Promise<LLMResult> {
  const config = await getConfig();
  const template = customPromptTemplate || config.resumePromptTemplate || DEFAULT_RESUME_PROMPT;
  const prompt = template
    .replace("{{BASE_RESUME}}", baseResume)
    .replace("{{JOB_DESCRIPTION}}", jobDescription);
  return generateText(prompt);
}

export async function generateCoverLetterText(
  baseResume: string,
  jobDescription: string,
  companyName: string,
  jobTitle: string,
  customPromptTemplate?: string
): Promise<LLMResult> {
  const config = await getConfig();
  const template = customPromptTemplate || config.coverLetterPromptTemplate || DEFAULT_COVER_LETTER_PROMPT;
  const prompt = template
    .replace("{{BASE_RESUME}}", baseResume.substring(0, 2000))
    .replace("{{JOB_DESCRIPTION}}", jobDescription)
    .replace("{{COMPANY_NAME}}", companyName)
    .replace("{{JOB_TITLE}}", jobTitle);
  return generateText(prompt);
}

const DEFAULT_RESUME_PROMPT = `Your role is to act as a talented, human-centered resume writer who helps tailor my resume to each job description while making it sound authentic, specific, and grounded in real-world experience.

BASE RESUME:
{{BASE_RESUME}}

JOB DESCRIPTION:
{{JOB_DESCRIPTION}}

INSTRUCTIONS:
Preserve the same section structure used by the BASE RESUME.
If the BASE RESUME includes a TOOLS section, keep TOOLS as its own section in the output.
Section headings should remain in this order:
- SUMMARY
- SKILLS
- TOOLS (only when present in BASE RESUME)
- PROFESSIONAL EXPERIENCE
- EDUCATION

Do not change my name, company names, employment dates, or high-level role titles.

IMPORTANT: Do NOT modify the EDUCATION section. Keep it exactly as it appears in the base resume.

PROFESSIONAL EXPERIENCE - structure for each role:
- First line: Title | Company | Location | Date (unchanged).
- Next line: Exactly one line in parentheses that briefly describes the company or the scope of the role.
- Then bullet points, then "Technologies & Skills: ..." as below.

You can modify the technologies, tools, and skills mentioned in the Summary, Professional Experience, Skills, and Work History bullet points to align naturally with the target job.

CRITICAL - Technologies & Skills Sections:
- Each work experience section ends with a "Technologies & Skills:" line listing the tech stack used at that company
- You MUST tailor these "Technologies & Skills:" sections to align with the job description
- For each work experience:
  * Include ALL technologies from the job description that are relevant to that role/company
  * Remove technologies that are NOT mentioned in the job description (unless they're core to that company's work)
  * Add new technologies from the job description that make sense for that work experience context
- Keep the exact format: "Technologies & Skills:" followed by a list separated by " · " (middle dot)

Focus on:
- Including all important keywords, tools, and technologies from the job description
- Naturally integrating them into the bullet points and project descriptions
- Emphasizing the target tech stack across the resume
- Reflecting those tools in real, concrete use cases or project examples
- Writing in a clear, natural tone that feels like a person describing meaningful work

The final result should be a complete, tailored resume in plain text - clear, specific, and human - without generic language or explanations.

CRITICAL: Return ONLY the complete tailored resume text. Do NOT include any preamble, explanation, or conversational text. Start directly with the resume header (name, title, contact information).`;

const DEFAULT_COVER_LETTER_PROMPT = `Your role is to act as a talented, creative cover letter writer who writes compelling, story-like cover letters that connect candidates to job opportunities.

CANDIDATE'S RESUME:
{{BASE_RESUME}}

JOB DESCRIPTION:
{{JOB_DESCRIPTION}}

COMPANY: {{COMPANY_NAME}}
POSITION: {{JOB_TITLE}}

INSTRUCTIONS:
1. Style: Write in a story-like, creative, verbal style - engaging, personal, and memorable
2. No Bullets: Do NOT use bullet points, bullet symbols (-), or lists
3. Length: Write at least 12 sentences (aim for 3-4 paragraphs)
4. Personalization:
   - Directly address the company and specific role
   - Weave in specific experiences from the candidate's background that relate to the job description
   - Show how the candidate's skills and experiences align with what the company needs
5. Enthusiasm: Convey genuine enthusiasm for the role and the company
6. Structure:
   - Opening: Hook that connects candidate's journey to this opportunity
   - Body (2-3 paragraphs): Specific examples of relevant experience, skills, and achievements
   - Closing: Strong conclusion expressing eagerness for an interview
7. Tone: Professional but warm, confident but humble, authentic and human
8. Specificity: Reference specific technologies, projects, or achievements from the resume that match the job requirements

CRITICAL: Return ONLY the cover letter body text. Do NOT include:
- Salutations (e.g., "Dear Hiring Manager,")
- Closings (e.g., "Sincerely," or "Best regards,")
- Your name or signature
- Any preamble or explanation

Start directly with the first paragraph of the cover letter.`;
