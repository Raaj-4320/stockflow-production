"use client";

import { clsx } from "clsx";

interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: "line" | "pill";
  size?: "sm" | "md";
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = "line",
  size = "md",
  className,
}: TabsProps) {
  if (variant === "pill") {
    return (
      <div
        className={clsx("inline-flex gap-0.5 panel p-1", className)}
        role="tablist"
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              className={clsx(
                "flex items-center gap-1.5 px-3 rounded-md font-medium transition-all",
                size === "sm" ? "h-7 text-xs" : "h-8 text-sm",
                active
                  ? "bg-text text-bg"
                  : "text-secondary hover:text-text hover:bg-surface-hover"
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={clsx(
                    "ml-0.5 px-1.5 py-0.5 rounded-full text-2xs font-semibold",
                    active ? "bg-bg/20 text-bg" : "bg-surface text-muted"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // line variant
  return (
    <div
      className={clsx(
        "flex border-b border-subtle overflow-x-auto no-scrollbar",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={clsx(
              "flex items-center gap-2 px-4 font-medium whitespace-nowrap transition-all border-b-2 -mb-px",
              size === "sm" ? "h-9 text-sm" : "h-10 text-sm",
              active
                ? "border-text text-text"
                : "border-transparent text-secondary hover:text-text"
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={clsx(
                  "px-1.5 py-0.5 rounded-full text-2xs font-semibold",
                  active
                    ? "bg-text text-bg"
                    : "bg-surface text-muted border border-subtle"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
