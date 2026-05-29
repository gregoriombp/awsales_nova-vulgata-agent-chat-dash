"use client";

import { useState, useRef, useEffect } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { Locale, AuthScreen } from "../_types";
import { COPY } from "../_copy";
import { BackButton } from "../_atoms";

const SECRET = "JBSWY3DPEHPK3PXP";
const formatSecret = (s: string) => s.match(/.{1,4}/g)?.join(" ") ?? s;

function FakeQrCode() {
  return (
    <div
      role="img"
      aria-label="QR code"
      className="inline-flex items-center justify-center w-44 h-44 rounded-xl bg-white border border-aw-gray-300 p-3"
    >
      <Icon
        name="qr_code_2"
        size={156}
        weight={300}
        className="text-aw-gray-1200"
      />
    </div>
  );
}

export function MfaSetupAppScreen({
  locale,
  goTo,
}: {
  locale: Locale;
  goTo: (s: AuthScreen) => void;
}) {
  const c = COPY.mfaSetupApp[locale];
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [copied, setCopied] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(id);
  }, [copied]);

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

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(SECRET);
      setCopied(true);
    } catch {
      setCopied(true);
    }
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <div className="w-full max-w-[360px] animate-fadeInUp">
      <BackButton onClick={() => goTo("mfaGate")} label={c.back} />

      <h3 className="text-aw-gray-1200 mb-2.5">{c.title}</h3>
      <p className="body-sm text-aw-gray-800 mb-5">{c.sub}</p>

      <div className="flex justify-center mb-5">
        <FakeQrCode />
      </div>

      <div className="mb-5">
        <label className="block body-xs font-medium text-aw-gray-900 mb-1.5">
          {c.secretLabel}
        </label>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-aw-gray-300 bg-aw-gray-150">
          <code className="flex-1 min-w-0 text-[13px] tracking-wider tabular-nums text-aw-gray-1200 overflow-x-auto">
            {formatSecret(SECRET)}
          </code>
          <button
            type="button"
            onClick={copySecret}
            className="inline-flex items-center gap-1 body-xs font-medium text-aw-gray-1200 hover:underline shrink-0"
          >
            <Icon name={copied ? "check" : "content_copy"} size={14} />
            {copied ? c.copied : c.copy}
          </button>
        </div>
      </div>

      <div className="mb-5">
        <label className="block body-xs font-medium text-aw-gray-900 mb-1.5">
          {c.codeLabel}
        </label>
        <div className="flex gap-2">
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
                "w-11 h-13 border rounded-lg text-center tabular-nums body-xl font-medium text-aw-gray-1200 outline-none transition-all duration-150",
                "focus:border-aw-blue-600 focus:ring-2 focus:ring-aw-blue-500/25",
                digit
                  ? "bg-aw-gray-150 border-aw-gray-300"
                  : "bg-white border-aw-gray-300"
              )}
              style={{ height: 52 }}
            />
          ))}
        </div>
      </div>

      <AwButton
        variant="primary"
        size="md"
        block
        onClick={() => goTo("mfaBackupCodes")}
        disabled={!isComplete}
      >
        {c.cta}
      </AwButton>
    </div>
  );
}
