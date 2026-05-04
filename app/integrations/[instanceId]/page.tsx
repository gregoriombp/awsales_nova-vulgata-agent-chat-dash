"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import { AwPill } from "@/components/ui/AwPill";
import { AwInput } from "@/components/ui/AwInput";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwStatusDot } from "@/components/ui/AwStatusDot";
import { AwTable } from "@/components/ui/AwTable";
import { Icon } from "@/components/ui/Icon";
import {
  AUTH_LABELS,
  CATEGORY_LABELS,
  findIntegration,
  type IntegrationCatalogItem,
} from "@/lib/integrationsCatalog";
import {
  loadInstances,
  saveInstances,
  type IntegrationInstance,
} from "@/lib/integrationsStore";

/* ----------------------------------------------------------------
 * Demo data
 *
 * The detail page is a UI prototype — there's no real backend yet.
 * To match the reference (Hotmart with three connections: JF Rocket,
 * Loja Expressa, Caixa Preta), we synthesize sibling accounts for the
 * selected instance from any other instance of the same integration
 * already in localStorage. If there are not enough siblings to make
 * the multi-account view interesting, we fall back to a fixed demo
 * roster so the screen still illustrates the multi-account pattern.
 * ---------------------------------------------------------------- */

type Health = "healthy" | "degraded" | "down";

interface ConnectionAccount {
  id: string;
  name: string;
  /** Relative time string, e.g. "2m atrás". */
  lastEvent: string;
  health: Health;
  /** ISO date the connection was first authorized. */
  connectedOn: string;
  active: boolean;
}

const DEMO_FALLBACK: Record<string, string[]> = {
  hotmart: ["JF Rocket", "Loja Expressa", "Caixa Preta"],
  stripe: ["Conta Brasil", "Conta US"],
  kiwify: ["Conta principal", "Curso Beta"],
  default: ["Conta principal", "Conta secundária"],
};

const TABS = [
  { id: "overview", label: "Visão" },
  { id: "permissions", label: "Permissões" },
  { id: "objects", label: "Objetos" },
  { id: "webhooks", label: "Eventos" },
  { id: "tools", label: "Tools" },
  { id: "audit", label: "Logs" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ----------------------------------------------------------------
 * Page
 * ---------------------------------------------------------------- */

export default function IntegrationDetailPage({
  params,
}: {
  params: Promise<{ instanceId: string }>;
}) {
  // Next 16 — params is a Promise; unwrap with `use()`.
  const { instanceId } = use(params);
  const router = useRouter();

  const [hydrated, setHydrated] = useState(false);
  const [instances, setInstances] = useState<IntegrationInstance[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [selectedAccount, setSelectedAccount] = useState(0);

  useEffect(() => {
    setInstances(loadInstances());
    setHydrated(true);
  }, []);

  const instance = instances.find((i) => i.instanceId === instanceId);
  const integration: IntegrationCatalogItem | undefined = instance
    ? findIntegration(instance.integrationId)
    : undefined;

  /** Build the account roster:
   *   - the current instance is always position 0
   *   - any other instances of the same integration follow
   *   - if total < 2, top up from the demo roster so the multi-account
   *     UI is visible at all
   */
  const accounts: ConnectionAccount[] = useMemo(() => {
    if (!instance || !integration) return [];

    const base: ConnectionAccount = {
      id: instance.instanceId,
      name: instance.name,
      lastEvent: "2m atrás",
      health: instance.active ? "healthy" : "degraded",
      connectedOn: "2026-03-01",
      active: instance.active,
    };

    const siblings: ConnectionAccount[] = instances
      .filter(
        (i) =>
          i.integrationId === instance.integrationId &&
          i.instanceId !== instance.instanceId,
      )
      .map((i, idx) => ({
        id: i.instanceId,
        name: i.name,
        lastEvent: idx === 0 ? "2m atrás" : "1d atrás",
        health: idx === 0 ? "healthy" : "degraded",
        connectedOn: idx === 0 ? "2026-02-14" : "2025-12-08",
        active: i.active,
      }));

    const merged = [base, ...siblings];

    const fallbackNames =
      DEMO_FALLBACK[integration.id] ?? DEMO_FALLBACK.default;
    let i = 0;
    while (merged.length < Math.min(3, fallbackNames.length)) {
      const fillName = fallbackNames[i++] ?? `Conta ${merged.length + 1}`;
      if (merged.some((a) => a.name === fillName)) continue;
      merged.push({
        id: `demo-${integration.id}-${merged.length}`,
        name: fillName,
        lastEvent: merged.length === 1 ? "2m atrás" : "1d atrás",
        health: merged.length < 2 ? "healthy" : "degraded",
        connectedOn: merged.length === 1 ? "2026-02-14" : "2025-12-08",
        active: true,
      });
      if (i > fallbackNames.length + 4) break;
    }
    return merged;
  }, [instance, integration, instances]);

  if (!hydrated) {
    return (
      <DashboardLayout breadcrumbs={[{ label: "Integrações", href: "/integrations" }]}>
        <div className="min-h-full" />
      </DashboardLayout>
    );
  }

  if (!instance || !integration) {
    return (
      <DashboardLayout
        breadcrumbs={[
          {
            label: "Integrações",
            href: "/integrations",
            icon: <Icon name="extension" size={20} />,
          },
          "Não encontrada",
        ]}
      >
        <div className="-m-8 min-h-full bg-[var(--bg-canvas)] px-10 py-16">
          <AwAlert
            variant="warning"
            title="Conexão não encontrada"
          >
            A integração que você tentou abrir não existe mais. Volte para a
            lista e selecione outra.
            <div className="mt-3">
              <AwButton
                variant="secondary"
                size="sm"
                iconLeft="arrow_back"
                onClick={() => router.push("/integrations")}
              >
                Voltar para Integrações
              </AwButton>
            </div>
          </AwAlert>
        </div>
      </DashboardLayout>
    );
  }

  const account = accounts[selectedAccount] ?? accounts[0];
  const isMulti = accounts.length > 1;
  const hasError = !account.active || account.health === "down";

  const updateInstance = (mutator: (i: IntegrationInstance) => IntegrationInstance) => {
    setInstances((list) => {
      const next = list.map((i) => (i.instanceId === instance.instanceId ? mutator(i) : i));
      saveInstances(next);
      return next;
    });
  };

  const breadcrumbs = [
    {
      label: "Integrações",
      href: "/integrations",
      icon: <Icon name="extension" size={20} />,
    },
    integration.name,
  ];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="-m-8 min-h-full bg-[var(--bg-canvas)]">
        <div className="w-full px-10 pt-8 pb-24">
          <div className="flex gap-6">
            {/* Connections sidebar — only when multi-account */}
            {isMulti && (
              <ConnectionsSidebar
                accounts={accounts}
                selectedIndex={selectedAccount}
                onSelect={setSelectedAccount}
                onAddAccount={() => router.push("/integrations")}
              />
            )}

            {/* Main column */}
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              <DetailHeader
                integration={integration}
                account={account}
                onReconnect={() => {
                  updateInstance((i) => ({ ...i, active: true, needsAttention: false }));
                }}
                onTest={() => {
                  /* prototype: noop */
                }}
              />

              {hasError && (
                <AwAlert
                  variant="danger"
                  title={`Conexão com ${integration.name} falhou`}
                  icon="error"
                >
                  Token expirou em 2026-04-29 14:22. Reconecte para retomar os
                  eventos dessa conta.
                  <div className="mt-3">
                    <AwButton
                      variant="primary"
                      size="sm"
                      iconLeft="link"
                      onClick={() =>
                        updateInstance((i) => ({
                          ...i,
                          active: true,
                          needsAttention: false,
                        }))
                      }
                    >
                      Reconectar agora
                    </AwButton>
                  </div>
                </AwAlert>
              )}

              {/* Tabs + content card */}
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]">
                <div className="border-b border-[var(--border-subtle)] px-6">
                  <TabBar value={activeTab} onChange={setActiveTab} />
                </div>
                <div className="p-6">
                  {activeTab === "overview" && (
                    <OverviewTab integration={integration} account={account} />
                  )}
                  {activeTab === "permissions" && (
                    <PermissionsTab integration={integration} />
                  )}
                  {activeTab === "objects" && (
                    <ObjectsTab integration={integration} />
                  )}
                  {activeTab === "webhooks" && (
                    <WebhooksTab integration={integration} instanceId={instance.instanceId} />
                  )}
                  {activeTab === "tools" && (
                    <ToolsTab integration={integration} />
                  )}
                  {activeTab === "audit" && <AuditTab />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ----------------------------------------------------------------
 * Connections sidebar
 * ---------------------------------------------------------------- */

function ConnectionsSidebar({
  accounts,
  selectedIndex,
  onSelect,
  onAddAccount,
}: {
  accounts: ConnectionAccount[];
  selectedIndex: number;
  onSelect: (i: number) => void;
  onAddAccount: () => void;
}) {
  return (
    <aside className="w-[260px] flex-shrink-0">
      <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-3">
        <div className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--fg-tertiary)]">
          {accounts.length} conexões
        </div>
        <ul className="flex flex-col gap-1">
          {accounts.map((a, i) => {
            const active = i === selectedIndex;
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => onSelect(i)}
                  className={
                    "flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-left transition-colors " +
                    (active
                      ? "bg-[var(--bg-surface)] ring-1 ring-[var(--border-strong)]"
                      : "hover:bg-[var(--bg-surface)]")
                  }
                >
                  <AwStatusDot
                    variant={
                      a.health === "healthy"
                        ? "live"
                        : a.health === "degraded"
                          ? "attention"
                          : "offline"
                    }
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium text-[var(--fg-primary)]">
                      {a.name}
                    </div>
                    <div className="text-[11px] text-[var(--fg-tertiary)]">
                      {a.lastEvent}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={onAddAccount}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-dashed border-[var(--border-subtle)] px-2.5 py-2 text-[12px] font-medium text-[var(--fg-secondary)] transition-colors hover:bg-[var(--bg-surface)] hover:text-[var(--fg-primary)]"
        >
          <Icon name="add" size={14} />
          Adicionar conta
        </button>
      </div>
    </aside>
  );
}

/* ----------------------------------------------------------------
 * Header
 * ---------------------------------------------------------------- */

function DetailHeader({
  integration,
  account,
  onReconnect,
  onTest,
}: {
  integration: IntegrationCatalogItem;
  account: ConnectionAccount;
  onReconnect: () => void;
  onTest: () => void;
}) {
  const status: { variant: "live" | "draft" | "error"; label: string } =
    !account.active
      ? { variant: "error", label: "inativo" }
      : account.health === "down"
        ? { variant: "error", label: "com erro" }
        : account.health === "degraded"
          ? { variant: "draft", label: "atenção" }
          : { variant: "live", label: "ativo" };

  return (
    <header className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-4 pl-5">
      <div className="flex min-w-0 items-center gap-3">
        <AwBrandLogo brand={integration.id} size="lg" bare />
        <div className="min-w-0">
          <h1 className="m-0 truncate text-[20px] font-semibold tracking-[-0.01em] text-[var(--fg-primary)]">
            {integration.name} · {account.name}
          </h1>
          <p className="m-0 mt-0.5 text-[12px] text-[var(--fg-tertiary)]">
            {CATEGORY_LABELS[integration.cat]} · {AUTH_LABELS[integration.auth]}
          </p>
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <AwPill variant={status.variant}>{status.label}</AwPill>
        <AwButton
          variant="secondary"
          size="sm"
          iconLeft="link"
          onClick={onReconnect}
        >
          Reconectar
        </AwButton>
        <AwButton
          variant="secondary"
          size="sm"
          iconLeft="bolt"
          onClick={onTest}
        >
          Testar
        </AwButton>
        <AwButton
          variant="ghost"
          size="sm"
          iconOnly="more_horiz"
          aria-label="Mais ações"
        />
      </div>
    </header>
  );
}

/* ----------------------------------------------------------------
 * Tabs
 * ---------------------------------------------------------------- */

function TabBar({
  value,
  onChange,
}: {
  value: TabId;
  onChange: (v: TabId) => void;
}) {
  return (
    <div role="tablist" className="flex gap-1">
      {TABS.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={
              "relative px-4 py-3 text-[13px] font-medium transition-colors " +
              (active
                ? "text-[var(--fg-primary)]"
                : "text-[var(--fg-tertiary)] hover:text-[var(--fg-secondary)]")
            }
          >
            {t.label}
            {active && (
              <span className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-[var(--fg-primary)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------
 * Tab: Visão (overview)
 * ---------------------------------------------------------------- */

function OverviewTab({
  integration,
  account,
}: {
  integration: IntegrationCatalogItem;
  account: ConnectionAccount;
}) {
  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Visão geral">
        <KvList
          rows={[
            {
              k: "Status",
              v: (
                <AwPill variant={account.active ? "live" : "error"}>
                  {account.active ? "ativo" : "inativo"}
                </AwPill>
              ),
            },
            {
              k: "Saúde",
              v: (
                <span className="inline-flex items-center gap-2 text-[13px] text-[var(--fg-secondary)]">
                  <AwStatusDot
                    variant={
                      account.health === "healthy"
                        ? "live"
                        : account.health === "degraded"
                          ? "attention"
                          : "offline"
                    }
                    size="sm"
                  />
                  {account.health} · última verificação 2 min atrás
                </span>
              ),
            },
            {
              k: "Último evento",
              v: (
                <span className="text-[13px] text-[var(--fg-secondary)]">
                  {account.lastEvent} (compra criada · #4321)
                </span>
              ),
            },
            {
              k: "Eventos hoje",
              v: <span className="text-[13px] text-[var(--fg-secondary)]">127</span>,
            },
            {
              k: "Conectada em",
              v: (
                <span className="text-[13px] text-[var(--fg-secondary)]">
                  {account.connectedOn}
                </span>
              ),
            },
            {
              k: "Tools ativas",
              v: (
                <span className="text-[13px] text-[var(--fg-secondary)]">
                  4 nativas · 2 custom
                </span>
              ),
            },
          ]}
        />
      </SectionCard>

      {integration.auth === "webhook" && (
        <AwAlert
          variant="info"
          title="Aguardando primeiro evento"
          icon="rocket_launch"
        >
          Termine de configurar o webhook na sua conta {integration.name} para
          começar a receber eventos. A URL fica na aba <strong>Webhooks</strong>.
        </AwAlert>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------
 * Tab: Permissões
 * ---------------------------------------------------------------- */

function PermissionsTab({
  integration,
}: {
  integration: IntegrationCatalogItem;
}) {
  if (integration.auth === "webhook") {
    return (
      <SectionCard title="Permissões">
        <p className="m-0 text-[13px] text-[var(--fg-secondary)]">
          {integration.name} é webhook-only — sem escopos OAuth para revisar.
        </p>
      </SectionCard>
    );
  }

  const scopes: { label: string; modes: string[] }[] = [
    { label: "Produtos", modes: ["read", "write"] },
    { label: "Compradores", modes: ["read"] },
    { label: "Cupons", modes: ["read", "write"] },
    { label: "Transações", modes: ["read"] },
    { label: "Webhooks", modes: ["recv"] },
  ];

  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Escopos concedidos">
        <div className="flex flex-wrap gap-2">
          {scopes.map((s) => (
            <span
              key={s.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-1 text-[12px] text-[var(--fg-secondary)]"
            >
              <span className="font-medium text-[var(--fg-primary)]">
                {s.label}
              </span>
              {s.modes.map((m) => (
                <span
                  key={m}
                  className="rounded-md bg-[var(--bg-raised)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--fg-tertiary)]"
                >
                  {m}
                </span>
              ))}
            </span>
          ))}
        </div>
        <div className="mt-4">
          <AwButton variant="secondary" size="sm" iconLeft="lock_open">
            Reconectar com mais escopos
          </AwButton>
        </div>
      </SectionCard>
    </div>
  );
}

/* ----------------------------------------------------------------
 * Tab: Objetos
 * ---------------------------------------------------------------- */

function ObjectsTab({
  integration,
}: {
  integration: IntegrationCatalogItem;
}) {
  if (integration.auth === "webhook") {
    return (
      <SectionCard title="Objetos">
        <p className="m-0 text-[13px] text-[var(--fg-secondary)]">
          Conexões webhook-only não importam objetos do provider.
        </p>
      </SectionCard>
    );
  }

  const products: [string, string][] = [
    ["LOJA EXPRESSA EZDROP", "ec341e4e-1448-4f9a-bcd1-7b3e21"],
    ["MARCO ZERO VITALÍCIO", "692a52726-6d8c-4023-902a-8c1baa"],
    ["CAIXA PRETA + BOOTCAMP", "b1f615b73-3645-4c41-9608-852e53"],
    ["LOJA PRONTA", "c8ae458d6-fccc-4b9a-a417-c4ce1f"],
    ["MARCO ZERO VITALÍCIO PROMO", "692a52726-6d8c-4023-902a-promo"],
  ];

  return (
    <SectionCard
      title="Objetos"
      meta="14 itens"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <AwSelect>Tipo: Produtos</AwSelect>
        <div className="flex-1 min-w-[220px]">
          <AwInput placeholder="Buscar produto..." iconLeft="search" />
        </div>
        <AwButton variant="secondary" size="sm" iconLeft="filter_list">
          Filtrar
        </AwButton>
      </div>
      <AwTable>
        <thead>
          <tr>
            <th>Nome</th>
            <th>ID externo</th>
            <th>Importado em</th>
          </tr>
        </thead>
        <tbody>
          {products.map(([name, id]) => (
            <tr key={id}>
              <td className="aw-table__name">{name}</td>
              <td className="aw-table__mono">{id}</td>
              <td className="text-[var(--fg-tertiary)]">2 dias atrás</td>
            </tr>
          ))}
        </tbody>
      </AwTable>
      <div className="mt-3 flex items-center justify-between text-[12px] text-[var(--fg-tertiary)]">
        <span>Mostrando 1–5 de 14</span>
        <span className="inline-flex items-center gap-2">
          <AwButton variant="ghost" size="sm" iconOnly="chevron_left" aria-label="Anterior" />
          <span className="text-[var(--fg-primary)] font-medium">1</span>
          <span>2</span>
          <span>3</span>
          <AwButton variant="ghost" size="sm" iconOnly="chevron_right" aria-label="Próximo" />
        </span>
      </div>
    </SectionCard>
  );
}

/* ----------------------------------------------------------------
 * Tab: Webhooks
 * ---------------------------------------------------------------- */

function WebhooksTab({
  integration,
  instanceId,
}: {
  integration: IntegrationCatalogItem;
  instanceId: string;
}) {
  const url = `https://app.awsales.io/api/webhooks/${integration.id}/${instanceId}`;
  const supported: { name: string; on: boolean }[] = [
    { name: "purchase_completed", on: true },
    { name: "purchase_canceled", on: true },
    { name: "subscription_started", on: true },
    { name: "subscription_canceled", on: true },
    { name: "purchase_refunded", on: false },
    { name: "chargeback", on: false },
  ];

  const events: { time: string; status: number; type: string; id: string }[] = [
    { time: "30/04 10:02", status: 200, type: "purchase_completed", id: "#4321" },
    { time: "30/04 09:51", status: 200, type: "purchase_completed", id: "#4320" },
    { time: "30/04 09:30", status: 422, type: "schema inválido", id: "—" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="URL do webhook">
        <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2">
          <Icon name="link" size={16} />
          <span className="flex-1 truncate font-mono text-[12px] text-[var(--fg-primary)]">
            {url}
          </span>
          <AwButton variant="ghost" size="sm" iconLeft="content_copy">
            Copiar
          </AwButton>
        </div>
      </SectionCard>

      <SectionCard title="Eventos suportados pelo provider">
        <div className="flex flex-wrap gap-2">
          {supported.map((e) => (
            <span
              key={e.name}
              className={
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] " +
                (e.on
                  ? "border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--fg-primary)]"
                  : "border-[var(--border-subtle)] bg-[var(--bg-raised)] text-[var(--fg-tertiary)]")
              }
            >
              {e.on ? (
                <Icon name="check_circle" size={14} />
              ) : (
                <Icon name="circle" size={14} />
              )}
              <span className="font-mono">{e.name}</span>
            </span>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Últimos eventos recebidos">
        <AwTable>
          <thead>
            <tr>
              <th>Quando</th>
              <th>Status</th>
              <th>Tipo</th>
              <th>ID</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.time + e.id}>
                <td className="text-[var(--fg-secondary)]">{e.time}</td>
                <td>
                  <span className="inline-flex items-center gap-1.5">
                    <AwStatusDot
                      variant={e.status < 300 ? "live" : "offline"}
                      size="sm"
                    />
                    <span className="font-mono text-[12px]">{e.status}</span>
                  </span>
                </td>
                <td className="font-mono text-[12px] text-[var(--fg-secondary)]">
                  {e.type}
                </td>
                <td className="text-[var(--fg-tertiary)]">{e.id}</td>
                <td>
                  <AwButton variant="ghost" size="sm">
                    Ver
                  </AwButton>
                </td>
              </tr>
            ))}
          </tbody>
        </AwTable>
        <div className="mt-3">
          <AwButton variant="secondary" size="sm" iconLeft="bolt">
            Enviar evento de teste
          </AwButton>
        </div>
      </SectionCard>
    </div>
  );
}

/* ----------------------------------------------------------------
 * Tab: Tools
 * ---------------------------------------------------------------- */

function ToolsTab({
  integration,
}: {
  integration: IntegrationCatalogItem;
}) {
  const native: {
    name: string;
    desc: string;
    cat: "read" | "write" | "destructive";
    enabled: boolean;
    status: "available" | "missing_scope" | "unsupported";
    exec: number;
  }[] = [
    {
      name: `buscar-produto-${integration.id}`,
      desc: "Busca produto pelo ID",
      cat: "read",
      enabled: true,
      status: "available",
      exec: 324,
    },
    {
      name: "listar-vendas",
      desc: "Lista vendas do produto",
      cat: "read",
      enabled: true,
      status: "available",
      exec: 187,
    },
    {
      name: "buscar-comprador",
      desc: "Busca comprador por email",
      cat: "read",
      enabled: true,
      status: "available",
      exec: 12,
    },
    {
      name: "criar-cupom",
      desc: "Cria cupom de desconto",
      cat: "write",
      enabled: false,
      status: "available",
      exec: 0,
    },
    {
      name: "refund",
      desc: "Estorna compra",
      cat: "destructive",
      enabled: false,
      status: "missing_scope",
      exec: 0,
    },
    {
      name: "assinatura-cancelar",
      desc: "Cancela assinatura · em breve",
      cat: "destructive",
      enabled: false,
      status: "unsupported",
      exec: 0,
    },
  ];

  const custom: { name: string; desc: string; cat: "read" | "write"; exec: number }[] = [
    {
      name: "agendar-especialista",
      desc: "Agenda reunião com especialista",
      cat: "write",
      exec: 89,
    },
    {
      name: "consulta-preco",
      desc: "Consulta preço com regras",
      cat: "read",
      exec: 1247,
    },
  ];

  const enabledCount = native.filter((n) => n.enabled).length;

  return (
    <div className="flex flex-col gap-5">
      <SectionCard
        title={`Tools nativas (${integration.name})`}
        meta={`Habilitadas: ${enabledCount} de ${native.length}`}
      >
        <AwTable>
          <thead>
            <tr>
              <th></th>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th className="aw-table__num">Exec 30d</th>
            </tr>
          </thead>
          <tbody>
            {native.map((n) => (
              <tr
                key={n.name}
                style={n.status !== "available" ? { opacity: 0.6 } : undefined}
              >
                <td>
                  <AwStatusDot
                    variant={
                      n.status === "available"
                        ? "live"
                        : n.status === "missing_scope"
                          ? "attention"
                          : "offline"
                    }
                    size="sm"
                  />
                </td>
                <td className="aw-table__name">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={
                        "inline-flex h-4 w-4 items-center justify-center rounded border " +
                        (n.enabled
                          ? "border-[var(--fg-primary)] bg-[var(--fg-primary)] text-[var(--bg-raised)]"
                          : "border-[var(--border-strong)] bg-[var(--bg-raised)]")
                      }
                    >
                      {n.enabled && <Icon name="check" size={11} />}
                    </span>
                    <span className="font-mono text-[12px]">{n.name}</span>
                  </span>
                </td>
                <td className="text-[var(--fg-tertiary)]">{n.desc}</td>
                <td>
                  <ToolCategoryPill cat={n.cat} />
                </td>
                <td className="aw-table__num">{n.exec}</td>
              </tr>
            ))}
          </tbody>
        </AwTable>
        <p className="mt-3 m-0 text-[11px] italic text-[var(--fg-tertiary)]">
          ● disponível · ◐ scope insuficiente · ○ provider não suporta ainda
        </p>
      </SectionCard>

      <SectionCard
        title="Tools customizadas dessa conexão"
        action={
          <AwButton variant="secondary" size="sm" iconLeft="add">
            Nova Tool HTTP
          </AwButton>
        }
      >
        <AwTable>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th className="aw-table__num">Exec 30d</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {custom.map((c) => (
              <tr key={c.name}>
                <td className="aw-table__name font-mono text-[12px]">{c.name}</td>
                <td className="text-[var(--fg-tertiary)]">{c.desc}</td>
                <td>
                  <ToolCategoryPill cat={c.cat} />
                </td>
                <td className="aw-table__num">{c.exec.toLocaleString("pt-BR")}</td>
                <td>
                  <span className="inline-flex gap-1">
                    <AwButton variant="ghost" size="sm" iconOnly="edit" aria-label="Editar" />
                    <AwButton variant="ghost" size="sm" iconOnly="delete" aria-label="Excluir" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </AwTable>
      </SectionCard>
    </div>
  );
}

function ToolCategoryPill({
  cat,
}: {
  cat: "read" | "write" | "destructive";
}) {
  const map: Record<typeof cat, { variant: "live" | "draft" | "error"; label: string }> = {
    read: { variant: "live", label: "read" },
    write: { variant: "draft", label: "write" },
    destructive: { variant: "error", label: "destrutivo" },
  };
  const { variant, label } = map[cat];
  return (
    <AwPill variant={variant} dot={false}>
      {label}
    </AwPill>
  );
}

/* ----------------------------------------------------------------
 * Tab: Auditoria
 * ---------------------------------------------------------------- */

function AuditTab() {
  const rows: { when: string; who: string; what: React.ReactNode }[] = [
    {
      when: "30/04 09:00",
      who: "PG ~ MambaCult",
      what: (
        <>
          Toggle on em <code>buscar-comprador</code>
        </>
      ),
    },
    {
      when: "29/04 15:42",
      who: "PG ~ MambaCult",
      what: <>Reconectada com novos escopos (+webhooks.recv)</>,
    },
    {
      when: "28/04 11:20",
      who: "PG ~ MambaCult",
      what: (
        <>
          Tool <code>agendar-especialista</code> criada
        </>
      ),
    },
    {
      when: "26/03 10:00",
      who: "PG ~ MambaCult",
      what: <>Conexão criada</>,
    },
  ];

  return (
    <SectionCard title="Auditoria">
      <AwTable>
        <thead>
          <tr>
            <th>Quando</th>
            <th>Quem</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td className="text-[var(--fg-secondary)]">{r.when}</td>
              <td className="text-[var(--fg-secondary)]">{r.who}</td>
              <td>{r.what}</td>
            </tr>
          ))}
        </tbody>
      </AwTable>
    </SectionCard>
  );
}

/* ----------------------------------------------------------------
 * Layout helpers
 * ---------------------------------------------------------------- */

function SectionCard({
  title,
  meta,
  action,
  children,
}: {
  title: string;
  meta?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h2 className="m-0 text-[15px] font-semibold tracking-[-0.005em] text-[var(--fg-primary)]">
            {title}
          </h2>
          {meta && (
            <span className="text-[12px] text-[var(--fg-tertiary)]">{meta}</span>
          )}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function KvList({ rows }: { rows: { k: string; v: React.ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-[160px_1fr] gap-x-6 gap-y-3">
      {rows.map((r) => (
        <div key={r.k} className="contents">
          <dt className="text-[13px] text-[var(--fg-tertiary)]">{r.k}</dt>
          <dd className="m-0">{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}
