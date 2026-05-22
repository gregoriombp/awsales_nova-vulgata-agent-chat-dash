"use client";

import * as React from "react";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import {
  AwEmpty,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty";
import { AwInput } from "@/components/ui/AwInput";
import { AwTable } from "@/components/ui/AwTable";
import { Icon } from "@/components/ui/Icon";
import { InvoiceDetailsSheet } from "../_components/InvoiceDetailsSheet";
import {
  AUDIT_EVENTS,
  INVOICE_HISTORY,
  type AuditEvent,
  type AuditEventType,
  type AuditExecutor,
} from "../_components/data";

const ALL_TYPES: AuditEventType[] = [
  "Plano",
  "Cartão",
  "Fatura",
  "Cupom",
  "Voucher",
];

const INV_PATTERN = /\bINV-\d{4}-\d{2}-\d{4}\b/;

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? "") : "";
  return (first + last).toUpperCase();
}

function executorRole(executor: AuditExecutor): string {
  switch (executor) {
    case "AwSales":
      return "Account Manager";
    case "Cliente":
      return "Usuário";
    case "Sistema":
      return "Agente";
  }
}

type Person = {
  actor: string;
  avatar?: string;
  executor: AuditExecutor;
};

/** Unique people who appear as actors in the audit log — used to populate
 *  the executor filter as a list of real people instead of abstract
 *  category buckets. Order: AwSales first, then Cliente, then Sistema. */
function buildPeople(events: AuditEvent[]): Person[] {
  const seen = new Map<string, Person>();
  for (const e of events) {
    if (!seen.has(e.actor)) {
      seen.set(e.actor, { actor: e.actor, avatar: e.actorAvatar, executor: e.executor });
    }
  }
  const order: AuditExecutor[] = ["AwSales", "Cliente", "Sistema"];
  return Array.from(seen.values()).sort((a, b) => {
    const ai = order.indexOf(a.executor);
    const bi = order.indexOf(b.executor);
    if (ai !== bi) return ai - bi;
    return a.actor.localeCompare(b.actor, "pt-BR");
  });
}

const ALL_PEOPLE: Person[] = buildPeople(AUDIT_EVENTS);

export default function AuditoriaPage() {
  const [selectedTypes, setSelectedTypes] = React.useState<AuditEventType[]>(
    [],
  );
  const [selectedActors, setSelectedActors] = React.useState<string[]>([]);
  const [query, setQuery] = React.useState("");
  const [openInvoiceId, setOpenInvoiceId] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return AUDIT_EVENTS.filter((e) => {
      if (selectedTypes.length > 0 && !selectedTypes.includes(e.type))
        return false;
      if (selectedActors.length > 0 && !selectedActors.includes(e.actor))
        return false;
      if (
        q &&
        !`${e.actor} ${e.action} ${e.meta ?? ""}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [selectedTypes, selectedActors, query]);

  const openInvoice = React.useMemo(
    () =>
      openInvoiceId
        ? (INVOICE_HISTORY.find((r) => r.id === openInvoiceId) ?? null)
        : null,
    [openInvoiceId],
  );

  const clearAll = () => {
    setSelectedTypes([]);
    setSelectedActors([]);
    setQuery("");
  };

  const hasFilters =
    selectedTypes.length > 0 ||
    selectedActors.length > 0 ||
    query.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h6 className="m-0 mb-1 text-[var(--fg-primary)]">
          Histórico de atividades
        </h6>
        <p className="m-0 max-w-[520px] body-xs text-[var(--fg-secondary)]">
          Eventos de plano, cartão, fatura, cupom e voucher — feitos por
          AwSales, cliente ou sistema.
        </p>
      </section>

      <Toolbar
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
        selectedActors={selectedActors}
        onActorsChange={setSelectedActors}
        query={query}
        onQueryChange={setQuery}
        onClearAll={clearAll}
        hasFilters={hasFilters}
      />

      {filtered.length === 0 ? (
        <AwCard className="!p-0">
          <div className="px-6 py-10">
            <AwEmpty>
              <AwEmptyHeader>
                <AwEmptyMedia variant="icon">
                  <Icon name="search_off" size={20} />
                </AwEmptyMedia>
                <AwEmptyTitle>Nenhum evento encontrado</AwEmptyTitle>
                <AwEmptyDescription>
                  Ajuste os filtros ou tente outro termo.
                </AwEmptyDescription>
              </AwEmptyHeader>
            </AwEmpty>
          </div>
        </AwCard>
      ) : (
        <AwCard className="!p-0">
          <AwTable>
            <thead>
              <tr>
                <th>Evento</th>
                <th>Quando</th>
                <th>Usuário</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  onOpenInvoice={setOpenInvoiceId}
                />
              ))}
            </tbody>
          </AwTable>
        </AwCard>
      )}

      <InvoiceDetailsSheet
        invoice={openInvoice}
        open={openInvoice !== null}
        onClose={() => setOpenInvoiceId(null)}
      />
    </div>
  );
}

/* ---------- toolbar ---------- */

function Toolbar({
  selectedTypes,
  onTypesChange,
  selectedActors,
  onActorsChange,
  query,
  onQueryChange,
  onClearAll,
  hasFilters,
}: {
  selectedTypes: AuditEventType[];
  onTypesChange: (v: AuditEventType[]) => void;
  selectedActors: string[];
  onActorsChange: (v: string[]) => void;
  query: string;
  onQueryChange: (v: string) => void;
  onClearAll: () => void;
  hasFilters: boolean;
}) {
  const toggleType = (t: AuditEventType) => {
    onTypesChange(
      selectedTypes.includes(t)
        ? selectedTypes.filter((x) => x !== t)
        : [...selectedTypes, t],
    );
  };

  const toggleActor = (a: string) => {
    onActorsChange(
      selectedActors.includes(a)
        ? selectedActors.filter((x) => x !== a)
        : [...selectedActors, a],
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[240px] flex-1">
          <AwInput
            iconLeft="search"
            placeholder="Buscar ator, ação ou referência…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
        {hasFilters && (
          <AwButton
            size="sm"
            variant="ghost"
            iconLeft="close"
            onClick={onClearAll}
          >
            Limpar
          </AwButton>
        )}
        <AwButton
          size="md"
          variant="ghost"
          iconLeft="download"
          onClick={() =>
            alert("Exportação iniciada — você receberá o CSV por e-mail.")
          }
        >
          Exportar CSV
        </AwButton>
      </div>

      <TypeChips
        options={ALL_TYPES}
        selected={selectedTypes}
        onToggle={toggleType}
      />

      <ActorFilter
        people={ALL_PEOPLE}
        selected={selectedActors}
        onToggle={toggleActor}
      />
    </div>
  );
}

function TypeChips({
  options,
  selected,
  onToggle,
}: {
  options: AuditEventType[];
  selected: AuditEventType[];
  onToggle: (t: AuditEventType) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 body-xs font-medium text-[var(--fg-tertiary)]">
        Tipo
      </span>
      {options.map((t) => {
        const on = selected.includes(t);
        return (
          <button
            key={t}
            type="button"
            onClick={() => onToggle(t)}
            aria-pressed={on}
            className={
              "inline-flex items-center gap-1 rounded-full px-3 py-1 body-xs font-medium transition-colors duration-aw-fast outline-none " +
              (on
                ? "bg-[var(--fg-primary)] text-[var(--bg-raised)] hover:bg-[var(--fg-secondary)]"
                : "border border-[var(--border-subtle)] text-[var(--fg-secondary)] hover:border-[var(--border-default)] hover:text-[var(--fg-primary)]")
            }
          >
            {on && <Icon name="check" size={12} />}
            {t}
          </button>
        );
      })}
    </div>
  );
}

function ActorFilter({
  people,
  selected,
  onToggle,
}: {
  people: Person[];
  selected: string[];
  onToggle: (a: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 body-xs font-medium text-[var(--fg-tertiary)]">
        Executor
      </span>
      {people.map((p) => {
        const on = selected.includes(p.actor);
        const isCortex = p.actor === "Cortex";
        return (
          <button
            key={p.actor}
            type="button"
            onClick={() => onToggle(p.actor)}
            aria-pressed={on}
            className={
              "inline-flex items-center gap-2 rounded-full pr-3 py-1 pl-1 body-xs font-medium transition-colors duration-aw-fast outline-none " +
              (on
                ? "bg-[var(--bg-selected)] text-[var(--fg-primary)] hover:bg-[var(--bg-hover)]"
                : "border border-[var(--border-subtle)] text-[var(--fg-secondary)] hover:border-[var(--border-default)] hover:text-[var(--fg-primary)]")
            }
          >
            <AwAvatar
              size="sm"
              src={p.avatar}
              alt={p.actor}
              initials={getInitials(p.actor)}
              className={isCortex ? "!border-0" : undefined}
            />
            {p.actor}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- table row ---------- */

function EventRow({
  event,
  onOpenInvoice,
}: {
  event: AuditEvent;
  onOpenInvoice: (id: string) => void;
}) {
  const isCortex = event.actor === "Cortex";
  return (
    <tr>
      <td>
        <div className="flex flex-col gap-0.5">
          <span className="body-sm font-medium text-[var(--fg-primary)]">
            {event.action}
          </span>
          {event.meta && (
            <p className="m-0 body-xs text-[var(--fg-secondary)]">
              <MetaWithInvoiceLink
                meta={event.meta}
                onOpenInvoice={onOpenInvoice}
              />
            </p>
          )}
        </div>
      </td>
      <td>
        <div className="flex flex-col">
          <span className="body-xs tabular-nums text-[var(--fg-secondary)]">
            {event.date}
          </span>
          <span className="body-xs tabular-nums text-[var(--fg-tertiary)]">
            {event.time}
          </span>
        </div>
      </td>
      <td>
        <span className="inline-flex items-center gap-2">
          <AwAvatar
            size="md"
            src={event.actorAvatar}
            alt={event.actor}
            initials={getInitials(event.actor)}
            className={isCortex ? "!border-0" : undefined}
          />
          <span className="flex flex-col">
            <span className="body-sm font-medium text-[var(--fg-primary)]">
              {event.actor}
            </span>
            <span className="body-xs text-[var(--fg-tertiary)]">
              {executorRole(event.executor)}
            </span>
          </span>
        </span>
      </td>
    </tr>
  );
}

/** Renders the event meta string with any "INV-YYYY-MM-NNNN" reference
 *  upgraded to a clickable link that opens the invoice details sheet —
 *  but only when the invoice id exists in INVOICE_HISTORY. Unknown ids
 *  fall back to plain text so we never offer a dead link. */
function MetaWithInvoiceLink({
  meta,
  onOpenInvoice,
}: {
  meta: string;
  onOpenInvoice: (id: string) => void;
}) {
  const match = meta.match(INV_PATTERN);
  if (!match) return <>{meta}</>;
  const invId = match[0];
  const exists = INVOICE_HISTORY.some((r) => r.id === invId);
  if (!exists) return <>{meta}</>;
  const [before, after] = meta.split(invId);
  return (
    <>
      {before}
      <button
        type="button"
        onClick={() => onOpenInvoice(invId)}
        className="font-medium text-[var(--fg-primary)] underline decoration-dotted underline-offset-2 transition-colors duration-aw-fast hover:text-[var(--accent-brand)] hover:no-underline"
      >
        {invId}
      </button>
      {after}
    </>
  );
}
