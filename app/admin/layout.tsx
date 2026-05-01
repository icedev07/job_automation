"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/scanners", label: "Scanners" },
  { href: "/admin/skip-rules", label: "Skip Rules" },
  { href: "/admin/logs", label: "Logs" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_authed");
    if (saved === "1") setAuthed(true);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
      sessionStorage.setItem("admin_authed", "1");
    } else {
      const data = await res.json().catch(() => ({}));
      setError(
        typeof data.error === "string"
          ? data.error
          : res.status === 401
            ? "Invalid password"
            : `Login failed (${res.status}). Try again or check deployment logs.`
      );
    }
  }

  if (!authed) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f5f5f7" }}>
        <form onSubmit={handleLogin} style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", width: "320px" }}>
          <h2 style={{ margin: "0 0 1rem", fontSize: "1.25rem", fontWeight: 600 }}>Admin Login</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{ width: "100%", padding: "0.5rem", border: "1px solid #d1d5db", borderRadius: "4px", marginBottom: "0.75rem", fontSize: "0.875rem" }}
          />
          {error && <p style={{ color: "#dc2626", fontSize: "0.8rem", margin: "0 0 0.5rem" }}>{error}</p>}
          <button type="submit" style={{ width: "100%", padding: "0.5rem", background: "#1d4ed8", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: 500 }}>
            Sign in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: "200px", borderRight: "1px solid #e5e7eb", background: "#111827", color: "white", padding: "1rem 0" }}>
        <div style={{ padding: "0 1rem 1rem", borderBottom: "1px solid #374151", marginBottom: "0.5rem" }}>
          <Link href="/" style={{ color: "#9ca3af", textDecoration: "none", fontSize: "0.75rem" }}>Back to Jobs</Link>
          <h2 style={{ margin: "0.5rem 0 0", fontSize: "1rem", fontWeight: 600 }}>Admin Panel</h2>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: "0.5rem 1rem",
                  textDecoration: "none",
                  color: isActive ? "white" : "#9ca3af",
                  background: isActive ? "#1d4ed8" : "transparent",
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: "1rem", marginTop: "auto", borderTop: "1px solid #374151" }}>
          <button
            onClick={() => { sessionStorage.removeItem("admin_authed"); setAuthed(false); }}
            style={{ width: "100%", padding: "0.4rem", background: "transparent", color: "#9ca3af", border: "1px solid #374151", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}
          >
            Logout
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: "1.5rem", background: "#f9fafb" }}>{children}</main>
    </div>
  );
}
