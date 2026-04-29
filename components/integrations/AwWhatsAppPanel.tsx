"use client";

import * as React from "react";
import { useMemo, useState } from "react";

import { AwAlert } from "@/components/ui/AwAlert";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import {
  AwEmpty,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { AwProgress } from "@/components/ui/AwProgress";
import { AwStatusDot, type AwStatusDotVariant } from "@/components/ui/AwStatusDot";
import { AwSheet, AwSheetRow, AwSheetTab } from "@/components/ui/AwSheet";
import { AwTabs } from "@/components/ui/AwTabs";
import { AwToggle } from "@/components/ui/AwToggle";
import { Icon } from "@/components/ui/Icon";

/* ================================================================
 * Types & sample data
 * ================================================================ */

type WabaStatus = "active" | "warning" | "rejected";
type TemplateStatus = "approved" | "in_review" | "paused" | "rejected";
type PhoneQuality = "Alta" | "Média" | "Baixa";

type Phone = {
  num: string;
  name: string;
  status: "Conectado" | "Pausado" | "Bloqueado";
  quality: PhoneQuality;
  limit: string;
  official: boolean;
};

type Template = {
  name: string;
  category: "Marketing" | "Utilidade" | "Autenticação";
  language: string;
  status: TemplateStatus;
  updated: string;
};

type Variable = {
  name: string;
  label: string;
  value: string;
  scope: "Global" | "Esta WABA";
  updated: string;
};

type Waba = {
  id: string;
  name: string;
  bmName: string;
  wabaId: string;
  bmId: string;
  status: WabaStatus;
  statusLabel: string;
  phones: Phone[];
  templates: Template[];
  variables: Variable[];
  conversations: number;
  conversationsTrend: string;
  limit24h: number;
  limitUpgradeIn: number;
  health: number;
  quality: PhoneQuality;
  timezone: string;
  currency: string;
  lastEvent: string;
  bmVerified: boolean;
  paymentOk: boolean;
};

const SAMPLE_WABAS: Waba[] = [
  {
    id: "waba-marina",
    name: "Marina Cosméticos",
    bmName: "Marina Costa",
    wabaId: "25511404598548851",
    bmId: "4116240988602907",
    status: "active",
    statusLabel: "Conectado",
    conversations: 1284,
    conversationsTrend: "+12%",
    limit24h: 250,
    limitUpgradeIn: 47,
    health: 92,
    quality: "Alta",
    timezone: "America/Sao_Paulo",
    currency: "BRL",
    lastEvent: "há 2 min",
    bmVerified: true,
    paymentOk: true,
    phones: [
      {
        num: "+55 31 93618-4119",
        name: "Marina Atendimento",
        status: "Conectado",
        quality: "Alta",
        limit: "1.000/24h",
        official: true,
      },
      {
        num: "+55 11 99102-4488",
        name: "Marina Vendas",
        status: "Conectado",
        quality: "Média",
        limit: "250/24h",
        official: false,
      },
    ],
    templates: [
      { name: "boas_vindas_pt_v3", category: "Marketing", language: "pt_BR", status: "approved", updated: "Hoje, 09:14" },
      { name: "recuperacao_carrinho_v2", category: "Marketing", language: "pt_BR", status: "approved", updated: "Ontem" },
      { name: "confirmacao_pedido", category: "Utilidade", language: "pt_BR", status: "approved", updated: "12 mar" },
      { name: "promo_blackfriday_v1", category: "Marketing", language: "pt_BR", status: "in_review", updated: "há 2 h" },
      { name: "abertura_teste", category: "Marketing", language: "pt_BR", status: "paused", updated: "08 mar" },
      { name: "lembrete_calendly", category: "Utilidade", language: "pt_BR", status: "approved", updated: "01 mar" },
    ],
    variables: [
      { name: "nome_empresa", label: "Nome da empresa", value: "Marina Cosméticos", scope: "Global", updated: "20/03/2026" },
      { name: "link_promo", label: "Link da promoção atual", value: "https://marina.com/promo", scope: "Esta WABA", updated: "12/04/2026" },
      { name: "horario_atendimento", label: "Horário de atendimento", value: "Seg–Sáb · 8h às 22h", scope: "Global", updated: "01/02/2026" },
    ],
  },
  {
    id: "waba-eng",
    name: "AwSales-Tech-Test",
    bmName: "Time Eng",
    wabaId: "30911404598548891",
    bmId: "4116240988602907",
    status: "warning",
    statusLabel: "Pagamento pendente",
    conversations: 87,
    conversationsTrend: "−3%",
    limit24h: 250,
    limitUpgradeIn: 0,
    health: 64,
    quality: "Média",
    timezone: "America/Sao_Paulo",
    currency: "BRL",
    lastEvent: "há 1 h",
    bmVerified: true,
    paymentOk: false,
    phones: [
      {
        num: "+55 11 95551-2200",
        name: "Eng Sandbox",
        status: "Conectado",
        quality: "Média",
        limit: "250/24h",
        official: false,
      },
    ],
    templates: [
      { name: "ping_test", category: "Utilidade", language: "pt_BR", status: "approved", updated: "18 abr" },
      { name: "otp_login", category: "Autenticação", language: "pt_BR", status: "approved", updated: "10 abr" },
    ],
    variables: [],
  },
];

const STATUS_PILL: Record<WabaStatus, { variant: AwPillVariant; dot: AwStatusDotVariant }> = {
  active: { variant: "live", dot: "live" },
  warning: { variant: "beta", dot: "attention" },
  rejected: { variant: "error", dot: "offline" },
};

const TEMPLATE_PILL: Record<
  TemplateStatus,
  { variant: AwPillVariant; label: string }
> = {
  approved: { variant: "live", label: "Aprovado" },
  in_review: { variant: "beta", label: "Em análise" },
  paused: { variant: "neutral", label: "Pausado" },
  rejected: { variant: "error", label: "Rejeitado" },
};

const QUALITY_PILL: Record<PhoneQuality, AwPillVariant> = {
  Alta: "live",
  Média: "beta",
  Baixa: "error",
};

/* ================================================================
 * Left rail — list of WABAs (account switcher)
 * ================================================================ */

function WabaRail({
  wabas,
  selectedId,
  onSelect,
  onAddWaba,
}: {
  wabas: Waba[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddWaba: () => void;
}) {
  return (
    <aside
      aria-label="Contas WABA conectadas"
      className="hidden w-[280px] flex-shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-canvas)] md:flex"
    >
      <header className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-4 py-4">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Contas WABA
          </h3>
          <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--fg-primary)] px-1.5 text-[11px] font-semibold text-[var(--bg-raised)]">
            {wabas.length}
          </span>
        </div>
        <AwButton
          variant="ghost"
          size="sm"
          iconOnly="add"
          aria-label="Conectar nova WABA"
          onClick={onAddWaba}
        />
      </header>

      <ul
        role="listbox"
        aria-label="WABAs conectadas"
        className="m-0 flex-1 list-none overflow-y-auto p-2"
      >
        {wabas.map((w) => {
          const meta = STATUS_PILL[w.status];
          const active = w.id === selectedId;
          return (
            <li key={w.id} className="mb-1 last:mb-0">
              <button
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => onSelect(w.id)}
                className={
                  "flex w-full items-start gap-3 rounded-[var(--radius-md)] border px-2.5 py-2.5 text-left transition-colors " +
                  (active
                    ? "border-[var(--border-default)] bg-[var(--bg-raised)] shadow-[var(--shadow-xs)]"
                    : "border-transparent hover:bg-[var(--bg-surface)]")
                }
              >
                <span className="relative flex-shrink-0">
                  <AwBrandLogo brand="whatsapp" size="sm" />
                  <AwStatusDot
                    variant={meta.dot}
                    size="sm"
                    ring
                    absolute
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-[var(--fg-primary)]">
                    {w.name}
                  </span>
                  <span className="mt-0.5 block truncate text-[11.5px] text-[var(--fg-tertiary)]">
                    {w.bmName} · {w.phones.length}{" "}
                    {w.phones.length === 1 ? "número" : "números"}
                  </span>
                  {w.status !== "active" && (
                    <span className="mt-1.5 inline-flex">
                      <AwPill variant={meta.variant}>{w.statusLabel}</AwPill>
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <footer className="border-t border-[var(--border-subtle)] p-3">
        <AwButton
          variant="secondary"
          size="md"
          iconLeft="add"
          onClick={onAddWaba}
          block
        >
          Conectar nova WABA
        </AwButton>
      </footer>
    </aside>
  );
}

/* ================================================================
 * Header — selected WABA title + actions
 * ================================================================ */

function PanelHeader({ waba }: { waba: Waba }) {
  const meta = STATUS_PILL[waba.status];

  return (
    <header className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-7 py-6">
      <div className="flex min-w-0 items-center gap-3.5">
        <AwBrandLogo brand="whatsapp" size="lg" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="m-0 truncate text-[18px] font-semibold tracking-[-0.005em] text-[var(--fg-primary)]">
              {waba.name}
            </h2>
            <AwPill variant={meta.variant}>{waba.statusLabel}</AwPill>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[var(--fg-tertiary)]">
            <span className="inline-flex items-center gap-1">
              WABA
              <code className="rounded bg-[var(--bg-surface)] px-1.5 py-px font-mono text-[11px] text-[var(--fg-secondary)]">
                {waba.wabaId}
              </code>
            </span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              BM
              <code className="rounded bg-[var(--bg-surface)] px-1.5 py-px font-mono text-[11px] text-[var(--fg-secondary)]">
                {waba.bmId}
              </code>
            </span>
            <span aria-hidden>·</span>
            <span>Última atividade {waba.lastEvent}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        <AwButton variant="secondary" size="sm" iconLeft="open_in_new">
          Abrir no Meta Business
        </AwButton>
        <AwButton variant="secondary" size="sm" iconOnly="more_horiz" aria-label="Mais ações" />
      </div>
    </header>
  );
}

/* ================================================================
 * Issues banner
 * ================================================================ */

type Issue = { sev: "high" | "med"; title: string; desc: string; cta: string };

function IssuesBanner({ waba }: { waba: Waba }) {
  const issues: Issue[] = useMemo(() => {
    const list: Issue[] = [];
    if (waba.status === "rejected") {
      list.push({
        sev: "high",
        title: "Verificação Business Manager negada",
        desc: "Sua empresa precisa concluir a verificação na Meta para ativar disparos.",
        cta: "Ir para Meta",
      });
    }
    if (!waba.paymentOk) {
      list.push({
        sev: "med",
        title: "Forma de pagamento ausente",
        desc:
          "Sem cartão cadastrado, mensagens de marketing não serão entregues a partir de 50 conversas.",
        cta: "Configurar pagamento",
      });
    }
    if (!waba.bmVerified) {
      list.push({
        sev: "med",
        title: "BM não verificado",
        desc: "Sem verificação você fica limitado a 1.000 conversas/24h.",
        cta: "Saiba mais",
      });
    }
    return list;
  }, [waba]);

  if (issues.length === 0) return null;

  return (
    <AwAlert
      variant={issues.some((i) => i.sev === "high") ? "danger" : "warning"}
    >
      <strong className="text-[13px] font-semibold text-[var(--fg-primary)]">
        {issues.length}{" "}
        {issues.length === 1 ? "ação necessária" : "ações necessárias"} para esta
        WABA
      </strong>
      <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0">
        {issues.map((it, i) => (
          <li
            key={i}
            className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] bg-[color-mix(in_srgb,var(--bg-raised)_60%,transparent)] px-2.5 py-2"
          >
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-[var(--fg-primary)]">
                {it.title}
              </div>
              <div className="mt-0.5 text-[12px] leading-[1.5] text-[var(--fg-secondary)]">
                {it.desc}
              </div>
            </div>
            <AwButton variant="ghost" size="sm" iconRight="open_in_new">
              {it.cta}
            </AwButton>
          </li>
        ))}
      </ul>
    </AwAlert>
  );
}

/* ================================================================
 * Overview tab
 * ================================================================ */

function OverviewTab({
  waba,
  onTab,
}: {
  waba: Waba;
  onTab: (tab: string) => void;
}) {
  const healthVariant =
    waba.health > 70 ? "success" : waba.health > 40 ? "warning" : "danger";

  return (
    <div className="flex flex-col gap-6">
      <IssuesBanner waba={waba} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AwCard className="flex flex-col gap-2 p-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Saúde da conta
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className="text-[24px] font-semibold leading-none"
              style={{
                color:
                  healthVariant === "success"
                    ? "var(--aw-emerald-700)"
                    : healthVariant === "warning"
                      ? "var(--aw-amber-700)"
                      : "var(--aw-red-700, #B42318)",
              }}
            >
              {waba.health}
            </span>
            <span className="text-[12px] text-[var(--fg-tertiary)]">/100</span>
          </div>
          <AwProgress value={waba.health} variant={healthVariant} />
          <div className="text-[12px] text-[var(--fg-tertiary)]">
            {healthVariant === "success"
              ? "Tudo certo para escalar"
              : healthVariant === "warning"
                ? "Atenção: revise os pontos abertos"
                : "Crítico: disparos podem ser bloqueados"}
          </div>
        </AwCard>

        <AwCard className="flex flex-col gap-2 p-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Conversas (mês)
          </div>
          <div className="text-[22px] font-semibold leading-none text-[var(--fg-primary)]">
            {waba.conversations.toLocaleString("pt-BR")}
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[var(--fg-tertiary)]">
            <AwPill
              variant={waba.conversationsTrend.startsWith("+") ? "live" : "error"}
              dot={false}
            >
              {waba.conversationsTrend}
            </AwPill>
            vs. mês anterior
          </div>
        </AwCard>

        <AwCard className="flex flex-col gap-2 p-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Limite de mensagens
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[22px] font-semibold leading-none text-[var(--fg-primary)]">
              {waba.limit24h}
            </span>
            <span className="text-[12px] text-[var(--fg-tertiary)]">/24h</span>
          </div>
          <div className="text-[12px] text-[var(--fg-tertiary)]">
            {waba.limitUpgradeIn > 0
              ? `Próximo upgrade em ${waba.limitUpgradeIn} conversas qualificadas`
              : "Aguardando qualidade alta para upgrade"}
          </div>
        </AwCard>

        <AwCard className="flex flex-col gap-2 p-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Qualidade dos números
          </div>
          <div className="mt-0.5">
            <AwPill variant={QUALITY_PILL[waba.quality]}>{waba.quality}</AwPill>
          </div>
          <div className="text-[12px] text-[var(--fg-tertiary)]">
            Calculada pela Meta com base em respostas dos últimos 7 dias.
          </div>
        </AwCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ConfigCard waba={waba} />
        <ActivityCard />
      </div>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="m-0 text-[13.5px] font-semibold text-[var(--fg-primary)]">
            Atalhos
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ShortcutCard
            icon="layers"
            title="Templates"
            desc={`${waba.templates.filter((t) => t.status === "approved").length} aprovados`}
            onClick={() => onTab("templates")}
          />
          <ShortcutCard
            icon="phone"
            title="Adicionar número"
            desc={`${waba.phones.length}/2 conectados`}
            onClick={() => onTab("phones")}
          />
          <ShortcutCard
            icon="sell"
            title="Variáveis fixas"
            desc={`${waba.variables.length} configuradas`}
            onClick={() => onTab("variables")}
          />
          <ShortcutCard
            icon="auto_awesome"
            title="Disparo em massa"
            desc="Use templates aprovados"
          />
        </div>
      </section>
    </div>
  );
}

function ShortcutCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: string;
  title: string;
  desc: string;
  onClick?: () => void;
}) {
  return (
    <AwCard
      interactive
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="flex items-start gap-3 p-3.5"
    >
      <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--bg-surface)] text-[var(--fg-secondary)]">
        <Icon name={icon} size={18} />
      </span>
      <div className="min-w-0">
        <div className="truncate text-[13.5px] font-semibold text-[var(--fg-primary)]">
          {title}
        </div>
        <div className="mt-0.5 truncate text-[12px] text-[var(--fg-tertiary)]">
          {desc}
        </div>
      </div>
    </AwCard>
  );
}

function ConfigCard({ waba }: { waba: Waba }) {
  const rows: { icon: string; label: string; value: React.ReactNode }[] = [
    { icon: "business", label: "Nome da empresa", value: <b>{waba.name}</b> },
    { icon: "public", label: "Fuso horário", value: <b>{waba.timezone}</b> },
    { icon: "credit_card", label: "Moeda", value: <b>{waba.currency}</b> },
    {
      icon: "verified_user",
      label: "Verificação BM",
      value: waba.bmVerified ? (
        <AwPill variant="live">Verificado</AwPill>
      ) : (
        <AwPill variant="error">Não verificado</AwPill>
      ),
    },
    { icon: "lock", label: "Autenticação", value: <b>OAuth 2.0</b> },
    {
      icon: "credit_card",
      label: "Pagamento",
      value: waba.paymentOk ? (
        <AwPill variant="live">Cartão ativo</AwPill>
      ) : (
        <AwPill variant="beta">Não configurado</AwPill>
      ),
    },
  ];

  return (
    <AwCard className="flex flex-col">
      <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <h3 className="m-0 text-[13.5px] font-semibold text-[var(--fg-primary)]">
          Configuração da integração
        </h3>
        <AwButton variant="ghost" size="sm">
          Editar
        </AwButton>
      </header>
      <ul className="m-0 list-none p-0">
        {rows.map((r, i) => (
          <li
            key={r.label}
            className={
              "flex items-center gap-3 px-4 py-2.5 text-[12.5px] text-[var(--fg-secondary)] " +
              (i > 0 ? "border-t border-[var(--border-subtle)]" : "")
            }
          >
            <Icon name={r.icon} size={14} className="text-[var(--fg-tertiary)]" />
            <span className="flex-1">{r.label}</span>
            <span className="text-[var(--fg-primary)]">{r.value}</span>
          </li>
        ))}
      </ul>
    </AwCard>
  );
}

const ACTIVITY: { dot: AwStatusDotVariant; title: React.ReactNode; meta: string }[] = [
  {
    dot: "live",
    title: (
      <>
        Template <code className="font-mono text-[12px]">recuperacao_carrinho_v2</code> aprovado
      </>
    ),
    meta: "há 8 min · pela Meta",
  },
  {
    dot: "live",
    title: <>Limite expandido para 250 conversas/24h</>,
    meta: "há 2 h · automático",
  },
  {
    dot: "attention",
    title: <>Qualidade do número rebaixada para Média</>,
    meta: "ontem · taxa de bloqueios 4%",
  },
  {
    dot: "info",
    title: <>Novo número conectado: +55 31 93618-4119</>,
    meta: "há 3 d · via wizard",
  },
];

function ActivityCard() {
  return (
    <AwCard className="flex flex-col">
      <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <h3 className="m-0 text-[13.5px] font-semibold text-[var(--fg-primary)]">
          Atividade recente
        </h3>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--fg-secondary)] transition-colors hover:text-[var(--fg-primary)]"
        >
          Ver tudo <Icon name="chevron_right" size={14} />
        </button>
      </header>
      <ul className="m-0 list-none p-0">
        {ACTIVITY.map((a, i) => (
          <li
            key={i}
            className={
              "flex items-start gap-3 px-4 py-3 text-[12.5px] " +
              (i > 0 ? "border-t border-[var(--border-subtle)]" : "")
            }
          >
            <span className="mt-1.5">
              <AwStatusDot variant={a.dot} size="xs" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[var(--fg-primary)]">{a.title}</div>
              <div className="mt-0.5 text-[11.5px] text-[var(--fg-tertiary)]">
                {a.meta}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </AwCard>
  );
}

/* ================================================================
 * Phones tab
 * ================================================================ */

function PhonesTab({
  waba,
  onOpenPhone,
}: {
  waba: Waba;
  onOpenPhone: (phoneNum: string) => void;
}) {
  if (waba.phones.length === 0) {
    return (
      <AwEmpty>
        <AwEmptyHeader>
          <AwEmptyMedia variant="icon">
            <Icon name="phone" size={20} />
          </AwEmptyMedia>
          <AwEmptyTitle>Nenhum número conectado</AwEmptyTitle>
          <AwEmptyDescription>
            Conecte um número para começar a receber e enviar mensagens.
          </AwEmptyDescription>
        </AwEmptyHeader>
        <AwButton variant="primary" size="md" iconLeft="add">
          Adicionar número
        </AwButton>
      </AwEmpty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] text-[var(--fg-tertiary)]">
          {waba.phones.length}{" "}
          {waba.phones.length === 1 ? "número conectado" : "números conectados"}
        </span>
        <div className="flex items-center gap-2">
          <AwButton variant="secondary" size="sm" iconLeft="refresh">
            Sincronizar
          </AwButton>
          <AwButton variant="primary" size="sm" iconLeft="add">
            Adicionar número
          </AwButton>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {waba.phones.map((p) => (
          <AwCard
            key={p.num}
            interactive
            onClick={() => onOpenPhone(p.num)}
            className="flex flex-col gap-3 p-4 text-left"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--bg-surface)] text-[13px] font-semibold text-[var(--fg-secondary)]">
                {p.name.charAt(0)}
              </div>
              {p.official && (
                <AwPill variant="ai" dot={false}>
                  <Icon name="verified" size={11} /> Oficial
                </AwPill>
              )}
            </div>
            <div>
              <div className="text-[14px] font-semibold text-[var(--fg-primary)]">
                {p.name}
              </div>
              <div className="mt-0.5 font-mono text-[12px] text-[var(--fg-tertiary)]">
                {p.num}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-[var(--border-subtle)] pt-3">
              <PhoneStat label="Status">
                <AwPill variant="live">{p.status}</AwPill>
              </PhoneStat>
              <PhoneStat label="Qualidade">
                <AwPill variant={QUALITY_PILL[p.quality]}>{p.quality}</AwPill>
              </PhoneStat>
              <PhoneStat label="Limite">
                <span className="text-[12.5px] font-semibold text-[var(--fg-primary)]">
                  {p.limit}
                </span>
              </PhoneStat>
            </div>
          </AwCard>
        ))}
      </div>
    </div>
  );
}

function PhoneStat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10.5px] uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
        {label}
      </span>
      <span className="flex items-center">{children}</span>
    </div>
  );
}

/* ================================================================
 * Templates tab
 * ================================================================ */

function TemplatesTab({
  waba,
  onOpenTemplate,
}: {
  waba: Waba;
  onOpenTemplate: (name: string, mode: "view" | "edit") => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = waba.templates.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase()),
  );

  if (waba.templates.length === 0) {
    return (
      <AwEmpty>
        <AwEmptyHeader>
          <AwEmptyMedia variant="icon">
            <Icon name="layers" size={20} />
          </AwEmptyMedia>
          <AwEmptyTitle>Nenhum template criado</AwEmptyTitle>
          <AwEmptyDescription>
            Templates são mensagens pré-aprovadas pela Meta. Crie o primeiro para
            iniciar conversas com seus leads.
          </AwEmptyDescription>
        </AwEmptyHeader>
        <AwButton variant="primary" size="md" iconLeft="add">
          Criar template
        </AwButton>
      </AwEmpty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[240px] flex-1">
          <AwInput
            placeholder="Buscar template…"
            iconLeft="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            dense
          />
        </div>
        <AwButton variant="secondary" size="sm" iconLeft="filter_list">
          Categoria
        </AwButton>
        <AwButton variant="secondary" size="sm" iconLeft="filter_list">
          Status
        </AwButton>
        <div className="ml-auto flex items-center gap-2">
          <AwButton variant="secondary" size="sm" iconLeft="layers">
            Aplicar a múltiplas WABAs
          </AwButton>
          <AwButton variant="primary" size="sm" iconLeft="add">
            Criar template
          </AwButton>
        </div>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]">
        <table className="aw-table" style={{ borderRadius: 0, border: 0 }}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Idioma</th>
              <th>Status</th>
              <th>Atualizado</th>
              <th aria-label="Ações" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const pill = TEMPLATE_PILL[t.status];
              return (
                <tr key={t.name}>
                  <td className="aw-table__name">
                    <button
                      type="button"
                      onClick={() => onOpenTemplate(t.name, "view")}
                      className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] px-1 py-0.5 text-left transition-colors hover:bg-[var(--bg-surface)]"
                    >
                      <Icon
                        name="layers"
                        size={13}
                        className="text-[var(--fg-tertiary)]"
                      />
                      <code className="font-mono text-[12px] text-[var(--fg-primary)]">
                        {t.name}
                      </code>
                    </button>
                  </td>
                  <td>{t.category}</td>
                  <td className="text-[var(--fg-tertiary)]">{t.language}</td>
                  <td>
                    <AwPill variant={pill.variant}>{pill.label}</AwPill>
                  </td>
                  <td className="text-[var(--fg-tertiary)]">{t.updated}</td>
                  <td className="aw-table__num">
                    <span className="inline-flex items-center gap-1">
                      <AwButton
                        variant="ghost"
                        size="sm"
                        iconOnly="visibility"
                        aria-label="Visualizar"
                        onClick={() => onOpenTemplate(t.name, "view")}
                      />
                      <AwButton
                        variant="ghost"
                        size="sm"
                        iconOnly="edit"
                        aria-label="Editar"
                        onClick={() => onOpenTemplate(t.name, "edit")}
                      />
                      <AwButton
                        variant="ghost"
                        size="sm"
                        iconOnly="more_horiz"
                        aria-label="Mais ações"
                      />
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-[var(--fg-tertiary)]"
                  style={{ padding: "32px 14px" }}
                >
                  Nenhum template encontrado para “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================================================================
 * Variables tab
 * ================================================================ */

function VariablesTab({
  waba,
  onOpenVariable,
  onNewVariable,
}: {
  waba: Waba;
  onOpenVariable: (name: string) => void;
  onNewVariable: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <AwAlert variant="info">
        Variáveis fixas substituem placeholders{" "}
        <code className="font-mono text-[12px]">{`{{nome_empresa}}`}</code> nos
        templates antes do envio. Alterar o valor aqui atualiza todos os templates
        que usam essa variável.
      </AwAlert>

      <div className="flex items-center gap-2">
        <div className="min-w-[240px] flex-1">
          <AwInput placeholder="Buscar variável…" iconLeft="search" dense />
        </div>
        <AwButton variant="primary" size="sm" iconLeft="add" onClick={onNewVariable}>
          Nova variável
        </AwButton>
      </div>

      {waba.variables.length === 0 ? (
        <AwEmpty>
          <AwEmptyHeader>
            <AwEmptyMedia variant="icon">
              <Icon name="sell" size={20} />
            </AwEmptyMedia>
            <AwEmptyTitle>Nenhuma variável configurada</AwEmptyTitle>
            <AwEmptyDescription>
              Crie variáveis para reutilizar valores em vários templates.
            </AwEmptyDescription>
          </AwEmptyHeader>
        </AwEmpty>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]">
          <table className="aw-table" style={{ borderRadius: 0, border: 0 }}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Label</th>
                <th>Valor atual</th>
                <th>Escopo</th>
                <th>Atualizado</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {waba.variables.map((v) => (
                <tr key={v.name}>
                  <td>
                    <button
                      type="button"
                      onClick={() => onOpenVariable(v.name)}
                      className="rounded-[var(--radius-sm)] px-1 py-0.5 text-left transition-colors hover:bg-[var(--bg-surface)]"
                    >
                      <code className="font-mono text-[12px] text-[var(--fg-primary)]">{`{{${v.name}}}`}</code>
                    </button>
                  </td>
                  <td>{v.label}</td>
                  <td className="aw-table__mono text-[var(--fg-tertiary)]">{v.value}</td>
                  <td>
                    <AwPill variant={v.scope === "Global" ? "ai" : "neutral"}>
                      {v.scope}
                    </AwPill>
                  </td>
                  <td className="text-[var(--fg-tertiary)]">{v.updated}</td>
                  <td className="aw-table__num">
                    <span className="inline-flex items-center gap-1">
                      <AwButton
                        variant="ghost"
                        size="sm"
                        iconOnly="edit"
                        aria-label="Editar"
                        onClick={() => onOpenVariable(v.name)}
                      />
                      <AwButton
                        variant="ghost"
                        size="sm"
                        iconOnly="delete"
                        aria-label="Remover"
                      />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ================================================================
 * Account tab — fields, permissions, team, danger zone
 * ================================================================ */

const PERMISSIONS: { label: string; granted: boolean; note?: string }[] = [
  { label: "Enviar mensagens em nome da empresa", granted: true },
  { label: "Ler conversas e respostas", granted: true },
  { label: "Gerenciar templates e mídias", granted: true },
  { label: "Receber webhooks de status de entrega", granted: true },
  {
    label: "Gerenciar perfil dos números",
    granted: false,
    note: "opcional · revogada",
  },
];

const TEAM = [
  { name: "Greg Matuzalem", role: "Admin · você", email: "greg@awsales.io", initials: "GM" },
  { name: "Marina Costa", role: "Editor", email: "marina@awsales.io", initials: "MC" },
  { name: "Henrique Lima", role: "Visualizador", email: "henrique@awsales.io", initials: "HL" },
];

function AccountTab({ waba }: { waba: Waba }) {
  return (
    <div className="flex flex-col gap-6">
      <SectionCard title="Detalhes da conta">
        <div className="grid gap-x-6 gap-y-4 px-4 py-4 sm:grid-cols-2">
          <DetailField label="Nome da conta" value={waba.name} />
          <DetailField label="WABA ID" value={waba.wabaId} mono copy />
          <DetailField label="Business Manager" value={waba.bmId} mono copy />
          <DetailField label="Proprietário" value={waba.bmName} />
          <DetailField label="Fuso horário" value={waba.timezone} />
          <DetailField label="Moeda" value={waba.currency} />
          <DetailField
            label="Verificação BM"
            value={
              waba.bmVerified ? (
                <AwPill variant="live">Verificado</AwPill>
              ) : (
                <AwPill variant="error">Não verificado</AwPill>
              )
            }
          />
          <DetailField
            label="Pagamento"
            value={
              waba.paymentOk ? (
                <AwPill variant="live">Cartão ativo</AwPill>
              ) : (
                <AwPill variant="beta">Não configurado</AwPill>
              )
            }
          />
        </div>
      </SectionCard>

      <SectionCard title="Permissões concedidas">
        <ul className="m-0 list-none p-0">
          {PERMISSIONS.map((p, i) => (
            <li
              key={p.label}
              className={
                "flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] text-[var(--fg-secondary)] " +
                (i > 0 ? "border-t border-[var(--border-subtle)]" : "")
              }
            >
              {p.granted ? (
                <Icon
                  name="check_circle"
                  size={16}
                  className="text-[var(--aw-emerald-700)]"
                  fill={1}
                />
              ) : (
                <Icon
                  name="cancel"
                  size={16}
                  className="text-[var(--fg-tertiary)]"
                />
              )}
              <span className="flex-1 text-[var(--fg-primary)]">{p.label}</span>
              {p.note && (
                <span className="text-[11.5px] text-[var(--fg-tertiary)]">
                  ({p.note})
                </span>
              )}
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard
        title="Equipe com acesso"
        action={
          <AwButton variant="ghost" size="sm" iconLeft="person_add">
            Convidar
          </AwButton>
        }
      >
        <ul className="m-0 list-none p-0">
          {TEAM.map((u, i) => (
            <li
              key={u.email}
              className={
                "flex items-center gap-3 px-4 py-2.5 " +
                (i > 0 ? "border-t border-[var(--border-subtle)]" : "")
              }
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--bg-surface)] text-[12px] font-semibold text-[var(--fg-secondary)]">
                {u.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-[var(--fg-primary)]">
                  {u.name}
                </div>
                <div className="truncate text-[11.5px] text-[var(--fg-tertiary)]">
                  {u.email}
                </div>
              </div>
              <AwPill variant="neutral">{u.role}</AwPill>
              <AwButton
                variant="ghost"
                size="sm"
                iconOnly="more_horiz"
                aria-label={`Mais ações para ${u.name}`}
              />
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Zona de risco" tone="danger">
        <DangerRow
          title="Desconectar esta WABA"
          desc="Os templates ficam intactos na Meta. Disparos pelo AwSales serão pausados imediatamente."
          cta="Desconectar"
        />
        <DangerRow
          title="Excluir permanentemente"
          desc="Remove todos os templates, números e variáveis vinculados a esta WABA dentro do AwSales. Não afeta a Meta."
          cta="Excluir"
        />
      </SectionCard>
    </div>
  );
}

function SectionCard({
  title,
  action,
  tone = "default",
  children,
}: {
  title: string;
  action?: React.ReactNode;
  tone?: "default" | "danger";
  children: React.ReactNode;
}) {
  return (
    <section
      className={
        "overflow-hidden rounded-[var(--radius-md)] border bg-[var(--bg-raised)] " +
        (tone === "danger"
          ? "border-[var(--aw-red-300,#FECDCA)]"
          : "border-[var(--border-subtle)]")
      }
    >
      <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <h3
          className={
            "m-0 text-[13.5px] font-semibold " +
            (tone === "danger"
              ? "text-[var(--aw-red-700,#B42318)]"
              : "text-[var(--fg-primary)]")
          }
        >
          {title}
        </h3>
        {action}
      </header>
      {children}
    </section>
  );
}

function DetailField({
  label,
  value,
  mono,
  copy,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  copy?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <span
          className={
            "text-[13px] text-[var(--fg-primary)] " +
            (mono ? "font-mono text-[12px]" : "")
          }
        >
          {value}
        </span>
        {copy && (
          <AwButton
            variant="ghost"
            size="sm"
            iconOnly="content_copy"
            aria-label={`Copiar ${label}`}
          />
        )}
      </div>
    </div>
  );
}

function DangerRow({
  title,
  desc,
  cta,
}: {
  title: string;
  desc: string;
  cta: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-4 py-3.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-[var(--fg-primary)]">
          {title}
        </div>
        <div className="mt-0.5 text-[12px] leading-[1.5] text-[var(--fg-tertiary)]">
          {desc}
        </div>
      </div>
      <AwButton variant="danger" size="sm">
        {cta}
      </AwButton>
    </div>
  );
}

/* ================================================================
 * Active toggle + credentials block (above tabs)
 * ================================================================ */

function ActiveToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] px-4 py-3.5">
      <div>
        <div className="text-[13.5px] font-medium text-[var(--fg-primary)]">
          Integração ativa
        </div>
        <div className="mt-0.5 text-[12px] text-[var(--fg-tertiary)]">
          Quando desativada, agentes ignoram esta integração e nenhum evento é
          processado.
        </div>
      </div>
      <AwToggle checked={enabled} onChange={onChange} label="Integração ativa" />
    </div>
  );
}

function WebhookCard({ wabaId }: { wabaId: string }) {
  return (
    <AwCard className="p-4">
      <h3 className="m-0 mb-1 text-[13.5px] font-semibold text-[var(--fg-primary)]">
        Webhook & API
      </h3>
      <p className="m-0 mb-3 text-[12px] leading-[1.45] text-[var(--fg-tertiary)]">
        Endpoint dedicado para receber eventos da Meta Cloud API. Use o segredo
        para validar assinaturas.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <AwField label="Webhook URL" htmlFor={`waba-webhook-${wabaId}`}>
          <AwInput
            id={`waba-webhook-${wabaId}`}
            readOnly
            defaultValue={`https://api.awsales.io/whatsapp/${wabaId}/events`}
            iconLeft="link"
          />
        </AwField>
        <AwField label="Webhook secret" htmlFor={`waba-secret-${wabaId}`}>
          <AwInput
            id={`waba-secret-${wabaId}`}
            type="password"
            defaultValue="whsec_a8f72c4b9d6e1f0a3b5c"
            iconLeft="lock"
          />
        </AwField>
      </div>
    </AwCard>
  );
}

/* ================================================================
 * Drawers — phone, template, variable
 * ================================================================ */

function PhoneSheet({
  open,
  phone,
  waba,
  onClose,
  onPrev,
  onNext,
}: {
  open: boolean;
  phone: Phone | null;
  waba: Waba;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const [tab, setTab] = useState<"resumo" | "perfil" | "atividade">("resumo");

  React.useEffect(() => {
    if (open) setTab("resumo");
  }, [open, phone?.num]);

  if (!phone) return null;

  return (
    <AwSheet
      open={open}
      onClose={onClose}
      onPrev={onPrev}
      onNext={onNext}
      title={
        <span className="inline-flex items-center gap-2">
          {phone.name}
          {phone.official && (
            <AwPill variant="ai" dot={false}>
              <Icon name="verified" size={11} /> Oficial
            </AwPill>
          )}
        </span>
      }
      meta={
        <span className="font-mono text-[12px] text-[var(--fg-tertiary)]">
          {phone.num}
        </span>
      }
      tabs={
        <>
          <AwSheetTab active={tab === "resumo"} onClick={() => setTab("resumo")}>
            Resumo
          </AwSheetTab>
          <AwSheetTab active={tab === "perfil"} onClick={() => setTab("perfil")}>
            Perfil de negócio
          </AwSheetTab>
          <AwSheetTab
            active={tab === "atividade"}
            onClick={() => setTab("atividade")}
          >
            Atividade
          </AwSheetTab>
        </>
      }
      footer={
        <div className="flex items-center justify-between gap-2">
          <AwButton variant="ghost" size="sm" iconLeft="logout">
            Desconectar número
          </AwButton>
          <div className="flex items-center gap-2">
            <AwButton variant="secondary" size="sm" onClick={onClose}>
              Fechar
            </AwButton>
            <AwButton variant="primary" size="sm">
              Salvar
            </AwButton>
          </div>
        </div>
      }
    >
      {tab === "resumo" && (
        <div className="flex flex-col gap-3">
          <AwSheetRow label="Status">
            <AwPill variant="live">{phone.status}</AwPill>
          </AwSheetRow>
          <AwSheetRow label="Qualidade">
            <AwPill variant={QUALITY_PILL[phone.quality]}>{phone.quality}</AwPill>
          </AwSheetRow>
          <AwSheetRow label="Limite 24h">{phone.limit}</AwSheetRow>
          <AwSheetRow label="WABA">{waba.name}</AwSheetRow>
          <AwSheetRow label="Fuso">{waba.timezone}</AwSheetRow>
          <AwSheetRow label="ID interno" mono>
            phone_{phone.num.replace(/\D/g, "")}
          </AwSheetRow>
        </div>
      )}

      {tab === "perfil" && (
        <div className="flex flex-col gap-4">
          <AwField label="Nome do display" htmlFor="phone-display-name">
            <AwInput id="phone-display-name" defaultValue={phone.name} />
          </AwField>
          <AwField label="Descrição" htmlFor="phone-about">
            <AwInput
              id="phone-about"
              defaultValue="Atendimento de seg a sáb, das 8h às 22h."
            />
          </AwField>
          <AwField label="E-mail de contato" htmlFor="phone-email">
            <AwInput
              id="phone-email"
              defaultValue="contato@marina.com"
              iconLeft="mail"
            />
          </AwField>
          <AwField label="Site" htmlFor="phone-site">
            <AwInput
              id="phone-site"
              defaultValue="https://marina.com"
              iconLeft="link"
            />
          </AwField>
        </div>
      )}

      {tab === "atividade" && (
        <ul className="m-0 list-none p-0">
          {[
            { ts: "Hoje, 14:02", text: "Qualidade subiu para Alta" },
            { ts: "Ontem, 09:18", text: "Limite ajustado para 1.000/24h" },
            { ts: "12 abr", text: "Número conectado por Greg" },
          ].map((e, i) => (
            <li
              key={i}
              className={
                "flex items-start gap-3 py-2.5 " +
                (i > 0 ? "border-t border-[var(--border-subtle)]" : "")
              }
            >
              <span className="mt-1 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--fg-tertiary)]" />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] text-[var(--fg-primary)]">
                  {e.text}
                </div>
                <div className="mt-0.5 text-[11.5px] text-[var(--fg-tertiary)]">
                  {e.ts}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AwSheet>
  );
}

function TemplateSheet({
  open,
  template,
  mode,
  onClose,
  onChangeMode,
}: {
  open: boolean;
  template: Template | null;
  mode: "view" | "edit";
  onClose: () => void;
  onChangeMode: (mode: "view" | "edit") => void;
}) {
  if (!template) return null;
  const pill = TEMPLATE_PILL[template.status];
  const isEditing = mode === "edit";

  return (
    <AwSheet
      open={open}
      onClose={onClose}
      title={
        <span className="inline-flex items-center gap-2">
          <code className="font-mono text-[14px] text-[var(--fg-primary)]">
            {template.name}
          </code>
          <AwPill variant={pill.variant}>{pill.label}</AwPill>
        </span>
      }
      meta={
        <span>
          {template.category} · {template.language} · atualizado {template.updated}
        </span>
      }
      footer={
        <div className="flex items-center justify-between gap-2">
          <AwButton variant="ghost" size="sm" iconLeft="content_copy">
            Duplicar
          </AwButton>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <AwButton
                  variant="secondary"
                  size="sm"
                  onClick={() => onChangeMode("view")}
                >
                  Cancelar
                </AwButton>
                <AwButton variant="primary" size="sm">
                  Enviar para análise
                </AwButton>
              </>
            ) : (
              <>
                <AwButton variant="secondary" size="sm" onClick={onClose}>
                  Fechar
                </AwButton>
                <AwButton
                  variant="primary"
                  size="sm"
                  iconLeft="edit"
                  onClick={() => onChangeMode("edit")}
                >
                  Editar
                </AwButton>
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <AwField label="Nome" htmlFor="tpl-name">
          <AwInput
            id="tpl-name"
            defaultValue={template.name}
            readOnly={!isEditing}
          />
        </AwField>

        <AwField label="Corpo da mensagem" htmlFor="tpl-body">
          <textarea
            id="tpl-body"
            readOnly={!isEditing}
            defaultValue={`Olá {{1}}, tudo bem?\n\nVi que você deixou o produto {{2}} no carrinho. Está disponível por {{3}} até hoje à noite — quer que eu separe?`}
            rows={6}
            className="w-full resize-y rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-raised)] px-3 py-2 font-mono text-[12.5px] leading-[1.55] text-[var(--fg-primary)] outline-none transition-colors focus:border-[var(--fg-primary)]"
          />
        </AwField>

        <div className="grid gap-3 sm:grid-cols-2">
          <AwField label="Categoria" htmlFor="tpl-cat">
            <AwInput
              id="tpl-cat"
              defaultValue={template.category}
              readOnly={!isEditing}
            />
          </AwField>
          <AwField label="Idioma" htmlFor="tpl-lang">
            <AwInput
              id="tpl-lang"
              defaultValue={template.language}
              readOnly={!isEditing}
            />
          </AwField>
        </div>

        <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Variáveis usadas
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <code className="rounded bg-[var(--bg-raised)] px-1.5 py-0.5 font-mono text-[11.5px] text-[var(--fg-secondary)]">{`{{1}}`}</code>
            <code className="rounded bg-[var(--bg-raised)] px-1.5 py-0.5 font-mono text-[11.5px] text-[var(--fg-secondary)]">{`{{2}}`}</code>
            <code className="rounded bg-[var(--bg-raised)] px-1.5 py-0.5 font-mono text-[11.5px] text-[var(--fg-secondary)]">{`{{3}}`}</code>
          </div>
        </div>
      </div>
    </AwSheet>
  );
}

function VariableSheet({
  open,
  variable,
  isNew,
  onClose,
}: {
  open: boolean;
  variable: Variable | null;
  isNew: boolean;
  onClose: () => void;
}) {
  return (
    <AwSheet
      open={open}
      onClose={onClose}
      title={isNew ? "Nova variável fixa" : variable?.label ?? "Variável"}
      meta={
        variable && !isNew ? (
          <code className="font-mono text-[12px] text-[var(--fg-tertiary)]">
            {`{{${variable.name}}}`}
          </code>
        ) : (
          "Disponível em todos os templates desta WABA."
        )
      }
      footer={
        <div className="flex items-center justify-between gap-2">
          {!isNew && (
            <AwButton variant="ghost" size="sm" iconLeft="delete">
              Remover
            </AwButton>
          )}
          <div className="ml-auto flex items-center gap-2">
            <AwButton variant="secondary" size="sm" onClick={onClose}>
              Cancelar
            </AwButton>
            <AwButton variant="primary" size="sm">
              {isNew ? "Criar variável" : "Salvar"}
            </AwButton>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <AwField label="Nome (placeholder)" htmlFor="var-name">
          <AwInput
            id="var-name"
            defaultValue={variable?.name ?? ""}
            placeholder="ex: nome_empresa"
          />
        </AwField>
        <AwField label="Label legível" htmlFor="var-label">
          <AwInput
            id="var-label"
            defaultValue={variable?.label ?? ""}
            placeholder="ex: Nome da empresa"
          />
        </AwField>
        <AwField label="Valor atual" htmlFor="var-value">
          <AwInput
            id="var-value"
            defaultValue={variable?.value ?? ""}
            placeholder="ex: Marina Cosméticos"
          />
        </AwField>
        <AwField label="Escopo" htmlFor="var-scope">
          <AwInput
            id="var-scope"
            defaultValue={variable?.scope ?? "Esta WABA"}
            readOnly
          />
        </AwField>
      </div>
    </AwSheet>
  );
}

/* ================================================================
 * Public component
 * ================================================================ */

export type AwWhatsAppPanelProps = {
  wabas?: Waba[];
  onAddWaba?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
};

type SheetState =
  | { kind: "phone"; phoneNum: string }
  | { kind: "template"; name: string; mode: "view" | "edit" }
  | { kind: "variable"; name: string | null }
  | { kind: null };

export function AwWhatsAppPanel({
  wabas = SAMPLE_WABAS,
  onAddWaba,
  onSave,
  onCancel,
}: AwWhatsAppPanelProps) {
  const [selectedId, setSelectedId] = useState(wabas[0]?.id ?? "");
  const [tab, setTab] = useState("overview");
  const [enabled, setEnabled] = useState(true);
  const [sheet, setSheet] = useState<SheetState>({ kind: null });

  const selected = wabas.find((w) => w.id === selectedId) ?? wabas[0];
  if (!selected) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <AwEmpty>
          <AwEmptyHeader>
            <AwEmptyMedia variant="icon">
              <Icon name="chat" size={22} />
            </AwEmptyMedia>
            <AwEmptyTitle>Conecte seu primeiro WhatsApp</AwEmptyTitle>
            <AwEmptyDescription>
              Disparos, templates e atendimento via WhatsApp começam quando você
              conecta uma conta WABA pela API oficial da Meta.
            </AwEmptyDescription>
          </AwEmptyHeader>
          <AwButton variant="primary" size="md" iconLeft="add" onClick={onAddWaba}>
            Iniciar conexão
          </AwButton>
        </AwEmpty>
      </div>
    );
  }

  const closeSheet = () => setSheet({ kind: null });
  const handleAddWaba = onAddWaba ?? (() => {});

  const sheetPhone =
    sheet.kind === "phone"
      ? selected.phones.find((p) => p.num === sheet.phoneNum) ?? null
      : null;
  const sheetPhoneIndex =
    sheetPhone ? selected.phones.findIndex((p) => p.num === sheetPhone.num) : -1;
  const sheetTemplate =
    sheet.kind === "template"
      ? selected.templates.find((t) => t.name === sheet.name) ?? null
      : null;
  const sheetVariable =
    sheet.kind === "variable" && sheet.name
      ? selected.variables.find((v) => v.name === sheet.name) ?? null
      : null;

  return (
    <div className="flex h-full">
      {wabas.length > 1 && (
        <WabaRail
          wabas={wabas}
          selectedId={selected.id}
          onSelect={setSelectedId}
          onAddWaba={handleAddWaba}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <PanelHeader waba={selected} />

        <div className="flex-1 overflow-y-auto px-7 py-6">
          <div className="mb-6">
            <ActiveToggle enabled={enabled} onChange={setEnabled} />
          </div>

          <div className="mb-5">
            <AwTabs
              aria-label="Configurações da WABA"
              variant="underline"
              value={tab}
              onChange={setTab}
              items={[
                { value: "overview", label: "Visão geral" },
                { value: "phones", label: "Números", count: selected.phones.length },
                { value: "templates", label: "Templates", count: selected.templates.length },
                { value: "variables", label: "Variáveis fixas", count: selected.variables.length },
                { value: "account", label: "Conta & permissões" },
                { value: "developer", label: "API & webhooks" },
              ]}
            />
          </div>

          <div>
            {tab === "overview" && <OverviewTab waba={selected} onTab={setTab} />}
            {tab === "phones" && (
              <PhonesTab
                waba={selected}
                onOpenPhone={(phoneNum) => setSheet({ kind: "phone", phoneNum })}
              />
            )}
            {tab === "templates" && (
              <TemplatesTab
                waba={selected}
                onOpenTemplate={(name, mode) =>
                  setSheet({ kind: "template", name, mode })
                }
              />
            )}
            {tab === "variables" && (
              <VariablesTab
                waba={selected}
                onOpenVariable={(name) => setSheet({ kind: "variable", name })}
                onNewVariable={() => setSheet({ kind: "variable", name: null })}
              />
            )}
            {tab === "account" && <AccountTab waba={selected} />}
            {tab === "developer" && <WebhookCard wabaId={selected.id} />}
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-[var(--border-subtle)] px-7 py-4">
          <AwButton variant="secondary" size="md" onClick={onCancel}>
            Cancelar
          </AwButton>
          <AwButton variant="primary" size="md" onClick={onSave}>
            Salvar alterações
          </AwButton>
        </footer>
      </div>

      <PhoneSheet
        open={sheet.kind === "phone" && !!sheetPhone}
        phone={sheetPhone}
        waba={selected}
        onClose={closeSheet}
        onPrev={
          sheetPhoneIndex > 0
            ? () =>
                setSheet({
                  kind: "phone",
                  phoneNum: selected.phones[sheetPhoneIndex - 1].num,
                })
            : undefined
        }
        onNext={
          sheetPhoneIndex >= 0 && sheetPhoneIndex < selected.phones.length - 1
            ? () =>
                setSheet({
                  kind: "phone",
                  phoneNum: selected.phones[sheetPhoneIndex + 1].num,
                })
            : undefined
        }
      />

      <TemplateSheet
        open={sheet.kind === "template" && !!sheetTemplate}
        template={sheetTemplate}
        mode={sheet.kind === "template" ? sheet.mode : "view"}
        onClose={closeSheet}
        onChangeMode={(mode) =>
          sheet.kind === "template" &&
          setSheet({ kind: "template", name: sheet.name, mode })
        }
      />

      <VariableSheet
        open={sheet.kind === "variable"}
        variable={sheetVariable}
        isNew={sheet.kind === "variable" && sheet.name === null}
        onClose={closeSheet}
      />
    </div>
  );
}

export default AwWhatsAppPanel;
