import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

async function getDefaultUserId(): Promise<number> {
  const user = await prisma.user.findFirst();
  if (user) return user.id;
  const created = await prisma.user.create({
    data: { email: "user@jobbot.local", passwordHash: "dummy" },
  });
  return created.id;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, company, externalUrl, fullText, source, userId: bodyUserId } = body;
    if (typeof title !== "string" || !title.trim() || typeof company !== "string" || !company.trim() || typeof externalUrl !== "string" || !externalUrl.trim()) {
      return NextResponse.json({ error: "title, company, and externalUrl are required" }, { status: 400 });
    }
    const requestedUserId =
      typeof bodyUserId === "number"
        ? bodyUserId
        : typeof bodyUserId === "string"
          ? Number(bodyUserId)
          : NaN;
    const userId =
      Number.isFinite(requestedUserId) && requestedUserId > 0
        ? requestedUserId
        : await getDefaultUserId();
    const delegate = (prisma as any).oneClickJob;
    const data = {
      userId,
      source: typeof source === "string" && source.trim() ? source.trim() : "manual",
      title: title.trim(),
      company: company.trim(),
      externalUrl: externalUrl.trim(),
      fullText: typeof fullText === "string" ? fullText : "",
    };
    if (delegate?.create) {
      const job = await delegate.create({ data });
      return NextResponse.json({
        ...job,
        createdAt: job.createdAt.toISOString(),
        appliedAt: job.appliedAt?.toISOString() ?? null,
      });
    }
    const raw = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `INSERT INTO "OneClickJob" ("userId", source, title, company, "externalUrl", "fullText")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, "userId", source, title, company, "externalUrl", "fullText", "appliedAt", "createdAt"`,
      data.userId,
      data.source,
      data.title,
      data.company,
      data.externalUrl,
      data.fullText
    );
    const row = raw[0];
    const createdAtVal = row.createdAt ?? row.createdat;
    const appliedAtVal = row.appliedAt ?? row.appliedat;
    return NextResponse.json({
      id: Number(row.id),
      source: String(row.source ?? ""),
      title: String(row.title ?? ""),
      company: String(row.company ?? ""),
      externalUrl: String(row.externalUrl ?? row.externalurl ?? ""),
      fullText: String(row.fullText ?? row.fulltext ?? ""),
      appliedAt: appliedAtVal != null ? new Date(String(appliedAtVal)).toISOString() : null,
      createdAt: createdAtVal != null ? new Date(String(createdAtVal)).toISOString() : new Date().toISOString(),
    });
  } catch (e: unknown) {
    console.error("POST one-click-jobs:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userIdParam = searchParams.get("userId");
  const userId = userIdParam ? Number(userIdParam) : undefined;

  const delegate = (prisma as any).oneClickJob;
  if (delegate && typeof delegate.findMany === "function") {
    const jobs = await delegate.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        source: true,
        title: true,
        company: true,
        externalUrl: true,
        fullText: true,
        appliedAt: true,
        createdAt: true,
      },
    });
    const serialized = jobs.map((job: any) => ({
      ...job,
      createdAt: job.createdAt.toISOString(),
      appliedAt: job.appliedAt?.toISOString() ?? null,
    }));
    return new Response(JSON.stringify(serialized), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const raw = await (userId != null && !Number.isNaN(userId))
    ? prisma.$queryRaw<Array<Record<string, unknown>>>`
        SELECT id, "userId", source, title, company, "externalUrl", "fullText", "appliedAt", "createdAt"
        FROM "OneClickJob"
        WHERE "userId" = ${userId}
        ORDER BY "createdAt" DESC
      `
    : prisma.$queryRaw<Array<Record<string, unknown>>>`
        SELECT id, "userId", source, title, company, "externalUrl", "fullText", "appliedAt", "createdAt"
        FROM "OneClickJob"
        ORDER BY "createdAt" DESC
      `;
  const serialized = raw.map((row) => {
    const createdAtVal = row.createdAt ?? row.createdat;
    const appliedAtVal = row.appliedAt ?? row.appliedat;
    const createdAt = createdAtVal instanceof Date ? createdAtVal : new Date(String(createdAtVal));
    const appliedAt = appliedAtVal != null ? (appliedAtVal instanceof Date ? appliedAtVal : new Date(String(appliedAtVal))) : null;
    return {
      id: Number(row.id),
      source: String(row.source ?? ""),
      title: String(row.title ?? ""),
      company: String(row.company ?? ""),
      externalUrl: String(row.externalUrl ?? row.externalurl ?? ""),
      fullText: String(row.fullText ?? row.fulltext ?? ""),
      appliedAt: appliedAt?.toISOString() ?? null,
      createdAt: createdAt.toISOString(),
    };
  });
  return new Response(JSON.stringify(serialized), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
