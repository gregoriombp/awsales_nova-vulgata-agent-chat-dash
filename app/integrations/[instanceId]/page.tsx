"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import { AwPill } from "@/components/ui/AwPill";
import { AwInput } from "@/components/ui/AwInput";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwModal } from "@/components/ui/AwModal";
import { AwStatusDot } from "@/components/ui/AwStatusDot";
import { AwTable } from "@/components/ui/AwTable";
import { AwToggle } from "@/components/ui/AwToggle";
import { useToast } from "@/components/ui/AwToast";
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
  { id: "tools", label: "Habilidades" },
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

  const toast = useToast();
  const [hydrated, setHydrated] = useState(false);
  const [instances, setInstances] = useState<IntegrationInstance[]>([]);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [selectedAccount, setSelectedAccount] = useState(0);
  const [disconnectOpen, setDisconnectOpen] = useState(false);

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
                integration={integration}
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
                onTogglePause={() => {
                  const willPause = instance.active;
                  updateInstance((i) => ({
                    ...i,
                    active: !i.active,
                    needsAttention: willPause ? i.needsAttention : false,
                  }));
                  toast.push({
                    title: willPause
                      ? "Integração pausada"
                      : "Integração ativada",
                    variant: willPause ? "warning" : "success",
                  });
                }}
                onReconnect={() => {
                  updateInstance((i) => ({ ...i, active: true, needsAttention: false }));
                  toast.push({
                    title: "Reconexão simulada",
                    description: "No protótipo isso só limpa o estado de erro.",
                    variant: "success",
                  });
                }}
                onTest={() => {
                  toast.push({
                    title: "Teste enviado",
                    description: "Resposta esperada em alguns segundos.",
                    variant: "info",
                  });
                }}
                onCopyId={() => {
                  navigator.clipboard
                    ?.writeText(instance.instanceId)
                    .then(() =>
                      toast.push({
                        title: "ID copiado",
                        description: instance.instanceId,
                        variant: "success",
                      }),
                    )
                    .catch(() =>
                      toast.push({
                        title: "Não foi possível copiar",
                        variant: "error",
                      }),
                    );
                }}
                onDisconnect={() => setDisconnectOpen(true)}
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

              {/* Tabs + content */}
              <div>
                <div className="border-b border-[var(--border-subtle)]">
                  <TabBar value={activeTab} onChange={setActiveTab} />
                </div>
                <div className="pt-6">
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

      <AwModal
        open={disconnectOpen}
        onClose={() => setDisconnectOpen(false)}
        title={`Desconectar ${integration.name} · ${instance.name}?`}
        footer={
          <>
            <AwButton
              variant="secondary"
              size="md"
              onClick={() => setDisconnectOpen(false)}
            >
              Cancelar
            </AwButton>
            <AwButton
              variant="danger"
              size="md"
              iconLeft="link_off"
              onClick={() => {
                const next = instances.filter(
                  (i) => i.instanceId !== instance.instanceId,
                );
                saveInstances(next);
                setInstances(next);
                setDisconnectOpen(false);
                toast.push({
                  title: "Conexão desconectada",
                  description: `${integration.name} · ${instance.name}`,
                  variant: "success",
                });
                router.push("/integrations");
              }}
            >
              Desconectar
            </AwButton>
          </>
        }
      >
        <p className="m-0 body-sm text-[var(--fg-secondary)]">
          Os agentes que usam essa conexão vão perder acesso aos dados
          do {integration.name} imediatamente. Você pode reconectar
          depois a qualquer momento.
        </p>
      </AwModal>
    </DashboardLayout>
  );
}

/* ----------------------------------------------------------------
 * Connections sidebar
 * ---------------------------------------------------------------- */

function ConnectionsSidebar({
  accounts,
  integration,
  selectedIndex,
  onSelect,
  onAddAccount,
}: {
  accounts: ConnectionAccount[];
  integration: IntegrationCatalogItem;
  selectedIndex: number;
  onSelect: (i: number) => void;
  onAddAccount: () => void;
}) {
  return (
    <aside className="w-[260px] flex-shrink-0">
      <div className="px-1 pb-2 pt-1 aw-eyebrow text-[var(--fg-tertiary)]">
        {accounts.length} conexões
      </div>
      <ul className="flex flex-col gap-1">
        {accounts.map((a, i) => {
          const active = i === selectedIndex;
          const dotVariant =
            a.health === "healthy"
              ? "live"
              : a.health === "degraded"
                ? "attention"
                : "offline";
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                className={
                  "flex w-full items-center gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2 text-left transition-colors " +
                  (active
                    ? "bg-[var(--bg-raised)] ring-1 ring-[var(--border-strong)]"
                    : "hover:bg-[var(--bg-raised)]")
                }
              >
                <span className="relative inline-flex flex-shrink-0">
                  <AwBrandLogo brand={integration.id} size="sm" bare />
                  <AwStatusDot variant={dotVariant} size="sm" ring absolute />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate body-xs font-medium text-[var(--fg-primary)]">
                    {a.name}
                  </div>
                  <div className="body-xs text-[var(--fg-tertiary)]">
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
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-dashed border-[var(--border-subtle)] px-2.5 py-2 body-xs font-medium text-[var(--fg-secondary)] transition-colors hover:bg-[var(--bg-raised)] hover:text-[var(--fg-primary)]"
      >
        <Icon name="add" size={14} />
        Adicionar conta
      </button>
    </aside>
  );
}

/* ----------------------------------------------------------------
 * Header
 * ---------------------------------------------------------------- */

function DetailHeader({
  integration,
  account,
  onTogglePause,
  onReconnect,
  onTest,
  onCopyId,
  onDisconnect,
}: {
  integration: IntegrationCatalogItem;
  account: ConnectionAccount;
  onTogglePause: () => void;
  onReconnect: () => void;
  onTest: () => void;
  onCopyId: () => void;
  onDisconnect: () => void;
}) {
  const status: { variant: "live" | "draft" | "error"; label: string } =
    !account.active
      ? { variant: "error", label: "inativo" }
      : account.health === "down"
        ? { variant: "error", label: "com erro" }
        : account.health === "degraded"
          ? { variant: "draft", label: "atenção" }
          : { variant: "live", label: "ativo" };

  const paused = !account.active;

  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <AwBrandLogo
          brand={integration.id}
          size="lg"
          bare
          style={{ width: 64, height: 64, borderRadius: 14 }}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h5 className="m-0 truncate text-[var(--fg-primary)]">
              {integration.name} · {account.name}
            </h5>
            <AwPill variant={status.variant}>{status.label}</AwPill>
          </div>
          <p className="m-0 mt-0.5 body-xs text-[var(--fg-tertiary)]">
            {CATEGORY_LABELS[integration.cat]} · {AUTH_LABELS[integration.auth]}
          </p>
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <AwButton
          variant="secondary"
          size="sm"
          iconLeft={paused ? "play_arrow" : "pause"}
          onClick={onTogglePause}
        >
          {paused ? "Ativar integração" : "Pausar integração"}
        </AwButton>
        <AwButton
          variant="secondary"
          size="sm"
          iconLeft="bolt"
          onClick={onTest}
        >
          Testar
        </AwButton>
        <AwDropdownMenu
          aria-label="Mais ações da integração"
          trigger={
            <AwButton
              variant="ghost"
              size="sm"
              iconOnly="more_horiz"
              aria-label="Mais ações"
              title="Mais ações"
            />
          }
          items={[
            {
              id: "reconnect",
              icon: "link",
              label: "Reconectar",
              onSelect: onReconnect,
            },
            {
              id: "copy-id",
              icon: "content_copy",
              label: "Copiar ID da conexão",
              onSelect: onCopyId,
            },
            { id: "sep", separator: true },
            {
              id: "disconnect",
              icon: "link_off",
              label: "Desconectar",
              danger: true,
              onSelect: onDisconnect,
            },
          ]}
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
              "relative px-4 py-3 body-xs font-medium transition-colors " +
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
                <span className="inline-flex items-center gap-2 body-xs text-[var(--fg-secondary)]">
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
                <span className="body-xs text-[var(--fg-secondary)]">
                  {account.lastEvent} (compra criada · #4321)
                </span>
              ),
            },
            {
              k: "Eventos hoje",
              v: <span className="body-xs text-[var(--fg-secondary)]">127</span>,
            },
            {
              k: "Conectada em",
              v: (
                <span className="body-xs text-[var(--fg-secondary)]">
                  {account.connectedOn}
                </span>
              ),
            },
            {
              k: "Habilidades ativas",
              v: (
                <span className="body-xs text-[var(--fg-secondary)]">
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

type PermissionMode = "read_write" | "read" | "forbidden";

const PERMISSION_OPTIONS: {
  id: PermissionMode;
  icon: string;
  label: string;
}[] = [
  { id: "read_write", icon: "check_circle", label: "Leitura e escrita" },
  { id: "read", icon: "front_hand", label: "Somente leitura" },
  { id: "forbidden", icon: "block", label: "Proibido" },
];

function PermissionsTab({
  integration,
}: {
  integration: IntegrationCatalogItem;
}) {
  const initialScopes: {
    label: string;
    desc: string;
    mode: PermissionMode;
  }[] = useMemo(
    () =>
      integration.auth === "webhook"
        ? [
            {
              label: "Webhooks",
              desc: "Eventos que o provider dispara em tempo real (compras, reembolsos, atualizações).",
              mode: "read" as PermissionMode,
            },
          ]
        : [
            {
              label: "Produtos",
              desc: "Catálogo, preços, disponibilidade e variações dos seus produtos.",
              mode: "read_write",
            },
            {
              label: "Compradores",
              desc: "Nome, e-mail, telefone e histórico de quem comprou.",
              mode: "read",
            },
            {
              label: "Cupons",
              desc: "Códigos de desconto, regras de validade e limites de uso.",
              mode: "read_write",
            },
            {
              label: "Transações",
              desc: "Pagamentos, reembolsos, chargebacks e status financeiros.",
              mode: "read",
            },
            {
              label: "Webhooks",
              desc: "Eventos enviados pelo provider em tempo real para o agente reagir.",
              mode: "read",
            },
          ],
    [integration.auth],
  );

  const [scopes, setScopes] = useState(initialScopes);

  const setMode = (label: string, mode: PermissionMode) => {
    setScopes((list) =>
      list.map((s) => (s.label === label ? { ...s, mode } : s)),
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="Escopos concedidos">
        <ul className="flex flex-col">
          {scopes.map((s, idx) => (
            <li
              key={s.label}
              className={
                "flex items-start justify-between gap-4 py-3 " +
                (idx > 0 ? "border-t border-[var(--border-subtle)]" : "")
              }
            >
              <div className="min-w-0 flex-1">
                <div className="body-xs font-medium text-[var(--fg-primary)]">
                  {s.label}
                </div>
                <p className="m-0 mt-0.5 body-xs text-[var(--fg-tertiary)]">
                  {s.desc}
                </p>
              </div>
              <PermissionMenu
                value={s.mode}
                onChange={(m) => setMode(s.label, m)}
              />
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <AwButton variant="secondary" size="sm" iconLeft="lock_open">
            Reconectar com mais escopos
          </AwButton>
        </div>
      </SectionCard>
    </div>
  );
}

function PermissionMenu({
  value,
  onChange,
}: {
  value: PermissionMode;
  onChange: (mode: PermissionMode) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current =
    PERMISSION_OPTIONS.find((o) => o.id === value) ?? PERMISSION_OPTIONS[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-8 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 body-xs text-[var(--fg-primary)] transition-colors hover:bg-[var(--bg-raised)]"
      >
        <Icon name={current.icon} size={16} />
        <span>{current.label}</span>
        <Icon
          name="expand_more"
          size={16}
          className="text-[var(--fg-tertiary)]"
        />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 min-w-[200px] overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] py-1 shadow-lg"
        >
          {PERMISSION_OPTIONS.map((opt) => {
            const active = opt.id === value;
            return (
              <button
                key={opt.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={
                  "flex w-full items-center gap-2 px-3 py-2 text-left body-xs transition-colors hover:bg-[var(--bg-canvas)] " +
                  (active
                    ? "text-[var(--fg-primary)]"
                    : "text-[var(--fg-secondary)]")
                }
              >
                <Icon name={opt.icon} size={16} />
                <span className="flex-1">{opt.label}</span>
                {active && <Icon name="check" size={14} />}
              </button>
            );
          })}
        </div>
      )}
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
        <p className="m-0 body-xs text-[var(--fg-secondary)]">
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
      <div className="mt-3 flex items-center justify-between body-xs text-[var(--fg-tertiary)]">
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

  type WebhookEvent = {
    time: string;
    status: number;
    type: string;
    id: string;
  };

  const [events, setEvents] = useState<WebhookEvent[]>([
    { time: "30/04 10:02", status: 200, type: "purchase_completed", id: "#4321" },
    { time: "30/04 09:51", status: 200, type: "purchase_completed", id: "#4320" },
    { time: "30/04 09:30", status: 422, type: "schema inválido", id: "—" },
  ]);
  const [sending, setSending] = useState(false);
  const testCounterRef = useRef(0);
  const toast = useToast();

  const handleSendTestEvent = () => {
    if (sending) return;
    setSending(true);
    window.setTimeout(() => {
      testCounterRef.current += 1;
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const testId = `#test-${String(testCounterRef.current).padStart(4, "0")}`;
      const event: WebhookEvent = {
        time: `${pad(now.getDate())}/${pad(now.getMonth() + 1)} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
        status: 200,
        type: "purchase_completed",
        id: testId,
      };
      setEvents((list) => [event, ...list]);
      setSending(false);
      toast.push({
        variant: "success",
        title: "Evento de teste entregue",
        description: `200 OK · ${testId}`,
        duration: 4000,
      });
    }, 1100);
  };

  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="URL do webhook">
        <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2">
          <Icon name="link" size={16} />
          <span className="flex-1 truncate mono-sm text-[var(--fg-primary)]">
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
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 body-xs " +
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
              <code className="mono">{e.name}</code>
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
                    <span className="mono-sm">{e.status}</span>
                  </span>
                </td>
                <td className="mono-sm text-[var(--fg-secondary)]">
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
          <AwButton
            variant="secondary"
            size="sm"
            iconLeft="bolt"
            loading={sending}
            onClick={handleSendTestEvent}
          >
            {sending ? "Enviando…" : "Enviar evento de teste"}
          </AwButton>
        </div>
      </SectionCard>
    </div>
  );
}

/* ----------------------------------------------------------------
 * Tab: Tools
 * ---------------------------------------------------------------- */

type ToolCat = "read" | "write" | "destructive";

type ToolStatus = "available" | "missing_scope" | "unsupported";

interface ToolRow {
  name: string;
  desc: string;
  cat: ToolCat;
  agents: string[];
  exec: number;
  enabled?: boolean;
  status?: ToolStatus;
}

const TOOL_CAT_ICON: Record<ToolCat, string> = {
  read: "search",
  write: "bolt",
  destructive: "delete_sweep",
};

const TOOL_CAT_PERMISSION: Record<ToolCat, string> = {
  read: "Somente leitura",
  write: "Leitura e escrita",
  destructive: "Leitura e escrita",
};

function ToolsTab({
  integration,
}: {
  integration: IntegrationCatalogItem;
}) {
  const router = useRouter();
  const [openTool, setOpenTool] = useState<ToolRow | null>(null);
  const [nativeTools, setNativeTools] = useState<ToolRow[]>(() => [
    {
      name: `buscar-produto-${integration.id}`,
      desc: "Busca produto pelo ID",
      cat: "read",
      agents: ["FAQ", "Pré-venda"],
      exec: 324,
      enabled: true,
      status: "available",
    },
    {
      name: "listar-vendas",
      desc: "Lista vendas do produto",
      cat: "read",
      agents: ["Pré-venda"],
      exec: 187,
      enabled: true,
      status: "available",
    },
    {
      name: "buscar-comprador",
      desc: "Busca comprador por email",
      cat: "read",
      agents: ["FAQ"],
      exec: 12,
      enabled: true,
      status: "available",
    },
    {
      name: "criar-cupom",
      desc: "Cria cupom de desconto",
      cat: "write",
      agents: [],
      exec: 0,
      enabled: false,
      status: "available",
    },
    {
      name: "refund",
      desc: "Estorna compra",
      cat: "destructive",
      agents: [],
      exec: 0,
      enabled: false,
      status: "missing_scope",
    },
    {
      name: "assinatura-cancelar",
      desc: "Cancela assinatura · em breve",
      cat: "destructive",
      agents: [],
      exec: 0,
      enabled: false,
      status: "unsupported",
    },
  ]);

  const custom: ToolRow[] = [
    {
      name: "agendar-especialista",
      desc: "Agenda reunião com especialista",
      cat: "write",
      agents: ["Pré-venda", "SDR"],
      exec: 89,
    },
    {
      name: "consulta-preco",
      desc: "Consulta preço com regras",
      cat: "read",
      agents: ["FAQ", "Pré-venda", "Retenção"],
      exec: 1247,
    },
  ];

  const enabledCount = nativeTools.filter((n) => n.enabled).length;

  const toggleNative = (name: string, next: boolean) => {
    setNativeTools((list) =>
      list.map((n) => (n.name === name ? { ...n, enabled: next } : n)),
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <SectionCard
        title={`Habilidades nativas (${integration.name})`}
        meta={`Habilitadas: ${enabledCount} de ${nativeTools.length}`}
      >
        <AwTable>
          <thead>
            <tr>
              <th>Habilidade</th>
              <th>Agentes</th>
              <th>Permissão</th>
              <th className="aw-table__num">Exec 30d</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {nativeTools.map((n) => {
              const locked = n.status !== "available";
              return (
                <tr
                  key={n.name}
                  style={locked ? { opacity: 0.6 } : undefined}
                >
                  <td>
                    <ToolNameCell tool={n} onClick={() => setOpenTool(n)} />
                  </td>
                  <td>
                    <ToolAgentsCell agents={n.agents} />
                  </td>
                  <td className="body-xs text-[var(--fg-secondary)]">
                    {TOOL_CAT_PERMISSION[n.cat]}
                  </td>
                  <td className="aw-table__num">{n.exec}</td>
                  <td>
                    <AwToggle
                      checked={!!n.enabled}
                      onChange={(v) => toggleNative(n.name, v)}
                      disabled={locked}
                      label={`Ativar ${n.name}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </AwTable>
        <p className="mt-3 m-0 body-xs italic text-[var(--fg-tertiary)]">
          Habilidades desabilitadas estão com escopo insuficiente ou
          não são suportadas pelo provider ainda.
        </p>
      </SectionCard>

      <SectionCard
        title="Habilidades customizadas dessa conexão"
        action={
          <AwButton variant="secondary" size="sm" iconLeft="add">
            Nova habilidade HTTP
          </AwButton>
        }
      >
        <AwTable>
          <thead>
            <tr>
              <th>Habilidade</th>
              <th>Agentes</th>
              <th>Permissão</th>
              <th className="aw-table__num">Exec 30d</th>
            </tr>
          </thead>
          <tbody>
            {custom.map((c) => (
              <tr key={c.name}>
                <td>
                  <ToolNameCell tool={c} onClick={() => setOpenTool(c)} />
                </td>
                <td>
                  <ToolAgentsCell agents={c.agents} />
                </td>
                <td className="body-xs text-[var(--fg-secondary)]">
                  {TOOL_CAT_PERMISSION[c.cat]}
                </td>
                <td className="aw-table__num">
                  {c.exec.toLocaleString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </AwTable>
      </SectionCard>

      <ToolDetailModal
        tool={openTool}
        onClose={() => setOpenTool(null)}
        onGoToTools={() => {
          setOpenTool(null);
          router.push("/tools");
        }}
      />
    </div>
  );
}

function ToolNameCell({
  tool,
  onClick,
}: {
  tool: ToolRow;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-start gap-3 text-left"
    >
      <span
        className="mt-0.5 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-surface)] text-[var(--fg-secondary)]"
      >
        <Icon name={TOOL_CAT_ICON[tool.cat]} size={16} />
      </span>
      <span className="min-w-0 flex flex-col">
        <span className="mono-sm font-medium text-[var(--fg-primary)] group-hover:underline">
          {tool.name}
        </span>
        <span className="body-xs text-[var(--fg-tertiary)]">
          {tool.desc}
        </span>
      </span>
    </button>
  );
}

function ToolAgentsCell({ agents }: { agents: string[] }) {
  if (agents.length === 0) {
    return (
      <span className="body-xs italic text-[var(--fg-tertiary)]">
        nenhum
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {agents.map((a) => (
        <span
          key={a}
          className="inline-flex items-center rounded-full bg-[var(--bg-surface)] px-2 py-0.5 body-xs font-medium text-[var(--fg-secondary)]"
        >
          {a}
        </span>
      ))}
    </div>
  );
}

function ToolDetailModal({
  tool,
  onClose,
  onGoToTools,
}: {
  tool: ToolRow | null;
  onClose: () => void;
  onGoToTools: () => void;
}) {
  return (
    <AwModal
      open={!!tool}
      onClose={onClose}
      title="Configuração de tool"
      footer={
        <div className="flex w-full justify-end gap-2">
          <AwButton variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton
            variant="primary"
            size="sm"
            iconLeft="open_in_new"
            onClick={onGoToTools}
          >
            Abrir em Habilidades
          </AwButton>
        </div>
      }
    >
      {tool && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-surface)] text-[var(--fg-secondary)]">
              <Icon name={TOOL_CAT_ICON[tool.cat]} size={18} />
            </span>
            <div className="min-w-0">
              <div className="mono-sm font-medium text-[var(--fg-primary)]">
                {tool.name}
              </div>
              <div className="body-xs text-[var(--fg-tertiary)]">
                {tool.desc}
              </div>
            </div>
          </div>
          <p className="m-0 body-xs text-[var(--fg-secondary)]">
            Aqui na integração você só vê o status da habilidade. Para
            mudar comportamento, parâmetros ou autenticação, abra a
            página <strong>Habilidades</strong> — é lá que mora a
            configuração.
          </p>
        </div>
      )}
    </AwModal>
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
          <h6 className="m-0 body-sm font-medium text-[var(--fg-primary)]">
            {title}
          </h6>
          {meta && (
            <span className="body-xs text-[var(--fg-tertiary)]">{meta}</span>
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
          <dt className="body-xs text-[var(--fg-tertiary)]">{r.k}</dt>
          <dd className="m-0">{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}
