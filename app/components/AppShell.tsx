"use client";

import { Suspense } from "react";

import AppShellInner from "./AppShellInner";

function AppShellFallback({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 200, borderRight: "1px solid #e5e7eb", backgroundColor: "#f9fafb" }} />
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}

/**
 * useSearchParams (and friends) must sit under Suspense on the client so SSR/static
 * generation does not run them without router context (avoids "useContext" null / usePathname errors).
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AppShellFallback>{children}</AppShellFallback>}>
      <AppShellInner>{children}</AppShellInner>
    </Suspense>
  );
}
