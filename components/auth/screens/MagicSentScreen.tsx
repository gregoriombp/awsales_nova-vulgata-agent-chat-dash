"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Locale, AuthScreen } from "../_types";
import { COPY } from "../_copy";
import { BackButton } from "../_atoms";

export function MagicSentScreen({
  locale,
  goTo,
  email,
}: {
  locale: Locale;
  goTo: (s: AuthScreen) => void;
  email: string;
}) {
  const c = COPY.magicSent[locale];
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((p) => p - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  return (
    <div className="w-full max-w-[340px] animate-fadeInUp">
      <BackButton onClick={() => goTo("email")} label={c.back} />

      <div className="flex justify-center mb-4">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-aw-gray-150 text-aw-gray-1200">
          <Icon name="mail" size={22} />
        </span>
      </div>

      <h3 className="text-aw-gray-1200 mb-2.5 text-center">{c.title}</h3>
      <p className="body-sm text-aw-gray-800 mb-2 text-center">
        {c.sub} <b className="text-aw-gray-1200">{email}</b>.
      </p>
      <p className="body-xs text-aw-gray-700 mb-6 text-center">{c.hint}</p>

      <div className="flex items-center justify-between">
        <span className="body-xs text-aw-gray-700">
          {countdown > 0 ? (
            `${c.resend} 00:${String(countdown).padStart(2, "0")}`
          ) : (
            <button
              type="button"
              onClick={() => setCountdown(30)}
              className="font-medium text-aw-gray-1200 hover:underline"
            >
              {c.resendReady}
            </button>
          )}
        </span>
        <button
          type="button"
          onClick={() => goTo("email")}
          className="body-xs font-medium text-aw-gray-1200 hover:underline hover:underline-offset-[3px] hover:decoration-[1.5px]"
        >
          {c.change}
        </button>
      </div>
    </div>
  );
}
