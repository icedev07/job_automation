"use client";

import { useEffect, useState } from "react";

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

export default function LogsPage() {
  const [tab, setTab] = useState<"jobs" | "analysis" | "scans">("jobs");
  const [scanLogs, setScanLogs] = useState<ScanLogEntry[]>([]);
  const [analysisLogs, setAnalysisLogs] = useState<AnalysisLogEntry[]>([]);
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const [platformFilter, setPlatformFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetch("/api/admin/logs?type=scans").then((r) => r.json()).then(setScanLogs);
    fetch("/api/admin/logs?type=analysis").then((r) => r.json()).then(setAnalysisLogs);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("type", "jobs");
    if (platformFilter) params.set("platform", platformFilter);
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/logs?${params}`).then((r) => r.json()).then(setJobs);
  }, [platformFilter, statusFilter]);

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

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = { APPROVED: "#16a34a", REJECTED: "#dc2626", PENDING: "#d97706" };
    return { fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: "9999px", color: "white", background: colors[status] || "#6b7280" };
  };

  const selectStyle = { padding: "0.3rem 0.5rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.75rem" };

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>Logs</h1>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button style={tabStyle(tab === "jobs")} onClick={() => setTab("jobs")}>All Jobs</button>
        <button style={tabStyle(tab === "analysis")} onClick={() => setTab("analysis")}>AI Analysis</button>
        <button style={tabStyle(tab === "scans")} onClick={() => setTab("scans")}>Scan Logs</button>
      </div>

      {tab === "jobs" && (
        <div>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <select style={selectStyle} value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
              <option value="">All Platforms</option>
              <option value="linkedin">LinkedIn</option>
              <option value="jobright">Jobright</option>
              <option value="ziprecruiter">ZipRecruiter</option>
              <option value="glassdoor">Glassdoor</option>
              <option value="dice">Dice</option>
              <option value="simplify">Simplify</option>
            </select>
            <select style={selectStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PENDING">Pending</option>
            </select>
            <span style={{ fontSize: "0.75rem", color: "#6b7280", alignSelf: "center" }}>{jobs.length} jobs shown</span>
          </div>
          <div style={{ background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
                  {["Platform", "Title", "Company", "Location", "Status", "Score", "Rejection Reason", "Date"].map((h) => (
                    <th key={h} style={{ padding: "0.5rem 0.6rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 600, color: "#6b7280" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.4rem 0.6rem", fontSize: "0.75rem" }}>
                      <span style={{ padding: "0.1rem 0.3rem", background: job.platform === "linkedin" ? "#0a66c2" : "#6b7280", color: "white", borderRadius: "3px", fontSize: "0.65rem" }}>
                        {job.platform}
                      </span>
                    </td>
                    <td style={{ padding: "0.4rem 0.6rem", fontSize: "0.75rem", fontWeight: 500, maxWidth: "200px" }}>
                      <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8", textDecoration: "none" }}>
                        {job.title}
                      </a>
                    </td>
                    <td style={{ padding: "0.4rem 0.6rem", fontSize: "0.75rem" }}>{job.company}</td>
                    <td style={{ padding: "0.4rem 0.6rem", fontSize: "0.7rem", color: "#6b7280" }}>{job.location || "-"}</td>
                    <td style={{ padding: "0.4rem 0.6rem" }}><span style={statusBadge(job.status)}>{job.status}</span></td>
                    <td style={{ padding: "0.4rem 0.6rem", fontSize: "0.8rem", fontWeight: 600, color: job.aiScore && job.aiScore >= 60 ? "#16a34a" : "#dc2626" }}>
                      {job.aiScore ?? "-"}
                    </td>
                    <td style={{ padding: "0.4rem 0.6rem", fontSize: "0.7rem", color: "#6b7280", maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        title={job.aiReason || ""}>
                      {job.aiReason || "-"}
                    </td>
                    <td style={{ padding: "0.4rem 0.6rem", fontSize: "0.7rem", color: "#6b7280" }}>{new Date(job.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {jobs.length === 0 && <tr><td colSpan={8} style={{ padding: "1rem", color: "#6b7280", textAlign: "center" }}>No jobs found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "analysis" && (
        <div style={{ background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
                {["Platform", "Title", "Company", "Model", "Score", "Result", "Reason", "Tokens", "Date"].map((h) => (
                  <th key={h} style={{ padding: "0.5rem 0.6rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 600, color: "#6b7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {analysisLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.4rem 0.6rem", fontSize: "0.7rem" }}>
                    <span style={{ padding: "0.1rem 0.3rem", background: log.scrapedJob?.platform === "linkedin" ? "#0a66c2" : "#6b7280", color: "white", borderRadius: "3px", fontSize: "0.65rem" }}>
                      {log.scrapedJob?.platform || "-"}
                    </span>
                  </td>
                  <td style={{ padding: "0.4rem 0.6rem", fontSize: "0.75rem", fontWeight: 500, maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {log.scrapedJob ? (
                      <a href={log.scrapedJob.url} target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8", textDecoration: "none" }}>
                        {log.scrapedJob.title}
                      </a>
                    ) : `#${log.scrapedJobId}`}
                  </td>
                  <td style={{ padding: "0.4rem 0.6rem", fontSize: "0.75rem" }}>{log.scrapedJob?.company || "-"}</td>
                  <td style={{ padding: "0.4rem 0.6rem", fontSize: "0.7rem", fontFamily: "monospace" }}>{log.model}</td>
                  <td style={{ padding: "0.4rem 0.6rem", fontSize: "0.8rem", fontWeight: 600 }}>{log.score ?? "-"}</td>
                  <td style={{ padding: "0.4rem 0.6rem" }}>
                    <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: "9999px", color: "white", background: log.approved ? "#16a34a" : "#dc2626" }}>
                      {log.approved ? "APPROVED" : "REJECTED"}
                    </span>
                  </td>
                  <td style={{ padding: "0.4rem 0.6rem", fontSize: "0.7rem", color: "#6b7280", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      title={log.reason || ""}>{log.reason || "-"}</td>
                  <td style={{ padding: "0.4rem 0.6rem", fontSize: "0.75rem" }}>{log.tokensUsed ?? "-"}</td>
                  <td style={{ padding: "0.4rem 0.6rem", fontSize: "0.7rem", color: "#6b7280" }}>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {analysisLogs.length === 0 && <tr><td colSpan={9} style={{ padding: "1rem", color: "#6b7280", textAlign: "center" }}>No analysis logs yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

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
              {scanLogs.length === 0 && <tr><td colSpan={6} style={{ padding: "1rem", color: "#6b7280", textAlign: "center" }}>No scan logs yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
