"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ScanLine,
  ArrowLeftRight,
  Users,
  BarChart3,
  Wallet,
  Truck,
  ShoppingBag,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  Bell,
} from "lucide-react";
import { clsx } from "clsx";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Inventory", href: "/inventory", icon: Package },
  { label: "POS System", href: "/pos", icon: ScanLine },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Finance", href: "/finance", icon: Wallet },
  { label: "Freight Booking", href: "/freight", icon: Truck },
  { label: "New Purchase", href: "/procurement", icon: ShoppingBag },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({
  collapsed = false,
  mobile = false,
  onToggleCollapse,
  onNavigate,
}: {
  collapsed?: boolean;
  mobile?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
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
    <div
      className={clsx(
        // Desktop: position:fixed pins the sidebar to the viewport regardless
        // of how tall the page is, so it never slides up at the bottom of
        // a long scroll. The <aside> wrapper in AppShell holds the layout
        // gap so main content still gets the correct left offset.
        // Mobile drawer keeps using its own positioning from AppShell.
        "h-screen flex flex-col w-full glass border-r border-subtle",
        mobile ? "relative shadow-lg" : "fixed top-0 left-0 z-20",
        mobile ? "" : "lg:w-[var(--sidebar-w,240px)]"
      )}
    >
      {/* Brand */}
      <div className="h-14 flex items-center px-4 border-b border-subtle shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-md bg-text text-bg flex items-center justify-center text-xs font-semibold shrink-0">
            S
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-md font-semibold tracking-tight truncate">
                Stockflow
              </div>
              <div className="text-2xs text-muted -mt-0.5">v2.0</div>
            </div>
          )}
        </div>
        {!mobile && (
          <button
            onClick={onToggleCollapse}
            className="ml-auto p-1.5 rounded-sm text-muted hover:text-text hover:bg-surface-hover transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="py-2 px-2">
        <ul className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={clsx(
                    "group relative flex items-center gap-3 rounded-md h-9 px-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-surface-active text-text"
                      : "text-secondary hover:text-text hover:bg-surface-hover",
                    collapsed && "justify-center"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-text" />
                  )}
                  <Icon
                    size={16}
                    className={clsx(
                      "shrink-0 transition-colors",
                      active ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer: theme toggle + bell + admin user (sits right under nav, no big gap) */}
      <div className="mt-3 mx-2 mb-2 pt-2 border-t border-subtle shrink-0 space-y-2">
        <div
          className={clsx(
            "flex items-center gap-1",
            collapsed ? "justify-center flex-col" : "justify-between"
          )}
        >
          <button
            onClick={toggleTheme}
            className="p-2 rounded-sm text-secondary hover:text-text hover:bg-surface-hover transition-colors"
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to light" : "Switch to dark"}
          >
            {mounted ? (
              theme === "dark" ? <Sun size={15} /> : <Moon size={15} />
            ) : (
              <Sun size={15} className="opacity-0" />
            )}
          </button>
          <button
            className="relative p-2 rounded-sm text-secondary hover:text-text hover:bg-surface-hover transition-colors"
            aria-label="Notifications"
          >
            <Bell size={15} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--negative)]" />
          </button>
        </div>

        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md bg-surface">
            <div className="w-7 h-7 rounded-full bg-surface-active flex items-center justify-center text-xs font-semibold shrink-0">
              A
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">Admin User</div>
              <div className="text-2xs text-muted truncate">admin@stockflow.io</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
