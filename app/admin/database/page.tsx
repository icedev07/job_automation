"use client";

import { useEffect, useMemo, useState } from "react";

type RowsResult = {
  kind: "rows";
  rows: Record<string, unknown>[];
  rowCount: number;
  durationMs: number;
};
type AffectedResult = {
  kind: "affected";
  affected: number;
  durationMs: number;
};
type ErrorResult = { error: string; keyword?: string; durationMs?: number };
type Result = RowsResult | AffectedResult | ErrorResult;

const PRESETS: { label: string; sql: string }[] = [
  {
    label: "List ScrapedJob columns",
    sql: `SELECT column_name, data_type, character_maximum_length\nFROM information_schema.columns\nWHERE table_name = 'ScrapedJob'\nORDER BY ordinal_position;`,
  },
  {
    label: "Add manualApplyUrl column (idempotent)",
    sql: `ALTER TABLE "ScrapedJob" ADD COLUMN IF NOT EXISTS "manualApplyUrl" VARCHAR(2048);`,
  },
  {
    label: "Count ScrapedJob rows",
    sql: `SELECT COUNT(*)::int AS total FROM "ScrapedJob";`,
  },
  {
    label: "List all tables",
    sql: `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;`,
  },
];

const READ_KEYWORDS = new Set(["SELECT", "WITH", "SHOW", "EXPLAIN", "VALUES", "TABLE"]);

function firstKeyword(sql: string): string {
  const stripped = sql
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--[^\n]*/g, " ")
    .trim();
  const match = stripped.match(/^[A-Za-z]+/);
  return match ? match[0].toUpperCase() : "";
}

export default function DatabasePage() {
  const [sql, setSql] = useState<string>(PRESETS[0].sql);
  const [password, setPassword] = useState<string>("");
  const [confirmWrite, setConfirmWrite] = useState<boolean>(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_db_password") || "";
    if (stored) setPassword(stored);
    const h = sessionStorage.getItem("admin_db_history");
    if (h) {
      try {
        const parsed = JSON.parse(h);
        if (Array.isArray(parsed)) setHistory(parsed.slice(0, 20));
      } catch {}
    }
  }, []);

  const keyword = useMemo(() => firstKeyword(sql), [sql]);
  const isRead = READ_KEYWORDS.has(keyword);

  async function runQuery() {
    if (!sql.trim()) return;
    if (!password) {
      setResult({ error: "Enter the admin password before running a query." });
      return;
    }
    if (!isRead && !confirmWrite) {
      setResult({
        error: `This is a write/DDL query (${keyword || "unknown"}). Tick \"Confirm write\" before running.`,
      });
      return;
    }
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/db/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql, password, confirmWrite }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ error: data.error || "Query failed", keyword: data.keyword });
      } else {
        setResult(data);
        sessionStorage.setItem("admin_db_password", password);
        const next = [sql, ...history.filter((h) => h !== sql)].slice(0, 20);
        setHistory(next);
        sessionStorage.setItem("admin_db_history", JSON.stringify(next));
      }
    } catch (e) {
      setResult({ error: e instanceof Error ? e.message : "Network error" });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>Database</h1>
      <p style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: "1rem" }}>
        Run SQL directly against the configured DATABASE_URL. Use carefully — write/DDL queries are not reversible.
      </p>

      <div style={{ background: "#fef3c7", border: "1px solid #fbbf24", padding: "0.6rem 0.85rem", borderRadius: "6px", fontSize: "0.8rem", color: "#92400e", marginBottom: "1rem" }}>
        Destructive queries (UPDATE, DELETE, DROP, ALTER, TRUNCATE, ...) require the &quot;Confirm write&quot; checkbox.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 220px", gap: "1rem", alignItems: "start" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
            SQL
          </label>
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            spellCheck={false}
            rows={10}
            style={{
              width: "100%",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "0.8rem",
              padding: "0.6rem",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />

          <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", marginTop: "0.6rem", flexWrap: "wrap" }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              style={{ padding: "0.4rem 0.6rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.8rem", width: 180 }}
            />
            <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: isRead ? "#6b7280" : "#92400e" }}>
              <input
                type="checkbox"
                checked={confirmWrite}
                onChange={(e) => setConfirmWrite(e.target.checked)}
                disabled={isRead}
              />
              Confirm write {isRead ? "(not required for read)" : `(${keyword || "unknown"})`}
            </label>
            <button
              onClick={runQuery}
              disabled={running || !sql.trim()}
              style={{
                padding: "0.45rem 1.1rem",
                background: running ? "#6b7280" : isRead ? "#1d4ed8" : "#b91c1c",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: running ? "default" : "pointer",
                fontWeight: 500,
                fontSize: "0.85rem",
              }}
            >
              {running ? "Running..." : isRead ? "Run query" : "Run write query"}
            </button>
            <button
              onClick={() => {
                setSql("");
                setResult(null);
              }}
              disabled={running}
              style={{ padding: "0.45rem 0.9rem", background: "white", color: "#374151", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" }}
            >
              Clear
            </button>
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>Presets</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setSql(p.sql)}
                style={{ textAlign: "left", padding: "0.4rem 0.55rem", background: "white", border: "1px solid #e5e7eb", borderRadius: "4px", cursor: "pointer", fontSize: "0.78rem", color: "#1f2937" }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {history.length > 0 && (
            <>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#374151", margin: "1rem 0 0.35rem" }}>Recent</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                {history.slice(0, 8).map((h, i) => (
                  <button
                    key={i}
                    onClick={() => setSql(h)}
                    title={h}
                    style={{ textAlign: "left", padding: "0.35rem 0.5rem", background: "white", border: "1px solid #f3f4f6", borderRadius: "4px", cursor: "pointer", fontSize: "0.72rem", color: "#4b5563", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                  >
                    {h.replace(/\s+/g, " ").slice(0, 60)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div style={{ marginTop: "1.25rem" }}>
        <ResultView result={result} />
      </div>
    </div>
  );
}

function ResultView({ result }: { result: Result | null }) {
  if (!result) return null;
  if ("error" in result) {
    return (
      <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "0.75rem 1rem", borderRadius: "6px", color: "#991b1b", fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>
        <strong>Error</strong>
        {result.keyword ? ` (${result.keyword})` : ""}: {result.error}
        {typeof result.durationMs === "number" && (
          <span style={{ color: "#6b7280", marginLeft: "0.5rem" }}>· {result.durationMs}ms</span>
        )}
      </div>
    );
  }
  if (result.kind === "affected") {
    return (
      <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "0.75rem 1rem", borderRadius: "6px", color: "#065f46", fontSize: "0.85rem" }}>
        <strong>OK</strong> — {result.affected} row{result.affected === 1 ? "" : "s"} affected
        <span style={{ color: "#6b7280", marginLeft: "0.5rem" }}>· {result.durationMs}ms</span>
      </div>
    );
  }
  const rows = result.rows;
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  return (
    <div>
      <div style={{ fontSize: "0.8rem", color: "#374151", marginBottom: "0.4rem" }}>
        {result.rowCount} row{result.rowCount === 1 ? "" : "s"}
        <span style={{ color: "#6b7280", marginLeft: "0.5rem" }}>· {result.durationMs}ms</span>
      </div>
      {rows.length === 0 ? (
        <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>No rows returned.</div>
      ) : (
        <div style={{ background: "white", borderRadius: "6px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "auto", maxHeight: 480 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0 }}>
                {columns.map((c) => (
                  <th key={c} style={{ padding: "0.45rem 0.6rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  {columns.map((c) => (
                    <td key={c} style={{ padding: "0.4rem 0.6rem", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", verticalAlign: "top", maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={formatCell(row[c])}>
                      {formatCell(row[c])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
