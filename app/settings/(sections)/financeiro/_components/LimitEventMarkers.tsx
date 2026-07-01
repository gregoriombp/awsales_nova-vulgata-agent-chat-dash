"use client";

import { Icon } from "@/components/ui/Icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LimitEventMarker } from "./data";

/* ----------------------------------------------------------------------------
 * Marcadores "Limite restaurado" — o dia em que o limite do ciclo foi atingido,
 * a cobrança parcial caiu e o limite foi liberado. Extraído do gráfico de
 * Detalhamento do Financeiro pra ser reusado no explorador de custos
 * (cmt-fa87fa50): mesmos componentes, mesma história.
 *
 * Renderiza um overlay ABSOLUTO — o pai precisa ser `relative`. Só o badge é
 * hoverável; o resto deixa o hover passar pro gráfico de baixo.
 * ------------------------------------------------------------------------- */

export function LimitEventMarkers({ events }: { events: LimitEventMarker[] }) {
  if (events.length === 0) return null;
  return (
    <>
      {events.map((ev, ei) => (
        <div
          key={`${ev.dateLabel}-${ei}`}
          className="pointer-events-none absolute inset-y-0 z-10 flex flex-col items-center"
          style={{ left: `${ev.leftPct}%`, transform: "translateX(-50%)" }}
        >
          {/* Provider próprio: o componente se sustenta em qualquer tela
              (o explorador não tem TooltipProvider ancestral). */}
          <TooltipProvider delayDuration={120}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`${ev.title} em ${ev.dateLabel}. ${ev.description}`}
                className="pointer-events-auto mb-1 inline-flex cursor-default items-center gap-1.5 rounded-full border border-(--border-subtle) px-2.5 py-1 body-xs font-medium whitespace-nowrap text-(--fg-secondary) shadow-sm backdrop-blur-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--ring-focus)"
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-full bg-(--aw-blue-500)"
                />
                {ev.label}
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-[280px] border-(--border-subtle) bg-(--bg-raised) p-0 text-(--fg-secondary)"
            >
              <LimitEventCard event={ev} />
            </TooltipContent>
          </Tooltip>
          </TooltipProvider>
          <span
            aria-hidden="true"
            className="w-px flex-1 border-l border-dashed border-(--aw-blue-300)"
          />
        </div>
      ))}
    </>
  );
}

export function LimitEventCard({ event }: { event: LimitEventMarker }) {
  return (
    <div className="flex flex-col gap-1.5 px-3.5 py-3">
      <span className="inline-flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--aw-emerald-100) text-(--aw-emerald-700)">
            <Icon name="check" size={13} weight={600} />
          </span>
          <span className="body-sm font-semibold text-(--fg-primary)">
            {event.title}
          </span>
        </span>
        <span className="shrink-0 body-xs tabular-nums text-(--fg-tertiary)">
          {event.dateLabel}
        </span>
      </span>
      <p className="m-0 body-xs text-(--fg-secondary) text-pretty">
        {event.description}
      </p>
    </div>
  );
}
