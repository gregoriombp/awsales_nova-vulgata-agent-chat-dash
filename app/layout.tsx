import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/lib/contexts/ToastContext";

export const metadata: Metadata = {
  title: "AwSales 2.0 - Login",
  description: "Authentication system for AwSales 2.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* AwSales Design System fonts — loaded via <link> because Turbopack
         * strips CSS @import. One typographic voice: Mona Sans.
         * JetBrains Mono for code. Material Symbols Rounded for iconography. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Inter — body font. Geist Mono — code only.
         * Haas Neue Grotesk (display/heading) is commercial and must be
         * self-hosted. Drop the .woff2 files in /public/fonts/ and add
         * @font-face in globals.css. Fallback: Inter. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Geist+Mono:wght@400;500;700&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..700,0..1,-25..200&display=block"
        />
      </head>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
