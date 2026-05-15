"use client";

import * as React from "react";
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
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import {
  AUDIT_EVENTS,
  type AuditEvent,
  type AuditEventType,
  type AuditExecutor,
} from "../_components/data";

const TYPES: { id: AuditEventType | "all"; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "Plano", label: "Plano" },
  { id: "Cartão", label: "Cartão" },
  { id: "Fatura", label: "Fatura" },
  { id: "Cupom", label: "Cupom" },
  { id: "Voucher", label: "Voucher" },
];

const EXECUTORS: { id: AuditExecutor | "all"; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "AwSales", label: "AwSales" },
  { id: "Cliente", label: "Cliente" },
  { id: "Sistema", label: "Sistema" },
];

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
  const [typeId, setTypeId] = React.useState<AuditEventType | "all">("all");
  const [executorId, setExecutorId] = React.useState<AuditExecutor | "all">(
    "all",
  );
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return AUDIT_EVENTS.filter((e) => {
      if (typeId !== "all" && e.type !== typeId) return false;
      if (executorId !== "all" && e.executor !== executorId) return false;
      if (
        q &&
        !`${e.actor} ${e.action} ${e.meta ?? ""}`.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [typeId, executorId, query]);

  const grouped = React.useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h6 className="m-0 mb-1 text-[var(--fg-primary)]">
          Trilha de eventos
        </h6>
        <p className="m-0 max-w-[520px] body-xs text-[var(--fg-secondary)]">
          Plano, cartão, fatura, cupom e voucher. Atos do AwSales, do cliente
          e do sistema aparecem aqui.
        </p>
      </section>

      <Toolbar
        typeId={typeId}
        onTypeChange={setTypeId}
        executorId={executorId}
        onExecutorChange={setExecutorId}
        query={query}
        onQueryChange={setQuery}
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
  typeId,
  onTypeChange,
  executorId,
  onExecutorChange,
  query,
  onQueryChange,
}: {
  typeId: AuditEventType | "all";
  onTypeChange: (v: AuditEventType | "all") => void;
  executorId: AuditExecutor | "all";
  onExecutorChange: (v: AuditExecutor | "all") => void;
  query: string;
  onQueryChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[260px] flex-1">
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
      <div className="flex flex-col gap-2">
        <PillFilter
          label="Tipo"
          options={TYPES}
          value={typeId}
          onChange={onTypeChange}
        />
        <PillFilter
          label="Executor"
          options={EXECUTORS}
          value={executorId}
          onChange={onExecutorChange}
        />
      </div>
    </div>
  );
}

function PillFilter<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="aw-eyebrow text-[var(--fg-tertiary)]">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {options.map((opt) => {
          const active = opt.id === value;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              aria-pressed={active}
              className={
                "rounded-full px-2.5 py-0.5 body-xs font-medium transition-colors duration-aw-fast " +
                (active
                  ? "bg-[var(--fg-primary)] text-[var(--bg-raised)]"
                  : "bg-[var(--bg-muted)] text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]")
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
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
