"use client";

import { useState } from "react";
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

interface IntegrationInstance {
  instanceId: string;
  integrationId: string;
  name: string;
  active: boolean;
}

const CHANNEL_IDS = ["whatsapp", "messenger", "instagram"] as const;
type ChannelId = (typeof CHANNEL_IDS)[number];
const isChannelId = (id: string): id is ChannelId =>
  (CHANNEL_IDS as readonly string[]).includes(id);

/** Seed instances so the populated state renders by default while we
 *  iterate the new UX flow. Disconnect everything to fall back to the
 *  empty state hero below. */
const SEED_INSTANCES: IntegrationInstance[] = [
  { instanceId: "whatsapp-default", integrationId: "whatsapp", name: "WhatsApp", active: true },
  { instanceId: "instagram-default", integrationId: "instagram", name: "Instagram", active: true },
  { instanceId: "hotmart-default", integrationId: "hotmart", name: "Hotmart", active: true },
  { instanceId: "stripe-default", integrationId: "stripe", name: "Stripe", active: true },
  { instanceId: "shopify-default", integrationId: "shopify", name: "Shopify", active: true },
  { instanceId: "calendly-default", integrationId: "calendly", name: "Calendly", active: true },
];

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
  const stop = (cb?: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    cb?.();
  };
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
        <div className="absolute right-2 top-2 flex items-center gap-0.5">
          <AwButton
            variant="ghost"
            size="sm"
            iconOnly={active ? "toggle_on" : "toggle_off"}
            aria-label={active ? "Pausar integração" : "Ativar integração"}
            title={active ? "Pausar integração" : "Ativar integração"}
            onClick={stop(onToggle)}
          />
          <AwButton
            variant="ghost"
            size="sm"
            iconOnly="tune"
            aria-label="Configurar integração"
            title="Configurar integração"
            onClick={stop(onConfigure)}
          />
          <AwButton
            variant="ghost"
            size="sm"
            iconOnly="link_off"
            aria-label="Desconectar integração"
            title="Desconectar integração"
            onClick={stop(onDisconnect)}
          />
        </div>
      )}
    </div>
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

export default function IntegrationsPage() {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [connectId, setConnectId] = useState<string | null>(null);
  const [instances, setInstances] = useState<IntegrationInstance[]>(SEED_INSTANCES);

  const connectTarget = connectId
    ? ITEMS.find((i) => i.id === connectId) ?? null
    : null;

  const breadcrumbs = [
    { label: "Integrações", icon: <Icon name="extension" size={20} /> },
  ];

  const closeConnect = () => setConnectId(null);

  const isPopulated = instances.length > 0;
  const nonChannelInstances = instances.filter(
    (i) => !isChannelId(i.integrationId),
  );

  const findInstance = (integrationId: string) =>
    instances.find((i) => i.integrationId === integrationId);

  const stateFor = (instance?: IntegrationInstance): AwIntegrationCardState => {
    if (!instance) return "available";
    return instance.active ? "connected" : "disabled";
  };

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
      router.push("/setup/whatsapp/1");
      return;
    }
    // Settings flow not built yet for other integrations — placeholder.
  };

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      {isPopulated ? (
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

            {/* Canais — always shown, 3 fixed channels */}
            <section aria-label="Canais" className="mb-10">
              <h2 className="m-0 mb-4 text-[16px] font-semibold tracking-[-0.005em] text-[var(--fg-primary)]">
                Canais
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {CHANNEL_IDS.map((id) => {
                  const it = ITEMS.find((i) => i.id === id);
                  if (!it) return null;
                  const inst = findInstance(id);
                  return (
                    <CardWithActions
                      key={id}
                      brand={it.id}
                      name={inst?.name ?? it.name}
                      domain={it.domain}
                      description={it.desc}
                      state={stateFor(inst)}
                      onCardClick={() => setConnectId(id)}
                      hasInstance={!!inst}
                      active={inst?.active}
                      onToggle={
                        inst ? () => handleToggleInstance(inst.instanceId) : undefined
                      }
                      onConfigure={
                        inst
                          ? () => handleConfigureInstance(inst.instanceId)
                          : undefined
                      }
                      onDisconnect={
                        inst
                          ? () => handleDisconnectInstance(inst.instanceId)
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            </section>

            {/* Integrações Ativas — non-channel connected instances */}
            {nonChannelInstances.length > 0 && (
              <section aria-label="Integrações ativas">
                <h2 className="m-0 mb-4 text-[16px] font-semibold tracking-[-0.005em] text-[var(--fg-primary)]">
                  Integrações ativas
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {nonChannelInstances.map((inst) => {
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
                  onClick={() => setConnectId(q.id)}
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
          setConnectId(id);
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
          }
          closeConnect();
        }}
      />
    </DashboardLayout>
  );
}
