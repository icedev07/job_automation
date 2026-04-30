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
    const delegate = (prisma as any).oneClickJob;
    if (delegate?.findUnique) {
      const job = await delegate.findUnique({ where: { id } });
      if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({
        ...job,
        createdAt: job.createdAt.toISOString(),
        appliedAt: job.appliedAt?.toISOString() ?? null,
      });
    }
    const raw = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT id, "userId", source, title, company, "externalUrl", "fullText", "appliedAt", "createdAt"
      FROM "OneClickJob" WHERE id = ${id}
    `;
    if (!raw.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const row = raw[0];
    const createdAtVal = row.createdAt ?? row.createdat;
    const appliedAtVal = row.appliedAt ?? row.appliedat;
    const job = {
      id: Number(row.id),
      source: String(row.source ?? ""),
      title: String(row.title ?? ""),
      company: String(row.company ?? ""),
      externalUrl: String(row.externalUrl ?? row.externalurl ?? ""),
      fullText: String(row.fullText ?? row.fulltext ?? ""),
      appliedAt: appliedAtVal != null ? (appliedAtVal instanceof Date ? appliedAtVal.toISOString() : new Date(String(appliedAtVal)).toISOString()) : null,
      createdAt: createdAtVal instanceof Date ? (createdAtVal as Date).toISOString() : new Date(String(createdAtVal)).toISOString(),
    };
    return NextResponse.json(job);
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

    const delegate = (prisma as any).oneClickJob;
    if (delegate?.update) {
      const data: Record<string, unknown> = {};
      if (appliedAt === true || appliedAt === "true") data.appliedAt = new Date();
      else if (appliedAt === false || appliedAt === "false" || appliedAt === null) data.appliedAt = null;
      if (typeof title === "string" && title.trim()) data.title = title.trim();
      if (typeof company === "string" && company.trim()) data.company = company.trim();
      if (typeof externalUrl === "string" && externalUrl.trim()) data.externalUrl = externalUrl.trim();
      if (typeof fullText === "string") data.fullText = fullText;
      if (typeof source === "string" && source.trim()) data.source = source.trim();

      const job = await delegate.update({ where: { id }, data });
      return NextResponse.json({
        ...job,
        createdAt: job.createdAt.toISOString(),
        appliedAt: job.appliedAt?.toISOString() ?? null,
      });
    }

    const updates: string[] = [];
    const values: unknown[] = [];
    let pos = 1;
    if (appliedAt === true || appliedAt === "true") {
      updates.push(`"appliedAt" = $${pos++}`);
      values.push(new Date());
    } else if (appliedAt === false || appliedAt === "false" || appliedAt === null) {
      updates.push(`"appliedAt" = $${pos++}`);
      values.push(null);
    }
    if (typeof title === "string" && title.trim()) {
      updates.push(`title = $${pos++}`);
      values.push(title.trim());
    }
    if (typeof company === "string" && company.trim()) {
      updates.push(`company = $${pos++}`);
      values.push(company.trim());
    }
    if (typeof externalUrl === "string" && externalUrl.trim()) {
      updates.push(`"externalUrl" = $${pos++}`);
      values.push(externalUrl.trim());
    }
    if (typeof fullText === "string") {
      updates.push(`"fullText" = $${pos++}`);
      values.push(fullText);
    }
    if (typeof source === "string" && source.trim()) {
      updates.push(`source = $${pos++}`);
      values.push(source.trim());
    }
    if (updates.length === 0) {
      const raw = await prisma.$queryRaw<Array<Record<string, unknown>>>`
        SELECT id, "userId", source, title, company, "externalUrl", "fullText", "appliedAt", "createdAt"
        FROM "OneClickJob" WHERE id = ${id}
      `;
      if (!raw.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const row = raw[0];
      return NextResponse.json({
        id: Number(row.id),
        source: String(row.source ?? ""),
        title: String(row.title ?? ""),
        company: String(row.company ?? ""),
        externalUrl: String(row.externalUrl ?? row.externalurl ?? ""),
        fullText: String(row.fullText ?? row.fulltext ?? ""),
        appliedAt: row.appliedAt != null ? (row.appliedAt instanceof Date ? row.appliedAt.toISOString() : new Date(String(row.appliedAt)).toISOString()) : null,
        createdAt: row.createdAt instanceof Date ? (row.createdAt as Date).toISOString() : new Date(String(row.createdAt)).toISOString(),
      });
    }
    values.push(id);
    await prisma.$executeRawUnsafe(
      `UPDATE "OneClickJob" SET ${updates.join(", ")} WHERE id = $${pos}`,
      ...values
    );
    const raw = await prisma.$queryRaw<Array<Record<string, unknown>>>`
      SELECT id, "userId", source, title, company, "externalUrl", "fullText", "appliedAt", "createdAt"
      FROM "OneClickJob" WHERE id = ${id}
    `;
    if (!raw.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const row = raw[0];
    return NextResponse.json({
      id: Number(row.id),
      source: String(row.source ?? ""),
      title: String(row.title ?? ""),
      company: String(row.company ?? ""),
      externalUrl: String(row.externalUrl ?? row.externalurl ?? ""),
      fullText: String(row.fullText ?? row.fulltext ?? ""),
      appliedAt: row.appliedAt != null ? (row.appliedAt instanceof Date ? row.appliedAt.toISOString() : new Date(String(row.appliedAt)).toISOString()) : null,
      createdAt: row.createdAt instanceof Date ? (row.createdAt as Date).toISOString() : new Date(String(row.createdAt)).toISOString(),
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

    const delegate = (prisma as any).oneClickJob;
    if (delegate?.delete) {
      await delegate.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }
    const result = await prisma.$executeRaw`DELETE FROM "OneClickJob" WHERE id = ${id}`;
    if (result === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("DELETE one-click-jobs/[id]:", e);
    return NextResponse.json(
      { error: e.message || "Failed to delete" },
      { status: 500 }
    );
  }
}
