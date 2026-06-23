"use client";

import { AwCard } from "@/components/ui/AwCard";
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
import { CardBrandLogo } from "../_components/CardBrandLogo";
import { InvoiceBreakdownCard } from "../_components/InvoiceBreakdownCard";
import {
  brl,
  CURRENT_INVOICE,
  CURRENT_PLAN,
  FORECAST_DISCOUNTS,
  OVERVIEW_KPIS,
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
 * Uma overview se lê em segundos: o total estimado da próxima fatura no topo e,
 * logo abaixo, consumo variável e plano lado a lado.
 */
export default function VisaoGeralPage() {
  return (
    <div className="flex flex-col gap-(--space-12)">
      <ForecastBlock />
      <UsageAndPlan />
    </div>
  );
}

/* ---------- herói: previsão (estimada) da próxima fatura ---------- */

function ForecastBlock() {
  const discount = OVERVIEW_KPIS.monthSavings;
  const total = CURRENT_PLAN.monthly + OVERVIEW_KPIS.accumulated - discount;
  const card = CURRENT_INVOICE.paymentMethod;

  // Um card só, com stroke em volta. O padding da div mãe afasta as colunas do
  // stroke: à esquerda a fatura atual (branca, herói); à direita o detalhamento
  // num card cinza arredondado e "flutuante" — a separação vem do respiro do
  // padding, não de uma divisória.
  return (
    <AwCard className="grid grid-cols-2 items-stretch p-(--space-1)">
      <div className="p-7">
        <AwInvoiceForecastCard
          bare
          title="Fatura atual"
          status={{ label: "Em aberto", variant: "draft" }}
          total={total}
          estimateLabel={null}
          estimateNote={
            <>
              É uma estimativa: como o IOF no cartão, o valor final só fecha na
              cobrança de {CURRENT_PLAN.nextChargeAt} — o consumo variável conta
              até o fim do ciclo e o câmbio é convertido na hora. Atualizado em{" "}
              {CURRENT_INVOICE.dueAt} às 14:30.
            </>
          }
          footnote={
            <>
              Próxima cobrança em {CURRENT_PLAN.nextChargeAt} no cartão
              <CardBrandLogo brand={card.brand} size={22} />
              •••• {card.last4}
            </>
          }
          cta={{
            label: "Ver fatura detalhada",
            href: "/settings/financeiro/historico-faturas",
          }}
        />
      </div>
      <InvoiceBreakdownCard
        className="rounded-xl bg-(--bg-surface) p-7"
        subscription={CURRENT_PLAN.monthly}
        subscriptionLabel={CURRENT_PLAN.name}
        variable={OVERVIEW_KPIS.accumulated}
        discounts={FORECAST_DISCOUNTS}
        total={total}
        totalLabel="Total em aberto"
      />
    </AwCard>
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
    <AwCard className="flex flex-col gap-4 border-(--aw-gray-25) px-6! py-4!">
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
    <AwCard className="flex items-center gap-4 border-(--aw-gray-25) px-6! py-4!">
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
