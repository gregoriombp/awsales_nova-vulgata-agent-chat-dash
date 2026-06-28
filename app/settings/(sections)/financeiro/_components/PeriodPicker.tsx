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
import {
  SPENDING_PERIODS,
  formatRangeShort,
  type PeriodSelection,
} from "./data";

/* ----------------------------------------------------------------------------
 * Controle de tempo da Visão geral — presets + range custom (calendário de 2
 * meses). É a MESMA UI do explorador (consumo-e-custos), porém prop-driven (sem
 * o ConsumoContext) pra a overview usar com estado local. Consolidar os dois
 * num único componente é dívida futura.
 * ------------------------------------------------------------------------- */

export function PeriodPicker({
  value,
  onChange,
  align = "end",
}: {
  value: PeriodSelection;
  onChange: (sel: PeriodSelection) => void;
  align?: "start" | "end";
}) {
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<{ from?: Date; to?: Date }>(
    value.kind === "custom" ? { from: value.from, to: value.to } : {},
  );

  const triggerLabel =
    value.kind === "preset"
      ? SPENDING_PERIODS.find((p) => p.id === value.id)?.label ?? "Período"
      : `Personalizado · ${formatRangeShort(value.from, value.to)}`;

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
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-(--border-subtle) bg-(--bg-raised) px-3 body-sm font-medium text-(--fg-primary) transition-colors duration-aw-fast hover:border-(--border-default) hover:bg-(--bg-hover)"
        >
          <Icon name="calendar_month" size={15} className="text-(--fg-tertiary)" />
          {triggerLabel}
          <Icon name="expand_more" size={15} className="text-(--fg-tertiary)" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={6}
        className="flex w-auto gap-0 border border-(--border-subtle) bg-(--bg-raised) p-0 shadow-lg"
      >
        <div className="flex w-44 flex-col border-r border-(--border-subtle) py-1.5">
          {SPENDING_PERIODS.map((p) => {
            const active = value.kind === "preset" && value.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onChange({ kind: "preset", id: p.id });
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
            // NÃO forçar `to = from`: deixar o `to` indefinido após o 1º clique
            // mantém o range "em aberto", então o 2º clique ESTENDE (10→20) em
            // vez de reiniciar. (O picker do explorador força `?? from` e por
            // isso o range não estende — bug a corrigir lá também.)
            selected={range.from ? { from: range.from, to: range.to } : undefined}
            onSelect={(r) => setRange({ from: r?.from, to: r?.to })}
            numberOfMonths={2}
            captionLayout="dropdown"
            classNames={{
              range_start: "bg-(--bg-inverse) rounded-l-md",
              range_middle: "bg-(--bg-inverse) rounded-none",
              range_end: "bg-(--bg-inverse) rounded-r-md",
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
          ? "font-medium text-(--fg-on-inverse)"
          : "text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)",
        modifiers.today && !inRange && "ring-1 ring-inset ring-(--border-strong)",
        modifiers.outside && !inRange && "opacity-40",
        modifiers.disabled && "opacity-30",
        className,
      )}
      {...props}
    />
  );
}
