"use client";

import * as React from "react";
import { DayButton } from "react-day-picker";
import { cn } from "@/lib/utils";
import { AwButton } from "@/components/ui/AwButton";
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

/* ---------- toggle segmentado (usado pelo seletor de visualização) ---------- */

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
  const activeIndex = Math.max(0, options.findIndex((opt) => opt.value === value));

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
              active ? "text-(--fg-primary)" : "text-(--fg-secondary) hover:text-(--fg-primary)",
            )}
          >
            {opt.icon ? <Icon name={opt.icon} size={15} /> : opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- filtro segmentado com rótulo + ícone (topbar do explorador) ---------- */

/**
 * Variante do segmentado que mostra rótulo + um nó visual à esquerda (ícone do
 * Material Symbols OU logo de marca). Usado pelos filtros "Dividir por" e
 * "Por destino" na topbar fixa do explorador.
 */
export function SegmentedFilter<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: string; leading?: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-0.5 rounded-xl border border-(--border-subtle) bg-(--bg-muted) p-1"
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
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 body-sm font-medium transition-colors duration-aw-fast",
              active
                ? "bg-(--bg-raised) text-(--fg-primary) shadow-(--shadow-xs)"
                : "text-(--fg-secondary) hover:text-(--fg-primary)",
            )}
          >
            {opt.leading && (
              <span className="inline-flex shrink-0 items-center">{opt.leading}</span>
            )}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- filtro de escopo em DROPDOWN compacto (topbar) ---------- */

/**
 * Substitui o segmentado por um botão único (estilo do PeriodPicker) que abre um
 * menu — economiza espaço horizontal na topbar (pedido do Greg). O `leading`
 * pode ser ícone do Material OU logo de marca, então usamos o Popover (o
 * AwDropdownMenu só aceita ícone por nome).
 */
export function ScopeFilterDropdown<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  collapsed = false,
}: {
  options: { value: T; label: string; leading?: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
  /** Gatilho mostra só o `leading` (logos), sem o rótulo — economiza espaço
   *  na topbar (pedido do Greg). Os rótulos completos aparecem ao abrir. */
  collapsed?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const current = options.find((o) => o.value === value) ?? options[0];
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          title={collapsed ? current.label : undefined}
          className={cn(
            "inline-flex h-11 shrink-0 items-center rounded-full border border-(--border-subtle) bg-(--bg-raised) body-sm font-medium text-(--fg-primary) transition-colors duration-aw-fast hover:border-(--border-default) hover:bg-(--bg-hover)",
            collapsed ? "gap-1 px-2.5" : "gap-1.5 px-3.5",
          )}
        >
          {current.leading && (
            <span className="inline-flex shrink-0 items-center">{current.leading}</span>
          )}
          {!collapsed && current.label}
          <Icon name="expand_more" size={16} className="text-(--fg-tertiary)" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="flex w-52 flex-col gap-0.5 border border-(--border-subtle) bg-(--bg-raised) p-1.5 shadow-lg"
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left body-sm transition-colors duration-aw-fast",
                active
                  ? "bg-(--bg-muted) font-medium text-(--fg-primary)"
                  : "text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)",
              )}
            >
              {opt.leading && (
                <span className="inline-flex shrink-0 items-center">{opt.leading}</span>
              )}
              <span className="min-w-0 flex-1 truncate">{opt.label}</span>
              {active && <Icon name="check" size={15} className="shrink-0 text-(--fg-primary)" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
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
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-(--border-subtle) bg-(--bg-raised) px-3.5 body-sm font-medium text-(--fg-primary) transition-colors duration-aw-fast hover:border-(--border-default) hover:bg-(--bg-hover)"
        >
          <Icon name="calendar_month" size={16} className="text-(--fg-tertiary)" />
          {triggerLabel}
          <Icon name="expand_more" size={16} className="text-(--fg-tertiary)" />
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
