"use client";

import { useEffect, useState } from "react";

const SCANNERS = [
  { key: "jobright", label: "Jobright" },
  { key: "ziprecruiter", label: "ZipRecruiter" },
  { key: "glassdoor", label: "Glassdoor" },
  { key: "dice", label: "Dice" },
  { key: "simplify", label: "Simplify" },
];

export default function ScannersPage() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetch("/api/admin/scanners").then((r) => r.json()).then(setConfig);
    fetch("/api/admin/stats").then((r) => r.json()).then((s) => setPendingCount(s.pendingJobs || 0));
  }, []);

  async function saveConfig() {
    await fetch("/api/admin/scanners", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
  }

  async function runScan(board: string) {
    setRunning(board);
    setResults((prev) => ({ ...prev, [board]: "Running..." }));
    try {
      const res = await fetch("/api/admin/scanners/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board }),
      });
      const data = await res.json();
      setResults((prev) => ({ ...prev, [board]: data.success ? `Done: ${data.jobsSaved} jobs saved` : `Error: ${data.error}` }));
    } catch (err: any) {
      setResults((prev) => ({ ...prev, [board]: `Error: ${err.message}` }));
    }
    setRunning(null);
    fetch("/api/admin/stats").then((r) => r.json()).then((s) => setPendingCount(s.pendingJobs || 0));
  }

  async function runAnalysis() {
    setAnalyzing(true);
    setAnalyzeResult("Analyzing...");
    try {
      const res = await fetch("/api/admin/analyze", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setAnalyzeResult(`Done: ${data.approved} approved, ${data.rejected} rejected out of ${data.analyzed}`);
      } else {
        setAnalyzeResult(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setAnalyzeResult(`Error: ${err.message}`);
    }
    setAnalyzing(false);
    fetch("/api/admin/stats").then((r) => r.json()).then((s) => setPendingCount(s.pendingJobs || 0));
  }

  const inputStyle = { width: "100%", padding: "0.4rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.8rem" };

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>Scanners</h1>

      <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{pendingCount} jobs pending AI analysis</div>
          <div style={{ fontSize: "0.75rem", color: "#92400e" }}>Run analysis to filter jobs and sync approved ones to Google Sheets</div>
        </div>
        <button
          onClick={runAnalysis}
          disabled={analyzing || pendingCount === 0}
          style={{ padding: "0.5rem 1.25rem", background: analyzing ? "#6b7280" : "#7c3aed", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 500, fontSize: "0.85rem" }}
        >
          {analyzing ? "Analyzing..." : "Analyze Pending Jobs"}
        </button>
      </div>
      {analyzeResult && (
        <div style={{ marginBottom: "1rem", padding: "0.5rem 1rem", borderRadius: "4px", fontSize: "0.85rem", background: analyzeResult.includes("Error") ? "#fef2f2" : "#f0fdf4", color: analyzeResult.includes("Error") ? "#dc2626" : "#16a34a" }}>
          {analyzeResult}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {SCANNERS.map((s) => {
          const urlKey = `${s.key}_search_url`;
          const maxKey = `${s.key}_max_jobs`;
          const enabledKey = `${s.key}_enabled`;
          const isEnabled = config[enabledKey] !== "false";

          return (
            <div key={s.key} style={{ background: "white", padding: "1rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", opacity: isEnabled ? 1 : 0.6 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>{s.label}</h3>
                  <label style={{ fontSize: "0.75rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => { setConfig({ ...config, [enabledKey]: String(e.target.checked) }); setTimeout(saveConfig, 100); }}
                    />
                    Enabled
                  </label>
                </div>
                <button
                  onClick={() => runScan(s.key)}
                  disabled={running !== null || !isEnabled}
                  style={{ padding: "0.35rem 1rem", background: running === s.key ? "#6b7280" : "#059669", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}
                >
                  {running === s.key ? "Running..." : "Run Now"}
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "#6b7280" }}>Search URL</label>
                  <input value={config[urlKey] || ""} onChange={(e) => setConfig({ ...config, [urlKey]: e.target.value })} onBlur={saveConfig} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "#6b7280" }}>Max Jobs</label>
                  <input type="number" value={config[maxKey] || "10"} onChange={(e) => setConfig({ ...config, [maxKey]: e.target.value })} onBlur={saveConfig} style={inputStyle} />
                </div>
              </div>
              {results[s.key] && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: results[s.key].startsWith("Error") ? "#dc2626" : "#16a34a" }}>
                  {results[s.key]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
