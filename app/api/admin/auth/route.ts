import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/config";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const config = await getConfig();
  const expected = config.adminPassword || "admin";

  if (body.password === expected) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
