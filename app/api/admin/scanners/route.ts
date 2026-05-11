import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SCANNER_KEY_PREFIXES = [
  "remoteok",
  "jobicy",
  "landingjobs",
  "weworkremotely",
  "jobspresso",
  "authenticjobs",
  "nodesk",
  "justremote",
  "greenhouse",
  "lever",
  "ashby",
];
const SCANNER_KEY_SUFFIXES = ["_search_url", "_max_jobs", "_enabled"];

// Standalone config keys that aren't per-scanner.
const GLOBAL_SCANNER_KEYS = ["scanner_rescan_after_days"];

function isAllowedKey(key: string): boolean {
  if (GLOBAL_SCANNER_KEYS.includes(key)) return true;
  return SCANNER_KEY_PREFIXES.some((p) => SCANNER_KEY_SUFFIXES.some((s) => key === `${p}${s}`));
}

export async function GET() {
  const expectedKeys = [
    ...GLOBAL_SCANNER_KEYS,
    ...SCANNER_KEY_PREFIXES.flatMap((p) => SCANNER_KEY_SUFFIXES.map((s) => `${p}${s}`)),
  ];
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
    if (isAllowedKey(key) && typeof value === "string") {
      await prisma.appConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
  }
  return NextResponse.json({ ok: true });
}
