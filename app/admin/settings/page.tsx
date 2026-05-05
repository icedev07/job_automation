"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [aiProvider, setAiProvider] = useState("gemini");
  const [openaiKey, setOpenaiKey] = useState("");
  const [openaiModel, setOpenaiModel] = useState("gpt-4o-mini");
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiModel, setGeminiModel] = useState("gemini-2.0-flash");
  const [sheetId, setSheetId] = useState("");
  const [sheetCreds, setSheetCreds] = useState("");
  const [sheetColumns, setSheetColumns] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [analysisPrompt, setAnalysisPrompt] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/config").then((r) => r.json()).then((data) => {
      setAiProvider(data.ai_provider || "gemini");
      setOpenaiKey(data.openai_api_key_masked || "");
      setOpenaiModel(data.openai_model || "gpt-4o-mini");
      setGeminiKey(data.gemini_api_key_masked || "");
      setGeminiModel(data.gemini_model || "gemini-2.0-flash");
      setSheetId(data.google_sheet_id || "");
      setSheetCreds(data.google_sheets_credentials ? "(configured)" : "");
      setSheetColumns(data.sheet_columns || "");
      setTargetMarket(data.target_market || "");
      setCurrentLocation(data.current_location || "");
      setAnalysisPrompt(data.job_analysis_prompt || "");
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const updates: Record<string, string> = {};
    updates.ai_provider = aiProvider;
    if (openaiKey && !openaiKey.includes("****")) updates.openai_api_key = openaiKey;
    updates.openai_model = openaiModel;
    if (geminiKey && !geminiKey.includes("****")) updates.gemini_api_key = geminiKey;
    updates.gemini_model = geminiModel;
    if (sheetId) updates.google_sheet_id = sheetId;
    if (sheetCreds && sheetCreds !== "(configured)") updates.google_sheets_credentials = sheetCreds;
    if (targetMarket) updates.target_market = targetMarket;
    if (currentLocation) updates.current_location = currentLocation;
    if (analysisPrompt) updates.job_analysis_prompt = analysisPrompt;
    if (sheetColumns) updates.sheet_columns = sheetColumns;
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
  const labelStyle = { display: "block" as const, fontSize: "0.8rem", fontWeight: 600 as const, color: "#374151", marginBottom: "0.25rem" };
  const sectionStyle = { background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", marginBottom: "1.5rem" };
  const radioLabel = { display: "inline-flex" as const, alignItems: "center" as const, gap: "0.4rem", cursor: "pointer", fontSize: "0.85rem", marginRight: "1.5rem" };

  return (
    <div style={{ maxWidth: "700px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Settings</h1>

      <div style={sectionStyle}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Target Configuration</h3>
        <label style={labelStyle}>Target Market</label>
        <input value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} placeholder="Europe, Eastern Europe, Remote worldwide" style={inputStyle} />

        <label style={labelStyle}>Current Location</label>
        <input value={currentLocation} onChange={(e) => setCurrentLocation(e.target.value)} placeholder="Armenia" style={inputStyle} />
      </div>

      <div style={sectionStyle}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>AI Provider</h3>
        <div style={{ marginBottom: "1rem" }}>
          <label style={radioLabel}>
            <input type="radio" name="aiProvider" value="gemini" checked={aiProvider === "gemini"} onChange={(e) => setAiProvider(e.target.value)} />
            <span><strong>Gemini</strong> <span style={{ color: "#16a34a", fontSize: "0.75rem" }}>(free)</span></span>
          </label>
          <label style={radioLabel}>
            <input type="radio" name="aiProvider" value="openai" checked={aiProvider === "openai"} onChange={(e) => setAiProvider(e.target.value)} />
            <span><strong>OpenAI</strong> <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>(paid)</span></span>
          </label>
        </div>

        {aiProvider === "gemini" && (
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
            <label style={labelStyle}>Gemini API Key</label>
            <input type="password" value={geminiKey} onChange={(e) => setGeminiKey(e.target.value)} placeholder="AIzaSy..." style={inputStyle} />
            <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "-0.75rem", marginBottom: "1rem" }}>
              Get free at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8" }}>aistudio.google.com/apikey</a>
            </p>

            <label style={labelStyle}>Model</label>
            <select value={geminiModel} onChange={(e) => setGeminiModel(e.target.value)} style={inputStyle}>
              <option value="gemini-2.0-flash">gemini-2.0-flash (free, 1500 req/day)</option>
              <option value="gemini-2.5-flash">gemini-2.5-flash (free, 250 req/day)</option>
              <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite (free, 1000 req/day)</option>
            </select>
          </div>
        )}

        {aiProvider === "openai" && (
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
            <label style={labelStyle}>OpenAI API Key</label>
            <input type="password" value={openaiKey} onChange={(e) => setOpenaiKey(e.target.value)} placeholder="sk-..." style={inputStyle} />

            <label style={labelStyle}>Model</label>
            <select value={openaiModel} onChange={(e) => setOpenaiModel(e.target.value)} style={inputStyle}>
              <option value="gpt-4o-mini">gpt-4o-mini (cheapest)</option>
              <option value="gpt-4o">gpt-4o</option>
              <option value="gpt-4-turbo">gpt-4-turbo</option>
              <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
            </select>
          </div>
        )}
      </div>

      <div style={sectionStyle}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Google Sheets</h3>
        <label style={labelStyle}>Google Sheet ID</label>
        <input value={sheetId} onChange={(e) => setSheetId(e.target.value)} placeholder="1BxiMVs..." style={inputStyle} />

        <label style={labelStyle}>Service Account JSON</label>
        <textarea value={sheetCreds} onChange={(e) => setSheetCreds(e.target.value)} placeholder="Paste the full JSON key file content" rows={4} style={{ ...inputStyle, fontFamily: "monospace", fontSize: "0.75rem" }} />

        <label style={labelStyle}>Sheet Columns (JSON, leave blank for defaults)</label>
        <input value={sheetColumns} onChange={(e) => setSheetColumns(e.target.value)} placeholder='[{"key":"title","label":"Title"},...]' style={{ ...inputStyle, fontFamily: "monospace", fontSize: "0.75rem" }} />
        <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "-0.75rem" }}>
          Default: title, company, location, url, platform, aiScore, techStack, salary, createdAt
        </p>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>Job Analysis Prompt</h3>
        <p style={{ color: "#6b7280", fontSize: "0.75rem", marginBottom: "0.75rem" }}>
          Placeholders: {"{{JOB_TITLE}}"}, {"{{COMPANY}}"}, {"{{LOCATION}}"}, {"{{DESCRIPTION}}"}, {"{{TARGET_MARKET}}"}, {"{{CURRENT_LOCATION}}"}. Leave blank for default.
        </p>
        <textarea value={analysisPrompt} onChange={(e) => setAnalysisPrompt(e.target.value)} rows={12} style={{ ...inputStyle, fontFamily: "monospace", fontSize: "0.75rem", lineHeight: "1.5" }} placeholder="Leave blank to use the default analysis prompt..." />
      </div>

      <div style={sectionStyle}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Admin</h3>
        <label style={labelStyle}>Admin Password</label>
        <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Leave blank to keep current" style={inputStyle} />
      </div>

      <button onClick={handleSave} disabled={saving} style={{ padding: "0.5rem 1.5rem", background: "#1d4ed8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 500 }}>
        {saving ? "Saving..." : "Save All Settings"}
      </button>
      {message && <span style={{ marginLeft: "1rem", color: message === "Saved" ? "#16a34a" : "#dc2626", fontSize: "0.875rem" }}>{message}</span>}
    </div>
  );
}
