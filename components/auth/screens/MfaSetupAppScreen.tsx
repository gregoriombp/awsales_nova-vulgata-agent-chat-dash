"use client";

import { useState, useEffect } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { Icon } from "@/components/ui/Icon";
import type { Locale, AuthScreen } from "../_types";
import { COPY } from "../_copy";
import { BackButton } from "../_atoms";
import { CodeInput } from "../CodeInput";

// Segredos mockados — "Gerar novo QR code" cicla entre eles.
const SECRETS = ["JBSWY3DPEHPK3PXP", "KRSXG5CTMVRXEZLU", "MFRGGZDFMZTWQ2LK"];
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
  const [secretIdx, setSecretIdx] = useState(0);
  const [regenerated, setRegenerated] = useState(false);

  const secret = SECRETS[secretIdx];

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(id);
  }, [copied]);

  useEffect(() => {
    if (!regenerated) return;
    const id = setTimeout(() => setRegenerated(false), 1800);
    return () => clearTimeout(id);
  }, [regenerated]);

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
    } catch {
      setCopied(true);
    }
  };

  const regenerate = () => {
    setSecretIdx((i) => (i + 1) % SECRETS.length);
    setOtp(["", "", "", "", "", ""]);
    setRegenerated(true);
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <div className="w-full max-w-[380px] animate-fadeInUp">
      <BackButton onClick={() => goTo("mfaGate")} label={c.back} />

      <h3 className="text-aw-gray-1200 mb-2.5">{c.title}</h3>
      <p className="body-sm text-aw-gray-800 mb-5">{c.sub}</p>

      <div className="flex flex-col items-center gap-2 mb-5">
        <FakeQrCode />
        <button
          type="button"
          onClick={regenerate}
          className="inline-flex items-center gap-1.5 body-xs font-medium text-aw-gray-1200 hover:underline hover:underline-offset-[3px] hover:decoration-[1.5px]"
        >
          <Icon name={regenerated ? "check" : "refresh"} size={14} />
          {regenerated ? c.regenerated : c.regenerate}
        </button>
      </div>

      <div className="mb-5">
        <label className="block body-xs font-medium text-aw-gray-900 mb-1.5">
          {c.secretLabel}
        </label>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-aw-gray-300 bg-aw-gray-150">
          <code className="flex-1 min-w-0 text-[13px] tracking-wider tabular-nums text-aw-gray-1200 overflow-x-auto">
            {formatSecret(secret)}
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
        <CodeInput value={otp} onChange={setOtp} groupLabel={c.codeLabel} compact />
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
