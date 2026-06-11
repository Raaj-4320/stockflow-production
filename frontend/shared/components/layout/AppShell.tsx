"use client";

import { useState, useEffect, useCallback } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeMobile = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="min-h-screen w-full flex">
      {/*
        Desktop sidebar.
        The <aside> here is just a layout spacer that reserves the width;
        the actual <Sidebar> uses position: fixed so it's pinned to the
        viewport and never scrolls — matching the user-requested behavior
        of "sidebar stays at the same place" while scrolling long lists.
        --sidebar-w lets the fixed Sidebar pick up the same width.
      */}
      <aside
        className="hidden lg:block shrink-0 transition-[width] duration-200"
        style={
          {
            width: collapsed ? 72 : 240,
            "--sidebar-w": collapsed ? "72px" : "240px",
          } as React.CSSProperties
        }
      >
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden animate-fade-in"
            onClick={closeMobile}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-[260px] lg:hidden animate-slide-up">
            <Sidebar collapsed={false} mobile onNavigate={closeMobile} />
          </aside>
        </>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Compact mobile-only top bar (just hamburger) */}
        <div className="lg:hidden h-12 px-3 flex items-center border-b border-subtle glass">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-sm text-secondary hover:text-text hover:bg-surface-hover"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <div className="ml-2 text-sm font-semibold tracking-tight">Stockflow</div>
        </div>

        {/*
          overflow-x: clip (not hidden) keeps vertical overflow visible so
          `position: sticky` inside the page can pin to the viewport.
        */}
        <main className="flex-1 min-w-0" style={{ overflowX: "clip" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
