"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import {
  AwEmpty,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { type AwIntegrationCardState } from "@/components/ui/AwIntegrationCard";
import { AwAddIntegrationModal } from "@/components/ui/AwAddIntegrationModal";
import {
  AwConnectModal,
  type AwWebhookStep,
} from "@/components/ui/AwConnectModal";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import { AwWhatsAppPanel } from "@/components/integrations/AwWhatsAppPanel";

const HUBLA_WEBHOOK_TEMPLATE = (id: string) =>
  `https://app.awsales.io/api/webhooks/checkouts/${id}`;

/** Mirrors the default organization shown in the nav rail switcher. */
const ORG_LOGO_SRC = "/assets/icon_artificial_concord_organization.png";
const ORG_NAME = "Nome da organização";

type IntegrationCategory =
  | "channels"
  | "checkouts"
  | "members"
  | "forms"
  | "meetings"
  | "crms"
  | "marketplaces";

type AuthMethod = "oauth" | "webhook" | "apiKey";

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

interface IntegrationInstance {
  instanceId: string;
  integrationId: string;
  name: string;
}

const ADD_MODAL_CATS: { id: IntegrationCategory; label: string }[] = [
  { id: "channels", label: "Canais" },
  { id: "checkouts", label: "Checkouts" },
  { id: "members", label: "Área de membros" },
  { id: "forms", label: "Formulários" },
  { id: "meetings", label: "Reuniões" },
  { id: "crms", label: "CRMs" },
  { id: "marketplaces", label: "Marketplaces" },
];

function buildWebhookSteps(integration: Integration): AwWebhookStep[] {
  const url = HUBLA_WEBHOOK_TEMPLATE(`${integration.id}-d12fa78b3e4c4a1f`);
  return [
    {
      label: "Copiar",
      title: "Copie o webhook",
      body: (
        <p>
          Copie o link abaixo. Ele será utilizado na configuração do{" "}
          {integration.name}.
        </p>
      ),
      copy: { label: "Webhook URL", value: url },
    },
    {
      label: "Configurar",
      title: `Acesse o ${integration.name}`,
      body: (
        <>
          <p>
            No painel do {integration.name}, abra{" "}
            <strong>Webhooks → Novo webhook</strong> e preencha:
          </p>
          <ul>
            <li>
              <strong>Nome:</strong> Integração AwSales
            </li>
            <li>
              <strong>URL:</strong> cole o webhook copiado na etapa anterior
            </li>
            <li>
              <strong>Eventos:</strong> Fatura Criada, Fatura Paga, Fatura
              Reembolsada, Carrinho Abandonado e Pagamento Falhou
            </li>
          </ul>
        </>
      ),
    },
    {
      label: "Salvar",
      title: "Salve a configuração",
      body: (
        <p>
          Após ajustar todas as configurações, garanta que o webhook foi
          salvo e aparece como <strong>Ativo</strong> no painel do{" "}
          {integration.name}.
        </p>
      ),
    },
    {
      label: "Testar",
      title: "Faça um teste",
      body: (
        <p>
          O {integration.name} oferece a opção <em>Testar configuração</em>{" "}
          na tela de edição do webhook. Use essa opção — nosso sistema
          verifica se a integração foi realizada com sucesso.
        </p>
      ),
    },
  ];
}

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
    auth: "apiKey",
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
    auth: "apiKey",
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
  { id: "kiwify", cat: "checkouts", name: "Kiwify", domain: "kiwify.com.br", desc: "Sincronize vendas e abandonos do checkout Kiwify.", state: "available", auth: "webhook" },
  { id: "eduzz", cat: "checkouts", name: "Eduzz", domain: "eduzz.com", desc: "Capture transações do checkout Eduzz.", state: "available", auth: "webhook" },
  { id: "hubla", cat: "checkouts", name: "Hubla", domain: "hub.la", desc: "Sincronize vendas e clientes da Hubla.", state: "available", auth: "webhook" },
  { id: "ticto", cat: "checkouts", name: "Ticto", domain: "ticto.com.br", desc: "Receba eventos de venda do checkout Ticto.", state: "available", auth: "webhook" },
  { id: "lastlink", cat: "checkouts", name: "LastLink", domain: "lastlink.com", desc: "Capture transações e renovações da LastLink.", state: "available", auth: "webhook" },
  // MEMBERS
  { id: "memberkit", cat: "members", name: "MemberKit", domain: "memberkit.com.br", desc: "Sincronize alunos e progresso da área de membros.", state: "available", auth: "apiKey" },
  { id: "cademi", cat: "members", name: "Cademi", domain: "cademi.com.br", desc: "Conecte sua área de membros Cademi para automações.", state: "available", auth: "apiKey" },
  // FORMS
  { id: "googleforms", cat: "forms", name: "Google Forms", domain: "forms.google.com", desc: "Receba submissões do Google Forms em tempo real.", state: "available", auth: "oauth", permissions: ["Acessar a lista de formulários da conta", "Receber respostas em tempo real", "Ler metadados das perguntas"] },
  { id: "typeform", cat: "forms", name: "Typeform", domain: "typeform.com", desc: "Capture leads dos seus formulários conversacionais.", state: "available", auth: "oauth", permissions: ["Acessar formulários da workspace", "Receber novas respostas via webhook", "Ler informações do respondente"] },
  { id: "tally", cat: "forms", name: "Tally", domain: "tally.so", desc: "Formulários simples — dispare ações com cada submissão.", state: "available", auth: "apiKey" },
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
  { id: "magalu", cat: "marketplaces", name: "Magalu", domain: "magalu.com", desc: "Sincronize produtos e pedidos do marketplace Magalu.", state: "available", auth: "apiKey" },
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

/* ----------------------------------------------------------------
 * Integration settings — inline panel for the selected integration.
 * ---------------------------------------------------------------- */

function IntegrationSettings({
  integration,
  displayName,
  permModes,
  onPermissionChange,
  onDisconnect,
  onReconnect,
  onClose,
}: {
  integration: Integration;
  displayName?: string;
  permModes: Record<string, PermissionMode>;
  onPermissionChange: (toolId: string, next: PermissionMode) => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
  onClose?: () => void;
}) {
  const [enabled, setEnabled] = useState(true);
  const isOAuth = integration.auth === "oauth";
  const isWebhook = integration.auth === "webhook";
  const isApiKey = integration.auth === "apiKey";
  const authMeta = isOAuth
    ? { label: "OAuth 2.0", hint: "Renovação automática" }
    : isWebhook
      ? { label: "Webhook", hint: "Eventos em tempo real" }
      : { label: "Chave de API", hint: "Renovação manual" };
  const lastSync =
    integration.state === "attention"
      ? "Token expira em 3 dias — renove para continuar"
      : "Sincronizado há 2 min";

  return (
    <div className="flex h-full flex-col">
      {/* Hero strip */}
      <header className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-7 py-6">
        <div className="flex items-center gap-3.5">
          <AwBrandLogo brand={integration.id} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="m-0 text-[18px] font-semibold tracking-[-0.005em] text-[var(--fg-primary)]">
                {displayName ?? integration.name}
              </h2>
              {integration.state === "attention" ? (
                <AwPill variant="beta">Atenção</AwPill>
              ) : (
                <AwPill variant="live">Ativa</AwPill>
              )}
            </div>
            <p className="m-0 mt-0.5 text-[12.5px] text-[var(--fg-tertiary)]">
              {integration.domain} · {lastSync}
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <AwButton variant="secondary" size="sm" iconLeft="refresh" onClick={onReconnect}>
            Reconectar
          </AwButton>
          <AwButton variant="secondary" size="sm" iconLeft="link_off" onClick={onDisconnect}>
            Desconectar
          </AwButton>
          <AwButton
            variant="ghost"
            size="sm"
            iconOnly="close"
            aria-label="Fechar configurações"
            onClick={onClose}
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-7 py-6">
        <p className="m-0 mb-6 max-w-[640px] text-[13.5px] leading-[1.55] text-[var(--fg-secondary)]">
          {integration.desc}
        </p>

        {/* Connection summary cards */}
        <div className="mb-7 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3.5">
            <div className="text-[11px] uppercase tracking-[0.04em] text-[var(--fg-tertiary)]">
              Conexões
            </div>
            <div className="mt-1 text-[18px] font-semibold text-[var(--fg-primary)]">
              {integration.instances ?? 1}
            </div>
            <div className="mt-0.5 text-[11.5px] text-[var(--fg-tertiary)]">
              {(integration.instances ?? 1) === 1
                ? "Uma conta conectada"
                : "Contas conectadas"}
            </div>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3.5">
            <div className="text-[11px] uppercase tracking-[0.04em] text-[var(--fg-tertiary)]">
              Eventos (24h)
            </div>
            <div className="mt-1 text-[18px] font-semibold text-[var(--fg-primary)]">
              1.284
            </div>
            <div className="mt-0.5 text-[11.5px] text-[var(--fg-tertiary)]">
              98% sincronizados
            </div>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3.5">
            <div className="text-[11px] uppercase tracking-[0.04em] text-[var(--fg-tertiary)]">
              Autenticação
            </div>
            <div className="mt-1 text-[14px] font-semibold text-[var(--fg-primary)]">
              {authMeta.label}
            </div>
            <div className="mt-0.5 text-[11.5px] text-[var(--fg-tertiary)]">
              {authMeta.hint}
            </div>
          </div>
        </div>

        {/* Active toggle */}
        <div className="mb-7 flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3.5">
          <div>
            <div className="text-[13.5px] font-medium text-[var(--fg-primary)]">
              Integração ativa
            </div>
            <div className="mt-0.5 text-[12px] text-[var(--fg-tertiary)]">
              Quando desativada, agentes ignoram esta integração e nenhum
              evento é processado.
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label="Integração ativa"
            onClick={() => setEnabled((v) => !v)}
            className={
              "relative h-[22px] w-[38px] flex-shrink-0 rounded-full transition-colors " +
              (enabled
                ? "bg-[var(--fg-primary)]"
                : "bg-[var(--border-strong)]")
            }
          >
            <span
              className={
                "absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white transition-all " +
                (enabled ? "left-[18px]" : "left-[2px]")
              }
            />
          </button>
        </div>

        {/* API key credentials */}
        {isApiKey && (
          <section className="mb-7">
            <h3 className="m-0 mb-1 text-[13.5px] font-semibold text-[var(--fg-primary)]">
              Credenciais
            </h3>
            <p className="m-0 mb-3.5 text-[12px] leading-[1.45] text-[var(--fg-tertiary)]">
              Atualize a chave usada por seus agentes para falar com{" "}
              {integration.name}.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <AwField label="API Key" htmlFor={`live-key-${integration.id}`}>
                <AwInput
                  id={`live-key-${integration.id}`}
                  defaultValue="sk_live_5ZkP9aW8rQv2XnT3eM1bC7yH"
                  iconLeft="key"
                />
              </AwField>
              <AwField
                label="Webhook secret"
                htmlFor={`live-secret-${integration.id}`}
              >
                <AwInput
                  id={`live-secret-${integration.id}`}
                  defaultValue="whsec_a8f72c4b9d6e1f0a3b5c"
                  iconLeft="lock"
                />
              </AwField>
            </div>
          </section>
        )}

        {/* Webhook URL — for webhook-based integrations */}
        {isWebhook && (
          <section className="mb-7">
            <h3 className="m-0 mb-1 text-[13.5px] font-semibold text-[var(--fg-primary)]">
              Webhook
            </h3>
            <p className="m-0 mb-3.5 text-[12px] leading-[1.45] text-[var(--fg-tertiary)]">
              Endpoint que o {integration.name} usa para enviar eventos.
              Reconfigure no painel do parceiro se rotacionar a URL.
            </p>
            <AwField
              label="Webhook URL"
              htmlFor={`live-webhook-${integration.id}`}
            >
              <AwInput
                id={`live-webhook-${integration.id}`}
                readOnly
                defaultValue={HUBLA_WEBHOOK_TEMPLATE(
                  `${integration.id}-d12fa78b3e4c4a1f`,
                )}
                iconLeft="bolt"
              />
            </AwField>
          </section>
        )}

        {/* OAuth scopes for OAuth integrations */}
        {isOAuth && integration.permissions && integration.permissions.length > 0 && (
          <section className="mb-7">
            <h3 className="m-0 mb-1 text-[13.5px] font-semibold text-[var(--fg-primary)]">
              Permissões concedidas
            </h3>
            <p className="m-0 mb-3 text-[12px] leading-[1.45] text-[var(--fg-tertiary)]">
              Escopos autorizados quando você conectou {integration.name}.
            </p>
            <ul className="m-0 list-none rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-0">
              {integration.permissions.map((p, i) => (
                <li
                  key={p}
                  className={
                    "flex items-center gap-2.5 px-3.5 py-2.5 text-[12.5px] text-[var(--fg-secondary)]" +
                    (i > 0
                      ? " border-t border-[var(--border-subtle)]"
                      : "")
                  }
                >
                  <Icon
                    name="check_circle"
                    size={16}
                    className="text-[var(--aw-emerald-700)]"
                    fill={1}
                  />
                  {p}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Per-tool permissions */}
        <section className="mb-7">
          <h3 className="m-0 mb-1 text-[13.5px] font-semibold text-[var(--fg-primary)]">
            Permissões por ferramenta
          </h3>
          <p className="m-0 mb-3.5 text-[12px] leading-[1.45] text-[var(--fg-tertiary)]">
            Decida quando seus agentes podem usar cada ação.
          </p>

          {integration.tools?.readOnly && integration.tools.readOnly.length > 0 && (
            <PermissionGroup
              title="Ferramentas de leitura"
              hint="Ler dados não muda nada do lado da plataforma — o padrão é permitir."
              tools={integration.tools.readOnly}
              modes={permModes}
              onChange={onPermissionChange}
              defaultOpen
            />
          )}
          {integration.tools?.writeDelete &&
            integration.tools.writeDelete.length > 0 && (
              <PermissionGroup
                title="Ferramentas de escrita / exclusão"
                hint="Ações que alteram dados externos. Padrão é pedir aprovação antes."
                tools={integration.tools.writeDelete}
                modes={permModes}
                onChange={onPermissionChange}
                defaultOpen
              />
            )}

          {!integration.tools && (
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
        </section>

        {/* Recent activity */}
        <section>
          <h3 className="m-0 mb-1 text-[13.5px] font-semibold text-[var(--fg-primary)]">
            Atividade recente
          </h3>
          <p className="m-0 mb-3 text-[12px] leading-[1.45] text-[var(--fg-tertiary)]">
            Últimos eventos recebidos desta integração.
          </p>
          <ul className="m-0 list-none rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-0">
            {[
              { icon: "download", label: "Webhook recebido", meta: "há 2 min" },
              { icon: "sync", label: "Sincronização completa", meta: "há 14 min" },
              { icon: "key", label: "Token renovado", meta: "há 3 h" },
              { icon: "check", label: "Conexão validada", meta: "ontem, 18:42" },
            ].map((row, i) => (
              <li
                key={row.label + i}
                className={
                  "flex items-center gap-3 px-3.5 py-2.5 text-[12.5px]" +
                  (i > 0 ? " border-t border-[var(--border-subtle)]" : "")
                }
              >
                <Icon
                  name={row.icon}
                  size={16}
                  className="text-[var(--fg-tertiary)]"
                />
                <span className="flex-1 text-[var(--fg-secondary)]">
                  {row.label}
                </span>
                <span className="text-[11.5px] text-[var(--fg-tertiary)]">
                  {row.meta}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Footer actions */}
      <footer className="flex items-center justify-end gap-2 border-t border-[var(--border-subtle)] px-7 py-4">
        <AwButton variant="secondary" size="md" onClick={onClose}>
          Cancelar
        </AwButton>
        <AwButton variant="primary" size="md" onClick={onClose}>
          Salvar alterações
        </AwButton>
      </footer>
    </div>
  );
}

/* ----------------------------------------------------------------
 * Active integration list row — horizontal selectable item.
 * ---------------------------------------------------------------- */

function ActiveRow({
  brand,
  name,
  description,
  state,
  selected,
  onClick,
}: {
  brand: string;
  name: string;
  description: string;
  state: AwIntegrationCardState;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={
        "group flex w-full items-center gap-3 rounded-[var(--radius-md)] px-2 py-2.5 text-left transition-colors " +
        (selected
          ? "bg-[var(--bg-surface)]"
          : "hover:bg-[var(--bg-surface)]")
      }
    >
      <AwBrandLogo brand={brand} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[14px] font-semibold text-[var(--fg-primary)]">
            {name}
          </span>
          {state === "attention" && (
            <Icon
              name="error"
              size={14}
              className="text-[var(--aw-amber-700)]"
            />
          )}
        </div>
        <div className="truncate text-[12.5px] text-[var(--fg-tertiary)]">
          {description}
        </div>
      </div>
      <Icon
        name="chevron_right"
        size={18}
        className="text-[var(--fg-tertiary)]"
      />
    </button>
  );
}

/* ================================================================
 * Page
 * ================================================================ */

export default function IntegrationsPage() {
  /** add-instance modal — opened from the catalog modal */
  const [connectId, setConnectId] = useState<string | null>(null);
  /** add-integration catalog modal — opened from the page header CTA */
  const [addOpen, setAddOpen] = useState(false);
  /** custom-integration placeholder modal */
  const [customOpen, setCustomOpen] = useState(false);
  /** disconnect confirmation modal */
  const [disconnectPending, setDisconnectPending] = useState(false);
  const [permModes, setPermModes] = useState<Record<string, PermissionMode>>({});

  /** Connected accounts shown in the left list — one row per instance. */
  const [instances, setInstances] = useState<IntegrationInstance[]>(() =>
    ITEMS.filter((i) => isActive(i.state)).map((i) => ({
      instanceId: `${i.id}-default`,
      integrationId: i.id,
      name: i.name,
    })),
  );
  /** selected instance in the inline settings panel — null = panel hidden */
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const selectedInstance =
    instances.find((i) => i.instanceId === selectedInstanceId) ?? null;
  const selected = selectedInstance
    ? ITEMS.find((i) => i.id === selectedInstance.integrationId) ?? null
    : null;

  const connectTarget = connectId
    ? ITEMS.find((i) => i.id === connectId) ?? null
    : null;


  const breadcrumbs = [
    { label: "Integrações", icon: <Icon name="extension" size={20} /> },
    { label: "Ativas" },
  ];

  const setMode = (toolId: string, next: PermissionMode) =>
    setPermModes((m) => ({ ...m, [toolId]: next }));

  const closeConnect = () => setConnectId(null);
  const closeSettings = () => setSelectedInstanceId(null);

  const isPanelOpen = !!selected;
  const anyModalOpen =
    !!connectId || addOpen || customOpen || disconnectPending;

  useEffect(() => {
    if (!isPanelOpen || anyModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedInstanceId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isPanelOpen, anyModalOpen]);

  /** Settings content stays at opacity 0 until the list-slide finishes. */
  const [contentReady, setContentReady] = useState(false);
  useEffect(() => {
    if (!isPanelOpen) {
      setContentReady(false);
      return;
    }
    const t = setTimeout(() => setContentReady(true), 420);
    return () => clearTimeout(t);
  }, [isPanelOpen]);

  const handleDisconnectConfirm = () => {
    if (!selectedInstanceId) return;
    setInstances((list) => {
      const next = list.filter((i) => i.instanceId !== selectedInstanceId);
      setSelectedInstanceId(next[0]?.instanceId ?? null);
      return next;
    });
    setDisconnectPending(false);
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="-m-8 min-h-full bg-[var(--bg-canvas)]">
        <div className="w-full px-10 pt-12 pb-24">
          {/* Header */}
          <header className="mb-7 flex items-end justify-between gap-6 border-b border-[var(--border-subtle)] pb-6">
            <div>
              <h1 className="m-0 mb-1.5 flex items-center gap-2.5 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--fg-primary)]">
                <Icon name="event_list" size={28} />
                Integrações
              </h1>
              <p className="m-0 max-w-[560px] text-sm leading-[1.5] text-[var(--fg-secondary)]">
                Conecte canais, plataformas e ferramentas para que seus agentes coletem contexto, executem ações e mantenham seus sistemas sincronizados.
              </p>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <AwButton
                variant="primary"
                size="md"
                iconLeft="add"
                onClick={() => setAddOpen(true)}
              >
                Nova integração
              </AwButton>
            </div>
          </header>

          {/* List + sliding settings panel */}
          <div className="flex w-full justify-center gap-6">
            {/* Active list — centered when collapsed, slides left when panel opens */}
            <aside
              className={
                "transition-all duration-300 ease-out " +
                (isPanelOpen
                  ? "w-[520px] flex-shrink-0"
                  : "w-full max-w-[640px]")
              }
            >
              <h2 className="m-0 mb-3 text-[15px] font-semibold tracking-[-0.005em] text-[var(--fg-primary)]">
                Integrações ativas
              </h2>
              {instances.length === 0 ? (
                <AwEmpty>
                  <AwEmptyHeader>
                    <AwEmptyMedia variant="icon">
                      <Icon name="extension_off" size={20} />
                    </AwEmptyMedia>
                    <AwEmptyTitle>Nenhuma integração ativa</AwEmptyTitle>
                    <AwEmptyDescription>
                      Conecte uma plataforma para começar.
                    </AwEmptyDescription>
                  </AwEmptyHeader>
                </AwEmpty>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
                  {instances.map((inst) => {
                    const it = ITEMS.find((i) => i.id === inst.integrationId);
                    if (!it) return null;
                    return (
                      <li key={inst.instanceId}>
                        <ActiveRow
                          brand={it.id}
                          name={inst.name}
                          description={it.desc}
                          state={it.state}
                          selected={selectedInstanceId === inst.instanceId}
                          onClick={() => setSelectedInstanceId(inst.instanceId)}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </aside>

            {/* Settings panel — outer animates width, inner fades content in/out */}
            <section
              aria-label="Configurações da integração"
              aria-hidden={!isPanelOpen}
              className={
                "overflow-hidden rounded-[var(--radius-xl)] bg-[var(--bg-canvas)] transition-[flex,width,border-color,border-width,min-height] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] " +
                (isPanelOpen
                  ? "min-h-[640px] flex-1 border border-[var(--border-subtle)]"
                  : "w-0 flex-[0_0_0px] border-0")
              }
            >
              {selected && (
                <div
                  className={
                    "h-full transition-opacity duration-[280ms] ease-out " +
                    (contentReady ? "opacity-100" : "opacity-0")
                  }
                >
                  {selected.id === "whatsapp" ? (
                    <AwWhatsAppPanel
                      onAddWaba={() => setConnectId("whatsapp")}
                    />
                  ) : (
                    <IntegrationSettings
                      integration={selected}
                      displayName={selectedInstance?.name}
                      permModes={permModes}
                      onPermissionChange={setMode}
                      onDisconnect={() => setDisconnectPending(true)}
                      onReconnect={() => setConnectId(selected.id)}
                      onClose={closeSettings}
                    />
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Disconnect confirmation modal */}
      <AwModal
        open={disconnectPending}
        onClose={() => setDisconnectPending(false)}
        title="Desconectar integração"
        footer={
          <div className="flex justify-end gap-2">
            <AwButton variant="secondary" size="md" onClick={() => setDisconnectPending(false)}>
              Cancelar
            </AwButton>
            <AwButton variant="danger" size="md" iconLeft="link_off" onClick={handleDisconnectConfirm}>
              Desconectar
            </AwButton>
          </div>
        }
      >
        <p className="m-0 text-[13.5px] leading-[1.6] text-[var(--fg-secondary)]">
          Tem certeza que deseja desconectar{" "}
          <strong className="text-[var(--fg-primary)]">
            {selectedInstance?.name ?? selected?.name}
          </strong>
          ? Os agentes perderão acesso a esta integração imediatamente.
        </p>
      </AwModal>

      {/* Catalog modal — pick an integration to add */}
      <AwAddIntegrationModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        alpha
        categories={ADD_MODAL_CATS}
        items={ITEMS.map((it) => ({
          id: it.id,
          brand: it.id,
          name: it.name,
          description: it.desc,
          category: it.cat,
          connected: isActive(it.state),
        }))}
        onSelect={(id) => {
          setAddOpen(false);
          setConnectId(id);
        }}
        onCustomIntegration={() => {
          setAddOpen(false);
          setCustomOpen(true);
        }}
      />

      {/* Custom integration placeholder — final fields TBD */}
      <AwConnectModal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        kind="apiKey"
        productLogoSrc={ORG_LOGO_SRC}
        productName={ORG_NAME}
        targetBrand="custom"
        targetName="Integração personalizada"
        description="Conecte qualquer API. Os campos finais serão definidos para essa integração."
        defaultConnectionName="Minha integração"
        apiKeyIntro={
          <>
            Preencha os campos abaixo para configurar uma conexão
            personalizada. <em>Os campos definitivos serão ajustados
            depois.</em>
          </>
        }
        apiKeyFields={[
          {
            id: "custom-base-url",
            label: "URL base da API",
            placeholder: "https://api.exemplo.com",
            iconLeft: "link",
            required: true,
          },
          {
            id: "custom-auth-method",
            label: "Método de autenticação",
            placeholder: "Bearer / API key / Basic",
            iconLeft: "lock",
            required: true,
          },
          {
            id: "custom-credential",
            label: "Credencial",
            placeholder: "Cole sua credencial aqui",
            iconLeft: "key",
            required: true,
          },
          {
            id: "custom-notes",
            label: "Observações",
            placeholder: "Cabeçalhos extras, escopos, etc.",
            iconLeft: "notes",
          },
        ]}
        onAllow={() => setCustomOpen(false)}
      />

      {/* Connect dialog — kind derived from the integration auth method */}
      <AwConnectModal
        open={!!connectTarget}
        onClose={closeConnect}
        kind={connectTarget?.auth ?? "oauth"}
        productLogoSrc={ORG_LOGO_SRC}
        productName={ORG_NAME}
        targetBrand={connectTarget?.id ?? ""}
        targetName={
          connectTarget
            ? isActive(connectTarget.state)
              ? `${connectTarget.name} (nova conexão)`
              : connectTarget.name
            : ""
        }
        description={connectTarget?.desc}
        /* OAuth */
        permissionsTitle={
          connectTarget?.auth === "oauth" ? `O AwSales precisa` : undefined
        }
        permissions={
          connectTarget?.auth === "oauth"
            ? connectTarget?.permissions ?? []
            : undefined
        }
        redirectUrl={
          connectTarget?.auth === "oauth"
            ? `https://app.awsales.io/integrations/${connectTarget.id}/callback`
            : undefined
        }
        /* Webhook */
        steps={
          connectTarget?.auth === "webhook"
            ? buildWebhookSteps(connectTarget)
            : undefined
        }
        /* API key */
        apiKeyIntro={
          connectTarget?.auth === "apiKey" ? (
            <>
              Adicione abaixo as credenciais da sua conta{" "}
              {connectTarget.name}. Para ver o passo a passo de como
              encontrar as informações,{" "}
              <a
                href={`https://${connectTarget.domain}`}
                target="_blank"
                rel="noreferrer"
              >
                clique aqui
              </a>
              .
            </>
          ) : undefined
        }
        apiKeyFields={
          connectTarget?.auth === "apiKey"
            ? [
                {
                  id: `client-id-${connectTarget.id}`,
                  label: "Insira o clientId",
                  placeholder: "Insira aqui seu ClientId",
                  required: true,
                },
                {
                  id: `client-secret-${connectTarget.id}`,
                  label: "Insira o Client Secret",
                  placeholder: "Insira aqui seu Client Secret",
                  required: true,
                },
                {
                  id: `basic-token-${connectTarget.id}`,
                  label: "Insira o basic token",
                  placeholder: "Insira aqui seu basic token",
                  required: true,
                },
              ]
            : undefined
        }
        onAllow={(name) => {
          if (connectTarget) {
            const instanceId = `${connectTarget.id}-${Date.now()}`;
            const finalName =
              name?.trim() ||
              `${connectTarget.name} ${instances.filter((i) => i.integrationId === connectTarget.id).length + 1}`;
            setInstances((list) => [
              ...list,
              {
                instanceId,
                integrationId: connectTarget.id,
                name: finalName,
              },
            ]);
            setSelectedInstanceId(instanceId);
          }
          closeConnect();
        }}
      />
    </DashboardLayout>
  );
}
