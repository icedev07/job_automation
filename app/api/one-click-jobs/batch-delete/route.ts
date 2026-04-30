import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids } = body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids must be a non-empty array of numbers" }, { status: 400 });
    }
    const numIds = ids.map((x: unknown) => Number(x)).filter((n) => !Number.isNaN(n) && n > 0);
    if (numIds.length === 0) {
      return NextResponse.json({ error: "No valid ids" }, { status: 400 });
    }

    const result = await prisma.oneClickJob.deleteMany({ where: { id: { in: numIds } } });
    return NextResponse.json({ success: true, deleted: result.count });
  } catch (e: unknown) {
    console.error("POST one-click-jobs/batch-delete:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to delete" },
      { status: 500 }
    );
  }
}
