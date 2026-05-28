"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";

type Rule = { id: number; type: string; pattern: string; active: boolean };

const TYPE_OPTIONS = ["COMPANY", "TITLE", "URL"] as const;
const PAGE_SIZES = [10, 25, 50, 100];

export default function SkipRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [newType, setNewType] = useState("COMPANY");
  const [newPattern, setNewPattern] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [groupByType, setGroupByType] = useState(false);
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);
  const [importMsg, setImportMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadRules();
  }, []);

  // Any change to the filters/grouping/page size resets to the first page so
  // the user never lands on an out-of-range page.
  useEffect(() => {
    setPage(0);
  }, [search, typeFilter, groupByType, pageSize]);

  async function loadRules() {
    const res = await fetch("/api/admin/skip-rules");
    setRules(await res.json());
  }

  async function addRule() {
    if (!newPattern.trim()) return;
    await fetch("/api/admin/skip-rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: newType, pattern: newPattern.trim() }),
    });
    setNewPattern("");
    loadRules();
  }

  async function toggleRule(id: number, active: boolean) {
    await fetch(`/api/admin/skip-rules/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    loadRules();
  }

  async function deleteRule(id: number) {
    await fetch(`/api/admin/skip-rules/${id}`, { method: "DELETE" });
    loadRules();
  }

  // ── Export ────────────────────────────────────────────────────────────────
  function csvEscape(value: string): string {
    // Quote when the value contains a comma, quote, or newline; double inner quotes.
    if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
    return value;
  }

  function exportCsv() {
    const header = "type,pattern,active";
    const lines = rules.map(
      (r) => `${csvEscape(r.type)},${csvEscape(r.pattern)},${r.active}`,
    );
    const csv = [header, ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    a.download = `skip-rules-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── Import (replaces ALL rules) ─────────────────────────────────────────────
  function triggerImport() {
    fileInputRef.current?.click();
  }

  async function onFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset the input so picking the same file twice re-triggers onChange.
    e.target.value = "";
    if (!file) return;

    const ok = window.confirm(
      `Import "${file.name}"?\n\nThis REPLACES all ${rules.length} current skip rule(s) with the contents of the file. This cannot be undone.`,
    );
    if (!ok) return;

    setImportMsg("Importing…");
    try {
      const csv = await file.text();
      const res = await fetch("/api/admin/skip-rules/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setImportMsg(`Import failed: ${data.error || `HTTP ${res.status}`}`);
        return;
      }
      setImportMsg(
        `Imported ${data.imported} rule(s), replaced ${data.dropped}` +
          (data.skipped ? `, skipped ${data.skipped} invalid row(s)` : "") +
          ".",
      );
      await loadRules();
    } catch (err: any) {
      setImportMsg(`Import failed: ${err.message}`);
    }
  }

  // ── Derived view: filter → (optional) group-sort → paginate ─────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rules.filter((r) => {
      if (typeFilter !== "ALL" && r.type !== typeFilter) return false;
      if (q && !r.pattern.toLowerCase().includes(q)) return false;
      return true;
    });
    if (groupByType) {
      list = [...list].sort(
        (a, b) =>
          a.type.localeCompare(b.type) || a.pattern.localeCompare(b.pattern),
      );
    }
    return list;
  }, [rules, search, typeFilter, groupByType]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize,
  );

  // Per-type counts for the summary chips.
  const counts = useMemo(() => {
    const c: Record<string, number> = { TITLE: 0, COMPANY: 0, URL: 0 };
    for (const r of rules) c[r.type] = (c[r.type] || 0) + 1;
    return c;
  }, [rules]);

  const badgeColor: Record<string, string> = {
    TITLE: "#7c3aed",
    COMPANY: "#0891b2",
    URL: "#ea580c",
  };
  const inputStyle: React.CSSProperties = {
    padding: "0.4rem",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    fontSize: "0.8rem",
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
        Skip Rules
      </h1>
      <p style={{ color: "#6b7280", fontSize: "0.8rem", marginBottom: "1rem" }}>
        Jobs matching these rules are automatically skipped during scans.{" "}
        <span style={{ color: "#9ca3af" }}>
          {rules.length} total · {counts.COMPANY} company · {counts.TITLE} title ·{" "}
          {counts.URL} url
        </span>
      </p>

      {/* Add rule */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1rem",
          alignItems: "center",
        }}
      >
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          style={inputStyle}
        >
          <option value="COMPANY">Company</option>
          <option value="TITLE">Title keyword</option>
          <option value="URL">URL contains</option>
        </select>
        <input
          value={newPattern}
          onChange={(e) => setNewPattern(e.target.value)}
          placeholder="Pattern to match..."
          style={{ ...inputStyle, flex: 1 }}
          onKeyDown={(e) => e.key === "Enter" && addRule()}
        />
        <button
          onClick={addRule}
          style={{
            padding: "0.4rem 1rem",
            background: "#1d4ed8",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.8rem",
          }}
        >
          Add
        </button>
      </div>

      {/* Toolbar: search / type filter / group / import-export */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "0.75rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by pattern…"
          style={{ ...inputStyle, flex: 1, minWidth: 180 }}
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={inputStyle}
          title="Filter by type"
        >
          <option value="ALL">All types</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <label
          style={{
            fontSize: "0.78rem",
            color: "#374151",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          <input
            type="checkbox"
            checked={groupByType}
            onChange={(e) => setGroupByType(e.target.checked)}
          />
          Group by type
        </label>
        <button
          onClick={exportCsv}
          disabled={rules.length === 0}
          style={{
            padding: "0.4rem 0.8rem",
            background: "white",
            color: "#1d4ed8",
            border: "1px solid #bfdbfe",
            borderRadius: "4px",
            cursor: rules.length === 0 ? "not-allowed" : "pointer",
            fontSize: "0.78rem",
            opacity: rules.length === 0 ? 0.5 : 1,
          }}
          title="Download all rules as CSV"
        >
          Export CSV
        </button>
        <button
          onClick={triggerImport}
          style={{
            padding: "0.4rem 0.8rem",
            background: "#fff7ed",
            color: "#c2410c",
            border: "1px solid #fed7aa",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.78rem",
          }}
          title="Replace ALL rules with a CSV file"
        >
          Import CSV (replace all)
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={onFileChosen}
          style={{ display: "none" }}
        />
      </div>

      {importMsg && (
        <div
          style={{
            marginBottom: "0.75rem",
            padding: "0.5rem 0.8rem",
            borderRadius: "4px",
            fontSize: "0.8rem",
            background: importMsg.startsWith("Import failed") ? "#fef2f2" : "#f0fdf4",
            color: importMsg.startsWith("Import failed") ? "#dc2626" : "#16a34a",
          }}
        >
          {importMsg}
        </div>
      )}

      <div
        style={{
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        {rules.length === 0 ? (
          <p style={{ padding: "1rem", color: "#6b7280", fontSize: "0.875rem" }}>
            No skip rules yet. Default rules will be used.
          </p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: "1rem", color: "#6b7280", fontSize: "0.875rem" }}>
            No rules match your filters.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Pattern</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((r, idx) => {
                // When grouping, render a subheader row whenever the type changes.
                const prev = idx > 0 ? pageItems[idx - 1].type : null;
                const showGroupHeader = groupByType && r.type !== prev;
                return (
                  <Fragment key={r.id}>
                    {showGroupHeader && (
                      <tr style={{ background: "#f3f4f6" }}>
                        <td
                          colSpan={3}
                          style={{
                            padding: "0.35rem 1rem",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            color: "#374151",
                            letterSpacing: "0.03em",
                          }}
                        >
                          {r.type} ({filtered.filter((x) => x.type === r.type).length})
                        </td>
                      </tr>
                    )}
                    <tr
                      style={{
                        borderBottom: "1px solid #f3f4f6",
                        opacity: r.active ? 1 : 0.5,
                      }}
                    >
                      <td style={{ padding: "0.5rem 1rem" }}>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            padding: "0.15rem 0.5rem",
                            borderRadius: "9999px",
                            color: "white",
                            background: badgeColor[r.type] || "#6b7280",
                          }}
                        >
                          {r.type}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "0.5rem 1rem",
                          fontSize: "0.875rem",
                          fontFamily: "monospace",
                          wordBreak: "break-all",
                        }}
                      >
                        {r.pattern}
                      </td>
                      <td style={{ padding: "0.5rem 1rem", textAlign: "right", whiteSpace: "nowrap" }}>
                        <button
                          onClick={() => toggleRule(r.id, r.active)}
                          style={{
                            marginRight: "0.5rem",
                            padding: "0.2rem 0.5rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "4px",
                            background: "white",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                          }}
                        >
                          {r.active ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => deleteRule(r.id)}
                          style={{
                            padding: "0.2rem 0.5rem",
                            border: "1px solid #fca5a5",
                            borderRadius: "4px",
                            background: "#fef2f2",
                            color: "#dc2626",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "0.75rem",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>
            Showing {safePage * pageSize + 1}–
            {Math.min(filtered.length, safePage * pageSize + pageSize)} of{" "}
            {filtered.length}
            {filtered.length !== rules.length ? ` (filtered from ${rules.length})` : ""}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.75rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              Per page
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                style={inputStyle}
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              style={pagerBtn(safePage === 0)}
            >
              Prev
            </button>
            <span style={{ fontSize: "0.78rem", color: "#374151" }}>
              Page {safePage + 1} / {pageCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
              style={pagerBtn(safePage >= pageCount - 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  textAlign: "left",
  fontSize: "0.75rem",
  fontWeight: 600,
  color: "#6b7280",
};

function pagerBtn(disabled: boolean): React.CSSProperties {
  return {
    padding: "0.3rem 0.7rem",
    border: "1px solid #d1d5db",
    borderRadius: "4px",
    background: "white",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: "0.78rem",
    opacity: disabled ? 0.5 : 1,
  };
}
