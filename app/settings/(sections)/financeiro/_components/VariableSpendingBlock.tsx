"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwTable } from "@/components/ui/AwTable";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Icon } from "@/components/ui/Icon";
import {
  AGENT_BREAKDOWN,
  brl,
  formatQuantity,
  getCustomDailySpending,
  getDailySpending,
  scaleBreakdown,
  scaleCustomBreakdown,
  SERVICE_BREAKDOWN,
  SPENDING_CATEGORIES,
  SPENDING_PERIODS,
  type AgentBreakdownRow,
  type ServiceBreakdownRow,
  type SpendingCategory,
  type SpendingGrouping,
  type SpendingPeriod,
} from "./data";

type PeriodSelection =
  | { kind: "preset"; id: SpendingPeriod }
  | { kind: "custom"; from: Date; to: Date };

function diffInDaysInclusive(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000) + 1);
}

function formatRangeShort(from: Date, to: Date): string {
  const sameMonth =
    from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();
  const fromStr = from.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: sameMonth ? undefined : "short",
  });
  const toStr = to.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  return `${fromStr} – ${toStr}`;
}

type SortKey =
  | "label"
  | "role"
  | "status"
  | "total"
  | "quantity"
  | "unitPrice";
type SortDir = "asc" | "desc";

function parseUnitPrice(label: string): number {
  const m = label.match(/[\d.,]+/);
  if (!m) return Number.NEGATIVE_INFINITY;
  const n = parseFloat(m[0].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : Number.NEGATIVE_INFINITY;
}

// Mapeia cada categoria do gráfico de serviços para as linhas equivalentes da
// tabela. A linha "outros" não tem categoria correspondente e só aparece
// quando todas as 4 categorias estão selecionadas (ver allowedRowIds abaixo).
const SERVICE_CAT_TO_ROW_IDS: Record<string, string[]> = {
  disparos: ["disp"],
  leads: ["leads"],
  mensagens: ["msgs"],
  tokens: ["tokens-in", "tokens-out"],
};

export function VariableSpendingBlock() {
  const [grouping, setGrouping] = React.useState<SpendingGrouping>("service");
  const [selection, setSelection] = React.useState<PeriodSelection>({
    kind: "preset",
    id: "this-month",
  });
  const [filter, setFilter] = React.useState<
    Record<SpendingGrouping, Set<string>>
  >(() => ({
    service: new Set(SPENDING_CATEGORIES.service.map((c) => c.id)),
    agent: new Set(SPENDING_CATEGORIES.agent.map((c) => c.id)),
  }));

  const customDays =
    selection.kind === "custom"
      ? diffInDaysInclusive(selection.from, selection.to)
      : 0;
  const categories = SPENDING_CATEGORIES[grouping];
  const visibleIds = filter[grouping];
  const allIds = React.useMemo(() => categories.map((c) => c.id), [categories]);
  const isAll = visibleIds.size === allIds.length;

  const daily = React.useMemo(() => {
    if (selection.kind === "custom") {
      return getCustomDailySpending(grouping, customDays);
    }
    return getDailySpending(grouping, selection.id);
  }, [grouping, selection, customDays]);

  const chartPeriod: SpendingPeriod =
    selection.kind === "preset" ? selection.id : "last-30";

  const accumulated = React.useMemo(() => {
    let sum = 0;
    daily.forEach((day) => {
      categories.forEach((cat, c) => {
        if (visibleIds.has(cat.id)) sum += day[c] ?? 0;
      });
    });
    return sum;
  }, [daily, categories, visibleIds]);

  const toggleFilter = (id: string) => {
    setFilter((f) => {
      const next = new Set(f[grouping]);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...f, [grouping]: next };
    });
  };

  const selectAllFilter = () => {
    setFilter((f) => ({ ...f, [grouping]: new Set(allIds) }));
  };

  const filterUnit = grouping === "service" ? "serviços" : "agentes";
  const filterAllLabel = `Todos os ${filterUnit}`;
  let filterLabel: string;
  if (isAll) {
    filterLabel = filterAllLabel;
  } else if (visibleIds.size === 0) {
    filterLabel = `Nenhum dos ${filterUnit}`;
  } else if (visibleIds.size === 1) {
    const id = Array.from(visibleIds)[0];
    filterLabel = categories.find((c) => c.id === id)?.label ?? filterAllLabel;
  } else {
    filterLabel = `${visibleIds.size} ${filterUnit}`;
  }

  const allowedRowIds = React.useMemo(() => {
    if (grouping === "agent") {
      return new Set(visibleIds);
    }
    const set = new Set<string>();
    visibleIds.forEach((catId) => {
      (SERVICE_CAT_TO_ROW_IDS[catId] ?? []).forEach((rid) => set.add(rid));
    });
    if (isAll) set.add("outros");
    return set;
  }, [grouping, visibleIds, isAll]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <SegmentedToggle
              options={[
                { value: "service", label: "Serviço" },
                { value: "agent", label: "Agente" },
              ]}
              value={grouping}
              onChange={setGrouping}
            />
            <AwDropdownMenu
              align="start"
              trigger={<AwSelect>{filterLabel}</AwSelect>}
              items={[
                {
                  id: "__all__",
                  label: filterAllLabel,
                  checked: isAll,
                  closeOnSelect: false,
                  onSelect: selectAllFilter,
                },
                { id: "__sep__", separator: true },
                ...categories.map((c) => ({
                  id: c.id,
                  label: c.label,
                  checked: visibleIds.has(c.id),
                  closeOnSelect: false,
                  onSelect: () => toggleFilter(c.id),
                })),
              ]}
            />
          </div>
          <div className="flex items-center gap-3">
            <p className="m-0 body-xs text-[var(--fg-secondary)]">
              Acumulado:{" "}
              <strong className="tabular-nums text-[var(--fg-primary)]">
                {brl(accumulated)}
              </strong>
            </p>
            <PeriodPicker selection={selection} onChange={setSelection} />
          </div>
        </div>

        <Legend
          categories={categories}
          visibleIds={visibleIds}
          grouping={grouping}
        />

        <DailySpendingChart
          data={daily}
          categories={categories}
          visibleIds={visibleIds}
          period={chartPeriod}
        />
      </div>

      {selection.kind === "custom" ? (
        grouping === "service" ? (
          <ServiceTableCustom
            dayCount={customDays}
            allowedRowIds={allowedRowIds}
          />
        ) : (
          <AgentTableCustom
            dayCount={customDays}
            allowedRowIds={allowedRowIds}
          />
        )
      ) : grouping === "service" ? (
        <ServiceTable period={selection.id} allowedRowIds={allowedRowIds} />
      ) : (
        <AgentTable period={selection.id} allowedRowIds={allowedRowIds} />
      )}
    </div>
  );
}

/* ---------- period picker (presets + custom range) ---------- */

function PeriodPicker({
  selection,
  onChange,
}: {
  selection: PeriodSelection;
  onChange: (sel: PeriodSelection) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<{ from?: Date; to?: Date }>(
    selection.kind === "custom"
      ? { from: selection.from, to: selection.to }
      : {},
  );

  const triggerLabel =
    selection.kind === "preset"
      ? SPENDING_PERIODS.find((p) => p.id === selection.id)?.label ?? "Período"
      : `Personalizado · ${formatRangeShort(selection.from, selection.to)}`;

  const applyRange = () => {
    if (range.from && range.to) {
      onChange({ kind: "custom", from: range.from, to: range.to });
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Selecionar período"
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] px-3 py-1.5 body-xs font-medium text-[var(--fg-primary)] transition-colors duration-aw-fast hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)]"
        >
          <Icon
            name="calendar_month"
            size={14}
            className="text-[var(--fg-tertiary)]"
          />
          {triggerLabel}
          <Icon
            name="expand_more"
            size={14}
            className="text-[var(--fg-tertiary)]"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        className="flex w-auto gap-0 border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-0 shadow-lg"
      >
        <div className="flex w-44 flex-col border-r border-[var(--border-subtle)] py-1.5">
          {SPENDING_PERIODS.map((p) => {
            const active = selection.kind === "preset" && selection.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onChange({ kind: "preset", id: p.id });
                  setRange({});
                  setOpen(false);
                }}
                className={
                  "flex items-center justify-between gap-2 px-3 py-2 text-left body-xs transition-colors duration-aw-fast " +
                  (active
                    ? "bg-[var(--bg-muted)] font-medium text-[var(--fg-primary)]"
                    : "text-[var(--fg-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--fg-primary)]")
                }
              >
                {p.label}
                {active && (
                  <Icon
                    name="check"
                    size={14}
                    className="text-[var(--fg-primary)]"
                  />
                )}
              </button>
            );
          })}
          <div className="my-1 mx-3 h-px bg-[var(--border-subtle)]" />
          <span className="px-3 pt-1 aw-eyebrow text-[var(--fg-tertiary)]">
            Personalizado
          </span>
        </div>
        <div className="flex flex-col gap-3 p-3">
          <Calendar
            mode="range"
            selected={
              range.from
                ? { from: range.from, to: range.to ?? range.from }
                : undefined
            }
            onSelect={(r) =>
              setRange({ from: r?.from, to: r?.to ?? r?.from })
            }
            numberOfMonths={2}
            captionLayout="dropdown"
          />
          <div className="flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-3">
            <p className="m-0 body-xs text-[var(--fg-tertiary)]">
              {range.from && range.to
                ? formatRangeShort(range.from, range.to)
                : "Selecione início e fim"}
            </p>
            <div className="flex items-center gap-2">
              <AwButton
                size="sm"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </AwButton>
              <AwButton
                size="sm"
                variant="primary"
                disabled={!range.from || !range.to}
                onClick={applyRange}
              >
                Aplicar
              </AwButton>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
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

function DailySpendingChart({
  data,
  categories,
  visibleIds,
  period,
}: {
  data: number[][];
  categories: SpendingCategory[];
  visibleIds: Set<string>;
  period: SpendingPeriod;
}) {
  const totalDays = data.length;

  const visibleCategories = React.useMemo(
    () => categories.filter((c) => visibleIds.has(c.id)),
    [categories, visibleIds],
  );

  const chartData = React.useMemo(
    () =>
      data.map((day, i) => {
        const row: Record<string, number | string> = {
          day: dayLabel(i, totalDays, period),
        };
        categories.forEach((cat, c) => {
          row[cat.id] = day[c] ?? 0;
        });
        return row;
      }),
    [data, categories, period, totalDays],
  );

  const chartConfig = React.useMemo<ChartConfig>(
    () =>
      Object.fromEntries(
        visibleCategories.map((cat) => [
          cat.id,
          { label: cat.label, color: cat.colorVar },
        ]),
      ),
    [visibleCategories],
  );

  // Espaça os ticks do eixo X pra não amontoar quando há muitos dias.
  const tickInterval =
    totalDays <= 8 ? 0 : Math.max(0, Math.floor(totalDays / 6) - 1);

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[320px] w-full"
    >
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{ left: 12, right: 12, top: 8 }}
      >
        <defs>
          {visibleCategories.map((cat) => (
            <linearGradient
              key={`grad-${cat.id}`}
              id={`spending-gradient-${cat.id}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={`var(--color-${cat.id})`}
                stopOpacity={0.32}
              />
              <stop
                offset="100%"
                stopColor={`var(--color-${cat.id})`}
                stopOpacity={0}
              />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={tickInterval}
          minTickGap={16}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="dot"
              className="bg-[var(--bg-raised)]"
              formatter={(value, name) => {
                const cat = categories.find((c) => c.id === name);
                return (
                  <div className="flex w-full items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 body-xs text-[var(--fg-secondary)]">
                      <span
                        aria-hidden="true"
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: cat?.colorVar }}
                      />
                      {cat?.label ?? String(name)}
                    </span>
                    <span className="body-xs font-medium tabular-nums text-[var(--fg-primary)]">
                      {brl(Number(value))}
                    </span>
                  </div>
                );
              }}
            />
          }
        />
        {visibleCategories.map((cat) => (
          <Area
            key={cat.id}
            dataKey={cat.id}
            type="monotone"
            stroke={`var(--color-${cat.id})`}
            strokeWidth={2}
            fill={`url(#spending-gradient-${cat.id})`}
            fillOpacity={1}
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}

function dayLabel(
  index: number,
  totalDays: number,
  period: SpendingPeriod,
): string {
  if (period === "today") return "Hoje";
  if (period === "this-month") return `Dia ${index + 1}`;
  // Para "last-30" e "last-90", inverte: o último ponto é "hoje", o primeiro é mais antigo.
  const offset = totalDays - 1 - index;
  if (offset === 0) return "Hoje";
  if (offset === 1) return "Ontem";
  const days = period === "last-90" ? offset * 3 : offset;
  return `${days} dia${days === 1 ? "" : "s"} atrás`;
}

function Legend({
  categories,
  visibleIds,
  grouping,
}: {
  categories: SpendingCategory[];
  visibleIds: Set<string>;
  grouping: SpendingGrouping;
}) {
  const visible = categories.filter((c) => visibleIds.has(c.id));
  if (visible.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {visible.map((c) => (
        <span
          key={c.id}
          className="inline-flex items-center gap-2 body-xs text-[var(--fg-secondary)]"
        >
          {grouping === "agent" && c.avatar ? (
            <span className="relative inline-block">
              <AwAvatar size="sm" src={c.avatar} alt={c.label} />
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[var(--bg-canvas)]"
                style={{ background: c.colorVar }}
              />
            </span>
          ) : (
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: c.colorVar }}
            />
          )}
          {c.label}
        </span>
      ))}
    </div>
  );
}

/* ---------- tables ---------- */

function ServiceTable({
  period,
  allowedRowIds,
}: {
  period: SpendingPeriod;
  allowedRowIds: Set<string>;
}) {
  const scaled = React.useMemo(
    () =>
      scaleBreakdown(SERVICE_BREAKDOWN as ServiceBreakdownRow[], period).filter(
        (r) => allowedRowIds.has(r.id),
      ),
    [period, allowedRowIds],
  );
  return <ServiceTableBody rows={scaled} />;
}

function ServiceTableCustom({
  dayCount,
  allowedRowIds,
}: {
  dayCount: number;
  allowedRowIds: Set<string>;
}) {
  const scaled = React.useMemo(
    () =>
      scaleCustomBreakdown(
        SERVICE_BREAKDOWN as ServiceBreakdownRow[],
        dayCount,
      ).filter((r) => allowedRowIds.has(r.id)),
    [dayCount, allowedRowIds],
  );
  return <ServiceTableBody rows={scaled} />;
}

function ServiceTableBody({ rows: scaled }: { rows: ServiceBreakdownRow[] }) {
  const [sortKey, setSortKey] = React.useState<SortKey>("total");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  const sorted = React.useMemo(() => {
    const rows = [...scaled];
    rows.sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      if (sortKey === "unitPrice") {
        av = parseUnitPrice(a.unitPriceLabel);
        bv = parseUnitPrice(b.unitPriceLabel);
      } else if (sortKey === "quantity" || sortKey === "total") {
        av = a[sortKey];
        bv = b[sortKey];
      } else if (sortKey === "label") {
        av = a.label;
        bv = b.label;
      } else {
        return 0;
      }
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
      const numeric = k === "total" || k === "quantity" || k === "unitPrice";
      setSortDir(numeric ? "desc" : "asc");
    }
  };

  return (
    <AwTable>
      <thead>
        <tr>
          <SortableHeader
            label="Serviço"
            sortKey="label"
            current={sortKey}
            dir={sortDir}
            onClick={headerClick}
          />
          <SortableHeader
            label="Quantidade"
            sortKey="quantity"
            current={sortKey}
            dir={sortDir}
            onClick={headerClick}
          />
          <SortableHeader
            label="Unitário"
            sortKey="unitPrice"
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
                <Icon
                  name={r.icon}
                  size={18}
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

function AgentTable({
  period,
  allowedRowIds,
}: {
  period: SpendingPeriod;
  allowedRowIds: Set<string>;
}) {
  const scaled = React.useMemo(
    () =>
      scaleBreakdown(AGENT_BREAKDOWN as AgentBreakdownRow[], period).filter(
        (r) => allowedRowIds.has(r.id),
      ),
    [period, allowedRowIds],
  );
  return <AgentTableBody rows={scaled} />;
}

function AgentTableCustom({
  dayCount,
  allowedRowIds,
}: {
  dayCount: number;
  allowedRowIds: Set<string>;
}) {
  const scaled = React.useMemo(
    () =>
      scaleCustomBreakdown(
        AGENT_BREAKDOWN as AgentBreakdownRow[],
        dayCount,
      ).filter((r) => allowedRowIds.has(r.id)),
    [dayCount, allowedRowIds],
  );
  return <AgentTableBody rows={scaled} />;
}

function AgentTableBody({ rows: scaled }: { rows: AgentBreakdownRow[] }) {
  const [sortKey, setSortKey] = React.useState<SortKey>("total");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  const sorted = React.useMemo(() => {
    const rows = [...scaled];
    rows.sort((a, b) => {
      if (
        sortKey !== "label" &&
        sortKey !== "role" &&
        sortKey !== "status" &&
        sortKey !== "total"
      ) {
        return 0;
      }
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
