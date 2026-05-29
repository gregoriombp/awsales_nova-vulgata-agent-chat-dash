"use client";

import { useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwBackupCodes } from "@/components/ui/AwBackupCodes";
import type { Locale, AuthScreen } from "../_types";
import { COPY } from "../_copy";

const BACKUP_CODES = [
  "A3F9X-K2L7M",
  "B8H4P-N6Q1R",
  "C2J7V-W3D5T",
  "D9K1Z-Y4E8U",
  "E6L3B-X7F2H",
  "F4M8N-P1G9J",
  "G7N2C-Q5H6K",
  "H1P5V-R8J3L",
  "J5R8D-T2M4W",
  "K9T3F-V6N1X",
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

  return (
    <div className="w-full max-w-[360px] animate-fadeInUp">
      <h3 className="text-aw-gray-1200 mb-2.5">{c.title}</h3>
      <p className="body-sm text-aw-gray-800 mb-5">{c.sub}</p>

      <AwBackupCodes
        codes={BACKUP_CODES}
        warning={c.warn}
        confirm={{
          checked: confirmed,
          onChange: setConfirmed,
          label: c.confirm,
        }}
        labels={{ copy: c.copy, copied: c.copied, download: c.download }}
        className="mb-5"
      />

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
