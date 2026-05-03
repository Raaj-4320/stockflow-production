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
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex shrink-0 transition-[width] duration-200 ${
          collapsed ? "w-[72px]" : "w-[240px]"
        }`}
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

        <main className="flex-1 min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
