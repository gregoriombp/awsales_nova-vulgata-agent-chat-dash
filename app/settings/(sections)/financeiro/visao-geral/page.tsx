"use client";

import * as React from "react";
import { AwCard } from "@/components/ui/AwCard";
import { AwReportPromo } from "@/components/ui/AwReportPromo";
import { AwInvoiceForecastCard } from "@/components/ui/AwInvoiceForecastCard";
import { AwConsumptionBar } from "@/components/ui/AwConsumptionBar";
import { AwContactChannelModal } from "@/components/ui/AwContactChannelModal";
import { AwPlanIcon, type PlanKey } from "@/components/ui/AwPlanIcon";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ONBOARDING_ORG } from "@/app/primeiro-acesso/_data";
import { CardBrandLogo } from "../_components/CardBrandLogo";
import { InvoiceBreakdownCard } from "../_components/InvoiceBreakdownCard";
import { PlanDetailModal } from "../_components/PlanDetailModal";
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
      <AwReportPromo
        art="blocks"
        title="Consumo e custos"
        description="Concilie o que foi usado com o que foi cobrado, item a item, e acompanhe a evolução do consumo variável ao longo do período."
        href="/settings/consumo-e-custos"
      />
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
              <span className="inline-flex flex-wrap items-center gap-1.5">
                Próxima cobrança em {CURRENT_PLAN.nextChargeAt} no cartão
                <CardBrandLogo brand={card.brand} size={22} />
                •••• {card.last4}
              </span>
              <span className="inline-flex w-full items-center gap-1 text-(--fg-secondary)">
                <Icon name="info" size={14} className="shrink-0 text-(--fg-tertiary)" />
                Você pode receber cobranças adicionais ao atingir o limite do
                consumo variável.
                <TooltipProvider delayDuration={120}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label="Como funcionam as cobranças adicionais"
                        className="inline-flex shrink-0 text-(--fg-tertiary) hover:text-(--fg-primary)"
                      >
                        <Icon name="help" size={14} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-[300px] border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)"
                    >
                      Ao atingir o limite do ciclo ({brl(VARIABLE_SPENDING_LIMIT)}),
                      o consumo variável acumulado é cobrado na hora — então pode
                      aparecer mais de uma cobrança no mesmo mês, separada da
                      fatura do plano.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </span>
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
        Restam {brl(remaining)} antes da próxima cobrança.
      </p>
    </AwCard>
  );
}

function PlanoCard() {
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [contactOpen, setContactOpen] = React.useState(false);

  return (
    <>
      <AwCard className="flex items-center gap-4 border-(--aw-gray-25) px-6! py-4!">
        <span
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-(--bg-inverse)"
        >
          <AwPlanIcon plan={planKey(CURRENT_PLAN.name)} variant="dark" size={44} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="m-0 flex items-center gap-2 body-lg font-medium text-(--fg-primary)">
            {CURRENT_PLAN.name}
            <AwPill variant={CURRENT_PLAN.status === "Ativo" ? "live" : "error"}>
              {CURRENT_PLAN.status === "Ativo" ? "Ativa" : "Inativa"}
            </AwPill>
          </p>
          <p className="m-0 mt-0.5 body-sm tabular-nums text-(--fg-secondary)">
            <strong className="font-medium text-(--fg-primary)">
              {brl(CURRENT_PLAN.monthly)}
            </strong>
            /mês · renova em {CURRENT_PLAN.nextChargeAt}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDetailOpen(true)}
          className="inline-flex shrink-0 items-center gap-1 self-start rounded-md body-sm font-medium text-(--fg-tertiary) transition-colors hover:text-(--fg-primary)"
        >
          Ver detalhes
          <Icon name="chevron_right" size={16} />
        </button>
      </AwCard>

      <PlanDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onContact={() => {
          setDetailOpen(false);
          setContactOpen(true);
        }}
      />
      <AwContactChannelModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        managerName={ONBOARDING_ORG.accountManager.name}
      />
    </>
  );
}
