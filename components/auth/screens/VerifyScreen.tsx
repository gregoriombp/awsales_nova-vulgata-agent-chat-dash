"use client";

import { useState, useEffect } from "react";
import { AwButton } from "@/components/ui/AwButton";
import type { Locale, AuthScreen } from "../_types";
import { COPY } from "../_copy";
import { BackButton } from "../_atoms";
import { CodeInput } from "../CodeInput";

/**
 * Verificação por e-mail após e-mail+senha (step-up por código, NÃO um segundo
 * fator forte). A recuperação de senha é por link e não passa mais por aqui.
 */
export function VerifyScreen({
  locale,
  goTo,
  email,
}: {
  locale: Locale;
  goTo: (s: AuthScreen) => void;
  email: string;
}) {
  const c = COPY.verify[locale];
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(28);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((p) => p - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const isComplete = otp.every((d) => d !== "");

  return (
    <div className="w-full max-w-[380px] animate-fadeInUp">
      <BackButton onClick={() => goTo("email")} label={c.back} />

      <h3 className="text-aw-gray-1200 mb-2.5">{c.title}</h3>
      <p className="body-sm text-aw-gray-800 mb-6">
        {c.sub} <b className="text-aw-gray-1200">{email}</b>.{" "}
        {locale === "pt" ? "Cole abaixo para continuar." : "Paste it below to continue."}
      </p>

      <div className="mb-4">
        <label className="block body-xs font-medium text-aw-gray-900 mb-1.5">{c.code}</label>
        <CodeInput value={otp} onChange={setOtp} groupLabel={c.code} autoFocus />
      </div>

      <AwButton variant="primary" size="md" block onClick={() => goTo("workspace")} disabled={!isComplete}>
        {c.cta}
      </AwButton>

      <div className="flex items-center justify-between mt-4">
        <span className="body-xs text-aw-gray-700">
          {countdown > 0 ? (
            `${c.resend} 00:${String(countdown).padStart(2, "0")}`
          ) : (
            <button
              type="button"
              onClick={() => setCountdown(28)}
              className="font-medium text-aw-gray-1200 hover:underline"
            >
              {c.resendReady}
            </button>
          )}
        </span>
        <button
          type="button"
          onClick={() => goTo("login")}
          className="body-xs font-medium text-aw-gray-1200 hover:underline hover:underline-offset-[3px] hover:decoration-[1.5px]"
        >
          {c.change}
        </button>
      </div>
    </div>
  );
}
