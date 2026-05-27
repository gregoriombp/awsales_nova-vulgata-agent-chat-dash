"use client";

import { useState, useRef } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { Locale, AuthScreen } from "../_types";
import { COPY } from "../_copy";

export function MfaVerifyScreen({
  locale,
  goTo,
}: {
  locale: Locale;
  goTo: (s: AuthScreen) => void;
}) {
  const c = COPY.mfaVerify[locale];
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[idx] = value;
    setOtp(next);
    if (value && idx < 5) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = [...otp];
    text.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setOtp(next);
    inputsRef.current[Math.min(text.length, 5)]?.focus();
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <div className="w-full max-w-[340px] animate-fadeInUp">
      <div className="flex justify-center mb-5">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-aw-gray-150 text-aw-gray-1200">
          <Icon name="shield_lock" size={24} />
        </span>
      </div>

      <h3 className="text-aw-gray-1200 mb-2.5 text-center">{c.title}</h3>
      <p className="body-sm text-aw-gray-800 mb-6 text-center">{c.sub}</p>

      <div className="mb-5">
        <label className="block body-xs font-medium text-aw-gray-900 mb-1.5">
          {c.code}
        </label>
        <div className="flex gap-2 justify-center">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className={cn(
                "w-12 h-14 border rounded-lg text-center tabular-nums body-xl font-medium text-aw-gray-1200 outline-none transition-all duration-150",
                "focus:border-aw-blue-600 focus:ring-2 focus:ring-aw-blue-500/25",
                digit
                  ? "bg-aw-gray-150 border-aw-gray-300"
                  : "bg-white border-aw-gray-300"
              )}
            />
          ))}
        </div>
      </div>

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
