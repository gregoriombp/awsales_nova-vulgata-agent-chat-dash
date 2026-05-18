"use client";

import * as React from "react";
import { AwAvatar } from "@/components/ui/AwAvatar";
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
import { AwSelect } from "@/components/ui/AwSelect";
import { AwTable } from "@/components/ui/AwTable";
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
        selectedExecutors={selectedExecutors}
        onExecutorsChange={setSelectedExecutors}
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
                <th>Quando</th>
                <th>Tipo</th>
                <th>Evento</th>
                <th>Quem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </tbody>
          </AwTable>
        </AwCard>
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
    <div className="flex flex-wrap items-center gap-2">
      <div className="min-w-[240px] flex-1">
        <AwInput
          iconLeft="search"
          placeholder="Buscar ator, ação ou referência…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>
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

/* ---------- table row ---------- */

function EventRow({ event }: { event: AuditEvent }) {
  return (
    <tr>
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
        <span className="aw-eyebrow text-[var(--fg-tertiary)]">
          {event.type}
        </span>
      </td>
      <td>
        <div className="flex flex-col gap-0.5">
          <span className="body-sm font-medium text-[var(--fg-primary)]">
            {event.action}
          </span>
          {event.meta && (
            <p className="m-0 body-xs text-[var(--fg-secondary)]">
              {event.meta}
            </p>
          )}
        </div>
      </td>
      <td>
        <span className="inline-flex items-center gap-2">
          <AwAvatar
            size="md"
            src={event.actorAvatar}
            alt={event.actor}
            initials={getInitials(event.actor)}
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
