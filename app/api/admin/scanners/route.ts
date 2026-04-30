import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const SCANNER_KEYS = [
  "jobright_context_dir", "jobright_max_jobs",
  "ziprecruiter_search_url", "ziprecruiter_max_jobs",
  "glassdoor_search_url", "glassdoor_max_jobs",
  "dice_search_url", "dice_max_jobs",
  "simplify_search_url", "simplify_max_jobs",
];

export async function GET() {
  const rows = await prisma.appConfig.findMany({
    where: { key: { in: SCANNER_KEYS } },
  });
  const config: Record<string, string> = {};
  for (const row of rows) config[row.key] = row.value;
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    if (SCANNER_KEYS.includes(key) && typeof value === "string") {
      await prisma.appConfig.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
  }
  return NextResponse.json({ ok: true });
}
