"use client";

import * as React from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwModal } from "@/components/ui/AwModal";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
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
  USED_META_TOTAL,
  USED_WC_TOTAL,
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
  const [invoiceOpen, setInvoiceOpen] = React.useState(false);

  // Um card só, com stroke em volta. O padding da div mãe afasta as colunas do
  // stroke: à esquerda a fatura atual (branca, herói); à direita o detalhamento
  // num card cinza arredondado e "flutuante" — a separação vem do respiro do
  // padding, não de uma divisória.
  return (
    <>
      <AwCard className="grid grid-cols-2 items-stretch p-(--space-2)">
        <div className="p-7">
          <AwInvoiceForecastCard
            bare
            title="Fatura atual"
            status={{ label: "Em aberto", variant: "draft" }}
            total={total}
            footnote={
              <>
                <span className="inline-flex flex-wrap items-center gap-1.5">
                  Próxima cobrança em {CURRENT_PLAN.nextChargeAt} no cartão
                  <CardBrandLogo brand={card.brand} size={22} />
                  •••• {card.last4}
                </span>
                <span className="inline-flex w-full items-center gap-1 body-xs text-(--fg-muted)">
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
              label: "Detalhes da fatura",
              onClick: () => setInvoiceOpen(true),
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

      <InvoiceDetailModal
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        total={total}
        cardBrand={card.brand}
        cardLast4={card.last4}
      />
    </>
  );
}

/* ---------- modal: detalhes da fatura em aberto ---------- */

function InvoiceDetailModal({
  open,
  onClose,
  total,
  cardBrand,
  cardLast4,
}: {
  open: boolean;
  onClose: () => void;
  total: number;
  cardBrand: React.ComponentProps<typeof CardBrandLogo>["brand"];
  cardLast4: string;
}) {
  return (
    <AwModal
      open={open}
      onClose={onClose}
      title="Detalhes da fatura"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 body-xs text-(--fg-tertiary)">
            <CardBrandLogo brand={cardBrand} size={18} />
            Cobrança no cartão •••• {cardLast4}
          </span>
          <AwButton variant="primary" size="md" onClick={onClose}>
            Pagar agora
          </AwButton>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="aw-eyebrow text-(--fg-tertiary)">Total em aberto</span>
            <p className="m-0 text-(length:--h3-size) font-semibold leading-none tracking-heading-tighter tabular-nums text-(--fg-primary)">
              {brl(total)}
            </p>
          </div>
          <AwPill variant="draft">Em aberto</AwPill>
        </div>

        <InvoiceBreakdownCard
          subscription={CURRENT_PLAN.monthly}
          subscriptionLabel={CURRENT_PLAN.name}
          variable={OVERVIEW_KPIS.accumulated}
          discounts={FORECAST_DISCOUNTS}
          total={total}
          totalLabel="Total em aberto"
        />

        <p className="m-0 body-xs text-(--fg-tertiary)">
          Próxima cobrança em {CURRENT_PLAN.nextChargeAt}. O consumo variável
          fecha no fim do ciclo ou ao atingir o limite de{" "}
          {brl(VARIABLE_SPENDING_LIMIT)}.
        </p>
      </div>
    </AwModal>
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
  // Quebra do consumo por quem cobra: taxas da Aswork × valor aproximado do Meta.
  const wc = USED_WC_TOTAL;
  const meta = USED_META_TOTAL;

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
      <AwConsumptionBar
        gross={used}
        limit={limit}
        splits={[
          { label: "Aswork", value: wc, colorVar: "var(--aw-blue-500)" },
          { label: "Meta", value: meta, colorVar: "var(--aw-purple-400)" },
        ]}
      />
      <p className="m-0 body-xs tabular-nums text-(--fg-tertiary)">
        Restam {brl(remaining)} antes da próxima cobrança.
      </p>

      {/* Quem cobra o quê — só os rótulos; a divisão visual mora dentro da
          barra acima (camada de baixa opacidade), com o detalhe no tooltip. */}
      <div className="flex items-center justify-between gap-3 body-xs text-(--fg-tertiary)">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-(--aw-blue-500)"
          />
          Aswork
          <span className="tabular-nums font-medium text-(--fg-secondary)">
            {brl(wc)}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <AwBrandLogo brand="meta" size={13} markOnly />
          Meta
          <span className="tabular-nums font-medium text-(--fg-secondary)">
            {brl(meta)}
          </span>
        </span>
      </div>
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
