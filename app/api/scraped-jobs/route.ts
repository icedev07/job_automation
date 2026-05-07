import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const platform = url.searchParams.get("platform");
  const q = url.searchParams.get("q")?.trim() || "";
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const minScore = url.searchParams.get("minScore");
  const sortBy = url.searchParams.get("sortBy") || "date_desc";
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 25)));
  const facets = url.searchParams.get("facets") === "1";

  const where: Record<string, any> = {};
  if (status && status !== "ALL") where.status = status.toUpperCase();
  if (platform && platform !== "ALL") where.platform = platform;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { techStack: { contains: q, mode: "insensitive" } },
    ];
  }
  if (from || to) {
    where.createdAt = {};
    if (from) {
      const d = new Date(from);
      if (!isNaN(d.getTime())) where.createdAt.gte = d;
    }
    if (to) {
      const d = new Date(to);
      if (!isNaN(d.getTime())) {
        // If the caller sent only "YYYY-MM-DD" (no time component), treat it
        // as the end of that UTC day for the legacy contract. Anything with a
        // time component is trusted as an exact instant.
        if (/^\d{4}-\d{2}-\d{2}$/.test(to)) d.setUTCHours(23, 59, 59, 999);
        where.createdAt.lte = d;
      }
    }
  }
  if (minScore) {
    const n = Number(minScore);
    if (!isNaN(n)) where.aiScore = { gte: n };
  }

  let orderBy: Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[] = { createdAt: "desc" };
  switch (sortBy) {
    case "date_asc":
      orderBy = { createdAt: "asc" };
      break;
    case "score_desc":
      orderBy = [{ aiScore: "desc" }, { createdAt: "desc" }];
      break;
    case "score_asc":
      orderBy = [{ aiScore: "asc" }, { createdAt: "desc" }];
      break;
    case "title_asc":
      orderBy = { title: "asc" };
      break;
    case "company_asc":
      orderBy = { company: "asc" };
      break;
    case "date_desc":
    default:
      orderBy = { createdAt: "desc" };
  }

  const [jobs, total] = await Promise.all([
    prisma.scrapedJob.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.scrapedJob.count({ where }),
  ]);

  let facetData: any = undefined;
  if (facets) {
    const [platformGroup, statusGroup] = await Promise.all([
      prisma.scrapedJob.groupBy({
        by: ["platform"],
        _count: { _all: true },
      }),
      prisma.scrapedJob.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);
    facetData = {
      platforms: platformGroup
        .map((p) => ({ platform: p.platform, count: p._count._all }))
        .sort((a, b) => b.count - a.count),
      statuses: statusGroup.map((s) => ({ status: s.status, count: s._count._all })),
    };
  }

  return NextResponse.json({ jobs, total, page, limit, sortBy, facets: facetData });
}
