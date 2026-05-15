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
  formatQuantity,
  getDailySpending,
  scaleBreakdown,
  SERVICE_BREAKDOWN,
  SPENDING_CATEGORIES,
  SPENDING_PERIODS,
  type AgentBreakdownRow,
  type ServiceBreakdownRow,
  type SpendingCategory,
  type SpendingGrouping,
  type SpendingPeriod,
} from "./data";

type SortKey = "label" | "role" | "status" | "total";
type SortDir = "asc" | "desc";

export function VariableSpendingBlock() {
  const [grouping, setGrouping] = React.useState<SpendingGrouping>("service");
  const [periodId, setPeriodId] = React.useState<SpendingPeriod>("this-month");

  const period =
    SPENDING_PERIODS.find((p) => p.id === periodId) ?? SPENDING_PERIODS[1];
  const categories = SPENDING_CATEGORIES[grouping];

  const daily = React.useMemo(
    () => getDailySpending(grouping, periodId),
    [grouping, periodId],
  );

  const accumulated = React.useMemo(
    () => daily.reduce((sum, day) => sum + day.reduce((s, v) => s + v, 0), 0),
    [daily],
  );

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
              {brl(accumulated)}
            </strong>
          </p>
          <AwDropdownMenu
            align="end"
            trigger={<AwSelect>{period.label}</AwSelect>}
            items={SPENDING_PERIODS.map((p) => ({
              id: p.id,
              label: p.label,
              checked: p.id === periodId,
              onSelect: () => setPeriodId(p.id),
            }))}
          />
        </div>
      </div>

      <div className="px-6 pb-3">
        <StackedBarChart
          data={daily}
          categories={categories}
          grouping={grouping}
          period={periodId}
        />
      </div>

      <Legend categories={categories} grouping={grouping} />

      <div className="border-t border-[var(--border-subtle)]">
        {grouping === "service" ? (
          <ServiceTable period={periodId} />
        ) : (
          <AgentTable period={periodId} />
        )}
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
  grouping,
  period,
}: {
  data: number[][];
  categories: SpendingCategory[];
  grouping: SpendingGrouping;
  period: SpendingPeriod;
}) {
  const [hovered, setHovered] = React.useState<number | null>(null);

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
  // Garante slots mínimos pra que poucos dias (ex: "Hoje") não virem uma
  // barra esticada na largura toda do gráfico.
  const layoutSlots = Math.max(days, 7);
  const slot = usableW / layoutSlots;
  const barW = slot * (1 - gap);
  const groupOffset = (usableW - slot * days) / 2;

  const hoveredDay = hovered !== null ? data[hovered] : null;
  const hoveredTotal = hovered !== null ? totals[hovered] : 0;

  return (
    <figure className="relative m-0">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Gráfico de gastos diários por categoria"
        className="block h-[220px] w-full"
        onMouseLeave={() => setHovered(null)}
      >
        {data.map((day, i) => {
          const x = padX + groupOffset + slot * i + (slot - barW) / 2;
          const totalH = (totals[i] / max) * usableH;
          let stacked = 0;
          const isHovered = hovered === i;
          return (
            <g
              key={i}
              onMouseEnter={() => setHovered(i)}
              style={{ opacity: hovered !== null && !isHovered ? 0.45 : 1 }}
            >
              {/* hover hitbox spanning the full column */}
              <rect
                x={padX + groupOffset + slot * i}
                y={padY}
                width={slot}
                height={usableH}
                fill="transparent"
                style={{ cursor: "pointer" }}
              />
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
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {hoveredDay && (
        <ChartTooltip
          dayIndex={hovered as number}
          totalDays={days}
          leftPct={
            ((padX + groupOffset + slot * ((hovered as number) + 0.5)) / W) *
            100
          }
          period={period}
          values={hoveredDay}
          total={hoveredTotal}
          categories={categories}
          grouping={grouping}
        />
      )}

      <figcaption className="sr-only">
        Distribuição diária dos gastos variáveis no período selecionado.
      </figcaption>
    </figure>
  );
}

function ChartTooltip({
  dayIndex,
  totalDays,
  leftPct,
  period,
  values,
  total,
  categories,
  grouping,
}: {
  dayIndex: number;
  totalDays: number;
  /** Posição horizontal do centro da barra (0..100 % do viewBox). */
  leftPct: number;
  period: SpendingPeriod;
  values: number[];
  total: number;
  categories: SpendingCategory[];
  grouping: SpendingGrouping;
}) {
  const isRightHalf = leftPct > 60;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute -top-2 z-10 flex min-w-[200px] -translate-y-full flex-col gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-raised)] p-3 shadow-[var(--shadow-md)]"
      style={{
        left: `${leftPct}%`,
        transform: isRightHalf
          ? "translate(-100%, -100%)"
          : "translate(0, -100%)",
      }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="aw-eyebrow text-[var(--fg-tertiary)]">
          {dayLabel(dayIndex, totalDays, period)}
        </span>
        <span className="body-sm font-semibold tabular-nums text-[var(--fg-primary)]">
          {brl(total)}
        </span>
      </div>
      <ul className="m-0 flex flex-col gap-1 p-0">
        {values.map((value, c) => {
          const cat = categories[c];
          if (!cat) return null;
          return (
            <li
              key={cat.id}
              className="m-0 flex items-center justify-between gap-3"
            >
              <span className="inline-flex items-center gap-1.5 body-xs text-[var(--fg-secondary)]">
                <span
                  aria-hidden="true"
                  className="inline-block h-2 w-2 rounded-[2px]"
                  style={{ background: cat.colorVar }}
                />
                {grouping === "agent" && cat.avatar && (
                  <AwAvatar size="sm" src={cat.avatar} alt={cat.label} />
                )}
                {cat.label}
              </span>
              <span className="body-xs font-medium tabular-nums text-[var(--fg-primary)]">
                {brl(value)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function dayLabel(
  index: number,
  totalDays: number,
  period: SpendingPeriod,
): string {
  if (period === "today") return "Hoje";
  if (period === "this-month") return `Dia ${index + 1}`;
  // Para "last-30" e "last-90", inverte: o último bar é "hoje", o primeiro é mais antigo.
  const offset = totalDays - 1 - index;
  if (offset === 0) return "Hoje";
  if (offset === 1) return "Ontem";
  const days = period === "last-90" ? offset * 3 : offset;
  return `${days} dia${days === 1 ? "" : "s"} atrás`;
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

function ServiceTable({ period }: { period: SpendingPeriod }) {
  const scaled = React.useMemo(
    () => scaleBreakdown(SERVICE_BREAKDOWN as ServiceBreakdownRow[], period),
    [period],
  );
  const total = scaled.reduce((s, r) => s + r.total, 0);

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
        {scaled.map((r) => (
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
            <td className="tabular-nums">
              {formatQuantity(r.quantity, r.quantityFormat)}
            </td>
            <td className="tabular-nums">{r.unitPriceLabel}</td>
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

function AgentTable({ period }: { period: SpendingPeriod }) {
  const [sortKey, setSortKey] = React.useState<SortKey>("total");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  const scaled = React.useMemo(
    () => scaleBreakdown(AGENT_BREAKDOWN as AgentBreakdownRow[], period),
    [period],
  );

  const sorted = React.useMemo(() => {
    const rows = [...scaled];
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
  }, [scaled, sortKey, sortDir]);

  const total = scaled.reduce((s, r) => s + r.total, 0);

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
