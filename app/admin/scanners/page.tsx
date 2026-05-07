"use client";

import { useEffect, useState } from "react";

type Scanner = {
  key: string;
  label: string;
  hint: string;
  defaultMax: number;
  /** Pre-filled search-url value. Empty for sources that need user input (ATS slugs). */
  defaultSearchUrl: string;
  searchPlaceholder: string;
};

const SCANNERS: Scanner[] = [
  // json feeds
  {
    key: "remoteok",
    label: "RemoteOK",
    hint: "public json feed of newest remote jobs. search url is ignored.",
    defaultMax: 50,
    defaultSearchUrl: "",
    searchPlaceholder: "(no config — fetches latest jobs)",
  },
  {
    key: "remotive",
    label: "Remotive",
    hint: "public json api. accepts category=software-dev, search=react, etc.",
    defaultMax: 50,
    defaultSearchUrl: "category=software-dev",
    searchPlaceholder: "category=software-dev,search=typescript",
  },
  {
    key: "jobicy",
    label: "Jobicy",
    hint: "jobicy v2 api. accepts tag=react, jobGeo=anywhere, or a full Jobicy api url.",
    defaultMax: 50,
    defaultSearchUrl: "",
    searchPlaceholder: "tag=javascript,jobGeo=anywhere",
  },
  {
    key: "landingjobs",
    label: "Landing.Jobs",
    hint: "EU-leaning developer api. accepts query params or a full landing.jobs api url.",
    defaultMax: 50,
    defaultSearchUrl: "",
    searchPlaceholder: "remote=true,limit=50",
  },
  // RSS feeds
  {
    key: "weworkremotely",
    label: "We Work Remotely",
    hint: "comma-separated category slugs from weworkremotely.com/categories",
    defaultMax: 50,
    defaultSearchUrl: "remote-programming-jobs,remote-full-stack-programming-jobs",
    searchPlaceholder: "remote-programming-jobs,remote-full-stack-programming-jobs",
  },
  {
    key: "jobspresso",
    label: "Jobspresso",
    hint: "RSS feed at /jobs/feed/ (the bare /feed/ is the empty WordPress blog feed).",
    defaultMax: 50,
    defaultSearchUrl: "https://jobspresso.co/jobs/feed/",
    searchPlaceholder: "https://jobspresso.co/jobs/feed/",
  },
  {
    key: "authenticjobs",
    label: "Authentic Jobs",
    hint: "dev-leaning RSS feed.",
    defaultMax: 50,
    defaultSearchUrl: "https://authenticjobs.com/feed",
    searchPlaceholder: "https://authenticjobs.com/feed",
  },
  {
    key: "nodesk",
    label: "Nodesk",
    hint: "remote-only RSS feed (Hugo-generated atom feed).",
    defaultMax: 50,
    defaultSearchUrl: "https://nodesk.co/remote-jobs/index.xml",
    searchPlaceholder: "https://nodesk.co/remote-jobs/index.xml",
  },
  // ATS multi-company — defaults are curated lists of companies that publish
  // public job boards on each ATS. Override or extend per your watchlist.
  {
    key: "greenhouse",
    label: "Greenhouse (multi-company)",
    hint: "comma-separated company slugs from boards-api.greenhouse.io. defaults to a curated remote-friendly list.",
    defaultMax: 200,
    defaultSearchUrl: "stripe,anthropic,cloudflare,mongodb,samsara,roblox,airbnb,gitlab,intercom,figma,fivetran,robinhood,lyft,asana,instacart,postman,dropbox,vercel,duolingo,discord,newrelic,amplitude,mixpanel,webflow,algolia,airtable,modernhealth",
    searchPlaceholder: "stripe,vercel,airbnb,figma",
  },
  {
    key: "lever",
    label: "Lever (multi-company)",
    hint: "comma-separated company slugs from api.lever.co. lever's public api is sparse — defaults are the few companies confirmed to expose it.",
    defaultMax: 100,
    defaultSearchUrl: "palantir,spotify,rover,highspot,cherre",
    searchPlaceholder: "palantir,spotify,rover",
  },
  {
    key: "ashby",
    label: "Ashby (multi-company)",
    hint: "comma-separated company slugs from api.ashbyhq.com/posting-api.",
    defaultMax: 100,
    defaultSearchUrl: "ramp,ashby,linear,posthog,watershed,replit,supabase,vapi,mintlify",
    searchPlaceholder: "ramp,linear,posthog",
  },
];

type LastScan = {
  board: string;
  jobsFound: number;
  jobsSaved: number;
  errors: string | null;
  createdAt: string;
};

export default function ScannersPage() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, string>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [lastScans, setLastScans] = useState<Record<string, LastScan>>({});

  useEffect(() => {
    fetch("/api/admin/scanners").then((r) => r.json()).then(setConfig);
    refreshStats();
  }, []);

  function refreshStats() {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((s) => {
        setPendingCount(s.pendingJobs || 0);
        const map: Record<string, LastScan> = {};
        for (const row of s.latestPerBoard || []) map[row.board] = row;
        setLastScans(map);
      });
  }

  async function saveConfig() {
    await fetch("/api/admin/scanners", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
  }

  async function runScan(board: string) {
    setRunning(board);
    setResults((prev) => ({ ...prev, [board]: "Running..." }));
    try {
      const res = await fetch("/api/admin/scanners/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board }),
      });
      const data = await res.json();
      if (board === "all") {
        const summary = data.success
          ? `Done: ${data.jobsSaved} new across ${data.outcomes?.length || 0} sources`
          : `Partial: ${data.jobsSaved} saved, ${data.error || "see errors"}`;
        setResults((prev) => ({ ...prev, all: summary }));
      } else {
        const r = Number(data.jobsRefreshed || 0);
        const s = Number(data.jobsRescanned || 0);
        const extras = [r ? `${r} refreshed` : null, s ? `${s} rescanned` : null].filter(Boolean).join(", ");
        setResults((prev) => ({
          ...prev,
          [board]: data.success
            ? `Done: ${data.jobsSaved} new (${data.jobsFound} found${extras ? `, ${extras}` : ""}, ${data.durationMs}ms)${data.warning ? ` · ${data.warning}` : ""}`
            : `Error: ${data.error}`,
        }));
      }
    } catch (err: any) {
      setResults((prev) => ({ ...prev, [board]: `Error: ${err.message}` }));
    }
    setRunning(null);
    refreshStats();
  }

  async function runAnalysis() {
    setAnalyzing(true);
    setAnalyzeResult("Analyzing...");
    try {
      const res = await fetch("/api/admin/analyze", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setAnalyzeResult(`Done: ${data.approved} approved, ${data.rejected} rejected out of ${data.analyzed}`);
      } else {
        setAnalyzeResult(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setAnalyzeResult(`Error: ${err.message}`);
    }
    setAnalyzing(false);
    refreshStats();
  }

  async function runScanAndAnalyze() {
    setRunning("all");
    setResults((prev) => ({ ...prev, all: "Scraping all sources..." }));
    try {
      const scanRes = await fetch("/api/admin/scanners/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board: "all" }),
      });
      const scanData = await scanRes.json();
      setResults((prev) => ({ ...prev, all: `Scrape: ${scanData.jobsSaved} new. Analyzing...` }));
      const analyzeRes = await fetch("/api/admin/analyze", { method: "POST" });
      const analyzeData = await analyzeRes.json();
      const summary = analyzeData.success
        ? `Done: ${scanData.jobsSaved} new · ${analyzeData.approved} approved, ${analyzeData.rejected} rejected`
        : `Scraped ${scanData.jobsSaved}; analyze error: ${analyzeData.error}`;
      setResults((prev) => ({ ...prev, all: summary }));
    } catch (err: any) {
      setResults((prev) => ({ ...prev, all: `Error: ${err.message}` }));
    }
    setRunning(null);
    refreshStats();
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>Scanners</h1>

      <div style={{ background: "#fefce8", border: "1px solid #fde68a", borderRadius: "8px", padding: "1rem", marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{pendingCount} jobs pending AI analysis</div>
          <div style={{ fontSize: "0.75rem", color: "#92400e" }}>Run analysis to filter pending rows and sync approved ones to Google Sheets.</div>
        </div>
        <button
          onClick={runAnalysis}
          disabled={analyzing || pendingCount === 0}
          style={{ padding: "0.5rem 1.25rem", background: analyzing ? "#6b7280" : "#7c3aed", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 500, fontSize: "0.85rem" }}
        >
          {analyzing ? "Analyzing..." : "Analyze Pending Jobs"}
        </button>
      </div>
      {analyzeResult && (
        <div style={{ marginBottom: "1rem", padding: "0.5rem 1rem", borderRadius: "4px", fontSize: "0.85rem", background: analyzeResult.includes("Error") ? "#fef2f2" : "#f0fdf4", color: analyzeResult.includes("Error") ? "#dc2626" : "#16a34a" }}>
          {analyzeResult}
        </div>
      )}

      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "8px", padding: "0.85rem 1rem", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1e3a8a" }}>One-click pipeline</div>
            <div style={{ fontSize: "0.72rem", color: "#1d4ed8" }}>Scrapes every enabled source, then runs analysis on the new pending rows.</div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={() => runScan("all")}
              disabled={running !== null}
              style={{ padding: "0.4rem 1rem", background: running === "all" ? "#6b7280" : "#1d4ed8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 500 }}
            >
              {running === "all" ? "Running..." : "Scrape all sources"}
            </button>
            <button
              onClick={runScanAndAnalyze}
              disabled={running !== null || analyzing}
              style={{ padding: "0.4rem 1rem", background: running === "all" ? "#6b7280" : "#0f766e", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 500 }}
            >
              Scrape + analyze
            </button>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", paddingTop: "0.4rem", borderTop: "1px solid #bfdbfe" }}>
          <label style={{ fontSize: "0.72rem", color: "#1e3a8a", fontWeight: 500 }}>Re-scan duplicates after</label>
          <input
            type="number"
            min={0}
            max={365}
            value={config.scanner_rescan_after_days ?? "0"}
            onChange={(e) => setConfig({ ...config, scanner_rescan_after_days: e.target.value })}
            onBlur={saveConfig}
            style={{ ...inputStyle, width: 80 }}
          />
          <span style={{ fontSize: "0.72rem", color: "#1e3a8a" }}>days (0 = never re-analyze; existing rows still get description / location refreshed on every run)</span>
        </div>
        {results.all && (
          <div style={{ fontSize: "0.78rem", color: results.all.startsWith("Error") ? "#dc2626" : "#1e3a8a" }}>{results.all}</div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {SCANNERS.map((s) => {
          const urlKey = `${s.key}_search_url`;
          const maxKey = `${s.key}_max_jobs`;
          const enabledKey = `${s.key}_enabled`;
          const isEnabled = config[enabledKey] !== "false";
          const last = lastScans[s.key];

          return (
            <div key={s.key} style={{ background: "white", padding: "1rem", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", opacity: isEnabled ? 1 : 0.6 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>{s.label}</h3>
                  <label style={{ fontSize: "0.75rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => { const next = { ...config, [enabledKey]: String(e.target.checked) }; setConfig(next); fetch("/api/admin/scanners", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) }); }}
                    />
                    Enabled
                  </label>
                </div>
                <button
                  onClick={() => runScan(s.key)}
                  disabled={running !== null || !isEnabled}
                  style={{ padding: "0.35rem 1rem", background: running === s.key ? "#6b7280" : "#059669", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}
                >
                  {running === s.key ? "Running..." : "Run Now"}
                </button>
              </div>
              <div style={{ fontSize: "0.7rem", color: "#6b7280", marginBottom: "0.5rem" }}>{s.hint}</div>
              <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "#6b7280", display: "flex", justifyContent: "space-between" }}>
                    <span>Search params / slugs</span>
                    {s.defaultSearchUrl && (config[urlKey] ?? s.defaultSearchUrl) !== s.defaultSearchUrl && (
                      <button
                        onClick={() => { const next = { ...config, [urlKey]: s.defaultSearchUrl }; setConfig(next); fetch("/api/admin/scanners", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) }); }}
                        style={{ background: "transparent", border: "none", color: "#1d4ed8", cursor: "pointer", fontSize: "0.65rem", padding: 0 }}
                      >
                        Reset to default
                      </button>
                    )}
                  </label>
                  <input
                    value={config[urlKey] ?? s.defaultSearchUrl}
                    onChange={(e) => setConfig({ ...config, [urlKey]: e.target.value })}
                    onBlur={saveConfig}
                    placeholder={s.searchPlaceholder}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "#6b7280" }}>Max jobs</label>
                  <input
                    type="number"
                    value={config[maxKey] ?? String(s.defaultMax)}
                    onChange={(e) => setConfig({ ...config, [maxKey]: e.target.value })}
                    onBlur={saveConfig}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", flexWrap: "wrap", gap: "0.4rem", fontSize: "0.72rem" }}>
                {last ? (
                  <span style={{ color: last.errors ? "#b45309" : "#15803d" }}>
                    Last run: {new Date(last.createdAt).toLocaleString()} · {last.jobsSaved} saved / {last.jobsFound} found
                    {last.errors ? ` · ${last.errors}` : ""}
                  </span>
                ) : (
                  <span style={{ color: "#9ca3af" }}>Never run.</span>
                )}
                {results[s.key] && (
                  <span style={{ color: results[s.key].startsWith("Error") ? "#dc2626" : "#16a34a" }}>{results[s.key]}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.4rem 0.55rem",
  border: "1px solid #d1d5db",
  borderRadius: "4px",
  fontSize: "0.8rem",
  background: "white",
  boxSizing: "border-box",
};
