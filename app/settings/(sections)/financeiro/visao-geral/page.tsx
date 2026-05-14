"use client";

import Link from "next/link";
import { AwProgress } from "@/components/ui/AwProgress";
import { SectionHeading } from "../../_components/shared";
import { InvoiceCard } from "../_components/InvoiceCard";
import { InvoiceHistoryTable } from "../_components/InvoiceHistoryTable";
import { KpiRow } from "../_components/KpiRow";
import { PlanCard } from "../_components/PlanCard";
import { VariableSpendingBlock } from "../_components/VariableSpendingBlock";
import { brl, OVERVIEW_KPIS } from "../_components/data";

export default function VisaoGeralPage() {
  return (
    <div className="flex flex-col gap-6">
      <PlanCard />
      <InvoiceCard />

      <KpiRow
        items={[
          {
            id: "partial",
            icon: "lock_clock",
            label: "Cobrança parcial em",
            value: brl(OVERVIEW_KPIS.partialChargeAt),
            hint: "Não limita seu uso — quando atingir, cobramos uma fatura parcial e o contador reinicia.",
          },
          {
            id: "accumulated",
            icon: "trending_up",
            label: "Acumulado atual",
            value: brl(OVERVIEW_KPIS.accumulated),
            trailing: (
              <AwProgress
                value={OVERVIEW_KPIS.accumulatedPct}
                max={100}
                valueLabel={`${OVERVIEW_KPIS.accumulatedPct}% até a próxima cobrança parcial`}
              />
            ),
          },
          {
            id: "savings",
            icon: "savings",
            label: "Economia com créditos no mês",
            value: brl(OVERVIEW_KPIS.monthSavings),
            hint: (
              <Link
                href="/settings/financeiro/saldo-creditos"
                className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--accent-brand)] hover:underline"
              >
                Ver saldo de créditos
                <span aria-hidden="true">→</span>
              </Link>
            ),
          },
        ]}
      />

      <p className="m-0 text-[12.5px] leading-[1.55] text-[var(--fg-secondary)]">
        <strong className="font-medium text-[var(--fg-primary)]">
          Não limitamos seu uso.
        </strong>{" "}
        Quando o acumulado atingir o valor de “Cobrança parcial em”, emitimos
        uma cobrança parcial e o contador reinicia — seu uso continua
        normalmente. Falha no pagamento leva a suspensão temporária até a
        regularização.
      </p>

      <VariableSpendingBlock />

      <section>
        <SectionHeading
          title="Histórico de faturas"
          description="Faturas dos últimos meses, com totais brutos, descontos aplicados e o valor efetivamente cobrado."
        />
        <InvoiceHistoryTable />
      </section>
    </div>
  );
}
