"use client";

import { type CSSProperties, type ReactNode, useEffect, useState } from "react";

type TestResult = { ok: boolean; [k: string]: any } | null;
type TestTarget =
  | "gemini"
  | "openrouter"
  | "groq"
  | "cerebras"
  | "cloudflare"
  | "rotation"
  | "sheets";

// Every provider the analyzer can rotate across, in display order. All are
// 100% free with no credit card.
const PROVIDERS: { id: string; label: string; note: string }[] = [
  { id: "gemini", label: "Gemini", note: "free, no card" },
  { id: "groq", label: "Groq", note: "free, no card" },
  { id: "cerebras", label: "Cerebras", note: "free, no card" },
  { id: "openrouter", label: "OpenRouter", note: "free, no card" },
  { id: "cloudflare", label: "Cloudflare", note: "free, no card" },
];

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
  const [selectedProviders, setSelectedProviders] = useState<string[]>(["gemini"]);
  const [geminiKey, setGeminiKey] = useState("");
  const [geminiModel, setGeminiModel] = useState("gemini-2.5-flash");
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [openrouterModel, setOpenrouterModel] = useState("auto");
  const [groqKey, setGroqKey] = useState("");
  const [groqModel, setGroqModel] = useState("llama-3.1-8b-instant");
  const [cerebrasKey, setCerebrasKey] = useState("");
  const [cerebrasModel, setCerebrasModel] = useState("llama-3.3-70b");
  const [cloudflareAccountId, setCloudflareAccountId] = useState("");
  const [cloudflareKey, setCloudflareKey] = useState("");
  const [cloudflareModel, setCloudflareModel] = useState("@cf/meta/llama-3.1-8b-instruct");
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
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(true);
  const [showGroqKey, setShowGroqKey] = useState(true);
  const [showCerebrasKey, setShowCerebrasKey] = useState(true);
  const [showCloudflareKey, setShowCloudflareKey] = useState(true);
  const [showExtensionKey, setShowExtensionKey] = useState(true);

  const [geminiTest, setGeminiTest] = useState<TestResult>(null);
  const [openrouterTest, setOpenrouterTest] = useState<TestResult>(null);
  const [groqTest, setGroqTest] = useState<TestResult>(null);
  const [cerebrasTest, setCerebrasTest] = useState<TestResult>(null);
  const [cloudflareTest, setCloudflareTest] = useState<TestResult>(null);
  const [rotationTest, setRotationTest] = useState<TestResult>(null);
  const [sheetsTest, setSheetsTest] = useState<TestResult>(null);
  const [testing, setTesting] = useState<string>("");

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    const data = await fetch("/api/admin/config").then((r) => r.json());
    try {
      const parsed = JSON.parse(data.ai_providers || "[]");
      setSelectedProviders(Array.isArray(parsed) ? parsed : []);
    } catch {
      setSelectedProviders([]);
    }
    setGeminiKey(data.gemini_api_key || "");
    setGeminiModel(data.gemini_model || "gemini-2.5-flash");
    setOpenrouterKey(data.openrouter_api_key || "");
    setOpenrouterModel(data.openrouter_model || "auto");
    setGroqKey(data.groq_api_key || "");
    setGroqModel(data.groq_model || "llama-3.1-8b-instant");
    setCerebrasKey(data.cerebras_api_key || "");
    setCerebrasModel(data.cerebras_model || "llama-3.3-70b");
    setCloudflareAccountId(data.cloudflare_account_id || "");
    setCloudflareKey(data.cloudflare_api_key || "");
    setCloudflareModel(data.cloudflare_model || "@cf/meta/llama-3.1-8b-instruct");
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
      ai_providers: JSON.stringify(selectedProviders),
      gemini_api_key: geminiKey,
      gemini_model: geminiModel,
      openrouter_api_key: openrouterKey,
      openrouter_model: openrouterModel,
      groq_api_key: groqKey,
      groq_model: groqModel,
      cerebras_api_key: cerebrasKey,
      cerebras_model: cerebrasModel,
      cloudflare_account_id: cloudflareAccountId,
      cloudflare_api_key: cloudflareKey,
      cloudflare_model: cloudflareModel,
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
    if (target === "openrouter") setOpenrouterTest(null);
    if (target === "groq") setGroqTest(null);
    if (target === "cerebras") setCerebrasTest(null);
    if (target === "cloudflare") setCloudflareTest(null);
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
      if (target === "openrouter") setOpenrouterTest(data);
      if (target === "groq") setGroqTest(data);
      if (target === "cerebras") setCerebrasTest(data);
      if (target === "cloudflare") setCloudflareTest(data);
      if (target === "rotation") setRotationTest(data);
      if (target === "sheets") setSheetsTest(data);
    } catch (e: any) {
      const fail = { ok: false, error: String(e?.message || e) };
      if (target === "gemini") setGeminiTest(fail);
      if (target === "openrouter") setOpenrouterTest(fail);
      if (target === "groq") setGroqTest(fail);
      if (target === "cerebras") setCerebrasTest(fail);
      if (target === "cloudflare") setCloudflareTest(fail);
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

  const cloudflareFields = () => (
    <>
      <label style={labelStyle}>Cloudflare Account ID</label>
      <input
        value={cloudflareAccountId}
        onChange={(e) => setCloudflareAccountId(e.target.value)}
        placeholder="32-character account id"
        style={{ ...inputStyle, fontFamily: "monospace" }}
      />
      <label style={labelStyle}>Cloudflare API Token</label>
      <KeyRow
        value={cloudflareKey}
        onChange={setCloudflareKey}
        show={showCloudflareKey}
        onToggle={() => setShowCloudflareKey((v) => !v)}
        placeholder="Workers AI API token"
      />
      <p style={helpStyle}>
        Free, no credit card — 10,000 Neurons/day. Find the Account ID and create a
        Workers AI token at{" "}
        <a href="https://dash.cloudflare.com/?to=/:account/ai/workers-ai" target="_blank" rel="noopener noreferrer" style={linkStyle}>
          dash.cloudflare.com
        </a>
        . Both the account ID and the token are required.
      </p>
      <label style={labelStyle}>Model</label>
      <select value={cloudflareModel} onChange={(e) => setCloudflareModel(e.target.value)} style={inputStyle}>
        <option value="@cf/meta/llama-3.1-8b-instruct">llama-3.1-8b-instruct (recommended)</option>
        <option value="@cf/meta/llama-3.3-70b-instruct-fp8-fast">llama-3.3-70b-instruct-fp8-fast (higher quality)</option>
        <option value="@cf/openai/gpt-oss-120b">gpt-oss-120b</option>
      </select>
      <button type="button" onClick={() => runTest("cloudflare")} disabled={testing === "cloudflare"} style={testBtn}>
        {testing === "cloudflare" ? "Testing..." : "Test Cloudflare"}
      </button>
      {savedNote}
      {renderTest(cloudflareTest)}
    </>
  );

  // Map a provider id to its credential block, so the checklist can render
  // exactly the ticked providers' fields.
  const providerFields: Record<string, () => ReactNode> = {
    gemini: geminiFields,
    groq: groqFields,
    cerebras: cerebrasFields,
    openrouter: openrouterFields,
    cloudflare: cloudflareFields,
  };

  function toggleProvider(id: string) {
    setSelectedProviders((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
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
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>AI Providers</h3>
        <p style={{ fontSize: "0.8rem", color: "#374151", marginBottom: "0.75rem" }}>
          Tick the providers the analyzer may use. Pick <strong>one</strong> for single-provider
          mode, or <strong>several</strong> to rotate across them — when one hits a rate limit the
          analyzer fails over to the next automatically, so the scanner and the LinkedIn
          extension never stall on a single quota.
        </p>
        <div style={{ marginBottom: "0.5rem" }}>
          {PROVIDERS.map((p) => (
            <label key={p.id} style={radioLabel}>
              <input
                type="checkbox"
                checked={selectedProviders.includes(p.id)}
                onChange={() => toggleProvider(p.id)}
              />
              <span>
                <strong>{p.label}</strong>{" "}
                <span style={greenTag}>({p.note})</span>
              </span>
            </label>
          ))}
        </div>

        {selectedProviders.length === 0 && (
          <p style={{ ...helpStyle, color: "#dc2626", marginBottom: 0 }}>
            No provider selected — analysis will fail until you tick at least one.
          </p>
        )}

        {selectedProviders.length > 0 && (
          <div style={providerBlockStyle}>
            <p style={helpStyle}>
              Fill the API key for every ticked provider. Priority is automatic — scanner
              batches prefer large-context providers, the LinkedIn extension prefers the fast
              high-volume ones. A ticked provider with no key is skipped.
            </p>
            {PROVIDERS.filter((p) => selectedProviders.includes(p.id)).map((p) => (
              <div key={p.id} style={rotationCardStyle}>
                {providerFields[p.id]?.()}
              </div>
            ))}
            <button type="button" onClick={() => runTest("rotation")} disabled={testing === "rotation"} style={testBtn}>
              {testing === "rotation" ? "Testing all providers..." : "Test All Selected Providers"}
            </button>
            {savedNote}
            {renderTest(rotationTest)}
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
