import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const type = new URL(req.url).searchParams.get("type");

  if (type === "analysis") {
    const logs = await prisma.analysisLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { scrapedJob: { select: { title: true, company: true, url: true, platform: true } } },
    });
    return NextResponse.json(logs);
  }

  if (type === "jobs") {
    const platform = new URL(req.url).searchParams.get("platform");
    const status = new URL(req.url).searchParams.get("status");
    const where: Record<string, any> = {};
    if (platform) where.platform = platform;
    if (status) where.status = status.toUpperCase();

    const jobs = await prisma.scrapedJob.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return NextResponse.json(jobs);
  }

  const logs = await prisma.scanLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(logs);
}
