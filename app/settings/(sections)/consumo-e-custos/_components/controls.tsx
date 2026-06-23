"use client";

import * as React from "react";
import { DayButton } from "react-day-picker";
import { cn } from "@/lib/utils";
import { AwButton } from "@/components/ui/AwButton";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwSelect } from "@/components/ui/AwSelect";
import { Calendar } from "@/components/ui/calendar";
import { Icon } from "@/components/ui/Icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SPENDING_PERIODS } from "../../financeiro/_components/data";
import {
  formatRangeShort,
  useConsumo,
  type PeriodSelection,
} from "./ConsumoContext";

/* ---------- toggle de lente (Serviço | Agente) ---------- */

export function GroupingToggle() {
  const { grouping, setGrouping } = useConsumo();
  return (
    <SegmentedToggle
      ariaLabel="Agrupar por"
      options={[
        { value: "service", label: "Serviço" },
        { value: "agent", label: "Agente" },
      ]}
      value={grouping}
      onChange={setGrouping}
    />
  );
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string; icon?: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  const activeIndex = Math.max(
    0,
    options.findIndex((opt) => opt.value === value),
  );

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="relative inline-grid h-8 items-center rounded-md border border-(--border-subtle) bg-(--bg-muted) p-0.5"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0.5 top-0.5 rounded-sm bg-(--bg-raised) shadow-(--shadow-xs) transition-transform duration-aw-base ease-aw-out motion-reduce:transition-none"
        style={{
          left: "2px",
          width: `calc((100% - 4px) / ${options.length})`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={opt.icon ? opt.label : undefined}
            title={opt.icon ? opt.label : undefined}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative z-10 inline-flex h-7 items-center justify-center gap-1.5 rounded-sm px-2.5 body-xs font-medium transition-colors duration-aw-fast",
              active
                ? "text-(--fg-primary)"
                : "text-(--fg-secondary) hover:text-(--fg-primary)",
            )}
          >
            {opt.icon ? <Icon name={opt.icon} size={15} /> : opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- filtro de itens (serviços/taxas/agentes visíveis) ---------- */

export function SpendingFilterMenu() {
  const {
    categories,
    visibleIds,
    isAll,
    toggleFilter,
    selectAllFilter,
    filterLabel,
    filterAllLabel,
    grouping,
  } = useConsumo();

  return (
    <AwDropdownMenu
      align="end"
      aria-label="Filtrar itens"
      trigger={
        <AwSelect style={{ height: "var(--space-8)" }}>
          <span className="inline-flex items-center gap-1.5">
            <Icon
              name="filter_list"
              size={15}
              className="text-(--fg-tertiary)"
            />
            {filterLabel}
          </span>
        </AwSelect>
      }
      items={[
        {
          id: "__all__",
          label: filterAllLabel,
          checked: isAll,
          closeOnSelect: false,
          onSelect: selectAllFilter,
        },
        { id: "__sep__", separator: true },
        {
          id: "__hint__",
          label:
            grouping === "service" ? "Serviços e taxas" : "Agentes",
        },
        ...categories.map((c) => ({
          id: c.id,
          label: c.label,
          checked: visibleIds.has(c.id),
          closeOnSelect: false,
          onSelect: () => toggleFilter(c.id),
        })),
      ]}
    />
  );
}

/* ---------- controle de tempo (presets + range custom) ---------- */

export function PeriodPicker() {
  const { selection, setSelection } = useConsumo();
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
      setSelection({ kind: "custom", from: range.from, to: range.to });
      setOpen(false);
    }
  };

  const apply = (sel: PeriodSelection) => setSelection(sel);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Selecionar período"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-(--border-subtle) bg-(--bg-raised) px-3 body-xs font-medium text-(--fg-primary) transition-colors duration-aw-fast hover:border-(--border-default) hover:bg-(--bg-hover)"
        >
          <Icon name="calendar_month" size={14} className="text-(--fg-tertiary)" />
          {triggerLabel}
          <Icon name="expand_more" size={14} className="text-(--fg-tertiary)" />
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
                  apply({ kind: "preset", id: p.id });
                  setRange({});
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center justify-between gap-2 px-3 py-2 text-left body-xs transition-colors duration-aw-fast",
                  active
                    ? "bg-(--bg-muted) font-medium text-(--fg-primary)"
                    : "text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)",
                )}
              >
                {p.label}
                {active && (
                  <Icon name="check" size={14} className="text-(--fg-primary)" />
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
            onSelect={(r) => setRange({ from: r?.from, to: r?.to ?? r?.from })}
            numberOfMonths={2}
            captionLayout="dropdown"
            classNames={{
              range_start: "bg-(--fg-primary) rounded-l-md",
              range_middle: "bg-(--fg-primary) rounded-none",
              range_end: "bg-(--fg-primary) rounded-r-md",
            }}
            components={{ DayButton: RangeDayButton }}
          />
          <div className="flex items-center justify-between gap-3 border-t border-(--border-subtle) pt-3">
            <p className="m-0 body-xs text-(--fg-tertiary)">
              {range.from && range.to
                ? formatRangeShort(range.from, range.to)
                : "Selecione início e fim"}
            </p>
            <div className="flex items-center gap-2">
              <AwButton size="sm" variant="ghost" onClick={() => setOpen(false)}>
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

  return (
    <button
      ref={ref}
      data-day={day.date.toLocaleDateString()}
      className={cn(
        "flex aspect-square h-auto w-full min-w-(--cell-size) items-center justify-center rounded-md text-sm font-normal outline-hidden transition-colors duration-aw-fast focus-visible:ring-2 focus-visible:ring-(--fg-primary) focus-visible:ring-offset-1 focus-visible:ring-offset-(--bg-raised)",
        inRange
          ? "font-medium text-(--bg-raised)"
          : "bg-(--bg-muted) text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)",
        modifiers.today && !inRange && "ring-1 ring-inset ring-(--border-strong)",
        modifiers.outside && !inRange && "opacity-40",
        modifiers.disabled && "opacity-30",
        className,
      )}
      {...props}
    />
  );
}
