"use client";

import { type CSSProperties, useEffect, useState } from "react";

type TestResult = { ok: boolean; [k: string]: any } | null;
type TestTarget =
  | "gemini"
  | "openai"
  | "openrouter"
  | "groq"
  | "cerebras"
  | "rotation"
  | "sheets";

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "0.5rem",
  border: "1px solid #d1d5db",
  borderRadius: "4px",
  fontSize: "0.875rem",
  marginBottom: "1rem",
  boxSizing: "border-box",
};
const labelStyle: CSSProperties = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "0.25rem",
};
const sectionStyle: CSSProperties = {
  background: "white",
  padding: "1.5rem",
  borderRadius: "8px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  marginBottom: "1.5rem",
};
const radioLabel: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.4rem",
  cursor: "pointer",
  fontSize: "0.85rem",
  marginRight: "1.5rem",
  marginBottom: "0.5rem",
};
const smallBtn: CSSProperties = {
  padding: "0.4rem 0.75rem",
  fontSize: "0.75rem",
  border: "1px solid #d1d5db",
  background: "#f9fafb",
  borderRadius: "4px",
  cursor: "pointer",
  whiteSpace: "nowrap",
};
const testBtn: CSSProperties = {
  ...smallBtn,
  background: "#1d4ed8",
  color: "white",
  border: "none",
};
const helpStyle: CSSProperties = {
  fontSize: "0.7rem",
  color: "#6b7280",
  marginTop: "0.25rem",
  marginBottom: "1rem",
};
const linkStyle: CSSProperties = { color: "#1d4ed8" };
const greenTag: CSSProperties = { color: "#16a34a", fontSize: "0.75rem" };
const grayTag: CSSProperties = { color: "#6b7280", fontSize: "0.75rem" };
const providerBlockStyle: CSSProperties = {
  borderTop: "1px solid #e5e7eb",
  paddingTop: "1rem",
  marginTop: "0.5rem",
};
const rotationCardStyle: CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  padding: "1rem",
  marginBottom: "1rem",
  background: "#fafafa",
};

// Show / hide / copy row reused by every API-key field.
function KeyRow({
  value,
  onChange,
  show,
  onToggle,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  placeholder: string;
}) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inputStyle, marginBottom: 0, fontFamily: "monospace" }}
      />
      <button type="button" onClick={onToggle} style={smallBtn}>
        {show ? "Hide" : "Show"}
      </button>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(value)}
        style={smallBtn}
      >
        Copy
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [aiProvider, setAiProvider] = useState("gemini");
  const [openaiKey, setOpenaiKey] = useState("");
  const [openaiModel, setOpenaiModel] = useState("gpt-4o-mini");
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiModel, setGeminiModel] = useState("gemini-2.5-flash");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [openrouterModel, setOpenrouterModel] = useState("auto");
  const [groqKey, setGroqKey] = useState("");
  const [groqModel, setGroqModel] = useState("llama-3.1-8b-instant");
  const [cerebrasKey, setCerebrasKey] = useState("");
  const [cerebrasModel, setCerebrasModel] = useState("llama-3.3-70b");
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
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(true);
  const [showGroqKey, setShowGroqKey] = useState(true);
  const [showCerebrasKey, setShowCerebrasKey] = useState(true);
  const [showExtensionKey, setShowExtensionKey] = useState(true);

  const [geminiTest, setGeminiTest] = useState<TestResult>(null);
  const [openaiTest, setOpenaiTest] = useState<TestResult>(null);
  const [openrouterTest, setOpenrouterTest] = useState<TestResult>(null);
  const [groqTest, setGroqTest] = useState<TestResult>(null);
  const [cerebrasTest, setCerebrasTest] = useState<TestResult>(null);
  const [rotationTest, setRotationTest] = useState<TestResult>(null);
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
    setOpenrouterKey(data.openrouter_api_key || "");
    setOpenrouterModel(data.openrouter_model || "auto");
    setGroqKey(data.groq_api_key || "");
    setGroqModel(data.groq_model || "llama-3.1-8b-instant");
    setCerebrasKey(data.cerebras_api_key || "");
    setCerebrasModel(data.cerebras_model || "llama-3.3-70b");
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
      openrouter_api_key: openrouterKey,
      openrouter_model: openrouterModel,
      groq_api_key: groqKey,
      groq_model: groqModel,
      cerebras_api_key: cerebrasKey,
      cerebras_model: cerebrasModel,
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

  async function runTest(target: TestTarget) {
    setTesting(target);
    if (target === "gemini") setGeminiTest(null);
    if (target === "openai") setOpenaiTest(null);
    if (target === "openrouter") setOpenrouterTest(null);
    if (target === "groq") setGroqTest(null);
    if (target === "cerebras") setCerebrasTest(null);
    if (target === "rotation") setRotationTest(null);
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
      if (target === "openrouter") setOpenrouterTest(data);
      if (target === "groq") setGroqTest(data);
      if (target === "cerebras") setCerebrasTest(data);
      if (target === "rotation") setRotationTest(data);
      if (target === "sheets") setSheetsTest(data);
    } catch (e: any) {
      const fail = { ok: false, error: String(e?.message || e) };
      if (target === "gemini") setGeminiTest(fail);
      if (target === "openai") setOpenaiTest(fail);
      if (target === "openrouter") setOpenrouterTest(fail);
      if (target === "groq") setGroqTest(fail);
      if (target === "cerebras") setCerebrasTest(fail);
      if (target === "rotation") setRotationTest(fail);
      if (target === "sheets") setSheetsTest(fail);
    } finally {
      setTesting("");
    }
  }

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

  // The test endpoint checks the value stored in the database, not the form.
  const savedNote = (
    <p style={{ ...helpStyle, marginTop: "0.4rem", marginBottom: 0 }}>
      Test uses the saved value — click Save first if you just edited a key.
    </p>
  );

  const geminiFields = () => (
    <>
      <label style={labelStyle}>Gemini API Key</label>
      <KeyRow
        value={geminiKey}
        onChange={setGeminiKey}
        show={showGeminiKey}
        onToggle={() => setShowGeminiKey((v) => !v)}
        placeholder="AIzaSy..."
      />
      <p style={helpStyle}>
        Free, no credit card — get a key at{" "}
        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          aistudio.google.com/apikey
        </a>
        . Large context window — handles the scanner batched prompts.
      </p>
      <label style={labelStyle}>Model</label>
      <select value={geminiModel} onChange={(e) => setGeminiModel(e.target.value)} style={inputStyle}>
        <option value="gemini-2.5-flash">gemini-2.5-flash (recommended)</option>
        <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite (most free req/day)</option>
        <option value="gemini-2.0-flash">gemini-2.0-flash</option>
        <option value="gemini-2.0-flash-001">gemini-2.0-flash-001</option>
        <option value="gemini-2.0-flash-lite">gemini-2.0-flash-lite</option>
        <option value="gemini-flash-latest">gemini-flash-latest</option>
      </select>
      <button type="button" onClick={() => runTest("gemini")} disabled={testing === "gemini"} style={testBtn}>
        {testing === "gemini" ? "Testing..." : "Test Gemini"}
      </button>
      {savedNote}
      {renderTest(geminiTest)}
    </>
  );

  const groqFields = () => (
    <>
      <label style={labelStyle}>Groq API Key</label>
      <KeyRow
        value={groqKey}
        onChange={setGroqKey}
        show={showGroqKey}
        onToggle={() => setShowGroqKey((v) => !v)}
        placeholder="gsk_..."
      />
      <p style={helpStyle}>
        Free, no credit card — get a key at{" "}
        <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          console.groq.com/keys
        </a>
        . Free tier: 30 req/min, up to 14,400 req/day. Very fast — great for the LinkedIn extension.
      </p>
      <label style={labelStyle}>Model</label>
      <select value={groqModel} onChange={(e) => setGroqModel(e.target.value)} style={inputStyle}>
        <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (recommended — most free req/day)</option>
        <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (higher quality)</option>
        <option value="openai/gpt-oss-20b">openai/gpt-oss-20b</option>
      </select>
      <button type="button" onClick={() => runTest("groq")} disabled={testing === "groq"} style={testBtn}>
        {testing === "groq" ? "Testing..." : "Test Groq"}
      </button>
      {savedNote}
      {renderTest(groqTest)}
    </>
  );

  const cerebrasFields = () => (
    <>
      <label style={labelStyle}>Cerebras API Key</label>
      <KeyRow
        value={cerebrasKey}
        onChange={setCerebrasKey}
        show={showCerebrasKey}
        onToggle={() => setShowCerebrasKey((v) => !v)}
        placeholder="csk-..."
      />
      <p style={helpStyle}>
        Free, no credit card — get a key at{" "}
        <a href="https://cloud.cerebras.ai" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          cloud.cerebras.ai
        </a>
        . Free tier: 1,000,000 tokens/day, 30 req/min, 8K context. Very fast — great for the LinkedIn extension.
      </p>
      <label style={labelStyle}>Model</label>
      <select value={cerebrasModel} onChange={(e) => setCerebrasModel(e.target.value)} style={inputStyle}>
        <option value="llama-3.3-70b">llama-3.3-70b (recommended)</option>
        <option value="llama3.1-8b">llama3.1-8b (fastest)</option>
        <option value="gpt-oss-120b">gpt-oss-120b</option>
      </select>
      <button type="button" onClick={() => runTest("cerebras")} disabled={testing === "cerebras"} style={testBtn}>
        {testing === "cerebras" ? "Testing..." : "Test Cerebras"}
      </button>
      {savedNote}
      {renderTest(cerebrasTest)}
    </>
  );

  const openrouterFields = () => (
    <>
      <label style={labelStyle}>OpenRouter API Key</label>
      <KeyRow
        value={openrouterKey}
        onChange={setOpenrouterKey}
        show={showOpenRouterKey}
        onToggle={() => setShowOpenRouterKey((v) => !v)}
        placeholder="sk-or-v1-..."
      />
      <p style={helpStyle}>
        Free, no credit card — get a key at{" "}
        <a href="https://openrouter.ai/settings/keys" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          openrouter.ai/settings/keys
        </a>
        . Free tier is roughly 50 req/day per key.
      </p>
      <label style={labelStyle}>Model</label>
      <select value={openrouterModel} onChange={(e) => setOpenrouterModel(e.target.value)} style={inputStyle}>
        <option value="auto">auto (recommended — discover and rotate free models live)</option>
        <option value="deepseek/deepseek-r1:free">deepseek/deepseek-r1 (reasoning)</option>
        <option value="meta-llama/llama-3.3-70b-instruct:free">meta-llama/llama-3.3-70b-instruct</option>
        <option value="google/gemini-2.0-flash-exp:free">google/gemini-2.0-flash-exp</option>
        <option value="qwen/qwen-2.5-72b-instruct:free">qwen/qwen-2.5-72b-instruct</option>
        <option value="meta-llama/llama-3.2-3b-instruct:free">meta-llama/llama-3.2-3b-instruct</option>
        <option value="google/gemma-2-9b-it:free">google/gemma-2-9b-it</option>
        <option value="mistralai/mistral-7b-instruct:free">mistralai/mistral-7b-instruct</option>
      </select>
      <button type="button" onClick={() => runTest("openrouter")} disabled={testing === "openrouter"} style={testBtn}>
        {testing === "openrouter" ? "Testing..." : "Test OpenRouter"}
      </button>
      {savedNote}
      {renderTest(openrouterTest)}
    </>
  );

  const openaiFields = () => (
    <>
      <label style={labelStyle}>OpenAI API Key</label>
      <KeyRow
        value={openaiKey}
        onChange={setOpenaiKey}
        show={showOpenAIKey}
        onToggle={() => setShowOpenAIKey((v) => !v)}
        placeholder="sk-..."
      />
      <label style={labelStyle}>Model</label>
      <select value={openaiModel} onChange={(e) => setOpenaiModel(e.target.value)} style={inputStyle}>
        <option value="gpt-4o-mini">gpt-4o-mini (cheapest)</option>
        <option value="gpt-4o">gpt-4o</option>
        <option value="gpt-4-turbo">gpt-4-turbo</option>
        <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
      </select>
      <button type="button" onClick={() => runTest("openai")} disabled={testing === "openai"} style={testBtn}>
        {testing === "openai" ? "Testing..." : "Test OpenAI"}
      </button>
      {savedNote}
      {renderTest(openaiTest)}
    </>
  );

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
        <div style={{ marginBottom: "0.5rem" }}>
          <label style={radioLabel}>
            <input type="radio" name="aiProvider" value="rotation" checked={aiProvider === "rotation"} onChange={(e) => setAiProvider(e.target.value)} />
            <span><strong>Smart Rotation</strong> <span style={greenTag}>(recommended — free, auto-failover)</span></span>
          </label>
          <label style={radioLabel}>
            <input type="radio" name="aiProvider" value="gemini" checked={aiProvider === "gemini"} onChange={(e) => setAiProvider(e.target.value)} />
            <span><strong>Gemini</strong> <span style={greenTag}>(free)</span></span>
          </label>
          <label style={radioLabel}>
            <input type="radio" name="aiProvider" value="groq" checked={aiProvider === "groq"} onChange={(e) => setAiProvider(e.target.value)} />
            <span><strong>Groq</strong> <span style={greenTag}>(free, no card)</span></span>
          </label>
          <label style={radioLabel}>
            <input type="radio" name="aiProvider" value="cerebras" checked={aiProvider === "cerebras"} onChange={(e) => setAiProvider(e.target.value)} />
            <span><strong>Cerebras</strong> <span style={greenTag}>(free, no card)</span></span>
          </label>
          <label style={radioLabel}>
            <input type="radio" name="aiProvider" value="openrouter" checked={aiProvider === "openrouter"} onChange={(e) => setAiProvider(e.target.value)} />
            <span><strong>OpenRouter</strong> <span style={greenTag}>(free, no card)</span></span>
          </label>
          <label style={radioLabel}>
            <input type="radio" name="aiProvider" value="openai" checked={aiProvider === "openai"} onChange={(e) => setAiProvider(e.target.value)} />
            <span><strong>OpenAI</strong> <span style={grayTag}>(paid)</span></span>
          </label>
        </div>

        {aiProvider === "rotation" && (
          <div style={providerBlockStyle}>
            <p style={{ fontSize: "0.8rem", color: "#374151", marginBottom: "0.4rem" }}>
              <strong>Smart Rotation</strong> pools every provider below that has a key. It tries them in priority order and, when one is rate-limited, fails over to the next automatically — so the scanner and the LinkedIn extension never stall on a single quota.
            </p>
            <p style={helpStyle}>
              Scanner batches prefer Gemini then OpenRouter (large context). The extension prefers Cerebras then Groq (fast, high daily limits). Add at least one key; add all four for maximum headroom. Leave a field blank to exclude that provider.
            </p>
            <div style={rotationCardStyle}>{geminiFields()}</div>
            <div style={rotationCardStyle}>{groqFields()}</div>
            <div style={rotationCardStyle}>{cerebrasFields()}</div>
            <div style={rotationCardStyle}>{openrouterFields()}</div>
            <button type="button" onClick={() => runTest("rotation")} disabled={testing === "rotation"} style={testBtn}>
              {testing === "rotation" ? "Testing all providers..." : "Test All Rotation Providers"}
            </button>
            {savedNote}
            {renderTest(rotationTest)}
          </div>
        )}

        {aiProvider === "gemini" && <div style={providerBlockStyle}>{geminiFields()}</div>}
        {aiProvider === "groq" && <div style={providerBlockStyle}>{groqFields()}</div>}
        {aiProvider === "cerebras" && <div style={providerBlockStyle}>{cerebrasFields()}</div>}
        {aiProvider === "openrouter" && <div style={providerBlockStyle}>{openrouterFields()}</div>}
        {aiProvider === "openai" && <div style={providerBlockStyle}>{openaiFields()}</div>}
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
        <KeyRow
          value={extensionApiKey}
          onChange={setExtensionApiKey}
          show={showExtensionKey}
          onToggle={() => setShowExtensionKey((v) => !v)}
          placeholder="any random string"
        />
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
