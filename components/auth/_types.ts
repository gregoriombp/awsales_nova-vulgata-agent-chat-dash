/** Todas as telas do AuthFlow, em ordem. Array runtime para validar o
 *  deep-link `?screen=` (a union de tipo sozinha só existe em tempo de
 *  compilação). */
export const AUTH_SCREENS = [
  "login",
  "email",
  "forgot",
  "resetLinkSent",
  "reset",
  "resetSuccess",
  "verify",
  "magicSent",
  "ssoConnecting",
  "noAccessForMethod",
  "workspace",
  "mfaGate",
  "mfaSetupApp",
  "mfaBackupCodes",
  "mfaVerify",
  "mfaRecovery",
  "success",
] as const;

export type AuthScreen = (typeof AUTH_SCREENS)[number];

/** Como o usuário se autenticou. SSO empresarial delega o MFA ao IdP da org,
 *  então o app NÃO faz challenge de 2FA de novo (evita double-prompt). Social
 *  pessoal (Google/Microsoft) e senha mantêm o MFA do app. */
export type AuthMethod = "password" | "social" | "sso";

/** Domínios mockados que disparam SSO empresarial no HRD do front.
 *  Em produção essa decisão é do backend via /auth/discover por DNS. */
export const SSO_DOMAINS: Record<string, string> = {
  "awsales.com": "Aswork",
  "fyntra.com.br": "Fyntra",
};

export function detectSso(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at === -1) return null;
  const domain = email.slice(at + 1).toLowerCase().trim();
  return SSO_DOMAINS[domain] ?? null;
}

export type Locale = "pt" | "en";

/** Requisito de 2FA da org pra esta sessão (mock do hi-fi):
 *  - "none": não exige verificação extra.
 *  - "setup": exige 2FA e o usuário ainda não configurou (→ gate de setup).
 *  - "verify": exige 2FA e o usuário já tem o app (→ desafio do código). */
export type OrgMfa = "none" | "setup" | "verify";

export type Org = {
  name: string;
  meta: string;
  avatar?: string;
  /** Função do usuário nesta org — mostrada no card (ex.: "admin"). */
  role?: string;
  /** Métodos de login que dão acesso a esta org. O seletor só lista orgs
   *  compatíveis com o método atual; orgs SSO-only não aparecem num login
   *  por senha (anti-enumeração + compatibilidade de método). */
  methods: AuthMethod[];
  /** Estado do 2FA desta org pra esta sessão (mock). Default "none". */
  mfa?: OrgMfa;
  /** A org delega o MFA ao IdP. SÓ então um login SSO pula o 2FA do app —
   *  sem delegação, mesmo via SSO o desafio acontece (não é skip global). */
  mfaDelegatedToIdp?: boolean;
};
