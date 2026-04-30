"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 25;

type JobTypeValue = "REMOTE" | "HYBRID" | "ONSITE";

type Job = {
  id: number;
  title: string;
  company: string;
  source: string;
  externalUrl: string;
  jobType?: JobTypeValue;
  invitedToInterview: boolean;
  createdAt: string;
  jobrightMatchScore: number | null;
  hasDescription: boolean;
  hasResume: boolean;
  hasCoverLetter: boolean;
};

const JOB_TYPE_OPTIONS: { value: JobTypeValue; label: string }[] = [
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ONSITE", label: "On-site" },
];

function getJobTypeLabel(jobType: JobTypeValue | undefined): string {
  if (!jobType) return "Remote";
  const opt = JOB_TYPE_OPTIONS.find((o) => o.value === jobType);
  return opt ? opt.label : jobType;
}

const SOURCE_OPTIONS = [
  { value: "ziprecruiter", label: "ZipRecruiter" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "himalayas", label: "Himalayas" },
  { value: "jobright", label: "Jobright" },
  { value: "jobgether", label: "Jobgether" },
  { value: "hiringcafe", label: "HiringCafe" },
  { value: "weworkremotely", label: "We Work Remotely" },
  { value: "remoteineurope", label: "Remote in Europe" },
  { value: "euremotejobs", label: "EU Remote Jobs" },
  { value: "otta", label: "Otta" },
  { value: "simplify", label: "Simplify" },
  { value: "dice", label: "Dice" },
  { value: "glassdoor", label: "Glassdoor" },
  { value: "telegram", label: "Telegram" },
] as const;

function getSourceLabel(source: string | null | undefined): string {
  if (!source) return "Jobright";
  const opt = SOURCE_OPTIONS.find((o) => o.value === source);
  return opt ? opt.label : source;
}

/** Format for UI: "2/10 11:12" (month/day hour:minute) */
function formatJobDateTime(isoString: string): string {
  const d = new Date(isoString);
  const datePart = d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" });
  const timePart = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${datePart} ${timePart}`;
}

/** Slug for CSV filename; align with app convention userId 1 = Jiayong, 2 = Mohan. */
function csvExportPersonSlug(userId: number): string {
  const map: Record<number, string> = { 1: "jiayong", 2: "mohan" };
  const s = map[userId];
  if (s) return s;
  return `user-${userId}`;
}

export default function JobsTable({ initialJobs, userId }: { initialJobs: Job[]; userId: number }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    company: "",
    externalUrl: "",
    description: "",
    source: "ziprecruiter",
    jobType: "REMOTE" as JobTypeValue,
    invitedToInterview: false,
  });
  const [interviewFilter, setInterviewFilter] = useState<string>("all"); // "all", "yes", "no"
  const [loadingEditForm, setLoadingEditForm] = useState(false);
  const [savingEditForm, setSavingEditForm] = useState(false);
  const [generatingDocsForId, setGeneratingDocsForId] = useState<number | null>(null);
  const [resettingDocsForId, setResettingDocsForId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showAddManual, setShowAddManual] = useState(false);
  const [addForm, setAddForm] = useState({
    title: "",
    company: "",
    externalUrl: "",
    description: "",
    source: "ziprecruiter",
    jobType: "REMOTE" as JobTypeValue,
  });
  const [addingJob, setAddingJob] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const handleEdit = async (job: Job) => {
    setEditingId(job.id);
    setLoadingEditForm(true);
    
    // Load job data
    setEditForm({
      title: job.title,
      company: job.company,
      externalUrl: job.externalUrl,
      description: "",
      source: job.source || "ziprecruiter",
      jobType: (job.jobType ?? "REMOTE") as JobTypeValue,
      invitedToInterview: job.invitedToInterview ?? false,
    });

    // Load job description if it exists
    try {
      const response = await fetch(`/api/jobs/${job.id}/description`);
      if (response.ok) {
        const data = await response.json();
        setEditForm(prev => ({ ...prev, description: data.fullText || "" }));
      }
    } catch (error) {
      // Description doesn't exist or error loading - leave empty
    } finally {
      setLoadingEditForm(false);
    }
  };

  const handleSave = async (id: number) => {
    setSavingEditForm(true);
    try {
      // Save job metadata
      const jobResponse = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          company: editForm.company,
          externalUrl: editForm.externalUrl,
          source: editForm.source,
          jobType: editForm.jobType,
          invitedToInterview: editForm.invitedToInterview,
        }),
      });

      if (!jobResponse.ok) {
        throw new Error("Failed to update job");
      }

      const updated = await jobResponse.json();

      // Save job description
      if (editForm.description.trim()) {
        try {
          const descResponse = await fetch(`/api/jobs/${id}/description`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullText: editForm.description }),
          });

          if (!descResponse.ok) {
            console.warn("Failed to update description, but job was updated");
          }
        } catch (error) {
          console.warn("Error updating description:", error);
        }
      }

      // Update local state
      setJobs(jobs.map((j) =>
        j.id === id
          ? {
              ...updated,
              jobType: updated.jobType ?? "REMOTE",
              source: updated.source ?? editForm.source,
              invitedToInterview: updated.invitedToInterview ?? false,
              hasDescription: editForm.description.trim().length > 0,
              hasResume: j.hasResume,
              hasCoverLetter: j.hasCoverLetter,
            }
          : j
      ));
      setEditingId(null);
      alert("✅ Job updated successfully");
    } catch (error: any) {
      alert(`❌ Failed to update job: ${error.message || "Unknown error"}`);
    } finally {
      setSavingEditForm(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({
      title: "",
      company: "",
      externalUrl: "",
      description: "",
      source: "ziprecruiter",
      jobType: "REMOTE",
      invitedToInterview: false,
    });
  };

  const handleAddJobManual = async () => {
    if (!addForm.externalUrl.trim() || !addForm.description.trim()) {
      alert("URL and Job description are required.");
      return;
    }
    setAddingJob(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          title: addForm.title.trim() || "Unknown",
          company: addForm.company.trim() || "Unknown",
          externalUrl: addForm.externalUrl.trim(),
          jobDescription: addForm.description.trim(),
          source: addForm.source,
          jobType: addForm.jobType,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 409 && data.duplicate) {
        setShowAddManual(false);
        setAddForm({ title: "", company: "", externalUrl: "", description: "", source: "ziprecruiter", jobType: "REMOTE" });
        const listRes = await fetch(`/api/jobs?userId=${userId}&_=${Date.now()}`, { cache: "no-store" });
        if (listRes.ok) setJobs(await listRes.json());
        const detail = data.existingLabel ? `\n\nExisting: ${data.existingLabel}` : "";
        alert(`⚠️ Duplicate job\n\n${data.message || "This job already exists in your list."}${detail}`);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to add job");
      }
      const newJob = data;
      const listRes = await fetch(`/api/jobs?userId=${userId}&_=${Date.now()}`, { cache: "no-store" });
      if (listRes.ok) {
        const list = await listRes.json();
        setJobs(list);
        setInterviewFilter("all");
        setSearchTerm("");
      } else {
        setJobs((prev) => [newJob, ...prev]);
        setInterviewFilter("all");
      }
      setShowAddManual(false);
      setAddForm({ title: "", company: "", externalUrl: "", description: "", source: "ziprecruiter", jobType: "REMOTE" });
      alert("✅ Job added. You can generate resume & cover letter from the Actions column.");
    } catch (e: any) {
      alert(`❌ ${e.message || "Failed to add job"}`);
    } finally {
      setAddingJob(false);
    }
  };

  const handleGenerateDocs = async (job: Job) => {
    // Require job description before generating docs
    if (!job.hasDescription) {
      const goToEdit = confirm(
        "This job does not have a description yet.\n\n" +
        "To generate a tailored resume and cover letter, please add a job description first.\n\n" +
        "Do you want to open the Edit form now?"
      );
      if (goToEdit) {
        await handleEdit(job);
      }
      return;
    }

    if (generatingDocsForId === job.id) return;

    setGeneratingDocsForId(job.id);
    try {
      const response = await fetch(`/api/jobs/${job.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to generate documents");
      }

      alert("✅ Resume and cover letter generated successfully");

      // Optimistically update local state to reflect generated docs
      setJobs(jobs.map((j) =>
        j.id === job.id
          ? { ...j, hasResume: true, hasCoverLetter: true }
          : j
      ));
    } catch (error: any) {
      alert(`❌ Failed to generate documents: ${error.message || "Unknown error"}`);
    } finally {
      setGeneratingDocsForId(null);
    }
  };

  const handleResetDocs = async (job: Job) => {
    if (!job.hasResume && !job.hasCoverLetter) return;
    if (resettingDocsForId === job.id) return;

    const ok = confirm(
      `Remove generated resume and cover letter for:\n\n${job.company} — ${job.title}\n\n` +
        "This deletes DB rows and the matching output folder under Resumes (or Resumes_Mohan for Mohan).\n\n" +
        "The job and job description stay. You can run Generate Docs again afterward."
    );
    if (!ok) return;

    setResettingDocsForId(job.id);
    try {
      const response = await fetch(`/api/jobs/${job.id}/documents`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to reset documents");
      }

      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id ? { ...j, hasResume: false, hasCoverLetter: false } : j
        )
      );
      let msg = `✅ Reset complete (removed ${data.deletedTailoredResumes ?? 0} resume(s), ${data.deletedCoverLetters ?? 0} cover letter(s)).`;
      if (data.deletedOutputFolder === true) {
        msg += " Output folder on disk was removed.";
      }
      alert(msg);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      alert(`❌ Failed to reset documents: ${msg}`);
    } finally {
      setResettingDocsForId(null);
    }
  };

  const handleDelete = async (id: number) => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;

    const hasDocs = job.hasResume || job.hasCoverLetter || job.hasDescription;
    const confirmMessage = hasDocs
      ? `Are you sure you want to delete "${job.title}" at ${job.company}?\n\nThis will delete:\n- Job application\n- Job description\n- Generated resumes\n- Generated cover letters\n- All related files\n\nThis action cannot be undone.`
      : `Are you sure you want to delete "${job.title}" at ${job.company}?\n\nThis action cannot be undone.`;

    if (!confirm(confirmMessage)) return;

    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setJobs(jobs.filter((j) => j.id !== id));
        alert("✅ Job and all related data deleted successfully");
      } else {
        const error = await response.json();
        alert(`❌ Failed to delete job: ${error.error || "Unknown error"}`);
      }
    } catch (error: any) {
      alert(`❌ Error deleting job: ${error.message || "Unknown error"}`);
    }
  };

  // Filter jobs by interview and search text
  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    // Filter by invited to interview
    if (interviewFilter !== "all") {
      filtered = filtered.filter((job) =>
        interviewFilter === "yes" ? job.invitedToInterview : !job.invitedToInterview
      );
    }

    // Text search across multiple fields
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter((job) => {
        const dateStr = formatJobDateTime(job.createdAt).toLowerCase();
        const company = job.company.toLowerCase();
        const title = job.title.toLowerCase();
        const source = (job.source || "").toLowerCase();
        const url = job.externalUrl.toLowerCase();
        const jobTypeStr = getJobTypeLabel(job.jobType).toLowerCase();
        const matchScore = job.jobrightMatchScore !== null ? String(job.jobrightMatchScore) : "";

        return (
          company.includes(query) ||
          title.includes(query) ||
          url.includes(query) ||
          dateStr.includes(query) ||
          matchScore.includes(query) ||
          source.includes(query) ||
          jobTypeStr.includes(query)
        );
      });
    }

    return filtered;
  }, [jobs, interviewFilter, searchTerm]);

  const totalFiltered = filteredJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const paginatedJobs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, page, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [interviewFilter, searchTerm, pageSize]);

  const rangeStart = totalFiltered === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalFiltered);

  // Export to CSV
  const handleExportCSV = () => {
    // Column order: time, company, job title, URL, then the rest
    const headers = [
      "Time",
      "Company",
      "Job Title",
      "URL",
      "Job Type",
      "Source",
      "Invited to Interview",
      "Match Score",
      "Description",
      "Resume",
      "Cover Letter",
    ];

    // Helper function to escape CSV values properly
    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return "";
      const stringValue = String(value);
      // If contains comma, quote, or newline, wrap in quotes and escape quotes
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const rows = filteredJobs.map((job) => [
      formatJobDateTime(job.createdAt),
      job.company,
      job.title,
      job.externalUrl,
      getJobTypeLabel(job.jobType),
      getSourceLabel(job.source),
      job.invitedToInterview ? "Yes" : "No",
      job.jobrightMatchScore ? `${job.jobrightMatchScore}%` : "N/A",
      job.hasDescription ? "Yes" : "No",
      job.hasResume ? "Yes" : "No",
      job.hasCoverLetter ? "Yes" : "No",
    ]);

    const rowToCSVLine = (row: any[]) => row.map((cell) => escapeCSV(cell)).join(",");

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map(rowToCSVLine),
    ].join("\n");

    // Add BOM for Excel compatibility (UTF-8 BOM)
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const dateStr = new Date().toISOString().split("T")[0];
    const person = csvExportPersonSlug(userId);
    link.setAttribute("download", `job-applications-${person}-${dateStr}.csv`);
    link.setAttribute("href", url);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <div>
      {/* Filter and Export Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <label htmlFor="interviewFilter" style={{ fontWeight: 500 }}>
              Interview:
            </label>
            <select
              id="interviewFilter"
              value={interviewFilter}
              onChange={(e) => setInterviewFilter(e.target.value)}
              style={{
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "0.875rem",
              }}
            >
              <option value="all">All</option>
              <option value="yes">Invited</option>
              <option value="no">Not invited</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: "220px" }}>
            <label htmlFor="searchJobs" style={{ fontWeight: 500 }}>
              Search:
            </label>
            <input
              id="searchJobs"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search company, title, URL, score..."
              style={{
                flex: 1,
                minWidth: "160px",
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "0.875rem",
              }}
            />
          </div>
          <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            {totalFiltered === 0
              ? "(0 jobs)"
              : totalPages > 1
                ? `(${rangeStart}–${rangeEnd} of ${totalFiltered} jobs)`
                : `(${totalFiltered} ${totalFiltered === 1 ? "job" : "jobs"})`}
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowAddManual(true)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#8b5cf6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            ➕ Add job (manual)
          </button>
          <button
            onClick={handleExportCSV}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            📥 Export to CSV
          </button>
        </div>
      </div>

      {/* Pagination (top) */}
      {totalFiltered > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1rem",
            padding: "0.75rem 0",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              Showing {rangeStart}–{rangeEnd} of {totalFiltered}
            </span>
            <label htmlFor="pageSizeTop" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
              Per page:
            </label>
            <select
              id="pageSizeTop"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              style={{
                padding: "0.35rem 0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "0.875rem",
              }}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{
                padding: "0.35rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                backgroundColor: page <= 1 ? "#f3f4f6" : "white",
                cursor: page <= 1 ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
              }}
            >
              Previous
            </button>
            <span style={{ padding: "0 0.5rem", fontSize: "0.875rem" }}>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{
                padding: "0.35rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                backgroundColor: page >= totalPages ? "#f3f4f6" : "white",
                cursor: page >= totalPages ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

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
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Date</th>
            <th style={{ textAlign: "left", padding: "0.75rem", maxWidth: "150px" }}>Company</th>
            <th style={{ textAlign: "left", padding: "0.75rem", maxWidth: "200px" }}>Job Title</th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Site URL</th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Job Type</th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Source</th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Interview</th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Docs</th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Match Score</th>
            <th style={{ textAlign: "left", padding: "0.75rem" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedJobs.map((job) => (
          <tr key={job.id} style={{ borderTop: "1px solid #e5e7eb" }}>
            {/* Date */}
            <td style={{ padding: "0.75rem" }}>
              {formatJobDateTime(job.createdAt)}
            </td>

            {/* Company */}
            <td style={{ padding: "0.75rem", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {job.company}
            </td>

            {/* Job Title */}
            <td style={{ padding: "0.75rem", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {job.title}
            </td>

            {/* Site URL */}
            <td style={{ padding: "0.75rem" }}>
              <Link
                href={job.externalUrl}
                target="_blank"
                style={{ color: "#2563eb", textDecoration: "underline" }}
              >
                {job.externalUrl.length > 50
                  ? `${job.externalUrl.substring(0, 50)}...`
                  : job.externalUrl}
              </Link>
            </td>

            {/* Job Type */}
            <td style={{ padding: "0.75rem" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  backgroundColor: job.jobType === "REMOTE" ? "#dbeafe" : job.jobType === "HYBRID" ? "#fef3c7" : "#f3e8ff",
                  color: job.jobType === "REMOTE" ? "#1e40af" : job.jobType === "HYBRID" ? "#92400e" : "#6b21a8",
                }}
              >
                {getJobTypeLabel(job.jobType)}
              </span>
            </td>

            {/* Source */}
            <td style={{ padding: "0.75rem" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  backgroundColor: "#e5e7eb",
                  color: "#374151",
                }}
              >
                {getSourceLabel(job.source)}
              </span>
            </td>

            {/* Invited to interview */}
            <td style={{ padding: "0.75rem" }}>
              <span
                title={job.invitedToInterview ? "Invited to interview" : "Not invited yet"}
                style={{
                  display: "inline-block",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  backgroundColor: job.invitedToInterview ? "#dcfce7" : "#f3f4f6",
                  color: job.invitedToInterview ? "#166534" : "#6b7280",
                }}
              >
                {job.invitedToInterview ? "Yes" : "No"}
              </span>
            </td>

            {/* Docs status: description / resume / cover letter (colored circles) */}
            <td style={{ padding: "0.75rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                {/* Description circle */}
                <div
                  title={job.hasDescription ? "Description exists" : "Description missing"}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: job.hasDescription ? "#10b981" : "#ef4444",
                    border: "1px solid",
                    borderColor: job.hasDescription ? "#059669" : "#dc2626",
                  }}
                />
                {/* Resume circle */}
                <div
                  title={job.hasResume ? "Resume exists" : "Resume missing"}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: job.hasResume ? "#10b981" : "#ef4444",
                    border: "1px solid",
                    borderColor: job.hasResume ? "#059669" : "#dc2626",
                  }}
                />
                {/* Cover Letter circle */}
                <div
                  title={job.hasCoverLetter ? "Cover letter exists" : "Cover letter missing"}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: job.hasCoverLetter ? "#10b981" : "#ef4444",
                    border: "1px solid",
                    borderColor: job.hasCoverLetter ? "#059669" : "#dc2626",
                  }}
                />
              </div>
            </td>

            {/* Match Score */}
            <td style={{ padding: "0.75rem", textAlign: "center" }}>
              {job.jobrightMatchScore !== null ? (
                <span
                  style={{
                    display: "inline-block",
                    padding: "0.25rem 0.5rem",
                    backgroundColor:
                      job.jobrightMatchScore >= 80
                        ? "#dcfce7"
                        : job.jobrightMatchScore >= 60
                        ? "#fef3c7"
                        : "#fee2e2",
                    color:
                      job.jobrightMatchScore >= 80
                        ? "#166534"
                        : job.jobrightMatchScore >= 60
                        ? "#92400e"
                        : "#991b1b",
                    borderRadius: "4px",
                    fontWeight: 500,
                  }}
                >
                  {job.jobrightMatchScore}%
                </span>
              ) : (
                <span style={{ color: "#9ca3af" }}>N/A</span>
              )}
            </td>
            <td style={{ padding: "0.75rem" }}>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  onClick={() => handleEdit(job)}
                  style={{
                    padding: "0.25rem 0.75rem",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleGenerateDocs(job)}
                  disabled={!job.hasDescription || generatingDocsForId === job.id}
                  title={
                    job.hasDescription
                      ? "Generate tailored resume and cover letter using this job description"
                      : "Add job description first (Edit) to enable document generation"
                  }
                  style={{
                    padding: "0.25rem 0.75rem",
                    backgroundColor:
                      !job.hasDescription || generatingDocsForId === job.id
                        ? "#9ca3af"
                        : "#8b5cf6",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor:
                      !job.hasDescription || generatingDocsForId === job.id
                        ? "not-allowed"
                        : "pointer",
                    fontSize: "0.875rem",
                    opacity:
                      !job.hasDescription || generatingDocsForId === job.id
                        ? 0.7
                        : 1,
                  }}
                >
                  {generatingDocsForId === job.id ? "Generating..." : "Generate Docs"}
                </button>
                <button
                  type="button"
                  onClick={() => handleResetDocs(job)}
                  disabled={
                    (!job.hasResume && !job.hasCoverLetter) || resettingDocsForId === job.id
                  }
                  title="Delete stored tailored resume and cover letter (keeps job & description)"
                  style={{
                    padding: "0.25rem 0.75rem",
                    backgroundColor:
                      !job.hasResume && !job.hasCoverLetter
                        ? "#d1d5db"
                        : resettingDocsForId === job.id
                          ? "#9ca3af"
                          : "#f59e0b",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor:
                      (!job.hasResume && !job.hasCoverLetter) || resettingDocsForId === job.id
                        ? "not-allowed"
                        : "pointer",
                    fontSize: "0.875rem",
                    opacity:
                      (!job.hasResume && !job.hasCoverLetter) || resettingDocsForId === job.id
                        ? 0.75
                        : 1,
                  }}
                >
                  {resettingDocsForId === job.id ? "Resetting..." : "Reset docs"}
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  style={{
                    padding: "0.25rem 0.75rem",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                  }}
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* Pagination */}
    {totalFiltered > 0 && (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          marginTop: "1rem",
          padding: "0.75rem 0",
          borderTop: "1px solid #e5e7eb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            Showing {rangeStart}–{rangeEnd} of {totalFiltered}
          </span>
          <label htmlFor="pageSize" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
            Per page:
          </label>
          <select
            id="pageSize"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            style={{
              padding: "0.35rem 0.5rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "0.875rem",
            }}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            style={{
              padding: "0.35rem 0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              backgroundColor: page <= 1 ? "#f3f4f6" : "white",
              cursor: page <= 1 ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
            }}
          >
            Previous
          </button>
          <span style={{ padding: "0 0.5rem", fontSize: "0.875rem" }}>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            style={{
              padding: "0.35rem 0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              backgroundColor: page >= totalPages ? "#f3f4f6" : "white",
              cursor: page >= totalPages ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
            }}
          >
            Next
          </button>
        </div>
      </div>
    )}

    {/* Edit Job Modal */}
    {/* Add job (manual) modal – e.g. from ZipRecruiter: surf, copy URL + description, add here; then generate docs */}
    {showAddManual && (
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
          zIndex: 1001,
        }}
        onClick={() => !addingJob && setShowAddManual(false)}
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
          <h2 style={{ marginTop: 0, marginBottom: "0.5rem", fontSize: "1.5rem", fontWeight: 600 }}>
            Add job (manual)
          </h2>
          <p style={{ marginBottom: "1.5rem", color: "#6b7280", fontSize: "0.875rem" }}>
            Surf ZipRecruiter (or any site), copy the job URL and description, then paste below. After saving, use &quot;Generate docs&quot; in the table to create resume and cover letter.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", overflow: "auto", flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>Job Title</label>
                <input
                  type="text"
                  value={addForm.title}
                  onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  placeholder="e.g. Software Engineer"
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.875rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>Company</label>
                <input
                  type="text"
                  value={addForm.company}
                  onChange={(e) => setAddForm({ ...addForm, company: e.target.value })}
                  placeholder="e.g. Acme Inc."
                  style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.875rem" }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>Job URL *</label>
              <input
                type="url"
                value={addForm.externalUrl}
                onChange={(e) => setAddForm({ ...addForm, externalUrl: e.target.value })}
                placeholder="https://..."
                style={{ width: "100%", padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.875rem" }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>Source</label>
                <select
                  value={addForm.source}
                  onChange={(e) => setAddForm({ ...addForm, source: e.target.value })}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.875rem" }}
                >
                  {SOURCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>Job Type</label>
                <select
                  value={addForm.jobType}
                  onChange={(e) => setAddForm({ ...addForm, jobType: e.target.value as JobTypeValue })}
                  style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.875rem" }}
                >
                  {JOB_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "220px" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>Job description *</label>
              <textarea
                value={addForm.description}
                onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                placeholder="Paste the full job description here..."
                style={{
                  width: "100%",
                  minHeight: "220px",
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
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => !addingJob && setShowAddManual(false)}
                disabled={addingJob}
                style={{ padding: "0.5rem 1.5rem", backgroundColor: "#6b7280", color: "white", border: "none", borderRadius: "4px", cursor: addingJob ? "not-allowed" : "pointer", fontSize: "0.875rem", fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddJobManual}
                disabled={addingJob || !addForm.externalUrl.trim() || !addForm.description.trim()}
                style={{
                  padding: "0.5rem 1.5rem",
                  backgroundColor: addingJob || !addForm.externalUrl.trim() || !addForm.description.trim() ? "#9ca3af" : "#8b5cf6",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: addingJob || !addForm.externalUrl.trim() || !addForm.description.trim() ? "not-allowed" : "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                {addingJob ? "Adding..." : "Add job"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {editingId && (
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
        onClick={handleCancel}
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
            Edit Job Application
          </h2>
          
          {loadingEditForm ? (
            <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", overflow: "auto", flex: 1 }}>
              {/* Job Title */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>
                  Job Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
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
                  onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
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
                  onChange={(e) => setEditForm({ ...editForm, externalUrl: e.target.value })}
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
                  onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
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

              {/* Job Type */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>
                  Job Type
                </label>
                <select
                  value={editForm.jobType}
                  onChange={(e) => setEditForm({ ...editForm, jobType: e.target.value as JobTypeValue })}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                  }}
                >
                  {JOB_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Invited to interview */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="edit-invitedToInterview"
                  checked={editForm.invitedToInterview}
                  onChange={(e) => setEditForm({ ...editForm, invitedToInterview: e.target.checked })}
                  style={{ width: "1rem", height: "1rem", cursor: "pointer" }}
                />
                <label htmlFor="edit-invitedToInterview" style={{ fontWeight: 500, fontSize: "0.875rem", cursor: "pointer" }}>
                  Invited to interview
                </label>
              </div>

              {/* Job Description */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "300px" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>
                  Job Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
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
                  onClick={handleCancel}
                  disabled={savingEditForm}
                  style={{
                    padding: "0.5rem 1.5rem",
                    backgroundColor: "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: savingEditForm ? "not-allowed" : "pointer",
                    opacity: savingEditForm ? 0.6 : 1,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(editingId)}
                  disabled={savingEditForm || !editForm.title || !editForm.company || !editForm.externalUrl}
                  style={{
                    padding: "0.5rem 1.5rem",
                    backgroundColor: savingEditForm || !editForm.title || !editForm.company || !editForm.externalUrl
                      ? "#9ca3af"
                      : "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: savingEditForm || !editForm.title || !editForm.company || !editForm.externalUrl
                      ? "not-allowed"
                      : "pointer",
                    opacity: savingEditForm || !editForm.title || !editForm.company || !editForm.externalUrl ? 0.6 : 1,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  {savingEditForm ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    </div>
  );
}
