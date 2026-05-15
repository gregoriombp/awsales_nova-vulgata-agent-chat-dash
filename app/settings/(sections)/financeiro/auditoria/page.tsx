"use client";

import * as React from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwDropdownMenu, type AwDropdownItem } from "@/components/ui/AwDropdownMenu";
import {
  AwEmpty,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty";
import { AwInput } from "@/components/ui/AwInput";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { AwSelect } from "@/components/ui/AwSelect";
import { Icon } from "@/components/ui/Icon";
import {
  AUDIT_EVENTS,
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

const ALL_EXECUTORS: AuditExecutor[] = ["AwSales", "Cliente", "Sistema"];

function executorVariant(e: AuditExecutor): AwPillVariant {
  switch (e) {
    case "AwSales":
      return "ai";
    case "Cliente":
      return "live";
    case "Sistema":
      return "neutral";
  }
}

export default function AuditoriaPage() {
  const [selectedTypes, setSelectedTypes] = React.useState<AuditEventType[]>(
    [],
  );
  const [selectedExecutors, setSelectedExecutors] = React.useState<
    AuditExecutor[]
  >([]);
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return AUDIT_EVENTS.filter((e) => {
      if (selectedTypes.length > 0 && !selectedTypes.includes(e.type))
        return false;
      if (
        selectedExecutors.length > 0 &&
        !selectedExecutors.includes(e.executor)
      )
        return false;
      if (
        q &&
        !`${e.actor} ${e.action} ${e.meta ?? ""}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [selectedTypes, selectedExecutors, query]);

  const grouped = React.useMemo(() => groupByDate(filtered), [filtered]);

  const clearAll = () => {
    setSelectedTypes([]);
    setSelectedExecutors([]);
    setQuery("");
  };

  const hasFilters =
    selectedTypes.length > 0 ||
    selectedExecutors.length > 0 ||
    query.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h6 className="m-0 mb-1 text-[var(--fg-primary)]">
          Trilha de eventos
        </h6>
        <p className="m-0 max-w-[520px] body-xs text-[var(--fg-secondary)]">
          Plano, cartão, fatura, cupom e voucher — executados pelo AwSales,
          pelo cliente ou pelo sistema.
        </p>
      </section>

      <Toolbar
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
        selectedExecutors={selectedExecutors}
        onExecutorsChange={setSelectedExecutors}
        query={query}
        onQueryChange={setQuery}
        onClearAll={clearAll}
        hasFilters={hasFilters}
      />

      {grouped.length === 0 ? (
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
        <ol className="m-0 flex flex-col gap-5 p-0">
          {grouped.map(([date, events]) => (
            <DateGroup key={date} date={date} events={events} />
          ))}
        </ol>
      )}
    </div>
  );
}

/* ---------- toolbar ---------- */

function Toolbar({
  selectedTypes,
  onTypesChange,
  selectedExecutors,
  onExecutorsChange,
  query,
  onQueryChange,
  onClearAll,
  hasFilters,
}: {
  selectedTypes: AuditEventType[];
  onTypesChange: (v: AuditEventType[]) => void;
  selectedExecutors: AuditExecutor[];
  onExecutorsChange: (v: AuditExecutor[]) => void;
  query: string;
  onQueryChange: (v: string) => void;
  onClearAll: () => void;
  hasFilters: boolean;
}) {
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

      <div className="flex flex-wrap items-center gap-2">
        <MultiFilter
          label="Tipo"
          options={ALL_TYPES}
          selected={selectedTypes}
          onChange={onTypesChange}
        />
        <MultiFilter
          label="Executor"
          options={ALL_EXECUTORS}
          selected={selectedExecutors}
          onChange={onExecutorsChange}
        />
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
      </div>
    </div>
  );
}

function MultiFilter<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: T[];
  selected: T[];
  onChange: (v: T[]) => void;
}) {
  const toggle = (id: T) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const triggerLabel =
    selected.length === 0
      ? label
      : selected.length === 1
        ? `${label} · ${selected[0]}`
        : `${label} · ${selected.length}`;

  const items: AwDropdownItem[] = [
    {
      id: "all",
      label: "Selecionar tudo",
      icon: "done_all",
      closeOnSelect: false,
      onSelect: () => onChange([]),
      disabled: selected.length === 0,
    },
    { id: "sep", separator: true },
    ...options.map((opt) => ({
      id: opt,
      label: opt,
      checked: selected.includes(opt),
      closeOnSelect: false,
      onSelect: () => toggle(opt),
    })),
  ];

  return (
    <AwDropdownMenu
      align="start"
      trigger={
        <AwSelect>
          {triggerLabel}
          {selected.length > 1 && (
            <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--fg-primary)] px-1 body-xs font-semibold text-[var(--bg-raised)]">
              {selected.length}
            </span>
          )}
        </AwSelect>
      }
      items={items}
    />
  );
}

/* ---------- timeline ---------- */

function groupByDate(events: AuditEvent[]): [string, AuditEvent[]][] {
  const map = new Map<string, AuditEvent[]>();
  for (const e of events) {
    const list = map.get(e.date) ?? [];
    list.push(e);
    map.set(e.date, list);
  }
  return Array.from(map.entries());
}

function DateGroup({
  date,
  events,
}: {
  date: string;
  events: AuditEvent[];
}) {
  return (
    <li className="m-0 list-none p-0">
      <p className="m-0 mb-2 aw-eyebrow text-[var(--fg-tertiary)]">{date}</p>
      <AwCard className="!p-0">
        <ul className="m-0 divide-y divide-[var(--border-subtle)] p-0">
          {events.map((e) => (
            <EventRow key={e.id} event={e} />
          ))}
        </ul>
      </AwCard>
    </li>
  );
}

function EventRow({ event }: { event: AuditEvent }) {
  return (
    <li className="m-0 grid grid-cols-[56px_1fr_auto] items-start gap-3 px-5 py-3 hover:bg-[var(--bg-hover)]">
      <span className="pt-0.5 body-xs font-medium tabular-nums text-[var(--fg-tertiary)]">
        {event.time}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="body-sm font-medium text-[var(--fg-primary)]">
            {event.action}
          </span>
          <span className="body-xs text-[var(--fg-tertiary)]">
            · {event.actor}
          </span>
        </div>
        {event.meta && (
          <p className="m-0 mt-0.5 body-xs text-[var(--fg-secondary)]">
            {event.meta}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <AwPill variant={executorVariant(event.executor)}>
          {event.executor}
        </AwPill>
        <span className="aw-eyebrow text-[var(--fg-tertiary)]">
          {event.type}
        </span>
      </div>
    </li>
  );
}
