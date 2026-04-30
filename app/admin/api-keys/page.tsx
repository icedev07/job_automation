"use client";

import { useEffect, useState } from "react";

export default function ApiKeysPage() {
  const [openaiKey, setOpenaiKey] = useState("");
  const [openaiModel, setOpenaiModel] = useState("gpt-4o-mini");
  const [sheetId, setSheetId] = useState("");
  const [sheetCreds, setSheetCreds] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/config").then((r) => r.json()).then((data) => {
      setOpenaiKey(data.openai_api_key_masked || "");
      setOpenaiModel(data.openai_model || "gpt-4o-mini");
      setSheetId(data.google_sheet_id || "");
      setSheetCreds(data.google_sheets_credentials ? "(configured)" : "");
      setAdminPassword("");
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const updates: Record<string, string> = {};
    if (openaiKey && !openaiKey.includes("****")) updates.openai_api_key = openaiKey;
    updates.openai_model = openaiModel;
    if (sheetId) updates.google_sheet_id = sheetId;
    if (sheetCreds && sheetCreds !== "(configured)") updates.google_sheets_credentials = sheetCreds;
    if (adminPassword) updates.admin_password = adminPassword;

    const res = await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setSaving(false);
    setMessage(res.ok ? "Saved" : "Error saving");
  }

  const inputStyle = { width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.875rem", marginBottom: "1rem" };
  const labelStyle = { display: "block", fontSize: "0.8rem", fontWeight: 600 as const, color: "#374151", marginBottom: "0.25rem" };

  return (
    <div style={{ maxWidth: "600px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>API Keys & Credentials</h1>
      <div style={{ background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <label style={labelStyle}>OpenAI API Key</label>
        <input type="password" value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} placeholder="sk-..." style={inputStyle} />

        <label style={labelStyle}>OpenAI Model</label>
        <select value={openaiModel} onChange={(e) => setOpenaiModel(e.target.value)} style={inputStyle}>
          <option value="gpt-4o-mini">gpt-4o-mini (cheapest)</option>
          <option value="gpt-4o">gpt-4o</option>
          <option value="gpt-4-turbo">gpt-4-turbo</option>
          <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
        </select>

        <label style={labelStyle}>Google Sheet ID</label>
        <input value={sheetId} onChange={(e) => setSheetId(e.target.value)} placeholder="1BxiMVs..." style={inputStyle} />

        <label style={labelStyle}>Google Service Account JSON</label>
        <textarea
          value={sheetCreds}
          onChange={(e) => setSheetCreds(e.target.value)}
          placeholder='Paste the full JSON key file content here'
          rows={4}
          style={{ ...inputStyle, fontFamily: "monospace", fontSize: "0.75rem" }}
        />

        <label style={labelStyle}>Admin Password</label>
        <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Leave blank to keep current" style={inputStyle} />

        <button onClick={handleSave} disabled={saving} style={{ padding: "0.5rem 1.5rem", background: "#1d4ed8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 500 }}>
          {saving ? "Saving..." : "Save"}
        </button>
        {message && <span style={{ marginLeft: "1rem", color: message === "Saved" ? "#16a34a" : "#dc2626", fontSize: "0.875rem" }}>{message}</span>}
      </div>
    </div>
  );
}
