"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwCollapsible } from "@/components/ui/AwCollapsible";
import { AwModal } from "@/components/ui/AwModal";
import { AwReportPromo } from "@/components/ui/AwReportPromo";
import { AwInvoiceForecastCard } from "@/components/ui/AwInvoiceForecastCard";
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
  VariableSpendBreakdown,
  ReportExitModal,
} from "../_components/VariableSpendBreakdown";
import {
  brl,
  CURRENT_INVOICE,
  CURRENT_PLAN,
  FORECAST_DISCOUNTS,
  formatQuantity,
  OVERVIEW_KPIS,
  PLAN_PHONE_LINE,
  SERVICE_BREAKDOWN,
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
  // Tanto o card de CTA quanto o botão "Relatório completo" do detalhamento
  // levam pro explorador — sempre passando por esta confirmação de saída.
  const [reportExitOpen, setReportExitOpen] = React.useState(false);
  const openReport = React.useCallback(() => setReportExitOpen(true), []);

  return (
    <div className="flex flex-col gap-(--space-12)">
      <ForecastBlock />
      <UsageAndPlan />
      <AwReportPromo
        art="blocks"
        title="Consumo e custos"
        description="Concilie o que foi usado com o que foi cobrado, item a item, e acompanhe a evolução do uso variável ao longo do período."
        onCtaClick={openReport}
      />
      <VariableSpendBreakdown onOpenReport={openReport} />
      <ReportExitModal
        open={reportExitOpen}
        onClose={() => setReportExitOpen(false)}
      />
    </div>
  );
}

/* ---------- herói: previsão (estimada) da próxima fatura ---------- */

function ForecastBlock() {
  const discount = OVERVIEW_KPIS.monthSavings;
  // Total = plano fixo (que já embute a linha telefônica) + uso variável −
  // desconto. A linha telefônica aparece quebrada DENTRO do plano fixo, então
  // não soma duas vezes no total.
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
                  uso variável.
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
                        o uso variável acumulado é cobrado na hora — então pode
                        aparecer mais de uma cobrança no mesmo mês.
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
          phoneLine={PLAN_PHONE_LINE}
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
  const router = useRouter();
  const [leaveOpen, setLeaveOpen] = React.useState(false);
  return (
    <>
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
          <AwButton
            variant="primary"
            size="md"
            iconRight="arrow_forward"
            onClick={() => setLeaveOpen(true)}
          >
            Ver detalhes
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
          phoneLine={PLAN_PHONE_LINE}
          variable={OVERVIEW_KPIS.accumulated}
          discounts={FORECAST_DISCOUNTS}
          total={total}
          totalLabel="Total em aberto"
        />

        <VariableUsageDetail />

        <p className="m-0 body-xs text-(--fg-tertiary)">
          Próxima cobrança em {CURRENT_PLAN.nextChargeAt}. O uso variável
          fecha no fim do ciclo ou ao atingir o limite de{" "}
          {brl(VARIABLE_SPENDING_LIMIT)}.
        </p>
      </div>
    </AwModal>

      {/* Confirmação ao sair pra fora da Visão geral (pedido do Greg). */}
      <AwModal
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        title="Sair para as Análises detalhadas?"
        footer={
          <>
            <AwButton variant="ghost" size="sm" onClick={() => setLeaveOpen(false)}>
              Ficar aqui
            </AwButton>
            <AwButton
              variant="primary"
              size="sm"
              iconRight="arrow_forward"
              onClick={() => router.push("/settings/consumo-e-custos/explorar")}
            >
              Ir para Análises
            </AwButton>
          </>
        }
      >
        <p className="m-0 body-sm text-(--fg-secondary) text-pretty">
          Você vai sair da Visão geral e abrir o explorador de Análises detalhadas
          do financeiro. Pode voltar quando quiser.
        </p>
      </AwModal>
    </>
  );
}

/* ---------- detalhamento do uso variável (dentro do modal) ----------
 * O que compõe o "Uso variável" da fatura, item a item — disparos, mensagens,
 * leads, tokens e operacional. A soma das linhas fecha com o número da linha
 * "Uso variável" do detalhamento (mesma fonte de dados). */

function VariableUsageDetail() {
  const total = SERVICE_BREAKDOWN.reduce((s, r) => s + r.total, 0);
  return (
    <div className="rounded-xl bg-(--bg-surface) px-4 py-1">
      <AwCollapsible
        size="md"
        trigger="Detalhamento do uso variável"
        meta={
          <span className="body-sm font-medium tabular-nums text-(--fg-primary)">
            {brl(total)}
          </span>
        }
      >
        <ul className="m-0 flex list-none flex-col gap-0 p-0 pb-2">
          {SERVICE_BREAKDOWN.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between gap-3 border-t border-(--border-subtle) py-2 first:border-t-0"
            >
              <span className="inline-flex min-w-0 items-center gap-2 text-(--fg-secondary)">
                <Icon
                  name={row.icon}
                  size={16}
                  className="shrink-0 text-(--fg-tertiary)"
                />
                <span className="min-w-0 truncate body-sm">{row.label}</span>
              </span>
              <span className="flex shrink-0 items-baseline gap-2 text-right">
                <span className="body-xs tabular-nums text-(--fg-tertiary)">
                  {row.quantityFormat === "lump"
                    ? row.unitPriceLabel
                    : `${formatQuantity(row.quantity, row.quantityFormat)} · ${row.unitPriceLabel}`}
                </span>
                <span className="body-sm font-medium tabular-nums text-(--fg-primary)">
                  {brl(row.total)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </AwCollapsible>
    </div>
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
          Uso variável
          <TooltipProvider delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label="O que é uso variável"
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
      {/* Duas barras SOBREPOSTAS partindo da mesma base: uma do que a Aswork
          cobrou, outra do valor que o Meta cobra. Cores claras (por token) pra
          ler as duas ao mesmo tempo; a maior fica atrás, a menor por cima. */}
      <OverlaidUsageBars wc={wc} meta={meta} limit={limit} />

      <p className="m-0 body-xs tabular-nums text-(--fg-tertiary)">
        Restam {brl(remaining)} antes da próxima cobrança.
      </p>

      {/* Quem cobra o quê — duas infos bem pequenas, alinhadas às barras. */}
      <div className="flex items-center justify-between gap-3 body-xs text-(--fg-tertiary)">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-(--aw-blue-500)"
          />
          Aswork cobrou
          <span className="tabular-nums font-medium text-(--fg-secondary)">
            {brl(wc)}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-(--aw-purple-500)"
          />
          Meta cobra
          <span className="tabular-nums font-medium text-(--fg-secondary)">
            {brl(meta)}
          </span>
        </span>
      </div>
    </AwCard>
  );
}

/**
 * Duas barras sobrepostas no mesmo trilho: cada uma parte da esquerda e mede,
 * contra o limite do ciclo, quanto foi cobrado por cada provedor. A barra maior
 * fica atrás; a menor entra por cima com leve transparência pra leitura das
 * duas simultaneamente. Cores claras, todas por token.
 */
function OverlaidUsageBars({
  wc,
  meta,
  limit,
}: {
  wc: number;
  meta: number;
  limit: number;
}) {
  const scaleMax = Math.max(limit, wc, meta);
  const wcPct = scaleMax > 0 ? (wc / scaleMax) * 100 : 0;
  const metaPct = scaleMax > 0 ? (meta / scaleMax) * 100 : 0;
  // A maior vai pro fundo; a menor por cima (semitransparente) pra não cobrir.
  const wcIsBigger = wc >= meta;

  return (
    <div
      className="relative h-2.5 w-full"
      role="img"
      aria-label={`Aswork cobrou ${brl(wc)} e Meta cobra ${brl(meta)}, de um limite de ${brl(limit)}.`}
    >
      <div className="absolute inset-0 rounded-full bg-(--bg-muted)" />
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-(--aw-blue-500) transition-[width] duration-500 ease-out"
        style={{
          width: `${Math.min(wcPct, 100)}%`,
          zIndex: wcIsBigger ? 1 : 2,
          opacity: wcIsBigger ? 1 : 0.85,
        }}
      />
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-(--aw-purple-500) transition-[width] duration-500 ease-out"
        style={{
          width: `${Math.min(metaPct, 100)}%`,
          zIndex: wcIsBigger ? 2 : 1,
          opacity: wcIsBigger ? 0.85 : 1,
        }}
      />
    </div>
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
        managerPhoto={ONBOARDING_ORG.accountManager.photo}
        managerRole="Gerente de contas"
        managerInitials={ONBOARDING_ORG.accountManager.initials}
      />
    </>
  );
}
