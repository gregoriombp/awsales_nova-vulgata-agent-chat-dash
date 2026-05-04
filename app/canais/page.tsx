"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import { AwAddIntegrationModal } from "@/components/ui/AwAddIntegrationModal";
import { AwConnectModal } from "@/components/ui/AwConnectModal";
import { AwInput } from "@/components/ui/AwInput";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import {
  getChannelAccounts,
  type ChannelAccount,
  type ChannelAccountStatus,
} from "@/lib/channelAccounts";
import {
  loadHasEverConnected,
  loadInstances,
  saveHasEverConnected,
  saveInstances,
  type IntegrationInstance,
} from "@/lib/integrationsStore";

const ORG_LOGO_SRC = "/assets/icon_artificial_concord_organization.png";
const ORG_NAME = "Nome da organização";

type AuthMethod = "oauth" | "webhook" | "apiKey";

interface Channel {
  id: string;
  name: string;
  domain: string;
  desc: string;
  auth: AuthMethod;
  permissions?: string[];
  /** Per-channel settings route opened via "Configurar". */
  configHref: string;
}

const CHANNELS: Channel[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    domain: "whatsapp.com",
    desc: "Atenda e recupere vendas via WhatsApp com seus agentes de IA.",
    auth: "oauth",
    permissions: [
      "Enviar e receber mensagens em seu nome",
      "Acessar contatos e conversas ativas",
      "Ler mídias enviadas pelos clientes",
    ],
    configHref: "/canais/whatsapp",
  },
  {
    id: "instagram",
    name: "Instagram",
    domain: "instagram.com",
    desc: "Responda DMs do Instagram automaticamente com agentes.",
    auth: "oauth",
    permissions: [
      "Ler e responder mensagens diretas",
      "Acessar comentários em posts e reels",
      "Ver informações básicas da conta",
    ],
    configHref: "/canais/instagram",
  },
  {
    id: "messenger",
    name: "Messenger",
    domain: "messenger.com",
    desc: "Atendimento automatizado pelo Messenger do Facebook.",
    auth: "oauth",
    permissions: [
      "Ler e responder mensagens da página",
      "Acessar perfis públicos dos clientes",
      "Receber webhooks de novas conversas",
    ],
    configHref: "/canais/messenger",
  },
];

const CHANNEL_IDS = new Set(CHANNELS.map((c) => c.id));

const ADD_MODAL_CATS: { id: string; label: string }[] = [
  { id: "channels", label: "Canais" },
];

const HERO_BRANDS = ["whatsapp", "instagram", "messenger"] as const;

const QUICK_PICKS: { id: string; name: string }[] = [
  { id: "whatsapp", name: "WhatsApp" },
  { id: "instagram", name: "Instagram" },
  { id: "messenger", name: "Messenger" },
];

const STATUS_LABEL: Record<ChannelAccountStatus, string> = {
  active: "Ativo",
  disabled: "Pausado",
  attention: "Requer atenção",
};

const STATUS_PILL_VARIANT: Record<ChannelAccountStatus, AwPillVariant> = {
  active: "live",
  disabled: "draft",
  attention: "beta",
};

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

function ChannelGroup({
  channel,
  accounts,
  collapsed,
  onToggleCollapsed,
  onOpenChannel,
}: {
  channel: Channel;
  accounts: ChannelAccount[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onOpenChannel: () => void;
}) {
  const count = accounts.length;
  const attentionCount = accounts.filter(
    (a) => a.status === "attention",
  ).length;

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <header className="flex items-center gap-3 px-5 py-4">
        <AwBrandLogo brand={channel.id} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold tracking-[-0.005em] text-[var(--fg-primary)]">
              {channel.name}
            </span>
            <span className="text-[13px] text-[var(--fg-secondary)]">
              · {count} {count === 1 ? "conta" : "contas"}
            </span>
            {attentionCount > 0 && (
              <AwPill variant="beta">
                {attentionCount}{" "}
                {attentionCount === 1 ? "alerta" : "alertas"}
              </AwPill>
            )}
          </div>
          <p className="m-0 mt-0.5 truncate text-[13px] text-[var(--fg-secondary)]">
            {channel.desc}
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1.5">
          <AwButton
            variant="secondary"
            size="sm"
            iconRight="arrow_forward"
            onClick={onOpenChannel}
          >
            Gerenciar
          </AwButton>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--fg-secondary)] transition-colors hover:bg-[var(--bg-canvas)]"
            aria-label={collapsed ? "Expandir contas" : "Recolher contas"}
            aria-expanded={!collapsed}
          >
            <Icon
              name="expand_more"
              size={20}
              className={
                collapsed
                  ? "transition-transform"
                  : "rotate-180 transition-transform"
              }
            />
          </button>
        </div>
      </header>

      {!collapsed && (
        <ul className="m-0 list-none border-t border-[var(--border-subtle)] p-0">
          {accounts.map((account, idx) => (
            <li
              key={account.id}
              className={
                "flex items-center gap-3 px-5 py-3 transition-colors hover:bg-[var(--bg-canvas)] " +
                (idx === 0 ? "" : "border-t border-[var(--border-subtle)]")
              }
            >
              <span
                aria-hidden="true"
                className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[var(--bg-canvas)] text-[var(--fg-secondary)]"
              >
                <Icon name="account_circle" size={20} />
              </span>
              <button
                type="button"
                onClick={onOpenChannel}
                className="flex min-w-0 flex-1 flex-col items-start text-left"
              >
                <span className="text-[14px] font-medium text-[var(--fg-primary)] hover:underline underline-offset-2">
                  {account.name}
                </span>
                {account.subtitle && (
                  <span className="m-0 mt-0.5 truncate text-[12.5px] text-[var(--fg-secondary)]">
                    {account.subtitle}
                  </span>
                )}
              </button>
              <AwPill variant={STATUS_PILL_VARIANT[account.status]}>
                {account.statusLabel ?? STATUS_LABEL[account.status]}
              </AwPill>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

type EmptyVariant = "populated" | "all-removed" | "first-run";

export default function CanaisPage() {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [connectId, setConnectId] = useState<string | null>(null);
  const [instances, setInstances] = useState<IntegrationInstance[]>([]);
  const [hasEverConnected, setHasEverConnected] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

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

  const channelInstances = instances.filter((i) =>
    CHANNEL_IDS.has(i.integrationId),
  );

  const connectTarget = connectId
    ? CHANNELS.find((i) => i.id === connectId) ?? null
    : null;

  const breadcrumbs = [
    { label: "Canais", icon: <Icon name="forum" size={20} /> },
  ];

  const closeConnect = () => setConnectId(null);

  /** WhatsApp owns a multi-step WABA wizard instead of the generic
   *  Connect modal. Every entry point must funnel through here. */
  const handleConnect = (id: string) => {
    if (id === "whatsapp") {
      router.push("/setup/whatsapp/1");
      return;
    }
    setConnectId(id);
  };

  const variant: EmptyVariant =
    channelInstances.length > 0
      ? "populated"
      : hasEverConnected
        ? "all-removed"
        : "first-run";

  /** Build the per-channel groups for the populated view. A channel
   *  shows up only when there's an integration instance for it (i.e.
   *  the user "connected" it), and its children come from the shared
   *  channel-account dataset — which mirrors the WABA rail inside
   *  /canais/whatsapp and equivalents. The search term filters by
   *  account name, account subtitle, or channel name. */
  const connectedChannelIds = useMemo(
    () => new Set(channelInstances.map((i) => i.integrationId)),
    [channelInstances],
  );

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CHANNELS.filter((c) => connectedChannelIds.has(c.id))
      .map((channel) => {
        const all = getChannelAccounts(channel.id);
        const accounts = !q
          ? all
          : all.filter(
              (a) =>
                a.name.toLowerCase().includes(q) ||
                a.subtitle?.toLowerCase().includes(q) ||
                channel.name.toLowerCase().includes(q),
            );
        return { channel, accounts };
      })
      .filter((g) => g.accounts.length > 0);
  }, [connectedChannelIds, search]);

  const totalAfterSearch = groups.reduce(
    (sum, g) => sum + g.accounts.length,
    0,
  );

  const toggleGroupCollapsed = (channelId: string) =>
    setCollapsed((c) => ({ ...c, [channelId]: !c[channelId] }));

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
            <header className="mb-10 flex items-end justify-between gap-6 border-b border-[var(--border-subtle)] pb-6">
              <div>
                <h1 className="m-0 mb-1.5 flex items-center gap-2.5 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--fg-primary)]">
                  <Icon name="forum" size={28} />
                  Canais
                </h1>
                <p className="m-0 max-w-[560px] text-sm leading-[1.5] text-[var(--fg-secondary)]">
                  Conecte os canais por onde seus agentes vão conversar com
                  clientes — WhatsApp, Instagram, Messenger e mais.
                </p>
              </div>
              <div className="flex flex-shrink-0 gap-2">
                <AwButton
                  variant="primary"
                  size="md"
                  iconLeft="add"
                  onClick={() => setAddOpen(true)}
                >
                  Novo canal
                </AwButton>
              </div>
            </header>

            {variant === "populated" ? (
              <section aria-label="Seus canais">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="m-0 text-[16px] font-semibold tracking-[-0.005em] text-[var(--fg-primary)]">
                    Seus canais
                  </h2>
                  <div className="w-full max-w-[320px]">
                    <AwInput
                      iconLeft="search"
                      placeholder="Buscar por canal ou conta…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      aria-label="Buscar canais"
                    />
                  </div>
                </div>

                {totalAfterSearch === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] px-6 py-10 text-center">
                    <p className="m-0 text-[14px] text-[var(--fg-secondary)]">
                      Nenhum canal ou conta encontrado para
                      {" "}
                      <strong className="text-[var(--fg-primary)]">
                        “{search}”
                      </strong>
                      .
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {groups.map((g) => (
                      <ChannelGroup
                        key={g.channel.id}
                        channel={g.channel}
                        accounts={g.accounts}
                        collapsed={!!collapsed[g.channel.id]}
                        onToggleCollapsed={() =>
                          toggleGroupCollapsed(g.channel.id)
                        }
                        onOpenChannel={() => router.push(g.channel.configHref)}
                      />
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <section
                aria-label="Você não tem canais conectados"
                className="flex flex-col items-center rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)] px-8 py-14 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg-canvas)] text-[var(--fg-secondary)]">
                  <Icon name="link_off" size={24} />
                </div>
                <h2 className="m-0 mt-5 text-[20px] font-semibold tracking-[-0.01em] text-[var(--fg-primary)]">
                  Você não tem canais conectados
                </h2>
                <p className="m-0 mt-2 max-w-[420px] text-[14px] leading-[1.55] text-[var(--fg-secondary)]">
                  Reconecte um canal ou abra o catálogo para escolher por
                  onde os agentes vão atender.
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
                  Ver todos os canais
                </button>
              </section>
            )}
          </div>
        </div>
      ) : (
        <div className="-m-8 flex min-h-full items-center justify-center bg-[var(--bg-canvas)] px-10 py-16">
          <section
            aria-label="Conecte seu primeiro canal"
            className="w-full max-w-[760px]"
          >
            <div className="flex items-center justify-center gap-5">
              {HERO_BRANDS.map((b) => (
                <AwBrandLogo key={b} brand={b} size="lg" />
              ))}
            </div>

            <div className="mt-10 flex flex-col items-center text-center">
              <h2 className="m-0 max-w-[520px] text-[28px] font-semibold leading-[1.2] tracking-[-0.02em] text-[var(--fg-primary)]">
                Conecte seu primeiro canal
              </h2>
              <p className="m-0 mt-3 max-w-[480px] text-[14px] leading-[1.55] text-[var(--fg-secondary)]">
                WhatsApp, Instagram, Messenger… escolha por onde seus
                agentes vão conversar com seus clientes.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              <AwButton
                variant="primary"
                size="md"
                iconLeft="add"
                onClick={() => setAddOpen(true)}
              >
                Novo canal
              </AwButton>
              <AwButton
                variant="secondary"
                size="md"
                onClick={() => setAddOpen(true)}
              >
                Ver todos os canais
              </AwButton>
            </div>

            <div className="mt-10 mb-5 flex items-center gap-3 text-[12px] text-[var(--fg-tertiary)]">
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-[var(--border-subtle)]"
              />
              <span>ou comece pelos mais usados</span>
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-[var(--border-subtle)]"
              />
            </div>

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

      <AwAddIntegrationModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        categories={ADD_MODAL_CATS}
        items={CHANNELS.map((c) => ({
          id: c.id,
          brand: c.id,
          name: c.name,
          description: c.desc,
          category: "channels",
        }))}
        onSelect={(id) => {
          setAddOpen(false);
          handleConnect(id);
        }}
      />

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
            ? `https://app.awsales.io/canais/${connectTarget.id}/callback`
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
