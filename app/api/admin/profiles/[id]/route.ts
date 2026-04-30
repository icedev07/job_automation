import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  const { name, email, baseResumeText } = await req.json();
  const profile = await prisma.userProfile.update({
    where: { id },
    data: { name, email, baseResumeText },
  });
  return NextResponse.json(profile);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  await prisma.userProfile.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
