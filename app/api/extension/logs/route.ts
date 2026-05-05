import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { logs, sessionId } = body;

  if (!Array.isArray(logs) || logs.length === 0) {
    return NextResponse.json({ error: "logs[] required" }, { status: 400, headers: corsHeaders() });
  }

  const data = logs.slice(0, 500).map((entry: any) => ({
    level: String(entry.level || "info").substring(0, 20),
    message: String(entry.message || "").substring(0, 2000),
    sessionId: sessionId ? String(sessionId).substring(0, 100) : null,
    createdAt: entry.timestamp ? new Date(entry.timestamp) : new Date(),
  }));

  try {
    await prisma.extensionLog.createMany({ data });
    return NextResponse.json({ saved: data.length }, { headers: corsHeaders() });
  } catch (error: any) {
    if (error.message?.includes("ExtensionLog")) {
      return NextResponse.json({ error: "ExtensionLog table not found. Run /api/setup first." }, { status: 500, headers: corsHeaders() });
    }
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders() });
  }
}
