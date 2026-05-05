"use client";

import { useEffect, useState } from "react";

type TestResult = { ok: boolean; [k: string]: any } | null;

export default function SettingsPage() {
  const [aiProvider, setAiProvider] = useState("gemini");
  const [openaiKey, setOpenaiKey] = useState("");
  const [openaiModel, setOpenaiModel] = useState("gpt-4o-mini");
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiModel, setGeminiModel] = useState("gemini-2.5-flash");
  const [sheetId, setSheetId] = useState("");
  const [sheetCreds, setSheetCreds] = useState("");
  const [sheetColumns, setSheetColumns] = useState("");
  const [linkedinSheetTab, setLinkedinSheetTab] = useState("LinkedIn");
  const [extensionApiKey, setExtensionApiKey] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [analysisPrompt, setAnalysisPrompt] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [showGeminiKey, setShowGeminiKey] = useState(true);
  const [showOpenAIKey, setShowOpenAIKey] = useState(true);
  const [showExtensionKey, setShowExtensionKey] = useState(true);

  const [geminiTest, setGeminiTest] = useState<TestResult>(null);
  const [openaiTest, setOpenaiTest] = useState<TestResult>(null);
  const [sheetsTest, setSheetsTest] = useState<TestResult>(null);
  const [testing, setTesting] = useState<string>("");

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    const data = await fetch("/api/admin/config").then((r) => r.json());
    setAiProvider(data.ai_provider || "gemini");
    setOpenaiKey(data.openai_api_key || "");
    setOpenaiModel(data.openai_model || "gpt-4o-mini");
    setGeminiKey(data.gemini_api_key || "");
    setGeminiModel(data.gemini_model || "gemini-2.5-flash");
    setSheetId(data.google_sheet_id || "");
    setSheetCreds(data.google_sheets_credentials || "");
    setSheetColumns(data.sheet_columns || "");
    setLinkedinSheetTab(data.linkedin_sheet_tab || "LinkedIn");
    setExtensionApiKey(data.extension_api_key || "");
    setTargetMarket(data.target_market || "");
    setCurrentLocation(data.current_location || "");
    setAnalysisPrompt(data.job_analysis_prompt || "");
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    const updates: Record<string, string> = {
      ai_provider: aiProvider,
      openai_api_key: openaiKey,
      openai_model: openaiModel,
      gemini_api_key: geminiKey,
      gemini_model: geminiModel,
      google_sheet_id: sheetId,
      google_sheets_credentials: sheetCreds,
      target_market: targetMarket,
      current_location: currentLocation,
      job_analysis_prompt: analysisPrompt,
      sheet_columns: sheetColumns,
      linkedin_sheet_tab: linkedinSheetTab,
      extension_api_key: extensionApiKey,
    };
    if (adminPassword) updates.admin_password = adminPassword;

    const res = await fetch("/api/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    setSaving(false);
    setMessage(res.ok ? "Saved" : "Error saving");
    if (res.ok) {
      setAdminPassword("");
      await loadConfig();
    }
  }

  async function runTest(target: "gemini" | "openai" | "sheets") {
    setTesting(target);
    if (target === "gemini") setGeminiTest(null);
    if (target === "openai") setOpenaiTest(null);
    if (target === "sheets") setSheetsTest(null);

    try {
      const res = await fetch("/api/admin/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const data = await res.json();
      if (target === "gemini") setGeminiTest(data);
      if (target === "openai") setOpenaiTest(data);
      if (target === "sheets") setSheetsTest(data);
    } catch (e: any) {
      const fail = { ok: false, error: String(e?.message || e) };
      if (target === "gemini") setGeminiTest(fail);
      if (target === "openai") setOpenaiTest(fail);
      if (target === "sheets") setSheetsTest(fail);
    } finally {
      setTesting("");
    }
  }

  const inputStyle = { width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.875rem", marginBottom: "1rem", boxSizing: "border-box" as const };
  const labelStyle = { display: "block" as const, fontSize: "0.8rem", fontWeight: 600 as const, color: "#374151", marginBottom: "0.25rem" };
  const sectionStyle = { background: "white", padding: "1.5rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", marginBottom: "1.5rem" };
  const radioLabel = { display: "inline-flex" as const, alignItems: "center" as const, gap: "0.4rem", cursor: "pointer", fontSize: "0.85rem", marginRight: "1.5rem" };
  const keyRow = { display: "flex" as const, gap: "0.5rem", marginBottom: "0.5rem" };
  const smallBtn = { padding: "0.4rem 0.75rem", fontSize: "0.75rem", border: "1px solid #d1d5db", background: "#f9fafb", borderRadius: "4px", cursor: "pointer", whiteSpace: "nowrap" as const };
  const testBtn = { ...smallBtn, background: "#1d4ed8", color: "white", border: "none" };

  function renderTest(result: TestResult) {
    if (!result) return null;
    const color = result.ok ? "#16a34a" : "#dc2626";
    return (
      <div style={{ marginTop: "0.5rem", marginBottom: "1rem", padding: "0.75rem", border: `1px solid ${color}`, borderRadius: "4px", background: result.ok ? "#f0fdf4" : "#fef2f2", fontSize: "0.75rem", fontFamily: "monospace", whiteSpace: "pre-wrap" as const, wordBreak: "break-all" as const }}>
        <strong style={{ color }}>{result.ok ? "OK" : "FAILED"}</strong>
        {Object.entries(result).filter(([k]) => k !== "ok").map(([k, v]) => (
          <div key={k}><strong>{k}:</strong> {typeof v === "object" ? JSON.stringify(v) : String(v)}</div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "780px" }}>
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
            <label style={labelStyle}>Gemini API Key (stored value shown in plain text)</label>
            <div style={keyRow}>
              <input
                type={showGeminiKey ? "text" : "password"}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                style={{ ...inputStyle, marginBottom: 0, fontFamily: "monospace" }}
              />
              <button type="button" onClick={() => setShowGeminiKey((v) => !v)} style={smallBtn}>
                {showGeminiKey ? "Hide" : "Show"}
              </button>
              <button type="button" onClick={() => navigator.clipboard.writeText(geminiKey)} style={smallBtn}>Copy</button>
            </div>
            <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.25rem", marginBottom: "1rem" }}>
              Get free at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8" }}>aistudio.google.com/apikey</a>
            </p>

            <label style={labelStyle}>Model</label>
            <select value={geminiModel} onChange={(e) => setGeminiModel(e.target.value)} style={inputStyle}>
              <option value="gemini-2.5-flash">gemini-2.5-flash (recommended)</option>
              <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite</option>
              <option value="gemini-2.0-flash">gemini-2.0-flash</option>
              <option value="gemini-2.0-flash-001">gemini-2.0-flash-001</option>
              <option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite</option>
              <option value="gemini-flash-latest">gemini-flash-latest</option>
            </select>

            <button type="button" onClick={() => runTest("gemini")} disabled={testing === "gemini"} style={testBtn}>
              {testing === "gemini" ? "Testing..." : "Test Gemini Connection"}
            </button>
            <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.5rem" }}>
              Tests the value currently stored in the database against the selected model. Save first if you just edited the key.
            </p>
            {renderTest(geminiTest)}
          </div>
        )}

        {aiProvider === "openai" && (
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
            <label style={labelStyle}>OpenAI API Key (stored value shown in plain text)</label>
            <div style={keyRow}>
              <input
                type={showOpenAIKey ? "text" : "password"}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
                style={{ ...inputStyle, marginBottom: 0, fontFamily: "monospace" }}
              />
              <button type="button" onClick={() => setShowOpenAIKey((v) => !v)} style={smallBtn}>
                {showOpenAIKey ? "Hide" : "Show"}
              </button>
              <button type="button" onClick={() => navigator.clipboard.writeText(openaiKey)} style={smallBtn}>Copy</button>
            </div>

            <label style={{ ...labelStyle, marginTop: "1rem" }}>Model</label>
            <select value={openaiModel} onChange={(e) => setOpenaiModel(e.target.value)} style={inputStyle}>
              <option value="gpt-4o-mini">gpt-4o-mini (cheapest)</option>
              <option value="gpt-4o">gpt-4o</option>
              <option value="gpt-4-turbo">gpt-4-turbo</option>
              <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
            </select>

            <button type="button" onClick={() => runTest("openai")} disabled={testing === "openai"} style={testBtn}>
              {testing === "openai" ? "Testing..." : "Test OpenAI Connection"}
            </button>
            {renderTest(openaiTest)}
          </div>
        )}
      </div>

      <div style={sectionStyle}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Google Sheets</h3>
        <label style={labelStyle}>Google Sheet ID</label>
        <input value={sheetId} onChange={(e) => setSheetId(e.target.value)} placeholder="1BxiMVs..." style={inputStyle} />

        <label style={labelStyle}>LinkedIn Tab Name</label>
        <input value={linkedinSheetTab} onChange={(e) => setLinkedinSheetTab(e.target.value)} placeholder="LinkedIn" style={inputStyle} />

        <label style={labelStyle}>Service Account JSON</label>
        <textarea
          value={sheetCreds}
          onChange={(e) => setSheetCreds(e.target.value)}
          placeholder="Paste the full JSON key file content"
          rows={8}
          style={{ ...inputStyle, fontFamily: "monospace", fontSize: "0.75rem" }}
        />

        <label style={labelStyle}>Sheet Columns (JSON, leave blank for defaults)</label>
        <input value={sheetColumns} onChange={(e) => setSheetColumns(e.target.value)} placeholder='[{"key":"title","label":"Title"},...]' style={{ ...inputStyle, fontFamily: "monospace", fontSize: "0.75rem" }} />
        <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "-0.75rem", marginBottom: "1rem" }}>
          Default: title, company, location, url, platform, aiScore, techStack, salary, createdAt
        </p>

        <button type="button" onClick={() => runTest("sheets")} disabled={testing === "sheets"} style={testBtn}>
          {testing === "sheets" ? "Testing..." : "Test Sheets Connection"}
        </button>
        <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.5rem" }}>
          Verifies the service account can open the Sheet. Save first if you just edited the JSON or ID.
        </p>
        {renderTest(sheetsTest)}
      </div>

      <div style={sectionStyle}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Chrome Extension</h3>
        <label style={labelStyle}>Extension API Key (optional, blank = no auth)</label>
        <div style={keyRow}>
          <input
            type={showExtensionKey ? "text" : "password"}
            value={extensionApiKey}
            onChange={(e) => setExtensionApiKey(e.target.value)}
            placeholder="any random string"
            style={{ ...inputStyle, marginBottom: 0, fontFamily: "monospace" }}
          />
          <button type="button" onClick={() => setShowExtensionKey((v) => !v)} style={smallBtn}>
            {showExtensionKey ? "Hide" : "Show"}
          </button>
          <button type="button" onClick={() => navigator.clipboard.writeText(extensionApiKey)} style={smallBtn}>Copy</button>
        </div>
        <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.5rem", marginBottom: 0 }}>
          Paste the same value into the extension popup so its requests are accepted.
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
        <label style={labelStyle}>Admin Password (leave blank to keep current)</label>
        <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
      </div>

      <button onClick={handleSave} disabled={saving} style={{ padding: "0.5rem 1.5rem", background: "#1d4ed8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 500 }}>
        {saving ? "Saving..." : "Save All Settings"}
      </button>
      {message && <span style={{ marginLeft: "1rem", color: message === "Saved" ? "#16a34a" : "#dc2626", fontSize: "0.875rem" }}>{message}</span>}
    </div>
  );
}
