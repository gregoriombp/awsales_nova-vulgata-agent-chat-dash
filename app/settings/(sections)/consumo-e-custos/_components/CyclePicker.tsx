"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { AwPill } from "@/components/ui/AwPill";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { invoiceStatusLabel } from "../../financeiro/_components/data";
import { statusVariant } from "../../financeiro/_components/InvoiceDetailsSheet";
import {
  BILLING_CYCLES,
  cycleWorstStatus,
  type BillingCycle,
} from "./cycles-data";

/* ----------------------------------------------------------------------------
 * Navegador de ciclo — o ÚNICO controle temporal da aba "Por ciclos": aqui o
 * recorte é sempre um mês-calendário (pedido do Greg), sem range livre.
 * Setas ‹ › andam pelos meses; o botão central abre a lista com o status de
 * cada ciclo.
 * ------------------------------------------------------------------------- */

export function CyclePicker({
  value,
  onChange,
}: {
  value: BillingCycle;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  // BILLING_CYCLES é cronológico (Dez/25 → Mai/26); a lista mostra o mais
  // recente primeiro.
  const index = BILLING_CYCLES.findIndex((c) => c.id === value.id);
  const prev = index > 0 ? BILLING_CYCLES[index - 1] : null;
  const next = index < BILLING_CYCLES.length - 1 ? BILLING_CYCLES[index + 1] : null;

  return (
    <div className="flex items-center gap-1.5">
      <ArrowButton
        label={prev ? `Ciclo anterior (${prev.label})` : "Sem ciclo anterior"}
        icon="chevron_left"
        disabled={!prev}
        onClick={() => prev && onChange(prev.id)}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Selecionar ciclo"
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-(--border-subtle) bg-(--bg-raised) px-3.5 body-sm font-medium text-(--fg-primary) transition-colors duration-aw-fast hover:border-(--border-default) hover:bg-(--bg-hover)"
          >
            <Icon name="calendar_month" size={16} className="text-(--fg-tertiary)" />
            {value.label}
            {value.open && (
              <span className="body-xs font-medium text-(--fg-tertiary)">· em andamento</span>
            )}
            <Icon name="expand_more" size={16} className="text-(--fg-tertiary)" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="flex max-h-96 w-80 flex-col gap-0.5 overflow-y-auto border border-(--border-subtle) bg-(--bg-raised) p-1.5 shadow-lg"
        >
          {[...BILLING_CYCLES].reverse().map((c) => {
            const active = c.id === value.id;
            const status = cycleWorstStatus(c);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onChange(c.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-aw-fast",
                  active
                    ? "bg-(--bg-muted) text-(--fg-primary)"
                    : "text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)",
                )}
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate body-sm font-medium">{c.label}</span>
                  <span className="truncate body-xs text-(--fg-tertiary)">
                    {c.startsAt.slice(0, 10)} → {c.endsAt.slice(0, 10)}
                  </span>
                </span>
                {c.open ? (
                  <AwPill variant="info">Em andamento</AwPill>
                ) : status ? (
                  <AwPill variant={statusVariant(status)}>{invoiceStatusLabel(status)}</AwPill>
                ) : null}
                {active && (
                  <Icon name="check" size={15} className="shrink-0 text-(--fg-primary)" />
                )}
              </button>
            );
          })}
        </PopoverContent>
      </Popover>
      <ArrowButton
        label={next ? `Próximo ciclo (${next.label})` : "Sem próximo ciclo"}
        icon="chevron_right"
        disabled={!next}
        onClick={() => next && onChange(next.id)}
      />
    </div>
  );
}

function ArrowButton({
  label,
  icon,
  disabled,
  onClick,
}: {
  label: string;
  icon: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary) transition-colors duration-aw-fast",
        disabled
          ? "cursor-not-allowed opacity-40"
          : "hover:border-(--border-default) hover:bg-(--bg-hover) hover:text-(--fg-primary)",
      )}
    >
      <Icon name={icon} size={18} />
    </button>
  );
}
