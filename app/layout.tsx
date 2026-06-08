import type { Metadata } from "next";
import "./globals.css";
import { AwToastProvider } from "@/components/ui/AwToast";
import { AwThemeProvider } from "@/components/ui/AwThemeProvider";
import { ReviewModeProvider } from "@/components/bombardier-review/ReviewModeProvider";
import { BombardierDot } from "@/components/bombardier/BombardierDot";
import { DesktopOnlyBlocker } from "@/components/DesktopOnlyBlocker";

// Aplica o tema (.dark no <html>) ANTES do primeiro paint, lendo a preferência
// salva (default: light). Evita flash de tema errado e mismatch de hidratação.
const themeNoFlashScript = `(function(){try{var t=localStorage.getItem('aw-theme')||'light';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var e=document.documentElement;e.classList.toggle('dark',d);e.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

// Review Mode is always mounted: it self-gates on the review store's `active`
// flag (renders nothing until you enter review via the Bombardier dot or
// Cmd+Shift+Y), so reviewers can always toggle commenting on.
const bombardierDotEnabled =
  process.env.NEXT_PUBLIC_BOMBARDIER_DOT_DISABLED !== "true";

export const metadata: Metadata = {
  title: "Aswork",
  description: "Plataforma de agentes de IA para vendas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript }} />
        {/* Aswork Design System fonts — loaded via <link> because Turbopack
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
        <AwThemeProvider>
          <AwToastProvider>
            <DesktopOnlyBlocker>{children}</DesktopOnlyBlocker>
            <ReviewModeProvider />
            {bombardierDotEnabled && <BombardierDot />}
          </AwToastProvider>
        </AwThemeProvider>
      </body>
    </html>
  );
}
