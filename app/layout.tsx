import type { Metadata } from "next";
import "./globals.css";
import { AwToastProvider } from "@/components/ui/AwToast";
import { ReviewModeProvider } from "@/components/bombardier-review/ReviewModeProvider";
import { BombardierDot } from "@/components/bombardier/BombardierDot";
import { DesktopOnlyBlocker } from "@/components/DesktopOnlyBlocker";

// Review Mode is always mounted: it self-gates on the review store's `active`
// flag (renders nothing until you enter review via the Bombardier dot or
// Cmd+Shift+Y), so reviewers can always toggle commenting on.
const bombardierDotEnabled =
  process.env.NEXT_PUBLIC_BOMBARDIER_DOT_DISABLED !== "true";

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
        <AwToastProvider>
          <DesktopOnlyBlocker>{children}</DesktopOnlyBlocker>
          <ReviewModeProvider />
          {bombardierDotEnabled && <BombardierDot />}
        </AwToastProvider>
      </body>
    </html>
  );
}
