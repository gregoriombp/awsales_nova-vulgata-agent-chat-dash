"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import { AwAddIntegrationModal } from "@/components/ui/AwAddIntegrationModal";
import {
  AwConnectModal,
  type AwWebhookStep,
} from "@/components/ui/AwConnectModal";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwModal } from "@/components/ui/AwModal";
import { AwInput } from "@/components/ui/AwInput";
import { AwPill } from "@/components/ui/AwPill";
import { AwTable } from "@/components/ui/AwTable";
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
  | "checkouts"
  | "members"
  | "forms"
  | "meetings"
  | "crms"
  | "marketplaces"
  | "ai"
  | "signatures";

/** Channels live in /canais now. We keep the ids here only so any
 *  legacy localStorage instances created before the split are filtered
 *  out instead of crashing the catalog lookup. */
const CHANNEL_IDS = new Set(["whatsapp", "instagram", "messenger"]);

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
  { id: "ai", label: "Modelos de IA" },
  { id: "checkouts", label: "Checkouts" },
  { id: "members", label: "Área de membros" },
  { id: "forms", label: "Formulários" },
  { id: "meetings", label: "Reuniões" },
  { id: "crms", label: "CRMs" },
  { id: "marketplaces", label: "Marketplaces" },
  { id: "signatures", label: "Assinaturas" },
];

/** Synthetic catalog entry for user-created custom (webhook) integrations.
 *  Not surfaced in the Add modal or Explore grid — its only job is to
 *  satisfy the table's `items.find(...)` lookup so rows persisted from
 *  /integrations/custom render with a generic identity instead of being
 *  filtered out. */
const CUSTOM_INTEGRATION: Integration = {
  id: "custom",
  cat: "checkouts",
  name: "Personalizada",
  domain: "",
  desc: "Integração personalizada via webhook.",
  auth: "webhook",
};

const ITEMS: Integration[] = [
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

/** 3 brand picks featured in the "Explore" section below the populated
 *  table. Combined with the trailing "Ver todas" tile this is exactly 4
 *  cells, which fills a single 4-up row on wide monitors and breaks
 *  cleanly into 2×2 on smaller widths. Order = visual priority; mix
 *  spans checkout / AI / meetings so the grid reads as a sample of the
 *  catalog, not a single niche. */
const EXPLORE_BRAND_IDS = [
  "hotmart",
  "claude",
  "calendly",
] as const;

const HERO_BRANDS_TOP = ["hotmart", "eduzz", "kiwify"] as const;
const HERO_BRANDS_BOTTOM = [
  "stripe",
  "rdstation",
  "calendly",
  "hubspot",
] as const;

const QUICK_PICKS: { id: string; name: string }[] = [
  { id: "hotmart", name: "Hotmart" },
  { id: "stripe", name: "Stripe" },
  { id: "calendly", name: "Calendly" },
  { id: "rdstation", name: "RD Station" },
  { id: "claude", name: "Claude" },
];

/* ----------------------------------------------------------------
 * Row helpers — list view derived data + UI bits
 *
 * The list view is rendered as a Mobbin-style entity table. Each row
 * shows the integration brand, the connection name, status, created
 * date, and last event. Created date and last event are deterministic
 * placeholders for the prototype: addedAt is real when available; the
 * last-event label is hashed from instanceId so the same row always
 * shows the same value across reloads.
 * ---------------------------------------------------------------- */

type SortKey = "name" | "status" | "created" | "event";
type SortDir = "asc" | "desc";
interface SortState {
  by: SortKey;
  dir: SortDir;
}

const MONTHS_PT = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

function createdAtOf(inst: IntegrationInstance): number {
  if (typeof inst.addedAt === "number") return inst.addedAt;
  const tail = inst.instanceId.split("-").pop();
  const n = tail ? parseInt(tail, 10) : NaN;
  return Number.isFinite(n) ? n : 0;
}

function formatDateBR(ms: number): string {
  if (!ms) return "—";
  const d = new Date(ms);
  return `${d.getDate()} ${MONTHS_PT[d.getMonth()]} ${d.getFullYear()}`;
}

function lastEventFor(instanceId: string): { mins: number; label: string } {
  let h = 0;
  for (let i = 0; i < instanceId.length; i++) {
    h = ((h << 5) - h + instanceId.charCodeAt(i)) | 0;
  }
  const mins = (Math.abs(h) % 10080) + 1;
  if (mins < 60) return { mins, label: `${mins} min atrás` };
  if (mins < 60 * 24)
    return { mins, label: `${Math.round(mins / 60)} h atrás` };
  return { mins, label: `${Math.round(mins / (60 * 24))} d atrás` };
}

function statusOf(inst: IntegrationInstance): {
  variant: "live" | "draft" | "neutral" | "error";
  label: string;
  order: number;
  reason?: string;
} {
  if (!inst.active) return { variant: "neutral", label: "Inativa", order: 2 };
  if (inst.needsAttention)
    return {
      variant: "error",
      label: "Falha na conexão",
      order: 1,
      reason:
        inst.attentionReason ??
        "A integração reportou um erro. Reconecte ou revise as credenciais.",
    };
  return { variant: "live", label: "Ativa", order: 0 };
}

/* Demo seeding — generates many synthetic instances cycling through the
 * catalog so the infinite-scroll behavior is observable in the prototype
 * without forcing the user to connect dozens of accounts manually. Every
 * 7th row is marked as `needsAttention` so the failure state is visible
 * without any interaction. */
const DEMO_FAILURE_REASONS = [
  "Token de autenticação expirou. Reconecte para continuar recebendo eventos.",
  "Webhook retornou 401 nas últimas 3 tentativas. Revise as credenciais.",
  "Endpoint do parceiro está respondendo timeout. Verifique o status do serviço.",
  "Permissão revogada no aplicativo conectado. Reautorize para retomar.",
  "Assinatura do parceiro expirou. Renove para reativar a integração.",
];

function buildDemoInstances(count: number): IntegrationInstance[] {
  const out: IntegrationInstance[] = [];
  const baseTime = Date.now();
  for (let i = 0; i < count; i++) {
    const brand = ITEMS[i % ITEMS.length];
    const seq = Math.floor(i / ITEMS.length) + 1;
    const ts = baseTime - i * 1000 * 60 * 37;
    const inst: IntegrationInstance = {
      instanceId: `demo-${brand.id}-${ts}-${i}`,
      integrationId: brand.id,
      name: seq > 1 ? `${brand.name} • Conta ${seq}` : brand.name,
      active: true,
      addedAt: ts,
    };
    if (i % 7 === 0) {
      inst.needsAttention = true;
      inst.attentionReason =
        DEMO_FAILURE_REASONS[i % DEMO_FAILURE_REASONS.length];
    }
    out.push(inst);
  }
  return out;
}

function SortGlyph({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active)
    return <Icon name="unfold_more" size={14} aria-hidden="true" />;
  return (
    <Icon
      name={dir === "asc" ? "arrow_upward" : "arrow_downward"}
      size={14}
      aria-hidden="true"
    />
  );
}

/* The SortMenu, RowActionMenu and MenuItem inline implementations were
 * replaced by AwDropdownMenu (Radix-based, registered in the styleguide
 * Playground). Both menus are now thin declarative wrappers that build
 * the items array and forward the trigger.
 *
 * Net effect: ~250 lines of bespoke menu / portal / click-outside / ESC
 * code removed from this page in favour of the shared primitive.
 */

function SortMenu({
  sort,
  onChange,
}: {
  sort: SortState;
  onChange: (s: SortState) => void;
}) {
  const options: { state: SortState; label: string }[] = [
    { state: { by: "name", dir: "asc" }, label: "Nome (A → Z)" },
    { state: { by: "name", dir: "desc" }, label: "Nome (Z → A)" },
    { state: { by: "created", dir: "desc" }, label: "Mais recentes" },
    { state: { by: "created", dir: "asc" }, label: "Mais antigas" },
    { state: { by: "event", dir: "asc" }, label: "Último evento" },
  ];

  const currentLabel =
    options.find(
      (o) => o.state.by === sort.by && o.state.dir === sort.dir,
    )?.label ?? "Ordenar";

  return (
    <AwDropdownMenu
      aria-label="Ordenar"
      trigger={
        <AwButton variant="secondary" size="md" iconLeft="swap_vert">
          {currentLabel}
        </AwButton>
      }
      items={options.map((o) => ({
        id: `${o.state.by}-${o.state.dir}`,
        label: o.label,
        checked: o.state.by === sort.by && o.state.dir === sort.dir,
        onSelect: () => onChange(o.state),
      }))}
    />
  );
}

function RowActionMenu({
  active,
  needsAttention,
  onToggle,
  onToggleAttention,
  onConfigure,
  onDisconnect,
}: {
  active?: boolean;
  needsAttention?: boolean;
  onToggle?: () => void;
  onToggleAttention?: () => void;
  onConfigure?: () => void;
  onDisconnect?: () => void;
}) {
  return (
    <span
      className="inline-block"
      onClick={(e) => e.stopPropagation()}
    >
      <AwDropdownMenu
        aria-label="Ações da integração"
        trigger={
          <AwButton
            variant="subtle"
            size="md"
            iconOnly="more_vert"
            aria-label="Ações da integração"
            title="Ações"
          />
        }
        items={[
          {
            id: "toggle",
            icon: active ? "pause" : "play_arrow",
            label: active ? "Pausar integração" : "Ativar integração",
            onSelect: onToggle,
          },
          {
            id: "configure",
            icon: "tune",
            label: "Configurar",
            onSelect: onConfigure,
          },
          ...(onToggleAttention
            ? [
                {
                  id: "attention",
                  icon: needsAttention ? "check_circle" : "report",
                  label: needsAttention ? "Limpar erro" : "Simular erro",
                  onSelect: onToggleAttention,
                } as const,
              ]
            : []),
          { id: "sep", separator: true } as const,
          {
            id: "disconnect",
            icon: "link_off",
            label: "Desconectar",
            danger: true,
            onSelect: onDisconnect,
          },
        ]}
      />
    </span>
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
      className="group inline-flex items-center gap-2 rounded-full border border-(--border-subtle) bg-(--bg-surface) py-1.5 pl-2 pr-5 body-xs font-medium text-(--fg-primary) transition-colors hover:border-(--border-strong) hover:bg-(--bg-canvas)"
    >
      <AwBrandLogo brand={brand} size="sm" bare />
      <span>{name}</span>
    </button>
  );
}

/* ----------------------------------------------------------------
 * IntegrationsTable — list view for the populated variant.
 *
 * Toolbar: search + sort menu + filter (filter is a placeholder for
 * future segment filtering; sort drives the table order). Table: Nome,
 * Status, Criado em, Último evento, with a row-level action menu.
 * Row click → detail page.
 * ---------------------------------------------------------------- */

/** Rows loaded per infinite-scroll page. 20 fills more than a typical
 *  viewport so the first batch already shows the failure-state pill and
 *  triggers the IntersectionObserver only after the user actually scrolls. */
const ROWS_PER_PAGE = 20;

function IntegrationsTable({
  instances,
  items,
  onToggle,
  onToggleAttention,
  onConfigure,
  onDisconnect,
  onSeedDemo,
}: {
  instances: IntegrationInstance[];
  items: Integration[];
  onToggle: (instanceId: string) => void;
  onToggleAttention: (instanceId: string) => void;
  onConfigure: (instanceId: string) => void;
  onDisconnect: (instanceId: string) => void;
  onSeedDemo?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>({ by: "name", dir: "asc" });
  const [visibleCount, setVisibleCount] = useState(ROWS_PER_PAGE);
  const sentinelRef = useRef<HTMLTableRowElement | null>(null);

  const rows = useMemo(() => {
    const enriched = instances
      .map((instance) => {
        const integration = items.find((i) => i.id === instance.integrationId);
        if (!integration) return null;
        const createdAt = createdAtOf(instance);
        const ev = lastEventFor(instance.instanceId);
        return {
          instance,
          integration,
          createdAt,
          eventMins: ev.mins,
          eventLabel: ev.label,
        };
      })
      .filter((r): r is NonNullable<typeof r> => !!r);

    const q = query.trim().toLowerCase();
    const filtered = q
      ? enriched.filter(
          ({ instance, integration }) =>
            instance.name.toLowerCase().includes(q) ||
            integration.name.toLowerCase().includes(q),
        )
      : enriched;

    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sort.by === "name")
        return a.instance.name.localeCompare(b.instance.name, "pt-BR") * dir;
      if (sort.by === "status")
        return (statusOf(a.instance).order - statusOf(b.instance).order) * dir;
      if (sort.by === "created") return (a.createdAt - b.createdAt) * dir;
      return (a.eventMins - b.eventMins) * dir;
    });
  }, [instances, items, query, sort]);

  /* When the filtered/sorted set changes (search, sort, or new
   * instances), collapse the visible window back to the first page so
   * the user lands at the top of the freshly-ordered list instead of
   * mid-way through whatever they had scrolled to before. */
  useEffect(() => {
    setVisibleCount(ROWS_PER_PAGE);
  }, [query, sort, rows.length]);

  /* IntersectionObserver-driven infinite scroll. The sentinel <tr> is
   * appended after the visible rows; when it enters the viewport (with
   * a generous rootMargin so the next page loads before the user hits
   * the bottom), bump `visibleCount` by one page. */
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    if (visibleCount >= rows.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((n) => Math.min(n + ROWS_PER_PAGE, rows.length));
        }
      },
      { rootMargin: "320px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rows.length, visibleCount]);

  const visibleRows = rows.slice(0, visibleCount);
  const hasMore = visibleCount < rows.length;

  const toggleSort = (key: SortKey) => {
    setSort((s) =>
      s.by === key
        ? { by: key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { by: key, dir: key === "name" ? "asc" : "desc" },
    );
  };

  const ariaSort = (key: SortKey): "ascending" | "descending" | "none" =>
    sort.by !== key ? "none" : sort.dir === "asc" ? "ascending" : "descending";

  return (
    <section aria-label="Suas integrações">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h6 className="m-0 body-md font-medium text-(--fg-primary)">
          Suas integrações
        </h6>
        <div className="flex items-baseline gap-3 body-xs text-(--fg-tertiary)">
          {onSeedDemo && instances.length < 25 ? (
            <button
              type="button"
              onClick={onSeedDemo}
              className="font-medium text-(--fg-secondary) underline-offset-2 hover:text-(--fg-primary) hover:underline"
            >
              + 100 exemplos (demo)
            </button>
          ) : null}
          <span>
            {rows.length} {rows.length === 1 ? "ativa" : "ativas"}
          </span>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <div className="flex-1">
          <AwInput
            iconLeft="search"
            placeholder="Buscar integração…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar integração"
          />
        </div>
        <SortMenu sort={sort} onChange={setSort} />
        <AwButton
          variant="secondary"
          size="md"
          iconOnly="filter_list"
          aria-label="Filtros"
          title="Filtros"
        />
      </div>

      <AwTable className="aw-table--airy">
        <thead>
            <tr>
              <th>
                <button
                  type="button"
                  className="aw-th-sort"
                  aria-sort={ariaSort("name")}
                  onClick={() => toggleSort("name")}
                >
                  Nome
                  <SortGlyph active={sort.by === "name"} dir={sort.dir} />
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="aw-th-sort"
                  aria-sort={ariaSort("status")}
                  onClick={() => toggleSort("status")}
                >
                  Status
                  <SortGlyph active={sort.by === "status"} dir={sort.dir} />
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="aw-th-sort"
                  aria-sort={ariaSort("created")}
                  onClick={() => toggleSort("created")}
                >
                  Criado em
                  <SortGlyph active={sort.by === "created"} dir={sort.dir} />
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="aw-th-sort"
                  aria-sort={ariaSort("event")}
                  onClick={() => toggleSort("event")}
                >
                  Último evento
                  <SortGlyph active={sort.by === "event"} dir={sort.dir} />
                </button>
              </th>
              <th aria-label="Ações" style={{ width: 56 }} />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{ padding: "48px 20px", textAlign: "center" }}
                  className="body-xs text-(--fg-tertiary)"
                >
                  {query
                    ? `Nenhuma integração corresponde a "${query}".`
                    : "Sem integrações ativas."}
                </td>
              </tr>
            ) : (
              <>
                {visibleRows.map(
                  ({ instance, integration, createdAt, eventLabel }) => {
                    const status = statusOf(instance);
                    const failing = !!instance.needsAttention && instance.active;
                    const rowClass = [
                      "aw-row-clickable",
                      instance.active ? "" : "aw-row-inactive",
                      failing ? "aw-row-attention" : "",
                    ]
                      .filter(Boolean)
                      .join(" ");
                    return (
                      <tr
                        key={instance.instanceId}
                        className={rowClass}
                        aria-disabled={!instance.active || undefined}
                        onClick={() => onConfigure(instance.instanceId)}
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <AwBrandLogo brand={integration.id} size="md" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate font-medium text-(--fg-primary)">
                                  {instance.name}
                                </span>
                                {failing ? (
                                  <Icon
                                    name="error"
                                    size={14}
                                    className="shrink-0 text-(--aw-red-500)"
                                    aria-label="Falha na conexão"
                                  />
                                ) : null}
                              </div>
                              <div className="truncate body-xs text-(--fg-tertiary)">
                                {integration.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <AwPill
                            variant={status.variant}
                            title={status.reason}
                          >
                            {status.label}
                          </AwPill>
                        </td>
                        <td className="text-(--fg-secondary)">
                          {formatDateBR(createdAt)}
                        </td>
                        <td className="text-(--fg-secondary)">
                          {eventLabel}
                        </td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <RowActionMenu
                            active={instance.active}
                            needsAttention={instance.needsAttention}
                            onToggle={() => onToggle(instance.instanceId)}
                            onToggleAttention={() =>
                              onToggleAttention(instance.instanceId)
                            }
                            onConfigure={() =>
                              onConfigure(instance.instanceId)
                            }
                            onDisconnect={() =>
                              onDisconnect(instance.instanceId)
                            }
                          />
                        </td>
                      </tr>
                    );
                  },
                )}
                {hasMore ? (
                  <tr ref={sentinelRef} aria-hidden="true">
                    <td
                      colSpan={5}
                      style={{ padding: "20px", textAlign: "center" }}
                      className="body-xs text-(--fg-tertiary)"
                    >
                      Carregando mais integrações…
                    </td>
                  </tr>
                ) : rows.length > ROWS_PER_PAGE ? (
                  <tr aria-hidden="true">
                    <td
                      colSpan={5}
                      style={{ padding: "20px", textAlign: "center" }}
                      className="body-xs text-(--fg-tertiary)"
                    >
                      Você chegou ao fim — {rows.length} integrações.
                    </td>
                  </tr>
                ) : null}
              </>
            )}
          </tbody>
        </AwTable>
    </section>
  );
}

/* ----------------------------------------------------------------
 * ExploreIntegrations — 3×3 grid below the populated table.
 *
 * 8 featured brand cards + a 9th "Ver todas" tile that opens the full
 * catalog modal. Brand cards trigger onPick(id); the page decides
 * whether to open Connect directly or surface a "you already have one"
 * choice modal first.
 * ---------------------------------------------------------------- */

function ExploreIntegrations({
  items,
  onPick,
  onSeeAll,
  totalCount,
}: {
  items: Integration[];
  onPick: (integrationId: string) => void;
  onSeeAll: () => void;
  totalCount: number;
}) {
  const featured = EXPLORE_BRAND_IDS.map((id) =>
    items.find((i) => i.id === id),
  ).filter((i): i is Integration => !!i);

  return (
    <section aria-label="Explore novas integrações" className="mt-12">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h6 className="m-0 body-md font-medium text-(--fg-primary)">
          Explore novas integrações
        </h6>
        <button
          type="button"
          onClick={onSeeAll}
          className="body-xs font-medium text-(--fg-secondary) underline-offset-2 hover:text-(--fg-primary) hover:underline"
        >
          Ver catálogo completo →
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((it) => (
          <ExploreCard
            key={it.id}
            integration={it}
            onClick={() => onPick(it.id)}
          />
        ))}
        <SeeAllCard count={totalCount} onClick={onSeeAll} />
      </div>
    </section>
  );
}

function ExploreCard({
  integration,
  onClick,
}: {
  integration: Integration;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="aw-card aw-card--interactive aw-explore-card flex h-full items-center gap-4 text-left"
    >
      <AwBrandLogo brand={integration.id} size="md" />
      <div className="min-w-0 flex-1">
        <div className="truncate body-sm font-medium text-(--fg-primary)">
          {integration.name}
        </div>
        <p className="m-0 mt-0.5 line-clamp-2 body-xs text-(--fg-tertiary)">
          {integration.desc}
        </p>
      </div>
    </button>
  );
}

function SeeAllCard({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="aw-card aw-card--interactive aw-card--dashed aw-explore-card flex h-full items-center gap-4 text-left"
    >
      <div
        className="flex shrink-0 items-center justify-center rounded-sm bg-(--bg-raised) text-(--fg-secondary)"
        style={{ width: 40, height: 40 }}
      >
        <Icon name="apps" size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="body-sm font-medium text-(--fg-primary)">
          Ver todas
        </div>
        <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">
          {count} integrações disponíveis
        </p>
      </div>
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
  const [connectId, setConnectId] = useState<string | null>(null);
  const [disconnectId, setDisconnectId] = useState<string | null>(null);
  const [customConfirmOpen, setCustomConfirmOpen] = useState(false);
  /** Set when the user clicks an Explore card for a brand they already
   *  have a live connection of — surfaces a choice modal (gerenciar
   *  existentes vs. criar nova conexão) instead of dumping them into a
   *  duplicate Connect flow. */
  const [explorePick, setExplorePick] = useState<Integration | null>(null);
  const [instances, setInstances] = useState<IntegrationInstance[]>([]);
  const tableRef = useRef<HTMLDivElement>(null);
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

  const handleConnect = (id: string) => {
    setConnectId(id);
  };

  /** Channels are managed in /canais, but they share the same
   *  localStorage list. Filter them here so the integrations grid only
   *  shows non-channel instances. The empty-state variant likewise
   *  ignores channels. */
  const nonChannelInstances = instances.filter(
    (i) => !CHANNEL_IDS.has(i.integrationId),
  );

  const variant: EmptyVariant =
    nonChannelInstances.length > 0
      ? "populated"
      : hasEverConnected
        ? "all-removed"
        : "first-run";

  const handleToggleInstance = (instanceId: string) => {
    setInstances((list) =>
      list.map((i) =>
        i.instanceId === instanceId ? { ...i, active: !i.active } : i,
      ),
    );
  };

  const handleToggleAttention = (instanceId: string) => {
    setInstances((list) =>
      list.map((i) => {
        if (i.instanceId !== instanceId) return i;
        if (i.needsAttention) {
          const { needsAttention: _drop, attentionReason: _drop2, ...rest } = i;
          return rest;
        }
        return {
          ...i,
          needsAttention: true,
          attentionReason:
            "Token de autenticação expirou. Reconecte para continuar recebendo eventos.",
        };
      }),
    );
  };

  const handleDisconnectInstance = (instanceId: string) => {
    setDisconnectId(instanceId);
  };

  const handleSeedDemo = () => {
    setInstances((list) => [...list, ...buildDemoInstances(100)]);
    setHasEverConnected(true);
  };

  const confirmDisconnect = () => {
    if (!disconnectId) return;
    setInstances((list) => list.filter((i) => i.instanceId !== disconnectId));
    setDisconnectId(null);
  };

  const disconnectTarget = disconnectId
    ? instances.find((i) => i.instanceId === disconnectId)
    : null;

  const handleConfigureInstance = (instanceId: string) => {
    router.push(`/integrations/${instanceId}`);
  };

  const handleExplorePick = (integrationId: string) => {
    const integration = ITEMS.find((i) => i.id === integrationId);
    if (!integration) return;
    const hasActive = nonChannelInstances.some(
      (inst) => inst.integrationId === integrationId,
    );
    if (hasActive) {
      setExplorePick(integration);
    } else {
      handleConnect(integrationId);
    }
  };

  const closeExplorePick = () => setExplorePick(null);

  const handleManageExisting = () => {
    closeExplorePick();
    tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCreateAnother = () => {
    if (!explorePick) return;
    const id = explorePick.id;
    closeExplorePick();
    handleConnect(id);
  };

  if (!hydrated) {
    return (
      <AwDashboardLayout breadcrumbs={breadcrumbs}>
        <div className="-m-8 min-h-full bg-(--bg-canvas)" />
      </AwDashboardLayout>
    );
  }

  return (
    <AwDashboardLayout breadcrumbs={breadcrumbs}>
      {variant !== "first-run" ? (
        <div className="-m-8 min-h-full bg-(--bg-canvas)">
          <div className="w-full px-10 pt-12 pb-24">
            {/* Header */}
            <header className="mb-10 flex items-end justify-between gap-6 border-b border-(--border-subtle) pb-6">
              <div>
                <h3 className="m-0 mb-1.5 text-(--fg-primary)">
                  Integrações
                </h3>
                <p className="m-0 max-w-[560px] body-sm text-(--fg-secondary)">
                  Conecte plataformas e ferramentas para que seus agentes
                  coletem contexto, executem ações e mantenham seus
                  sistemas sincronizados.
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
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
              <>
                <div ref={tableRef}>
                  <IntegrationsTable
                    instances={nonChannelInstances}
                    items={[...ITEMS, CUSTOM_INTEGRATION]}
                    onToggle={handleToggleInstance}
                    onToggleAttention={handleToggleAttention}
                    onConfigure={handleConfigureInstance}
                    onDisconnect={handleDisconnectInstance}
                    onSeedDemo={handleSeedDemo}
                  />
                </div>
                <ExploreIntegrations
                  items={ITEMS}
                  onPick={handleExplorePick}
                  onSeeAll={() => setAddOpen(true)}
                  totalCount={ITEMS.length}
                />
              </>
            ) : (
              /* All-removed — returning user with zero active instances.
                 Keeps the page header so the user does not lose orientation,
                 and offers the same quick picks without the onboarding tone. */
              <section
                aria-label="Você não tem integrações conectadas"
                className="flex flex-col items-center rounded-2xl border border-dashed border-(--border-subtle) bg-(--bg-surface) px-8 py-14 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--bg-canvas) text-(--fg-secondary)">
                  <Icon name="link_off" size={24} />
                </div>
                <h5 className="m-0 mt-5 text-(--fg-primary)">
                  Você não tem integrações conectadas
                </h5>
                <p className="m-0 mt-2 max-w-[420px] body-sm text-(--fg-secondary)">
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
                  className="mt-5 body-xs font-medium text-(--fg-secondary) underline-offset-2 hover:underline"
                >
                  Ver catálogo completo
                </button>
              </section>
            )}
          </div>
        </div>
      ) : (
        <div className="-m-8 flex min-h-full items-center justify-center bg-(--bg-canvas) px-10 py-16">
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
              <h3 className="m-0 max-w-[520px] text-(--fg-primary)">
                Comece conectando sua primeira ferramenta
              </h3>
              <p className="m-0 mt-3 max-w-[480px] body-sm text-(--fg-secondary)">
                Hotmart, Stripe, Calendly, RD Station, Claude… escolha
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
            <div className="mt-10 mb-5 flex items-center gap-3 body-xs text-(--fg-tertiary)">
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-(--border-subtle)"
              />
              <span>ou comece pelas mais usadas</span>
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-(--border-subtle)"
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
          setCustomConfirmOpen(true);
        }}
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
            const now = Date.now();
            const instanceId = `${connectTarget.id}-${now}`;
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
                addedAt: now,
              },
            ]);
            setHasEverConnected(true);
          }
          closeConnect();
        }}
      />

      {/* Explore pick — user clicked a featured brand they already have a
          live connection of. Offer to surface the existing rows in the
          table or kick off a brand-new Connect flow for a second account. */}
      <AwModal
        open={!!explorePick}
        onClose={closeExplorePick}
        title={
          explorePick
            ? `${explorePick.name} já está conectado`
            : "Integração já conectada"
        }
        footer={
          <>
            <AwButton
              variant="secondary"
              size="md"
              iconLeft="visibility"
              onClick={handleManageExisting}
            >
              Ver existentes
            </AwButton>
            <AwButton
              variant="primary"
              size="md"
              iconLeft="add"
              onClick={handleCreateAnother}
            >
              Conectar outra conta
            </AwButton>
          </>
        }
      >
        <p className="m-0 body-sm text-(--fg-secondary)">
          Você já tem ao menos uma conexão de{" "}
          <strong className="text-(--fg-primary)">
            {explorePick?.name ?? "essa ferramenta"}
          </strong>
          . Quer ver e gerenciar as conexões existentes, ou conectar uma
          nova conta?
        </p>
      </AwModal>

      {/* Custom integration confirmation — clicking the catalog card lands
          the user on a long contract reference page that reads as "you're
          already setting it up". Confirm intent first so curious clicks
          don't feel like they kicked off a creation flow. Cancel returns
          the user to the catalog (the entry point) instead of dumping them
          on the integrations page mid-decision. */}
      <AwModal
        open={customConfirmOpen}
        onClose={() => {
          setCustomConfirmOpen(false);
          setAddOpen(true);
        }}
        title="Criar integração personalizada?"
        footer={
          <>
            <AwButton
              variant="secondary"
              size="md"
              onClick={() => {
                setCustomConfirmOpen(false);
                setAddOpen(true);
              }}
            >
              Cancelar
            </AwButton>
            <AwButton
              variant="primary"
              size="md"
              iconRight="arrow_forward"
              onClick={() => {
                setCustomConfirmOpen(false);
                router.push("/integrations/custom");
              }}
            >
              Continuar
            </AwButton>
          </>
        }
      >
        <p className="m-0 body-sm text-(--fg-secondary)">
          Você vai abrir a configuração de uma{" "}
          <strong className="text-(--fg-primary)">
            integração personalizada via webhook
          </strong>
          . É preciso definir um nome único, gerar um endpoint e enviar
          eventos no formato esperado pelo AwSales. Nada é criado até você
          concluir a configuração — quer continuar?
        </p>
      </AwModal>

      {/* Disconnect confirmation — destructive action gets a deliberate
          two-step so the user does not lose a configured integration on
          a stray menu click. */}
      <AwModal
        open={!!disconnectTarget}
        onClose={() => setDisconnectId(null)}
        title="Desconectar integração"
        footer={
          <>
            <AwButton
              variant="secondary"
              size="md"
              onClick={() => setDisconnectId(null)}
            >
              Cancelar
            </AwButton>
            <AwButton
              variant="primary"
              size="md"
              iconLeft="link_off"
              onClick={confirmDisconnect}
            >
              Desconectar
            </AwButton>
          </>
        }
      >
        <p className="m-0 body-sm text-(--fg-secondary)">
          Tem certeza que deseja desconectar{" "}
          <strong className="text-(--fg-primary)">
            {disconnectTarget?.name ?? "esta integração"}
          </strong>
          ? Os agentes vão perder o acesso aos dados e ações dessa
          ferramenta. Você pode reconectar depois a qualquer momento.
        </p>
      </AwModal>
    </AwDashboardLayout>
  );
}
