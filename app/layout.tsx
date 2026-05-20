import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/lib/contexts/ToastContext";
import { AwToastProvider } from "@/components/ui/AwToast";
import { ClaudeEditOverlayProvider } from "@/components/claude-edit/ClaudeEditOverlayProvider";
import { DesktopOnlyBlocker } from "@/components/DesktopOnlyBlocker";

const claudeEditEnabled =
  process.env.NEXT_PUBLIC_CLAUDE_EDIT_ENABLED === "true";

export const metadata: Metadata = {
  title: "AwSales",
  description: "Plataforma de agentes de IA para vendas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* AwSales Design System fonts — loaded via <link> because Turbopack
         * strips CSS @import. One typographic voice: Geist.
         * Geist Mono for code. Material Symbols Rounded for iconography. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Geist — single typographic voice for body, headings and display.
         * Geist Mono — code only. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100;200;300;400;500;600;700;800;900&family=Geist+Mono:wght@100;200;300;400;500;600;700;800;900&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,200..700,0..1,-25..200&display=block"
        />
      </head>
      <body>
        <ToastProvider>
          <AwToastProvider>
            <DesktopOnlyBlocker>{children}</DesktopOnlyBlocker>
            {claudeEditEnabled && <ClaudeEditOverlayProvider />}
          </AwToastProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
