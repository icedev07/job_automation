import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [totalJobs, pendingJobs, approvedJobs, rejectedJobs, syncedJobs, recentScans, dbSizeRows, activeConnRows, tableSizeRows] = await Promise.all([
    prisma.scrapedJob.count(),
    prisma.scrapedJob.count({ where: { status: "PENDING" } }),
    prisma.scrapedJob.count({ where: { status: "APPROVED" } }),
    prisma.scrapedJob.count({ where: { status: "REJECTED" } }),
    prisma.scrapedJob.count({ where: { sheetSynced: true } }),
    prisma.scanLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.$queryRaw<{ db_size_bytes: bigint }[]>`
      SELECT pg_database_size(current_database()) AS db_size_bytes
    `,
    prisma.$queryRaw<{ active_connections: bigint }[]>`
      SELECT COUNT(*)::bigint AS active_connections
      FROM pg_stat_activity
      WHERE datname = current_database()
    `,
    prisma.$queryRaw<{ table_name: string; table_size_bytes: bigint }[]>`
      SELECT
        relname::text AS table_name,
        pg_total_relation_size(c.oid)::bigint AS table_size_bytes
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'r'
        AND n.nspname = 'public'
      ORDER BY pg_total_relation_size(c.oid) DESC
      LIMIT 10
    `,
  ]);

  const dbSizeBytes = Number(dbSizeRows[0]?.db_size_bytes || 0);
  const activeConnections = Number(activeConnRows[0]?.active_connections || 0);
  const dbSizeMb = Number((dbSizeBytes / (1024 * 1024)).toFixed(2));
  const topTables = tableSizeRows.map((t) => ({
    tableName: t.table_name,
    sizeMb: Number((Number(t.table_size_bytes || 0) / (1024 * 1024)).toFixed(2)),
  }));

  return NextResponse.json({
    totalJobs,
    pendingJobs,
    approvedJobs,
    rejectedJobs,
    syncedJobs,
    recentScans,
    dbMetrics: {
      dbSizeMb,
      activeConnections,
      topTables,
    },
  });
}
