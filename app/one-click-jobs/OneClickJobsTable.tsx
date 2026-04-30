"use client";

import { useState } from "react";
import Link from "next/link";

type OneClickJob = {
  id: number;
  source: string;
  title: string;
  company: string;
  externalUrl: string;
  fullText: string;
  appliedAt: string | null;
  createdAt: string;
};

const SOURCE_LABELS: Record<string, string> = {
  ziprecruiter: "ZipRecruiter",
  linkedin: "LinkedIn",
  himalayas: "Himalayas",
  jobgether: "Jobgether",
  hiringcafe: "HiringCafe",
  simplify: "Simplify",
  manual: "Manual",
  telegram: "Telegram",
};
const SOURCE_OPTIONS = [
  { value: "ziprecruiter", label: "ZipRecruiter" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "himalayas", label: "Himalayas" },
  { value: "jobgether", label: "Jobgether" },
  { value: "hiringcafe", label: "HiringCafe" },
  { value: "simplify", label: "Simplify" },
  { value: "telegram", label: "Telegram" },
  { value: "manual", label: "Manual" },
] as const;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" }) + " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function OneClickJobsTable({ initialJobs, userId }: { initialJobs: OneClickJob[]; userId: number }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", company: "", externalUrl: "", fullText: "", source: "manual" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ title: "", company: "", externalUrl: "", fullText: "" });
  const [adding, setAdding] = useState(false);

  const refetch = async () => {
    const res = await fetch(`/api/one-click-jobs?userId=${userId}`);
    if (res.ok) {
      const data = await res.json();
      setJobs(data);
    }
  };

  const markApplied = async (id: number, applied: boolean) => {
    const res = await fetch(`/api/one-click-jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appliedAt: applied }),
    });
    if (res.ok) {
      const updated = await res.json();
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, appliedAt: updated.appliedAt } : j)));
    }
  };

  const openEdit = (job: OneClickJob) => {
    setEditingId(job.id);
    setEditForm({
      title: job.title,
      company: job.company,
      externalUrl: job.externalUrl,
      fullText: job.fullText,
      source: job.source || "manual",
    });
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditForm({ title: "", company: "", externalUrl: "", fullText: "", source: "manual" });
  };

  const saveEdit = async () => {
    if (editingId == null) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/one-click-jobs/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          company: editForm.company,
          externalUrl: editForm.externalUrl,
          fullText: editForm.fullText,
          source: editForm.source,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setJobs((prev) => prev.map((j) => (j.id === editingId ? { ...j, ...updated } : j)));
        closeEdit();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to update");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (job: OneClickJob) => {
    if (!confirm(`Delete "${job.title}" at ${job.company}? This cannot be undone.`)) return;
    setDeletingId(job.id);
    try {
      const res = await fetch(`/api/one-click-jobs/${job.id}`, { method: "DELETE" });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== job.id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(job.id);
          return next;
        });
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to delete");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = (checked: boolean) => {
    if (checked) setSelectedIds(new Set(jobs.map((j) => j.id)));
    else setSelectedIds(new Set());
  };

  const handleBatchDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} selected job(s)? This cannot be undone.`)) return;
    setBatchDeleting(true);
    try {
      const res = await fetch("/api/one-click-jobs/batch-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => !selectedIds.has(j.id)));
        setSelectedIds(new Set());
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to delete");
      }
    } finally {
      setBatchDeleting(false);
    }
  };

  const openAdd = () => {
    setAddForm({ title: "", company: "", externalUrl: "", fullText: "" });
    setAddOpen(true);
  };

  const closeAdd = () => {
    setAddOpen(false);
  };

  const saveAdd = async () => {
    if (!addForm.title.trim() || !addForm.company.trim() || !addForm.externalUrl.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/one-click-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title: addForm.title.trim(),
          company: addForm.company.trim(),
          externalUrl: addForm.externalUrl.trim(),
          fullText: addForm.fullText,
          source: "manual",
        }),
      });
      if (res.ok) {
        const job = await res.json();
        setJobs((prev) => [{ ...job, appliedAt: null }, ...prev]);
        closeAdd();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to add job");
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>{jobs.length} job(s)</span>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            type="button"
            onClick={openAdd}
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid #10b981",
              borderRadius: "4px",
              backgroundColor: "#10b981",
              color: "white",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Add job
          </button>
          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={handleBatchDelete}
              disabled={batchDeleting}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #dc2626",
                borderRadius: "4px",
                backgroundColor: "white",
                color: "#dc2626",
                cursor: batchDeleting ? "wait" : "pointer",
                fontSize: "0.875rem",
              }}
            >
              {batchDeleting ? "Deleting…" : `Delete selected (${selectedIds.size})`}
            </button>
          )}
          <button
            type="button"
            onClick={refetch}
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              backgroundColor: "white",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            Refresh
          </button>
        </div>
      </div>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "#fff",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <thead style={{ backgroundColor: "#f3f4f6" }}>
          <tr>
            <th style={{ padding: "0.75rem", width: "2.5rem" }}>
              <input
                type="checkbox"
                checked={jobs.length > 0 && selectedIds.size === jobs.length}
                onChange={(e) => selectAll(e.target.checked)}
                title="Select all"
              />
            </th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Date</th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Company</th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Title</th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Source</th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Applied</th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} style={{ borderTop: "1px solid #e5e7eb" }}>
              <td style={{ padding: "0.75rem" }}>
                <input
                  type="checkbox"
                  checked={selectedIds.has(job.id)}
                  onChange={() => toggleSelect(job.id)}
                />
              </td>
              <td style={{ padding: "0.75rem" }}>{formatDate(job.createdAt)}</td>
              <td style={{ padding: "0.75rem" }}>{job.company}</td>
              <td style={{ padding: "0.75rem" }}>{job.title}</td>
              <td style={{ padding: "0.75rem" }}>
                <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", backgroundColor: "#e5e7eb", color: "#374151" }}>
                  {SOURCE_LABELS[job.source] || job.source}
                </span>
              </td>
              <td style={{ padding: "0.75rem" }}>
                <span style={{ color: job.appliedAt ? "#166534" : "#6b7280" }}>{job.appliedAt ? "Yes" : "No"}</span>
              </td>
              <td style={{ padding: "0.75rem" }}>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <Link
                    href={job.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "0.25rem 0.75rem",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      textDecoration: "none",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                    }}
                  >
                    Open & apply
                  </Link>
                  <button
                    type="button"
                    onClick={() => markApplied(job.id, !job.appliedAt)}
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      ...(job.appliedAt
                        ? {
                            border: "1px solid #16a34a",
                            backgroundColor: "#dcfce7",
                            color: "#166534",
                          }
                        : {
                            border: "1px solid #d1d5db",
                            backgroundColor: "#f3f4f6",
                            color: "#374151",
                          }),
                    }}
                  >
                    {job.appliedAt ? "Applied" : "Mark applied"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(job)}
                    style={{
                      padding: "0.25rem 0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      backgroundColor: "white",
                      cursor: "pointer",
                      fontSize: "0.875rem",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(job)}
                    disabled={deletingId === job.id}
                    style={{
                      padding: "0.25rem 0.75rem",
                      border: "1px solid #dc2626",
                      borderRadius: "4px",
                      backgroundColor: "white",
                      color: "#dc2626",
                      cursor: deletingId === job.id ? "wait" : "pointer",
                      fontSize: "0.875rem",
                    }}
                  >
                    {deletingId === job.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editingId != null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={closeEdit}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "2rem",
              maxWidth: "900px",
              maxHeight: "90vh",
              width: "90%",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.5rem", fontWeight: 600 }}>
              Edit 1-Click Job
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", overflow: "auto", flex: 1 }}>
              {/* Job Title */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>
                  Job Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                  }}
                  placeholder="Enter job title"
                />
              </div>

              {/* Company */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>
                  Company *
                </label>
                <input
                  type="text"
                  value={editForm.company}
                  onChange={(e) => setEditForm((f) => ({ ...f, company: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                  }}
                  placeholder="Enter company name"
                />
              </div>

              {/* External URL */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>
                  Application URL *
                </label>
                <input
                  type="text"
                  value={editForm.externalUrl}
                  onChange={(e) => setEditForm((f) => ({ ...f, externalUrl: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                  }}
                  placeholder="Enter application URL"
                />
              </div>

              {/* Job source */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>
                  Job source
                </label>
                <select
                  value={editForm.source}
                  onChange={(e) => setEditForm((f) => ({ ...f, source: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                  }}
                >
                  {SOURCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Job Description */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "300px" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>
                  Job Description
                </label>
                <textarea
                  value={editForm.fullText}
                  onChange={(e) => setEditForm((f) => ({ ...f, fullText: e.target.value }))}
                  placeholder="Enter job description..."
                  style={{
                    width: "100%",
                    minHeight: "300px",
                    padding: "1rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                    fontFamily: "monospace",
                    resize: "vertical",
                    flex: 1,
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={saving}
                  style={{
                    padding: "0.5rem 1.5rem",
                    backgroundColor: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: saving ? "not-allowed" : "pointer",
                    opacity: saving ? 0.6 : 1,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={saving || !editForm.title.trim() || !editForm.company.trim() || !editForm.externalUrl.trim()}
                  style={{
                    padding: "0.5rem 1.5rem",
                    backgroundColor: saving || !editForm.title.trim() || !editForm.company.trim() || !editForm.externalUrl.trim()
                      ? "#9ca3af"
                      : "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: saving || !editForm.title.trim() || !editForm.company.trim() || !editForm.externalUrl.trim()
                      ? "not-allowed"
                      : "pointer",
                    opacity: saving || !editForm.title.trim() || !editForm.company.trim() || !editForm.externalUrl.trim() ? 0.6 : 1,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {addOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={closeAdd}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "2rem",
              maxWidth: "900px",
              maxHeight: "90vh",
              width: "90%",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.5rem", fontWeight: 600 }}>
              Add 1-Click Job
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", overflow: "auto", flex: 1 }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>
                  Job Title *
                </label>
                <input
                  type="text"
                  value={addForm.title}
                  onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                  }}
                  placeholder="Enter job title"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>
                  Company *
                </label>
                <input
                  type="text"
                  value={addForm.company}
                  onChange={(e) => setAddForm((f) => ({ ...f, company: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                  }}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>
                  Application URL *
                </label>
                <input
                  type="text"
                  value={addForm.externalUrl}
                  onChange={(e) => setAddForm((f) => ({ ...f, externalUrl: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                  }}
                  placeholder="Enter application URL"
                />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "200px" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>
                  Job Description (optional)
                </label>
                <textarea
                  value={addForm.fullText}
                  onChange={(e) => setAddForm((f) => ({ ...f, fullText: e.target.value }))}
                  placeholder="Paste job description..."
                  style={{
                    width: "100%",
                    minHeight: "200px",
                    padding: "1rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                    fontFamily: "monospace",
                    resize: "vertical",
                    flex: 1,
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={closeAdd}
                  disabled={adding}
                  style={{
                    padding: "0.5rem 1.5rem",
                    backgroundColor: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: adding ? "not-allowed" : "pointer",
                    opacity: adding ? 0.6 : 1,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveAdd}
                  disabled={adding || !addForm.title.trim() || !addForm.company.trim() || !addForm.externalUrl.trim()}
                  style={{
                    padding: "0.5rem 1.5rem",
                    backgroundColor:
                      adding || !addForm.title.trim() || !addForm.company.trim() || !addForm.externalUrl.trim()
                        ? "#9ca3af"
                        : "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor:
                      adding || !addForm.title.trim() || !addForm.company.trim() || !addForm.externalUrl.trim()
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      adding || !addForm.title.trim() || !addForm.company.trim() || !addForm.externalUrl.trim()
                        ? 0.6
                        : 1,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  {adding ? "Adding…" : "Add job"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {jobs.length === 0 && (
        <p style={{ padding: "2rem", color: "#6b7280", textAlign: "center" }}>
          No 1-Click jobs yet. Run the ZipRecruiter scanner, add one manually with &quot;Add job&quot;, or paste Easy Apply jobs here.
        </p>
      )}
    </div>
  );
}
