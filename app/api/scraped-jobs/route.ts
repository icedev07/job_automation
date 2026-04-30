import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const platform = url.searchParams.get("platform");
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 50)));

  const where: Record<string, any> = {};
  if (status) where.status = status.toUpperCase();
  if (platform) where.platform = platform;

  const [jobs, total] = await Promise.all([
    prisma.scrapedJob.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.scrapedJob.count({ where }),
  ]);

  return NextResponse.json({ jobs, total, page, limit });
}
