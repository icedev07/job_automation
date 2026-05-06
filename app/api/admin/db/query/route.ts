import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getConfig } from "@/lib/config";

export const dynamic = "force-dynamic";

const READ_KEYWORDS = ["SELECT", "WITH", "SHOW", "EXPLAIN", "VALUES", "TABLE"];

function firstKeyword(sql: string): string {
  const stripped = sql
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--[^\n]*/g, " ")
    .trim();
  const match = stripped.match(/^[A-Za-z]+/);
  return match ? match[0].toUpperCase() : "";
}

function serializeRows(rows: unknown): unknown {
  return JSON.parse(
    JSON.stringify(rows, (_k, v) => (typeof v === "bigint" ? v.toString() : v)),
  );
}

export async function POST(req: NextRequest) {
  let body: { sql?: unknown; password?: unknown; confirmWrite?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sql = typeof body.sql === "string" ? body.sql.trim() : "";
  if (!sql) {
    return NextResponse.json({ error: "sql is required" }, { status: 400 });
  }

  const config = await getConfig();
  const expected = config.adminPassword || "admin";
  const given = typeof body.password === "string" ? body.password : "";
  if (given !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keyword = firstKeyword(sql);
  const isRead = READ_KEYWORDS.includes(keyword);

  if (!isRead && body.confirmWrite !== true) {
    return NextResponse.json(
      {
        error:
          "This query is not a read query. Set confirmWrite=true to execute it.",
        keyword,
      },
      { status: 400 },
    );
  }

  const startedAt = Date.now();
  try {
    if (isRead) {
      const rows = await prisma.$queryRawUnsafe<unknown[]>(sql);
      return NextResponse.json({
        kind: "rows",
        rows: serializeRows(rows),
        rowCount: Array.isArray(rows) ? rows.length : 0,
        durationMs: Date.now() - startedAt,
      });
    }
    const affected = await prisma.$executeRawUnsafe(sql);
    return NextResponse.json({
      kind: "affected",
      affected,
      durationMs: Date.now() - startedAt,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Query failed";
    return NextResponse.json(
      { error: message, durationMs: Date.now() - startedAt },
      { status: 400 },
    );
  }
}
