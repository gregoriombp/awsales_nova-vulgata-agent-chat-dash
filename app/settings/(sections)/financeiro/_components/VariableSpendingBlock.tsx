"use client";

import * as React from "react";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwCard } from "@/components/ui/AwCard";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwTable } from "@/components/ui/AwTable";
import { Icon } from "@/components/ui/Icon";
import {
  AGENT_BREAKDOWN,
  brl,
  DAILY_SPENDING,
  OVERVIEW_KPIS,
  SERVICE_BREAKDOWN,
  SPENDING_CATEGORIES,
  type AgentBreakdownRow,
  type SpendingCategory,
  type SpendingGrouping,
} from "./data";

const PERIODS = [
  { id: "today", label: "Hoje" },
  { id: "this-month", label: "Este mês" },
  { id: "last-30", label: "Últimos 30 dias" },
  { id: "last-90", label: "Últimos 90 dias" },
];

type SortKey = "label" | "role" | "status" | "total";
type SortDir = "asc" | "desc";

export function VariableSpendingBlock() {
  const [grouping, setGrouping] = React.useState<SpendingGrouping>("service");
  const [periodId, setPeriodId] = React.useState("this-month");

  const period = PERIODS.find((p) => p.id === periodId) ?? PERIODS[1];
  const categories = SPENDING_CATEGORIES[grouping];
  const daily = DAILY_SPENDING[grouping];

  return (
    <AwCard className="!p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-6 py-3">
        <SegmentedToggle
          options={[
            { value: "service", label: "Serviço" },
            { value: "agent", label: "Agente" },
          ]}
          value={grouping}
          onChange={setGrouping}
        />
        <div className="flex items-center gap-3">
          <p className="m-0 body-xs text-[var(--fg-secondary)]">
            Acumulado:{" "}
            <strong className="tabular-nums text-[var(--fg-primary)]">
              {brl(OVERVIEW_KPIS.accumulated)}
            </strong>
          </p>
          <AwDropdownMenu
            align="end"
            trigger={<AwSelect>{period.label}</AwSelect>}
            items={PERIODS.map((p) => ({
              id: p.id,
              label: p.label,
              checked: p.id === periodId,
              onSelect: () => setPeriodId(p.id),
            }))}
          />
        </div>
      </div>

      <div className="px-6 pb-3">
        <StackedBarChart data={daily} categories={categories} />
      </div>

      <Legend categories={categories} grouping={grouping} />

      <div className="border-t border-[var(--border-subtle)]">
        {grouping === "service" ? <ServiceTable /> : <AgentTable />}
      </div>
    </AwCard>
  );
}

/* ---------- segmented toggle ---------- */

function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Agrupar gastos variáveis"
      className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-muted)] p-1"
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={
              "rounded-[var(--radius-sm)] px-3 py-1 body-xs font-medium transition-colors duration-aw-fast " +
              (active
                ? "bg-[var(--bg-raised)] text-[var(--fg-primary)] shadow-[var(--shadow-xs)]"
                : "text-[var(--fg-secondary)] hover:text-[var(--fg-primary)]")
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- chart ---------- */

function StackedBarChart({
  data,
  categories,
}: {
  data: number[][];
  categories: SpendingCategory[];
}) {
  const days = data.length;
  const totals = data.map((d) => d.reduce((a, b) => a + b, 0));
  const max = Math.max(...totals, 1);

  const W = 100;
  const H = 220;
  const padX = 2;
  const padY = 16;
  const usableW = W - padX * 2;
  const usableH = H - padY * 2;
  const gap = 0.35;
  const slot = usableW / days;
  const barW = slot * (1 - gap);

  return (
    <figure className="m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Gráfico de gastos diários por categoria"
        className="block h-[220px] w-full"
      >
        {data.map((day, i) => {
          const x = padX + slot * i + (slot - barW) / 2;
          const totalH = (totals[i] / max) * usableH;
          let stacked = 0;
          return (
            <g key={i}>
              <line
                x1={x + barW / 2}
                x2={x + barW / 2}
                y1={padY + usableH}
                y2={padY + usableH - totalH}
                stroke="var(--border-subtle)"
                strokeWidth={0.1}
              />
              {day.map((value, c) => {
                const segH = (value / max) * usableH;
                stacked += segH;
                const y = padY + usableH - stacked;
                return (
                  <rect
                    key={c}
                    x={x}
                    y={y}
                    width={barW}
                    height={segH}
                    fill={categories[c]?.colorVar ?? "var(--aw-gray-500)"}
                  >
                    <title>
                      {`Dia ${i + 1} · ${categories[c]?.label}: ${brl(value)}`}
                    </title>
                  </rect>
                );
              })}
            </g>
          );
        })}
      </svg>
      <figcaption className="sr-only">
        Distribuição diária dos gastos variáveis no período selecionado.
      </figcaption>
    </figure>
  );
}

function Legend({
  categories,
  grouping,
}: {
  categories: SpendingCategory[];
  grouping: SpendingGrouping;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--border-subtle)] px-6 py-3">
      {categories.map((c) => (
        <span
          key={c.id}
          className="inline-flex items-center gap-2 body-xs text-[var(--fg-secondary)]"
        >
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 rounded-[2px]"
            style={{ background: c.colorVar }}
          />
          {grouping === "agent" && c.avatar && (
            <AwAvatar size="sm" src={c.avatar} alt={c.label} />
          )}
          {c.label}
        </span>
      ))}
    </div>
  );
}

/* ---------- tables ---------- */

function ServiceTable() {
  const total = SERVICE_BREAKDOWN.reduce((s, r) => s + r.total, 0);
  return (
    <AwTable>
      <thead>
        <tr>
          <th>Serviço</th>
          <th>Quantidade</th>
          <th>Unitário</th>
          <th className="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {SERVICE_BREAKDOWN.map((r) => (
          <tr key={r.id}>
            <td>
              <span className="inline-flex items-center gap-2">
                <Icon
                  name={r.icon}
                  size={14}
                  className="text-[var(--fg-tertiary)]"
                />
                {r.label}
              </span>
            </td>
            <td>{r.quantity}</td>
            <td>{r.unitPrice}</td>
            <td className="text-right font-medium tabular-nums text-[var(--fg-primary)]">
              {brl(r.total)}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={3} className="text-right text-[var(--fg-secondary)]">
            Total
          </td>
          <td className="text-right font-semibold tabular-nums text-[var(--fg-primary)]">
            {brl(total)}
          </td>
        </tr>
      </tfoot>
    </AwTable>
  );
}

function agentStatusVariant(status: AgentBreakdownRow["status"]): AwPillVariant {
  switch (status) {
    case "Ativo":
      return "live";
    case "Pausado":
      return "draft";
    case "Treinando":
      return "beta";
  }
}

function AgentTable() {
  const [sortKey, setSortKey] = React.useState<SortKey>("total");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  const sorted = React.useMemo(() => {
    const rows = [...AGENT_BREAKDOWN];
    rows.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return rows;
  }, [sortKey, sortDir]);

  const total = AGENT_BREAKDOWN.reduce((s, r) => s + r.total, 0);

  const headerClick = (k: SortKey) => {
    if (k === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir(k === "total" ? "desc" : "asc");
    }
  };

  return (
    <AwTable>
      <thead>
        <tr>
          <SortableHeader
            label="Agente"
            sortKey="label"
            current={sortKey}
            dir={sortDir}
            onClick={headerClick}
          />
          <SortableHeader
            label="Função"
            sortKey="role"
            current={sortKey}
            dir={sortDir}
            onClick={headerClick}
          />
          <SortableHeader
            label="Status"
            sortKey="status"
            current={sortKey}
            dir={sortDir}
            onClick={headerClick}
          />
          <SortableHeader
            label="Total"
            sortKey="total"
            current={sortKey}
            dir={sortDir}
            onClick={headerClick}
            align="right"
          />
        </tr>
      </thead>
      <tbody>
        {sorted.map((r) => (
          <tr key={r.id}>
            <td>
              <span className="inline-flex items-center gap-2">
                <AwAvatar size="sm" src={r.avatar} alt={r.label} />
                <span className="font-medium text-[var(--fg-primary)]">
                  {r.label}
                </span>
              </span>
            </td>
            <td>{r.role}</td>
            <td>
              <AwPill variant={agentStatusVariant(r.status)}>{r.status}</AwPill>
            </td>
            <td className="text-right font-medium tabular-nums text-[var(--fg-primary)]">
              {brl(r.total)}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={3} className="text-right text-[var(--fg-secondary)]">
            Total
          </td>
          <td className="text-right font-semibold tabular-nums text-[var(--fg-primary)]">
            {brl(total)}
          </td>
        </tr>
      </tfoot>
    </AwTable>
  );
}

function SortableHeader({
  label,
  sortKey,
  current,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onClick: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = current === sortKey;
  return (
    <th className={align === "right" ? "text-right" : undefined}>
      <button
        type="button"
        onClick={() => onClick(sortKey)}
        aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
        className={
          "group inline-flex items-center gap-1 transition-colors duration-aw-fast " +
          (align === "right" ? "flex-row-reverse " : "") +
          (active
            ? "text-[var(--fg-primary)]"
            : "text-[var(--fg-tertiary)] hover:text-[var(--fg-primary)]")
        }
      >
        {label}
        <Icon
          name={active ? (dir === "asc" ? "arrow_upward" : "arrow_downward") : "unfold_more"}
          size={12}
          className={active ? "text-[var(--fg-secondary)]" : "opacity-0 group-hover:opacity-100"}
        />
      </button>
    </th>
  );
}
