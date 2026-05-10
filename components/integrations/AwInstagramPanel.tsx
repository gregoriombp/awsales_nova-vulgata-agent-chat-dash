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
 * Instagram settings are organized around Instagram Business / Creator
 * accounts that are linked to a Facebook Page. Same 24h messaging
 * window as Messenger, but with additional surfaces: DMs, story
 * mentions/replies, comments on posts/reels.
 * ================================================================ */

type AccountStatus = "active" | "warning" | "rejected";
type AccountKind = "business" | "creator";
type ResponseQuality = "Alta" | "Média" | "Baixa";

type IceBreaker = { question: string; payload: string };

type IgAccount = {
  id: string;
  /** @ handle (without leading @). */
  handle: string;
  displayName: string;
  igUserId: string;
  pageId: string;
  pageName: string;
  bmId: string;
  bmName: string;
  kind: AccountKind;
  status: AccountStatus;
  statusLabel: string;
  avatarSrc?: string;
  followers: number;
  followersTrend: string;
  /** Open DM threads (24h window). */
  openDms: number;
  dms30d: number;
  dmsTrend: string;
  storyReplies30d: number;
  comments30d: number;
  responseRate: number;
  responseTimeMin: number;
  health: number;
  quality: ResponseQuality;
  activeWindows: number;
  iceBreakers: IceBreaker[];
  subscriptions: string[];
  bmVerified: boolean;
  professionalAccount: boolean;
  lastEvent: string;
};

const SAMPLE_ACCOUNTS: IgAccount[] = [
  {
    id: "ig-marina",
    handle: "marinacosmeticos",
    displayName: "Marina Cosméticos",
    igUserId: "17841405822304914",
    pageId: "104227351298487",
    pageName: "Marina Cosméticos",
    bmId: "4116240988602907",
    bmName: "Marina Costa",
    kind: "business",
    status: "active",
    statusLabel: "Conectada",
    avatarSrc: "/assets/ui-faces/female-3.jpg",
    followers: 12410,
    followersTrend: "+2,1%",
    openDms: 28,
    dms30d: 612,
    dmsTrend: "+24%",
    storyReplies30d: 184,
    comments30d: 312,
    responseRate: 94,
    responseTimeMin: 6,
    health: 88,
    quality: "Alta",
    activeWindows: 24,
    iceBreakers: [
      { question: "Quero ver os lançamentos", payload: "ICE_LAUNCH" },
      { question: "Status do meu pedido", payload: "ICE_ORDER_STATUS" },
      { question: "Falar com atendente", payload: "ICE_HUMAN" },
    ],
    subscriptions: [
      "messages",
      "messaging_postbacks",
      "messaging_seen",
      "message_reactions",
      "story_insights",
      "comments",
    ],
    bmVerified: true,
    professionalAccount: true,
    lastEvent: "há 4 min",
  },
  {
    id: "ig-creator",
    handle: "marina.tips",
    displayName: "Marina · Bastidores",
    igUserId: "17841412809991238",
    pageId: "204989013429912",
    pageName: "Marina Bastidores",
    bmId: "4116240988602907",
    bmName: "Marina Costa",
    kind: "creator",
    status: "warning",
    statusLabel: "Permissão de comentários revogada",
    avatarSrc: "/assets/ui-faces/female-1.jpg",
    followers: 4870,
    followersTrend: "+0,4%",
    openDms: 9,
    dms30d: 188,
    dmsTrend: "−6%",
    storyReplies30d: 91,
    comments30d: 0,
    responseRate: 81,
    responseTimeMin: 22,
    health: 67,
    quality: "Média",
    activeWindows: 7,
    iceBreakers: [
      { question: "Sobre as masterclasses", payload: "ICE_CLASSES" },
      { question: "Parcerias", payload: "ICE_PARTNERS" },
    ],
    subscriptions: ["messages", "messaging_postbacks", "story_insights"],
    bmVerified: true,
    professionalAccount: true,
    lastEvent: "há 1 h",
  },
];

const STATUS_PILL: Record<
  AccountStatus,
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

const KIND_LABEL: Record<AccountKind, string> = {
  business: "Conta comercial",
  creator: "Conta de criador",
};

const SUBSCRIPTION_LABELS: Record<string, string> = {
  messages: "Novas DMs",
  messaging_postbacks: "Postbacks (botões)",
  messaging_seen: "Confirmação de leitura",
  message_reactions: "Reações em mensagens",
  story_insights: "Respostas e menções em stories",
  comments: "Comentários em posts e reels",
  live_comments: "Comentários em lives",
  mentions: "Menções ao @ em outras contas",
};

const ALL_SUBSCRIPTIONS = Object.keys(SUBSCRIPTION_LABELS);

const ALL_KEY = "__all__";

/** Tiny uncontrolled wrapper around AwToggle for visual rows in the panel. */
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
 * Left rail — Instagram account switcher
 * ================================================================ */

function AccountRail({
  accounts,
  selectedId,
  onSelect,
  onAddAccount,
}: {
  accounts: IgAccount[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAddAccount: () => void;
}) {
  return (
    <aside
      aria-label="Contas do Instagram conectadas"
      className="hidden w-[280px] flex-shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-canvas)] md:flex"
    >
      <header className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-4 py-4">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Contas
          </h3>
          <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--fg-primary)] px-1.5 text-[11px] font-semibold text-[var(--bg-raised)]">
            {accounts.length}
          </span>
        </div>
        <AwButton
          variant="ghost"
          size="sm"
          iconOnly="add"
          aria-label="Conectar nova conta"
          onClick={onAddAccount}
        />
      </header>

      <ul
        role="listbox"
        aria-label="Contas conectadas"
        className="m-0 flex-1 list-none overflow-y-auto p-2"
      >
        {(() => {
          const allActive = selectedId === ALL_KEY;
          const totalDms = accounts.reduce((acc, a) => acc + a.openDms, 0);
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
                  <span className="block truncate text-[13px] font-semibold text-[var(--fg-primary)]">
                    Todas as contas
                  </span>
                  <span className="mt-0.5 block truncate text-[11.5px] text-[var(--fg-tertiary)]">
                    {accounts.length} {accounts.length === 1 ? "conta" : "contas"} ·{" "}
                    {totalDms} {totalDms === 1 ? "DM aberta" : "DMs abertas"}
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
        {accounts.map((a) => {
          const meta = STATUS_PILL[a.status];
          const active = a.id === selectedId;
          return (
            <li key={a.id} className="mb-1 last:mb-0">
              <button
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => onSelect(a.id)}
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
                    src={a.avatarSrc}
                    alt={a.handle}
                    initials={(a.handle[0] ?? "?").toUpperCase()}
                  />
                  <AwStatusDot
                    variant={meta.dot}
                    size="sm"
                    ring
                    absolute
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-[var(--fg-primary)]">
                    @{a.handle}
                  </span>
                  <span className="mt-0.5 block truncate text-[11.5px] text-[var(--fg-tertiary)]">
                    {KIND_LABEL[a.kind]} · {formatFollowers(a.followers)}
                  </span>
                  {a.status !== "active" && (
                    <span className="mt-1.5 inline-flex">
                      <AwPill variant={meta.variant}>{a.statusLabel}</AwPill>
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
          onClick={onAddAccount}
          block
        >
          Conectar nova conta
        </AwButton>
      </footer>
    </aside>
  );
}

function formatFollowers(n: number) {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k.toFixed(k >= 10 ? 0 : 1).replace(".", ",")} mil seguidores`;
  }
  return `${n} seguidores`;
}

/* ================================================================
 * Header — selected account title + actions
 * ================================================================ */

function PanelHeader({
  account,
  enabled,
  onToggleEnabled,
}: {
  account: IgAccount;
  enabled: boolean;
  onToggleEnabled: (next: boolean) => void;
}) {
  const meta = STATUS_PILL[account.status];
  const toggleId = `instagram-active-${account.id}`;
  const igInboxUrl = `https://business.facebook.com/latest/inbox/instagram?asset_id=${account.igUserId}`;

  return (
    <header className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-7 py-5">
      <div className="flex min-w-0 items-center gap-3.5">
        <div className="relative">
          <AwAvatar
            size="lg"
            src={account.avatarSrc}
            alt={account.handle}
            initials={(account.handle[0] ?? "?").toUpperCase()}
          />
          <span className="absolute -bottom-1 -right-1 rounded-full bg-[var(--bg-canvas)] p-0.5">
            <AwBrandLogo brand="instagram" size="sm" bare />
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="m-0 truncate text-[18px] font-semibold tracking-[-0.005em] text-[var(--fg-primary)]">
              @{account.handle}
            </h2>
            <AwPill variant={meta.variant}>{account.statusLabel}</AwPill>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[var(--fg-tertiary)]">
            <span>{account.displayName}</span>
            <span aria-hidden>·</span>
            <span>{KIND_LABEL[account.kind]}</span>
            <span aria-hidden>·</span>
            <span>{formatFollowers(account.followers)}</span>
            <span aria-hidden>·</span>
            <span>Última atividade {account.lastEvent}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-3">
        <label
          htmlFor={toggleId}
          className="flex cursor-pointer items-center gap-2 text-[12.5px] font-medium text-[var(--fg-secondary)]"
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
            window.open(igInboxUrl, "_blank", "noopener,noreferrer")
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

function IssuesBanner({ account }: { account: IgAccount }) {
  const issues = useMemo<Issue[]>(() => {
    const list: Issue[] = [];
    if (account.status === "rejected") {
      list.push({
        sev: "high",
        title: "Acesso à conta revogado",
        desc: "Reconecte o Instagram via Login do Facebook pra retomar DMs e comentários.",
        cta: "Reconectar",
      });
    }
    if (!account.subscriptions.includes("messages")) {
      list.push({
        sev: "high",
        title: "Webhook de DMs desligado",
        desc: "Sem o evento messages você não recebe novas DMs em tempo real.",
        cta: "Ativar webhook",
      });
    }
    if (!account.subscriptions.includes("comments") && account.kind === "business") {
      list.push({
        sev: "med",
        title: "Comentários sem moderação automática",
        desc: "Ative o webhook comments pra responder ou ocultar comentários a partir do AwSales.",
        cta: "Ativar comments",
      });
    }
    if (!account.professionalAccount) {
      list.push({
        sev: "high",
        title: "Conta não é profissional",
        desc: "A API só atende contas Comerciais ou de Criador. Converta o perfil no app do Instagram.",
        cta: "Como converter",
      });
    }
    return list;
  }, [account]);

  if (issues.length === 0) return null;

  return (
    <AwAlert variant={issues.some((i) => i.sev === "high") ? "danger" : "warning"}>
      <strong className="text-[13px] font-semibold text-[var(--fg-primary)]">
        {issues.length}{" "}
        {issues.length === 1 ? "ação necessária" : "ações necessárias"} nesta conta
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
  account,
  onTab,
}: {
  account: IgAccount;
  onTab: (tab: string) => void;
}) {
  const healthVariant =
    account.health > 70 ? "success" : account.health > 40 ? "warning" : "danger";

  return (
    <div className="flex flex-col gap-6">
      <IssuesBanner account={account} />

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
              {account.health}
            </span>
            <span className="text-[12px] text-[var(--fg-tertiary)]">/100</span>
          </div>
          <AwProgress value={account.health} variant={healthVariant} />
          <div className="text-[12px] text-[var(--fg-tertiary)]">
            {healthVariant === "success"
              ? "Tudo certo para escalar"
              : healthVariant === "warning"
                ? "Atenção: revise os pontos abertos"
                : "Crítico: respostas podem ser bloqueadas"}
          </div>
        </AwCard>

        <AwCard className="flex flex-col gap-2 p-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            DMs (30d)
          </div>
          <div className="text-[22px] font-semibold leading-none text-[var(--fg-primary)]">
            {account.dms30d.toLocaleString("pt-BR")}
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[var(--fg-tertiary)]">
            <AwPill
              variant={account.dmsTrend.startsWith("+") ? "live" : "error"}
              dot={false}
            >
              {account.dmsTrend}
            </AwPill>
            vs. 30 dias anteriores
          </div>
        </AwCard>

        <AwCard className="flex flex-col gap-2 p-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Stories & comentários (30d)
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-semibold leading-none text-[var(--fg-primary)]">
              {account.storyReplies30d}
            </span>
            <span className="text-[12px] text-[var(--fg-tertiary)]">stories</span>
          </div>
          <div className="text-[12px] text-[var(--fg-tertiary)]">
            <b className="text-[var(--fg-primary)]">{account.comments30d}</b>{" "}
            comentários · respondidos pelo AwSales
          </div>
        </AwCard>

        <AwCard className="flex flex-col gap-2 p-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Tempo de resposta
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[22px] font-semibold leading-none text-[var(--fg-primary)]">
              {account.responseTimeMin}
            </span>
            <span className="text-[12px] text-[var(--fg-tertiary)]">min · médio</span>
          </div>
          <div className="text-[12px] text-[var(--fg-tertiary)]">
            Taxa de resposta:{" "}
            <b className="text-[var(--fg-primary)]">{account.responseRate}%</b>
          </div>
        </AwCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ConfigCard account={account} onEdit={() => onTab("account")} />
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
            icon="chat_bubble"
            title="DMs & ice breakers"
            desc={`${account.iceBreakers.length} perguntas rápidas`}
            onClick={() => onTab("dms")}
          />
          <ShortcutCard
            icon="auto_stories"
            title="Stories & comentários"
            desc="Regras de auto-resposta"
            onClick={() => onTab("automation")}
          />
          <ShortcutCard
            icon="hub"
            title="Webhooks"
            desc={`${account.subscriptions.length} eventos ativos`}
            onClick={() => onTab("developer")}
          />
          <ShortcutCard
            icon="auto_awesome"
            title="Conectar agente"
            desc="Atender via IA"
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

function ConfigCard({
  account,
  onEdit,
}: {
  account: IgAccount;
  onEdit: () => void;
}) {
  const rows: { icon: string; label: string; value: React.ReactNode }[] = [
    {
      icon: "alternate_email",
      label: "Handle",
      value: <b>@{account.handle}</b>,
    },
    {
      icon: "flag",
      label: "Página vinculada",
      value: <b>{account.pageName}</b>,
    },
    {
      icon: "badge",
      label: "Tipo de conta",
      value: <b>{KIND_LABEL[account.kind]}</b>,
    },
    {
      icon: "verified_user",
      label: "Verificação BM",
      value: account.bmVerified ? (
        <AwPill variant="live">Verificada</AwPill>
      ) : (
        <AwPill variant="error">Não verificada</AwPill>
      ),
    },
    { icon: "lock", label: "Autenticação", value: <b>OAuth · Login do FB</b> },
    {
      icon: "schedule",
      label: "Janela 24h",
      value: <b>{account.activeWindows} ativas</b>,
    },
  ];

  return (
    <AwCard className="flex flex-col">
      <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <h3 className="m-0 text-[13.5px] font-semibold text-[var(--fg-primary)]">
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
    title: <>Regra de auto-resposta em comentários ativada</>,
    meta: "há 8 min · você",
  },
  {
    dot: "info",
    title: <>14 menções em stories nas últimas 24h</>,
    meta: "há 1 h · pico de engajamento",
  },
  {
    dot: "attention",
    title: <>5 DMs saíram da janela 24h sem resposta</>,
    meta: "ontem · revise as notificações",
  },
  {
    dot: "live",
    title: (
      <>
        Webhook conectado:{" "}
        <code className="font-mono text-[12px]">message_reactions</code>
      </>
    ),
    meta: "há 3 d · automático",
  },
];

function ActivityCard() {
  return (
    <AwCard className="flex flex-col">
      <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-3">
        <h3 className="m-0 text-[13.5px] font-semibold text-[var(--fg-primary)]">
          Atividade recente
        </h3>
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
 * Accounts tab — list of IG accounts (when viewing aggregated)
 * ================================================================ */

function AccountsTab({
  accounts,
  onOpenAccount,
}: {
  accounts: IgAccount[];
  onOpenAccount: (id: string) => void;
}) {
  if (accounts.length === 0) {
    return (
      <AwEmpty>
        <AwEmptyHeader>
          <AwEmptyMedia variant="icon">
            <Icon name="alternate_email" size={20} />
          </AwEmptyMedia>
          <AwEmptyTitle>Nenhuma conta conectada</AwEmptyTitle>
          <AwEmptyDescription>
            Conecte uma conta Comercial ou de Criador do Instagram pra começar a
            atender por aqui.
          </AwEmptyDescription>
        </AwEmptyHeader>
        <AwButton variant="primary" size="md" iconLeft="add">
          Conectar conta
        </AwButton>
      </AwEmpty>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] text-[var(--fg-tertiary)]">
          {accounts.length}{" "}
          {accounts.length === 1 ? "conta conectada" : "contas conectadas"}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {accounts.map((a) => (
          <AwCard
            key={a.id}
            interactive
            onClick={() => onOpenAccount(a.id)}
            className="flex flex-col gap-3 p-4 text-left"
          >
            <div className="flex items-start justify-between gap-2">
              <AwAvatar
                size="md"
                src={a.avatarSrc}
                alt={a.handle}
                initials={(a.handle[0] ?? "?").toUpperCase()}
              />
              <AwPill variant={STATUS_PILL[a.status].variant}>
                {a.statusLabel}
              </AwPill>
            </div>
            <div>
              <div className="text-[14px] font-semibold text-[var(--fg-primary)]">
                @{a.handle}
              </div>
              <div className="mt-0.5 text-[12px] text-[var(--fg-tertiary)]">
                {a.displayName}
              </div>
              <div className="mt-1 text-[11.5px] text-[var(--fg-tertiary)]">
                {KIND_LABEL[a.kind]} · {formatFollowers(a.followers)}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 border-t border-[var(--border-subtle)] pt-3">
              <AccountStat label="DMs abertas">
                <span className="text-[12.5px] font-semibold text-[var(--fg-primary)]">
                  {a.openDms}
                </span>
              </AccountStat>
              <AccountStat label="Resposta">
                <span className="text-[12.5px] font-semibold text-[var(--fg-primary)]">
                  {a.responseRate}%
                </span>
              </AccountStat>
              <AccountStat label="Qualidade">
                <AwPill variant={QUALITY_PILL[a.quality]}>{a.quality}</AwPill>
              </AccountStat>
            </div>
          </AwCard>
        ))}
      </div>
    </div>
  );
}

function AccountStat({
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
 * DMs tab — welcome, ice breakers, away message
 * ================================================================ */

function DmsTab({ account }: { account: IgAccount }) {
  return (
    <div className="flex flex-col gap-6">
      <AwAlert variant="info">
        <strong className="text-[13px] font-semibold text-[var(--fg-primary)]">
          Como o Instagram trata DMs
        </strong>
        <p className="m-0 mt-1 text-[12px] leading-[1.55] text-[var(--fg-secondary)]">
          Tem janela de 24h após a última mensagem do usuário. Fora disso, só{" "}
          <b>HUMAN_AGENT</b> consegue responder. Ice breakers aparecem antes da
          primeira mensagem e disparam postbacks pra rotear o atendimento.
        </p>
      </AwAlert>

      <SectionCard
        title="Mensagem de boas-vindas"
        action={
          <AwPill variant="neutral" dot={false}>
            até 1.000 caracteres
          </AwPill>
        }
      >
        <div className="px-4 py-4">
          <AwField
            label="Aparece quando o usuário abre a DM pela primeira vez"
            htmlFor={`ig-welcome-${account.id}`}
            helper="Use {{first_name}} pra personalizar com o nome do usuário."
          >
            <textarea
              id={`ig-welcome-${account.id}`}
              defaultValue={`Oi {{first_name}}! 👋 Aqui é da @${account.handle}. Posso te ajudar com pedidos, dicas de skincare ou parcerias. Por onde a gente começa?`}
              rows={3}
              className="aw-input"
              style={{ resize: "vertical", minHeight: 80 }}
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
          {account.iceBreakers.map((ib, i) => (
            <li
              key={ib.payload}
              className={
                "flex items-center gap-3 px-4 py-3 " +
                (i > 0 ? "border-t border-[var(--border-subtle)]" : "")
              }
            >
              <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-[var(--bg-surface)] text-[12px] font-semibold text-[var(--fg-secondary)]">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-[var(--fg-primary)]">
                  {ib.question}
                </div>
                <div className="mt-0.5 truncate font-mono text-[11.5px] text-[var(--fg-tertiary)]">
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
          {account.iceBreakers.length === 0 && (
            <li className="px-4 py-6 text-center text-[12.5px] text-[var(--fg-tertiary)]">
              Sem ice breakers. Adicione perguntas curtas pra agilizar o início da
              conversa.
            </li>
          )}
        </ul>
      </SectionCard>

      <SectionCard title="Mensagem de ausência">
        <div className="grid gap-x-6 gap-y-4 px-4 py-4 sm:grid-cols-[1fr_240px] sm:items-start">
          <AwField
            label="Resposta automática fora do horário"
            htmlFor={`ig-away-${account.id}`}
          >
            <textarea
              id={`ig-away-${account.id}`}
              defaultValue="Recebemos tua mensagem 💛 Nosso atendimento volta seg-sáb às 8h. Vou registrar tua dúvida pra gente continuar daqui a pouco."
              rows={3}
              className="aw-input"
              style={{ resize: "vertical", minHeight: 80 }}
            />
          </AwField>
          <AwField label="Horário de atendimento" htmlFor={`ig-hours-${account.id}`}>
            <AwInput
              id={`ig-hours-${account.id}`}
              defaultValue="Seg–Sáb · 8h–22h"
              iconLeft="schedule"
            />
          </AwField>
        </div>
      </SectionCard>

      <SectionCard
        title="Atribuição automática"
        action={<LocalToggle defaultChecked label="Atribuição automática" />}
      >
        <div className="grid gap-x-6 gap-y-4 px-4 py-4 sm:grid-cols-2">
          <AwField label="Equipe padrão" htmlFor={`ig-team-${account.id}`}>
            <AwInput
              id={`ig-team-${account.id}`}
              defaultValue="Time Atendimento"
              iconLeft="groups"
            />
          </AwField>
          <AwField label="Agente padrão" htmlFor={`ig-agent-${account.id}`}>
            <AwInput
              id={`ig-agent-${account.id}`}
              defaultValue="Mari · agente de IA"
              iconLeft="smart_toy"
            />
          </AwField>
        </div>
      </SectionCard>
    </div>
  );
}

/* ================================================================
 * Automation tab — story replies, mentions, comments
 * ================================================================ */

function AutomationTab({ account }: { account: IgAccount }) {
  const isCreator = account.kind === "creator";

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        title="Respostas em stories"
        action={<LocalToggle defaultChecked label="Auto-resposta em stories" />}
      >
        <div className="px-4 py-4">
          <AwField
            label="Quando alguém responder seu story"
            htmlFor={`ig-story-${account.id}`}
            helper="Resposta enviada como DM. Conta como início de janela 24h."
          >
            <textarea
              id={`ig-story-${account.id}`}
              defaultValue="Obrigada pela resposta no story! 🥰 Posso te ajudar com algo? Tô por aqui."
              rows={3}
              className="aw-input"
              style={{ resize: "vertical", minHeight: 80 }}
            />
          </AwField>
        </div>
      </SectionCard>

      <SectionCard
        title="Menções ao seu @"
        action={<LocalToggle defaultChecked label="Notificar menções" />}
      >
        <ul className="m-0 list-none p-0">
          <ToggleRow
            title="Em stories"
            description="Manda DM agradecendo quando alguém te menciona em um story."
            defaultChecked
          />
          <ToggleRow
            title="Em comentários de outras contas"
            description="Notifica via webhook mentions, sem auto-resposta."
            defaultChecked
          />
          <ToggleRow
            title="Em legendas e bios"
            description="Apenas registra a menção. Não permite ação automática."
          />
        </ul>
      </SectionCard>

      <SectionCard
        title="Comentários em posts e reels"
        action={
          <LocalToggle
            defaultChecked={!isCreator}
            label="Auto-resposta em comentários"
          />
        }
      >
        {isCreator ? (
          <div className="px-4 py-5 text-center">
            <p className="m-0 text-[12.5px] text-[var(--fg-tertiary)]">
              Contas de Criador têm acesso limitado à API de comentários. Algumas
              ações precisam ser feitas direto no app do Instagram.
            </p>
          </div>
        ) : (
          <div className="grid gap-x-6 gap-y-4 px-4 py-4 sm:grid-cols-2">
            <AwField
              label="Resposta padrão em comentário público"
              htmlFor={`ig-comment-public-${account.id}`}
              helper="Aparece publicamente abaixo do comentário."
            >
              <AwInput
                id={`ig-comment-public-${account.id}`}
                defaultValue="Te chamei na DM 💌"
                iconLeft="comment"
              />
            </AwField>
            <AwField
              label="DM enviada em paralelo"
              htmlFor={`ig-comment-dm-${account.id}`}
              helper="Conta como início de janela 24h. Use só se houver opt-in implícito."
            >
              <AwInput
                id={`ig-comment-dm-${account.id}`}
                defaultValue="Oi! Vi seu comentário em {{post_url}}. Posso te ajudar?"
                iconLeft="chat"
              />
            </AwField>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Moderação de comentários"
        action={
          <AwButton variant="ghost" size="sm" iconLeft="shield">
            Editar lista
          </AwButton>
        }
      >
        <ul className="m-0 list-none p-0">
          <ToggleRow
            title="Ocultar comentários com palavras bloqueadas"
            description="Lista compartilhada com a Meta. 47 termos atualmente."
            defaultChecked
          />
          <ToggleRow
            title="Ocultar comentários repetidos"
            description="Mais de 3 comentários idênticos do mesmo usuário em 1h."
            defaultChecked
          />
          <ToggleRow
            title="Notificar sobre comentários ocultados"
            description="DM interna pro time de atendimento."
          />
        </ul>
      </SectionCard>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  defaultChecked = false,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <li className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-4 py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-medium text-[var(--fg-primary)]">
          {title}
        </div>
        <div className="mt-0.5 text-[12px] leading-[1.5] text-[var(--fg-tertiary)]">
          {description}
        </div>
      </div>
      <LocalToggle defaultChecked={defaultChecked} label={title} />
    </li>
  );
}

/* ================================================================
 * Account tab — fields, permissions, team, danger zone
 * ================================================================ */

const PERMISSIONS: { label: string; granted: boolean; note?: string }[] = [
  { label: "instagram_basic — perfil e mídias", granted: true },
  {
    label: "instagram_manage_messages — enviar e ler DMs",
    granted: true,
  },
  {
    label: "instagram_manage_comments — moderar comentários",
    granted: true,
  },
  {
    label: "instagram_manage_insights — métricas de stories e reels",
    granted: true,
  },
  {
    label: "pages_show_list — vincular conta à Página",
    granted: true,
  },
  {
    label: "instagram_shopping_tag_products — taggear produtos em DM",
    granted: false,
    note: "opcional · revogada",
  },
];

const TEAM = [
  { name: "Greg Matuzalem", role: "Admin · você", email: "greg@awsales.io", initials: "GM" },
  { name: "Marina Costa", role: "Editor", email: "marina@awsales.io", initials: "MC" },
  { name: "Henrique Lima", role: "Visualizador", email: "henrique@awsales.io", initials: "HL" },
];

function AccountTab({ account }: { account: IgAccount }) {
  return (
    <div className="flex flex-col gap-6">
      <SectionCard title="Detalhes da conta">
        <div className="grid gap-x-6 gap-y-4 px-4 py-4 sm:grid-cols-2">
          <DetailField label="Handle" value={`@${account.handle}`} />
          <DetailField label="Nome de exibição" value={account.displayName} />
          <DetailField
            label="Instagram User ID"
            value={account.igUserId}
            mono
            copy
          />
          <DetailField
            label="Page ID vinculado"
            value={account.pageId}
            mono
            copy
          />
          <DetailField label="Página" value={account.pageName} />
          <DetailField
            label="Tipo de conta"
            value={KIND_LABEL[account.kind]}
          />
          <DetailField
            label="Conta profissional"
            value={
              account.professionalAccount ? (
                <AwPill variant="live">Sim</AwPill>
              ) : (
                <AwPill variant="error">Não</AwPill>
              )
            }
          />
          <DetailField
            label="Verificação BM"
            value={
              account.bmVerified ? (
                <AwPill variant="live">Verificada</AwPill>
              ) : (
                <AwPill variant="error">Não verificada</AwPill>
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
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Zona de risco" tone="danger">
        <DangerRow
          title="Renovar token de acesso"
          desc="Tokens de longa duração expiram em 60 dias. A renovação pede login do admin no Login do Facebook."
          cta="Renovar"
        />
        <DangerRow
          title="Desconectar conta"
          desc="Pausa imediatamente DMs e moderação de comentários. Histórico permanece no Instagram e no AwSales."
          cta="Desconectar"
        />
        <DangerRow
          title="Excluir do AwSales"
          desc="Remove webhooks, ice breakers e regras de automação dentro do AwSales. Não afeta a conta no Instagram."
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

function DeveloperTab({ account }: { account: IgAccount }) {
  return (
    <div className="flex flex-col gap-6">
      <AwCard className="p-4">
        <h3 className="m-0 mb-1 text-[13.5px] font-semibold text-[var(--fg-primary)]">
          Webhook & API
        </h3>
        <p className="m-0 mb-3 text-[12px] leading-[1.45] text-[var(--fg-tertiary)]">
          Endpoint dedicado para receber eventos da Instagram Graph API. Use o
          segredo para validar o cabeçalho{" "}
          <code className="font-mono text-[11.5px]">X-Hub-Signature-256</code>.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <AwField label="Webhook URL" htmlFor={`ig-webhook-${account.id}`}>
            <AwInput
              id={`ig-webhook-${account.id}`}
              readOnly
              defaultValue={`https://api.awsales.io/instagram/${account.id}/events`}
              iconLeft="link"
            />
          </AwField>
          <AwField label="App secret" htmlFor={`ig-secret-${account.id}`}>
            <AwInput
              id={`ig-secret-${account.id}`}
              type="password"
              defaultValue="appsec_c2f81d4a9f0b1e3a7c4e"
              iconLeft="lock"
            />
          </AwField>
          <AwField
            label="Verify token"
            htmlFor={`ig-verify-${account.id}`}
            helper="Use este valor no campo 'Verify Token' ao configurar webhooks na Meta."
          >
            <AwInput
              id={`ig-verify-${account.id}`}
              defaultValue={`vt_${account.igUserId}_aw`}
              iconLeft="vpn_key"
            />
          </AwField>
          <AwField label="Token de longa duração" htmlFor={`ig-token-${account.id}`}>
            <AwInput
              id={`ig-token-${account.id}`}
              type="password"
              defaultValue="IGQVJVc1Z…"
              iconLeft="key"
            />
          </AwField>
        </div>
      </AwCard>

      <SectionCard
        title="Eventos assinados"
        action={
          <AwPill variant="neutral" dot={false}>
            {account.subscriptions.length}/{ALL_SUBSCRIPTIONS.length} ativos
          </AwPill>
        }
      >
        <ul className="m-0 list-none p-0">
          {ALL_SUBSCRIPTIONS.map((evt, i) => {
            const active = account.subscriptions.includes(evt);
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
                  <div className="text-[13px] font-medium text-[var(--fg-primary)]">
                    {SUBSCRIPTION_LABELS[evt]}
                  </div>
                  <div className="mt-0.5 font-mono text-[11.5px] text-[var(--fg-tertiary)]">
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
          <div className="text-[13.5px] font-semibold text-[var(--fg-primary)]">
            Testar webhook
          </div>
          <div className="mt-0.5 text-[12px] leading-[1.5] text-[var(--fg-tertiary)]">
            Dispara um evento sintético de DM para validar a entrega.
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
 * Aggregated header + overview ("Todas as contas")
 * ================================================================ */

function AggregatedHeader({ accounts }: { accounts: IgAccount[] }) {
  const totalDms = accounts.reduce((a, x) => a + x.openDms, 0);
  const totalActiveWindows = accounts.reduce((a, x) => a + x.activeWindows, 0);
  const issuesCount = accounts.filter((x) => x.status !== "active").length;

  return (
    <header className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-7 py-6">
      <div className="flex min-w-0 items-center gap-3.5">
        <div className="grid h-[56px] w-[56px] place-items-center rounded-[10px] bg-[color-mix(in_srgb,var(--fg-primary)_92%,transparent)] text-[var(--bg-raised)]">
          <Icon name="dashboard" size={28} fill={1} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="m-0 truncate text-[18px] font-semibold tracking-[-0.005em] text-[var(--fg-primary)]">
              Todas as contas do Instagram
            </h2>
            {issuesCount > 0 && (
              <AwPill variant="beta">
                {issuesCount}{" "}
                {issuesCount === 1 ? "conta com pendência" : "contas com pendências"}
              </AwPill>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[var(--fg-tertiary)]">
            <span>{accounts.length} contas conectadas</span>
            <span aria-hidden>·</span>
            <span>
              {totalDms} {totalDms === 1 ? "DM aberta" : "DMs abertas"}
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
  accounts,
  onSelectAccount,
}: {
  accounts: IgAccount[];
  onSelectAccount: (id: string) => void;
}) {
  const avgHealth = Math.round(
    accounts.reduce((a, x) => a + x.health, 0) / Math.max(accounts.length, 1),
  );
  const avgResponse = Math.round(
    accounts.reduce((a, x) => a + x.responseRate, 0) / Math.max(accounts.length, 1),
  );
  const totalDms30 = accounts.reduce((a, x) => a + x.dms30d, 0);
  const totalStories = accounts.reduce((a, x) => a + x.storyReplies30d, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AwCard className="flex flex-col gap-2 p-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Saúde média
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-[24px] font-semibold leading-none text-[var(--fg-primary)]">
              {avgHealth}
            </span>
            <span className="text-[12px] text-[var(--fg-tertiary)]">/100</span>
          </div>
          <AwProgress
            value={avgHealth}
            variant={avgHealth > 70 ? "success" : avgHealth > 40 ? "warning" : "danger"}
          />
        </AwCard>
        <AwCard className="flex flex-col gap-2 p-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            DMs (30d)
          </div>
          <div className="text-[22px] font-semibold leading-none text-[var(--fg-primary)]">
            {totalDms30.toLocaleString("pt-BR")}
          </div>
          <div className="text-[12px] text-[var(--fg-tertiary)]">
            soma das contas
          </div>
        </AwCard>
        <AwCard className="flex flex-col gap-2 p-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Stories (30d)
          </div>
          <div className="text-[22px] font-semibold leading-none text-[var(--fg-primary)]">
            {totalStories}
          </div>
          <div className="text-[12px] text-[var(--fg-tertiary)]">
            menções e respostas
          </div>
        </AwCard>
        <AwCard className="flex flex-col gap-2 p-4">
          <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
            Taxa de resposta média
          </div>
          <div className="text-[22px] font-semibold leading-none text-[var(--fg-primary)]">
            {avgResponse}%
          </div>
          <div className="text-[12px] text-[var(--fg-tertiary)]">
            calculada pelas contas
          </div>
        </AwCard>
      </div>

      <SectionCard title="Contas conectadas">
        <ul className="m-0 list-none p-0">
          {accounts.map((a, i) => (
            <li
              key={a.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelectAccount(a.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectAccount(a.id);
                }
              }}
              className={
                "flex w-full cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--bg-hover)] focus:outline-none focus-visible:bg-[var(--bg-hover)] " +
                (i > 0 ? "border-t border-[var(--border-subtle)]" : "")
              }
            >
              <AwAvatar
                size="md"
                src={a.avatarSrc}
                alt={a.handle}
                initials={(a.handle[0] ?? "?").toUpperCase()}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] font-semibold text-[var(--fg-primary)]">
                  @{a.handle}
                </div>
                <div className="mt-0.5 truncate text-[11.5px] text-[var(--fg-tertiary)]">
                  {KIND_LABEL[a.kind]} · {formatFollowers(a.followers)} ·{" "}
                  {a.responseRate}% resposta
                </div>
              </div>
              <AwPill variant={STATUS_PILL[a.status].variant}>
                {a.statusLabel}
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
 * Empty state — no accounts connected
 * ================================================================ */

function EmptyState({ onAddAccount }: { onAddAccount: () => void }) {
  return (
    <div className="flex min-h-full items-center justify-center px-10 py-16">
      <section className="flex w-full max-w-[520px] flex-col items-center text-center">
        <AwBrandLogo brand="instagram" size="lg" />
        <h1 className="m-0 mt-6 text-[24px] font-semibold tracking-[-0.01em] text-[var(--fg-primary)]">
          Conecte uma conta do Instagram
        </h1>
        <p className="m-0 mt-2 text-[14px] leading-[1.55] text-[var(--fg-secondary)]">
          O Instagram só responde via API com contas Comerciais ou de Criador,
          vinculadas a uma Página do Facebook. Conecte a primeira pra começar.
        </p>

        <div className="mt-8 flex w-full items-start gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 text-left">
          <Icon
            name="info"
            size={20}
            className="mt-0.5 text-[var(--fg-secondary)]"
          />
          <div>
            <p className="m-0 text-[13px] font-medium text-[var(--fg-primary)]">
              O que você precisa
            </p>
            <ul className="m-0 mt-1 list-disc pl-5 text-[13px] leading-[1.55] text-[var(--fg-secondary)]">
              <li>Conta Profissional (Comercial ou Criador) no Instagram</li>
              <li>Página do Facebook vinculada à conta</li>
              <li>
                Permissões instagram_manage_messages e instagram_manage_comments
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          <AwButton
            variant="primary"
            size="md"
            iconLeft="add"
            onClick={onAddAccount}
          >
            Conectar conta
          </AwButton>
          <AwButton
            variant="secondary"
            size="md"
            iconRight="open_in_new"
            onClick={() =>
              window.open(
                "https://developers.facebook.com/docs/instagram-platform",
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

export type AwInstagramPanelProps = {
  onAddAccount?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
};

export function AwInstagramPanel({
  onAddAccount,
  onCancel,
  onSave,
}: AwInstagramPanelProps) {
  const accounts = SAMPLE_ACCOUNTS;
  const [selectedId, setSelectedId] = useState<string>(
    accounts[0]?.id ?? ALL_KEY,
  );
  const [tab, setTab] = useState<string>("overview");
  const [enabled, setEnabled] = useState(true);

  const isAll = selectedId === ALL_KEY;
  const selected = accounts.find((a) => a.id === selectedId) ?? null;
  const viewAccounts = isAll ? accounts : selected ? [selected] : [];

  const handleAddAccount = () => onAddAccount?.();

  if (accounts.length === 0) {
    return <EmptyState onAddAccount={handleAddAccount} />;
  }

  const tabItems = [
    { value: "overview", label: "Visão geral" },
    {
      value: "accounts",
      label: "Contas",
      count: accounts.length,
    },
    ...(isAll
      ? []
      : [
          {
            value: "dms",
            label: "DMs",
            count: selected?.iceBreakers.length ?? 0,
          },
          { value: "automation", label: "Stories & comentários" },
          { value: "account", label: "Conta & permissões" },
          { value: "developer", label: "API & webhooks" },
        ]),
  ];

  return (
    <div className="flex h-full">
      {accounts.length > 1 && (
        <AccountRail
          accounts={accounts}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            if (id === ALL_KEY && tab !== "overview" && tab !== "accounts") {
              setTab("overview");
            }
          }}
          onAddAccount={handleAddAccount}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {isAll ? (
          <AggregatedHeader accounts={accounts} />
        ) : (
          selected && (
            <PanelHeader
              account={selected}
              enabled={enabled}
              onToggleEnabled={setEnabled}
            />
          )
        )}

        <div className="flex-1 overflow-y-auto px-7 py-6">
          <div className="mb-5">
            <AwTabs
              aria-label={isAll ? "Visão consolidada" : "Configurações da conta"}
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
                  accounts={accounts}
                  onSelectAccount={setSelectedId}
                />
              ) : (
                selected && <OverviewTab account={selected} onTab={setTab} />
              ))}
            {tab === "accounts" && (
              <AccountsTab
                accounts={viewAccounts}
                onOpenAccount={setSelectedId}
              />
            )}
            {!isAll && tab === "dms" && selected && (
              <DmsTab account={selected} />
            )}
            {!isAll && tab === "automation" && selected && (
              <AutomationTab account={selected} />
            )}
            {!isAll && tab === "account" && selected && (
              <AccountTab account={selected} />
            )}
            {!isAll && tab === "developer" && selected && (
              <DeveloperTab account={selected} />
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

export default AwInstagramPanel;
