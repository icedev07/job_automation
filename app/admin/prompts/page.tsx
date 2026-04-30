"use client";

import { useEffect, useState } from "react";

export default function PromptsPage() {
  const [resumePrompt, setResumePrompt] = useState("");
  const [coverLetterPrompt, setCoverLetterPrompt] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/config").then((r) => r.json()).then((data) => {
      setResumePrompt(data.resume_prompt_template || "");
      setCoverLetterPrompt(data.cover_letter_prompt_template || "");
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume_prompt_template: resumePrompt,
        cover_letter_prompt_template: coverLetterPrompt,
      }),
    });
    setSaving(false);
    setMessage(res.ok ? "Saved" : "Error saving");
  }

  const textareaStyle = {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    fontSize: "0.8rem",
    fontFamily: "monospace",
    lineHeight: "1.5",
    marginBottom: "1rem",
    resize: "vertical" as const,
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>Prompt Templates</h1>
      <p style={{ color: "#6b7280", fontSize: "0.8rem", marginBottom: "1.5rem" }}>
        Use placeholders: {"{{BASE_RESUME}}"}, {"{{JOB_DESCRIPTION}}"}, {"{{COMPANY_NAME}}"}, {"{{JOB_TITLE}}"}. Leave blank to use defaults.
      </p>

      <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Resume Tailoring Prompt</h3>
        <textarea value={resumePrompt} onChange={(e) => setResumePrompt(e.target.value)} rows={20} style={textareaStyle} placeholder="Leave blank to use the default resume prompt..." />
      </div>

      <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Cover Letter Prompt</h3>
        <textarea value={coverLetterPrompt} onChange={(e) => setCoverLetterPrompt(e.target.value)} rows={15} style={textareaStyle} placeholder="Leave blank to use the default cover letter prompt..." />
      </div>

      <button onClick={handleSave} disabled={saving} style={{ padding: "0.5rem 1.5rem", background: "#1d4ed8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 500 }}>
        {saving ? "Saving..." : "Save Prompts"}
      </button>
      {message && <span style={{ marginLeft: "1rem", color: message === "Saved" ? "#16a34a" : "#dc2626", fontSize: "0.875rem" }}>{message}</span>}
    </div>
  );
}
