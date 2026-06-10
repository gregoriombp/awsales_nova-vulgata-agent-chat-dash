"use client";

import { useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwBackupCodes } from "@/components/ui/AwBackupCodes";
import type { Locale, AuthScreen } from "../_types";
import { COPY } from "../_copy";

// Fixtures de demo: prefixo DEMO- deixa inequívoco que não são códigos reais.
const BACKUP_CODES = [
  "DEMO-A3F9X",
  "DEMO-K2L7M",
  "DEMO-B8H4P",
  "DEMO-N6Q1R",
  "DEMO-C2J7V",
  "DEMO-W3D5T",
  "DEMO-D9K1Z",
  "DEMO-Y4E8U",
  "DEMO-E6L3B",
  "DEMO-X7F2H",
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
    <div className="w-full max-w-[380px] animate-fadeInUp">
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
