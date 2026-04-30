"use client";

import { useEffect, useState } from "react";

type Stats = {
  totalJobs: number;
  totalOneClick: number;
  totalResumes: number;
  totalCoverLetters: number;
  recentScans: { board: string; jobsSaved: number; createdAt: string }[];
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total Jobs", value: stats.totalJobs },
          { label: "1-Click Jobs", value: stats.totalOneClick },
          { label: "Resumes Generated", value: stats.totalResumes },
          { label: "Cover Letters", value: stats.totalCoverLetters },
        ].map((s) => (
          <div key={s.label} style={{ background: "white", padding: "1.25rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "0.25rem" }}>{s.label}</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Recent Scans</h2>
      {stats.recentScans.length === 0 ? (
        <p style={{ color: "#6b7280" }}>No scans yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ padding: "0.5rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280" }}>Board</th>
              <th style={{ padding: "0.5rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280" }}>Jobs Saved</th>
              <th style={{ padding: "0.5rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280" }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentScans.map((s, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>{s.board}</td>
                <td style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>{s.jobsSaved}</td>
                <td style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", color: "#6b7280" }}>{new Date(s.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
