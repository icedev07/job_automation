"use client";

import { useEffect, useState } from "react";

type ScannerConfig = {
  key: string;
  label: string;
  urlKey: string;
  maxJobsKey: string;
};

const SCANNERS: ScannerConfig[] = [
  { key: "jobright", label: "Jobright", urlKey: "jobright_context_dir", maxJobsKey: "jobright_max_jobs" },
  { key: "ziprecruiter", label: "ZipRecruiter", urlKey: "ziprecruiter_search_url", maxJobsKey: "ziprecruiter_max_jobs" },
  { key: "glassdoor", label: "Glassdoor", urlKey: "glassdoor_search_url", maxJobsKey: "glassdoor_max_jobs" },
  { key: "dice", label: "Dice", urlKey: "dice_search_url", maxJobsKey: "dice_max_jobs" },
  { key: "simplify", label: "Simplify", urlKey: "simplify_search_url", maxJobsKey: "simplify_max_jobs" },
];

export default function ScannersPage() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/scanners").then((r) => r.json()).then(setConfig);
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
  }

  const inputStyle = { width: "100%", padding: "0.4rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.8rem" };

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Scanners</h1>
      <p style={{ color: "#6b7280", fontSize: "0.8rem", marginBottom: "1rem" }}>
        Configure search URLs and max jobs per board. Click "Run Now" to trigger a manual scan.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {SCANNERS.map((s) => (
          <div key={s.key} style={{ background: "white", padding: "1rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>{s.label}</h3>
              <button
                onClick={() => runScan(s.key)}
                disabled={running !== null}
                style={{ padding: "0.35rem 1rem", background: running === s.key ? "#6b7280" : "#059669", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}
              >
                {running === s.key ? "Running..." : "Run Now"}
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "0.75rem" }}>
              <div>
                <label style={{ fontSize: "0.7rem", color: "#6b7280" }}>Search URL / Context Dir</label>
                <input
                  value={config[s.urlKey] || ""}
                  onChange={(e) => setConfig({ ...config, [s.urlKey]: e.target.value })}
                  onBlur={saveConfig}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.7rem", color: "#6b7280" }}>Max Jobs</label>
                <input
                  type="number"
                  value={config[s.maxJobsKey] || "10"}
                  onChange={(e) => setConfig({ ...config, [s.maxJobsKey]: e.target.value })}
                  onBlur={saveConfig}
                  style={inputStyle}
                />
              </div>
            </div>
            {results[s.key] && (
              <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: results[s.key].startsWith("Error") ? "#dc2626" : "#16a34a" }}>
                {results[s.key]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
