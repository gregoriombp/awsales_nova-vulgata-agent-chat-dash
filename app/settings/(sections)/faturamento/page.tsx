"use client";

import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwPill } from "@/components/ui/AwPill";
import {
  SettingsPageHeader,
  UsageMetric,
} from "../_components/shared";

export default function BillingSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[760px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Faturamento & uso"
        description="Acompanhe consumo dos agentes e o que você paga."
      />
      <AwCard className="!p-0">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-6 py-5">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <p className="m-0 text-[14px] font-medium text-[var(--fg-primary)]">
                Plano Pro
              </p>
              <AwPill variant="ai" dot>
                Atual
              </AwPill>
            </div>
            <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
              Próxima cobrança em{" "}
              <strong className="text-[var(--fg-primary)]">
                14 de maio de 2026
              </strong>{" "}
              · R$ 1.890,00
            </p>
          </div>
          <AwButton size="sm" variant="secondary">
            Mudar plano
          </AwButton>
        </div>
        <div className="grid grid-cols-1 gap-5 border-b border-[var(--border-subtle)] px-6 py-5 md:grid-cols-3">
          <UsageMetric
            label="Mensagens processadas"
            value={42180}
            max={75000}
          />
          <UsageMetric label="Ações executadas" value={3120} max={5000} />
          <UsageMetric
            label="Agentes ativos"
            value={8}
            max={15}
            valueLabel="8 de 15"
          />
        </div>
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-14 items-center justify-center rounded-md border border-[var(--border-default)] bg-[var(--bg-raised)] text-[10px] font-bold tracking-wider text-[var(--fg-primary)]">
              VISA
            </span>
            <div>
              <p className="m-0 text-[13px] font-medium text-[var(--fg-primary)]">
                •••• •••• •••• 4242
              </p>
              <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
                Expira em 09/2028
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <AwButton size="sm" variant="ghost">
              Faturas
            </AwButton>
            <AwButton size="sm" variant="secondary">
              Atualizar cartão
            </AwButton>
          </div>
        </div>
      </AwCard>
    </div>
  );
}
