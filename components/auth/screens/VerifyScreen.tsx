"use client";

import { useState, useRef, useEffect } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { cn } from "@/lib/utils";
import type { Locale, AuthScreen, VerifyMode } from "../_types";
import { COPY } from "../_copy";
import { BackButton } from "../_atoms";

export function VerifyScreen({
  locale,
  goTo,
  email,
  mode,
}: {
  locale: Locale;
  goTo: (s: AuthScreen) => void;
  email: string;
  mode: VerifyMode;
}) {
  const c = COPY.verify[locale];
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(28);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((p) => p - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

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
    text.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputsRef.current[Math.min(text.length, 5)]?.focus();
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <div className="w-full max-w-[340px] animate-fadeInUp">
      <BackButton onClick={() => goTo(mode === "reset" ? "forgot" : "email")} label={c.back} />

      <h3 className="text-aw-gray-1200 mb-2.5">{c.title}</h3>
      <p className="body-sm text-aw-gray-800 mb-6">
        {c.sub} <b className="text-aw-gray-1200">{email}</b>.{" "}
        {locale === "pt" ? "Cole abaixo para continuar." : "Paste it below to continue."}
      </p>

      <div className="mb-4">
        <label className="block body-xs font-medium text-aw-gray-900 mb-1.5">{c.code}</label>
        <div className="flex gap-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputsRef.current[i] = el; }}
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
                digit ? "bg-aw-gray-150 border-aw-gray-300" : "bg-white border-aw-gray-300"
              )}
            />
          ))}
        </div>
      </div>

      <AwButton variant="primary" size="md" block onClick={() => goTo(mode === "reset" ? "reset" : "workspace")} disabled={!isComplete}>
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
          onClick={() => goTo(mode === "reset" ? "forgot" : "login")}
          className="body-xs font-medium text-aw-gray-1200 hover:underline hover:underline-offset-[3px] hover:decoration-[1.5px]"
        >
          {c.change}
        </button>
      </div>
    </div>
  );
}
