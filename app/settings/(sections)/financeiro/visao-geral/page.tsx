"use client";

import * as React from "react";
import Link from "next/link";
import { AwCard } from "@/components/ui/AwCard";
import { AwShortcutTile } from "@/components/ui/AwShortcutTile";
import { AwInvoiceForecastCard } from "@/components/ui/AwInvoiceForecastCard";
import { AwConsumptionBar } from "@/components/ui/AwConsumptionBar";
import { AwPlanIcon, type PlanKey } from "@/components/ui/AwPlanIcon";
import { Icon } from "@/components/ui/Icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  brl,
  CURRENT_INVOICE,
  CURRENT_PLAN,
  fmtUsdLabel,
  INVOICE_HISTORY,
  OVERVIEW_KPIS,
  PAYMENT_METHODS,
  SERVICE_BREAKDOWN,
  VARIABLE_SPENDING_LIMIT,
} from "../_components/data";

function planKey(name: string): PlanKey {
  const n = name.toLowerCase();
  if (n.includes("enterprise")) return "enterprise";
  if (n.includes("pro")) return "pro";
  return "starter";
}

/**
 * Visão geral — reestruturação.
 * Uma overview se lê em segundos: o total estimado da próxima fatura no topo,
 * consumo variável e plano lado a lado, um hub para as subpáginas e — só então —
 * o detalhamento de consumo, rebaixado para o fim.
 */
export default function VisaoGeralPage() {
  return (
    <div className="flex flex-col gap-8">
      <ForecastBlock />
      <UsageAndPlan />
      <NavHub />
      <ConsumptionSection />
    </div>
  );
}

/* ---------- herói: previsão (estimada) da próxima fatura ---------- */

function ForecastBlock() {
  const discount = OVERVIEW_KPIS.monthSavings;
  const total = CURRENT_PLAN.monthly + OVERVIEW_KPIS.accumulated - discount;
  const card = CURRENT_INVOICE.paymentMethod;
  const breakdown = [
    {
      label: "Assinatura",
      value: CURRENT_PLAN.monthly,
      kind: "base" as const,
      icon: "workspace_premium",
    },
    {
      label: "Variável",
      value: OVERVIEW_KPIS.accumulated,
      kind: "add" as const,
      icon: "bolt",
    },
    ...(discount > 0
      ? [
          {
            label: "Desconto",
            value: discount,
            kind: "subtract" as const,
            icon: "local_offer",
          },
        ]
      : []),
  ];

  return (
    <AwInvoiceForecastCard
      bare
      eyebrow={`Próxima cobrança · ${CURRENT_PLAN.nextChargeAt} · ${card.brand} •••• ${card.last4}`}
      total={total}
      estimateLabel={null}
      estimateNote={
        <>
          É uma estimativa: como o IOF no cartão, o valor final só fecha na
          cobrança de {CURRENT_PLAN.nextChargeAt} — o consumo variável conta até
          o fim do ciclo e o câmbio é convertido na hora. Atualizado em{" "}
          {CURRENT_INVOICE.dueAt} às 14:30.
        </>
      }
      breakdown={breakdown}
      cta={{
        label: "Ver fatura detalhada",
        href: "/settings/financeiro/historico-faturas",
      }}
    />
  );
}

/* ---------- consumo variável + plano (dois cards) ---------- */

function UsageAndPlan() {
  return (
    <div className="grid grid-cols-2 items-stretch gap-6">
      <ConsumoVariavelCard />
      <PlanoCard />
    </div>
  );
}

function ConsumoVariavelCard() {
  const used = OVERVIEW_KPIS.accumulated;
  const limit = VARIABLE_SPENDING_LIMIT;
  const remaining = Math.max(limit - used, 0);

  return (
    <AwCard className="flex flex-col gap-4 px-6! py-4!">
      <div className="flex items-baseline justify-between gap-3">
        <h6 className="m-0 flex items-center gap-1.5 body-lg font-medium text-(--fg-primary)">
          Consumo variável
          <TooltipProvider delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="O que é consumo variável"
                  className="inline-flex text-(--fg-tertiary) hover:text-(--fg-primary)"
                >
                  <Icon name="info" size={15} />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="max-w-[280px] border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)"
              >
                Gastos que variam com o uso (disparos, mensagens, tokens de IA e
                leads), além do plano fixo. Ao atingir o limite do ciclo, o
                acumulado é cobrado automaticamente.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h6>
        <span className="body-sm tabular-nums text-(--fg-secondary)">
          <strong className="font-medium text-(--fg-primary)">
            {brl(used)}
          </strong>{" "}
          de {brl(limit)}
        </span>
      </div>
      <AwConsumptionBar gross={used} limit={limit} />
      <p className="m-0 body-xs tabular-nums text-(--fg-tertiary)">
        Restam {brl(remaining)} antes da cobrança automática do ciclo.
      </p>
    </AwCard>
  );
}

function PlanoCard() {
  return (
    <AwCard className="flex items-center gap-4 border-(--border-strong) px-6! py-4!">
      <span
        aria-hidden="true"
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-(--bg-inverse)"
      >
        <AwPlanIcon plan={planKey(CURRENT_PLAN.name)} variant="dark" size={44} />
      </span>
      <div className="min-w-0">
        <p className="m-0 body-lg font-medium text-(--fg-primary)">
          {CURRENT_PLAN.name}
        </p>
        <p className="m-0 mt-0.5 body-sm tabular-nums text-(--fg-secondary)">
          <strong className="font-medium text-(--fg-primary)">
            {brl(CURRENT_PLAN.monthly)}
          </strong>
          /mês · renova em {CURRENT_PLAN.nextChargeAt}
        </p>
      </div>
    </AwCard>
  );
}

/* ---------- hub de navegação para as subpáginas ---------- */

function NavHub() {
  const defaultMethod =
    PAYMENT_METHODS.find((m) => m.isDefault) ?? PAYMENT_METHODS[0];
  const latestInvoice = INVOICE_HISTORY[0];

  // Consumo e Atividade saíram dos atalhos — Consumo tem aba própria e o
  // detalhe vive na seção abaixo; Atividade era redundante com a aba.
  return (
    <nav aria-label="Atalhos do financeiro">
      {/* Flat — sem caixa nem padding extra: os atalhos respiram no fluxo da
          página, separados só pelo gap. Hover de cada tile dá o contorno. */}
      <ul className="m-0 grid grid-cols-2 list-none gap-x-8 gap-y-1 p-0">
        <li className="m-0">
          <AwShortcutTile
            icon="receipt_long"
            title="Faturas"
            description={`${latestInvoice.refMonth} · ${latestInvoice.status}`}
            href="/settings/financeiro/historico-faturas"
          />
        </li>
        <li className="m-0">
          <AwShortcutTile
            icon="credit_card"
            title="Métodos de pagamento"
            description={`${defaultMethod.brand} •••• ${defaultMethod.last4} · ${PAYMENT_METHODS.length} cartões`}
            href="/settings/financeiro/metodos-pagamento"
          />
        </li>
      </ul>
    </nav>
  );
}

/* ---------- consumo do ciclo: resumo compacto + link pro detalhamento ---------- */

function ConsumptionSection() {
  const used = OVERVIEW_KPIS.accumulated;
  // Maior categoria de gasto, ignorando a linha agregada "outros".
  const topService = React.useMemo(
    () =>
      [...SERVICE_BREAKDOWN]
        .filter((r) => r.quantity >= 0)
        .sort((a, b) => b.total - a.total)[0],
    [],
  );

  return (
    <section className="flex flex-col gap-5 border-t border-(--border-subtle) pt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h6 className="m-0 text-(--fg-primary)">Consumo do ciclo</h6>
          <p className="m-0 body-xs text-(--fg-secondary)">
            Gastos variáveis por serviço e por agente, dia a dia — com a
            conciliação entre usado e cobrado.
          </p>
        </div>
        <Link
          href="/settings/financeiro/detalhamento"
          className="inline-flex items-center gap-1.5 rounded-md border border-(--border-default) bg-(--bg-raised) px-3.5 py-2 body-sm font-medium text-(--fg-primary) transition-colors hover:border-(--border-strong) hover:bg-(--bg-hover)"
        >
          Ver detalhamento
          <Icon name="arrow_forward" size={16} className="text-(--fg-tertiary)" />
        </Link>
      </div>

      {/* Flat — três números soltos, separados por gap (sem card aninhado). */}
      <div className="grid grid-cols-3 gap-x-8 gap-y-4">
        <MiniStat label="Variável no ciclo" value={brl(used)} />
        <MiniStat
          label="Maior categoria"
          value={topService?.label ?? "—"}
          sub={topService ? brl(topService.total) : undefined}
        />
        <MiniStat label="Equivalente em USD" value={fmtUsdLabel(used)} />
      </div>
    </section>
  );
}

function MiniStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="aw-eyebrow text-(--fg-tertiary)">{label}</span>
      <span className="body-lg font-medium tabular-nums text-(--fg-primary)">
        {value}
      </span>
      {sub && (
        <span className="body-xs tabular-nums text-(--fg-secondary)">{sub}</span>
      )}
    </div>
  );
}
