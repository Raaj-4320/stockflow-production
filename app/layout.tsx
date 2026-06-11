import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "../frontend/shared/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Stockflow",
  description: "Inventory, sales, and finance — beautifully minimal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('theme') ||
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', t === 'dark');
              } catch {}
            `,
          }}
        />
      </head>
      {/*
        suppressHydrationWarning here is intentional: browser extensions
        (ColorZilla → cz-shortcut-listen, Grammarly → data-gr-*, LastPass →
        data-lpignore, etc.) inject attributes onto <body> before React
        hydrates, producing a benign hydration warning. This flag silences
        only the one-level attribute diff on <body>, not its children.
      */}
      <body suppressHydrationWarning>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
