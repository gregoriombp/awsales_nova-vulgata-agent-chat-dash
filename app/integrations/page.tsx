"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import { AwAddIntegrationModal } from "@/components/ui/AwAddIntegrationModal";
import {
  AwConnectModal,
  type AwWebhookStep,
} from "@/components/ui/AwConnectModal";
import {
  AwIntegrationCard,
  type AwIntegrationCardState,
} from "@/components/ui/AwIntegrationCard";
import { Icon } from "@/components/ui/Icon";
import {
  loadHasEverConnected,
  loadInstances,
  saveHasEverConnected,
  saveInstances,
  type IntegrationInstance,
} from "@/lib/integrationsStore";

/* ----------------------------------------------------------------
 * Constants — minimal subset preserved from the previous page so the
 * Add catalog and Connect modals keep working in the empty state.
 * The full list/settings UI was removed for this v2 zero-state.
 * ---------------------------------------------------------------- */

const WEBHOOK_TEMPLATE = (id: string) =>
  `https://app.awsales.io/api/webhooks/checkouts/${id}`;

const ORG_LOGO_SRC = "/assets/icon_artificial_concord_organization.png";
const ORG_NAME = "Nome da organização";

type IntegrationCategory =
  | "channels"
  | "checkouts"
  | "members"
  | "forms"
  | "meetings"
  | "crms"
  | "marketplaces"
  | "ai"
  | "signatures";

type AuthMethod = "oauth" | "webhook" | "apiKey";

interface Integration {
  id: string;
  cat: IntegrationCategory;
  name: string;
  domain: string;
  desc: string;
  auth: AuthMethod;
  permissions?: string[];
}

const ADD_MODAL_CATS: { id: IntegrationCategory; label: string }[] = [
  { id: "channels", label: "Canais" },
  { id: "ai", label: "Modelos de IA" },
  { id: "checkouts", label: "Checkouts" },
  { id: "members", label: "Área de membros" },
  { id: "forms", label: "Formulários" },
  { id: "meetings", label: "Reuniões" },
  { id: "crms", label: "CRMs" },
  { id: "marketplaces", label: "Marketplaces" },
  { id: "signatures", label: "Assinaturas" },
];

const ITEMS: Integration[] = [
  // Channels
  {
    id: "whatsapp",
    cat: "channels",
    name: "WhatsApp",
    domain: "whatsapp.com",
    desc: "Atenda e recupere vendas via WhatsApp com seus agentes de IA.",
    auth: "oauth",
    permissions: [
      "Enviar e receber mensagens em seu nome",
      "Acessar contatos e conversas ativas",
      "Ler mídias enviadas pelos clientes",
    ],
  },
  {
    id: "instagram",
    cat: "channels",
    name: "Instagram",
    domain: "instagram.com",
    desc: "Responda DMs do Instagram automaticamente com agentes.",
    auth: "oauth",
    permissions: [
      "Ler e responder mensagens diretas",
      "Acessar comentários em posts e reels",
      "Ver informações básicas da conta",
    ],
  },
  {
    id: "messenger",
    cat: "channels",
    name: "Messenger",
    domain: "messenger.com",
    desc: "Atendimento automatizado pelo Messenger do Facebook.",
    auth: "oauth",
    permissions: [
      "Ler e responder mensagens da página",
      "Acessar perfis públicos dos clientes",
      "Receber webhooks de novas conversas",
    ],
  },
  // Checkouts
  { id: "hotmart", cat: "checkouts", name: "Hotmart", domain: "hotmart.com", desc: "Capture transações e eventos do checkout Hotmart.", auth: "apiKey" },
  { id: "stripe", cat: "checkouts", name: "Stripe", domain: "stripe.com", desc: "Pagamentos globais — cartão, PIX, assinaturas.", auth: "apiKey" },
  { id: "kiwify", cat: "checkouts", name: "Kiwify", domain: "kiwify.com.br", desc: "Sincronize vendas e abandonos do checkout Kiwify.", auth: "webhook" },
  { id: "eduzz", cat: "checkouts", name: "Eduzz", domain: "eduzz.com", desc: "Capture transações do checkout Eduzz.", auth: "webhook" },
  { id: "hubla", cat: "checkouts", name: "Hubla", domain: "hub.la", desc: "Sincronize vendas e clientes da Hubla.", auth: "webhook" },
  { id: "ticto", cat: "checkouts", name: "Ticto", domain: "ticto.com.br", desc: "Receba eventos de venda do checkout Ticto.", auth: "webhook" },
  { id: "lastlink", cat: "checkouts", name: "LastLink", domain: "lastlink.com", desc: "Capture transações e renovações da LastLink.", auth: "webhook" },
  { id: "braip", cat: "checkouts", name: "Braip", domain: "braip.com", desc: "Sincronize vendas e indicações do checkout Braip.", auth: "webhook" },
  { id: "zouti", cat: "checkouts", name: "Zouti", domain: "zouti.com.br", desc: "Capture transações e abandonos do checkout Zouti.", auth: "webhook" },
  { id: "blitzpay", cat: "checkouts", name: "BlitzPay", domain: "blitzpay.com.br", desc: "Receba eventos do checkout BlitzPay em tempo real.", auth: "webhook" },
  { id: "onprofit", cat: "checkouts", name: "OnProfit", domain: "onprofit.com.br", desc: "Sincronize vendas e assinaturas do OnProfit.", auth: "webhook" },
  { id: "greenn", cat: "checkouts", name: "Greenn", domain: "greenn.com.br", desc: "Conecte vendas e clientes do checkout Greenn.", auth: "webhook" },
  { id: "payt", cat: "checkouts", name: "Payt", domain: "payt.com.br", desc: "Receba eventos de venda do checkout Payt.", auth: "webhook" },
  { id: "pagtrust", cat: "checkouts", name: "PagTrust", domain: "pagtrust.com.br", desc: "Sincronize transações do checkout PagTrust.", auth: "webhook" },
  { id: "tmb", cat: "checkouts", name: "TMB", domain: "tmb.education", desc: "Capture eventos de venda do checkout TMB.", auth: "webhook" },
  { id: "dmg", cat: "checkouts", name: "Digital Manager Guru", domain: "digitalmanager.guru", desc: "Sincronize vendas e assinaturas do DMG.", auth: "webhook" },
  // Members
  { id: "memberkit", cat: "members", name: "MemberKit", domain: "memberkit.com.br", desc: "Sincronize alunos e progresso da área de membros.", auth: "apiKey" },
  { id: "cademi", cat: "members", name: "Cademi", domain: "cademi.com.br", desc: "Conecte sua área de membros Cademi para automações.", auth: "apiKey" },
  // Forms
  {
    id: "googleforms",
    cat: "forms",
    name: "Google Forms",
    domain: "forms.google.com",
    desc: "Receba submissões do Google Forms em tempo real.",
    auth: "oauth",
    permissions: [
      "Acessar a lista de formulários da conta",
      "Receber respostas em tempo real",
      "Ler metadados das perguntas",
    ],
  },
  {
    id: "typeform",
    cat: "forms",
    name: "Typeform",
    domain: "typeform.com",
    desc: "Capture leads dos seus formulários conversacionais.",
    auth: "oauth",
    permissions: [
      "Acessar formulários da workspace",
      "Receber novas respostas via webhook",
      "Ler informações do respondente",
    ],
  },
  { id: "tally", cat: "forms", name: "Tally", domain: "tally.so", desc: "Formulários simples — dispare ações com cada submissão.", auth: "apiKey" },
  // Meetings
  {
    id: "calendly",
    cat: "meetings",
    name: "Calendly",
    domain: "calendly.com",
    desc: "Agendamentos automáticos sincronizados com agentes.",
    auth: "oauth",
    permissions: [
      "Acessar tipos de evento e disponibilidade",
      "Criar e cancelar agendamentos",
      "Receber notificações de novos eventos",
    ],
  },
  {
    id: "googlecal",
    cat: "meetings",
    name: "Google Calendar",
    domain: "calendar.google.com",
    desc: "Reuniões e disponibilidade direto do Google Agenda.",
    auth: "oauth",
    permissions: [
      "Ler eventos e disponibilidade da agenda",
      "Criar e atualizar eventos em seu nome",
      "Acessar agendas compartilhadas",
    ],
  },
  // CRMs
  {
    id: "pipedrive",
    cat: "crms",
    name: "Pipedrive",
    domain: "pipedrive.com",
    desc: "Sincronize contatos, deals e atividades do Pipedrive.",
    auth: "oauth",
    permissions: [
      "Acessar contatos, organizações e deals",
      "Criar e atualizar atividades",
      "Mover deals entre etapas do pipeline",
    ],
  },
  {
    id: "kommo",
    cat: "crms",
    name: "Kommo",
    domain: "kommo.com",
    desc: "Conecte funis, leads e tarefas do Kommo CRM.",
    auth: "oauth",
    permissions: [
      "Acessar leads, contatos e empresas",
      "Criar e atualizar tarefas",
      "Mover leads entre etapas do funil",
    ],
  },
  {
    id: "rdstation",
    cat: "crms",
    name: "RD Station",
    domain: "rdstation.com",
    desc: "Sincronize leads, oportunidades e tags do RD Station.",
    auth: "oauth",
    permissions: [
      "Acessar leads e oportunidades",
      "Criar e atualizar tags",
      "Disparar eventos de conversão",
    ],
  },
  {
    id: "hubspot",
    cat: "crms",
    name: "HubSpot",
    domain: "hubspot.com",
    desc: "Conecte contatos, empresas e pipelines do HubSpot.",
    auth: "oauth",
    permissions: [
      "Acessar contatos e empresas",
      "Criar e atualizar deals do pipeline",
      "Disparar workflows quando uma oportunidade fechar",
    ],
  },
  // AI Providers
  { id: "claude", cat: "ai", name: "Claude", domain: "anthropic.com", desc: "Conecte sua chave da Anthropic e use Claude como cérebro dos agentes.", auth: "apiKey" },
  { id: "chatgpt", cat: "ai", name: "ChatGPT", domain: "openai.com", desc: "Use os modelos GPT da OpenAI nas execuções dos seus agentes.", auth: "apiKey" },
  { id: "deepseek", cat: "ai", name: "DeepSeek", domain: "deepseek.com", desc: "Conecte sua chave DeepSeek e habilite os modelos R1 e V3.", auth: "apiKey" },
  // Signatures
  { id: "assiny", cat: "signatures", name: "Assiny", domain: "assiny.com.br", desc: "Envie e acompanhe contratos com assinatura eletrônica.", auth: "apiKey" },
  // Marketplaces
  {
    id: "shopify",
    cat: "marketplaces",
    name: "Shopify",
    domain: "shopify.com",
    desc: "Gerencie produtos, pedidos e clientes pela IA.",
    auth: "oauth",
    permissions: [
      "Acessar catálogo de produtos e estoque",
      "Ler pedidos e clientes",
      "Criar rascunhos de pedido e cupons",
    ],
  },
  { id: "magalu", cat: "marketplaces", name: "Magalu", domain: "magalu.com", desc: "Sincronize produtos e pedidos do marketplace Magalu.", auth: "apiKey" },
];

function buildWebhookSteps(integration: Integration): AwWebhookStep[] {
  const url = WEBHOOK_TEMPLATE(`${integration.id}-d12fa78b3e4c4a1f`);
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

/* ----------------------------------------------------------------
 * Visual building blocks for the empty state.
 * ---------------------------------------------------------------- */

const HERO_BRANDS_TOP = ["hotmart", "eduzz", "kiwify"] as const;
const HERO_BRANDS_BOTTOM = [
  "whatsapp",
  "rdstation",
  "instagram",
  "calendly",
] as const;

const QUICK_PICKS: { id: string; name: string }[] = [
  { id: "whatsapp", name: "WhatsApp" },
  { id: "hotmart", name: "Hotmart" },
  { id: "stripe", name: "Stripe" },
  { id: "calendly", name: "Calendly" },
  { id: "rdstation", name: "RD Station" },
];

/* ----------------------------------------------------------------
 * Card with quick actions — wraps AwIntegrationCard with three
 * top-right ghost icon buttons: toggle (active/paused), configure,
 * disconnect. Buttons are only rendered when an instance exists;
 * "available" channels stay clickable as a single connect target.
 * ---------------------------------------------------------------- */

function CardWithActions({
  brand,
  name,
  domain,
  description,
  state,
  onCardClick,
  hasInstance,
  active,
  onToggle,
  onConfigure,
  onDisconnect,
}: {
  brand: string;
  name: string;
  domain: string;
  description: string;
  state: AwIntegrationCardState;
  /** Card body click — used for "available" channels to open Connect. */
  onCardClick?: () => void;
  hasInstance: boolean;
  active?: boolean;
  onToggle?: () => void;
  onConfigure?: () => void;
  onDisconnect?: () => void;
}) {
  return (
    <div className="relative">
      <AwIntegrationCard
        brand={brand}
        name={name}
        domain={domain}
        description={description}
        state={state}
        onClick={hasInstance ? undefined : onCardClick}
      />
      {hasInstance && (
        <CardActionMenu
          active={active}
          onToggle={onToggle}
          onConfigure={onConfigure}
          onDisconnect={onDisconnect}
        />
      )}
    </div>
  );
}

function CardActionMenu({
  active,
  onToggle,
  onConfigure,
  onDisconnect,
}: {
  active?: boolean;
  onToggle?: () => void;
  onConfigure?: () => void;
  onDisconnect?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", handlePointer);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handlePointer);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const select = (cb?: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    cb?.();
  };

  return (
    <div
      ref={ref}
      className="absolute right-2 top-2"
      onClick={(e) => e.stopPropagation()}
    >
      <AwButton
        variant="ghost"
        size="sm"
        iconOnly="more_vert"
        aria-label="Ações da integração"
        aria-haspopup="menu"
        aria-expanded={open}
        title="Ações"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      />
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-1 shadow-lg"
        >
          <MenuItem
            icon={active ? "pause" : "play_arrow"}
            label={active ? "Pausar integração" : "Ativar integração"}
            onClick={select(onToggle)}
          />
          <MenuItem
            icon="tune"
            label="Configurar"
            onClick={select(onConfigure)}
          />
          <MenuItem
            icon="link_off"
            label="Desconectar"
            danger
            onClick={select(onDisconnect)}
          />
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  danger,
  onClick,
}: {
  icon: string;
  label: string;
  danger?: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={
        "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-[var(--bg-canvas)] " +
        (danger
          ? "text-[var(--fg-danger,#b42318)]"
          : "text-[var(--fg-primary)]")
      }
    >
      <Icon name={icon} size={16} />
      <span>{label}</span>
    </button>
  );
}

function QuickPickPill({
  brand,
  name,
  onClick,
}: {
  brand: string;
  name: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-1.5 pl-2 pr-5 text-[13px] font-medium text-[var(--fg-primary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-canvas)]"
    >
      <AwBrandLogo brand={brand} size="sm" bare />
      <span>{name}</span>
    </button>
  );
}

/* ================================================================
 * Page
 * ================================================================ */

type EmptyVariant = "populated" | "all-removed" | "first-run";

export default function IntegrationsPage() {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [connectId, setConnectId] = useState<string | null>(null);
  const [instances, setInstances] = useState<IntegrationInstance[]>([]);
  /** True for any user who has ever connected at least one integration.
   *  Drives which empty state to render when the instance list is
   *  empty: returning user vs. brand-new user. */
  const [hasEverConnected, setHasEverConnected] = useState(false);
  /** Hold rendering until localStorage has been read on the client, so
   *  we never flash the first-run hero to a returning user during the
   *  first paint. */
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setInstances(loadInstances());
    setHasEverConnected(loadHasEverConnected());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveInstances(instances);
  }, [hydrated, instances]);

  useEffect(() => {
    if (!hydrated) return;
    saveHasEverConnected(hasEverConnected);
  }, [hydrated, hasEverConnected]);

  const connectTarget = connectId
    ? ITEMS.find((i) => i.id === connectId) ?? null
    : null;

  const breadcrumbs = [
    { label: "Integrações", icon: <Icon name="extension" size={20} /> },
  ];

  const closeConnect = () => setConnectId(null);

  /** WhatsApp owns a multi-step WABA wizard instead of the generic
   *  Connect modal. Every entry point (quick picks, catalog, anywhere
   *  the user picks WhatsApp) must funnel through here. */
  const handleConnect = (id: string) => {
    if (id === "whatsapp") {
      router.push("/setup/whatsapp/1");
      return;
    }
    setConnectId(id);
  };

  const variant: EmptyVariant =
    instances.length > 0
      ? "populated"
      : hasEverConnected
        ? "all-removed"
        : "first-run";

  const stateFor = (instance: IntegrationInstance): AwIntegrationCardState =>
    instance.active ? "connected" : "disabled";

  const handleToggleInstance = (instanceId: string) => {
    setInstances((list) =>
      list.map((i) =>
        i.instanceId === instanceId ? { ...i, active: !i.active } : i,
      ),
    );
  };

  const handleDisconnectInstance = (instanceId: string) => {
    setInstances((list) => list.filter((i) => i.instanceId !== instanceId));
  };

  const handleConfigureInstance = (instanceId: string) => {
    const inst = instances.find((i) => i.instanceId === instanceId);
    if (inst?.integrationId === "whatsapp") {
      router.push("/integrations/whatsapp");
      return;
    }
    // Settings flow not built yet for other integrations — placeholder.
  };

  if (!hydrated) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="-m-8 min-h-full bg-[var(--bg-canvas)]" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      {variant !== "first-run" ? (
        <div className="-m-8 min-h-full bg-[var(--bg-canvas)]">
          <div className="w-full px-10 pt-12 pb-24">
            {/* Header */}
            <header className="mb-10 flex items-end justify-between gap-6 border-b border-[var(--border-subtle)] pb-6">
              <div>
                <h1 className="m-0 mb-1.5 flex items-center gap-2.5 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--fg-primary)]">
                  <Icon name="event_list" size={28} />
                  Integrações
                </h1>
                <p className="m-0 max-w-[560px] text-sm leading-[1.5] text-[var(--fg-secondary)]">
                  Conecte canais, plataformas e ferramentas para que seus
                  agentes coletem contexto, executem ações e mantenham seus
                  sistemas sincronizados.
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

            {variant === "populated" ? (
              /* Suas integrações — single unified grid (channels + others) */
              <section aria-label="Suas integrações">
                <h2 className="m-0 mb-4 text-[16px] font-semibold tracking-[-0.005em] text-[var(--fg-primary)]">
                  Suas integrações
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {instances.map((inst) => {
                    const it = ITEMS.find((i) => i.id === inst.integrationId);
                    if (!it) return null;
                    return (
                      <CardWithActions
                        key={inst.instanceId}
                        brand={it.id}
                        name={inst.name}
                        domain={it.domain}
                        description={it.desc}
                        state={stateFor(inst)}
                        hasInstance
                        active={inst.active}
                        onToggle={() => handleToggleInstance(inst.instanceId)}
                        onConfigure={() =>
                          handleConfigureInstance(inst.instanceId)
                        }
                        onDisconnect={() =>
                          handleDisconnectInstance(inst.instanceId)
                        }
                      />
                    );
                  })}
                </div>
              </section>
            ) : (
              /* All-removed — returning user with zero active instances.
                 Keeps the page header so the user does not lose orientation,
                 and offers the same quick picks without the onboarding tone. */
              <section
                aria-label="Você não tem integrações conectadas"
                className="flex flex-col items-center rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] px-8 py-14 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-canvas)] text-[var(--fg-secondary)]">
                  <Icon name="link_off" size={24} />
                </div>
                <h2 className="m-0 mt-5 text-[20px] font-semibold tracking-[-0.01em] text-[var(--fg-primary)]">
                  Você não tem integrações conectadas
                </h2>
                <p className="m-0 mt-2 max-w-[420px] text-[14px] leading-[1.55] text-[var(--fg-secondary)]">
                  Reconecte uma das suas ferramentas ou explore o catálogo
                  completo para escolher por onde começar de novo.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                  {QUICK_PICKS.map((q) => (
                    <QuickPickPill
                      key={q.id}
                      brand={q.id}
                      name={q.name}
                      onClick={() => handleConnect(q.id)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="mt-5 text-[13px] font-medium text-[var(--fg-secondary)] underline-offset-2 hover:underline"
                >
                  Ver catálogo completo
                </button>
              </section>
            )}
          </div>
        </div>
      ) : (
        <div className="-m-8 flex min-h-full items-center justify-center bg-[var(--bg-canvas)] px-10 py-16">
          {/* Empty-state hero — owns the page, no competing header */}
          <section
            aria-label="Comece conectando sua primeira ferramenta"
            className="w-full max-w-[760px]"
          >
            {/* Brand bubble cluster */}
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-5">
                {HERO_BRANDS_TOP.map((b) => (
                  <AwBrandLogo key={b} brand={b} size="lg" />
                ))}
              </div>
              <div className="flex items-center justify-center gap-5">
                {HERO_BRANDS_BOTTOM.map((b) => (
                  <AwBrandLogo key={b} brand={b} size="lg" />
                ))}
              </div>
            </div>

            {/* Headline + subtitle */}
            <div className="mt-10 flex flex-col items-center text-center">
              <h2 className="m-0 max-w-[520px] text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-[var(--fg-primary)]">
                Comece conectando sua primeira ferramenta
              </h2>
              <p className="m-0 mt-3 max-w-[480px] text-[14px] leading-[1.55] text-[var(--fg-secondary)]">
                Hotmart, Stripe, WhatsApp, Calendly, RD Station… escolha
                por onde começar e o agente assume daí.
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              <AwButton
                variant="primary"
                size="md"
                iconLeft="add"
                onClick={() => setAddOpen(true)}
              >
                Nova integração
              </AwButton>
              <AwButton
                variant="secondary"
                size="md"
                onClick={() => setAddOpen(true)}
              >
                Ver catálogo completo
              </AwButton>
            </div>

            {/* Divider */}
            <div className="mt-10 mb-5 flex items-center gap-3 text-[12px] text-[var(--fg-tertiary)]">
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-[var(--border-subtle)]"
              />
              <span>ou comece pelas mais usadas</span>
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-[var(--border-subtle)]"
              />
            </div>

            {/* Quick picks */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {QUICK_PICKS.map((q) => (
                <QuickPickPill
                  key={q.id}
                  brand={q.id}
                  name={q.name}
                  onClick={() => handleConnect(q.id)}
                />
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Catalog modal */}
      <AwAddIntegrationModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        categories={ADD_MODAL_CATS}
        items={ITEMS.map((it) => ({
          id: it.id,
          brand: it.id,
          name: it.name,
          description: it.desc,
          category: it.cat,
        }))}
        onSelect={(id) => {
          setAddOpen(false);
          handleConnect(id);
        }}
        onCustomIntegration={() => {
          setAddOpen(false);
          setCustomOpen(true);
        }}
      />

      {/* Custom integration placeholder */}
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

      {/* Connect dialog */}
      <AwConnectModal
        open={!!connectTarget}
        onClose={closeConnect}
        kind={connectTarget?.auth ?? "oauth"}
        productLogoSrc={ORG_LOGO_SRC}
        productName={ORG_NAME}
        targetBrand={connectTarget?.id ?? ""}
        targetName={connectTarget?.name ?? ""}
        description={connectTarget?.desc}
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
        steps={
          connectTarget?.auth === "webhook"
            ? buildWebhookSteps(connectTarget)
            : undefined
        }
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
              `${connectTarget.name} ${
                instances.filter(
                  (i) => i.integrationId === connectTarget.id,
                ).length + 1
              }`;
            setInstances((list) => [
              ...list,
              {
                instanceId,
                integrationId: connectTarget.id,
                name: finalName,
                active: true,
              },
            ]);
            setHasEverConnected(true);
          }
          closeConnect();
        }}
      />
    </DashboardLayout>
  );
}
