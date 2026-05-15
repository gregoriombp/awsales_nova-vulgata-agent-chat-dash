"use client";

import * as React from "react";
import { useMemo, useState } from "react";

import { AwAlert } from "@/components/ui/AwAlert";
import { AwAvatar } from "@/components/ui/AwAvatar";
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
import { AwTabs } from "@/components/ui/AwTabs";
import { AwToggle } from "@/components/ui/AwToggle";
import { Icon } from "@/components/ui/Icon";

/* ================================================================
 * Types & sample data
 *
 * Messenger settings are organized around Facebook Pages — each Page
 * has its own access token, subscriptions, greeting, persistent menu,
 * and a 24h messaging window with the customer. Mirrors the structure
 * of AwWhatsAppPanel but uses Messenger primitives instead of WABAs.
 * ================================================================ */

type PageStatus = "active" | "warning" | "rejected";

type ResponseQuality = "Alta" | "Média" | "Baixa";

type IceBreaker = { question: string; payload: string };

type Page = {
  id: string;
  name: string;
  category: string;
  pageId: string;
  bmId: string;
  bmName: string;
  status: PageStatus;
  statusLabel: string;
  avatarSrc?: string;
  fans: number;
  /** Number of currently open conversations (24h window). */
  openConversations: number;
  conversations30d: number;
  conversationsTrend: string;
  responseRate: number;
  responseTimeMin: number;
  health: number;
  quality: ResponseQuality;
  /** Active 24h messaging window count. */
  activeWindows: number;
  greeting: string;
  getStartedPayload: string;
  iceBreakers: IceBreaker[];
  persistentMenu: { label: string; type: "url" | "postback"; target: string }[];
  subscriptions: string[];
  bmVerified: boolean;
  ageGated: boolean;
  lastEvent: string;
};

const SAMPLE_PAGES: Page[] = [
  {
    id: "page-marina",
    name: "Marina Cosméticos",
    category: "Beleza · Cosméticos",
    pageId: "104227351298487",
    bmId: "4116240988602907",
    bmName: "Marina Costa",
    status: "active",
    statusLabel: "Conectada",
    avatarSrc: "/assets/ui-faces/female-3.jpg",
    fans: 8217,
    openConversations: 42,
    conversations30d: 1130,
    conversationsTrend: "+18%",
    responseRate: 96,
    responseTimeMin: 4,
    health: 90,
    quality: "Alta",
    activeWindows: 38,
    greeting:
      "Oi {{first_name}} 👋 Sou a Mari, da Marina Cosméticos. Posso te ajudar com pedidos, frete e dicas de skincare?",
    getStartedPayload: "GET_STARTED_MARINA",
    iceBreakers: [
      { question: "Quero ver os lançamentos", payload: "ICE_LAUNCH" },
      { question: "Status do meu pedido", payload: "ICE_ORDER_STATUS" },
      { question: "Falar com atendente", payload: "ICE_HUMAN" },
    ],
    persistentMenu: [
      { label: "Catálogo", type: "url", target: "https://marina.com/catalogo" },
      { label: "Pedidos", type: "postback", target: "MENU_ORDERS" },
      { label: "Fale com a gente", type: "postback", target: "MENU_CONTACT" },
    ],
    subscriptions: [
      "messages",
      "messaging_postbacks",
      "messaging_optins",
      "message_deliveries",
      "message_reads",
      "messaging_referrals",
    ],
    bmVerified: true,
    ageGated: false,
    lastEvent: "há 1 min",
  },
  {
    id: "page-tech",
    name: "AwSales Tech",
    category: "Tecnologia da informação",
    pageId: "204989013429912",
    bmId: "4116240988602907",
    bmName: "Time Eng",
    status: "warning",
    statusLabel: "Token expira em 9 dias",
    fans: 421,
    openConversations: 5,
    conversations30d: 71,
    conversationsTrend: "−4%",
    responseRate: 78,
    responseTimeMin: 18,
    health: 62,
    quality: "Média",
    activeWindows: 4,
    greeting:
      "Bem-vindo à AwSales Tech. Posso te ajudar com integrações, status de releases ou abrir um ticket.",
    getStartedPayload: "GET_STARTED_TECH",
    iceBreakers: [
      { question: "Status da plataforma", payload: "ICE_STATUS" },
      { question: "Abrir ticket", payload: "ICE_TICKET" },
    ],
    persistentMenu: [
      { label: "Status", type: "url", target: "https://status.awsales.io" },
      { label: "Documentação", type: "url", target: "https://docs.awsales.io" },
    ],
    subscriptions: ["messages", "messaging_postbacks", "message_deliveries"],
    bmVerified: true,
    ageGated: false,
    lastEvent: "há 27 min",
  },
];

const STATUS_PILL: Record<
  PageStatus,
  { variant: AwPillVariant; dot: AwStatusDotVariant }
> = {
  active: { variant: "live", dot: "live" },
  warning: { variant: "beta", dot: "attention" },
  rejected: { variant: "error", dot: "offline" },
};

const QUALITY_PILL: Record<ResponseQuality, AwPillVariant> = {
  Alta: "live",
  Média: "beta",
  Baixa: "error",
};

const SUBSCRIPTION_LABELS: Record<string, string> = {
  messages: "Novas mensagens",
  messaging_postbacks: "Postbacks (botões)",
  messaging_optins: "Opt-ins do plugin de chat",
  message_deliveries: "Status de entrega",
  message_reads: "Confirmação de leitura",
  messaging_referrals: "Origem da conversa (m.me, ads)",
  messaging_handovers: "Transferência de protocolo",
  messaging_account_linking: "Vinculação de conta",
};

const ALL_SUBSCRIPTIONS = Object.keys(SUBSCRIPTION_LABELS);

const ALL_KEY = "__all__";

/** Tiny uncontrolled wrapper around AwToggle for visual rows in the panel —
 *  lets us drop a switch into a list without lifting state into every parent. */
function LocalToggle({
  defaultChecked = false,
  label,
}: {
  defaultChecked?: boolean;
  label?: string;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  return <AwToggle checked={checked} onChange={setChecked} label={label} />;
}

/* ================================================================
 * Left rail — Page switcher
 * ================================================================ */

function PageRail({
  pages,
  selectedId,
  onSelect,
  onAddPage,
}: {
  pages: Page[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddPage: () => void;
}) {
  return (
    <aside
      aria-label="Páginas do Messenger conectadas"
      className="hidden w-[280px] flex-shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-canvas)] md:flex"
    >
      <header className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-4 py-4">
        <div className="flex items-center gap-2">
          <h3 className="m-0 body-xs font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Páginas
          </h3>
          <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--fg-primary)] px-1.5 body-xs font-semibold text-[var(--bg-raised)]">
            {pages.length}
          </span>
        </div>
        <AwButton
          variant="ghost"
          size="sm"
          iconOnly="add"
          aria-label="Conectar nova Página"
          onClick={onAddPage}
        />
      </header>

      <ul
        role="listbox"
        aria-label="Páginas conectadas"
        className="m-0 flex-1 list-none overflow-y-auto p-2"
      >
        {(() => {
          const allActive = selectedId === ALL_KEY;
          const totalConvs = pages.reduce((acc, p) => acc + p.openConversations, 0);
          return (
            <li className="mb-1">
              <button
                type="button"
                role="option"
                aria-selected={allActive}
                onClick={() => onSelect(ALL_KEY)}
                className={
                  "flex w-full items-start gap-3 rounded-[var(--radius-md)] border px-2.5 py-2.5 text-left transition-colors " +
                  (allActive
                    ? "border-[var(--border-default)] bg-[var(--bg-raised)] shadow-[var(--shadow-xs)]"
                    : "border-transparent hover:bg-[var(--bg-surface)]")
                }
              >
                <span className="grid h-[32px] w-[32px] flex-shrink-0 place-items-center rounded-[10px] bg-[color-mix(in_srgb,var(--fg-primary)_92%,transparent)] text-[var(--bg-raised)]">
                  <Icon name="dashboard" size={18} fill={1} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate body-xs font-semibold text-[var(--fg-primary)]">
                    Todas as páginas
                  </span>
                  <span className="mt-0.5 block truncate body-xs text-[var(--fg-tertiary)]">
                    {pages.length} {pages.length === 1 ? "página" : "páginas"} ·{" "}
                    {totalConvs} {totalConvs === 1 ? "conversa aberta" : "conversas abertas"}
                  </span>
                </span>
              </button>
            </li>
          );
        })()}
        <li
          aria-hidden="true"
          className="my-1.5 border-t border-[var(--border-subtle)]"
        />
        {pages.map((p) => {
          const meta = STATUS_PILL[p.status];
          const active = p.id === selectedId;
          return (
            <li key={p.id} className="mb-1 last:mb-0">
              <button
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => onSelect(p.id)}
                className={
                  "flex w-full items-start gap-3 rounded-[var(--radius-md)] border px-2.5 py-2.5 text-left transition-colors " +
                  (active
                    ? "border-[var(--border-default)] bg-[var(--bg-raised)] shadow-[var(--shadow-xs)]"
                    : "border-transparent hover:bg-[var(--bg-surface)]")
                }
              >
                <span className="relative flex-shrink-0">
                  <AwAvatar
                    size="md"
                    src={p.avatarSrc}
                    alt={p.name}
                    initials={p.name
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((s) => s[0]?.toUpperCase())
                      .join("")}
                  />
                  <AwStatusDot
                    variant={meta.dot}
                    size="sm"
                    ring
                    absolute
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate body-xs font-semibold text-[var(--fg-primary)]">
                    {p.name}
                  </span>
                  <span className="mt-0.5 block truncate body-xs text-[var(--fg-tertiary)]">
                    {p.category}
                  </span>
                  {p.status !== "active" && (
                    <span className="mt-1.5 inline-flex">
                      <AwPill variant={meta.variant}>{p.statusLabel}</AwPill>
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
          onClick={onAddPage}
          block
        >
          Conectar nova Página
        </AwButton>
      </footer>
    </aside>
  );
}

/* ================================================================
 * Header — selected Page title + actions
 * ================================================================ */

function PanelHeader({
  page,
  enabled,
  onToggleEnabled,
}: {
  page: Page;
  enabled: boolean;
  onToggleEnabled: (next: boolean) => void;
}) {
  const meta = STATUS_PILL[page.status];
  const toggleId = `messenger-active-${page.id}`;
  const fbInboxUrl = `https://business.facebook.com/latest/inbox/all?asset_id=${page.pageId}`;

  return (
    <header className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-7 py-5">
      <div className="flex min-w-0 items-center gap-3.5">
        <div className="relative">
          <AwAvatar
            size="lg"
            src={page.avatarSrc}
            alt={page.name}
            initials={page.name
              .split(/\s+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((s) => s[0]?.toUpperCase())
              .join("")}
          />
          <span className="absolute -bottom-1 -right-1 rounded-full bg-[var(--bg-canvas)] p-0.5">
            <AwBrandLogo brand="messenger" size="sm" bare />
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="m-0 truncate body-lg font-semibold tracking-[-0.005em] text-[var(--fg-primary)]">
              {page.name}
            </h2>
            <AwPill variant={meta.variant}>{page.statusLabel}</AwPill>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 body-xs text-[var(--fg-tertiary)]">
            <span>{page.category}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              Page ID
              <code className="rounded bg-[var(--bg-surface)] px-1.5 py-px mono body-xs text-[var(--fg-secondary)]">
                {page.pageId}
              </code>
            </span>
            <span aria-hidden>·</span>
            <span>Última atividade {page.lastEvent}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-3">
        <label
          htmlFor={toggleId}
          className="flex cursor-pointer items-center gap-2 body-xs font-medium text-[var(--fg-secondary)]"
        >
          <span>{enabled ? "Ativa" : "Desativada"}</span>
          <AwToggle
            id={toggleId}
            checked={enabled}
            onChange={onToggleEnabled}
            label="Ativar ou desativar a integração"
          />
        </label>
        <span aria-hidden className="h-6 w-px bg-[var(--border-subtle)]" />
        <AwButton
          variant="secondary"
          size="sm"
          iconLeft="open_in_new"
          onClick={() =>
            window.open(fbInboxUrl, "_blank", "noopener,noreferrer")
          }
        >
          Abrir Caixa de Entrada
        </AwButton>
      </div>
    </header>
  );
}

/* ================================================================
 * Issues banner
 * ================================================================ */

type Issue = { sev: "high" | "med"; title: string; desc: string; cta: string };

function IssuesBanner({ page }: { page: Page }) {
  const issues = useMemo<Issue[]>(() => {
    const list: Issue[] = [];
    if (page.status === "rejected") {
      list.push({
        sev: "high",
        title: "Acesso à Página revogado",
        desc: "O administrador removeu as permissões. Reconecte para retomar o atendimento.",
        cta: "Reconectar",
      });
    }
    if (page.statusLabel.toLowerCase().includes("token")) {
      list.push({
        sev: "med",
        title: "Token de acesso expirando",
        desc: "Renove o Page Access Token nos próximos dias para evitar interrupção.",
        cta: "Renovar",
      });
    }
    if (!page.subscriptions.includes("messages")) {
      list.push({
        sev: "high",
        title: "Webhook de mensagens desligado",
        desc: "Sem o evento messages você não recebe novas conversas em tempo real.",
        cta: "Ativar webhook",
      });
    }
    return list;
  }, [page]);

  if (issues.length === 0) return null;

  return (
    <AwAlert variant={issues.some((i) => i.sev === "high") ? "danger" : "warning"}>
      <strong className="body-xs font-semibold text-[var(--fg-primary)]">
        {issues.length}{" "}
        {issues.length === 1 ? "ação necessária" : "ações necessárias"} nesta Página
      </strong>
      <ul className="m-0 mt-2 flex list-none flex-col gap-1.5 p-0">
        {issues.map((it, i) => (
          <li
            key={i}
            className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] bg-[color-mix(in_srgb,var(--bg-raised)_60%,transparent)] px-2.5 py-2"
          >
            <div className="min-w-0 flex-1">
              <div className="body-xs font-medium text-[var(--fg-primary)]">
                {it.title}
              </div>
              <div className="mt-0.5 body-xs text-[var(--fg-secondary)]">
                {it.desc}
              </div>
            </div>
            <AwButton variant="ghost" size="sm" iconRight="arrow_forward">
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
  page,
  onTab,
}: {
  page: Page;
  onTab: (tab: string) => void;
}) {
  const healthVariant =
    page.health > 70 ? "success" : page.health > 40 ? "warning" : "danger";

  return (
    <div className="flex flex-col gap-6">
      <IssuesBanner page={page} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AwCard className="flex flex-col gap-2 p-4">
          <div className="body-xs font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Saúde da página
          </div>
          <div className="flex items-baseline gap-1">
            <span
              className="body-xl font-semibold leading-none"
              style={{
                color:
                  healthVariant === "success"
                    ? "var(--aw-emerald-700)"
                    : healthVariant === "warning"
                      ? "var(--aw-amber-700)"
                      : "var(--aw-red-700, #B42318)",
              }}
            >
              {page.health}
            </span>
            <span className="body-xs text-[var(--fg-tertiary)]">/100</span>
          </div>
          <AwProgress value={page.health} variant={healthVariant} />
          <div className="body-xs text-[var(--fg-tertiary)]">
            {healthVariant === "success"
              ? "Tudo certo para escalar"
              : healthVariant === "warning"
                ? "Atenção: revise os pontos abertos"
                : "Crítico: respostas podem ser bloqueadas"}
          </div>
        </AwCard>

        <AwCard className="flex flex-col gap-2 p-4">
          <div className="body-xs font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Janelas 24h ativas
          </div>
          <div className="flex items-baseline gap-1">
            <span className="body-xl font-semibold leading-none text-[var(--fg-primary)]">
              {page.activeWindows}
            </span>
            <span className="body-xs text-[var(--fg-tertiary)]">
              / {page.openConversations} conversas
            </span>
          </div>
          <div className="body-xs text-[var(--fg-tertiary)]">
            Fora da janela, só tags de mensagem ou agentes humanos podem responder.
          </div>
        </AwCard>

        <AwCard className="flex flex-col gap-2 p-4">
          <div className="body-xs font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Conversas (30d)
          </div>
          <div className="body-xl font-semibold leading-none text-[var(--fg-primary)]">
            {page.conversations30d.toLocaleString("pt-BR")}
          </div>
          <div className="flex items-center gap-2 body-xs text-[var(--fg-tertiary)]">
            <AwPill
              variant={page.conversationsTrend.startsWith("+") ? "live" : "error"}
              dot={false}
            >
              {page.conversationsTrend}
            </AwPill>
            vs. 30 dias anteriores
          </div>
        </AwCard>

        <AwCard className="flex flex-col gap-2 p-4">
          <div className="body-xs font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Tempo de resposta
          </div>
          <div className="flex items-baseline gap-1">
            <span className="body-xl font-semibold leading-none text-[var(--fg-primary)]">
              {page.responseTimeMin}
            </span>
            <span className="body-xs text-[var(--fg-tertiary)]">min · médio</span>
          </div>
          <div className="body-xs text-[var(--fg-tertiary)]">
            Taxa de resposta: <b className="text-[var(--fg-primary)]">{page.responseRate}%</b>
          </div>
        </AwCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ConfigCard page={page} onEdit={() => onTab("account")} />
        <ActivityCard />
      </div>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="m-0 body-xs font-semibold text-[var(--fg-primary)]">
            Atalhos
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ShortcutCard
            icon="waving_hand"
            title="Início da conversa"
            desc="Saudação, ice breakers, menu"
            onClick={() => onTab("conversation")}
          />
          <ShortcutCard
            icon="hub"
            title="Webhooks"
            desc={`${page.subscriptions.length} eventos ativos`}
            onClick={() => onTab("developer")}
          />
          <ShortcutCard
            icon="manage_accounts"
            title="Conta & permissões"
            desc="Funções, equipe, BM"
            onClick={() => onTab("account")}
          />
          <ShortcutCard
            icon="auto_awesome"
            title="Roteiros & agentes"
            desc="Conecte um agente a esta página"
            href="/agent-studio-v2"
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
  href,
}: {
  icon: string;
  title: string;
  desc: string;
  onClick?: () => void;
  href?: string;
}) {
  const interactive = !!onClick || !!href;
  const handleClick =
    onClick ?? (href ? () => (window.location.href = href) : undefined);

  return (
    <AwCard
      interactive={interactive}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (interactive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleClick?.();
        }
      }}
      className="flex items-start gap-3 p-3.5"
    >
      <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--bg-surface)] text-[var(--fg-secondary)]">
        <Icon name={icon} size={18} />
      </span>
      <div className="min-w-0">
        <div className="truncate body-xs font-semibold text-[var(--fg-primary)]">
          {title}
        </div>
        <div className="mt-0.5 truncate body-xs text-[var(--fg-tertiary)]">
          {desc}
        </div>
      </div>
    </AwCard>
  );
}

function ConfigCard({ page, onEdit }: { page: Page; onEdit: () => void }) {
  const rows: { icon: string; label: string; value: React.ReactNode }[] = [
    { icon: "business", label: "Categoria", value: <b>{page.category}</b> },
    { icon: "groups", label: "Curtidas", value: <b>{page.fans.toLocaleString("pt-BR")}</b> },
    {
      icon: "verified_user",
      label: "Verificação BM",
      value: page.bmVerified ? (
        <AwPill variant="live">Verificada</AwPill>
      ) : (
        <AwPill variant="error">Não verificada</AwPill>
      ),
    },
    { icon: "lock", label: "Autenticação", value: <b>OAuth · Page token</b> },
    {
      icon: "shield_lock",
      label: "Restrição etária",
      value: page.ageGated ? (
        <AwPill variant="beta">18+</AwPill>
      ) : (
        <span className="text-[var(--fg-tertiary)]">Não</span>
      ),
    },
    {
      icon: "schedule",
      label: "Janela 24h",
      value: <b>{page.activeWindows} ativas</b>,
    },
  ];

  return (
    <AwCard className="flex flex-col">
      <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <h3 className="m-0 body-xs font-semibold text-[var(--fg-primary)]">
          Configuração da integração
        </h3>
        <AwButton variant="ghost" size="sm" onClick={onEdit}>
          Editar
        </AwButton>
      </header>
      <ul className="m-0 list-none p-0">
        {rows.map((r, i) => (
          <li
            key={r.label}
            className={
              "flex items-center gap-3 px-4 py-2.5 body-xs text-[var(--fg-secondary)] " +
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
    title: <>Get Started actualizado para <code className="mono body-xs">GET_STARTED_MARINA</code></>,
    meta: "há 12 min · você",
  },
  {
    dot: "info",
    title: <>Novo opt-in via plugin de chat</>,
    meta: "há 1 h · marina.com/promo",
  },
  {
    dot: "attention",
    title: <>3 conversas saíram da janela 24h sem resposta</>,
    meta: "ontem · revise as notificações",
  },
  {
    dot: "live",
    title: <>Webhook conectado: <code className="mono body-xs">message_reads</code></>,
    meta: "há 3 d · automático",
  },
];

function ActivityCard() {
  return (
    <AwCard className="flex flex-col">
      <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <h3 className="m-0 body-xs font-semibold text-[var(--fg-primary)]">
          Atividade recente
        </h3>
      </header>
      <ul className="m-0 list-none p-0">
        {ACTIVITY.map((a, i) => (
          <li
            key={i}
            className={
              "flex items-start gap-3 px-4 py-3 body-xs " +
              (i > 0 ? "border-t border-[var(--border-subtle)]" : "")
            }
          >
            <span className="mt-1.5">
              <AwStatusDot variant={a.dot} size="xs" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[var(--fg-primary)]">{a.title}</div>
              <div className="mt-0.5 body-xs text-[var(--fg-tertiary)]">
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
 * Pages tab — list of FB pages (when viewing aggregated)
 * ================================================================ */

function PagesTab({
  pages,
  onOpenPage,
}: {
  pages: Page[];
  onOpenPage: (id: string) => void;
}) {
  if (pages.length === 0) {
    return (
      <AwEmpty>
        <AwEmptyHeader>
          <AwEmptyMedia variant="icon">
            <Icon name="flag" size={20} />
          </AwEmptyMedia>
          <AwEmptyTitle>Nenhuma Página conectada</AwEmptyTitle>
          <AwEmptyDescription>
            Conecte uma Página do Facebook para começar a atender pelo Messenger.
          </AwEmptyDescription>
        </AwEmptyHeader>
        <AwButton variant="primary" size="md" iconLeft="add">
          Conectar Página
        </AwButton>
      </AwEmpty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="body-xs text-[var(--fg-tertiary)]">
          {pages.length} {pages.length === 1 ? "Página conectada" : "Páginas conectadas"}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {pages.map((p) => (
          <AwCard
            key={p.id}
            interactive
            onClick={() => onOpenPage(p.id)}
            className="flex flex-col gap-3 p-4 text-left"
          >
            <div className="flex items-start justify-between gap-2">
              <AwAvatar
                size="md"
                src={p.avatarSrc}
                alt={p.name}
                initials={p.name
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((s) => s[0]?.toUpperCase())
                  .join("")}
              />
              <AwPill variant={STATUS_PILL[p.status].variant}>
                {p.statusLabel}
              </AwPill>
            </div>
            <div>
              <div className="body-sm font-semibold text-[var(--fg-primary)]">
                {p.name}
              </div>
              <div className="mt-0.5 body-xs text-[var(--fg-tertiary)]">
                {p.category}
              </div>
              <div className="mt-1 mono body-xs text-[var(--fg-tertiary)]">
                {p.pageId}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-[var(--border-subtle)] pt-3">
              <PageStat label="Janelas 24h">
                <span className="body-xs font-semibold text-[var(--fg-primary)]">
                  {p.activeWindows}
                </span>
              </PageStat>
              <PageStat label="Resposta">
                <span className="body-xs font-semibold text-[var(--fg-primary)]">
                  {p.responseRate}%
                </span>
              </PageStat>
              <PageStat label="Qualidade">
                <AwPill variant={QUALITY_PILL[p.quality]}>{p.quality}</AwPill>
              </PageStat>
            </div>
          </AwCard>
        ))}
      </div>
    </div>
  );
}

function PageStat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="body-xs uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
        {label}
      </span>
      <span className="flex items-center">{children}</span>
    </div>
  );
}

/* ================================================================
 * Conversation start tab — Greeting, Get Started, Ice Breakers, Menu
 * ================================================================ */

function ConversationTab({ page }: { page: Page }) {
  return (
    <div className="flex flex-col gap-6">
      <AwAlert variant="info">
        <strong className="body-xs font-semibold text-[var(--fg-primary)]">
          Como o Messenger inicia conversa
        </strong>
        <p className="m-0 mt-1 body-xs text-[var(--fg-secondary)]">
          A saudação aparece antes da primeira mensagem. O botão{" "}
          <b>Iniciar</b> dispara um postback. <b>Ice breakers</b> e o{" "}
          <b>menu persistente</b> ficam sempre visíveis dentro do chat. Tudo isso
          é o Messenger Profile API — você edita aqui e a gente sincroniza com a Meta.
        </p>
      </AwAlert>

      <SectionCard
        title="Saudação inicial"
        action={
          <AwPill variant="neutral" dot={false}>
            até 160 caracteres por idioma
          </AwPill>
        }
      >
        <div className="px-4 py-4">
          <AwField
            label="Mensagem em pt-BR"
            htmlFor={`messenger-greeting-${page.id}`}
            helper="Use {{first_name}} e {{last_name}} pra personalizar."
          >
            <textarea
              id={`messenger-greeting-${page.id}`}
              defaultValue={page.greeting}
              rows={3}
              className="aw-input"
              style={{ resize: "vertical", minHeight: 80 }}
            />
          </AwField>
        </div>
      </SectionCard>

      <SectionCard
        title="Botão Iniciar (Get Started)"
        action={<LocalToggle defaultChecked label="Mostrar botão Iniciar" />}
      >
        <div className="grid gap-x-6 gap-y-4 px-4 py-4 sm:grid-cols-2">
          <AwField
            label="Postback payload"
            htmlFor={`messenger-getstarted-${page.id}`}
            helper="Identificador disparado quando o usuário toca em Iniciar."
          >
            <AwInput
              id={`messenger-getstarted-${page.id}`}
              defaultValue={page.getStartedPayload}
              iconLeft="bolt"
            />
          </AwField>
          <AwField
            label="Roteiro disparado"
            htmlFor={`messenger-flow-${page.id}`}
          >
            <AwInput
              id={`messenger-flow-${page.id}`}
              defaultValue="Atendimento — onboarding"
              iconLeft="account_tree"
            />
          </AwField>
        </div>
      </SectionCard>

      <SectionCard
        title="Ice breakers"
        action={
          <AwButton variant="ghost" size="sm" iconLeft="add">
            Adicionar
          </AwButton>
        }
      >
        <ul className="m-0 list-none p-0">
          {page.iceBreakers.map((ib, i) => (
            <li
              key={ib.payload}
              className={
                "flex items-center gap-3 px-4 py-3 " +
                (i > 0 ? "border-t border-[var(--border-subtle)]" : "")
              }
            >
              <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-[var(--bg-surface)] body-xs font-semibold text-[var(--fg-secondary)]">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate body-xs font-medium text-[var(--fg-primary)]">
                  {ib.question}
                </div>
                <div className="mt-0.5 truncate mono body-xs text-[var(--fg-tertiary)]">
                  → {ib.payload}
                </div>
              </div>
              <AwButton variant="ghost" size="sm" iconOnly="edit" aria-label="Editar" />
              <AwButton
                variant="ghost"
                size="sm"
                iconOnly="delete"
                aria-label="Remover"
              />
            </li>
          ))}
          {page.iceBreakers.length === 0 && (
            <li className="px-4 py-6 text-center body-xs text-[var(--fg-tertiary)]">
              Sem ice breakers. Adicione perguntas curtas pra agilizar o início da
              conversa.
            </li>
          )}
        </ul>
      </SectionCard>

      <SectionCard
        title="Menu persistente"
        action={
          <AwButton variant="ghost" size="sm" iconLeft="add">
            Adicionar item
          </AwButton>
        }
      >
        <ul className="m-0 list-none p-0">
          {page.persistentMenu.map((m, i) => (
            <li
              key={m.label}
              className={
                "flex items-center gap-3 px-4 py-3 " +
                (i > 0 ? "border-t border-[var(--border-subtle)]" : "")
              }
            >
              <Icon
                name={m.type === "url" ? "open_in_new" : "bolt"}
                size={16}
                className="text-[var(--fg-tertiary)]"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate body-xs font-medium text-[var(--fg-primary)]">
                  {m.label}
                </div>
                <div className="mt-0.5 truncate mono body-xs text-[var(--fg-tertiary)]">
                  {m.target}
                </div>
              </div>
              <AwPill variant="neutral" dot={false}>
                {m.type === "url" ? "Link" : "Postback"}
              </AwPill>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Mensagem de ausência">
        <div className="grid gap-x-6 gap-y-4 px-4 py-4 sm:grid-cols-[1fr_240px] sm:items-start">
          <AwField
            label="Resposta automática fora do horário"
            htmlFor={`messenger-away-${page.id}`}
          >
            <textarea
              id={`messenger-away-${page.id}`}
              defaultValue="Recebemos sua mensagem! Nosso atendimento volta seg-sáb às 8h. Vou registrar tua dúvida pra gente continuar daqui a pouco 💬"
              rows={3}
              className="aw-input"
              style={{ resize: "vertical", minHeight: 80 }}
            />
          </AwField>
          <AwField label="Horário de atendimento" htmlFor={`messenger-hours-${page.id}`}>
            <AwInput
              id={`messenger-hours-${page.id}`}
              defaultValue="Seg–Sáb · 8h–22h"
              iconLeft="schedule"
            />
          </AwField>
        </div>
      </SectionCard>
    </div>
  );
}

/* ================================================================
 * Account tab — fields, permissions, team, danger zone
 * ================================================================ */

const PERMISSIONS: { label: string; granted: boolean; note?: string }[] = [
  { label: "pages_messaging — enviar e receber mensagens", granted: true },
  {
    label: "pages_messaging_subscriptions — disparos fora da janela 24h",
    granted: true,
  },
  { label: "pages_manage_metadata — alterar perfil e webhooks", granted: true },
  { label: "pages_read_engagement — ler comentários e reações", granted: true },
  {
    label: "pages_messaging_phone_number — coletar telefone (opt-in)",
    granted: false,
    note: "opcional · revogada",
  },
];

const TEAM = [
  { name: "Greg Matuzalem", role: "Admin · você", email: "greg@awsales.io", initials: "GM" },
  { name: "Marina Costa", role: "Editor", email: "marina@awsales.io", initials: "MC" },
  { name: "Henrique Lima", role: "Visualizador", email: "henrique@awsales.io", initials: "HL" },
];

function AccountTab({ page }: { page: Page }) {
  return (
    <div className="flex flex-col gap-6">
      <SectionCard title="Detalhes da Página">
        <div className="grid gap-x-6 gap-y-4 px-4 py-4 sm:grid-cols-2">
          <DetailField label="Nome da página" value={page.name} />
          <DetailField label="Page ID" value={page.pageId} mono copy />
          <DetailField label="Business Manager" value={page.bmId} mono copy />
          <DetailField label="Proprietário" value={page.bmName} />
          <DetailField label="Categoria" value={page.category} />
          <DetailField
            label="Curtidas"
            value={page.fans.toLocaleString("pt-BR")}
          />
          <DetailField
            label="Verificação BM"
            value={
              page.bmVerified ? (
                <AwPill variant="live">Verificado</AwPill>
              ) : (
                <AwPill variant="error">Não verificado</AwPill>
              )
            }
          />
          <DetailField
            label="Restrição etária"
            value={
              page.ageGated ? (
                <AwPill variant="beta">18+</AwPill>
              ) : (
                <span className="text-[var(--fg-tertiary)]">Sem restrição</span>
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
                "flex items-center gap-2.5 px-4 py-2.5 body-xs text-[var(--fg-secondary)] " +
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
                <span className="body-xs text-[var(--fg-tertiary)]">
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
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--bg-surface)] body-xs font-semibold text-[var(--fg-secondary)]">
                {u.initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate body-xs font-medium text-[var(--fg-primary)]">
                  {u.name}
                </div>
                <div className="truncate body-xs text-[var(--fg-tertiary)]">
                  {u.email}
                </div>
              </div>
              <AwPill variant="neutral">{u.role}</AwPill>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Zona de risco" tone="danger">
        <DangerRow
          title="Renovar Page Access Token"
          desc="Tokens da Meta expiram em 60 dias. A renovação pede login do admin da BM."
          cta="Renovar"
        />
        <DangerRow
          title="Desconectar Página"
          desc="Pausa imediatamente o atendimento via Messenger. Histórico permanece na Meta e no AwSales."
          cta="Desconectar"
        />
        <DangerRow
          title="Excluir do AwSales"
          desc="Remove webhooks, ice breakers, menu persistente e mensagens automáticas dentro do AwSales. Não afeta a Página na Meta."
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
            "m-0 body-xs font-semibold " +
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
      <span className="body-xs font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <span
          className={
            "body-xs text-[var(--fg-primary)] " +
            (mono ? "mono body-xs" : "")
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
        <div className="body-xs font-semibold text-[var(--fg-primary)]">
          {title}
        </div>
        <div className="mt-0.5 body-xs text-[var(--fg-tertiary)]">
          {desc}
        </div>
      </div>
      <AwButton
        variant={cta === "Renovar" ? "secondary" : "danger"}
        size="sm"
      >
        {cta}
      </AwButton>
    </div>
  );
}

/* ================================================================
 * Developer tab — webhook URL, secret, subscription matrix
 * ================================================================ */

function DeveloperTab({ page }: { page: Page }) {
  return (
    <div className="flex flex-col gap-6">
      <AwCard className="p-4">
        <h3 className="m-0 mb-1 body-xs font-semibold text-[var(--fg-primary)]">
          Webhook & API
        </h3>
        <p className="m-0 mb-3 body-xs text-[var(--fg-tertiary)]">
          Endpoint dedicado para receber eventos do Messenger Platform. Use o
          segredo para validar o cabeçalho{" "}
          <code className="mono body-xs">X-Hub-Signature-256</code>.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <AwField label="Webhook URL" htmlFor={`page-webhook-${page.id}`}>
            <AwInput
              id={`page-webhook-${page.id}`}
              readOnly
              defaultValue={`https://api.awsales.io/messenger/${page.id}/events`}
              iconLeft="link"
            />
          </AwField>
          <AwField label="App secret" htmlFor={`page-secret-${page.id}`}>
            <AwInput
              id={`page-secret-${page.id}`}
              type="password"
              defaultValue="appsec_b8e72c4b9d6e1f0a3b5c"
              iconLeft="lock"
            />
          </AwField>
          <AwField
            label="Verify token"
            htmlFor={`page-verify-${page.id}`}
            helper="Use este valor no campo 'Verify Token' ao configurar webhooks na Meta."
          >
            <AwInput
              id={`page-verify-${page.id}`}
              defaultValue={`vt_${page.pageId}_aw`}
              iconLeft="vpn_key"
            />
          </AwField>
          <AwField label="Page Access Token" htmlFor={`page-token-${page.id}`}>
            <AwInput
              id={`page-token-${page.id}`}
              type="password"
              defaultValue="EAAGm0PX4ZCpsBA…"
              iconLeft="key"
            />
          </AwField>
        </div>
      </AwCard>

      <SectionCard
        title="Eventos assinados"
        action={
          <AwPill variant="neutral" dot={false}>
            {page.subscriptions.length}/{ALL_SUBSCRIPTIONS.length} ativos
          </AwPill>
        }
      >
        <ul className="m-0 list-none p-0">
          {ALL_SUBSCRIPTIONS.map((evt, i) => {
            const active = page.subscriptions.includes(evt);
            return (
              <li
                key={evt}
                className={
                  "flex items-center gap-3 px-4 py-2.5 " +
                  (i > 0 ? "border-t border-[var(--border-subtle)]" : "")
                }
              >
                <Icon
                  name={active ? "check_circle" : "radio_button_unchecked"}
                  size={16}
                  className={
                    active
                      ? "text-[var(--aw-emerald-700)]"
                      : "text-[var(--fg-tertiary)]"
                  }
                  fill={active ? 1 : 0}
                />
                <div className="min-w-0 flex-1">
                  <div className="body-xs font-medium text-[var(--fg-primary)]">
                    {SUBSCRIPTION_LABELS[evt]}
                  </div>
                  <div className="mt-0.5 mono body-xs text-[var(--fg-tertiary)]">
                    {evt}
                  </div>
                </div>
                <LocalToggle
                  defaultChecked={active}
                  label={`Alternar ${evt}`}
                />
              </li>
            );
          })}
        </ul>
      </SectionCard>

      <AwCard className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <div className="body-xs font-semibold text-[var(--fg-primary)]">
            Testar webhook
          </div>
          <div className="mt-0.5 body-xs text-[var(--fg-tertiary)]">
            Dispara um evento sintético de mensagem para validar a entrega.
          </div>
        </div>
        <AwButton variant="secondary" size="sm" iconLeft="play_arrow">
          Enviar evento de teste
        </AwButton>
      </AwCard>
    </div>
  );
}

/* ================================================================
 * Aggregated header + overview ("Todas as páginas")
 * ================================================================ */

function AggregatedHeader({ pages }: { pages: Page[] }) {
  const totalConvs = pages.reduce((a, p) => a + p.openConversations, 0);
  const totalActiveWindows = pages.reduce((a, p) => a + p.activeWindows, 0);
  const issuesCount = pages.filter((p) => p.status !== "active").length;

  return (
    <header className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-7 py-6">
      <div className="flex min-w-0 items-center gap-3.5">
        <div className="grid h-[56px] w-[56px] place-items-center rounded-[10px] bg-[color-mix(in_srgb,var(--fg-primary)_92%,transparent)] text-[var(--bg-raised)]">
          <Icon name="dashboard" size={28} fill={1} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="m-0 truncate body-lg font-semibold tracking-[-0.005em] text-[var(--fg-primary)]">
              Todas as páginas do Messenger
            </h2>
            {issuesCount > 0 && (
              <AwPill variant="beta">
                {issuesCount}{" "}
                {issuesCount === 1 ? "página com pendência" : "páginas com pendências"}
              </AwPill>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 body-xs text-[var(--fg-tertiary)]">
            <span>{pages.length} páginas conectadas</span>
            <span aria-hidden>·</span>
            <span>
              {totalConvs} {totalConvs === 1 ? "conversa aberta" : "conversas abertas"}
            </span>
            <span aria-hidden>·</span>
            <span>{totalActiveWindows} janelas 24h ativas</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function AggregatedOverviewTab({
  pages,
  onSelectPage,
}: {
  pages: Page[];
  onSelectPage: (id: string) => void;
}) {
  const avgHealth = Math.round(
    pages.reduce((a, p) => a + p.health, 0) / Math.max(pages.length, 1),
  );
  const avgResponse = Math.round(
    pages.reduce((a, p) => a + p.responseRate, 0) / Math.max(pages.length, 1),
  );
  const totalConvs30 = pages.reduce((a, p) => a + p.conversations30d, 0);
  const totalActiveWindows = pages.reduce((a, p) => a + p.activeWindows, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AwCard className="flex flex-col gap-2 p-4">
          <div className="body-xs font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Saúde média
          </div>
          <div className="flex items-baseline gap-1">
            <span className="body-xl font-semibold leading-none text-[var(--fg-primary)]">
              {avgHealth}
            </span>
            <span className="body-xs text-[var(--fg-tertiary)]">/100</span>
          </div>
          <AwProgress
            value={avgHealth}
            variant={avgHealth > 70 ? "success" : avgHealth > 40 ? "warning" : "danger"}
          />
        </AwCard>
        <AwCard className="flex flex-col gap-2 p-4">
          <div className="body-xs font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Conversas (30d)
          </div>
          <div className="body-xl font-semibold leading-none text-[var(--fg-primary)]">
            {totalConvs30.toLocaleString("pt-BR")}
          </div>
          <div className="body-xs text-[var(--fg-tertiary)]">
            soma das páginas
          </div>
        </AwCard>
        <AwCard className="flex flex-col gap-2 p-4">
          <div className="body-xs font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Janelas 24h ativas
          </div>
          <div className="body-xl font-semibold leading-none text-[var(--fg-primary)]">
            {totalActiveWindows}
          </div>
          <div className="body-xs text-[var(--fg-tertiary)]">
            podem responder agora sem tag
          </div>
        </AwCard>
        <AwCard className="flex flex-col gap-2 p-4">
          <div className="body-xs font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Taxa de resposta média
          </div>
          <div className="body-xl font-semibold leading-none text-[var(--fg-primary)]">
            {avgResponse}%
          </div>
          <div className="body-xs text-[var(--fg-tertiary)]">
            calculada pelas páginas
          </div>
        </AwCard>
      </div>

      <SectionCard title="Páginas conectadas">
        <ul className="m-0 list-none p-0">
          {pages.map((p, i) => (
            <li
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectPage(p.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectPage(p.id);
                }
              }}
              className={
                "flex w-full cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--bg-hover)] focus:outline-none focus-visible:bg-[var(--bg-hover)] " +
                (i > 0 ? "border-t border-[var(--border-subtle)]" : "")
              }
            >
              <AwAvatar
                size="md"
                src={p.avatarSrc}
                alt={p.name}
                initials={p.name
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((s) => s[0]?.toUpperCase())
                  .join("")}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate body-xs font-semibold text-[var(--fg-primary)]">
                  {p.name}
                </div>
                <div className="mt-0.5 truncate body-xs text-[var(--fg-tertiary)]">
                  {p.category} · {p.activeWindows} janelas 24h ·{" "}
                  {p.responseRate}% resposta
                </div>
              </div>
              <AwPill variant={STATUS_PILL[p.status].variant}>
                {p.statusLabel}
              </AwPill>
              <Icon
                name="arrow_forward"
                size={16}
                className="text-[var(--fg-tertiary)]"
              />
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}

/* ================================================================
 * Empty state — no Pages connected
 * ================================================================ */

function EmptyState({ onAddPage }: { onAddPage: () => void }) {
  return (
    <div className="flex min-h-full items-center justify-center px-10 py-16">
      <section className="flex w-full max-w-[520px] flex-col items-center text-center">
        <AwBrandLogo brand="messenger" size="lg" />
        <h1 className="m-0 mt-6 body-xl font-semibold tracking-[-0.01em] text-[var(--fg-primary)]">
          Conecte uma Página do Facebook
        </h1>
        <p className="m-0 mt-2 body-sm text-[var(--fg-secondary)]">
          O Messenger usa Páginas para identificar quem está respondendo. Conecte
          a primeira página pra começar a atender por aqui.
        </p>

        <div className="mt-8 flex w-full items-start gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 text-left">
          <Icon
            name="info"
            size={20}
            className="mt-0.5 text-[var(--fg-secondary)]"
          />
          <div>
            <p className="m-0 body-xs font-medium text-[var(--fg-primary)]">
              O que você precisa
            </p>
            <ul className="m-0 mt-1 list-disc pl-5 body-xs text-[var(--fg-secondary)]">
              <li>Ser admin da Página no Business Manager</li>
              <li>Permissões pages_messaging e pages_manage_metadata</li>
              <li>App da Meta com Webhooks habilitados</li>
            </ul>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          <AwButton
            variant="primary"
            size="md"
            iconLeft="add"
            onClick={onAddPage}
          >
            Conectar Página
          </AwButton>
          <AwButton
            variant="secondary"
            size="md"
            iconRight="open_in_new"
            onClick={() =>
              window.open(
                "https://developers.facebook.com/docs/messenger-platform",
                "_blank",
                "noopener,noreferrer",
              )
            }
          >
            Documentação Meta
          </AwButton>
        </div>
      </section>
    </div>
  );
}

/* ================================================================
 * Public component
 * ================================================================ */

export type AwMessengerPanelProps = {
  onAddPage?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
};

export function AwMessengerPanel({
  onAddPage,
  onCancel,
  onSave,
}: AwMessengerPanelProps) {
  const pages = SAMPLE_PAGES;
  const [selectedId, setSelectedId] = useState<string>(pages[0]?.id ?? ALL_KEY);
  const [tab, setTab] = useState<string>("overview");
  const [enabled, setEnabled] = useState(true);

  const isAll = selectedId === ALL_KEY;
  const selected = pages.find((p) => p.id === selectedId) ?? null;
  const viewPages = isAll ? pages : selected ? [selected] : [];

  const handleAddPage = () => onAddPage?.();

  if (pages.length === 0) {
    return <EmptyState onAddPage={handleAddPage} />;
  }

  const tabItems = [
    { value: "overview", label: "Visão geral" },
    {
      value: "pages",
      label: "Páginas",
      count: pages.length,
    },
    ...(isAll
      ? []
      : [
          {
            value: "conversation",
            label: "Início da conversa",
            count: (selected?.iceBreakers.length ?? 0) +
              (selected?.persistentMenu.length ?? 0),
          },
          { value: "account", label: "Conta & permissões" },
          { value: "developer", label: "API & webhooks" },
        ]),
  ];

  return (
    <div className="flex h-full">
      {pages.length > 1 && (
        <PageRail
          pages={pages}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            if (id === ALL_KEY && tab !== "overview" && tab !== "pages") {
              setTab("overview");
            }
          }}
          onAddPage={handleAddPage}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {isAll ? (
          <AggregatedHeader pages={pages} />
        ) : (
          selected && (
            <PanelHeader
              page={selected}
              enabled={enabled}
              onToggleEnabled={setEnabled}
            />
          )
        )}

        <div className="flex-1 overflow-y-auto px-7 py-6">
          <div className="mb-5">
            <AwTabs
              aria-label={isAll ? "Visão consolidada" : "Configurações da Página"}
              variant="underline"
              value={tab}
              onChange={setTab}
              items={tabItems}
            />
          </div>

          <div>
            {tab === "overview" &&
              (isAll ? (
                <AggregatedOverviewTab
                  pages={pages}
                  onSelectPage={setSelectedId}
                />
              ) : (
                selected && <OverviewTab page={selected} onTab={setTab} />
              ))}
            {tab === "pages" && (
              <PagesTab pages={viewPages} onOpenPage={setSelectedId} />
            )}
            {!isAll && tab === "conversation" && selected && (
              <ConversationTab page={selected} />
            )}
            {!isAll && tab === "account" && selected && (
              <AccountTab page={selected} />
            )}
            {!isAll && tab === "developer" && selected && (
              <DeveloperTab page={selected} />
            )}
          </div>
        </div>

        {!isAll && (
          <footer className="flex items-center justify-end gap-2 border-t border-[var(--border-subtle)] px-7 py-4">
            <AwButton variant="secondary" size="md" onClick={onCancel}>
              Cancelar
            </AwButton>
            <AwButton variant="primary" size="md" onClick={onSave}>
              Salvar alterações
            </AwButton>
          </footer>
        )}
      </div>
    </div>
  );
}

export default AwMessengerPanel;
