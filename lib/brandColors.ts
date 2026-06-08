/**
 * Brand colors — official hex values for third-party marks (messaging
 * channels, card networks). These are NOT design-system tokens: they belong
 * to external brands and must stay literal (a Visa logo is always Visa blue,
 * in light or dark mode alike). Centralized here so the same value isn't
 * re-typed across screens and brand artwork stays consistent.
 *
 * Do NOT add product/UI colors here — those live in app/globals.css as
 * semantic tokens (--bg-*, --fg-*, --accent-*). Multi-color logo glyphs
 * (Google, Microsoft, Instagram gradient…) stay inline as artwork in their
 * own SVG component; only reusable single-value brand colors belong here.
 */
export const BRAND_COLORS = {
  // Messaging channels
  whatsapp: "#25D366",
  messenger: "#0084FF",
  telegram: "#0088CC",
  gmail: "#EA4335",
  slack: "#4A154B",
  // Productivity / CRM tools
  pipedrive: "#00A86B",
  google: "#4285F4",
  googleSheets: "#0F9D58",
  // Card networks
  visa: "#1A1F71",
  mastercard: "#EB001B",
  amex: "#2E77BC",
} as const;

export type BrandColorKey = keyof typeof BRAND_COLORS;
