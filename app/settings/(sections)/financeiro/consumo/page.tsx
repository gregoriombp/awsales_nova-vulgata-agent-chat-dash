"use client";

import * as React from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCollapsible } from "@/components/ui/AwCollapsible";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwStatCard } from "@/components/ui/AwStatCard";
import { AwTable } from "@/components/ui/AwTable";
import { Icon } from "@/components/ui/Icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InvoiceDetailsSheet } from "../_components/InvoiceDetailsSheet";
import {
  brl,
  COUPONS_APPLIED,
  CREDITS_KPIS,
  INVOICE_HISTORY,
  VOUCHERS,
  type CouponRow,
  type VoucherRow,
  type VoucherStatus,
} from "../_components/data";

const TODAY = new Date(2026, 4, 19);

function parseBR(date: string): Date {
  const [d, m, y] = date.split("/").map(Number);
  return new Date(y, m - 1, d);
}

function daysUntil(br: string): number {
  return Math.round((parseBR(br).getTime() - TODAY.getTime()) / 86_400_000);
}

const MONTHS_PT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

function formatShort(d: Date): string {
  return `${MONTHS_PT[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`;
}

/* -----------------------------------------------------------------
 * Page — Saldo de créditos. Resumo (3 KPIs) → vouchers → cupons.
 * O consumo variável × limite mora na aba "Visão geral"; aqui o foco
 * é entender de onde vem cada abatimento e quanto ainda há de saldo.
 * ----------------------------------------------------------------- */

export default function ConsumoPage() {
  const [openInvoiceId, setOpenInvoiceId] = React.useState<string | null>(
    null,
  );
  const [openVoucherId, setOpenVoucherId] = React.useState<string | null>(null);

  const openInvoice =
    INVOICE_HISTORY.find((r) => r.id === openInvoiceId) ?? null;
  const openVoucher = VOUCHERS.find((v) => v.id === openVoucherId) ?? null;

  return (
    <div className="flex flex-col gap-12">
      <CreditsKpis />

      <VouchersBlock vouchers={VOUCHERS} onOpenVoucher={setOpenVoucherId} />

      <CouponsBlock coupons={COUPONS_APPLIED} onOpenInvoice={setOpenInvoiceId} />

      <ProvenanceNote />

      <InvoiceDetailsSheet
        invoice={openInvoice}
        open={openInvoice !== null}
        onClose={() => setOpenInvoiceId(null)}
      />

      <VoucherDetailModal
        voucher={openVoucher}
        open={openVoucher !== null}
        onClose={() => setOpenVoucherId(null)}
        onOpenInvoice={(id) => {
          setOpenVoucherId(null);
          setOpenInvoiceId(id);
        }}
      />
    </div>
  );
}

/* -----------------------------------------------------------------
 * Resumo — 3 KPIs de crédito. Dados em CREDITS_KPIS; cada card carrega
 * uma linha de apoio que desambigua "economizado" × "disponível".
 * ----------------------------------------------------------------- */

function CreditsKpis() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <AwStatCard
        label="Economia acumulada"
        value={brl(CREDITS_KPIS.totalSaved)}
        hint="Total economizado na conta com créditos e cupons já abatidos."
        info="Economia total acumulada desde a criação da conta — soma de créditos, cupons e benefícios já aplicados para reduzir o plano, o uso variável ou serviços específicos, conforme a regra de cada um."
      />
      <AwStatCard
        label="Créditos disponíveis"
        value={brl(CREDITS_KPIS.availableDiscount)}
        hint="Saldo de créditos ativos ainda disponível para abatimento."
        info="Saldo de créditos ativos que a conta ainda pode usar. Podem vir de bônus, compensações, promoções ou acordos comerciais, e são abatidos conforme a validade e a regra de cada crédito."
      />
    </div>
  );
}

function CreditInfoTooltip({ kind }: { kind: "voucher" | "coupon" }) {
  const text =
    kind === "voucher"
      ? "Créditos são saldos concedidos à conta para reduzir valores elegíveis do uso variável — mensagens, tokens, disparos, telefone ou leads ativos. Podem vir de bônus, compensações, promoções ou acordos comerciais, e cada um tem suas próprias regras de aplicação, validade e serviços cobertos."
      : "Cupons aplicam descontos a cobranças específicas da conta — podem reduzir valores fixos, como o plano ou a linha telefônica, ou abater serviços variáveis. Cada cupom segue sua própria regra de aplicação, período e elegibilidade.";
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`O que é ${kind === "voucher" ? "um crédito" : "um cupom"}`}
            className="inline-flex text-(--fg-tertiary) hover:text-(--fg-primary)"
          >
            <Icon name="info" size={15} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[280px] border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)"
        >
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ---------- vouchers (impacto no variável) ---------- */

function VouchersBlock({
  vouchers,
  onOpenVoucher,
}: {
  vouchers: VoucherRow[];
  onOpenVoucher: (id: string) => void;
}) {
  const current = vouchers.filter(
    (v) =>
      v.status === "Ativo" ||
      v.status === "Pendente" ||
      v.status === "Pausado",
  );
  const history = vouchers.filter(
    (v) => v.status === "Esgotado" || v.status === "Vencido",
  );

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h6 className="m-0 flex items-center gap-2 text-(--fg-primary)">
          Créditos
          <CreditInfoTooltip kind="voucher" />
        </h6>
        <p className="m-0 max-w-[560px] body-xs text-(--fg-secondary)">
          Abatem valores elegíveis do seu uso variável, conforme as regras e a
          validade de cada crédito.
        </p>
      </header>

      {current.length === 0 ? (
        <p className="m-0 border-t border-(--border-subtle) py-4 body-xs text-(--fg-tertiary)">
          Nenhum crédito ativo no momento.
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col p-0">
          {current.map((v) => (
            <VoucherRowItem key={v.id} v={v} onOpenVoucher={onOpenVoucher} />
          ))}
        </ul>
      )}

      {history.length > 0 && (
        <AwCollapsible
          size="sm"
          triggerClassName="font-medium"
          trigger={`Histórico · ${history.length} encerrado${
            history.length !== 1 ? "s" : ""
          }`}
        >
          <ul className="m-0 flex list-none flex-col p-0">
            {history.map((v) => (
              <VoucherRowItem key={v.id} v={v} onOpenVoucher={onOpenVoucher} />
            ))}
          </ul>
        </AwCollapsible>
      )}
    </section>
  );
}

/** Cor da bolinha de status sobre o ícone (sem chip de texto). */
const VOUCHER_DOT: Record<VoucherStatus, string> = {
  Ativo: "var(--aw-emerald-500)",
  Pendente: "var(--aw-blue-500)",
  Pausado: "var(--aw-amber-500)",
  Esgotado: "var(--fg-tertiary)",
  Vencido: "var(--fg-tertiary)",
};

/** Texto da tooltip que explica a cor da bolinha de status. */
function voucherStatusHint(status: VoucherStatus): string {
  switch (status) {
    case "Ativo":
      return "Ativo · abatendo o uso";
    case "Pendente":
      return "Pendente · começa em breve, ainda não abate";
    case "Pausado":
      return "Pausado · suspenso pela equipe de conta";
    case "Esgotado":
      return "Esgotado · saldo zerado por uso";
    case "Vencido":
      return "Vencido · passou da validade";
  }
}

function VoucherRowItem({
  v,
  onOpenVoucher,
}: {
  v: VoucherRow;
  onOpenVoucher: (id: string) => void;
}) {
  const pct = v.total > 0 ? Math.round((v.consumed / v.total) * 100) : 0;
  const remaining = Math.max(v.total - v.consumed, 0);
  const muted = v.status === "Esgotado" || v.status === "Vencido";
  const pending = v.status === "Pendente" && Boolean(v.effectiveAt);
  const year = parseBR(v.expiresAt).getFullYear();

  // Ativos/pausados mostram a data de expiração; pendentes, a contagem até virar.
  const startDays = pending ? daysUntil(v.effectiveAt!) : 0;
  const dateLabel = pending
    ? `Inicia em ${startDays} dia${startDays !== 1 ? "s" : ""}`
    : `Expira em ${v.expiresAt}`;

  // Barra verde local: a AwProgress do DS é grayscale por design (sem matiz),
  // então o voucher usa a própria barra; histórico fica neutro.
  const barColor = muted ? "var(--fg-tertiary)" : "var(--aw-emerald-500)";

  return (
    <li
      className={
        "flex items-center gap-5 border-t border-(--border-subtle) py-5 " +
        (muted ? "opacity-70" : "")
      }
    >
      {/* ícone + bolinha de status (tooltip explica a cor) */}
      <TooltipProvider delayDuration={120}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              tabIndex={0}
              role="img"
              aria-label={`Status: ${v.status}`}
              className="relative shrink-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-(--border-strong)"
            >
              <span
                aria-hidden="true"
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-(--border-default) bg-(--bg-raised) text-(--fg-secondary)"
              >
                <Icon name="sell" size={22} fill={1} />
              </span>
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full"
                style={{
                  background: VOUCHER_DOT[v.status],
                  boxShadow: "0 0 0 2px var(--bg-canvas)",
                }}
              />
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)"
          >
            {voucherStatusHint(v.status)}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* primeira coluna: título + subtítulo + "Ver detalhes" (pedido do Greg
          cmt-ac828c36 — o link vem pra cá, deixando a linha em duas colunas:
          identidade à esquerda, métricas à direita). */}
      <div className="flex w-[240px] shrink-0 flex-col gap-0.5">
        <span className="truncate body-md font-medium text-(--fg-primary)">
          {v.description}
        </span>
        <span
          className="line-clamp-2 body-xs text-(--fg-tertiary)"
          style={{ minHeight: "2lh" }}
        >
          {year} · {v.applicableTo}
        </span>
        <button
          type="button"
          onClick={() => onOpenVoucher(v.id)}
          className="group mt-1.5 inline-flex w-fit items-center gap-1 body-xs font-medium text-(--fg-secondary) transition-colors hover:text-(--fg-primary)"
        >
          Ver detalhes
          <Icon
            name="arrow_forward"
            size={14}
            className="text-(--fg-tertiary) transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>

      {/* barra verde + legenda em duas linhas */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--bg-muted)">
          <div
            className="h-full rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="flex flex-col leading-tight">
            <span className="body-xs">
              <strong className="font-semibold text-(--fg-primary)">
                {pct}%
              </strong>{" "}
              <span className="text-(--fg-tertiary)">usado</span>
            </span>
            <span className="body-xs text-(--fg-tertiary)">{dateLabel}</span>
          </span>
          <span className="flex shrink-0 flex-col items-end text-right leading-tight">
            <span className="body-sm font-semibold tabular-nums text-(--fg-primary)">
              {brl(remaining)}{" "}
              <span className="font-normal text-(--fg-tertiary)">
                disponíveis
              </span>
            </span>
            <span className="body-xs tabular-nums text-(--fg-tertiary)">
              de {brl(v.total)}
            </span>
          </span>
        </div>
      </div>
    </li>
  );
}

/* ---------- cupons (impacto no plano fixo / serviços) ---------- */

/** Variante do AwPill por status do cupom. */
function couponStatusVariant(status: CouponRow["status"]) {
  switch (status) {
    case "Ativo":
      return "live" as const;
    case "Aplicado":
      return "info" as const;
    case "Agendado":
      return "draft" as const;
    case "Encerrado":
      return "neutral" as const;
  }
}

/** Benefício do cupom: magnitude (−X% ou Bônus) + escopo como chip. */
function CouponBenefit({ c }: { c: CouponRow }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-medium tabular-nums text-(--fg-primary)">
        {c.percent != null ? `−${c.percent}%` : "Bônus"}
      </span>
      <AwPill variant="neutral" dot={false}>
        {c.scope}
      </AwPill>
    </span>
  );
}

/** Período do cupom: uma única vez, recorrente, ou progresso de ciclos
 *  ("Mês 6 de 12" com barrinha) pros multi-ciclo. */
function CouponPeriod({ c }: { c: CouponRow }) {
  if (c.cyclesTotal === 1) {
    return <span className="body-xs text-(--fg-tertiary)">Uma única vez</span>;
  }
  if (c.cyclesTotal === 0) {
    return <span className="body-xs text-(--fg-tertiary)">Recorrente</span>;
  }
  const used = Math.min(c.cyclesUsed, c.cyclesTotal);
  const pct = Math.round((used / c.cyclesTotal) * 100);
  const done = used >= c.cyclesTotal;
  return (
    <span className="flex w-[120px] flex-col gap-1">
      <span className="body-xs tabular-nums text-(--fg-secondary)">
        Mês {used} de {c.cyclesTotal}
      </span>
      <span className="h-1 w-full overflow-hidden rounded-full bg-(--bg-muted)">
        <span
          className="block h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: done ? "var(--fg-tertiary)" : "var(--aw-emerald-500)",
          }}
        />
      </span>
    </span>
  );
}

/** Tabela de cupons — usada na lista ativa e no histórico (encerrados). */
function CouponsTable({
  rows,
  onOpenInvoice,
}: {
  rows: CouponRow[];
  onOpenInvoice: (id: string) => void;
}) {
  return (
    <AwTable>
      <thead>
        <tr>
          <th>Cupom</th>
          <th>Benefício</th>
          <th>Período</th>
          <th>Status</th>
          <th className="text-right">Economia</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((c) => {
          const invoiceExists = INVOICE_HISTORY.some((r) => r.id === c.invoiceId);
          return (
            <tr key={c.id}>
              <td>
                <span className="flex flex-col">
                  <span className="font-medium text-(--fg-primary)">{c.code}</span>
                  <span className="body-xs text-(--fg-tertiary)">
                    {c.description}
                  </span>
                </span>
              </td>
              <td>
                <CouponBenefit c={c} />
              </td>
              <td>
                <CouponPeriod c={c} />
              </td>
              <td>
                <AwPill variant={couponStatusVariant(c.status)} dot={false}>
                  {c.status}
                </AwPill>
              </td>
              <td className="text-right">
                <span className="flex flex-col items-end leading-tight">
                  <span className="font-medium tabular-nums text-(--accent-success)">
                    −{brl(c.discount)}
                  </span>
                  {invoiceExists ? (
                    <button
                      type="button"
                      onClick={() => onOpenInvoice(c.invoiceId)}
                      className="body-xs font-medium text-(--fg-tertiary) underline decoration-dotted underline-offset-2 hover:text-(--fg-primary) hover:no-underline"
                    >
                      {c.invoiceId}
                    </button>
                  ) : (
                    <span className="body-xs tabular-nums text-(--fg-tertiary)">
                      {c.invoiceId}
                    </span>
                  )}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </AwTable>
  );
}

function CouponsBlock({
  coupons,
  onOpenInvoice,
}: {
  coupons: CouponRow[];
  onOpenInvoice: (id: string) => void;
}) {
  // Ativos/aplicados/agendados na lista principal; encerrados (multi-ciclo que
  // já rodou todos os meses) recolhem no Histórico — mesmo padrão dos créditos.
  const active = coupons.filter((c) => c.status !== "Encerrado");
  const history = coupons.filter((c) => c.status === "Encerrado");

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h6 className="m-0 flex items-center gap-2 text-(--fg-primary)">
          Cupons
          <CreditInfoTooltip kind="coupon" />
        </h6>
        <p className="m-0 max-w-[560px] body-xs text-(--fg-secondary)">
          Aplicam descontos no plano fixo ou em serviços específicos (tokens,
          leads, disparos), conforme a regra de cada cupom.
        </p>
      </header>

      {active.length === 0 ? (
        <p className="m-0 border-t border-(--border-subtle) py-4 body-xs text-(--fg-tertiary)">
          Nenhum cupom ativo.
        </p>
      ) : (
        <CouponsTable rows={active} onOpenInvoice={onOpenInvoice} />
      )}

      {history.length > 0 && (
        <AwCollapsible
          size="sm"
          triggerClassName="font-medium"
          trigger={`Histórico · ${history.length} encerrado${
            history.length !== 1 ? "s" : ""
          }`}
        >
          <CouponsTable rows={history} onOpenInvoice={onOpenInvoice} />
        </AwCollapsible>
      )}
    </section>
  );
}

/* ---------- nota de procedência (cliente não resgata código) ---------- */

function ProvenanceNote() {
  return (
    <p className="m-0 flex items-start gap-2 border-t border-(--border-subtle) pt-4 body-xs text-(--fg-tertiary)">
      <Icon name="info" size={15} className="mt-px shrink-0" />
      <span className="max-w-[640px]">
        Créditos e cupons são aplicados pela sua equipe de conta — não há código
        para resgatar aqui. Tudo que entrou aparece acima, com o valor e a fatura
        de origem.
      </span>
    </p>
  );
}

/* ---------- modal de detalhes do voucher ---------- */

function VoucherDetailModal({
  voucher,
  open,
  onClose,
  onOpenInvoice,
}: {
  voucher: VoucherRow | null;
  open: boolean;
  onClose: () => void;
  onOpenInvoice: (id: string) => void;
}) {
  const remaining = voucher ? Math.max(voucher.total - voucher.consumed, 0) : 0;

  return (
    <AwModal
      open={open}
      onClose={onClose}
      title={voucher?.description ?? "Crédito"}
      footer={
        <div className="flex items-center justify-end">
          <AwButton variant="ghost" onClick={onClose}>
            Fechar
          </AwButton>
        </div>
      }
    >
      {voucher && (
        <div className="flex flex-col gap-5">
          {/* três números, flat (divisória, sem card aninhado) */}
          <div className="grid grid-cols-3 divide-x divide-(--border-subtle)">
            <ModalStat label="Valor total" value={brl(voucher.total)} />
            <ModalStat
              label="Usado"
              value={brl(voucher.consumed)}
              className="pl-4"
            />
            <ModalStat
              label="Restante"
              value={brl(remaining)}
              accent
              className="pl-4"
            />
          </div>

          <p className="m-0 body-xs text-(--fg-secondary)">
            Aplica em:{" "}
            <span className="font-medium text-(--fg-primary)">
              {voucher.applicableTo}
            </span>
          </p>

          {voucher.consumptions && voucher.consumptions.length > 0 && (
            <div className="flex flex-col gap-2">
              <h6 className="m-0 body-sm font-medium text-(--fg-secondary)">
                Faturas que usaram este crédito
              </h6>
              <AwTable>
                <thead>
                  <tr>
                    <th>Fatura</th>
                    <th>Data</th>
                    <th className="text-right">Valor usado</th>
                  </tr>
                </thead>
                <tbody>
                  {voucher.consumptions.map((u) => (
                    <tr key={u.invoiceId + u.date}>
                      <td>
                        <button
                          type="button"
                          onClick={() => onOpenInvoice(u.invoiceId)}
                          className="font-medium text-(--fg-secondary) underline decoration-dotted underline-offset-2 hover:text-(--fg-primary) hover:no-underline"
                        >
                          {u.invoiceId}
                        </button>
                      </td>
                      <td className="tabular-nums text-(--fg-secondary)">
                        {u.date}
                      </td>
                      <td className="text-right font-medium tabular-nums text-(--accent-success)">
                        −{brl(u.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </AwTable>
            </div>
          )}
        </div>
      )}
    </AwModal>
  );
}

function ModalStat({
  label,
  value,
  accent,
  className,
}: {
  label: string;
  value: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={"flex flex-col gap-1 " + (className ?? "")}>
      <span className="aw-eyebrow text-(--fg-tertiary)">{label}</span>
      <span
        className={
          "body-lg font-medium tabular-nums " +
          (accent ? "text-(--accent-success)" : "text-(--fg-primary)")
        }
      >
        {value}
      </span>
    </div>
  );
}
