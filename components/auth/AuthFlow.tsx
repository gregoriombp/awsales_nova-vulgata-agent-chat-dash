"use client";

import { useState, useCallback } from "react";
import BrandPane from "./BrandPane";
import { LoginScreen } from "./screens/LoginScreen";
import { EmailLoginScreen } from "./screens/EmailLoginScreen";
import { ForgotScreen } from "./screens/ForgotScreen";
import { ResetScreen } from "./screens/ResetScreen";
import { VerifyScreen } from "./screens/VerifyScreen";
import { WorkspaceScreen } from "./screens/WorkspaceScreen";
import { SuccessScreen } from "./screens/SuccessScreen";
import type { AuthScreen, Locale } from "./_types";

export type { AuthScreen };

export function AuthFlow() {
  const [screen, setScreen] = useState<AuthScreen>("login");
  const [locale] = useState<Locale>("pt");
  const [email] = useState("ana@awsales.com");

  const goTo = useCallback((s: AuthScreen) => setScreen(s), []);

  const renderScreen = () => {
    switch (screen) {
      case "login":     return <LoginScreen locale={locale} goTo={goTo} />;
      case "email":     return <EmailLoginScreen locale={locale} goTo={goTo} />;
      case "forgot":    return <ForgotScreen locale={locale} goTo={goTo} />;
      case "reset":     return <ResetScreen locale={locale} goTo={goTo} />;
      case "verify":    return <VerifyScreen locale={locale} goTo={goTo} email={email} />;
      case "workspace": return <WorkspaceScreen locale={locale} goTo={goTo} />;
      case "success":   return <SuccessScreen locale={locale} />;
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
