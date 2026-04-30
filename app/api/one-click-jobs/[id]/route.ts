import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const job = await prisma.oneClickJob.findUnique({ where: { id } });
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      ...job,
      createdAt: job.createdAt.toISOString(),
      appliedAt: job.appliedAt?.toISOString() ?? null,
    });
  } catch (e: any) {
    console.error("GET one-click-jobs/[id]:", e);
    return NextResponse.json({ error: e.message || "Failed to fetch" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { appliedAt, title, company, externalUrl, fullText, source } = body;
    const id = parseInt(params.id, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const data: Record<string, unknown> = {};
    if (appliedAt === true || appliedAt === "true") data.appliedAt = new Date();
    else if (appliedAt === false || appliedAt === "false" || appliedAt === null) data.appliedAt = null;
    if (typeof title === "string" && title.trim()) data.title = title.trim();
    if (typeof company === "string" && company.trim()) data.company = company.trim();
    if (typeof externalUrl === "string" && externalUrl.trim()) data.externalUrl = externalUrl.trim();
    if (typeof fullText === "string") data.fullText = fullText;
    if (typeof source === "string" && source.trim()) data.source = source.trim();

    const job = await prisma.oneClickJob.update({ where: { id }, data });
    return NextResponse.json({
      ...job,
      createdAt: job.createdAt.toISOString(),
      appliedAt: job.appliedAt?.toISOString() ?? null,
    });
  } catch (e: any) {
    console.error("PATCH one-click-jobs/[id]:", e);
    return NextResponse.json(
      { error: e.message || "Failed to update" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    await prisma.oneClickJob.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("DELETE one-click-jobs/[id]:", e);
    return NextResponse.json(
      { error: e.message || "Failed to delete" },
      { status: 500 }
    );
  }
}
