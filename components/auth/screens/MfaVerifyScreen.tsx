"use client";

import { useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { Icon } from "@/components/ui/Icon";
import type { Locale, AuthScreen } from "../_types";
import { COPY } from "../_copy";
import { CodeInput } from "../CodeInput";

export function MfaVerifyScreen({
  locale,
  goTo,
}: {
  locale: Locale;
  goTo: (s: AuthScreen) => void;
}) {
  const c = COPY.mfaVerify[locale];
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [trust, setTrust] = useState(false);

  const isComplete = otp.every((d) => d !== "");

  return (
    <div className="w-full max-w-[380px] animate-fadeInUp">
      <div className="flex justify-center mb-5">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-aw-gray-150 text-aw-gray-1200">
          <Icon name="shield_lock" size={24} />
        </span>
      </div>

      <h3 className="text-aw-gray-1200 mb-2.5 text-center">{c.title}</h3>
      <p className="body-sm text-aw-gray-800 mb-6 text-center">{c.sub}</p>

      <div className="mb-4">
        <label className="block body-xs font-medium text-aw-gray-900 mb-1.5">
          {c.code}
        </label>
        <CodeInput value={otp} onChange={setOtp} groupLabel={c.code} align="center" autoFocus />
      </div>

      <label className="flex items-center justify-center gap-2 mb-5 body-xs text-aw-gray-900 cursor-pointer select-none">
        <AwCheckbox checked={trust} onChange={setTrust} />
        {c.trustDevice}
      </label>

      <AwButton
        variant="primary"
        size="md"
        block
        onClick={() => goTo("success")}
        disabled={!isComplete}
      >
        {c.cta}
      </AwButton>

      <p className="body-xs text-center mt-4">
        <button
          type="button"
          onClick={() => goTo("mfaRecovery")}
          className="font-medium text-aw-gray-1200 hover:underline hover:underline-offset-[3px] hover:decoration-[1.5px]"
        >
          {c.useBackup}
        </button>
      </p>

      <div className="h-px bg-aw-gray-200 my-6" />
      <p className="body-xs text-center">
        <button
          type="button"
          onClick={() => goTo("login")}
          className="text-aw-gray-700 hover:text-aw-gray-1200 hover:underline"
        >
          {c.logout}
        </button>
      </p>
    </div>
  );
}
