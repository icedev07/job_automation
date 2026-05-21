"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";

type ScanLogEntry = { id: number; board: string; jobsFound: number; jobsSaved: number; errors: string | null; durationMs: number | null; createdAt: string };
type AnalysisLogEntry = {
  id: number; scrapedJobId: number; model: string; approved: boolean; score: number | null;
  reason: string | null; tokensUsed: number | null; durationMs: number | null; createdAt: string;
  scrapedJob?: { title: string; company: string; url: string; platform: string };
};
type JobEntry = {
  id: number; platform: string; title: string; company: string; location: string | null;
  url: string; manualApplyUrl: string | null;
  status: string; aiScore: number | null; aiReason: string | null;
  sheetSynced: boolean; createdAt: string;
};
type ExtLogEntry = { id: number; level: string; message: string; sessionId: string | null; createdAt: string };

type ResourceKey = "jobs" | "analysis" | "scans" | "extension";

// Row caps mirror the `take:` limits in /api/admin/logs, so the count badge
// can flag when the view has been truncated to the most recent N.
const ROW_CAP: Record<ResourceKey, number> = { jobs: 500, analysis: 500, scans: 200, extension: 500 };
const RESOURCE_LABEL: Record<ResourceKey, string> = {
  jobs: "jobs", analysis: "analysis logs", scans: "scan logs", extension: "extension logs",
};

// Rotating spinner. The `spin` keyframes live in globals.css — inline styles
// cannot declare @keyframes.
function Spinner({ size = 16 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-block", width: size, height: size,
        border: "2px solid #e5e7eb", borderTopColor: "#1d4ed8",
        borderRadius: "50%", animation: "spin 0.6s linear infinite", flexShrink: 0,
      }}
    />
  );
}

// One full-width table row that shows exactly one honest state — loading,
// error (with a retry), or empty — so a request in flight never looks like
// a genuinely empty result.
function TableStateRow({
  colSpan, loading, error, emptyText, onRetry,
}: {
  colSpan: number; loading?: boolean; error?: string; emptyText: string; onRetry: () => void;
}) {
  const cell = { padding: "2.75rem 1rem", textAlign: "center" as const, fontSize: "0.8rem" };
  let content: ReactNode;
  if (error) {
    content = (
      <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", justifyContent: "center", color: "#dc2626" }}>
        <span>⚠ {error}</span>
        <button
          type="button"
          onClick={onRetry}
          style={{ padding: "0.2rem 0.65rem", border: "1px solid #fca5a5", borderRadius: 4, background: "white", color: "#dc2626", fontSize: "0.7rem", cursor: "pointer" }}
        >
          Retry
        </button>
      </div>
    );
  } else if (loading) {
    content = (
      <div role="status" style={{ display: "flex", gap: "0.5rem", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
        <Spinner /> <span>Loading…</span>
      </div>
    );
  } else {
    content = <span style={{ color: "#6b7280" }}>{emptyText}</span>;
  }
  return <tr><td colSpan={colSpan} style={cell}>{content}</td></tr>;
}

function RefreshButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title="Reload this tab"
      style={{
        display: "flex", alignItems: "center", gap: "0.35rem",
        padding: "0.3rem 0.7rem", border: "1px solid #d1d5db", borderRadius: 4,
        background: "white", color: "#374151", fontSize: "0.72rem",
        cursor: loading ? "default" : "pointer", opacity: loading ? 0.65 : 1,
      }}
    >
      {loading ? <Spinner size={12} /> : <span style={{ fontSize: "0.85rem", lineHeight: 1 }}>↻</span>}
      Refresh
    </button>
  );
}

// Row count badge. Shows "loading…" until the first fetch settles, and flags
// when the result is capped to the latest N.
function Count({ loading, n, one, many, cap }: { loading: boolean; n: number; one: string; many: string; cap: number }) {
  if (loading && n === 0) {
    return <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>loading…</span>;
  }
  return (
    <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
      {n} {n === 1 ? one : many}{n >= cap ? ` · latest ${cap}` : ""}
    </span>
  );
}

function ManualApplyCell({ job }: { job: { manualApplyUrl: string | null; url: string } }) {
  const apply = job.manualApplyUrl || job.url;
  const isFallback = !job.manualApplyUrl;
  if (!apply) return <span style={{ color: "#9ca3af" }}>—</span>;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", minWidth: 0 }}>
      <a
        href={apply}
        target="_blank"
        rel="noopener noreferrer"
        title={apply}
        style={{ color: isFallback ? "#6b7280" : "#1d4ed8", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}
      >
        {isFallback ? "via LinkedIn" : "Open apply"}
      </a>
      <CopyUrlBtn value={apply} title={isFallback ? "Copy LinkedIn URL" : "Copy apply URL"} />
    </div>
  );
}

function CopyUrlBtn({ value, title }: { value: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={(e: any) => {
        e.stopPropagation();
        e.preventDefault();
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
      title={title || "Copy URL"}
      style={{
        padding: "0.1rem 0.35rem",
        border: "1px solid #e5e7eb",
        borderRadius: 4,
        background: copied ? "#d1fae5" : "white",
        color: copied ? "#065f46" : "#6b7280",
        fontSize: "0.62rem",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function LogsPage() {
  const [tab, setTab] = useState<ResourceKey>("jobs");
  const [scanLogs, setScanLogs] = useState<ScanLogEntry[]>([]);
  const [analysisLogs, setAnalysisLogs] = useState<AnalysisLogEntry[]>([]);
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const [extLogs, setExtLogs] = useState<ExtLogEntry[]>([]);
  const [platformFilter, setPlatformFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedJobs, setSelectedJobs] = useState<Set<number>>(new Set());
  const [selectedAnalysis, setSelectedAnalysis] = useState<Set<number>>(new Set());
  const [selectedScans, setSelectedScans] = useState<Set<number>>(new Set());
  const [selectedExt, setSelectedExt] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);
  // Per-resource loading + error so each tab reflects its own request state.
  const [loading, setLoading] = useState<Record<ResourceKey, boolean>>({
    jobs: true, analysis: true, scans: true, extension: true,
  });
  const [errors, setErrors] = useState<Partial<Record<ResourceKey, string>>>({});

  const dateParams = useCallback(() => {
    const p = new URLSearchParams();
    if (dateFrom) p.set("from", dateFrom);
    if (dateTo) p.set("to", dateTo);
    return p;
  }, [dateFrom, dateTo]);

  // Shared fetcher: tracks loading, validates the shape (the API can return a
  // non-array error body on failure — feeding that to a table would crash the
  // page) and records a per-resource error instead of throwing.
  const loadResource = useCallback(
    async (key: ResourceKey, params: URLSearchParams, apply: (rows: any[]) => void) => {
      setLoading((l) => ({ ...l, [key]: true }));
      setErrors((e) => ({ ...e, [key]: undefined }));
      try {
        const res = await fetch(`/api/admin/logs?${params}`);
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Unexpected response from server");
        apply(data);
      } catch (err: any) {
        apply([]);
        setErrors((e) => ({ ...e, [key]: err?.message || "Failed to load" }));
      } finally {
        setLoading((l) => ({ ...l, [key]: false }));
      }
    },
    [],
  );

  const loadScans = useCallback(() => {
    const p = dateParams(); p.set("type", "scans");
    return loadResource("scans", p, setScanLogs);
  }, [dateParams, loadResource]);

  const loadAnalysis = useCallback(() => {
    const p = dateParams(); p.set("type", "analysis");
    return loadResource("analysis", p, setAnalysisLogs);
  }, [dateParams, loadResource]);

  const loadExtLogs = useCallback(() => {
    const p = dateParams(); p.set("type", "extension");
    return loadResource("extension", p, setExtLogs);
  }, [dateParams, loadResource]);

  const loadJobs = useCallback(() => {
    const p = dateParams(); p.set("type", "jobs");
    if (platformFilter) p.set("platform", platformFilter);
    if (statusFilter) p.set("status", statusFilter);
    return loadResource("jobs", p, setJobs);
  }, [dateParams, platformFilter, statusFilter, loadResource]);

  useEffect(() => { loadScans(); loadAnalysis(); loadExtLogs(); }, [loadScans, loadAnalysis, loadExtLogs]);
  useEffect(() => { loadJobs(); }, [loadJobs]);

  async function handleDelete(type: ResourceKey, ids: Set<number>) {
    if (ids.size === 0) return;
    if (!confirm(`Permanently delete ${ids.size} selected ${RESOURCE_LABEL[type]}?`)) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/logs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, ids: Array.from(ids) }),
      });
      if (!res.ok) throw new Error(`Delete failed (server responded ${res.status})`);
      if (type === "jobs") { setSelectedJobs(new Set()); await Promise.all([loadJobs(), loadAnalysis()]); }
      if (type === "analysis") { setSelectedAnalysis(new Set()); await loadAnalysis(); }
      if (type === "scans") { setSelectedScans(new Set()); await loadScans(); }
      if (type === "extension") { setSelectedExt(new Set()); await loadExtLogs(); }
    } catch (err: any) {
      alert(err?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  function toggleSet(set: Set<number>, id: number): Set<number> {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  }

  function toggleAll(set: Set<number>, allIds: number[]): Set<number> {
    return set.size === allIds.length && allIds.length > 0 ? new Set() : new Set(allIds);
  }

  // Picks the right table body: a single state row while loading / errored /
  // empty, otherwise the data rows. Rows stay visible during a refresh that
  // already has data — the refresh button's spinner signals the reload.
  function renderBody<T>(
    key: ResourceKey,
    rows: T[],
    colSpan: number,
    emptyText: string,
    onRetry: () => void,
    renderRow: (row: T) => ReactNode,
  ): ReactNode {
    if (errors[key] || rows.length === 0) {
      return <TableStateRow colSpan={colSpan} loading={loading[key]} error={errors[key]} emptyText={emptyText} onRetry={onRetry} />;
    }
    return rows.map(renderRow);
  }

  const tabStyle = (active: boolean) => ({
    display: "flex", alignItems: "center", gap: "0.4rem",
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
    borderRadius: "4px", fontSize: "0.7rem", cursor: deleting ? "default" : "pointer" as const, opacity: deleting ? 0.5 : 1,
  };
  const thStyle = { padding: "0.5rem 0.6rem", textAlign: "left" as const, fontSize: "0.7rem", fontWeight: 600, color: "#6b7280" };
  const tdStyle = { padding: "0.4rem 0.6rem", fontSize: "0.75rem" };
  const smText = { ...tdStyle, fontSize: "0.7rem", color: "#6b7280" };
  const toolbarStyle = { display: "flex", gap: "0.5rem", marginBottom: "0.75rem", alignItems: "center", flexWrap: "wrap" as const };
  const rightGroup = { marginLeft: "auto", display: "flex", gap: "0.5rem", alignItems: "center" };
  const cardStyle = { background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "auto" as const };
  const errDot = { display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#ef4444" };
  const tableStyle = { width: "100%", borderCollapse: "collapse" as const };
  const headRow = { borderBottom: "1px solid #e5e7eb", background: "#f9fafb" };

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>Logs</h1>
      <p style={{ fontSize: "0.78rem", color: "#6b7280", margin: "0 0 0.9rem" }}>
        Scraped jobs, AI analysis, scan runs and extension activity. The date range applies to every tab.
      </p>

      {/* Date range filter */}
      <div style={{ ...toolbarStyle, marginBottom: "0.75rem" }}>
        <label style={{ fontSize: "0.7rem", color: "#6b7280" }}>From</label>
        <input type="date" style={inputStyle} value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <label style={{ fontSize: "0.7rem", color: "#6b7280" }}>To</label>
        <input type="date" style={inputStyle} value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        {(dateFrom || dateTo) && (
          <button style={{ ...inputStyle, cursor: "pointer", background: "#f3f4f6" }} onClick={() => { setDateFrom(""); setDateTo(""); }}>Clear dates</button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <button style={tabStyle(tab === "jobs")} onClick={() => setTab("jobs")}>
          All Jobs{errors.jobs && <span style={errDot} title="Failed to load" />}
        </button>
        <button style={tabStyle(tab === "analysis")} onClick={() => setTab("analysis")}>
          AI Analysis{errors.analysis && <span style={errDot} title="Failed to load" />}
        </button>
        <button style={tabStyle(tab === "scans")} onClick={() => setTab("scans")}>
          Scan Logs{errors.scans && <span style={errDot} title="Failed to load" />}
        </button>
        <button style={tabStyle(tab === "extension")} onClick={() => setTab("extension")}>
          Extension Logs{errors.extension && <span style={errDot} title="Failed to load" />}
        </button>
      </div>

      {/* JOBS TAB */}
      {tab === "jobs" && (
        <div>
          <div style={toolbarStyle}>
            <select style={inputStyle} value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
              <option value="">All Platforms</option>
              <option value="linkedin">LinkedIn</option>
              <option value="remoteok">RemoteOK</option>
              <option value="weworkremotely">We Work Remotely</option>
              <option value="jobicy">Jobicy</option>
              <option value="greenhouse">Greenhouse</option>
              <option value="mygreenhouse">MyGreenhouse</option>
              <option value="lever">Lever</option>
            </select>
            <select style={inputStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PENDING">Pending</option>
            </select>
            <Count loading={loading.jobs} n={jobs.length} one="job" many="jobs" cap={ROW_CAP.jobs} />
            <div style={rightGroup}>
              {selectedJobs.size > 0 && (
                <button style={delBtnStyle} disabled={deleting} onClick={() => handleDelete("jobs", selectedJobs)}>
                  {deleting ? "Deleting…" : `Delete ${selectedJobs.size} selected`}
                </button>
              )}
              <RefreshButton loading={loading.jobs} onClick={loadJobs} />
            </div>
          </div>
          <div style={cardStyle}>
            <table className="logs-table" style={{ ...tableStyle, minWidth: "950px" }}>
              <thead>
                <tr style={headRow}>
                  <th style={thStyle}>
                    <input type="checkbox" checked={selectedJobs.size === jobs.length && jobs.length > 0}
                      onChange={() => setSelectedJobs(toggleAll(selectedJobs, jobs.map(j => j.id)))} />
                  </th>
                  {["Platform", "Title", "Company", "Location", "Manual apply", "Status", "Score", "Reason", "Date"].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {renderBody("jobs", jobs, 10, "No jobs found.", loadJobs, (job) => (
                  <tr key={job.id} style={{ borderBottom: "1px solid #f3f4f6", background: selectedJobs.has(job.id) ? "#eff6ff" : undefined }}>
                    <td style={tdStyle}><input type="checkbox" checked={selectedJobs.has(job.id)} onChange={() => setSelectedJobs(toggleSet(selectedJobs, job.id))} /></td>
                    <td style={tdStyle}>
                      <span style={{ padding: "0.1rem 0.3rem", background: job.platform === "linkedin" ? "#0a66c2" : "#6b7280", color: "white", borderRadius: "3px", fontSize: "0.65rem" }}>{job.platform}</span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 500, maxWidth: "200px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", minWidth: 0 }}>
                        <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>{job.title}</a>
                        <CopyUrlBtn value={job.url} title="Copy job URL" />
                      </div>
                    </td>
                    <td style={tdStyle}>{job.company}</td>
                    <td style={smText}>{job.location || "-"}</td>
                    <td style={{ ...smText, maxWidth: "200px" }}>
                      <ManualApplyCell job={job} />
                    </td>
                    <td style={tdStyle}><span style={statusBadge(job.status)}>{job.status}</span></td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: job.aiScore && job.aiScore >= 60 ? "#16a34a" : "#dc2626" }}>{job.aiScore ?? "-"}</td>
                    <td style={{ ...smText, maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={job.aiReason || ""}>{job.aiReason || "-"}</td>
                    <td style={smText}>{new Date(job.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ANALYSIS TAB */}
      {tab === "analysis" && (
        <div>
          <div style={toolbarStyle}>
            <Count loading={loading.analysis} n={analysisLogs.length} one="entry" many="entries" cap={ROW_CAP.analysis} />
            <div style={rightGroup}>
              {selectedAnalysis.size > 0 && (
                <button style={delBtnStyle} disabled={deleting} onClick={() => handleDelete("analysis", selectedAnalysis)}>
                  {deleting ? "Deleting…" : `Delete ${selectedAnalysis.size} selected`}
                </button>
              )}
              <RefreshButton loading={loading.analysis} onClick={loadAnalysis} />
            </div>
          </div>
          <div style={cardStyle}>
            <table className="logs-table" style={{ ...tableStyle, minWidth: "950px" }}>
              <thead>
                <tr style={headRow}>
                  <th style={thStyle}>
                    <input type="checkbox" checked={selectedAnalysis.size === analysisLogs.length && analysisLogs.length > 0}
                      onChange={() => setSelectedAnalysis(toggleAll(selectedAnalysis, analysisLogs.map(l => l.id)))} />
                  </th>
                  {["Platform", "Title", "Company", "Model", "Score", "Result", "Reason", "Tokens", "Date"].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {renderBody("analysis", analysisLogs, 10, "No analysis logs yet.", loadAnalysis, (log) => (
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
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SCANS TAB */}
      {tab === "scans" && (
        <div>
          <div style={toolbarStyle}>
            <Count loading={loading.scans} n={scanLogs.length} one="scan" many="scans" cap={ROW_CAP.scans} />
            <div style={rightGroup}>
              {selectedScans.size > 0 && (
                <button style={delBtnStyle} disabled={deleting} onClick={() => handleDelete("scans", selectedScans)}>
                  {deleting ? "Deleting…" : `Delete ${selectedScans.size} selected`}
                </button>
              )}
              <RefreshButton loading={loading.scans} onClick={loadScans} />
            </div>
          </div>
          <div style={cardStyle}>
            <table className="logs-table" style={tableStyle}>
              <thead>
                <tr style={headRow}>
                  <th style={thStyle}>
                    <input type="checkbox" checked={selectedScans.size === scanLogs.length && scanLogs.length > 0}
                      onChange={() => setSelectedScans(toggleAll(selectedScans, scanLogs.map(l => l.id)))} />
                  </th>
                  {["Board", "Found", "Saved", "Duration", "Errors", "Date"].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {renderBody("scans", scanLogs, 7, "No scan logs yet.", loadScans, (log) => (
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
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EXTENSION TAB */}
      {tab === "extension" && (
        <div>
          <div style={toolbarStyle}>
            <Count loading={loading.extension} n={extLogs.length} one="entry" many="entries" cap={ROW_CAP.extension} />
            <div style={rightGroup}>
              {selectedExt.size > 0 && (
                <button style={delBtnStyle} disabled={deleting} onClick={() => handleDelete("extension", selectedExt)}>
                  {deleting ? "Deleting…" : `Delete ${selectedExt.size} selected`}
                </button>
              )}
              <RefreshButton loading={loading.extension} onClick={loadExtLogs} />
            </div>
          </div>
          <div style={cardStyle}>
            <table className="logs-table" style={{ ...tableStyle, minWidth: "700px" }}>
              <thead>
                <tr style={headRow}>
                  <th style={thStyle}>
                    <input type="checkbox" checked={selectedExt.size === extLogs.length && extLogs.length > 0}
                      onChange={() => setSelectedExt(toggleAll(selectedExt, extLogs.map(l => l.id)))} />
                  </th>
                  {["Level", "Message", "Session", "Date"].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {renderBody("extension", extLogs, 5, 'No extension logs yet. Enable "Send logs to server" in the extension.', loadExtLogs, (log) => (
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
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
