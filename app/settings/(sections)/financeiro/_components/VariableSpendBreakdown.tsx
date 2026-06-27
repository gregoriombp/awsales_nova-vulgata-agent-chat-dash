"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { AwButton } from "@/components/ui/AwButton";
import { AwModal } from "@/components/ui/AwModal";
import { AwSegmented } from "@/components/ui/AwSegmented";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  brl,
  fmtUsdLabel,
  overviewSpendSeries,
  overviewSpendTotals,
  OVERVIEW_KPIS,
  OVERVIEW_SPEND_CATEGORIES,
  OVERVIEW_SPEND_DAYS,
  OVERVIEW_SPEND_EVENT,
  type SpendingGrouping,
} from "./data";

/* ----------------------------------------------------------------------------
 * Detalhamento — gasto variável por dia (recorte simbólico da Visão geral).
 *
 * Um gráfico de barras empilhadas (um dia por barra) + a tabela vinculada logo
 * abaixo. O toggle Serviço/Agente reagrupa os DOIS ao mesmo tempo, da mesma
 * fonte (overviewSpend*). Sem quebra Meta/Aswork — essa leitura por provedor
 * fica no relatório completo (explorador), pra onde tanto este botão quanto o
 * card de CTA levam, sempre com uma confirmação antes de sair.
 *
 * Cores do gráfico: rampa própria (SPEND_RAMP), aplicada via `style` inline —
 * fora dos tokens, como autorizado pra este gráfico.
 * ------------------------------------------------------------------------- */

const PLOT_H = 300; // altura útil do plot (px)
const SEG_GAP = 4; // respiro entre fatias da mesma barra (px)
/** Hairline sutil pra definir a borda das fatias claras sobre o branco. */
const SEG_RING = "inset 0 0 0 1px rgba(17,24,39,0.06)";

const DESTINO_RELATORIO = "/settings/consumo-e-custos/explorar";

/* ---------- modal: confirmação antes de ir pro relatório completo ---------- */

export function ReportExitModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  return (
    <AwModal
      open={open}
      onClose={onClose}
      title="Abrir o relatório completo?"
      footer={
        <>
          <AwButton variant="ghost" size="sm" onClick={onClose}>
            Ficar aqui
          </AwButton>
          <AwButton
            variant="primary"
            size="sm"
            iconRight="arrow_forward"
            onClick={() => router.push(DESTINO_RELATORIO)}
          >
            Abrir relatório
          </AwButton>
        </>
      }
    >
      <p className="m-0 body-sm text-(--fg-secondary) text-pretty">
        Você vai sair da Visão geral e entrar no explorador de Análises
        detalhadas — com filtro por período e a conciliação entre o que foi
        usado e o que foi cobrado, item a item. Dá pra voltar quando quiser.
      </p>
    </AwModal>
  );
}

/* ---------- a seção inteira ---------- */

export function VariableSpendBreakdown({
  onOpenReport,
}: {
  /** Abre a confirmação de saída pro relatório completo (compartilhada com o
   *  card de CTA na página). */
  onOpenReport: () => void;
}) {
  const [grouping, setGrouping] = React.useState<SpendingGrouping>("service");
  // Categoria em foco (hover na legenda ou na tabela) — isola a série no
  // gráfico e realça a linha. É o que torna gráfico e tabela "vinculados".
  const [activeCat, setActiveCat] = React.useState<string | null>(null);

  const series = React.useMemo(() => overviewSpendSeries(grouping), [grouping]);
  const totals = React.useMemo(
    () =>
      overviewSpendTotals(grouping)
        .slice()
        .sort((a, b) => b.total - a.total),
    [grouping],
  );
  const cats = OVERVIEW_SPEND_CATEGORIES[grouping];
  const cycleTotal = OVERVIEW_KPIS.accumulated;

  // Escala vertical: a barra mais alta (somando as fatias + respiros) encosta
  // no topo do plot.
  const maxStack = React.useMemo(
    () => Math.max(...series.map((d) => d.values.reduce((s, v) => s + v, 0)), 1),
    [series],
  );
  const reservedGap = SEG_GAP * Math.max(cats.length - 1, 0);
  const scale = (PLOT_H - reservedGap) / maxStack;

  // Trocar de agrupamento zera o foco (categorias mudam).
  React.useEffect(() => setActiveCat(null), [grouping]);

  return (
    <TooltipProvider delayDuration={80}>
      <section className="flex flex-col gap-(--space-6)">
        <Header onOpenReport={onOpenReport} />

        <Controls
          grouping={grouping}
          onGrouping={setGrouping}
          cats={cats}
          activeCat={activeCat}
          onHover={setActiveCat}
          total={cycleTotal}
        />

        <Chart
          series={series}
          cats={cats}
          scale={scale}
          activeCat={activeCat}
          onHoverCat={setActiveCat}
        />

        <BreakdownTable
          grouping={grouping}
          rows={totals}
          total={cycleTotal}
          activeCat={activeCat}
          onHover={setActiveCat}
        />
      </section>
    </TooltipProvider>
  );
}

/* ---------- cabeçalho ---------- */

function Header({ onOpenReport }: { onOpenReport: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h3 className="m-0 text-(length:--h5-size) font-semibold tracking-heading-tight text-(--fg-primary)">
          Detalhamento
        </h3>
        <p className="m-0 mt-1 max-w-xl body-sm text-(--fg-secondary) text-pretty">
          Gasto variável por dia no ciclo, agrupado por serviço ou por agente. A
          tabela acompanha o gráfico.
        </p>
      </div>
      <AwButton
        variant="secondary"
        size="sm"
        iconLeft="arrow_outward"
        className="shrink-0"
        onClick={onOpenReport}
      >
        Relatório completo
      </AwButton>
    </div>
  );
}

/* ---------- toggle + legenda + total ---------- */

function Controls({
  grouping,
  onGrouping,
  cats,
  activeCat,
  onHover,
  total,
}: {
  grouping: SpendingGrouping;
  onGrouping: (g: SpendingGrouping) => void;
  cats: typeof OVERVIEW_SPEND_CATEGORIES[SpendingGrouping];
  activeCat: string | null;
  onHover: (id: string | null) => void;
  total: number;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <AwSegmented<SpendingGrouping>
          ariaLabel="Agrupar gasto por"
          size="sm"
          value={grouping}
          onChange={onGrouping}
          options={[
            { value: "service", label: "Serviço" },
            { value: "agent", label: "Agente" },
          ]}
        />
        {/* Legenda — a cor é a chave que liga a fatia do gráfico à linha da
            tabela. Passar o mouse isola a categoria nos dois. */}
        <ul className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1.5 p-0">
          {cats.map((c) => {
            const dim = activeCat !== null && activeCat !== c.id;
            return (
              <li key={c.id} className="list-none">
                <button
                  type="button"
                  onMouseEnter={() => onHover(c.id)}
                  onMouseLeave={() => onHover(null)}
                  onFocus={() => onHover(c.id)}
                  onBlur={() => onHover(null)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 body-xs text-(--fg-tertiary) transition-opacity",
                    "hover:text-(--fg-secondary) focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--ring-focus)",
                    dim && "opacity-40",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: c.color, boxShadow: SEG_RING }}
                  />
                  {c.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="text-right">
        <p className="m-0 text-(length:--h5-size) font-semibold leading-none tracking-heading-tight tabular-nums text-(--fg-primary)">
          {brl(total)}
        </p>
        <p className="m-0 mt-1 body-xs tabular-nums text-(--fg-tertiary)">
          ≈ {fmtUsdLabel(total)} · Ciclo vigente · 01–31 de maio
        </p>
      </div>
    </div>
  );
}

/* ---------- gráfico de barras empilhadas ---------- */

function Chart({
  series,
  cats,
  scale,
  activeCat,
  onHoverCat,
}: {
  series: ReturnType<typeof overviewSpendSeries>;
  cats: typeof OVERVIEW_SPEND_CATEGORIES[SpendingGrouping];
  scale: number;
  activeCat: string | null;
  onHoverCat: (id: string | null) => void;
}) {
  const eventLeftPct =
    ((OVERVIEW_SPEND_EVENT.dayIndex + 0.5) / OVERVIEW_SPEND_DAYS) * 100;

  const chartLabel = `Gasto variável por dia. ${cats
    .map((c) => c.label)
    .join(", ")}.`;

  return (
    <div className="rounded-xl border border-(--border-subtle) bg-(--bg-surface) px-5 pt-6 pb-4">
      <div
        className="relative"
        role="img"
        aria-label={chartLabel}
        style={{ height: PLOT_H }}
      >
        {/* grades verticais sutis */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex justify-between"
        >
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className="w-px bg-(--border-subtle) opacity-50" />
          ))}
        </div>

        {/* marcador de evento: "Limite restaurado" */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 z-10 flex flex-col items-center"
          style={{ left: `${eventLeftPct}%`, transform: "translateX(-50%)" }}
        >
          <span className="mb-1 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-(--aw-emerald-100) px-2 py-0.5 body-xs font-medium text-(--aw-emerald-700)">
            <span className="h-1.5 w-1.5 rounded-full bg-(--aw-emerald-500)" />
            {OVERVIEW_SPEND_EVENT.label}
          </span>
          <span className="w-px flex-1 border-l border-dashed border-(--aw-emerald-300)" />
        </div>

        {/* barras */}
        <div className="absolute inset-0 flex items-end gap-2">
          {series.map((day, di) => {
            const dayTotal = day.values.reduce((s, v) => s + v, 0);
            return (
              <Tooltip key={di}>
                <TooltipTrigger asChild>
                  <div
                    className="group flex h-full flex-1 cursor-default items-end"
                    onMouseLeave={() => onHoverCat(null)}
                  >
                    <div className="flex w-full flex-col-reverse justify-start gap-1">
                      {cats.map((c, ci) => {
                        const v = day.values[ci] ?? 0;
                        if (v <= 0) return null;
                        const h = Math.max(Math.round(v * scale), 3);
                        const dim = activeCat !== null && activeCat !== c.id;
                        return (
                          <div
                            key={c.id}
                            onMouseEnter={() => onHoverCat(c.id)}
                            className="w-full rounded-md transition-[opacity,transform] duration-200 ease-out group-hover:scale-[1.02]"
                            style={{
                              height: h,
                              backgroundColor: c.color,
                              boxShadow: SEG_RING,
                              opacity: dim ? 0.22 : 1,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="min-w-[200px] border-(--border-subtle) bg-(--bg-raised) p-0 text-(--fg-secondary)"
                >
                  <DayTooltip
                    label={day.label}
                    cats={cats}
                    values={day.values}
                    total={dayTotal}
                  />
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* eixo X */}
      <div className="mt-3 flex gap-2">
        {series.map((day, di) => (
          <span
            key={di}
            className="flex-1 text-center body-xs tabular-nums text-(--fg-tertiary)"
          >
            {day.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function DayTooltip({
  label,
  cats,
  values,
  total,
}: {
  label: string;
  cats: typeof OVERVIEW_SPEND_CATEGORIES[SpendingGrouping];
  values: number[];
  total: number;
}) {
  // Da maior pra menor fatia do dia — leitura rápida do que pesou.
  const rows = cats
    .map((c, i) => ({ c, v: values[i] ?? 0 }))
    .filter((r) => r.v > 0)
    .sort((a, b) => b.v - a.v);
  return (
    <div className="flex flex-col gap-2 px-3 py-2.5">
      <div className="flex items-baseline justify-between gap-6">
        <span className="aw-eyebrow text-(--fg-tertiary)">{label}</span>
        <span className="body-sm font-semibold tabular-nums text-(--fg-primary)">
          {brl(total)}
        </span>
      </div>
      <ul className="m-0 flex flex-col gap-1 p-0">
        {rows.map(({ c, v }) => (
          <li
            key={c.id}
            className="flex list-none items-center justify-between gap-4"
          >
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: c.color, boxShadow: SEG_RING }}
              />
              <span className="truncate body-xs text-(--fg-secondary)">
                {c.label}
              </span>
            </span>
            <span className="body-xs tabular-nums text-(--fg-primary)">
              {brl(v)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- tabela vinculada ---------- */

function BreakdownTable({
  grouping,
  rows,
  total,
  activeCat,
  onHover,
}: {
  grouping: SpendingGrouping;
  rows: ReturnType<typeof overviewSpendTotals>;
  total: number;
  activeCat: string | null;
  onHover: (id: string | null) => void;
}) {
  const headLabel = grouping === "service" ? "Serviço" : "Agente";
  return (
    <table className="w-full border-collapse text-left">
      <thead>
        <tr className="border-b border-(--border-subtle)">
          <th className="py-2 pr-3 aw-eyebrow font-medium text-(--fg-tertiary)">
            {headLabel}
          </th>
          <th className="w-[42%] px-3 py-2 aw-eyebrow font-medium text-(--fg-tertiary)">
            Participação
          </th>
          <th className="py-2 pl-3 text-right aw-eyebrow font-medium text-(--fg-tertiary)">
            Valor no ciclo
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ category, total: value }) => {
          const pct = total > 0 ? (value / total) * 100 : 0;
          const dim = activeCat !== null && activeCat !== category.id;
          const on = activeCat === category.id;
          return (
            <tr
              key={category.id}
              onMouseEnter={() => onHover(category.id)}
              onMouseLeave={() => onHover(null)}
              className={cn(
                "border-b border-(--border-subtle) transition-colors last:border-b-0",
                on && "bg-(--bg-hover)",
                dim && "opacity-45",
              )}
            >
              {/* nome — avatar (agente) ou ponto + ícone (serviço) */}
              <td className="py-2.5 pr-3">
                <span className="inline-flex min-w-0 items-center gap-2">
                  {category.avatar ? (
                    <img
                      src={category.avatar}
                      alt=""
                      className="h-6 w-6 shrink-0 rounded-full object-cover"
                      style={{ boxShadow: SEG_RING }}
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: `${category.color}26`,
                        color: category.color,
                      }}
                    >
                      <Icon name={category.icon ?? "category"} size={15} />
                    </span>
                  )}
                  <span className="min-w-0 truncate body-sm font-medium text-(--fg-primary)">
                    {category.label}
                  </span>
                </span>
              </td>

              {/* participação — barra na cor da categoria + % */}
              <td className="px-3 py-2.5">
                <span className="flex items-center gap-2.5">
                  <span className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-(--bg-muted)">
                    <span
                      className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500 ease-out"
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                        backgroundColor: category.color,
                        boxShadow: SEG_RING,
                      }}
                    />
                  </span>
                  <span className="w-10 shrink-0 text-right body-xs tabular-nums text-(--fg-secondary)">
                    {pct.toFixed(0)}%
                  </span>
                </span>
              </td>

              {/* valor */}
              <td className="py-2.5 pl-3 text-right">
                <span className="body-sm font-medium tabular-nums text-(--fg-primary)">
                  {brl(value)}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <td className="py-2.5 pr-3 body-sm font-medium text-(--fg-secondary)">
            Total do ciclo
          </td>
          <td aria-hidden="true" />
          <td className="py-2.5 pl-3 text-right">
            <span className="body-sm font-semibold tabular-nums text-(--fg-primary)">
              {brl(total)}
            </span>
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
