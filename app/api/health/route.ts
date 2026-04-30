import { NextResponse } from "next/server";

/** Quick health check - returns immediately so you can verify the server is reachable. */
export async function GET() {
  return NextResponse.json({ ok: true, time: new Date().toISOString() });
}
