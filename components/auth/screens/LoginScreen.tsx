"use client";

import { useState } from "react";
import { AwInput, AwField } from "@/components/ui/AwInput";
import { AwButton } from "@/components/ui/AwButton";
import { Icon } from "@/components/ui/Icon";
import type { Locale, AuthScreen, AuthMethod } from "../_types";
import { detectSso } from "../_types";
import { COPY } from "../_copy";
import { SsoButton } from "../_atoms";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";

function GoogleIcon() {
  return <AwBrandLogo brand="google" markOnly size={18} aria-hidden />;
}

function MsIcon() {
  return <AwBrandLogo brand="microsoft" markOnly size={18} aria-hidden />;
}

export function LoginScreen({
  locale,
  goTo,
  setEmail,
  setSsoOrg,
  setAuthMethod,
}: {
  locale: Locale;
  goTo: (s: AuthScreen) => void;
  setEmail: (e: string) => void;
  setSsoOrg: (org: string) => void;
  setAuthMethod: (m: AuthMethod) => void;
}) {
  const c = COPY.login[locale];
  const [emailInput, setEmailInput] = useState("");
  const [magicLinkMode, setMagicLinkMode] = useState(false);

  const emailValid = emailInput.includes("@");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = emailInput.trim();
    if (!trimmed.includes("@")) return;
    setEmail(trimmed);
    // No modo link mágico o submit envia direto pra rota do link.
    if (magicLinkMode) {
      setAuthMethod("password");
      goTo("magicSent");
      return;
    }
    const ssoOrg = detectSso(trimmed);
    if (ssoOrg) {
      setSsoOrg(ssoOrg);
      setAuthMethod("sso");
      goTo("ssoConnecting");
    } else {
      setAuthMethod("password");
      goTo("email");
    }
  };

  // Magic link: clicar aqui não navega de cara — entra no "modo link mágico".
  // Some suavemente Google/Microsoft + o divisor "ou" e o "Continuar" vira
  // "Enviar link para meu email"; o envio acontece no submit do form.
  const toggleMagic = () => {
    if (!magicLinkMode && !emailInput.trim().includes("@")) {
      document.getElementById("loginEmail")?.focus();
    }
    setMagicLinkMode((v) => !v);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[380px] animate-fadeInUp">
      <h3 className="text-aw-gray-1200 mb-2.5 text-center">{c.title}</h3>
      <p className="body-sm text-aw-gray-800 mb-7 text-center">{c.sub}</p>

      <div className="mb-3">
        <AwField label={c.email} htmlFor="loginEmail">
          <AwInput
            id="loginEmail"
            type="email"
            placeholder={c.emailPh}
            autoComplete="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            autoFocus
          />
        </AwField>
      </div>

      <AwButton variant="primary" size="md" block type="submit" disabled={!emailValid}>
        {magicLinkMode ? c.magicCta : c.cta}
      </AwButton>

      <div
        className={
          "overflow-hidden transition-all duration-300 ease-out " +
          (magicLinkMode
            ? "max-h-0 opacity-0 pointer-events-none"
            : "max-h-60 opacity-100")
        }
        aria-hidden={magicLinkMode}
      >
        <div className="mt-5 flex items-center gap-3" aria-hidden="true">
          <span className="flex-1 h-px bg-aw-gray-200" />
          <span className="body-xs text-aw-gray-700">{c.or}</span>
          <span className="flex-1 h-px bg-aw-gray-200" />
        </div>

        <div className="mt-4 flex flex-col gap-2.5">
          <SsoButton icon={<GoogleIcon />} label={c.ssoGoogle} onClick={() => { setAuthMethod("social"); goTo("workspace"); }} />
          <SsoButton icon={<MsIcon />} label={c.ssoMs} onClick={() => { setAuthMethod("social"); goTo("workspace"); }} />
        </div>
      </div>

      <p className="mt-5 text-center">
        <button
          type="button"
          onClick={toggleMagic}
          className="inline-flex items-center gap-1.5 body-xs font-medium text-aw-gray-1200 hover:underline hover:underline-offset-[3px] hover:decoration-[1.5px]"
        >
          <Icon name={magicLinkMode ? "arrow_back" : "mail"} size={14} />
          {magicLinkMode ? c.magicBack : c.magicLink}
        </button>
      </p>
    </form>
  );
}
