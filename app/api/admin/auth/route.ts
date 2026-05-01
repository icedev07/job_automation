import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const config = await getConfig();
    const expected = config.adminPassword || "admin";
    const given = String(body.password ?? "").trim();

    if (given === expected) {
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json(
      {
        error:
          "Cannot verify login (database may be unreachable). Check DATABASE_URL on Vercel and run prisma migrate deploy.",
        detail: message,
      },
      { status: 503 }
    );
  }
}
