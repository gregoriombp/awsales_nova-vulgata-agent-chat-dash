"use client";

import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "../../_components/shared";
import { ApplyCouponBlock } from "../_components/ApplyCouponBlock";
import { CreditsTable } from "../_components/CreditsTable";
import { brl, CREDITS_KPIS, VOUCHERS } from "../_components/data";

export default function SaldoCreditosPage() {
  const accelerated = VOUCHERS.find((v) => v.acceleratedConsumption);

  return (
    <div className="flex flex-col gap-10">
      <CreditsHero />
      {accelerated && (
        <AcceleratedBanner
          name={accelerated.description}
          expiresAt={accelerated.expiresAt}
        />
      )}

      <ApplyCouponBlock />

      <section>
        <SectionHeading
          title="Vouchers &amp; cupons"
          description="Créditos emitidos e códigos de desconto redimidos. Vouchers mostram consumo em tempo real; cupons exibem o valor descontado."
        />
        <CreditsTable />
      </section>
    </div>
  );
}

function CreditsHero() {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
          Saldo disponível
        </p>
        <h2 className="m-0 mt-1.5 text-[44px] font-semibold leading-none tracking-[-0.02em] text-[var(--fg-primary)]">
          {brl(CREDITS_KPIS.availableDiscount)}
        </h2>
        <p className="m-0 mt-2 text-[12.5px] text-[var(--fg-secondary)]">
          Saldo de vouchers e cupons não consumido. A aplicação varia por
          item — alguns valem para disparos, tokens ou taxas específicas.
        </p>
      </div>
    </section>
  );
}

function AcceleratedBanner({
  name,
  expiresAt,
}: {
  name: string;
  expiresAt: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-muted)] px-4 py-3">
      <Icon
        name="warning"
        size={18}
        className="shrink-0 text-[var(--accent-warning)]"
      />
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[13px] font-medium text-[var(--fg-primary)]">
          {name} está sendo consumido 2,3× acima do previsto
        </p>
        <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
          No ritmo atual, pode expirar antes da data de término ({expiresAt}).
        </p>
      </div>
    </div>
  );
}
