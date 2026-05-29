"use client";

import { useState, useEffect } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { Locale, AuthScreen } from "../_types";
import { COPY } from "../_copy";

const BACKUP_CODES = [
  "DEMO-A3F9X-K2L7M",
  "DEMO-B8H4P-N6Q1R",
  "DEMO-C2J7V-W3D5T",
  "DEMO-D9K1Z-Y4E8U",
  "DEMO-E6L3B-X7F2H",
  "DEMO-F4M8N-P1G9J",
  "DEMO-G7N2C-Q5H6K",
  "DEMO-H1P5V-R8J3L",
  "DEMO-J5R8D-T2M4W",
  "DEMO-K9T3F-V6N1X",
];

export function MfaBackupCodesScreen({
  locale,
  goTo,
}: {
  locale: Locale;
  goTo: (s: AuthScreen) => void;
}) {
  const c = COPY.mfaBackupCodes[locale];
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(id);
  }, [copied]);

  const copyAll = async () => {
    const text = BACKUP_CODES.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(true);
    }
  };

  const downloadTxt = () => {
    const text = BACKUP_CODES.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "awsales-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-[360px] animate-fadeInUp">
      <h3 className="text-aw-gray-1200 mb-2.5">{c.title}</h3>
      <p className="body-sm text-aw-gray-800 mb-5">{c.sub}</p>

      <div className="mb-4 p-4 rounded-lg border border-aw-gray-300 bg-aw-gray-150">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-[13px] tabular-nums text-aw-gray-1200">
          {BACKUP_CODES.map((code) => (
            <code key={code} className="block">
              {code}
            </code>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        <button
          type="button"
          onClick={copyAll}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-lg border border-aw-gray-300 bg-white body-xs font-medium text-aw-gray-1200 hover:bg-aw-gray-150 transition-colors"
        >
          <Icon name={copied ? "check" : "content_copy"} size={14} />
          {copied ? c.copied : c.copy}
        </button>
        <button
          type="button"
          onClick={downloadTxt}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-lg border border-aw-gray-300 bg-white body-xs font-medium text-aw-gray-1200 hover:bg-aw-gray-150 transition-colors"
        >
          <Icon name="download" size={14} />
          {c.download}
        </button>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-aw-amber-100 border border-aw-amber-200 mb-5">
        <Icon
          name="warning"
          size={16}
          className="text-aw-amber-700 shrink-0 mt-0.5"
        />
        <p className="body-xs text-aw-amber-900 leading-relaxed">{c.warn}</p>
      </div>

      <label className="flex items-start gap-2 mb-5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className={cn(
            "mt-0.5 size-4 rounded border-aw-gray-400 text-aw-gray-1200",
            "focus:ring-2 focus:ring-aw-blue-500/25"
          )}
        />
        <span className="body-sm text-aw-gray-1200">{c.confirm}</span>
      </label>

      <AwButton
        variant="primary"
        size="md"
        block
        onClick={() => goTo("success")}
        disabled={!confirmed}
      >
        {c.cta}
      </AwButton>
    </div>
  );
}
