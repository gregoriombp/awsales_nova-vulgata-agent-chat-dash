export type AuthScreen =
  | "login"
  | "email"
  | "forgot"
  | "reset"
  | "verify"
  | "magicSent"
  | "ssoConnecting"
  | "workspace"
  | "success";

/** Domínios mockados que disparam SSO empresarial no HRD do front.
 *  Em produção essa decisão é do backend via /auth/discover por DNS. */
export const SSO_DOMAINS: Record<string, string> = {
  "awsales.com": "AwSales",
  "fyntra.com.br": "Fyntra",
};

export function detectSso(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at === -1) return null;
  const domain = email.slice(at + 1).toLowerCase().trim();
  return SSO_DOMAINS[domain] ?? null;
}

export type Locale = "pt" | "en";

export type Org = {
  name: string;
  meta: string;
  avatar?: string;
  pending?: boolean;
};
