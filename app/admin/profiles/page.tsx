"use client";

import { useEffect, useState } from "react";

type Profile = { id: number; name: string; email: string; baseResumeText: string };

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => { loadProfiles(); }, []);

  async function loadProfiles() {
    const res = await fetch("/api/admin/profiles");
    setProfiles(await res.json());
  }

  function startEdit(p: Profile) {
    setEditing(p);
    setName(p.name);
    setEmail(p.email);
    setResumeText(p.baseResumeText);
  }

  function startNew() {
    setEditing(null);
    setName("");
    setEmail("");
    setResumeText("");
  }

  async function handleSave() {
    setMessage("");
    const body = { name, email, baseResumeText: resumeText };
    const url = editing ? `/api/admin/profiles/${editing.id}` : "/api/admin/profiles";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) {
      setMessage("Saved");
      setEditing(null);
      setName(""); setEmail(""); setResumeText("");
      loadProfiles();
    } else {
      const err = await res.json();
      setMessage(err.error || "Error");
    }
  }

  async function deleteProfile(id: number) {
    await fetch(`/api/admin/profiles/${id}`, { method: "DELETE" });
    loadProfiles();
  }

  const inputStyle = { width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.875rem", marginBottom: "0.75rem" };

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>User Profiles</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Existing Profiles</h3>
          {profiles.length === 0 ? (
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>No profiles. Create one to get started.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {profiles.map((p) => (
                <div key={p.id} style={{ background: "white", padding: "0.75rem 1rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{p.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{p.email}</div>
                    <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>{p.baseResumeText.length} chars resume</div>
                  </div>
                  <div>
                    <button onClick={() => startEdit(p)} style={{ marginRight: "0.5rem", padding: "0.25rem 0.6rem", border: "1px solid #d1d5db", borderRadius: "4px", background: "white", cursor: "pointer", fontSize: "0.75rem" }}>Edit</button>
                    <button onClick={() => deleteProfile(p.id)} style={{ padding: "0.25rem 0.6rem", border: "1px solid #fca5a5", borderRadius: "4px", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontSize: "0.75rem" }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={startNew} style={{ marginTop: "1rem", padding: "0.4rem 1rem", background: "#1d4ed8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
            + New Profile
          </button>
        </div>

        <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>{editing ? `Edit: ${editing.name}` : "New Profile"}</h3>
          <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151" }}>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151" }}>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151" }}>Base Resume Text</label>
          <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={12} style={{ ...inputStyle, fontFamily: "monospace", fontSize: "0.75rem" }} />
          <button onClick={handleSave} style={{ padding: "0.4rem 1rem", background: "#1d4ed8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
            {editing ? "Update" : "Create"}
          </button>
          {message && <span style={{ marginLeft: "1rem", fontSize: "0.8rem", color: message === "Saved" ? "#16a34a" : "#dc2626" }}>{message}</span>}
        </div>
      </div>
    </div>
  );
}
