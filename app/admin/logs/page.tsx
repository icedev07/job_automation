"use client";

import { useEffect, useState } from "react";

type ScanLogEntry = { id: number; board: string; jobsFound: number; jobsSaved: number; errors: string | null; durationMs: number | null; createdAt: string };
type GenLogEntry = { id: number; jobApplicationId: number; model: string; promptVersion: string; success: boolean; error: string | null; tokensUsed: number | null; durationMs: number | null; createdAt: string };

export default function LogsPage() {
  const [tab, setTab] = useState<"scans" | "generations">("scans");
  const [scanLogs, setScanLogs] = useState<ScanLogEntry[]>([]);
  const [genLogs, setGenLogs] = useState<GenLogEntry[]>([]);

  useEffect(() => {
    fetch("/api/admin/logs?type=scans").then((r) => r.json()).then(setScanLogs);
    fetch("/api/admin/logs?type=generations").then((r) => r.json()).then(setGenLogs);
  }, []);

  const tabStyle = (active: boolean) => ({
    padding: "0.5rem 1rem",
    background: active ? "#1d4ed8" : "white",
    color: active ? "white" : "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    cursor: "pointer" as const,
    fontSize: "0.8rem",
    fontWeight: active ? 600 : 400,
  });

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>Logs</h1>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button style={tabStyle(tab === "scans")} onClick={() => setTab("scans")}>Scan Logs</button>
        <button style={tabStyle(tab === "generations")} onClick={() => setTab("generations")}>Generation Logs</button>
      </div>

      {tab === "scans" && (
        <div style={{ background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
                {["Board", "Found", "Saved", "Duration", "Errors", "Date"].map((h) => (
                  <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 600, color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scanLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem", fontWeight: 500 }}>{log.board}</td>
                  <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem" }}>{log.jobsFound}</td>
                  <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem" }}>{log.jobsSaved}</td>
                  <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem", color: "#6b7280" }}>{log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : "-"}</td>
                  <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", color: log.errors ? "#dc2626" : "#16a34a" }}>{log.errors || "None"}</td>
                  <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", color: "#6b7280" }}>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {scanLogs.length === 0 && (
                <tr><td colSpan={6} style={{ padding: "1rem", color: "#6b7280", textAlign: "center", fontSize: "0.875rem" }}>No scan logs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === "generations" && (
        <div style={{ background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
                {["Job ID", "Model", "Tokens", "Duration", "Status", "Date"].map((h) => (
                  <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 600, color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {genLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem" }}>#{log.jobApplicationId}</td>
                  <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem", fontFamily: "monospace" }}>{log.model}</td>
                  <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem" }}>{log.tokensUsed ?? "-"}</td>
                  <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem", color: "#6b7280" }}>{log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : "-"}</td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>
                    <span style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", borderRadius: "9999px", color: "white", background: log.success ? "#16a34a" : "#dc2626" }}>
                      {log.success ? "OK" : "FAIL"}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", color: "#6b7280" }}>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {genLogs.length === 0 && (
                <tr><td colSpan={6} style={{ padding: "1rem", color: "#6b7280", textAlign: "center", fontSize: "0.875rem" }}>No generation logs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
