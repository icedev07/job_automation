/**
 * One-off helper: list {placeholder} tags in a .docx document.xml
 * Usage: npx tsx scripts/listDocxPlaceholders.ts [path/to/file.docx]
 */
import * as fs from "fs";
import * as path from "path";

const PizZip = require("pizzip");

const docxPath =
  process.argv[2] ||
  path.join(process.cwd(), "Resumes_Mohan", "Templates", "Mohan_Sha.docx");

const buf = fs.readFileSync(docxPath, "binary");
const zip = new PizZip(buf);
const xml = zip.files["word/document.xml"]?.asText() ?? "";
const tags = xml.match(/\{[^}]+\}/g) ?? [];
const unique = [...new Set(tags)].sort();
console.log(`File: ${docxPath}`);
console.log(unique.join("\n"));
