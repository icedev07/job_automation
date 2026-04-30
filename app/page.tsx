"use client";

import { useEffect, useState } from "react";
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
  createdAt: string;
};

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== "ALL") params.set("status", filter);
    params.set("page", String(page));
    params.set("limit", "50");
    fetch(`/api/scraped-jobs?${params}`).then((r) => r.json()).then((data) => {
      setJobs(data.jobs);
      setTotal(data.total);
    });
  }, [filter, page]);

  const statusColor: Record<string, string> = {
    PENDING: "#d97706",
    APPROVED: "#16a34a",
    REJECTED: "#dc2626",
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Job Finder</h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
            {total} jobs found
          </p>
        </div>
        <Link href="/admin" style={{ padding: "0.4rem 1rem", background: "#111827", color: "white", textDecoration: "none", borderRadius: "4px", fontSize: "0.85rem" }}>
          Admin
        </Link>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); setPage(1); }}
            style={{
              padding: "0.35rem 0.75rem",
              background: filter === s ? "#1d4ed8" : "white",
              color: filter === s ? "white" : "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.8rem",
              fontWeight: filter === s ? 600 : 400,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
              {["Title", "Company", "Location", "Source", "Score", "Tech Stack", "Status", "Date"].map((h) => (
                <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "left", fontSize: "0.7rem", fontWeight: 600, color: "#6b7280" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem" }}>
                  <a href={job.url} target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8", textDecoration: "none" }}>
                    {job.title}
                  </a>
                </td>
                <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem" }}>{job.company}</td>
                <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem", color: "#6b7280" }}>{job.location || "-"}</td>
                <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem" }}>{job.platform}</td>
                <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.8rem", fontWeight: 600, color: (job.aiScore || 0) >= 60 ? "#16a34a" : "#6b7280" }}>
                  {job.aiScore ?? "-"}
                </td>
                <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.7rem", color: "#6b7280", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {job.techStack || "-"}
                </td>
                <td style={{ padding: "0.5rem 0.75rem" }}>
                  <span style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem", borderRadius: "9999px", color: "white", background: statusColor[job.status] || "#6b7280" }}>
                    {job.status}
                  </span>
                </td>
                <td style={{ padding: "0.5rem 0.75rem", fontSize: "0.7rem", color: "#6b7280" }}>
                  {new Date(job.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr><td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>No jobs found. Run a scan from the Admin panel.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {total > 50 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1rem" }}>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} style={{ padding: "0.3rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "4px", background: "white", cursor: "pointer", fontSize: "0.8rem" }}>Previous</button>
          <span style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem", color: "#6b7280" }}>Page {page}</span>
          <button disabled={page * 50 >= total} onClick={() => setPage(page + 1)} style={{ padding: "0.3rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "4px", background: "white", cursor: "pointer", fontSize: "0.8rem" }}>Next</button>
        </div>
      )}
    </div>
  );
}
