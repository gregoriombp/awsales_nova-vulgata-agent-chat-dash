"use client";

import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
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
import {
  AwIntegrationCard,
  type AwIntegrationCardState,
} from "@/components/ui/AwIntegrationCard";
import { AwConnectModal } from "@/components/ui/AwConnectModal";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwTabs } from "@/components/ui/AwTabs";
import { Icon } from "@/components/ui/Icon";

type IntegrationCategory =
  | "channels"
  | "checkouts"
  | "members"
  | "forms"
  | "meetings"
  | "crms"
  | "marketplaces";

type CategoryFilter = "all" | IntegrationCategory;

type AuthMethod = "oauth" | "api";

type PermissionMode = "always" | "approval" | "never";

interface ToolPermission {
  id: string;
  name: string;
  description?: string;
  defaultMode: PermissionMode;
}

interface IntegrationTools {
  readOnly?: ToolPermission[];
  writeDelete?: ToolPermission[];
}

interface Integration {
  id: string;
  cat: IntegrationCategory;
  name: string;
  domain: string;
  desc: string;
  state: AwIntegrationCardState;
  auth: AuthMethod;
  instances?: number;
  /** OAuth consent copy — used by AwConnectModal. */
  permissions?: string[];
  /** Granular per-tool permissions, surfaced in the detail sheet. */
  tools?: IntegrationTools;
}

const CATS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "channels", label: "Canais" },
  { id: "checkouts", label: "Checkouts" },
  { id: "members", label: "Área de membros" },
  { id: "forms", label: "Formulários" },
  { id: "meetings", label: "Reuniões" },
  { id: "crms", label: "CRMs" },
  { id: "marketplaces", label: "Marketplaces" },
];

const ITEMS: Integration[] = [
  // CHANNELS
  {
    id: "whatsapp",
    cat: "channels",
    name: "WhatsApp",
    domain: "whatsapp.com",
    desc: "Atenda e recupere vendas via WhatsApp com seus agentes de IA.",
    state: "connected",
    instances: 2,
    auth: "oauth",
    permissions: [
      "Enviar e receber mensagens em seu nome",
      "Acessar contatos e conversas ativas",
      "Ler mídias enviadas pelos clientes",
    ],
    tools: {
      readOnly: [
        { id: "list-conversations", name: "Listar conversas ativas", description: "Acessa conversas em andamento dos últimos 30 dias.", defaultMode: "always" },
        { id: "read-messages", name: "Ler mensagens recebidas", description: "Lê texto, mídias e metadados das mensagens.", defaultMode: "always" },
        { id: "get-contact", name: "Obter informações do contato", description: "Lê nome e foto pública do remetente.", defaultMode: "always" },
      ],
      writeDelete: [
        { id: "send-message", name: "Enviar mensagem", description: "Responde clientes em seu nome.", defaultMode: "approval" },
        { id: "send-template", name: "Disparar template", description: "Envia template aprovado para campanhas.", defaultMode: "approval" },
        { id: "delete-message", name: "Apagar mensagem enviada", description: "Remove uma mensagem após o envio.", defaultMode: "never" },
      ],
    },
  },
  {
    id: "instagram",
    cat: "channels",
    name: "Instagram",
    domain: "instagram.com",
    desc: "Responda DMs do Instagram automaticamente com agentes.",
    state: "connected",
    auth: "oauth",
    permissions: [
      "Ler e responder mensagens diretas",
      "Acessar comentários em posts e reels",
      "Ver informações básicas da conta",
    ],
    tools: {
      readOnly: [
        { id: "list-dms", name: "Listar mensagens diretas", defaultMode: "always" },
        { id: "read-comments", name: "Ler comentários em posts", defaultMode: "always" },
      ],
      writeDelete: [
        { id: "reply-dm", name: "Responder DM", defaultMode: "approval" },
        { id: "reply-comment", name: "Responder comentário", defaultMode: "approval" },
      ],
    },
  },
  { id: "messenger", cat: "channels", name: "Messenger", domain: "messenger.com", desc: "Atendimento automatizado pelo Messenger do Facebook.", state: "available", auth: "oauth", permissions: ["Ler e responder mensagens da página", "Acessar perfis públicos dos clientes", "Receber webhooks de novas conversas"] },
  // CHECKOUTS — quase todos via API/webhook
  {
    id: "hotmart",
    cat: "checkouts",
    name: "Hotmart",
    domain: "hotmart.com",
    desc: "Capture transações e eventos do checkout Hotmart.",
    state: "connected",
    auth: "api",
    tools: {
      readOnly: [
        { id: "list-sales", name: "Listar vendas", defaultMode: "always" },
        { id: "list-subscribers", name: "Listar assinantes", defaultMode: "always" },
      ],
      writeDelete: [
        { id: "refund", name: "Iniciar reembolso", description: "Solicita reembolso de uma transação.", defaultMode: "approval" },
        { id: "cancel-sub", name: "Cancelar assinatura", defaultMode: "approval" },
      ],
    },
  },
  {
    id: "stripe",
    cat: "checkouts",
    name: "Stripe",
    domain: "stripe.com",
    desc: "Pagamentos globais — cartão, PIX, assinaturas.",
    state: "attention",
    auth: "api",
    tools: {
      readOnly: [
        { id: "list-charges", name: "Listar cobranças", defaultMode: "always" },
        { id: "list-customers", name: "Listar clientes", defaultMode: "always" },
      ],
      writeDelete: [
        { id: "create-charge", name: "Criar cobrança", defaultMode: "approval" },
        { id: "refund-charge", name: "Reembolsar cobrança", defaultMode: "approval" },
      ],
    },
  },
  { id: "kiwify", cat: "checkouts", name: "Kiwify", domain: "kiwify.com.br", desc: "Sincronize vendas e abandonos do checkout Kiwify.", state: "available", auth: "api" },
  { id: "eduzz", cat: "checkouts", name: "Eduzz", domain: "eduzz.com", desc: "Capture transações do checkout Eduzz.", state: "available", auth: "api" },
  { id: "hubla", cat: "checkouts", name: "Hubla", domain: "hub.la", desc: "Sincronize vendas e clientes da Hubla.", state: "available", auth: "api" },
  { id: "ticto", cat: "checkouts", name: "Ticto", domain: "ticto.com.br", desc: "Receba eventos de venda do checkout Ticto.", state: "available", auth: "api" },
  { id: "lastlink", cat: "checkouts", name: "LastLink", domain: "lastlink.com", desc: "Capture transações e renovações da LastLink.", state: "available", auth: "api" },
  // MEMBERS
  { id: "memberkit", cat: "members", name: "MemberKit", domain: "memberkit.com.br", desc: "Sincronize alunos e progresso da área de membros.", state: "available", auth: "api" },
  { id: "cademi", cat: "members", name: "Cademi", domain: "cademi.com.br", desc: "Conecte sua área de membros Cademi para automações.", state: "available", auth: "api" },
  // FORMS
  { id: "googleforms", cat: "forms", name: "Google Forms", domain: "forms.google.com", desc: "Receba submissões do Google Forms em tempo real.", state: "available", auth: "oauth", permissions: ["Acessar a lista de formulários da conta", "Receber respostas em tempo real", "Ler metadados das perguntas"] },
  { id: "typeform", cat: "forms", name: "Typeform", domain: "typeform.com", desc: "Capture leads dos seus formulários conversacionais.", state: "available", auth: "oauth", permissions: ["Acessar formulários da workspace", "Receber novas respostas via webhook", "Ler informações do respondente"] },
  { id: "tally", cat: "forms", name: "Tally", domain: "tally.so", desc: "Formulários simples — dispare ações com cada submissão.", state: "available", auth: "api" },
  // MEETINGS
  { id: "calendly", cat: "meetings", name: "Calendly", domain: "calendly.com", desc: "Agendamentos automáticos sincronizados com agentes.", state: "available", auth: "oauth", permissions: ["Acessar tipos de evento e disponibilidade", "Criar e cancelar agendamentos", "Receber notificações de novos eventos"] },
  { id: "googlecal", cat: "meetings", name: "Google Calendar", domain: "calendar.google.com", desc: "Reuniões e disponibilidade direto do Google Agenda.", state: "available", auth: "oauth", permissions: ["Ler eventos e disponibilidade da agenda", "Criar e atualizar eventos em seu nome", "Acessar agendas compartilhadas"] },
  // CRMs
  { id: "pipedrive", cat: "crms", name: "Pipedrive", domain: "pipedrive.com", desc: "Sincronize contatos, deals e atividades do Pipedrive.", state: "available", auth: "oauth", permissions: ["Acessar contatos, organizações e deals", "Criar e atualizar atividades", "Mover deals entre etapas do pipeline"] },
  { id: "kommo", cat: "crms", name: "Kommo", domain: "kommo.com", desc: "Conecte funis, leads e tarefas do Kommo CRM.", state: "available", auth: "oauth", permissions: ["Acessar leads, contatos e empresas", "Criar e atualizar tarefas", "Mover leads entre etapas do funil"] },
  { id: "rdstation", cat: "crms", name: "RD Station", domain: "rdstation.com", desc: "Sincronize leads, oportunidades e tags do RD Station.", state: "available", auth: "oauth", permissions: ["Acessar leads e oportunidades", "Criar e atualizar tags", "Disparar eventos de conversão"] },
  { id: "hubspot", cat: "crms", name: "HubSpot", domain: "hubspot.com", desc: "Conecte contatos, empresas e pipelines do HubSpot.", state: "available", auth: "oauth", permissions: ["Acessar contatos e empresas", "Criar e atualizar deals do pipeline", "Disparar workflows quando uma oportunidade fechar"] },
  // MARKETPLACES
  {
    id: "shopify",
    cat: "marketplaces",
    name: "Shopify",
    domain: "shopify.com",
    desc: "Gerencie produtos, pedidos e clientes pela IA.",
    state: "connected",
    auth: "oauth",
    permissions: [
      "Acessar catálogo de produtos e estoque",
      "Ler pedidos e clientes",
      "Criar rascunhos de pedido e cupons",
    ],
    tools: {
      readOnly: [
        { id: "list-products", name: "Listar produtos e estoque", defaultMode: "always" },
        { id: "list-orders", name: "Listar pedidos", defaultMode: "always" },
        { id: "list-customers", name: "Listar clientes", defaultMode: "always" },
      ],
      writeDelete: [
        { id: "create-draft-order", name: "Criar rascunho de pedido", defaultMode: "approval" },
        { id: "issue-coupon", name: "Emitir cupom", defaultMode: "approval" },
        { id: "refund-order", name: "Reembolsar pedido", defaultMode: "approval" },
      ],
    },
  },
  { id: "magalu", cat: "marketplaces", name: "Magalu", domain: "magalu.com", desc: "Sincronize produtos e pedidos do marketplace Magalu.", state: "available", auth: "api" },
];

const PERM_MODE_META: Record<PermissionMode, { icon: string; label: string }> = {
  always: { icon: "check_circle", label: "Sempre permitir" },
  approval: { icon: "front_hand", label: "Pedir aprovação" },
  never: { icon: "block", label: "Nunca permitir" },
};

function isActive(state: AwIntegrationCardState) {
  return state === "connected" || state === "attention";
}

/* ----------------------------------------------------------------
 * Connected row — list-style card for activated integrations.
 * ---------------------------------------------------------------- */

function ConnectedRow({
  item,
  onClick,
}: {
  item: Integration;
  onClick: () => void;
}) {
  const isAttention = item.state === "attention";
  return (
    <AwCard
      interactive
      role="button"
      tabIndex={0}
      aria-label={`${item.name} — ${item.domain}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="aw-conn-row"
    >
      <AwBrandLogo brand={item.id} size="md" bare />
      <div className="aw-conn-row__heading">
        <h3 className="aw-conn-row__name">{item.name}</h3>
        <p className="aw-conn-row__domain">{item.domain}</p>
      </div>
      <div className="aw-conn-row__right">
        {isAttention ? (
          <AwPill variant="beta">Atenção</AwPill>
        ) : (
          <AwPill variant="live">Conectada</AwPill>
        )}
        <Icon name="chevron_right" size={18} />
      </div>
    </AwCard>
  );
}

/* ----------------------------------------------------------------
 * Permission segmented control — always / approval / never.
 * ---------------------------------------------------------------- */

function PermissionSegment({
  value,
  onChange,
  ariaLabel,
}: {
  value: PermissionMode;
  onChange: (next: PermissionMode) => void;
  ariaLabel: string;
}) {
  const order: PermissionMode[] = ["always", "approval", "never"];
  return (
    <div
      className="aw-perm-seg"
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {order.map((mode) => {
        const meta = PERM_MODE_META[mode];
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={meta.label}
            title={meta.label}
            className={
              "aw-perm-seg__btn" +
              (active ? ` aw-perm-seg__btn--active aw-perm-seg__btn--${mode}` : "")
            }
            onClick={() => onChange(mode)}
          >
            <Icon name={meta.icon} size={16} fill={active ? 1 : 0} />
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------
 * Permission group — collapsible bucket of tools.
 * ---------------------------------------------------------------- */

function PermissionGroup({
  title,
  hint,
  tools,
  modes,
  onChange,
  defaultOpen,
}: {
  title: string;
  hint: string;
  tools: ToolPermission[];
  modes: Record<string, PermissionMode>;
  onChange: (toolId: string, next: PermissionMode) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  const summary = useMemo(() => {
    const counts: Record<PermissionMode, number> = { always: 0, approval: 0, never: 0 };
    for (const t of tools) counts[modes[t.id] ?? t.defaultMode]++;
    if (counts.always === tools.length) return PERM_MODE_META.always.label;
    if (counts.approval === tools.length) return PERM_MODE_META.approval.label;
    if (counts.never === tools.length) return PERM_MODE_META.never.label;
    return "Misto";
  }, [tools, modes]);

  return (
    <section className="aw-perm-group">
      <button
        type="button"
        className="aw-perm-group__head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <Icon name={open ? "expand_more" : "chevron_right"} size={18} />
        <span className="aw-perm-group__title">{title}</span>
        <span className="aw-perm-group__count">{tools.length}</span>
        <span className="aw-perm-group__summary">{summary}</span>
      </button>
      {open && (
        <ul className="aw-perm-group__list">
          {tools.map((tool) => {
            const mode = modes[tool.id] ?? tool.defaultMode;
            return (
              <li key={tool.id} className="aw-perm-group__row">
                <div className="aw-perm-group__row-copy">
                  <div className="aw-perm-group__row-name">{tool.name}</div>
                  {tool.description && (
                    <div className="aw-perm-group__row-desc">
                      {tool.description}
                    </div>
                  )}
                </div>
                <PermissionSegment
                  value={mode}
                  onChange={(next) => onChange(tool.id, next)}
                  ariaLabel={`Permissão para ${tool.name}`}
                />
              </li>
            );
          })}
        </ul>
      )}
      <p className="aw-perm-group__hint">{hint}</p>
    </section>
  );
}

/* ================================================================
 * Page
 * ================================================================ */

export default function IntegrationsPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [activeCat, setActiveCat] = useState<CategoryFilter>("all");
  const [q, setQ] = useState("");
  const [permModes, setPermModes] = useState<Record<string, PermissionMode>>({});

  const connected = ITEMS.filter((i) => isActive(i.state));
  const opened = openId ? ITEMS.find((i) => i.id === openId) ?? null : null;
  const openedIsActive = opened ? isActive(opened.state) : false;

  // Catalog modal triggers same flows as before for non-connected items.
  const showOAuthModal =
    !!opened && !openedIsActive && opened.auth === "oauth";
  const showFormModal = !!opened && !openedIsActive && opened.auth === "api";
  // Detail sheet only for already-active integrations.
  const showDetailSheet = !!opened && openedIsActive;

  const countFor = (id: CategoryFilter) =>
    id === "all" ? ITEMS.length : ITEMS.filter((i) => i.cat === id).length;

  const catalogFiltered = ITEMS.filter((i) => {
    if (activeCat !== "all" && i.cat !== activeCat) return false;
    if (q) {
      const t = q.toLowerCase();
      return (
        i.name.toLowerCase().includes(t) ||
        i.desc.toLowerCase().includes(t) ||
        i.domain.toLowerCase().includes(t)
      );
    }
    return true;
  });

  const breadcrumbs = [
    { label: "Integrações", icon: <Icon name="extension" size={20} /> },
  ];

  const setMode = (toolId: string, next: PermissionMode) =>
    setPermModes((m) => ({ ...m, [toolId]: next }));

  const closeAll = () => {
    setOpenId(null);
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="-m-8 min-h-full bg-[var(--bg-surface)]">
        <div className="mx-auto w-full max-w-[1120px] px-10 pt-12 pb-24">
          {/* Header */}
          <header className="mb-7 flex items-end justify-between gap-6 border-b border-[var(--border-subtle)] pb-6">
            <div>
              <h1 className="m-0 mb-1.5 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--fg-primary)]">
                Integrações
              </h1>
              <p className="m-0 max-w-[560px] text-sm leading-[1.5] text-[var(--fg-secondary)]">
                Conecte canais, plataformas e ferramentas para que seus agentes coletem contexto, executem ações e mantenham seus sistemas sincronizados.
              </p>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <AwButton variant="secondary" size="md" iconLeft="link">
                Solicitar
              </AwButton>
              <AwButton
                variant="primary"
                size="md"
                iconLeft="add"
                onClick={() => setCatalogOpen(true)}
              >
                Nova integração
              </AwButton>
            </div>
          </header>

          {/* Body */}
          {connected.length === 0 ? (
            <AwEmpty>
              <AwEmptyHeader>
                <AwEmptyMedia variant="icon">
                  <Icon name="extension" size={28} />
                </AwEmptyMedia>
                <AwEmptyTitle>Nenhuma integração ativada</AwEmptyTitle>
                <AwEmptyDescription>
                  Conecte uma ferramenta para que seus agentes possam coletar contexto e agir em seu nome.
                </AwEmptyDescription>
              </AwEmptyHeader>
              <div className="mt-4 flex justify-center">
                <AwButton
                  variant="primary"
                  iconLeft="add"
                  onClick={() => setCatalogOpen(true)}
                >
                  Adicionar integração
                </AwButton>
              </div>
            </AwEmpty>
          ) : (
            <>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="m-0 text-[13px] font-medium uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
                  Suas integrações
                </h2>
                <span className="text-[12.5px] tabular-nums text-[var(--fg-tertiary)]">
                  {connected.length}{" "}
                  {connected.length === 1 ? "ativa" : "ativas"}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {connected.map((it) => (
                  <ConnectedRow
                    key={it.id}
                    item={it}
                    onClick={() => setOpenId(it.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Detail modal — connected integration: info + per-tool permissions */}
      <AwModal
        open={showDetailSheet}
        onClose={closeAll}
        title={opened ? `${opened.name} — ${opened.domain}` : undefined}
        footer={
          <div className="flex w-full items-center justify-between gap-2">
            <AwButton variant="secondary" iconLeft="link_off">
              Desconectar
            </AwButton>
            <AwButton variant="primary" onClick={closeAll}>
              Salvar permissões
            </AwButton>
          </div>
        }
      >
        {opened && (
          <>
            <div className="mb-4 flex items-center gap-3">
              <AwBrandLogo brand={opened.id} size="md" bare />
              <p className="m-0 text-[13px] leading-[1.5] text-[var(--fg-secondary)]">
                {opened.desc}
              </p>
            </div>

            <div className="mb-5 flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-3">
              <div>
                <div className="text-[12.5px] font-medium text-[var(--fg-primary)]">
                  Status da conexão
                </div>
                <div className="mt-0.5 text-[12px] text-[var(--fg-tertiary)]">
                  {opened.state === "attention"
                    ? "Token expira em 3 dias — renove para continuar"
                    : "Sincronizado há 2 min"}
                </div>
              </div>
              {opened.state === "attention" ? (
                <AwPill variant="beta">Atenção</AwPill>
              ) : (
                <AwPill variant="live">Ativa</AwPill>
              )}
            </div>

            <h3 className="m-0 mb-1 text-[13px] font-semibold text-[var(--fg-primary)]">
              Permissões por ferramenta
            </h3>
            <p className="m-0 mb-3.5 text-[12px] leading-[1.45] text-[var(--fg-tertiary)]">
              Decida quando seus agentes podem usar cada ação.
            </p>

            {opened.tools?.readOnly && opened.tools.readOnly.length > 0 && (
              <PermissionGroup
                title="Ferramentas de leitura"
                hint="Ler dados não muda nada do lado da plataforma — o padrão é permitir."
                tools={opened.tools.readOnly}
                modes={permModes}
                onChange={setMode}
                defaultOpen
              />
            )}
            {opened.tools?.writeDelete && opened.tools.writeDelete.length > 0 && (
              <PermissionGroup
                title="Ferramentas de escrita / exclusão"
                hint="Ações que alteram dados externos. Padrão é pedir aprovação antes."
                tools={opened.tools.writeDelete}
                modes={permModes}
                onChange={setMode}
                defaultOpen
              />
            )}

            {!opened.tools && (
              <AwEmpty>
                <AwEmptyHeader>
                  <AwEmptyMedia variant="icon">
                    <Icon name="info" size={20} />
                  </AwEmptyMedia>
                  <AwEmptyTitle>Sem permissões configuráveis</AwEmptyTitle>
                  <AwEmptyDescription>
                    Esta integração roda em modo somente-leitura — não há ações
                    individuais para liberar.
                  </AwEmptyDescription>
                </AwEmptyHeader>
              </AwEmpty>
            )}
          </>
        )}
      </AwModal>

      {/* Catalog modal — discovery + Connect entry point */}
      <AwModal
        open={catalogOpen && !opened}
        onClose={() => setCatalogOpen(false)}
        title="Adicionar integração"
        size="cockpit"
      >
        <div className="mb-4">
          <p className="m-0 text-[13px] leading-[1.5] text-[var(--fg-secondary)]">
            Conecte uma plataforma para que seus agentes coletem contexto e
            executem ações em seu nome.
          </p>
        </div>

        <AwTabs
          variant="standalone"
          value={activeCat}
          onChange={(v) => setActiveCat(v as CategoryFilter)}
          className="mb-4"
          aria-label="Categorias de integração"
          items={CATS.map((c) => ({
            value: c.id,
            label: c.label,
            count: countFor(c.id),
          }))}
        />

        <AwInput
          dense
          iconLeft="search"
          placeholder="Buscar integração…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="mb-4 w-full"
          aria-label="Buscar integração"
        />

        {catalogFiltered.length === 0 ? (
          <AwEmpty>
            <AwEmptyHeader>
              <AwEmptyMedia variant="icon">
                <Icon name="search_off" size={24} />
              </AwEmptyMedia>
              <AwEmptyTitle>Nenhuma integração encontrada</AwEmptyTitle>
              <AwEmptyDescription>
                Tente outro termo ou troque a categoria.
              </AwEmptyDescription>
            </AwEmptyHeader>
          </AwEmpty>
        ) : (
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              maxHeight: "min(60vh, 520px)",
              overflowY: "auto",
            }}
          >
            {catalogFiltered.map((it) => (
              <AwIntegrationCard
                key={it.id}
                brand={it.id}
                name={it.name}
                domain={it.domain}
                description={it.desc}
                state={it.state}
                instances={it.instances}
                onClick={() => {
                  setCatalogOpen(false);
                  setOpenId(it.id);
                }}
              />
            ))}
          </div>
        )}
      </AwModal>

      {/* OAuth permission dialog — para integrações via OAuth ainda não conectadas */}
      <AwConnectModal
        open={showOAuthModal}
        onClose={closeAll}
        targetBrand={opened?.id ?? ""}
        targetName={opened?.name ?? ""}
        productName="AwSales"
        description={opened?.desc}
        permissionsTitle={opened ? `O AwSales precisa` : undefined}
        permissions={opened?.permissions ?? []}
        redirectUrl={
          opened
            ? `https://app.awsales.io/integrations/${opened.id}/callback`
            : undefined
        }
        onAllow={closeAll}
      />

      {/* API key form modal — para integrações via chave de API ainda não conectadas */}
      <AwModal
        open={showFormModal}
        onClose={closeAll}
        title={opened ? `Conectar ${opened.name}` : undefined}
        footer={
          <>
            <AwButton variant="secondary" onClick={closeAll}>
              Cancelar
            </AwButton>
            <AwButton variant="primary" onClick={closeAll}>
              Conectar
            </AwButton>
          </>
        }
      >
        {opened && (
          <>
            <div className="mb-4 flex items-center gap-3">
              <AwBrandLogo brand={opened.id} size="md" />
              <p className="m-0 text-xs text-[var(--fg-tertiary)]">
                {opened.domain}
              </p>
            </div>
            <p className="mb-3.5 text-[13.5px] leading-[1.5] text-[var(--fg-secondary)]">
              Cole sua chave de API do <strong>{opened.name}</strong> para
              começar a sincronizar transações e eventos.
            </p>
            <AwField label="API Key" htmlFor={`key-${opened.id}`}>
              <AwInput
                id={`key-${opened.id}`}
                placeholder="sk_live_••••••••••••"
              />
            </AwField>
            <AwField
              label="Webhook secret"
              htmlFor={`secret-${opened.id}`}
            >
              <AwInput
                id={`secret-${opened.id}`}
                placeholder="whsec_••••••••"
              />
            </AwField>
          </>
        )}
      </AwModal>
    </DashboardLayout>
  );
}
