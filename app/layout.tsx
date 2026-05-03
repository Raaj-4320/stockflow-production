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
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
