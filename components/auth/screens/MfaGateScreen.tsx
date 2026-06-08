"use client";

import { AwButton } from "@/components/ui/AwButton";
import { Icon } from "@/components/ui/Icon";
import type { Locale, AuthScreen } from "../_types";
import { COPY } from "../_copy";

export function MfaGateScreen({
  locale,
  goTo,
}: {
  locale: Locale;
  goTo: (s: AuthScreen) => void;
}) {
  const c = COPY.mfaGate[locale];

  return (
    <div className="w-full max-w-[380px] animate-fadeInUp">
      <div className="flex justify-center mb-5">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-aw-gray-150 text-aw-gray-1200">
          <Icon name="shield_lock" size={24} />
        </span>
      </div>

      <h3 className="text-aw-gray-1200 mb-2.5 text-center">{c.title}</h3>
      <p className="body-sm text-aw-gray-800 mb-6 text-center">{c.sub}</p>

      <div className="mb-6">
        <label className="block body-xs font-medium text-aw-gray-900 mb-1.5">
          {c.method}
        </label>
        <div className="flex items-start gap-3 p-3 rounded-lg border border-aw-gray-1200 bg-white shadow-[0_0_0_1px_var(--aw-gray-1200)]">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-aw-gray-150 text-aw-gray-1200 shrink-0">
            <Icon name="qr_code_2" size={20} />
          </span>
          <span className="flex-1 min-w-0">
            <span className="block body-sm font-medium text-aw-gray-1200">
              {c.methodApp}
            </span>
            <span className="block body-xs text-aw-gray-700 mt-0.5">
              {c.methodAppDesc}
            </span>
          </span>
          <span className="size-5 rounded-full border border-aw-gray-1200 flex items-center justify-center shrink-0">
            <span className="w-2 h-2 rounded-full bg-aw-gray-1200" />
          </span>
        </div>
      </div>

      <AwButton
        variant="primary"
        size="md"
        block
        onClick={() => goTo("mfaSetupApp")}
      >
        {c.cta}
      </AwButton>

      <p className="body-xs text-center mt-4">
        <button
          type="button"
          onClick={() => goTo("mfaVerify")}
          className="font-medium text-aw-gray-1200 hover:underline hover:underline-offset-[3px] hover:decoration-[1.5px]"
        >
          {c.already}
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
