/**
 * Check ZipRecruiter 1-Click jobs in DB for errors (empty fields, bad URLs, duplicates, etc.).
 * Run: npx tsx scripts/checkZipRecruiterOneClickJobs.ts
 */
import "dotenv/config";
import { normalizeUrl } from "../lib/jobDuplicateDetection";
import { prisma } from "../lib/prisma";

type Row = {
  id: number;
  userId: number;
  source: string;
  title: string;
  company: string;
  externalUrl: string;
  fullText: string;
  appliedAt: Date | null;
  createdAt: Date;
};

async function getZipRecruiterOneClickJobs(): Promise<Row[]> {
  try {
    const list = await prisma.oneClickJob.findMany({
      where: { source: "ziprecruiter" },
      orderBy: { createdAt: "desc" },
    });
    return list as Row[];
  } catch {
    const raw = await prisma.$queryRawUnsafe<Row[]>(
      `SELECT id, "userId", source, title, company, "externalUrl", "fullText", "appliedAt", "createdAt"
       FROM "OneClickJob" WHERE source = 'ziprecruiter' ORDER BY "createdAt" DESC`
    );
    return raw;
  }
}

function isValidUrl(s: string): boolean {
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

async function main() {
  console.log("\n--- ZipRecruiter 1-Click jobs: validation ---\n");

  const rows = await getZipRecruiterOneClickJobs();
  console.log(`Total ZipRecruiter OneClickJob rows: ${rows.length}\n`);

  const errors: { id: number; field?: string; message: string }[] = [];
  const byTitleCompany = new Map<string, number[]>();

  for (const r of rows) {
    const key = `${(r.title || "").trim().toLowerCase()}|||${(r.company || "").trim().toLowerCase()}`;
    if (!byTitleCompany.has(key)) byTitleCompany.set(key, []);
    byTitleCompany.get(key)!.push(r.id);

    if (r.title == null || String(r.title).trim() === "") {
      errors.push({ id: r.id, field: "title", message: "empty or null title" });
    }
    if (r.company == null || String(r.company).trim() === "") {
      errors.push({ id: r.id, field: "company", message: "empty or null company" });
    }
    if (r.externalUrl == null || String(r.externalUrl).trim() === "") {
      errors.push({ id: r.id, field: "externalUrl", message: "empty or null externalUrl" });
    } else if (!isValidUrl(r.externalUrl)) {
      errors.push({ id: r.id, field: "externalUrl", message: "externalUrl is not a valid URL" });
    } else if (!r.externalUrl.toLowerCase().includes("ziprecruiter")) {
      errors.push({ id: r.id, field: "externalUrl", message: "externalUrl does not contain 'ziprecruiter'" });
    }
    if (r.fullText == null) {
      errors.push({ id: r.id, field: "fullText", message: "null fullText" });
    } else if (String(r.fullText).trim() === "") {
      errors.push({ id: r.id, field: "fullText", message: "empty or whitespace-only fullText (no description)" });
    } else if (String(r.fullText).length > 500_000) {
      errors.push({ id: r.id, field: "fullText", message: `fullText very long (${String(r.fullText).length} chars)` });
    }
    if (r.source !== "ziprecruiter") {
      errors.push({ id: r.id, field: "source", message: `source is "${r.source}" (expected ziprecruiter)` });
    }
  }

  for (const [key, ids] of byTitleCompany) {
    if (ids.length > 1) {
      for (const id of ids) {
        errors.push({
          id,
          message: `duplicate title+company (same as ids: ${ids.filter((i) => i !== id).join(", ")})`,
        });
      }
    }
  }

  // Same URL used for different jobs (different title/company)
  // 1) exact URL match
  const byUrl = new Map<string, Row[]>();
  for (const r of rows) {
    const key = (r.externalUrl || "").trim();
    if (!key) continue;
    if (!byUrl.has(key)) byUrl.set(key, []);
    byUrl.get(key)!.push(r);
  }
  for (const [url, group] of byUrl) {
    if (group.length <= 1) continue;
    const titles = new Set(group.map((r) => (r.title || "").trim().toLowerCase()));
    const companies = new Set(group.map((r) => (r.company || "").trim().toLowerCase()));
    if (titles.size > 1 || companies.size > 1) {
      for (const r of group) {
        errors.push({
          id: r.id,
          field: "externalUrl",
          message: `same URL shared by ${group.length} jobs with different title/company. URL(length)=${url.length} ids=[${group.map((x) => x.id).join(", ")}]`,
        });
      }
    }
  }

  // 2) normalized URL (same page, different query string) shared by different jobs
  const byNormalizedUrl = new Map<string, Row[]>();
  for (const r of rows) {
    const key = normalizeUrl((r.externalUrl || "").trim());
    if (!key) continue;
    if (!byNormalizedUrl.has(key)) byNormalizedUrl.set(key, []);
    byNormalizedUrl.get(key)!.push(r);
  }
  for (const [normUrl, group] of byNormalizedUrl) {
    if (group.length <= 1) continue;
    const titles = new Set(group.map((r) => (r.title || "").trim().toLowerCase()));
    const companies = new Set(group.map((r) => (r.company || "").trim().toLowerCase()));
    if (titles.size > 1 || companies.size > 1) {
      for (const r of group) {
        errors.push({
          id: r.id,
          field: "externalUrl",
          message: `same normalized URL shared by ${group.length} jobs with different title/company. ids=[${group.map((x) => x.id).join(", ")}]`,
        });
      }
    }
  }

  if (errors.length === 0) {
    console.log("No validation errors found.\n");
  } else {
    console.log(`Found ${errors.length} issue(s):\n`);
    const byId = new Map<number, { field?: string; message: string }[]>();
    for (const e of errors) {
      if (!byId.has(e.id)) byId.set(e.id, []);
      byId.get(e.id)!.push({ field: e.field, message: e.message });
    }
    for (const [id, list] of byId) {
      const r = rows.find((x) => x.id === id);
      console.log(`  id=${id}  company="${(r?.company || "").slice(0, 40)}"  title="${(r?.title || "").slice(0, 50)}"`);
      for (const { message } of list) console.log(`    - ${message}`);
      console.log("");
    }
  }

  const sample = rows.slice(0, 3);
  if (sample.length > 0) {
    console.log("Sample rows (latest 3):");
    for (const r of sample) {
      console.log(`  id=${r.id}  url length=${(r.externalUrl || "").length}  fullText length=${(r.fullText || "").length}  title="${(r.title || "").slice(0, 60)}"`);
    }
  }

  // URL distribution: how many distinct URLs (exact and normalized)
  const distinctExact = new Set(rows.map((r) => (r.externalUrl || "").trim()).filter(Boolean));
  const distinctNormalized = new Set(rows.map((r) => normalizeUrl((r.externalUrl || "").trim())).filter(Boolean));
  console.log("\nURL distribution:");
  console.log(`  Distinct externalUrl (exact): ${distinctExact.size} of ${rows.length} rows`);
  console.log(`  Distinct externalUrl (normalized): ${distinctNormalized.size} of ${rows.length} rows`);
  if (distinctExact.size < rows.length) {
    const byExact = new Map<string, Row[]>();
    for (const r of rows) {
      const k = (r.externalUrl || "").trim();
      if (!byExact.has(k)) byExact.set(k, []);
      byExact.get(k)!.push(r);
    }
    console.log("  Rows per exact URL (when > 1):");
    for (const [url, group] of byExact) {
      if (group.length > 1)
        console.log(`    count=${group.length} url=${url.slice(0, 80)}... ids=[${group.map((x) => x.id).join(", ")}]`);
    }
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
