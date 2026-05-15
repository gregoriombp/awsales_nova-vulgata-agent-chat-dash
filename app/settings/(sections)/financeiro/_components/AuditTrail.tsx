"use client";

import * as React from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwEmpty, AwEmptyDescription, AwEmptyHeader, AwEmptyMedia, AwEmptyTitle } from "@/components/ui/AwEmpty";
import { AwInput } from "@/components/ui/AwInput";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { AwSelect } from "@/components/ui/AwSelect";
import { Icon } from "@/components/ui/Icon";
import {
  AUDIT_EVENTS,
  type AuditEventType,
  type AuditExecutor,
} from "./data";

const PERIODS = [
  { id: "all", label: "Todos os períodos" },
  { id: "today", label: "Hoje" },
  { id: "week", label: "Últimos 7 dias" },
  { id: "month", label: "Últimos 30 dias" },
];

const TYPES: { id: AuditEventType | "all"; label: string }[] = [
  { id: "all", label: "Todos os tipos" },
  { id: "Plano", label: "Plano" },
  { id: "Cartão", label: "Cartão" },
  { id: "Fatura", label: "Fatura" },
  { id: "Cupom", label: "Cupom" },
  { id: "Voucher", label: "Voucher" },
];

const EXECUTORS: { id: AuditExecutor | "all"; label: string }[] = [
  { id: "all", label: "Todos os executores" },
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

export function AuditTrail() {
  const [periodId, setPeriodId] = React.useState("all");
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

  // agrupa por data preservando a ordem
  const grouped = React.useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const e of filtered) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const periodLabel = PERIODS.find((p) => p.id === periodId)?.label ?? PERIODS[0].label;
  const typeLabel = TYPES.find((t) => t.id === typeId)?.label ?? TYPES[0].label;
  const executorLabel =
    EXECUTORS.find((e) => e.id === executorId)?.label ?? EXECUTORS[0].label;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <AwDropdownMenu
          trigger={<AwSelect>{periodLabel}</AwSelect>}
          items={PERIODS.map((p) => ({
            id: p.id,
            label: p.label,
            checked: p.id === periodId,
            onSelect: () => setPeriodId(p.id),
          }))}
        />
        <AwDropdownMenu
          trigger={<AwSelect>{typeLabel}</AwSelect>}
          items={TYPES.map((t) => ({
            id: t.id,
            label: t.label,
            checked: t.id === typeId,
            onSelect: () => setTypeId(t.id),
          }))}
        />
        <AwDropdownMenu
          trigger={<AwSelect>{executorLabel}</AwSelect>}
          items={EXECUTORS.map((e) => ({
            id: e.id,
            label: e.label,
            checked: e.id === executorId,
            onSelect: () => setExecutorId(e.id),
          }))}
        />
        <div className="min-w-[220px] flex-1">
          <AwInput
            iconLeft="search"
            placeholder="Buscar ator, ação ou referência…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <AwButton
          size="sm"
          variant="secondary"
          iconLeft="download"
          onClick={() => alert("Exportação iniciada — você receberá o CSV por e-mail.")}
        >
          Exportar CSV
        </AwButton>
      </div>

      <AwCard className="!p-0">
        {grouped.length === 0 ? (
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
        ) : (
          <ul className="divide-y divide-[var(--border-subtle)]">
            {grouped.map(([date, events]) => (
              <li key={date}>
                <div className="border-b border-[var(--border-subtle)] bg-[var(--bg-muted)] px-6 py-2">
                  <p className="m-0 aw-eyebrow text-[var(--fg-tertiary)]">
                    {date}
                  </p>
                </div>
                <ul className="divide-y divide-[var(--border-subtle)]">
                  {events.map((e) => (
                    <li
                      key={e.id}
                      className="grid grid-cols-[64px_1fr] gap-4 px-6 py-3 hover:bg-[var(--bg-hover)]"
                    >
                      <span className="pt-0.5 body-xs font-medium tabular-nums text-[var(--fg-tertiary)]">
                        {e.time}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <AwPill variant={executorVariant(e.executor)}>
                            {e.executor}
                          </AwPill>
                          <span className="body-xs font-medium text-[var(--fg-primary)]">
                            {e.actor}
                          </span>
                          <span className="text-[var(--fg-tertiary)]">·</span>
                          <span className="body-xs text-[var(--fg-primary)]">
                            {e.action}
                          </span>
                          <span className="ml-auto aw-eyebrow text-[var(--fg-tertiary)]">
                            {e.type}
                          </span>
                        </div>
                        {e.meta && (
                          <p className="m-0 mt-1 body-xs text-[var(--fg-secondary)]">
                            {e.meta}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </AwCard>
    </div>
  );
}
