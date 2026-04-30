import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateSkipRuleCache } from "@/lib/jobSkipRules";

export const dynamic = "force-dynamic";

export async function GET() {
  const rules = await prisma.skipRule.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(rules);
}

export async function POST(req: NextRequest) {
  const { type, pattern } = await req.json();
  if (!type || !pattern) {
    return NextResponse.json({ error: "type and pattern required" }, { status: 400 });
  }
  const rule = await prisma.skipRule.create({
    data: { type, pattern },
  });
  invalidateSkipRuleCache();
  return NextResponse.json(rule);
}
