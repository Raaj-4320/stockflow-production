"use client";

import { useEffect, useState } from "react";
import { Bell, Menu, Search, Sun, Moon } from "lucide-react";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t =
      (localStorage.getItem("theme") as "light" | "dark" | null) ||
      (document.documentElement.classList.contains("dark") ? "dark" : "light");
    setTheme(t);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  };

  return (
    <header className="sticky top-0 z-30 h-14 px-4 lg:px-6 flex items-center gap-3 glass border-b border-subtle">
      <button
        onClick={onMenu}
        className="lg:hidden p-1.5 rounded-sm text-secondary hover:text-text hover:bg-surface-hover"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Search */}
      <div className="hidden sm:flex relative max-w-md flex-1">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search anything…  ⌘K"
          className="input-base pl-9 h-9 text-sm"
        />
      </div>

      <div className="flex-1 sm:hidden" />

      {/* Right cluster */}
      <div className="flex items-center gap-1.5 ml-auto">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-sm text-secondary hover:text-text hover:bg-surface-hover transition-colors"
          aria-label="Toggle theme"
          title={theme === "dark" ? "Switch to light" : "Switch to dark"}
        >
          {mounted ? (
            theme === "dark" ? <Sun size={16} /> : <Moon size={16} />
          ) : (
            <Sun size={16} className="opacity-0" />
          )}
        </button>
        <button
          className="relative p-2 rounded-sm text-secondary hover:text-text hover:bg-surface-hover transition-colors"
          aria-label="Notifications"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-text" />
        </button>
        <div className="ml-1 w-8 h-8 rounded-full bg-surface-active flex items-center justify-center text-xs font-semibold">
          A
        </div>
      </div>
    </header>
  );
}
