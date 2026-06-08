"use client";

import { useState } from "react";
import { AwInput, AwField } from "@/components/ui/AwInput";
import { AwButton } from "@/components/ui/AwButton";
import { Icon } from "@/components/ui/Icon";
import type { Locale, AuthScreen } from "../_types";
import { COPY } from "../_copy";

export function MfaRecoveryScreen({
  locale,
  goTo,
}: {
  locale: Locale;
  goTo: (s: AuthScreen) => void;
}) {
  const c = COPY.mfaRecovery[locale];
  const [code, setCode] = useState("");
  const isValid = code.trim().length >= 8;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    console.log("MFA backup code:", code);
    goTo("success");
  };

  return (
    <form onSubmit={onSubmit} className="w-full max-w-[380px] animate-fadeInUp">
      <div className="flex justify-center mb-5">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-aw-gray-150 text-aw-gray-1200">
          <Icon name="key" size={24} />
        </span>
      </div>

      <h3 className="text-aw-gray-1200 mb-2.5 text-center">{c.title}</h3>
      <p className="body-sm text-aw-gray-800 mb-6 text-center">{c.sub}</p>

      <div className="mb-5">
        <AwField label={c.code} htmlFor="recoveryCode">
          <AwInput
            id="recoveryCode"
            type="text"
            placeholder={c.codePh}
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </AwField>
      </div>

      <AwButton variant="primary" size="md" block type="submit" disabled={!isValid}>
        {c.cta}
      </AwButton>

      <div className="h-px bg-aw-gray-200 my-6" />
      <p className="body-xs text-center">
        <button
          type="button"
          onClick={() => goTo("mfaVerify")}
          className="text-aw-gray-700 hover:text-aw-gray-1200 hover:underline"
        >
          {c.back}
        </button>
      </p>
    </form>
  );
}
