"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AwChannelIcon } from "@/components/ui/AwChannelIcon";
import { brl } from "../../financeiro/_components/data";
import { useConsumo } from "./ConsumoContext";
import { channelBreakdown, SPEND_CHANNELS } from "./channels-model";
import { WidgetShell, type WidgetChrome } from "./WidgetBoard";

/* ----------------------------------------------------------------------------
 * "Gasto por canal" — quanto do uso veio de WhatsApp, Instagram e Messenger
 * (cmt-f014416f + Notion). Concilia com o headline: os valores dos canais
 * ativos somam o acumulado do recorte. Clicar num canal liga/desliga o filtro
 * correspondente (regra do Greg: dado novo ⇒ filtro novo).
 * ------------------------------------------------------------------------- */

export function ChannelWidget({ dragHandle, menu }: WidgetChrome) {
  const { seriesTotals, accumulated, grouping, channels, toggleChannel } = useConsumo();

  const rows = React.useMemo(() => {
    // Lente Serviço: split por categoria; lente Agente: perfil default (mock).
    const catTotals =
      grouping === "service"
        ? seriesTotals.map(({ cat, total }) => ({ id: cat.id, total }))
        : [{ id: "__all__", total: accumulated }];
    const raw = channelBreakdown(catTotals);
    const activeSum = raw
      .filter((r) => channels.has(r.id))
      .reduce((s, r) => s + r.total, 0);
    // Renormaliza os ATIVOS pro acumulado do recorte (concilia com o headline);
    // canais fora do filtro aparecem zerados, prontos pra religar.
    const factor = activeSum > 0 ? accumulated / activeSum : 0;
    return raw.map((r) => {
      const active = channels.has(r.id);
      const total = active ? Math.round(r.total * factor * 100) / 100 : 0;
      return {
        ...r,
        active,
        total,
        share: active && accumulated > 0 ? (total / accumulated) * 100 : 0,
      };
    });
  }, [seriesTotals, accumulated, grouping, channels]);

  return (
    <WidgetShell
      title="Gasto por canal"
      icon="hub"
      description="De onde veio o uso — clique num canal pra filtrar o painel."
      dragHandle={dragHandle}
      menu={menu}
    >
      <div className="flex h-full flex-col justify-center gap-4">
        {/* Barra de proporção */}
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-(--bg-muted)">
          {rows
            .filter((r) => r.active && r.share > 0)
            .map((r) => (
              <span
                key={r.id}
                className="h-full transition-[width] duration-aw-base ease-aw-out"
                style={{ width: `${r.share}%`, background: r.colorVar }}
                title={`${r.label} · ${brl(r.total)}`}
                aria-hidden="true"
              />
            ))}
        </div>

        <ul className="m-0 flex list-none flex-col p-0">
          {rows.map((r, i) => (
            <li key={r.id} className={cn(i > 0 && "border-t border-(--border-subtle)")}>
              <button
                type="button"
                onClick={() => toggleChannel(r.id)}
                aria-pressed={r.active}
                title={
                  r.active
                    ? `Filtrar sem ${r.label}`
                    : `Incluir ${r.label} no filtro`
                }
                className={cn(
                  "flex w-full items-center gap-3 py-2.5 text-left transition-opacity duration-aw-fast",
                  !r.active && "opacity-45 hover:opacity-70",
                )}
              >
                <AwChannelIcon channel={r.id} size={20} />
                <span className="min-w-0 flex-1 truncate body-sm text-(--fg-primary)">
                  {r.label}
                </span>
                {r.active ? (
                  <>
                    <span className="shrink-0 body-xs tabular-nums text-(--fg-tertiary)">
                      {r.share.toFixed(0)}%
                    </span>
                    <span className="w-24 shrink-0 text-right body-sm font-medium tabular-nums text-(--fg-primary)">
                      {brl(r.total)}
                    </span>
                  </>
                ) : (
                  <span className="shrink-0 body-xs text-(--fg-tertiary)">fora do filtro</span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <p className="m-0 body-xs text-(--fg-tertiary)">
          {SPEND_CHANNELS.length} canais conectados · valores do recorte atual.
        </p>
      </div>
    </WidgetShell>
  );
}
