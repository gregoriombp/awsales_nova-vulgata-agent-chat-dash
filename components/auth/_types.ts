export type AuthScreen =
  | "login"
  | "email"
  | "forgot"
  | "reset"
  | "verify"
  | "magicSent"
  | "ssoConnecting"
  | "workspace"
  | "mfaGate"
  | "mfaSetupApp"
  | "mfaBackupCodes"
  | "mfaVerify"
  | "mfaRecovery"
  | "success";

/** De onde a tela de código (`verify`) foi aberta: login normal ou recuperação
 *  de senha. Decide pra onde continuar e pra onde o "usar outro email" volta. */
export type VerifyMode = "login" | "reset";

/** Como o usuário se autenticou. SSO empresarial delega o MFA ao IdP da org,
 *  então o app NÃO faz challenge de 2FA de novo (evita double-prompt). Social
 *  pessoal (Google/Microsoft) e senha mantêm o MFA do app. */
export type AuthMethod = "password" | "social" | "sso";

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
