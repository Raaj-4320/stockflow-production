"use client";

import { ShoppingCart, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

interface PurchasePanelHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: "orders", label: "Purchase Orders" },
  { id: "parties", label: "Parties" },
];

export function PurchasePanelHeader({
  activeTab,
  onTabChange,
}: PurchasePanelHeaderProps) {
  const [isDark, setIsDark] = useState(false);

  // Sync with system preference on mount
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const stored = localStorage.getItem("theme");
    const dark = stored ? stored === "dark" : prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <header className="bg-bg-surface border-b border-border-subtle sticky top-0 z-30">
      <div className="page-container">
        {/* Top row */}
        <div className="flex items-center justify-between py-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent-light flex items-center justify-center shrink-0">
              <ShoppingCart size={18} className="text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-text-primary leading-tight">
                Purchase Panel
              </h1>
              <p className="text-xs text-text-muted leading-tight hidden sm:block">
                Manage orders, suppliers, and procurement
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        {/* Tab row */}
        <div className="flex border-b-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
              className={clsx(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-all duration-[var(--transition-fast)]",
                activeTab === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-text-muted hover:text-text-secondary hover:border-border-default"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
