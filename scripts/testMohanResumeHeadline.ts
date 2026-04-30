/**
 * Writes a sample tailored resume using Mohan’s template to verify:
 * - `{headlineTitle}` in the header
 * - `{firstCompanyTitle}` in the first experience title segment
 * while keeping other company title rows unchanged (conservative).
 *
 * One-time setup in Word (Mohan resume .docx template), optional but recommended:
 *   - Replace static title line under the name with: {headlineTitle}
 *   - Replace only first-company role title segment with: {firstCompanyTitle}
 *     e.g. "{firstCompanyTitle} | Schibsted | Norway | Jan 2022 – Present"
 *
 * Run from project root:
 *   npm run resume:test-mohan-headline
 *
 * Optional env:
 *   RESUME_TEMPLATE_PATH — defaults to common Mohan template paths (incl. Mohan_Sha.docx)
 *   TEST_HEADLINE_ROLE — default "Full-Stack PHP Developer (headline test)"
 *   TEST_FIRST_COMPANY_TITLE — default "Principal PHP Engineer (first-company title test)"
 *   TEST_HEADLINE_INJECT_OLD — XML text inside <w:t>…</w:t> to replace with {headlineTitle} when the
 *     template has no placeholder yet (default matches current Mohan_Sha subtitle line).
 *   TEST_FIRST_COMPANY_INJECT_OLD — text fragment to replace with {firstCompanyTitle} when missing.
 *   TEST_SECOND_COMPANY_STATIC and TEST_THIRD_COMPANY_STATIC — conservative static rows to assert unchanged.
 */

import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import PizZip from "pizzip";
const mammoth = require("mammoth");

import { saveResumeAsDocx } from "../lib/documentGenerator";

function resolveTemplatePath(): string {
  const env = process.env.RESUME_TEMPLATE_PATH?.trim();
  const cwd = process.cwd();
  const candidates = [
    env && (path.isAbsolute(env) ? env : path.join(cwd, env)),
    path.join(cwd, "Resumes_Mohan", "Templates", "Mohan_Sha.docx"),
    path.join(cwd, "Resumes_Mohan", "Templates", "Mohan Sha.docx"),
    path.join(cwd, "Resumes", "Templates", "Mohan Sha.docx"),
    path.join(cwd, "Mohan Sha.docx"),
  ].filter(Boolean) as string[];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(
    `No Mohan resume template found. Set RESUME_TEMPLATE_PATH or add one of:\n${candidates.slice(1).join("\n")}`
  );
}

function templateHasPlaceholder(docxPath: string, placeholderName: string): boolean {
  const buf = fs.readFileSync(docxPath, "binary");
  const zip = new PizZip(buf);
  const xml = zip.files["word/document.xml"]?.asText() ?? "";
  const re = new RegExp(`\\{[\\s]*${placeholderName}[\\s]*\\}`);
  return re.test(xml);
}

/** Copy .docx and replace one exact <w:t>…</w:t> run with a placeholder for automated testing. */
function templateWithInjectedRunPlaceholder(
  sourcePath: string,
  destPath: string,
  oldInnerXml: string,
  placeholderName: string
): void {
  const buf = fs.readFileSync(sourcePath, "binary");
  const zip = new PizZip(buf);
  const key = "word/document.xml";
  const xml = zip.files[key]?.asText();
  if (!xml) throw new Error("word/document.xml missing");
  const open = `<w:t>${oldInnerXml}</w:t>`;
  if (!xml.includes(open)) {
    throw new Error(
      `Cannot inject {${placeholderName}}: document.xml does not contain exact run:\n${open}\n` +
        `Adjust your *_INJECT_OLD value to the exact XML-escaped text inside the target <w:t>.`
    );
  }
  const updated = xml.replace(open, `<w:t>{${placeholderName}}</w:t>`);
  zip.file(key, updated);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, zip.generate({ type: "nodebuffer", compression: "DEFLATE" }) as Buffer);
}

/** Copy .docx and replace a text fragment inside document.xml with a placeholder token. */
function templateWithInjectedTextFragmentPlaceholder(
  sourcePath: string,
  destPath: string,
  oldTextFragment: string,
  placeholderName: string
): void {
  const buf = fs.readFileSync(sourcePath, "binary");
  const zip = new PizZip(buf);
  const key = "word/document.xml";
  const xml = zip.files[key]?.asText();
  if (!xml) throw new Error("word/document.xml missing");
  if (!xml.includes(oldTextFragment)) {
    throw new Error(
      `Cannot inject {${placeholderName}}: document.xml does not contain text fragment:\n${oldTextFragment}\n` +
        `Set TEST_FIRST_COMPANY_INJECT_OLD to a fragment that exists exactly in document.xml text.`
    );
  }
  const updated = xml.replace(oldTextFragment, `{${placeholderName}}`);
  zip.file(key, updated);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, zip.generate({ type: "nodebuffer", compression: "DEFLATE" }) as Buffer);
}

function assertOutputContainsHeadline(docxPath: string, expectedRole: string): void {
  const buf = fs.readFileSync(docxPath, "binary");
  const zip = new PizZip(buf);
  const xml = zip.files["word/document.xml"]?.asText() ?? "";
  const escaped = expectedRole
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  if (!xml.includes(expectedRole) && !xml.includes(escaped)) {
    throw new Error(
      `Assertion failed: output document.xml does not contain headline role:\n${expectedRole}`
    );
  }
}

function assertOutputContainsText(docxPath: string, expectedText: string, label: string): void {
  const buf = fs.readFileSync(docxPath, "binary");
  const zip = new PizZip(buf);
  const xml = zip.files["word/document.xml"]?.asText() ?? "";
  const escaped = expectedText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  if (!xml.includes(expectedText) && !xml.includes(escaped)) {
    throw new Error(`Assertion failed (${label}): output document.xml does not contain:\n${expectedText}`);
  }
}

function normalizeForCompare(s: string): string {
  return (s || "")
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

async function extractRawText(docxPath: string): Promise<string> {
  const result = await mammoth.extractRawText({ buffer: fs.readFileSync(docxPath) });
  return result.value || "";
}

async function assertOutputContainsTextLoose(docxPath: string, expectedText: string, label: string): Promise<void> {
  const text = await extractRawText(docxPath);
  const got = normalizeForCompare(text);
  const exp = normalizeForCompare(expectedText);
  if (!got.includes(exp)) {
    throw new Error(`Assertion failed (${label}): extracted text does not contain:\n${expectedText}`);
  }
}

async function printTemplateStructure(docxPath: string): Promise<void> {
  const buf = fs.readFileSync(docxPath);
  const zip = new PizZip(buf.toString("binary"));
  const xml = zip.files["word/document.xml"]?.asText() ?? "";
  const placeholders = [...new Set([...xml.matchAll(/\{[^}]+\}/g)].map((m) => m[0]))];
  const raw = await extractRawText(docxPath);
  console.log("\n[Template structure]");
  console.log(`Placeholders: ${placeholders.join(", ") || "(none)"}`);

  const titleRows = [
    "Senior DevOps Engineer / Acting Lead – Developer Experience & Platform | Schibsted | Norway | Jan 2022 – Present",
    "Senior Systems Architect | Striim | USA | Dec 2020 – Jan 2022",
    "Software Engineer - DevOps | Qube Cinema | Software Engineer - DevOps | Jan 2018 – Dec 2020",
    "Software Engineer Intern | Google | USA | Jan 2017 – Dec 2017",
  ];
  for (const row of titleRows) {
    const present = normalizeForCompare(raw).includes(normalizeForCompare(row));
    console.log(`- ${row}: ${present ? "present in extracted text" : "not found in extracted text"}`);
  }
}

async function main() {
  const templatePath = resolveTemplatePath();
  const testRole = process.env.TEST_HEADLINE_ROLE?.trim() || "Full-Stack PHP Developer (headline test)";
  const firstCompanyTitle =
    process.env.TEST_FIRST_COMPANY_TITLE?.trim() || "Principal PHP Engineer (first-company title test)";
  const testCompany = "Example Company";

  await printTemplateStructure(templatePath);

  const hasHeadlineTag = templateHasPlaceholder(templatePath, "headlineTitle");
  const hasFirstCompanyTitleTag = templateHasPlaceholder(templatePath, "firstCompanyTitle");
  console.log(`Template: ${templatePath}`);
  console.log(`Contains {headlineTitle}: ${hasHeadlineTag ? "yes" : "no (will inject for this test run)"}`);
  console.log(`Contains {firstCompanyTitle}: ${hasFirstCompanyTitleTag ? "yes" : "no (will inject for this test run)"}`);

  const outDir = path.join(process.cwd(), "Resumes_Mohan", "_headline_test_output");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const injectOld =
    process.env.TEST_HEADLINE_INJECT_OLD?.trim() ||
    "Senior Software Engineer | Cloud Infrastructure &amp; DevOps Expert";
  const firstCompanyInjectOld =
    process.env.TEST_FIRST_COMPANY_INJECT_OLD?.trim() ||
    "Senior DevOps Engineer / Acting Lead – Developer Experience &amp; Platform";
  const secondCompanyStatic =
    process.env.TEST_SECOND_COMPANY_STATIC?.trim() ||
    "Senior Systems Architect | Striim | USA | Dec 2020 – Jan 2022";
  const thirdCompanyStatic =
    process.env.TEST_THIRD_COMPANY_STATIC?.trim() ||
    "Software Engineer - DevOps | Qube Cinema | Software Engineer - DevOps | Jan 2018 – Dec 2020";

  let effectiveTemplate = templatePath;
  if (!hasHeadlineTag || !hasFirstCompanyTitleTag) {
    const tempTemplate = path.join(outDir, "_temp", "template_with_headline_placeholder.docx");
    fs.mkdirSync(path.dirname(tempTemplate), { recursive: true });
    fs.copyFileSync(templatePath, tempTemplate);
    if (!hasHeadlineTag) {
      templateWithInjectedRunPlaceholder(tempTemplate, tempTemplate, injectOld, "headlineTitle");
      console.log(`Injected {headlineTitle} into temp copy`);
    }
    if (!hasFirstCompanyTitleTag) {
      templateWithInjectedTextFragmentPlaceholder(
        tempTemplate,
        tempTemplate,
        firstCompanyInjectOld,
        "firstCompanyTitle"
      );
      console.log(`Injected {firstCompanyTitle} into temp copy`);
    }
    effectiveTemplate = tempTemplate;
    console.log(`Using temp template: ${tempTemplate}`);
  }

  const resumePath = await saveResumeAsDocx(
    {
      summary: "Summary placeholder for headline test.",
      skills: "PHP, Laravel, MySQL",
      tools: "Docker, Git",
      workExperiences: [
        `Software Engineer | Previous Co | Remote | 2022 – Present\n- Built APIs and services.\n- Collaborated with product.`,
      ],
    },
    testCompany,
    testRole,
    outDir,
    effectiveTemplate,
    { headlineTitle: testRole, firstCompanyTitle }
  );

  assertOutputContainsHeadline(resumePath, testRole);
  assertOutputContainsText(resumePath, firstCompanyTitle, "first company title");
  await assertOutputContainsTextLoose(resumePath, secondCompanyStatic, "second company static row");
  await assertOutputContainsTextLoose(resumePath, thirdCompanyStatic, "third company static row");

  const z2 = new PizZip(fs.readFileSync(resumePath, "binary"));
  const outXml = z2.files["word/document.xml"]?.asText() ?? "";
  console.log("\n✅ Assertion: output document.xml contains tailored headline role.");
  console.log("✅ Assertion: output document.xml contains tailored first company title.");
  console.log("✅ Assertion: later company title rows remain conservative (unchanged).");
  console.log("✅ Output also contains injected summary text:", outXml.includes("Summary placeholder for headline test."));

  console.log("\n✅ Wrote test resume:");
  console.log(`   ${resumePath}`);
  console.log("\nOpen the file in Word to visually confirm styling is unchanged.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
