"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BrandPane from "./BrandPane";
import { LoginScreen } from "./screens/LoginScreen";
import { EmailLoginScreen } from "./screens/EmailLoginScreen";
import { ForgotScreen } from "./screens/ForgotScreen";
import { ResetScreen } from "./screens/ResetScreen";
import { VerifyScreen } from "./screens/VerifyScreen";
import { MagicSentScreen } from "./screens/MagicSentScreen";
import { SsoConnectingScreen } from "./screens/SsoConnectingScreen";
import { WorkspaceScreen } from "./screens/WorkspaceScreen";
import { MfaGateScreen } from "./screens/MfaGateScreen";
import { MfaSetupAppScreen } from "./screens/MfaSetupAppScreen";
import { MfaBackupCodesScreen } from "./screens/MfaBackupCodesScreen";
import { MfaVerifyScreen } from "./screens/MfaVerifyScreen";
import { MfaRecoveryScreen } from "./screens/MfaRecoveryScreen";
import { SuccessScreen } from "./screens/SuccessScreen";
import { AUTH_SCREENS } from "./_types";
import type { AuthScreen, Locale, VerifyMode, AuthMethod } from "./_types";

export type { AuthScreen };

export function AuthFlow() {
  // A URL é a fonte de verdade da tela: `?screen=email` etc. Cada etapa vira um
  // endereço próprio — deep-link funciona, o browser back anda entre as telas, e
  // o Review Mode (escopado por URL) não vaza comentário de uma tela pra outra.
  // A tela inicial fica na URL nua (/awsales/login) pra não orfanar comentários
  // antigos. Valores inválidos caem no padrão "login".
  const router = useRouter();
  const searchParams = useSearchParams();
  const screenParam = searchParams.get("screen") as AuthScreen | null;
  const screen: AuthScreen =
    screenParam && AUTH_SCREENS.includes(screenParam) ? screenParam : "login";

  // Dados efêmeros do fluxo NÃO vão pra URL — e-mail/modo não são "endereço"
  // (e expor e-mail na barra não faz sentido). Ficam em estado local, que
  // sobrevive à troca de tela porque o segmento de rota não remonta.
  const [locale] = useState<Locale>("pt");
  const [email, setEmail] = useState("");
  const [ssoOrg, setSsoOrg] = useState("");
  const [verifyMode, setVerifyMode] = useState<VerifyMode>("login");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("password");

  const goTo = useCallback(
    (s: AuthScreen) => {
      const url = s === "login" ? "/awsales/login" : `/awsales/login?screen=${s}`;
      router.push(url, { scroll: false });
    },
    [router]
  );

  const renderScreen = () => {
    switch (screen) {
      case "login":         return <LoginScreen locale={locale} goTo={goTo} setEmail={setEmail} setSsoOrg={setSsoOrg} setAuthMethod={setAuthMethod} />;
      case "email":         return <EmailLoginScreen locale={locale} goTo={goTo} defaultEmail={email} setVerifyMode={setVerifyMode} />;
      case "forgot":        return <ForgotScreen locale={locale} goTo={goTo} defaultEmail={email} setVerifyMode={setVerifyMode} />;
      case "reset":         return <ResetScreen locale={locale} goTo={goTo} />;
      case "verify":        return <VerifyScreen locale={locale} goTo={goTo} email={email || "voce@empresa.com"} mode={verifyMode} />;
      case "magicSent":     return <MagicSentScreen locale={locale} goTo={goTo} email={email || "voce@empresa.com"} />;
      case "ssoConnecting": return <SsoConnectingScreen locale={locale} goTo={goTo} orgName={ssoOrg || "sua organização"} />;
      case "workspace":     return <WorkspaceScreen locale={locale} goTo={goTo} skipMfa={authMethod === "sso"} />;
      case "mfaGate":        return <MfaGateScreen locale={locale} goTo={goTo} />;
      case "mfaSetupApp":    return <MfaSetupAppScreen locale={locale} goTo={goTo} />;
      case "mfaBackupCodes": return <MfaBackupCodesScreen locale={locale} goTo={goTo} />;
      case "mfaVerify":      return <MfaVerifyScreen locale={locale} goTo={goTo} />;
      case "mfaRecovery":    return <MfaRecoveryScreen locale={locale} goTo={goTo} />;
      case "success":       return <SuccessScreen locale={locale} />;
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[2fr_3fr]">
      <aside className="flex flex-col bg-white px-8 py-8 xl:px-12 min-h-screen">
        <div className="mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/brand/awsales-wordmark-brand.svg" alt="AwSales" className="h-5 w-auto" />
        </div>

        <div className="flex-1 flex items-center justify-center min-h-0">
          {renderScreen()}
        </div>

        <div className="flex flex-col items-end gap-1.5 pt-4 body-xs text-aw-gray-700">
          <div className="flex gap-1">
            <a href="#" className="text-aw-gray-800 hover:text-aw-gray-1200 hover:underline">
              {locale === "pt" ? "Termos" : "Terms"}
            </a>
            <span>·</span>
            <a href="#" className="text-aw-gray-800 hover:text-aw-gray-1200 hover:underline">
              {locale === "pt" ? "Privacidade" : "Privacy"}
            </a>
          </div>
        </div>
      </aside>

      <BrandPane screen={screen} locale={locale} />
    </div>
  );
}

export default AuthFlow;
