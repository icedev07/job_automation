"use client";

import { useEffect, useState, useCallback } from "react";

type ScanLogEntry = { id: number; board: string; jobsFound: number; jobsSaved: number; errors: string | null; durationMs: number | null; createdAt: string };
type AnalysisLogEntry = {
  id: number; scrapedJobId: number; model: string; approved: boolean; score: number | null;
  reason: string | null; tokensUsed: number | null; durationMs: number | null; createdAt: string;
  scrapedJob?: { title: string; company: string; url: string; platform: string };
};
type JobEntry = {
  id: number; platform: string; title: string; company: string; location: string | null;
  url: string; status: string; aiScore: number | null; aiReason: string | null;
  sheetSynced: boolean; createdAt: string;
};
type ExtLogEntry = { id: number; level: string; message: string; sessionId: string | null; createdAt: string };

export default function LogsPage() {
  const [tab, setTab] = useState<"jobs" | "analysis" | "scans" | "extension">("jobs");
  const [scanLogs, setScanLogs] = useState<ScanLogEntry[]>([]);
  const [analysisLogs, setAnalysisLogs] = useState<AnalysisLogEntry[]>([]);
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const [platformFilter, setPlatformFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedJobs, setSelectedJobs] = useState<Set<number>>(new Set());
  const [selectedAnalysis, setSelectedAnalysis] = useState<Set<number>>(new Set());
  const [selectedScans, setSelectedScans] = useState<Set<number>>(new Set());
  const [extLogs, setExtLogs] = useState<ExtLogEntry[]>([]);
  const [selectedExt, setSelectedExt] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const dateParams = useCallback(() => {
    const p = new URLSearchParams();
    if (dateFrom) p.set("from", dateFrom);
    if (dateTo) p.set("to", dateTo);
    return p;
  }, [dateFrom, dateTo]);

  const loadScans = useCallback(() => {
    const p = dateParams(); p.set("type", "scans");
    fetch(`/api/admin/logs?${p}`).then(r => r.json()).then(setScanLogs);
  }, [dateParams]);

  const loadAnalysis = useCallback(() => {
    const p = dateParams(); p.set("type", "analysis");
    fetch(`/api/admin/logs?${p}`).then(r => r.json()).then(setAnalysisLogs);
  }, [dateParams]);

  const loadExtLogs = useCallback(() => {
    const p = dateParams(); p.set("type", "extension");
    fetch(`/api/admin/logs?${p}`).then(r => r.json()).then((d: any) => setExtLogs(Array.isArray(d) ? d : []));
  }, [dateParams]);

  const loadJobs = useCallback(() => {
    const p = dateParams(); p.set("type", "jobs");
    if (platformFilter) p.set("platform", platformFilter);
    if (statusFilter) p.set("status", statusFilter);
    fetch(`/api/admin/logs?${p}`).then(r => r.json()).then(setJobs);
  }, [dateParams, platformFilter, statusFilter]);

  useEffect(() => { loadScans(); loadAnalysis(); loadExtLogs(); }, [loadScans, loadAnalysis, loadExtLogs]);
  useEffect(() => { loadJobs(); }, [loadJobs]);

  async function handleDelete(type: string, ids: Set<number>) {
    if (ids.size === 0) return;
    if (!confirm(`Permanently delete ${ids.size} selected ${type}?`)) return;
    setDeleting(true);
    await fetch("/api/admin/logs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, ids: Array.from(ids) }),
    });
    if (type === "jobs") { setSelectedJobs(new Set()); loadJobs(); loadAnalysis(); }
    if (type === "analysis") { setSelectedAnalysis(new Set()); loadAnalysis(); }
    if (type === "scans") { setSelectedScans(new Set()); loadScans(); }
    if (type === "extension") { setSelectedExt(new Set()); loadExtLogs(); }
    setDeleting(false);
  }

  function toggleSet(set: Set<number>, id: number): Set<number> {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  }

  function toggleAll(set: Set<number>, allIds: number[]): Set<number> {
    return set.size === allIds.length ? new Set() : new Set(allIds);
  }

  const tabStyle = (active: boolean) => ({
    padding: "0.5rem 1rem", background: active ? "#1d4ed8" : "white",
    color: active ? "white" : "#374151", border: "1px solid #d1d5db",
    borderRadius: "4px", cursor: "pointer" as const, fontSize: "0.8rem", fontWeight: active ? 600 : 400,
  });
  const statusBadge = (status: string) => {
    const c: Record<string, string> = { APPROVED: "#16a34a", REJECTED: "#dc2626", PENDING: "#d97706" };
    return { fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: "9999px", color: "white", background: c[status] || "#6b7280" };
  };
  const inputStyle = { padding: "0.3rem 0.5rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.75rem" };
  const delBtnStyle = {
    padding: "0.3rem 0.7rem", background: "#dc2626", color: "white", border: "none",
    borderRadius: "4px", fontSize: "0.7rem", cursor: "pointer" as const, opacity: deleting ? 0.5 : 1,
  };
  const thStyle = { padding: "0.5rem 0.6rem", textAlign: "left" as const, fontSize: "0.7rem", fontWeight: 600, color: "#6b7280" };
  const tdStyle = { padding: "0.4rem 0.6rem", fontSize: "0.75rem" };
  const smText = { ...tdStyle, fontSize: "0.7rem", color: "#6b7280" };

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.75rem" }}>Logs</h1>

      {/* Date range filter */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <label style={{ fontSize: "0.7rem", color: "#6b7280" }}>From</label>
        <input type="date" style={inputStyle} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <label style={{ fontSize: "0.7rem", color: "#6b7280" }}>To</label>
        <input type="date" style={inputStyle} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        {(dateFrom || dateTo) && (
          <button style={{ ...inputStyle, cursor: "pointer", background: "#f3f4f6" }} onClick={() => { setDateFrom(""); setDateTo(""); }}>Clear dates</button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button style={tabStyle(tab === "jobs")} onClick={() => setTab("jobs")}>All Jobs</button>
        <button style={tabStyle(tab === "analysis")} onClick={() => setTab("analysis")}>AI Analysis</button>
        <button style={tabStyle(tab === "scans")} onClick={() => setTab("scans")}>Scan Logs</button>
        <button style={tabStyle(tab === "extension")} onClick={() => setTab("extension")}>Extension Logs</button>
      </div>

      {/* JOBS TAB */}
      {tab === "jobs" && (
        <div>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <select style={inputStyle} value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
              <option value="">All Platforms</option>
              <option value="linkedin">LinkedIn</option>
              <option value="remoteok">RemoteOK</option>
              <option value="remotive">Remotive</option>
              <option value="weworkremotely">We Work Remotely</option>
              <option value="jobicy">Jobicy</option>
              <option value="greenhouse">Greenhouse</option>
              <option value="lever">Lever</option>
            </select>
            <select style={inputStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PENDING">Pending</option>
            </select>
            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{jobs.length} jobs</span>
            {selectedJobs.size > 0 && (
              <button style={delBtnStyle} disabled={deleting} onClick={() => handleDelete("jobs", selectedJobs)}>
                Delete {selectedJobs.size} selected
              </button>
            )}
          </div>
          <div style={{ background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "950px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
                  <th style={thStyle}>
                    <input type="checkbox" checked={selectedJobs.size === jobs.length && jobs.length > 0}
                      onChange={() => setSelectedJobs(toggleAll(selectedJobs, jobs.map(j => j.id)))} />
                  </th>
                  {["Platform", "Title", "Company", "Location", "Status", "Score", "Reason", "Date"].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id} style={{ borderBottom: "1px solid #f3f4f6", background: selectedJobs.has(job.id) ? "#eff6ff" : undefined }}>
                    <td style={tdStyle}><input type="checkbox" checked={selectedJobs.has(job.id)} onChange={() => setSelectedJobs(toggleSet(selectedJobs, job.id))} /></td>
                    <td style={tdStyle}>
                      <span style={{ padding: "0.1rem 0.3rem", background: job.platform === "linkedin" ? "#0a66c2" : "#6b7280", color: "white", borderRadius: "3px", fontSize: "0.65rem" }}>{job.platform}</span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 500, maxWidth: "200px" }}>
                      <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8", textDecoration: "none" }}>{job.title}</a>
                    </td>
                    <td style={tdStyle}>{job.company}</td>
                    <td style={smText}>{job.location || "-"}</td>
                    <td style={tdStyle}><span style={statusBadge(job.status)}>{job.status}</span></td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: job.aiScore && job.aiScore >= 60 ? "#16a34a" : "#dc2626" }}>{job.aiScore ?? "-"}</td>
                    <td style={{ ...smText, maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={job.aiReason || ""}>{job.aiReason || "-"}</td>
                    <td style={smText}>{new Date(job.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {jobs.length === 0 && <tr><td colSpan={9} style={{ padding: "1rem", color: "#6b7280", textAlign: "center" }}>No jobs found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ANALYSIS TAB */}
      {tab === "analysis" && (
        <div>
          {selectedAnalysis.size > 0 && (
            <div style={{ marginBottom: "0.5rem" }}>
              <button style={delBtnStyle} disabled={deleting} onClick={() => handleDelete("analysis", selectedAnalysis)}>
                Delete {selectedAnalysis.size} selected
              </button>
            </div>
          )}
          <div style={{ background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "950px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
                  <th style={thStyle}>
                    <input type="checkbox" checked={selectedAnalysis.size === analysisLogs.length && analysisLogs.length > 0}
                      onChange={() => setSelectedAnalysis(toggleAll(selectedAnalysis, analysisLogs.map(l => l.id)))} />
                  </th>
                  {["Platform", "Title", "Company", "Model", "Score", "Result", "Reason", "Tokens", "Date"].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {analysisLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #f3f4f6", background: selectedAnalysis.has(log.id) ? "#eff6ff" : undefined }}>
                    <td style={tdStyle}><input type="checkbox" checked={selectedAnalysis.has(log.id)} onChange={() => setSelectedAnalysis(toggleSet(selectedAnalysis, log.id))} /></td>
                    <td style={tdStyle}>
                      <span style={{ padding: "0.1rem 0.3rem", background: log.scrapedJob?.platform === "linkedin" ? "#0a66c2" : "#6b7280", color: "white", borderRadius: "3px", fontSize: "0.65rem" }}>{log.scrapedJob?.platform || "-"}</span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 500, maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {log.scrapedJob ? <a href={log.scrapedJob.url} target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8", textDecoration: "none" }}>{log.scrapedJob.title}</a> : `#${log.scrapedJobId}`}
                    </td>
                    <td style={tdStyle}>{log.scrapedJob?.company || "-"}</td>
                    <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "0.7rem" }}>{log.model}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{log.score ?? "-"}</td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: "9999px", color: "white", background: log.approved ? "#16a34a" : "#dc2626" }}>
                        {log.approved ? "APPROVED" : "REJECTED"}
                      </span>
                    </td>
                    <td style={{ ...smText, maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.reason || ""}>{log.reason || "-"}</td>
                    <td style={tdStyle}>{log.tokensUsed ?? "-"}</td>
                    <td style={smText}>{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {analysisLogs.length === 0 && <tr><td colSpan={10} style={{ padding: "1rem", color: "#6b7280", textAlign: "center" }}>No analysis logs yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SCANS TAB */}
      {tab === "scans" && (
        <div>
          {selectedScans.size > 0 && (
            <div style={{ marginBottom: "0.5rem" }}>
              <button style={delBtnStyle} disabled={deleting} onClick={() => handleDelete("scans", selectedScans)}>
                Delete {selectedScans.size} selected
              </button>
            </div>
          )}
          <div style={{ background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
                  <th style={thStyle}>
                    <input type="checkbox" checked={selectedScans.size === scanLogs.length && scanLogs.length > 0}
                      onChange={() => setSelectedScans(toggleAll(selectedScans, scanLogs.map(l => l.id)))} />
                  </th>
                  {["Board", "Found", "Saved", "Duration", "Errors", "Date"].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {scanLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #f3f4f6", background: selectedScans.has(log.id) ? "#eff6ff" : undefined }}>
                    <td style={tdStyle}><input type="checkbox" checked={selectedScans.has(log.id)} onChange={() => setSelectedScans(toggleSet(selectedScans, log.id))} /></td>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{log.board}</td>
                    <td style={tdStyle}>{log.jobsFound}</td>
                    <td style={tdStyle}>{log.jobsSaved}</td>
                    <td style={smText}>{log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : "-"}</td>
                    <td style={{ ...tdStyle, fontSize: "0.75rem", color: log.errors ? "#dc2626" : "#16a34a" }}>{log.errors || "None"}</td>
                    <td style={smText}>{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {scanLogs.length === 0 && <tr><td colSpan={7} style={{ padding: "1rem", color: "#6b7280", textAlign: "center" }}>No scan logs yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EXTENSION TAB */}
      {tab === "extension" && (
        <div>
          {selectedExt.size > 0 && (
            <div style={{ marginBottom: "0.5rem" }}>
              <button style={delBtnStyle} disabled={deleting} onClick={() => handleDelete("extension", selectedExt)}>
                Delete {selectedExt.size} selected
              </button>
            </div>
          )}
          <div style={{ background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
                  <th style={thStyle}>
                    <input type="checkbox" checked={selectedExt.size === extLogs.length && extLogs.length > 0}
                      onChange={() => setSelectedExt(toggleAll(selectedExt, extLogs.map(l => l.id)))} />
                  </th>
                  {["Level", "Message", "Session", "Date"].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {extLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #f3f4f6", background: selectedExt.has(log.id) ? "#eff6ff" : undefined }}>
                    <td style={tdStyle}><input type="checkbox" checked={selectedExt.has(log.id)} onChange={() => setSelectedExt(toggleSet(selectedExt, log.id))} /></td>
                    <td style={tdStyle}>
                      <span style={{ padding: "0.1rem 0.3rem", borderRadius: "3px", fontSize: "0.65rem", color: "white", background: log.level === "error" ? "#dc2626" : log.level === "warn" ? "#d97706" : "#059669" }}>{log.level}</span>
                    </td>
                    <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "0.7rem", maxWidth: "500px", wordBreak: "break-all" }}>{log.message}</td>
                    <td style={{ ...smText, fontFamily: "monospace" }}>{log.sessionId || "-"}</td>
                    <td style={smText}>{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {extLogs.length === 0 && <tr><td colSpan={5} style={{ padding: "1rem", color: "#6b7280", textAlign: "center" }}>No extension logs yet. Enable &quot;Send logs to server&quot; in the extension.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
