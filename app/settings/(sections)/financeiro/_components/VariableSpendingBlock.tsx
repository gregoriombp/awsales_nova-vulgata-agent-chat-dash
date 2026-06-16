"use client";

import * as React from "react";
import { DayButton } from "react-day-picker";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { cn } from "@/lib/utils";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwButton } from "@/components/ui/AwButton";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwTable } from "@/components/ui/AwTable";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

// Padrão GCP billing: o gráfico mostra no máximo as N maiores séries do
// período; o resto vira uma série agregada "Outros". A tabela continua
// listando todo mundo — o cap é só visual, pro gráfico não virar spaghetti
// quando a organização tem dezenas de agentes.
const MAX_CHART_SERIES = 5;

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

  // Top-N + "Outros" (padrão GCP): re-indexa o daily pras categorias
  // visíveis e, passando do cap, agrega as menores numa série única.
  const chartModel = React.useMemo(() => {
    const visible = categories
      .map((cat, idx) => ({
        cat,
        idx,
        total: daily.reduce((s, day) => s + (day[idx] ?? 0), 0),
      }))
      .filter((v) => visibleIds.has(v.cat.id));

    if (visible.length <= MAX_CHART_SERIES + 1) {
      return {
        categories: visible.map((v) => v.cat),
        data: daily.map((day) => visible.map((v) => day[v.idx] ?? 0)),
        othersLabels: [] as string[],
      };
    }

    const ranked = [...visible].sort((a, b) => b.total - a.total);
    const top = ranked.slice(0, MAX_CHART_SERIES);
    top.sort((a, b) => a.idx - b.idx);
    const rest = ranked.slice(MAX_CHART_SERIES);
    const othersCat: SpendingCategory = {
      id: "__others__",
      label: `Outros · ${rest.length}`,
      colorVar: "var(--aw-gray-400)",
    };
    return {
      categories: [...top.map((v) => v.cat), othersCat],
      data: daily.map((day) => [
        ...top.map((v) => day[v.idx] ?? 0),
        rest.reduce((s, v) => s + (day[v.idx] ?? 0), 0),
      ]),
      // Quem foi agregado na série "Outros", em ordem de gasto — alimenta o
      // tooltip informativo da legenda.
      othersLabels: rest.map((v) => v.cat.label),
    };
  }, [daily, categories, visibleIds]);

  const chartIds = React.useMemo(
    () => new Set(chartModel.categories.map((c) => c.id)),
    [chartModel],
  );

  return (
    <div className="flex flex-col gap-6">
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
          <p className="m-0 body-xs text-(--fg-secondary)">
            Acumulado:{" "}
            <strong className="tabular-nums text-(--fg-primary)">
              {brl(accumulated)}
            </strong>
          </p>
          <PeriodPicker selection={selection} onChange={setSelection} />
        </div>
      </div>

      {/* Gráfico abre a seção (acima da tabela), logo abaixo do controle de período. */}
      <div className="flex w-full flex-col gap-3">
        <Legend
          categories={chartModel.categories}
          visibleIds={chartIds}
          grouping={grouping}
          othersLabels={chartModel.othersLabels}
        />

        <DailySpendingChart
          data={chartModel.data}
          categories={chartModel.categories}
          visibleIds={chartIds}
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
          className="inline-flex items-center gap-1.5 rounded-sm border border-(--border-subtle) bg-(--bg-raised) px-3 py-1.5 body-xs font-medium text-(--fg-primary) transition-colors duration-aw-fast hover:border-(--border-default) hover:bg-(--bg-hover)"
        >
          <Icon
            name="calendar_month"
            size={14}
            className="text-(--fg-tertiary)"
          />
          {triggerLabel}
          <Icon
            name="expand_more"
            size={14}
            className="text-(--fg-tertiary)"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        className="flex w-auto gap-0 border border-(--border-subtle) bg-(--bg-raised) p-0 shadow-lg"
      >
        <div className="flex w-44 flex-col border-r border-(--border-subtle) py-1.5">
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
                    ? "bg-(--bg-muted) font-medium text-(--fg-primary)"
                    : "text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)")
                }
              >
                {p.label}
                {active && (
                  <Icon
                    name="check"
                    size={14}
                    className="text-(--fg-primary)"
                  />
                )}
              </button>
            );
          })}
          <div className="my-1 mx-3 h-px bg-(--border-subtle)" />
          <span className="px-3 pt-1 aw-eyebrow text-(--fg-tertiary)">
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
            components={{ DayButton: RangeDayButton }}
          />
          <div className="flex items-center justify-between gap-3 border-t border-(--border-subtle) pt-3">
            <p className="m-0 body-xs text-(--fg-tertiary)">
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

/* ---------- range day button ----------
 * DayButton custom só desta instância: pinta o período selecionado como uma
 * banda preta contínua (pontas arredondadas) e dá um bg cinza claro aos dias
 * fora do período, pra a seleção saltar aos olhos. Não toca no primitive
 * global do Calendar. */
function RangeDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const inRange =
    modifiers.selected ||
    modifiers.range_start ||
    modifiers.range_middle ||
    modifiers.range_end;
  const isSingle =
    (modifiers.range_start && modifiers.range_end) ||
    (modifiers.selected && !modifiers.range_middle && !modifiers.range_start);

  return (
    <button
      ref={ref}
      data-day={day.date.toLocaleDateString()}
      className={cn(
        "flex aspect-square h-auto w-full min-w-(--cell-size) items-center justify-center text-sm font-normal outline-hidden transition-colors duration-aw-fast focus-visible:ring-2 focus-visible:ring-(--fg-primary) focus-visible:ring-offset-1 focus-visible:ring-offset-(--bg-raised)",
        inRange
          ? "bg-(--fg-primary) font-medium text-(--bg-raised) hover:bg-(--fg-primary)"
          : "bg-(--bg-muted) text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)",
        // banda contínua: pontas arredondadas, miolo reto
        isSingle
          ? "rounded-md"
          : modifiers.range_start
            ? "rounded-l-md rounded-r-none"
            : modifiers.range_end
              ? "rounded-r-md rounded-l-none"
              : modifiers.range_middle
                ? "rounded-none"
                : "rounded-md",
        modifiers.today &&
          !inRange &&
          "ring-1 ring-inset ring-(--border-strong)",
        modifiers.outside && !inRange && "opacity-40",
        modifiers.disabled && "opacity-30",
        className,
      )}
      {...props}
    />
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
      className="inline-flex items-center gap-1 rounded-md border border-(--border-subtle) bg-(--bg-muted) p-1"
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
              "rounded-sm px-3 py-1 body-xs font-medium transition-colors duration-aw-fast " +
              (active
                ? "bg-(--bg-raised) text-(--fg-primary) shadow-(--shadow-xs)"
                : "text-(--fg-secondary) hover:text-(--fg-primary)")
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
  // Série sob o cursor — as demais esmaecem pra a pilha em foco saltar.
  const [hoveredKey, setHoveredKey] = React.useState<string | null>(null);

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
      className="aspect-auto h-[320px] w-full [&_.recharts-rectangle]:transition-[fill-opacity] [&_.recharts-rectangle]:duration-200 [&_.recharts-rectangle]:ease-out"
    >
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{ left: 12, right: 12, top: 8 }}
        barCategoryGap={totalDays <= 12 ? "24%" : "14%"}
      >
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
          cursor={{ fill: "var(--bg-hover)" }}
          content={
            <ChartTooltipContent
              indicator="dot"
              className="min-w-[200px] bg-(--bg-raised)"
              labelFormatter={(dayLabel, items) => {
                const total = (items ?? []).reduce(
                  (sum, it) => sum + (Number(it.value) || 0),
                  0,
                );
                return (
                  <div className="flex items-center justify-between gap-4 border-b border-(--border-subtle) pb-1.5">
                    <span className="body-xs font-medium text-(--fg-primary)">
                      {dayLabel}
                    </span>
                    <span className="body-xs font-semibold tabular-nums text-(--fg-primary)">
                      {brl(total)}
                    </span>
                  </div>
                );
              }}
              formatter={(value, name) => {
                const cat = categories.find((c) => c.id === name);
                return (
                  <div className="flex w-full items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 body-xs text-(--fg-secondary)">
                      <span
                        aria-hidden="true"
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: cat?.colorVar }}
                      />
                      {cat?.label ?? String(name)}
                    </span>
                    <span className="body-xs font-medium tabular-nums text-(--fg-primary)">
                      {brl(Number(value))}
                    </span>
                  </div>
                );
              }}
            />
          }
        />
        {visibleCategories.map((cat, i) => (
          <Bar
            key={cat.id}
            dataKey={cat.id}
            stackId="spend"
            fill={`var(--color-${cat.id})`}
            fillOpacity={hoveredKey && hoveredKey !== cat.id ? 0.2 : 1}
            onMouseEnter={() => setHoveredKey(cat.id)}
            onMouseLeave={() => setHoveredKey(null)}
            maxBarSize={36}
            radius={
              i === visibleCategories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]
            }
            isAnimationActive={false}
          />
        ))}
      </BarChart>
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
  othersLabels = [],
}: {
  categories: SpendingCategory[];
  visibleIds: Set<string>;
  grouping: SpendingGrouping;
  /** Nomes agregados na série "Outros" — exibidos em tooltip no hover. */
  othersLabels?: string[];
}) {
  const visible = categories.filter((c) => visibleIds.has(c.id));
  if (visible.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {visible.map((c) => {
        const isOthers = c.id === "__others__" && othersLabels.length > 0;
        const item = (
          <span
            className={
              "inline-flex items-center gap-2 body-xs text-(--fg-secondary)" +
              (isOthers ? " cursor-default" : "")
            }
          >
            {grouping === "agent" && c.avatar ? (
              <span className="relative inline-block">
                <AwAvatar size="sm" src={c.avatar} alt={c.label} />
                <span
                  aria-hidden="true"
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-(--bg-canvas)"
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
            {isOthers && (
              <Icon name="info" size={13} className="text-(--fg-tertiary)" />
            )}
          </span>
        );

        if (!isOthers) {
          return <React.Fragment key={c.id}>{item}</React.Fragment>;
        }

        return (
          <TooltipProvider key={c.id} delayDuration={120}>
            <Tooltip>
              <TooltipTrigger asChild>{item}</TooltipTrigger>
              <TooltipContent
                side="top"
                className="border-(--border-subtle) bg-(--bg-raised)"
              >
                <div className="flex flex-col gap-1.5 py-0.5">
                  <p className="m-0 aw-eyebrow text-(--fg-tertiary)">
                    {grouping === "agent"
                      ? "Agentes agrupados em Outros"
                      : "Serviços agrupados em Outros"}
                  </p>
                  <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
                    {othersLabels.map((label) => (
                      <li key={label} className="body-xs text-(--fg-primary)">
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
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
                  className="text-(--fg-tertiary)"
                />
                {r.label}
              </span>
            </td>
            <td className="tabular-nums">
              {formatQuantity(r.quantity, r.quantityFormat)}
            </td>
            <td className="tabular-nums">{r.unitPriceLabel}</td>
            <td className="text-right font-medium tabular-nums text-(--fg-primary)">
              {brl(r.total)}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={3} className="text-right text-(--fg-secondary)">
            Total
          </td>
          <td className="text-right font-semibold tabular-nums text-(--fg-primary)">
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
                <span className="font-medium text-(--fg-primary)">
                  {r.label}
                </span>
              </span>
            </td>
            <td>{r.role}</td>
            <td>
              <AwPill variant={agentStatusVariant(r.status)}>{r.status}</AwPill>
            </td>
            <td className="text-right font-medium tabular-nums text-(--fg-primary)">
              {brl(r.total)}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={3} className="text-right text-(--fg-secondary)">
            Total
          </td>
          <td className="text-right font-semibold tabular-nums text-(--fg-primary)">
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
            ? "text-(--fg-primary)"
            : "text-(--fg-tertiary) hover:text-(--fg-primary)")
        }
      >
        {label}
        <Icon
          name={active ? (dir === "asc" ? "arrow_upward" : "arrow_downward") : "unfold_more"}
          size={12}
          className={active ? "text-(--fg-secondary)" : "opacity-0 group-hover:opacity-100"}
        />
      </button>
    </th>
  );
}
