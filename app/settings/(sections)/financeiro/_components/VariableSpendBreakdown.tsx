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
  selectionTarget,
  selectionLabel,
  selectionShowsLimitEvent,
  DEFAULT_PERIOD,
  OVERVIEW_SPEND_CATEGORIES,
  OVERVIEW_SPEND_DAYS,
  OVERVIEW_SPEND_EVENT,
  type PeriodSelection,
  type SpendingGrouping,
} from "./data";
import { OverviewBreakdownTable } from "./OverviewBreakdownTable";
import { PeriodPicker } from "./PeriodPicker";

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

/** Gradient iridescente (azul → lavanda → pêssego → menta), VERTICAL — extraído
 *  do Figma. É EXCLUSIVO da fatia "Outros" (agregada). As demais pilhas são
 *  cor chapada, sem gradiente nenhum. */
const OUTROS_GRADIENT =
  "linear-gradient(180deg, #b7e5ff 0%, #d4e4ff 14%, #f2e4ff 38%, #fff6de 56%, #d6feea 76%, #bdf6f5 100%)";

/** Preenchimento de uma fatia: cor CHAPADA (como no Figma) ou o gradient
 *  iridescente — só pra "Outros". Nada de brilho/sheen nas pilhas comuns. */
function segFill(c: { color: string; gradient?: boolean }): string {
  return c.gradient ? OUTROS_GRADIENT : c.color;
}

const DESTINO_RELATORIO = "/settings/consumo-e-custos/explorar";

/** Marcador de uma categoria — avatar do agente, triângulo gradiente ("Outros")
 *  ou bolinha na cor. `showAvatar` liga a foto no modo agente (legenda); fora
 *  dele cai pra bolinha/triângulo (tooltip, contextos compactos). */
function Swatch({
  cat,
  size = 8,
  showAvatar = false,
}: {
  cat: { color: string; avatar?: string; gradient?: boolean };
  size?: number;
  showAvatar?: boolean;
}) {
  if (showAvatar && cat.avatar) {
    return (
      <img
        src={cat.avatar}
        alt=""
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size, boxShadow: SEG_RING }}
      />
    );
  }
  if (cat.gradient) {
    // Triângulo iridescente (igual ao Figma) pra "Outros".
    return (
      <span
        aria-hidden="true"
        className="shrink-0"
        style={{
          width: size,
          height: size,
          background: OUTROS_GRADIENT,
          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
        }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="shrink-0 rounded-full"
      style={{ width: size, height: size, backgroundColor: cat.color, boxShadow: SEG_RING }}
    />
  );
}

function TooltipSwatch({
  cat,
}: {
  cat: { color: string; avatar?: string; gradient?: boolean };
}) {
  if (!cat.avatar) return <Swatch cat={cat} size={8} />;

  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      <Swatch cat={cat} size={16} showAvatar />
      <Swatch cat={cat} size={6} />
    </span>
  );
}

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
  // Período selecionado (preset ou range custom) — re-escopa gráfico, tabela e
  // total ao mesmo tempo.
  const [selection, setSelection] =
    React.useState<PeriodSelection>(DEFAULT_PERIOD);
  // Categoria em foco (hover na legenda) — isola a série no gráfico.
  const [activeCat, setActiveCat] = React.useState<string | null>(null);

  const series = React.useMemo(
    () => overviewSpendSeries(grouping, selection),
    [grouping, selection],
  );
  const cats = OVERVIEW_SPEND_CATEGORIES[grouping];
  const total = selectionTarget(selection);
  const showEvent = selectionShowsLimitEvent(selection);

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
          total={total}
          selection={selection}
          onSelectPeriod={setSelection}
        />

        <Chart
          key={`${grouping}-${series.length}`}
          series={series}
          cats={cats}
          scale={scale}
          activeCat={activeCat}
          showEvent={showEvent}
        />

        <OverviewBreakdownTable grouping={grouping} selection={selection} />
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
  selection,
  onSelectPeriod,
}: {
  grouping: SpendingGrouping;
  onGrouping: (g: SpendingGrouping) => void;
  cats: typeof OVERVIEW_SPEND_CATEGORIES[SpendingGrouping];
  activeCat: string | null;
  onHover: (id: string | null) => void;
  total: number;
  selection: PeriodSelection;
  onSelectPeriod: (sel: PeriodSelection) => void;
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
                  <Swatch cat={c} size={c.avatar ? 18 : 10} showAvatar />
                  {c.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-col items-end gap-2.5">
        <PeriodPicker value={selection} onChange={onSelectPeriod} />
        <div className="text-right">
          <p className="m-0 text-(length:--h5-size) font-semibold leading-none tracking-heading-tight tabular-nums text-(--fg-primary)">
            {brl(total)}
          </p>
          <p className="m-0 mt-1 body-xs tabular-nums text-(--fg-tertiary)">
            ≈ {fmtUsdLabel(total)} · {selectionLabel(selection)}
          </p>
        </div>
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
  showEvent,
}: {
  series: ReturnType<typeof overviewSpendSeries>;
  cats: typeof OVERVIEW_SPEND_CATEGORIES[SpendingGrouping];
  scale: number;
  activeCat: string | null;
  /** Marcador "Limite restaurado" só aparece no recorte do ciclo (this-month). */
  showEvent: boolean;
}) {
  // Foco por DIA (hover na barra → escurece os outros dias) e a fatia sob o
  // mouse (pra o tooltip reagir à pilha selecionada). O foco por CATEGORIA vem
  // de fora (activeCat: legenda/tabela) e tem prioridade.
  const [activeDay, setActiveDay] = React.useState<number | null>(null);
  const [hoverSeg, setHoverSeg] = React.useState<{
    day: number;
    cat: string;
  } | null>(null);

  const eventLeftPct =
    ((OVERVIEW_SPEND_EVENT.dayIndex + 0.5) / OVERVIEW_SPEND_DAYS) * 100;

  const chartLabel = `Gasto variável por dia. ${cats
    .map((c) => c.label)
    .join(", ")}.`;

  // Muitos dias (30/90) → mostra ~1 rótulo a cada N pra não embolar o eixo.
  const labelStep = series.length > 16 ? Math.ceil(series.length / 12) : 1;
  // Teto de largura por barra: 1 barra (hoje) não vira um bloco gigante; com
  // muitas, o flex-1 encolhe abaixo disso e elas preenchem.
  const BAR_MAX = 96;

  return (
    <div className="rounded-xl border border-(--border-subtle) px-5 pb-4 pt-6">
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

        {/* marcador de evento: limite atingido → cobrança → restaurado. Só o
            badge é hoverável (o resto deixa passar o hover das barras); abre um
            card contando o que rolou no fechamento parcial. Específico do ciclo
            vigente — some nos outros períodos. */}
        {showEvent && (
        <div
          className="pointer-events-none absolute inset-y-0 z-10 flex flex-col items-center"
          style={{ left: `${eventLeftPct}%`, transform: "translateX(-50%)" }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`${OVERVIEW_SPEND_EVENT.title}. ${OVERVIEW_SPEND_EVENT.description}`}
                className="pointer-events-auto mb-1 inline-flex cursor-default items-center gap-1 whitespace-nowrap rounded-full bg-(--aw-emerald-100) px-2 py-0.5 body-xs font-medium text-(--aw-emerald-700) focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--ring-focus)"
              >
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-(--aw-emerald-500)" />
                {OVERVIEW_SPEND_EVENT.label}
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="max-w-[280px] border-(--border-subtle) bg-(--bg-raised) p-0 text-(--fg-secondary)"
            >
              <EventCard />
            </TooltipContent>
          </Tooltip>
          <span
            aria-hidden="true"
            className="w-px flex-1 border-l border-dashed border-(--aw-emerald-300)"
          />
        </div>
        )}

        {/* barras */}
        <div className="absolute inset-0 flex items-end justify-center gap-2">
          {series.map((day, di) => {
            const dayTotal = day.values.reduce((s, v) => s + v, 0);
            return (
              <Tooltip key={di}>
                <TooltipTrigger asChild>
                  <div
                    className="flex h-full flex-1 cursor-default items-end"
                    style={{ maxWidth: BAR_MAX }}
                    onMouseEnter={() => setActiveDay(di)}
                    onMouseLeave={() => {
                      setActiveDay(null);
                      setHoverSeg(null);
                    }}
                  >
                    <div
                      className="flex w-full flex-col-reverse justify-start gap-0.5"
                    >
                      {cats.map((c, ci) => {
                        const v = day.values[ci] ?? 0;
                        if (v <= 0) return null;
                        const h = Math.max(Math.round(v * scale), 3);
                        // Foco por CATEGORIA vem só da legenda (activeCat) e isola
                        // a série em TODOS os dias. Hover na barra isola só AQUELE
                        // dia — não acende a mesma fatia nos outros dias (pedido do
                        // Greg: destacar uma única barra, não todas).
                        const dim = activeCat
                          ? activeCat !== c.id
                          : activeDay !== null && activeDay !== di;
                        // "Outros" só ganha o gradiente iridescente quando focado:
                        // pela legenda OU na fatia exata sob o mouse (este dia).
                        const outrosIdle =
                          c.id === "outros" &&
                          activeCat !== "outros" &&
                          !(hoverSeg?.day === di && hoverSeg?.cat === "outros");
                        return (
                          <div
                            key={c.id}
                            data-overview-chart-segment=""
                            data-category={c.id}
                            data-day={di}
                            onMouseEnter={() => setHoverSeg({ day: di, cat: c.id })}
                            className="w-full transition-[opacity] duration-200 ease-out"
                            style={{
                              height: h,
                              borderRadius: 4,
                              background: segFill(c),
                              opacity: dim ? 0.18 : 1,
                              filter: outrosIdle ? "saturate(0)" : undefined,
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="min-w-[210px] border-(--border-subtle) bg-(--bg-raised) p-0 text-(--fg-secondary)"
                >
                  <DayTooltip
                    label={day.label}
                    cats={cats}
                    values={day.values}
                    total={dayTotal}
                    activeCatId={hoverSeg?.day === di ? hoverSeg.cat : null}
                  />
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* eixo X */}
      <div className="mt-3 flex justify-center gap-2">
        {series.map((day, di) => {
          const focused = activeDay === di && !activeCat;
          const show = di % labelStep === 0 || di === series.length - 1 || focused;
          return (
            <span
              key={di}
              className={cn(
                "flex-1 text-center body-xs tabular-nums transition-colors",
                focused ? "font-medium text-(--fg-secondary)" : "text-(--fg-tertiary)",
              )}
              style={{ maxWidth: BAR_MAX }}
            >
              {show ? day.label : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- card do evento de fechamento (hover no marcador) ---------- */

function EventCard() {
  return (
    <div className="flex flex-col gap-1.5 px-3.5 py-3">
      <span className="inline-flex items-center gap-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-(--aw-emerald-100) text-(--aw-emerald-700)">
          <Icon name="check" size={13} weight={600} />
        </span>
        <span className="body-sm font-semibold text-(--fg-primary)">
          {OVERVIEW_SPEND_EVENT.title}
        </span>
      </span>
      <p className="m-0 body-xs text-(--fg-secondary) text-pretty">
        {OVERVIEW_SPEND_EVENT.description}
      </p>
    </div>
  );
}

function DayTooltip({
  label,
  cats,
  values,
  total,
  activeCatId,
}: {
  label: string;
  cats: typeof OVERVIEW_SPEND_CATEGORIES[SpendingGrouping];
  values: number[];
  total: number;
  /** Fatia sob o mouse — destaca a linha correspondente (o tooltip "muda"
   *  conforme você passa por cada pilha da barra). */
  activeCatId?: string | null;
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
      <ul className="m-0 flex flex-col gap-0.5 p-0">
        {rows.map(({ c, v }) => {
          const on = activeCatId === c.id;
          return (
            <li
              key={c.id}
              className={cn(
                "-mx-1.5 flex list-none items-center justify-between gap-4 rounded-md px-1.5 py-0.5 transition-colors",
                on && "bg-(--bg-hover)",
              )}
            >
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <TooltipSwatch cat={c} />
                <span
                  className={cn(
                    "truncate body-xs",
                    on
                      ? "font-medium text-(--fg-primary)"
                      : "text-(--fg-secondary)",
                  )}
                >
                  {c.label}
                </span>
              </span>
              <span
                className={cn(
                  "body-xs tabular-nums text-(--fg-primary)",
                  on && "font-semibold",
                )}
              >
                {brl(v)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
