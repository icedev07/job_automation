import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const profiles = await prisma.userProfile.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(profiles);
}

export async function POST(req: NextRequest) {
  const { name, email, baseResumeText } = await req.json();
  if (!name || !email) {
    return NextResponse.json({ error: "name and email required" }, { status: 400 });
  }
  const profile = await prisma.userProfile.create({
    data: { name, email, baseResumeText: baseResumeText || "" },
  });
  return NextResponse.json(profile);
}
