"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type Job = {
  id: number;
  platform: string;
  title: string;
  company: string;
  location: string | null;
  url: string;
  status: string;
  aiScore: number | null;
  aiReason: string | null;
  techStack: string | null;
  salary: string | null;
  description: string | null;
  createdAt: string;
};

type Facets = {
  platforms: { platform: string; count: number }[];
  statuses: { status: string; count: number }[];
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#d97706",
  APPROVED: "#16a34a",
  REJECTED: "#dc2626",
};

const PAGE_SIZES = [10, 25, 50, 100];

const SORT_OPTIONS = [
  { value: "date_desc", label: "Newest first" },
  { value: "date_asc", label: "Oldest first" },
  { value: "score_desc", label: "Score (high → low)" },
  { value: "score_asc", label: "Score (low → high)" },
  { value: "title_asc", label: "Title A→Z" },
  { value: "company_asc", label: "Company A→Z" },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function offsetIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [loading, setLoading] = useState(false);

  // filters
  const [status, setStatus] = useState("ALL");
  const [platform, setPlatform] = useState("ALL");
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minScore, setMinScore] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [expanded, setExpanded] = useState<number | null>(null);

  // hydrate from URL on first load
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.has("status")) setStatus(sp.get("status") || "ALL");
    if (sp.has("platform")) setPlatform(sp.get("platform") || "ALL");
    if (sp.has("q")) setQ(sp.get("q") || "");
    if (sp.has("from")) setFrom(sp.get("from") || "");
    if (sp.has("to")) setTo(sp.get("to") || "");
    if (sp.has("minScore")) setMinScore(sp.get("minScore") || "");
    if (sp.has("sortBy")) setSortBy(sp.get("sortBy") || "date_desc");
    if (sp.has("page")) setPage(Math.max(1, Number(sp.get("page")) || 1));
    if (sp.has("limit")) setLimit(Number(sp.get("limit")) || 25);
  }, []);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  // sync filters to URL (so links are shareable)
  useEffect(() => {
    const sp = new URLSearchParams();
    if (status !== "ALL") sp.set("status", status);
    if (platform !== "ALL") sp.set("platform", platform);
    if (qDebounced) sp.set("q", qDebounced);
    if (from) sp.set("from", from);
    if (to) sp.set("to", to);
    if (minScore) sp.set("minScore", minScore);
    if (sortBy !== "date_desc") sp.set("sortBy", sortBy);
    if (page !== 1) sp.set("page", String(page));
    if (limit !== 25) sp.set("limit", String(limit));
    const qs = sp.toString();
    const newUrl = qs ? `?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [status, platform, qDebounced, from, to, minScore, sortBy, page, limit]);

  // reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [status, platform, qDebounced, from, to, minScore, sortBy, limit]);

  const fetchJobs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status !== "ALL") params.set("status", status);
    if (platform !== "ALL") params.set("platform", platform);
    if (qDebounced) params.set("q", qDebounced);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (minScore) params.set("minScore", minScore);
    params.set("sortBy", sortBy);
    params.set("page", String(page));
    params.set("limit", String(limit));
    params.set("facets", "1");
    fetch(`/api/scraped-jobs?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setJobs(data.jobs || []);
        setTotal(data.total || 0);
        if (data.facets) setFacets(data.facets);
      })
      .finally(() => setLoading(false));
  }, [status, platform, qDebounced, from, to, minScore, sortBy, page, limit]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const resetFilters = () => {
    setStatus("ALL");
    setPlatform("ALL");
    setQ("");
    setFrom("");
    setTo("");
    setMinScore("");
    setSortBy("date_desc");
    setLimit(25);
    setPage(1);
  };

  const hasActiveFilters =
    status !== "ALL" || platform !== "ALL" || qDebounced || from || to || minScore || sortBy !== "date_desc" || limit !== 25;

  const datePresets = [
    { label: "Today", from: todayIso(), to: todayIso() },
    { label: "Last 7 days", from: offsetIso(-7), to: todayIso() },
    { label: "Last 30 days", from: offsetIso(-30), to: todayIso() },
    { label: "All time", from: "", to: "" },
  ];

  const statusCount = (s: string) => facets?.statuses.find((x) => x.status === s)?.count ?? 0;

  function StatusPill({ s, label }: { s: string; label: string }) {
    const active = status === s;
    const color = STATUS_COLORS[s] || "#1d4ed8";
    return (
      <button
        onClick={() => setStatus(s)}
        style={{
          padding: "0.4rem 0.75rem",
          background: active ? color : "white",
          color: active ? "white" : "#374151",
          border: `1px solid ${active ? color : "#d1d5db"}`,
          borderRadius: "999px",
          cursor: "pointer",
          fontSize: "0.78rem",
          fontWeight: active ? 600 : 500,
        }}
      >
        {label}
        {facets && s !== "ALL" && (
          <span style={{ marginLeft: 6, opacity: 0.8, fontSize: "0.7rem" }}>{statusCount(s)}</span>
        )}
      </button>
    );
  }

  const renderPageNumbers = () => {
    const out: (number | "...")[] = [];
    const range = 2;
    const start = Math.max(1, page - range);
    const end = Math.min(totalPages, page + range);
    if (start > 1) {
      out.push(1);
      if (start > 2) out.push("...");
    }
    for (let i = start; i <= end; i++) out.push(i);
    if (end < totalPages) {
      if (end < totalPages - 1) out.push("...");
      out.push(totalPages);
    }
    return out;
  };

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.5rem", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Job Finder</h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
            {loading ? "Loading…" : `${total.toLocaleString()} jobs match`}
            {hasActiveFilters && total > 0 && ` (page ${page}/${totalPages})`}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={fetchJobs}
            style={{ padding: "0.4rem 0.85rem", background: "white", color: "#374151", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.85rem", cursor: "pointer" }}
          >
            Refresh
          </button>
          <Link
            href="/admin"
            style={{ padding: "0.4rem 1rem", background: "#111827", color: "white", textDecoration: "none", borderRadius: "4px", fontSize: "0.85rem" }}
          >
            Admin
          </Link>
        </div>
      </div>

      {/* Status pills */}
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
        <StatusPill s="ALL" label="All" />
        <StatusPill s="APPROVED" label="Approved" />
        <StatusPill s="PENDING" label="Pending" />
        <StatusPill s="REJECTED" label="Rejected" />
      </div>

      {/* Filter toolbar */}
      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.85rem", marginBottom: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "0.75rem" }}>
        <div>
          <label style={labelStyle}>Search</label>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Title, company, tech…"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={inputStyle}>
            <option value="ALL">All platforms</option>
            {facets?.platforms.map((p) => (
              <option key={p.platform} value={p.platform}>
                {p.platform} ({p.count})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} max={to || undefined} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} min={from || undefined} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Min AI Score</label>
          <input
            type="number"
            min={0}
            max={100}
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            placeholder="e.g. 60"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Sort by</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={inputStyle}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Per page</label>
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} style={inputStyle}>
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button
            onClick={resetFilters}
            disabled={!hasActiveFilters}
            style={{
              width: "100%",
              padding: "0.45rem 0.75rem",
              background: hasActiveFilters ? "#fee2e2" : "#f3f4f6",
              color: hasActiveFilters ? "#b91c1c" : "#9ca3af",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              cursor: hasActiveFilters ? "pointer" : "not-allowed",
              fontSize: "0.8rem",
              fontWeight: 500,
            }}
          >
            Reset filters
          </button>
        </div>
      </div>

      {/* Date presets */}
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.72rem", color: "#6b7280", alignSelf: "center", marginRight: "0.25rem" }}>Quick range:</span>
        {datePresets.map((p) => {
          const active = from === p.from && to === p.to;
          return (
            <button
              key={p.label}
              onClick={() => { setFrom(p.from); setTo(p.to); }}
              style={{
                padding: "0.25rem 0.65rem",
                background: active ? "#1d4ed8" : "white",
                color: active ? "white" : "#374151",
                border: "1px solid #d1d5db",
                borderRadius: "999px",
                cursor: "pointer",
                fontSize: "0.72rem",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
              {["", "Title", "Company", "Location", "Source", "Score", "Tech Stack", "Status", "Date"].map((h) => (
                <th key={h} style={{ padding: "0.55rem 0.75rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 600, color: "#6b7280", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const isOpen = expanded === job.id;
              return (
                <RowGroup key={job.id} job={job} isOpen={isOpen} toggle={() => setExpanded(isOpen ? null : job.id)} />
              );
            })}
            {!loading && jobs.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: "2.5rem", textAlign: "center", color: "#6b7280" }}>
                  No jobs match these filters. {hasActiveFilters && (
                    <button onClick={resetFilters} style={{ background: "transparent", border: "none", color: "#1d4ed8", cursor: "pointer", textDecoration: "underline" }}>Reset filters</button>
                  )}
                </td>
              </tr>
            )}
            {loading && (
              <tr>
                <td colSpan={9} style={{ padding: "1.5rem", textAlign: "center", color: "#9ca3af", fontSize: "0.85rem" }}>Loading…</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
          <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>
            Showing {Math.min((page - 1) * limit + 1, total).toLocaleString()}–{Math.min(page * limit, total).toLocaleString()} of {total.toLocaleString()}
          </div>
          <div style={{ display: "flex", gap: "0.25rem", alignItems: "center", flexWrap: "wrap" }}>
            <button disabled={page <= 1} onClick={() => setPage(1)} style={pageBtn(false)}>« First</button>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={pageBtn(false)}>‹ Prev</button>
            {renderPageNumbers().map((p, i) =>
              p === "..." ? (
                <span key={`e${i}`} style={{ padding: "0.3rem 0.4rem", color: "#9ca3af", fontSize: "0.8rem" }}>…</span>
              ) : (
                <button key={p} onClick={() => setPage(p)} style={pageBtn(p === page)}>{p}</button>
              )
            )}
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} style={pageBtn(false)}>Next ›</button>
            <button disabled={page >= totalPages} onClick={() => setPage(totalPages)} style={pageBtn(false)}>Last »</button>
          </div>
        </div>
      )}
    </div>
  );
}

function RowGroup({ job, isOpen, toggle }: { job: Job; isOpen: boolean; toggle: () => void }) {
  const status = job.status || "PENDING";
  const score = job.aiScore ?? null;
  return (
    <>
      <tr style={{ borderBottom: "1px solid #f3f4f6", background: isOpen ? "#f9fafb" : "white", cursor: "pointer" }} onClick={toggle}>
        <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.85rem", color: "#6b7280", width: "1.5rem" }}>
          {isOpen ? "▾" : "▸"}
        </td>
        <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.82rem", maxWidth: 320 }}>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ color: "#1d4ed8", textDecoration: "none", fontWeight: 500, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {job.title}
          </a>
        </td>
        <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.company}</td>
        <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", color: "#6b7280", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.location || "-"}</td>
        <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem" }}>{job.platform}</td>
        <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.82rem", fontWeight: 700, color: scoreColor(score) }}>
          {score ?? "-"}
        </td>
        <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.7rem", color: "#6b7280", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {job.techStack || "-"}
        </td>
        <td style={{ padding: "0.5rem 0.75rem" }}>
          <span style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem", borderRadius: "9999px", color: "white", background: STATUS_COLORS[status] || "#6b7280", fontWeight: 600, letterSpacing: 0.3 }}>
            {status}
          </span>
        </td>
        <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.7rem", color: "#6b7280", whiteSpace: "nowrap" }}>
          {new Date(job.createdAt).toLocaleDateString()}
        </td>
      </tr>
      {isOpen && (
        <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
          <td colSpan={9} style={{ padding: "0.85rem 1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.75rem", fontSize: "0.8rem" }}>
              <div>
                <strong style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>AI Reason</strong>
                <p style={{ margin: "0.25rem 0 0", color: "#1f2937", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                  {job.aiReason || "(no reason recorded)"}
                </p>
              </div>
              {job.salary && (
                <div>
                  <strong style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Salary</strong>
                  <p style={{ margin: "0.25rem 0 0", color: "#1f2937" }}>{job.salary}</p>
                </div>
              )}
              {job.techStack && (
                <div>
                  <strong style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Tech Stack</strong>
                  <p style={{ margin: "0.25rem 0 0", color: "#1f2937" }}>{job.techStack}</p>
                </div>
              )}
              <div>
                <strong style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>Created</strong>
                <p style={{ margin: "0.25rem 0 0", color: "#1f2937" }}>{new Date(job.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: "0.35rem 0.8rem", background: "#1d4ed8", color: "white", textDecoration: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 500 }}
              >
                Open job ↗
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(job.url);
                }}
                style={{ padding: "0.35rem 0.8rem", background: "white", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.75rem", color: "#374151", cursor: "pointer" }}
              >
                Copy URL
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function scoreColor(score: number | null) {
  if (score == null) return "#9ca3af";
  if (score >= 80) return "#15803d";
  if (score >= 60) return "#16a34a";
  if (score >= 30) return "#d97706";
  return "#dc2626";
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.4rem 0.55rem",
  border: "1px solid #d1d5db",
  borderRadius: "4px",
  fontSize: "0.8rem",
  background: "white",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.7rem",
  fontWeight: 600,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: 0.5,
  marginBottom: "0.25rem",
};

function pageBtn(active: boolean): React.CSSProperties {
  return {
    padding: "0.3rem 0.65rem",
    border: `1px solid ${active ? "#1d4ed8" : "#d1d5db"}`,
    borderRadius: "4px",
    background: active ? "#1d4ed8" : "white",
    color: active ? "white" : "#374151",
    cursor: "pointer",
    fontSize: "0.78rem",
    fontWeight: active ? 600 : 500,
    minWidth: "2rem",
  };
}
