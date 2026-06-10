"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Locale, AuthScreen } from "../_types";
import { COPY } from "../_copy";

export function SsoConnectingScreen({
  locale,
  goTo,
  orgName,
}: {
  locale: Locale;
  goTo: (s: AuthScreen) => void;
  orgName: string;
}) {
  const c = COPY.ssoConnecting[locale];

  useEffect(() => {
    const id = setTimeout(() => goTo("workspace"), 2200);
    return () => clearTimeout(id);
  }, [goTo]);

  return (
    <div className="w-full max-w-[380px] animate-fadeInUp flex flex-col items-center text-center">
      <span
        aria-hidden="true"
        className="block w-9 h-9 rounded-full border-2 border-aw-gray-300 border-t-aw-gray-1200 animate-spin mb-6"
      />

      <h3 className="text-aw-gray-1200 mb-2.5">
        {c.title} <b>{orgName}</b>
      </h3>
      <p className="body-sm text-aw-gray-800 mb-3">{c.sub}</p>

      <p className="inline-flex items-center gap-1.5 body-xs text-aw-gray-700 mb-6">
        <Icon name="info" size={14} />
        {c.warn}
      </p>

      <button
        type="button"
        onClick={() => goTo("login")}
        className="body-xs font-medium text-aw-gray-1200 hover:underline hover:underline-offset-[3px] hover:decoration-[1.5px]"
      >
        {c.cancel}
      </button>
    </div>
  );
}
