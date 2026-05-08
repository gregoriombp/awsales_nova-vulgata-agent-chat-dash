"use client";

/* ----------------------------------------------------------------
 * Tools — agent capability inventory.
 *
 * Each "tool" is a single callable action exposed by an integration.
 * Connecting Hotmart auths the brand once; this page lists every
 * action the agent can call as a result (search a transaction, refund
 * a payment, etc). Custom tools are user-defined HTTP endpoints.
 *
 * The page only surfaces native tools whose owning integration is
 * connected and active in localStorage — disconnect Stripe and the
 * Stripe pack vanishes from the inventory. The empty hero invites
 * users to /integrations when nothing is connected yet.
 * ---------------------------------------------------------------- */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwInput, AwField } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwTabs } from "@/components/ui/AwTabs";
import { AwToggle } from "@/components/ui/AwToggle";
import {
  AwEmpty,
  AwEmptyContent,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty";
import { Icon } from "@/components/ui/Icon";
import {
  loadInstances,
  type IntegrationInstance,
} from "@/lib/integrationsStore";
import {
  findIntegration,
  type IntegrationCatalogItem,
} from "@/lib/integrationsCatalog";
import {
  KIND_LABELS,
  KIND_PILL_VARIANT,
  TOOLS_CATALOG,
  type CatalogTool,
  type ToolKind,
  type ToolParam,
} from "@/lib/toolsCatalog";
import {
  agentsUsingCount,
  lastRunLabel,
  loadCustom,
  loadDisabled,
  saveCustom,
  saveDisabled,
  type CustomTool,
  type CustomToolMethod,
} from "@/lib/toolsStore";

const CHANNEL_IDS = new Set(["whatsapp", "instagram", "messenger"]);

type TabValue = "all" | "native" | "custom";

/** Small native select wrapped in the aw-input chrome — gives us a real
 *  controlled <select> with the same focus ring and surface treatment as
 *  the rest of the form controls. AwSelect in the registry is decorative
 *  only, so we keep this local to the page rather than fighting it. */
function InlineSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  options: { value: string; label: string }[];
  ariaLabel?: string;
}) {
  return (
    <div className="aw-input" style={{ paddingRight: 6 }}>
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          border: 0,
          outline: 0,
          background: "transparent",
          font: "400 14px/1.4 var(--font-sans)",
          color: "var(--fg-primary)",
          appearance: "none",
          paddingRight: 22,
          cursor: "pointer",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon
        name="expand_more"
        size={18}
        className="text-[var(--fg-tertiary)]"
        style={{ marginLeft: -22, pointerEvents: "none" }}
      />
    </div>
  );
}

/** Unified row model. Both native tools and custom tools render through
 *  the same row component, so a `RowTool` is the lowest-common-denominator
 *  shape consumed by the list — the page maps both sources into it. */
interface RowTool {
  id: string;
  name: string;
  description: string;
  kind: ToolKind;
  icon: string;
  /** Brand id when the tool comes from an integration; null for custom. */
  brand: string | null;
  /** Which group the row belongs to. Instance id for native (so two
   *  Hotmarts each own their own pack), or "custom" for custom tools. */
  groupId: string;
  /** Connected instance the row belongs to. Null for custom tools. */
  instanceId: string | null;
  instanceName: string | null;
  /** Optional native catalog reference for the detail panel. */
  catalog?: CatalogTool;
  /** Optional custom tool reference for the detail panel. */
  custom?: CustomTool;
}

/* ----------------------------------------------------------------
 * ToolRow — single row inside a pack. Renders both native and custom
 * tools through the same shape so the list stays visually coherent.
 *
 * The whole row is clickable (opens the detail modal); the toggle and
 * the trailing menu stop propagation so they do not also fire the row.
 * ---------------------------------------------------------------- */

function ToolRow({
  row,
  enabled,
  onToggle,
  onOpen,
  onDelete,
  query,
}: {
  row: RowTool;
  enabled: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onDelete?: () => void;
  query: string;
}) {
  const dimmed = !enabled;

  /* div + role=button instead of a real button so nested interactive
   * controls (toggle, delete) stay valid HTML and keyboard activation
   * works through the same Enter/Space handler. The visual rhythm is
   * deliberately minimal: brand tile + name + description, with the
   * kind chip and toggle living quietly to the right and only revealing
   * themselves on hover. The detail modal carries the rest of the
   * metadata (agents using, last run, params) so the row stays calm. */
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={
        "flex w-full cursor-pointer items-center gap-3 px-6 py-3.5 text-left transition-colors hover:bg-[var(--aw-blue-100)] focus:outline-none focus-visible:bg-[var(--aw-blue-100)] " +
        (dimmed ? "opacity-55" : "")
      }
    >
      {/* Tool icon — the semantic Material symbol from the catalog. The
       * brand logo lives only on the pack header so we don't repeat it
       * on every row. The container reserves a fixed slot so names
       * align across rows even when the icon glyph differs in width. */}
      <div
        className="flex flex-shrink-0 items-center justify-center text-[var(--fg-secondary)]"
        style={{ width: 28, height: 28 }}
      >
        <Icon name={row.icon} size={20} />
      </div>

      {/* Name + description — the row's whole signal. */}
      <div className="min-w-0 flex-1">
        <Highlight
          text={row.name}
          query={query}
          className="block truncate text-[14px] font-semibold tracking-[-0.005em] text-[var(--fg-primary)]"
        />
        <Highlight
          text={row.description}
          query={query}
          className="mt-0.5 block truncate text-[12.5px] leading-[1.45] text-[var(--fg-tertiary)]"
        />
      </div>

      {/* Kind pill — always visible. */}
      <div className="hidden flex-shrink-0 md:block">
        <AwPill variant={KIND_PILL_VARIANT[row.kind]} dot={false}>
          {KIND_LABELS[row.kind]}
        </AwPill>
      </div>

      {/* Toggle — always visible. */}
      <div
        className="flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <AwToggle
          checked={enabled}
          onChange={onToggle}
          label={enabled ? `Desativar ${row.name}` : `Ativar ${row.name}`}
        />
      </div>

      {/* Delete (custom only) — always visible. */}
      {onDelete && (
        <div
          className="flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <AwButton
            variant="ghost"
            size="sm"
            iconOnly="delete"
            aria-label={`Excluir ${row.name}`}
            title="Excluir habilidade"
            onClick={onDelete}
          />
        </div>
      )}
    </div>
  );
}

/** Highlights occurrences of `query` inside `text`. Falls back to plain
 *  text when there is no query — keeps the typography consistent. */
function Highlight({
  text,
  query,
  className,
}: {
  text: string;
  query: string;
  className: string;
}) {
  if (!query) return <span className={className}>{text}</span>;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return <span className={className}>{text}</span>;
  return (
    <span className={className}>
      {text.slice(0, idx)}
      <mark className="rounded bg-[var(--aw-blue-150)] px-0.5 text-[var(--aw-blue-800)]">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </span>
  );
}

/* ----------------------------------------------------------------
 * ToolPack — a collapsible panel per integration / custom group.
 * ---------------------------------------------------------------- */

function ToolPack({
  brand,
  title,
  subtitle,
  total,
  active,
  defaultOpen = true,
  headerRight,
  children,
  emptyHint,
  customLook,
}: {
  brand?: string;
  title: string;
  subtitle?: string;
  total: number;
  active: number;
  defaultOpen?: boolean;
  headerRight?: React.ReactNode;
  children?: React.ReactNode;
  emptyHint?: React.ReactNode;
  customLook?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden">
      <header
        className="flex items-center gap-4 px-6 py-5"
        onClick={() => setOpen((v) => !v)}
        style={{ cursor: "pointer" }}
      >
        {brand ? (
          <AwBrandLogo brand={brand} size="md" />
        ) : (
          <div
            className="flex flex-shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-aw-blue-500 via-aw-purple-500 to-aw-teal-500 text-white"
            style={{ width: 40, height: 40 }}
          >
            <Icon name="bolt" size={20} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="m-0 truncate text-[17px] font-semibold tracking-[-0.01em] text-[var(--fg-primary)]">
            {title}
          </h3>
          {subtitle && (
            <p className="m-0 mt-0.5 truncate text-[13px] text-[var(--fg-tertiary)]">
              {subtitle}
            </p>
          )}
        </div>
        <span className="hidden flex-shrink-0 text-[12px] font-medium tabular-nums text-[var(--fg-tertiary)] sm:inline-block">
          {active} de {total}
        </span>
        {headerRight && (
          <div
            className="flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {headerRight}
          </div>
        )}
        <button
          type="button"
          aria-label={open ? "Recolher" : "Expandir"}
          aria-expanded={open}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[var(--fg-secondary)] transition-colors hover:bg-[var(--aw-blue-100)]"
        >
          <Icon
            name="expand_more"
            size={18}
            className={`transition-transform duration-200 ease-out motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          />
        </button>
      </header>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <div className="border-t border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
            {children}
            {total === 0 && emptyHint && (
              <div className="px-5 py-8 text-center text-[13px] text-[var(--fg-tertiary)]">
                {emptyHint}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
 * IntegrationGroup — top-level pack grouping every connected account
 * of a single integration brand. The pack header carries the brand
 * identity (logo, name, description) and aggregated stats across all
 * accounts of that brand. Inside it, each account renders as its own
 * InstancePack.
 * ---------------------------------------------------------------- */

function IntegrationGroup({
  brand,
  title,
  subtitle,
  accountCount,
  activeSkills,
  totalSkills,
  headerRight,
  defaultOpen = true,
  children,
}: {
  brand: string;
  title: string;
  subtitle?: string;
  accountCount: number;
  activeSkills: number;
  totalSkills: number;
  headerRight?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  /* When the integration has a single connected account, the InstancePack
   * level collapses away and rows render directly under this header — so
   * "1 conta" becomes redundant noise next to the rest of the chrome. */
  const showAccountCount = accountCount > 1;

  return (
    <section className="overflow-hidden">
      <header
        className="flex items-center gap-4 px-6 py-5"
        onClick={() => setOpen((v) => !v)}
        style={{ cursor: "pointer" }}
      >
        <AwBrandLogo brand={brand} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="m-0 truncate text-[17px] font-semibold tracking-[-0.01em] text-[var(--fg-primary)]">
            {title}
          </h3>
          {subtitle && (
            <p className="m-0 mt-0.5 truncate text-[13px] text-[var(--fg-tertiary)]">
              {subtitle}
            </p>
          )}
        </div>
        <div className="hidden flex-shrink-0 flex-col items-end text-right sm:flex">
          {showAccountCount && (
            <span className="text-[12px] font-medium tabular-nums text-[var(--fg-secondary)]">
              {accountCount} contas
            </span>
          )}
          <span className="text-[12px] tabular-nums text-[var(--fg-tertiary)]">
            {activeSkills}/{totalSkills} habilidades ativas
          </span>
        </div>
        {headerRight && (
          <div
            className="flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {headerRight}
          </div>
        )}
        <button
          type="button"
          aria-label={open ? "Recolher" : "Expandir"}
          aria-expanded={open}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[var(--fg-secondary)] transition-colors hover:bg-[var(--aw-blue-100)]"
        >
          <Icon
            name="expand_more"
            size={18}
            className={`transition-transform duration-200 ease-out motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          />
        </button>
      </header>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <div className="border-t border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)]">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
 * InstancePack — mid-level pack inside an IntegrationGroup, scoped to
 * a single connected account. Carries the instance name, per-account
 * activation count, optional attention warning, and a "+ Nova" CTA
 * that opens the same custom-skill modal as the page header.
 * ---------------------------------------------------------------- */

function InstancePack({
  brand,
  instanceName,
  active,
  total,
  needsAttention,
  attentionReason,
  onCreateNew,
  defaultOpen = true,
  children,
}: {
  brand: string;
  instanceName: string;
  active: number;
  total: number;
  needsAttention?: boolean;
  attentionReason?: string;
  onCreateNew: () => void;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <header
        className="flex items-center gap-3 py-3 pl-12 pr-6"
        onClick={() => setOpen((v) => !v)}
        style={{ cursor: "pointer" }}
      >
        <AwBrandLogo brand={brand} size="sm" />
        <div className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold tracking-[-0.005em] text-[var(--fg-primary)]">
            {instanceName}
          </span>
          <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-[var(--fg-tertiary)]">
            <span className="tabular-nums">
              {active}/{total} habilidades ativas
            </span>
            {needsAttention && (
              <>
                <span aria-hidden>·</span>
                <span
                  className="inline-flex items-center gap-1 text-[var(--aw-red-700)]"
                  title={attentionReason}
                >
                  <Icon name="warning" size={12} />
                  {attentionReason || "atenção necessária"}
                </span>
              </>
            )}
          </div>
        </div>
        <span className="hidden flex-shrink-0 text-[12px] font-medium tabular-nums text-[var(--fg-tertiary)] sm:inline-block">
          {active}/{total}
        </span>
        <div
          className="flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <AwButton
            variant="secondary"
            size="sm"
            iconLeft="add"
            onClick={onCreateNew}
          >
            Nova
          </AwButton>
        </div>
        <button
          type="button"
          aria-label={open ? "Recolher" : "Expandir"}
          aria-expanded={open}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[var(--fg-secondary)] transition-colors hover:bg-[var(--aw-blue-100)]"
        >
          <Icon
            name="expand_more"
            size={16}
            className={`transition-transform duration-200 ease-out motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          />
        </button>
      </header>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <div className="border-t border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)] pl-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
 * Detail modal — opens when a row is clicked.
 * ---------------------------------------------------------------- */

function ToolDetailModal({
  open,
  onClose,
  row,
  enabled,
  onToggle,
}: {
  open: boolean;
  onClose: () => void;
  row: RowTool | null;
  enabled: boolean;
  onToggle: () => void;
}) {
  if (!row) {
    return (
      <AwModal open={open} onClose={onClose}>
        <div />
      </AwModal>
    );
  }

  const integration = row.brand ? findIntegration(row.brand) : undefined;
  const params = row.catalog?.params ?? [];
  const returns = row.catalog?.returns;
  const agents = agentsUsingCount(row.id);
  const lastRun = lastRunLabel(row.id);

  return (
    <AwModal
      open={open}
      onClose={onClose}
      title={row.name}
      footer={
        <>
          <AwButton variant="secondary" size="md" onClick={onClose}>
            Fechar
          </AwButton>
          <AwButton
            variant={enabled ? "secondary" : "primary"}
            size="md"
            iconLeft={enabled ? "pause" : "play_arrow"}
            onClick={() => {
              onToggle();
            }}
          >
            {enabled ? "Pausar habilidade" : "Ativar habilidade"}
          </AwButton>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Identity strip — flat row, no container chrome. */}
        <div className="flex items-center gap-3">
          {row.brand ? (
            <AwBrandLogo brand={row.brand} size="md" />
          ) : (
            <div
              className="flex flex-shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-aw-blue-500 via-aw-purple-500 to-aw-teal-500 text-white"
              style={{ width: 40, height: 40 }}
            >
              <Icon name={row.icon} size={20} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate font-mono text-[12px] text-[var(--fg-secondary)]">
                {row.catalog?.id ?? row.id}
              </span>
              <AwPill variant={KIND_PILL_VARIANT[row.kind]} dot={false}>
                {KIND_LABELS[row.kind]}
              </AwPill>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-[var(--fg-tertiary)]">
              {integration ? (
                <span>
                  {integration.name}
                  {row.instanceName && row.instanceName !== integration.name
                    ? ` · ${row.instanceName}`
                    : null}
                </span>
              ) : row.custom ? (
                <span>
                  Habilidade personalizada · {row.custom.method}
                </span>
              ) : (
                <span>Habilidade nativa</span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="m-0 text-[14px] leading-[1.55] text-[var(--fg-secondary)]">
          {row.description}
        </p>

        {/* Stats line */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-[var(--fg-tertiary)]">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="smart_toy" size={14} />
            {agents === 0
              ? "Nenhum agente usando"
              : agents === 1
                ? "1 agente usando"
                : `${agents} agentes usando`}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon name="schedule" size={14} />
            Última execução {lastRun}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon
              name={enabled ? "check_circle" : "pause_circle"}
              size={14}
            />
            {enabled ? "Ativa" : "Pausada"}
          </span>
        </div>

        {/* Params */}
        {params.length > 0 && (
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--fg-tertiary)]">
              Parâmetros de entrada
            </div>
            <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)]">
              {params.map((p, i) => (
                <ParamRow key={p.name} param={p} divider={i > 0} />
              ))}
            </div>
          </div>
        )}

        {/* Custom tool extras */}
        {row.custom && (
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--fg-tertiary)]">
              Endpoint
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2.5 font-mono text-[12px] text-[var(--fg-primary)]">
              <span className="mr-2 inline-block text-[10px] font-semibold tracking-wider text-[var(--fg-tertiary)]">
                {row.custom.method}
              </span>
              {row.custom.url}
            </div>
          </div>
        )}

        {/* Returns */}
        {returns && (
          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--fg-tertiary)]">
              Retorno
            </div>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-3 py-2.5 font-mono text-[12px] text-[var(--fg-primary)]">
              {returns}
            </div>
          </div>
        )}
      </div>
    </AwModal>
  );
}

function ParamRow({ param, divider }: { param: ToolParam; divider: boolean }) {
  return (
    <div
      className={
        "flex items-start gap-3 px-4 py-3 " +
        (divider ? "border-t border-[var(--border-subtle)]" : "")
      }
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[12px] text-[var(--fg-primary)]">
            {param.name}
          </span>
          {param.required && (
            <span className="rounded bg-[var(--aw-red-150)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[var(--aw-red-700)]">
              obrigatório
            </span>
          )}
          <span className="font-mono text-[10px] text-[var(--fg-tertiary)]">
            {param.type}
          </span>
        </div>
        <p className="m-0 mt-1 text-[12px] leading-[1.5] text-[var(--fg-secondary)]">
          {param.description}
        </p>
        {param.values && param.values.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {param.values.map((v) => (
              <span
                key={v}
                className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-2 py-0.5 font-mono text-[11px] text-[var(--fg-secondary)]"
              >
                {v}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
 * Create custom tool modal.
 * ---------------------------------------------------------------- */

const ICON_PRESETS = [
  "bolt",
  "api",
  "data_object",
  "webhook",
  "extension",
  "deployed_code",
  "send",
  "hub",
];

function CustomToolModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (tool: CustomTool) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<ToolKind>("action");
  const [method, setMethod] = useState<CustomToolMethod>("POST");
  const [url, setUrl] = useState("");
  const [auth, setAuth] = useState<CustomTool["auth"]>("bearer");
  const [icon, setIcon] = useState<string>("bolt");

  /* Reset on open so reopening after a save does not pre-fill the form
   * with the previous tool's data. */
  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
    setKind("action");
    setMethod("POST");
    setUrl("");
    setAuth("bearer");
    setIcon("bolt");
  }, [open]);

  const valid =
    name.trim().length >= 2 &&
    description.trim().length >= 5 &&
    /^https?:\/\//.test(url.trim());

  const submit = () => {
    if (!valid) return;
    const id = `custom.${name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40)}-${Date.now().toString(36)}`;
    onCreate({
      id,
      name: name.trim(),
      description: description.trim(),
      kind,
      method,
      url: url.trim(),
      auth,
      icon,
      addedAt: Date.now(),
    });
  };

  return (
    <AwModal
      open={open}
      onClose={onClose}
      title="Criar habilidade personalizada"
      footer={
        <>
          <AwButton variant="secondary" size="md" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton
            variant="primary"
            size="md"
            iconLeft="add"
            disabled={!valid}
            onClick={submit}
          >
            Criar habilidade
          </AwButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="m-0 text-[13px] leading-[1.55] text-[var(--fg-secondary)]">
          Conecte um endpoint HTTP do seu backend ou de um serviço
          externo. O agente passa a chamá-lo como qualquer outra
          habilidade nativa.
        </p>

        <AwField label="Nome da habilidade">
          <AwInput
            placeholder="Ex.: Validar CPF na Receita"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
          />
        </AwField>

        <AwField
          label="Descrição"
          helper="O que essa habilidade faz, escrito do ponto de vista do agente."
        >
          <AwInput
            placeholder="Ex.: Consulta a Receita Federal e retorna o status do CPF."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={140}
          />
        </AwField>

        <div className="grid grid-cols-2 gap-3">
          <AwField label="Tipo">
            <InlineSelect
              value={kind}
              onChange={(v) => setKind(v as ToolKind)}
              options={[
                { value: "read", label: "Leitura" },
                { value: "write", label: "Escrita" },
                { value: "action", label: "Ação" },
              ]}
              ariaLabel="Tipo da habilidade"
            />
          </AwField>
          <AwField label="Método HTTP">
            <InlineSelect
              value={method}
              onChange={(v) => setMethod(v as CustomToolMethod)}
              options={[
                { value: "GET", label: "GET" },
                { value: "POST", label: "POST" },
                { value: "PUT", label: "PUT" },
                { value: "PATCH", label: "PATCH" },
                { value: "DELETE", label: "DELETE" },
              ]}
              ariaLabel="Método HTTP"
            />
          </AwField>
        </div>

        <AwField label="URL do endpoint" helper="Deve começar com https://">
          <AwInput
            placeholder="https://api.empresa.com/v1/cpf/validar"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            inputMode="url"
            autoCorrect="off"
            spellCheck={false}
          />
        </AwField>

        <AwField label="Autenticação">
          <InlineSelect
            value={auth}
            onChange={(v) => setAuth(v as CustomTool["auth"])}
            options={[
              { value: "none", label: "Nenhuma" },
              { value: "bearer", label: "Bearer token" },
              { value: "basic", label: "Basic auth" },
              { value: "apiKey", label: "API key (header)" },
            ]}
            ariaLabel="Autenticação"
          />
        </AwField>

        <div>
          <div className="mb-1.5 text-[12px] font-medium text-[var(--fg-secondary)]">
            Ícone
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ICON_PRESETS.map((p) => {
              const active = p === icon;
              return (
                <button
                  type="button"
                  key={p}
                  onClick={() => setIcon(p)}
                  aria-pressed={active}
                  className={
                    "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors " +
                    (active
                      ? "border-[var(--fg-primary)] bg-[var(--aw-blue-100)] text-[var(--fg-primary)]"
                      : "border-[var(--border-subtle)] text-[var(--fg-secondary)] hover:bg-[var(--aw-blue-100)]")
                  }
                >
                  <Icon name={p} size={18} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </AwModal>
  );
}

/* ================================================================
 * Page
 * ================================================================ */

export default function ToolsPage() {
  const router = useRouter();

  const [hydrated, setHydrated] = useState(false);
  const [instances, setInstances] = useState<IntegrationInstance[]>([]);
  const [disabledIds, setDisabledIds] = useState<string[]>([]);
  const [customTools, setCustomTools] = useState<CustomTool[]>([]);

  const [tab, setTab] = useState<TabValue>("all");
  const [query, setQuery] = useState("");
  const [filterInstanceId, setFilterInstanceId] = useState<string>("");

  const [detailRow, setDetailRow] = useState<RowTool | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  /* Hydrate from localStorage once. */
  useEffect(() => {
    setInstances(loadInstances());
    setDisabledIds(loadDisabled());
    setCustomTools(loadCustom());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveDisabled(disabledIds);
  }, [hydrated, disabledIds]);

  useEffect(() => {
    if (!hydrated) return;
    saveCustom(customTools);
  }, [hydrated, customTools]);

  /* ---- Derived data ---- */

  /** Active connected non-channel instances. The tool inventory is
   *  per-instance: each connected account exposes its own copy of the
   *  brand's tools, so the user can pause "Buscar transação" on
   *  Hotmart-Marketing while leaving it live on Hotmart-Vendas. */
  const activeInstances = useMemo(() => {
    const out: {
      instance: IntegrationInstance;
      integration: IntegrationCatalogItem;
    }[] = [];
    for (const inst of instances) {
      if (CHANNEL_IDS.has(inst.integrationId)) continue;
      if (!inst.active) continue;
      const integration = findIntegration(inst.integrationId);
      if (!integration) continue;
      out.push({ instance: inst, integration });
    }
    return out;
  }, [instances]);

  /** Every native tool, expanded per connected instance. The row id is
   *  composite (`instanceId:toolId`) so the disabled-list keys each
   *  instance independently. */
  const nativeRows: RowTool[] = useMemo(() => {
    const rows: RowTool[] = [];
    for (const { instance, integration } of activeInstances) {
      for (const t of TOOLS_CATALOG) {
        if (t.integrationId !== integration.id) continue;
        rows.push({
          id: `${instance.instanceId}:${t.id}`,
          name: t.name,
          description: t.description,
          kind: t.kind,
          icon: t.icon,
          brand: integration.id,
          groupId: instance.instanceId,
          instanceId: instance.instanceId,
          instanceName: instance.name,
          catalog: t,
        });
      }
    }
    return rows;
  }, [activeInstances]);

  const customRows: RowTool[] = useMemo(
    () =>
      customTools.map<RowTool>((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        kind: c.kind,
        icon: c.icon,
        brand: null,
        groupId: "custom",
        instanceId: null,
        instanceName: null,
        custom: c,
      })),
    [customTools],
  );

  /* Apply tab + filter + search to a row source. */
  const filterRows = (rows: RowTool[]): RowTool[] => {
    let out = rows;
    if (filterInstanceId) {
      out = out.filter((r) => r.groupId === filterInstanceId);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q),
      );
    }
    return out;
  };

  const filteredNative = useMemo(
    () => filterRows(nativeRows),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nativeRows, query, filterInstanceId],
  );
  const filteredCustom = useMemo(
    () =>
      filterInstanceId
        ? [] /* custom rows belong to no instance — hide them when an instance filter is on */
        : filterRows(customRows),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customRows, query, filterInstanceId],
  );

  const totalNative = nativeRows.length;
  const totalCustom = customRows.length;
  const totalTools = totalNative + totalCustom;

  /* ---- Handlers ---- */

  const isEnabled = (id: string) => !disabledIds.includes(id);

  const toggleEnabled = (id: string) => {
    setDisabledIds((list) =>
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
    );
  };

  const handleCreateCustom = (tool: CustomTool) => {
    setCustomTools((list) => [tool, ...list]);
    setCreateOpen(false);
  };

  const handleDeleteCustom = () => {
    if (!deleteId) return;
    setCustomTools((list) => list.filter((c) => c.id !== deleteId));
    setDisabledIds((list) => list.filter((x) => x !== deleteId));
    setDeleteId(null);
  };

  const breadcrumbs = [
    { label: "Habilidades", icon: <Icon name="handyman" size={20} /> },
  ];

  /* ---- Render ---- */

  if (!hydrated) {
    return (
      <DashboardLayout breadcrumbs={breadcrumbs}>
        <div className="-m-8 min-h-full bg-[var(--bg-canvas)]" />
      </DashboardLayout>
    );
  }

  const showNative = tab === "all" || tab === "native";
  const showCustom = tab === "all" || tab === "custom";
  const noConnections = activeInstances.length === 0;
  const nothingToShow =
    (!showNative || filteredNative.length === 0) &&
    (!showCustom || filteredCustom.length === 0);

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="-m-8 min-h-full bg-[var(--bg-canvas)]">
        <div className="w-full px-10 pt-12 pb-24">
          {/* ---------------- Header ---------------- */}
          <header className="mb-8 flex items-end justify-between gap-6 border-b border-[var(--border-subtle)] pb-6">
            <div>
              <h1 className="m-0 mb-1.5 flex items-center gap-2.5 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--fg-primary)]">
                <Icon name="handyman" size={28} />
                Habilidades
              </h1>
              <p className="m-0 max-w-[600px] text-sm leading-[1.5] text-[var(--fg-secondary)]">
                Cada habilidade é uma ação que seus agentes podem
                chamar — buscar uma transação, agendar uma reunião,
                disparar um contrato. Conecte uma integração e o pacote
                de habilidades dela aparece aqui automaticamente.
              </p>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <Link href="/integrations">
                <AwButton
                  variant="secondary"
                  size="md"
                  iconLeft="extension"
                >
                  Gerenciar integrações
                </AwButton>
              </Link>
              <AwButton
                variant="primary"
                size="md"
                iconLeft="add"
                onClick={() => setCreateOpen(true)}
              >
                Nova habilidade personalizada
              </AwButton>
            </div>
          </header>

          {/* ---------------- Toolbar ---------------- */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <AwTabs
              value={tab}
              onChange={(v) => setTab(v as TabValue)}
              items={[
                {
                  value: "all",
                  label: "Todas",
                  count: totalTools,
                },
                {
                  value: "native",
                  label: "Nativas",
                  count: totalNative,
                },
                {
                  value: "custom",
                  label: "Personalizadas",
                  count: totalCustom,
                },
              ]}
              aria-label="Filtrar habilidades por origem"
            />
            <div className="sm:ml-auto sm:w-[300px]">
              <AwInput
                iconLeft="search"
                placeholder="Buscar habilidade…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar habilidade"
              />
            </div>
            {(() => {
              const labelFor = (
                instance: IntegrationInstance,
                integration: IntegrationCatalogItem,
              ) =>
                instance.name === integration.name
                  ? integration.name
                  : `${integration.name} · ${instance.name}`;
              const selected = filterInstanceId
                ? activeInstances.find(
                    ({ instance }) => instance.instanceId === filterInstanceId,
                  )
                : undefined;
              const triggerLabel = selected
                ? labelFor(selected.instance, selected.integration)
                : "Todas as integrações";
              return (
                <AwDropdownMenu
                  aria-label="Filtrar por integração"
                  trigger={
                    <AwButton
                      variant="secondary"
                      size="md"
                      iconLeft="filter_list"
                      iconRight="expand_more"
                    >
                      {triggerLabel}
                    </AwButton>
                  }
                  items={[
                    {
                      id: "__all__",
                      label: "Todas as integrações",
                      checked: !filterInstanceId,
                      onSelect: () => setFilterInstanceId(""),
                    },
                    ...(activeInstances.length > 0
                      ? [{ id: "__sep__", separator: true } as const]
                      : []),
                    ...activeInstances.map(({ instance, integration }) => ({
                      id: instance.instanceId,
                      label: labelFor(instance, integration),
                      checked: filterInstanceId === instance.instanceId,
                      onSelect: () =>
                        setFilterInstanceId(instance.instanceId),
                    })),
                  ]}
                />
              );
            })()}
          </div>

          {/* ---------------- Content ---------------- */}
          {noConnections && totalCustom === 0 ? (
            <NoConnectionsHero
              onCreateCustom={() => setCreateOpen(true)}
              onConnect={() => router.push("/integrations")}
            />
          ) : nothingToShow ? (
            <AwEmpty>
              <AwEmptyHeader>
                <AwEmptyMedia variant="icon">
                  <Icon name="search_off" size={28} />
                </AwEmptyMedia>
                <AwEmptyTitle>Nenhuma habilidade encontrada</AwEmptyTitle>
                <AwEmptyDescription>
                  {query
                    ? `Sua busca por "${query}" não retornou resultados.`
                    : "Ajuste os filtros para ver habilidades."}
                </AwEmptyDescription>
              </AwEmptyHeader>
              <AwEmptyContent>
                <AwButton
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setQuery("");
                    setFilterInstanceId("");
                    setTab("all");
                  }}
                >
                  Limpar filtros
                </AwButton>
              </AwEmptyContent>
            </AwEmpty>
          ) : (
            <div className="flex flex-col">
              {/* Native packs — grouped by integration brand at the top
                  level, then by connected account inside. Two Hotmart
                  accounts share one Hotmart parent, each with its own
                  inner pack and toggles. */}
              <div className="flex flex-col divide-y divide-[var(--border-subtle)]">
              {showNative &&
                (() => {
                  const groups = new Map<
                    string,
                    {
                      integration: IntegrationCatalogItem;
                      instances: IntegrationInstance[];
                    }
                  >();
                  for (const { instance, integration } of activeInstances) {
                    const g = groups.get(integration.id);
                    if (g) {
                      g.instances.push(instance);
                    } else {
                      groups.set(integration.id, {
                        integration,
                        instances: [instance],
                      });
                    }
                  }
                  return Array.from(groups.values()).map(
                    ({ integration, instances }) => {
                      /* When an instance filter is on, only show the
                       * integration that owns it. Other groups disappear. */
                      const visibleInstances = filterInstanceId
                        ? instances.filter(
                            (i) => i.instanceId === filterInstanceId,
                          )
                        : instances;
                      if (visibleInstances.length === 0) return null;

                      /* Per-instance row buckets, with search applied. */
                      const buckets = visibleInstances.map((instance) => {
                        const all = nativeRows.filter(
                          (r) => r.groupId === instance.instanceId,
                        );
                        const visible = filteredNative.filter(
                          (r) => r.groupId === instance.instanceId,
                        );
                        return { instance, allRows: all, visibleRows: visible };
                      });

                      /* Hide instances with no matches when the user is
                       * actively searching/filtering. Without a query,
                       * keep them so the empty state is informative. */
                      const renderableBuckets =
                        query || filterInstanceId
                          ? buckets.filter((b) => b.visibleRows.length > 0)
                          : buckets;
                      if (renderableBuckets.length === 0) return null;

                      /* Aggregate brand-wide stats — counted across ALL
                       * instances of this integration, not just the
                       * filtered ones, so the header stays truthful. */
                      const allRowsForBrand = nativeRows.filter(
                        (r) => r.brand === integration.id,
                      );
                      const activeSkills = allRowsForBrand.filter((r) =>
                        isEnabled(r.id),
                      ).length;
                      const totalSkills = allRowsForBrand.length;

                      /* Single-account integrations skip the InstancePack
                       * level — the account ↔ integration mapping is 1:1
                       * and the extra nesting just adds noise. The rows
                       * render directly under the integration header,
                       * which absorbs the "+ Nova" CTA. */
                      const isSingleAccount = instances.length === 1;

                      return (
                        <IntegrationGroup
                          key={integration.id}
                          brand={integration.id}
                          title={integration.name}
                          subtitle={integration.desc}
                          accountCount={instances.length}
                          activeSkills={activeSkills}
                          totalSkills={totalSkills}
                          headerRight={
                            isSingleAccount ? (
                              <AwButton
                                variant="secondary"
                                size="sm"
                                iconLeft="add"
                                onClick={() => setCreateOpen(true)}
                              >
                                Nova
                              </AwButton>
                            ) : undefined
                          }
                        >
                          {isSingleAccount
                            ? renderableBuckets[0].visibleRows.map((row) => (
                                <ToolRow
                                  key={row.id}
                                  row={row}
                                  enabled={isEnabled(row.id)}
                                  onToggle={() => toggleEnabled(row.id)}
                                  onOpen={() => setDetailRow(row)}
                                  query={query}
                                />
                              ))
                            : renderableBuckets.map(
                                ({ instance, allRows, visibleRows }) => {
                                  const active = allRows.filter((r) =>
                                    isEnabled(r.id),
                                  ).length;
                                  return (
                                    <InstancePack
                                      key={instance.instanceId}
                                      brand={integration.id}
                                      instanceName={instance.name}
                                      active={active}
                                      total={allRows.length}
                                      needsAttention={instance.needsAttention}
                                      attentionReason={instance.attentionReason}
                                      onCreateNew={() => setCreateOpen(true)}
                                    >
                                      {visibleRows.map((row) => (
                                        <ToolRow
                                          key={row.id}
                                          row={row}
                                          enabled={isEnabled(row.id)}
                                          onToggle={() => toggleEnabled(row.id)}
                                          onOpen={() => setDetailRow(row)}
                                          query={query}
                                        />
                                      ))}
                                    </InstancePack>
                                  );
                                },
                              )}
                        </IntegrationGroup>
                      );
                    },
                  );
                })()}
              </div>

              {/* Visual section break between native integrations and
                  custom skills — they're conceptually different tracks
                  (one is brand-scoped, the other user-defined endpoints)
                  so the page reads better with a clear seam between
                  them. The break only renders when both sections are
                  on screen at the same time. */}
              {showNative &&
                filteredNative.length > 0 &&
                showCustom &&
                !filterInstanceId && (
                  <div
                    className="my-4 border-t-2 border-[var(--border-subtle)]"
                    aria-hidden
                  />
                )}

              {/* Custom tools pack — always rendered when the tab allows
                  it, even when empty, because it owns the "create" CTA. */}
              {showCustom && !filterInstanceId && (
                <ToolPack
                  brand={undefined}
                  title="Habilidades personalizadas"
                  subtitle="Endpoints HTTP que você definiu pra estender o agente."
                  total={customRows.length}
                  active={
                    customRows.filter((r) => isEnabled(r.id)).length
                  }
                  customLook
                  headerRight={
                    <AwButton
                      variant="secondary"
                      size="sm"
                      iconLeft="add"
                      onClick={() => setCreateOpen(true)}
                    >
                      Nova habilidade
                    </AwButton>
                  }
                  emptyHint={
                    <span>
                      Você ainda não criou nenhuma habilidade personalizada.{" "}
                      <button
                        type="button"
                        onClick={() => setCreateOpen(true)}
                        className="font-medium text-[var(--fg-primary)] underline-offset-2 hover:underline"
                      >
                        Criar a primeira
                      </button>
                      .
                    </span>
                  }
                >
                  {filteredCustom.map((row) => (
                    <ToolRow
                      key={row.id}
                      row={row}
                      enabled={isEnabled(row.id)}
                      onToggle={() => toggleEnabled(row.id)}
                      onOpen={() => setDetailRow(row)}
                      onDelete={() => setDeleteId(row.id)}
                      query={query}
                    />
                  ))}
                </ToolPack>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail */}
      <ToolDetailModal
        open={!!detailRow}
        onClose={() => setDetailRow(null)}
        row={detailRow}
        enabled={detailRow ? isEnabled(detailRow.id) : false}
        onToggle={() => {
          if (detailRow) toggleEnabled(detailRow.id);
        }}
      />

      {/* Create custom */}
      <CustomToolModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateCustom}
      />

      {/* Delete custom */}
      <AwModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Excluir habilidade personalizada"
        footer={
          <>
            <AwButton
              variant="secondary"
              size="md"
              onClick={() => setDeleteId(null)}
            >
              Cancelar
            </AwButton>
            <AwButton
              variant="danger"
              size="md"
              iconLeft="delete"
              onClick={handleDeleteCustom}
            >
              Excluir
            </AwButton>
          </>
        }
      >
        <p className="m-0 text-[14px] leading-[1.55] text-[var(--fg-secondary)]">
          Os agentes que usam essa habilidade vão perder acesso ao endpoint
          imediatamente. Essa ação não pode ser desfeita.
        </p>
      </AwModal>
    </DashboardLayout>
  );
}

/* ----------------------------------------------------------------
 * NoConnectionsHero — full-width hero shown when the user has no
 * connected integrations *and* no custom tools. The page header still
 * sits above it, so the user keeps orientation while being directed
 * back to /integrations.
 * ---------------------------------------------------------------- */

function NoConnectionsHero({
  onCreateCustom,
  onConnect,
}: {
  onCreateCustom: () => void;
  onConnect: () => void;
}) {
  return (
    <section className="rounded-3xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-raised)] px-8 py-16 text-center">
      <div className="mx-auto flex max-w-[480px] flex-col items-center">
        <div className="flex items-center justify-center gap-3">
          <AwBrandLogo brand="hotmart" size="md" />
          <AwBrandLogo brand="calendly" size="md" />
          <div
            className="flex items-center justify-center rounded-[10px] bg-gradient-to-br from-aw-blue-500 via-aw-purple-500 to-aw-teal-500 text-white"
            style={{ width: 40, height: 40 }}
          >
            <Icon name="bolt" size={22} />
          </div>
          <AwBrandLogo brand="hubspot" size="md" />
          <AwBrandLogo brand="claude" size="md" />
        </div>
        <h2 className="m-0 mt-7 text-[24px] font-semibold leading-tight tracking-[-0.02em] text-[var(--fg-primary)]">
          Conecte uma integração pra liberar habilidades
        </h2>
        <p className="m-0 mt-3 text-[14px] leading-[1.55] text-[var(--fg-secondary)]">
          Cada integração ativa traz um pacote de habilidades nativas
          que os agentes podem usar — pesquisar transação, agendar
          reunião, atualizar deal no CRM. Você também pode criar uma
          habilidade personalizada apontando pra qualquer endpoint
          HTTP.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          <AwButton
            variant="primary"
            size="md"
            iconLeft="extension"
            onClick={onConnect}
          >
            Ver integrações
          </AwButton>
          <AwButton
            variant="secondary"
            size="md"
            iconLeft="add"
            onClick={onCreateCustom}
          >
            Criar habilidade personalizada
          </AwButton>
        </div>
      </div>
    </section>
  );
}
