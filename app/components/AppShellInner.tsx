"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const SIDEBAR_PATHS = ["/jobs", "/one-click-jobs"];
const PROFILE_OPTIONS = [
  { label: "Jiayong", userId: 1 },
  { label: "Mohan", userId: 2 },
] as const;

export default function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUserId = Number(searchParams?.get("userId") || PROFILE_OPTIONS[0].userId);
  const currentQuery = `?userId=${currentUserId}`;
  const showSidebar = pathname && SIDEBAR_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: "200px",
          borderRight: "1px solid #e5e7eb",
          padding: "1rem 0",
          backgroundColor: "#f9fafb",
        }}
      >
        <div style={{ padding: "0 1rem 0.75rem 1rem", borderBottom: "1px solid #e5e7eb", marginBottom: "0.75rem" }}>
          <label htmlFor="profile-select" style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", marginBottom: "0.35rem" }}>
            Profile
          </label>
          <select
            id="profile-select"
            value={currentUserId}
            onChange={(e) => {
              const nextUserId = Number(e.target.value);
              if (!pathname) return;
              router.replace(`${pathname}?userId=${nextUserId}`);
              router.refresh();
            }}
            style={{
              width: "100%",
              padding: "0.4rem 0.5rem",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              backgroundColor: "white",
              fontSize: "0.875rem",
            }}
          >
            {PROFILE_OPTIONS.map((p) => (
              <option key={p.userId} value={p.userId}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <Link
            href={`/jobs${currentQuery}`}
            style={{
              padding: "0.5rem 1rem",
              textDecoration: "none",
              color: pathname === "/jobs" ? "#1d4ed8" : "#374151",
              fontWeight: pathname === "/jobs" ? 600 : 400,
              backgroundColor: pathname === "/jobs" ? "#dbeafe" : "transparent",
            }}
          >
            Full jobs
          </Link>
          <Link
            href={`/one-click-jobs${currentQuery}`}
            style={{
              padding: "0.5rem 1rem",
              textDecoration: "none",
              color: pathname === "/one-click-jobs" ? "#1d4ed8" : "#374151",
              fontWeight: pathname === "/one-click-jobs" ? 600 : 400,
              backgroundColor: pathname === "/one-click-jobs" ? "#dbeafe" : "transparent",
            }}
          >
            1-Click jobs
          </Link>
        </nav>
      </aside>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
