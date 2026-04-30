import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const type = new URL(req.url).searchParams.get("type");

  if (type === "analysis") {
    const logs = await prisma.analysisLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(logs);
  }

  const logs = await prisma.scanLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(logs);
}
