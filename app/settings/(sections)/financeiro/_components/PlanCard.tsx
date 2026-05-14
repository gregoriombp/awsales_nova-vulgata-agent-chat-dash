"use client";

import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwPill } from "@/components/ui/AwPill";
import { brl, CURRENT_PLAN } from "./data";

export function PlanCard() {
  return (
    <AwCard className="!p-0">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2">
            <p className="m-0 text-[15px] font-semibold text-[var(--fg-primary)]">
              {CURRENT_PLAN.name}
            </p>
            <AwPill variant="live">{CURRENT_PLAN.status}</AwPill>
          </div>
          <p className="m-0 text-[12.5px] text-[var(--fg-secondary)]">
            <strong className="font-semibold text-[var(--fg-primary)]">
              {brl(CURRENT_PLAN.monthly)}
            </strong>{" "}
            / mês · próxima cobrança em {CURRENT_PLAN.nextChargeAt}
          </p>
        </div>
        <AwButton size="sm" variant="secondary" iconRight="arrow_forward">
          Detalhes do plano
        </AwButton>
      </div>
    </AwCard>
  );
}
