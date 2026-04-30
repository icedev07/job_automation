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
    const data = {
      userId,
      source: typeof source === "string" && source.trim() ? source.trim() : "manual",
      title: title.trim(),
      company: company.trim(),
      externalUrl: externalUrl.trim(),
      fullText: typeof fullText === "string" ? fullText : "",
    };
    const job = await prisma.oneClickJob.create({ data });
    return NextResponse.json({
      ...job,
      createdAt: job.createdAt.toISOString(),
      appliedAt: job.appliedAt?.toISOString() ?? null,
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

  const jobs = await prisma.oneClickJob.findMany({
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
  const serialized = jobs.map((job) => ({
    ...job,
    createdAt: job.createdAt.toISOString(),
    appliedAt: job.appliedAt?.toISOString() ?? null,
  }));
  return NextResponse.json(serialized);
}
