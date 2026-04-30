"use client";

import { useEffect, useState } from "react";

type Rule = { id: number; type: string; pattern: string; active: boolean };

export default function SkipRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [newType, setNewType] = useState("COMPANY");
  const [newPattern, setNewPattern] = useState("");

  useEffect(() => { loadRules(); }, []);

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

  const badgeColor: Record<string, string> = { TITLE: "#7c3aed", COMPANY: "#0891b2", URL: "#ea580c" };
  const inputStyle = { padding: "0.4rem", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "0.8rem" };

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Skip Rules</h1>
      <p style={{ color: "#6b7280", fontSize: "0.8rem", marginBottom: "1rem" }}>
        Jobs matching these rules are automatically skipped during scans.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", alignItems: "center" }}>
        <select value={newType} onChange={(e) => setNewType(e.target.value)} style={inputStyle}>
          <option value="COMPANY">Company</option>
          <option value="TITLE">Title keyword</option>
          <option value="URL">URL contains</option>
        </select>
        <input value={newPattern} onChange={(e) => setNewPattern(e.target.value)} placeholder="Pattern to match..." style={{ ...inputStyle, flex: 1 }}
          onKeyDown={(e) => e.key === "Enter" && addRule()}
        />
        <button onClick={addRule} style={{ padding: "0.4rem 1rem", background: "#1d4ed8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
          Add
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        {rules.length === 0 ? (
          <p style={{ padding: "1rem", color: "#6b7280", fontSize: "0.875rem" }}>No skip rules yet. Default rules will be used.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
                <th style={{ padding: "0.5rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280" }}>Type</th>
                <th style={{ padding: "0.5rem 1rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280" }}>Pattern</th>
                <th style={{ padding: "0.5rem 1rem", textAlign: "right", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6", opacity: r.active ? 1 : 0.5 }}>
                  <td style={{ padding: "0.5rem 1rem" }}>
                    <span style={{ fontSize: "0.7rem", padding: "0.15rem 0.5rem", borderRadius: "9999px", color: "white", background: badgeColor[r.type] || "#6b7280" }}>
                      {r.type}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem 1rem", fontSize: "0.875rem", fontFamily: "monospace" }}>{r.pattern}</td>
                  <td style={{ padding: "0.5rem 1rem", textAlign: "right" }}>
                    <button onClick={() => toggleRule(r.id, r.active)} style={{ marginRight: "0.5rem", padding: "0.2rem 0.5rem", border: "1px solid #d1d5db", borderRadius: "4px", background: "white", cursor: "pointer", fontSize: "0.75rem" }}>
                      {r.active ? "Disable" : "Enable"}
                    </button>
                    <button onClick={() => deleteRule(r.id)} style={{ padding: "0.2rem 0.5rem", border: "1px solid #fca5a5", borderRadius: "4px", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontSize: "0.75rem" }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
