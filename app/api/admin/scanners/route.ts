import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SCANNER_KEY_PREFIXES = [
  "remoteok",
  "remotive",
  "jobicy",
  "landingjobs",
  "weworkremotely",
  "remotees",
  "jobspresso",
  "authenticjobs",
  "nodesk",
  "greenhouse",
  "lever",
  "workable",
  "ashby",
];
const SCANNER_KEY_SUFFIXES = ["_search_url", "_max_jobs", "_enabled"];

function isScannerKey(key: string): boolean {
  return SCANNER_KEY_PREFIXES.some((p) => SCANNER_KEY_SUFFIXES.some((s) => key === `${p}${s}`));
}

export async function GET() {
  const expectedKeys = SCANNER_KEY_PREFIXES.flatMap((p) => SCANNER_KEY_SUFFIXES.map((s) => `${p}${s}`));
  const rows = await prisma.appConfig.findMany({
    where: { key: { in: expectedKeys } },
  });
  const config: Record<string, string> = {};
  for (const row of rows) config[row.key] = row.value;
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    if (isScannerKey(key) && typeof value === "string") {
      await prisma.appConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
  }
  return NextResponse.json({ ok: true });
}
