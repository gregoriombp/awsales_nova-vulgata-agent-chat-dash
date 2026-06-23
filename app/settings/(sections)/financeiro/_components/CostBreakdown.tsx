"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { AwAlert } from "@/components/ui/AwAlert";
import { Icon } from "@/components/ui/Icon";
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
import { ExportMenu, type ExportFormat } from "./ExportMenu";
import { VariableSpendingBlock } from "./VariableSpendingBlock";
import {
  brl,
  CHARGED_BY_DAY,
  CHARGED_TOTAL,
  DRE_SUMMARY,
  fmtUsdLabel,
  PERIOD_DIFF,
  PERIOD_DIFF_REASON,
  SERVICE_BREAKDOWN,
  USED_BY_DAY,
  USED_META_TOTAL,
  USED_TOTAL,
  USED_WC_TOTAL,
  usd,
  type DRELine,
} from "./data";

// Export estilo Stripe: por dia (usado WC + Meta aproximado + atribuído ao
// provedor) e o detalhamento por serviço com BRL/USD.
function buildDetalhamentoCsv(format: ExportFormat): string {
  if (format !== "csv") {
    return "Detalhamento de custos — Aswork\n(prévia: o PDF definitivo é gerado no servidor)";
  }
  const lines: string[] = [];
  lines.push("Consumo por dia (BRL)");
  lines.push(
    "Dia,Usado WhatsApp Cloud,Usado Meta (aprox.),Atribuído ao provedor",
  );
  USED_BY_DAY.forEach((d, i) => {
    const charged = CHARGED_BY_DAY[i]?.value ?? 0;
    lines.push(
      `${d.label},${d.wc.toFixed(2)},${d.meta.toFixed(2)},${charged.toFixed(2)}`,
    );
  });
  lines.push("");
  lines.push("Detalhamento por serviço");
  lines.push("Item,Categoria,Quantidade,Taxa efetiva,Total BRL,Total USD");
  SERVICE_BREAKDOWN.forEach((r) => {
    const q = r.quantity < 0 ? "" : String(r.quantity);
    lines.push(
      `"${r.label}","${r.category}",${q},"${r.unitPriceLabel}",${r.total.toFixed(2)},${usd(r.total).toFixed(2)}`,
    );
  });
  return lines.join("\n");
}

/**
 * Corpo do "Detalhamento de custos" — a carga pesada de auditoria financeira: o
 * porquê de "usado" nunca bater com "cobrado", o DRE do período e o consumo por
 * dia/serviço/agente em BRL e USD. Compartilhado entre a rota de detalhamento
 * (acessada pelo atalho da Visão geral) e a seção própria "Consumo e custos" da
 * sidebar. O cabeçalho fica por conta de cada página que o usa.
 */
export function CostBreakdown() {
  return (
    <div className="flex flex-col gap-10">
      <UsadoCobradoSection />

      <section className="flex flex-col gap-5 border-t border-(--border-subtle) pt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h6 className="m-0 text-(--fg-primary)">Consumo por dia</h6>
            <p className="m-0 max-w-[680px] body-xs text-(--fg-secondary)">
              Gastos variáveis por serviço ou por agente, no período escolhido.
              Valores em BRL com a conversão em dólar ao câmbio operacional.
            </p>
          </div>
          <ExportMenu
            filenameBase="detalhamento-custos-aswork"
            buildContent={buildDetalhamentoCsv}
            note={
              <>
                Inclui os valores cobrados pela Aswork (WhatsApp Cloud, IA, leads)
                por dia. Os valores aproximados do Meta entram destacados — são
                cobrados direto pela Meta.
              </>
            }
          />
        </div>
        <VariableSpendingBlock />
      </section>
    </div>
  );
}

/* ---------- usado × cobrado ---------- */

function UsadoCobradoSection() {
  return (
    <section className="flex flex-col gap-6">
      <AwAlert
        variant="warning"
        title="Por que “usado” nunca bate com “cobrado” — e por que isso é normal"
      >
        <p className="m-0 body-xs text-(--fg-primary)">
          Funciona como a fatura do cartão: alguns lançamentos só aparecem dias
          depois do uso. Custos podem ser registrados com atraso pelo provedor,
          sobrar do mês anterior ou ficar retidos por falha temporária — tudo
          entra na fatura seguinte.{" "}
          <strong className="font-medium">
            Nada se perde e nada é cobrado duas vezes.
          </strong>
        </p>
      </AwAlert>

      {/* Protagonista: usado no período, dividido em taxas da Aswork e Meta. */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <h5 className="m-0 text-(--fg-primary)">Usado no período</h5>
            <UsedInfoTooltip />
          </div>
          <span className="body-sm tabular-nums text-(--fg-secondary)">
            <strong className="font-medium text-(--fg-primary)">
              {brl(USED_TOTAL)}
            </strong>{" "}
            · {fmtUsdLabel(USED_TOTAL)}
          </span>
        </div>
        <UsedLegend />
        <UsedChart />
      </div>

      <DreSummary />

      {/* Rebaixado: valor atribuído ao provedor, com menos destaque. */}
      <div className="flex flex-col gap-3 border-t border-(--border-subtle) pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h6 className="m-0 text-(--fg-secondary)">
            Valor atribuído ao provedor de pagamento no período
          </h6>
          <span className="body-xs tabular-nums text-(--fg-tertiary)">
            {brl(CHARGED_TOTAL)}
          </span>
        </div>
        <ChargedChart />
      </div>

      <DifferenceBand />
    </section>
  );
}

const USED_CONFIG: ChartConfig = {
  wc: { label: "Taxas Aswork · WhatsApp Cloud", color: "var(--aw-blue-500)" },
  meta: { label: "Meta · aproximado", color: "var(--aw-purple-400)" },
};

const CHARGED_CONFIG: ChartConfig = {
  value: { label: "Atribuído ao provedor", color: "var(--aw-amber-500)" },
};

function UsedChart() {
  const data = React.useMemo(
    () => USED_BY_DAY.map((d) => ({ day: d.label, wc: d.wc, meta: d.meta })),
    [],
  );
  return (
    <ChartContainer config={USED_CONFIG} className="aspect-auto h-[280px] w-full">
      <BarChart
        accessibilityLayer
        data={data}
        margin={{ left: 12, right: 12, top: 8 }}
        barCategoryGap="22%"
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={{ stroke: "var(--border-default)" }}
          axisLine={{ stroke: "var(--border-subtle)" }}
          tickMargin={8}
          minTickGap={16}
        />
        <ChartTooltip
          cursor={{ fill: "var(--bg-hover)" }}
          content={
            <ChartTooltipContent
              indicator="dot"
              className="min-w-[220px] bg-(--bg-raised)"
            />
          }
        />
        <defs>
          <linearGradient id="grad-wc" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-wc)" stopOpacity={0.82} />
            <stop offset="100%" stopColor="var(--color-wc)" stopOpacity={1} />
          </linearGradient>
          <linearGradient id="grad-meta" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-meta)" stopOpacity={0.82} />
            <stop offset="100%" stopColor="var(--color-meta)" stopOpacity={1} />
          </linearGradient>
        </defs>
        <Bar
          dataKey="wc"
          stackId="u"
          fill="url(#grad-wc)"
          maxBarSize={34}
          isAnimationActive={false}
        />
        <Bar
          dataKey="meta"
          stackId="u"
          fill="url(#grad-meta)"
          maxBarSize={34}
          radius={[4, 4, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  );
}

function ChargedChart() {
  const data = React.useMemo(
    () => CHARGED_BY_DAY.map((d) => ({ day: d.label, value: d.value })),
    [],
  );
  return (
    <ChartContainer config={CHARGED_CONFIG} className="aspect-auto h-[160px] w-full">
      <BarChart
        accessibilityLayer
        data={data}
        margin={{ left: 12, right: 12, top: 8 }}
        barCategoryGap="22%"
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={{ stroke: "var(--border-default)" }}
          axisLine={{ stroke: "var(--border-subtle)" }}
          tickMargin={8}
          minTickGap={16}
        />
        <ChartTooltip
          cursor={{ fill: "var(--bg-hover)" }}
          content={
            <ChartTooltipContent
              indicator="dot"
              className="min-w-[200px] bg-(--bg-raised)"
            />
          }
        />
        <defs>
          <linearGradient id="grad-value" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.7} />
            <stop offset="100%" stopColor="var(--color-value)" stopOpacity={1} />
          </linearGradient>
        </defs>
        <Bar
          dataKey="value"
          fill="url(#grad-value)"
          maxBarSize={30}
          radius={[4, 4, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartContainer>
  );
}

function UsedLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <LegendDot color="var(--aw-blue-500)" label="Taxas Aswork · WhatsApp Cloud" />
      <span className="inline-flex items-center gap-2 body-xs text-(--fg-secondary)">
        <span
          aria-hidden="true"
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ background: "var(--aw-purple-400)" }}
        />
        Meta · aproximado
        <MetaInfoTooltip />
      </span>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 body-xs text-(--fg-secondary)">
      <span
        aria-hidden="true"
        className="inline-block h-2.5 w-2.5 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

function MetaInfoTooltip() {
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="O que é o valor do Meta"
            className="inline-flex text-(--fg-tertiary) hover:text-(--fg-primary)"
          >
            <Icon name="info" size={14} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[260px] border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)"
        >
          Os valores do Meta ({brl(USED_META_TOTAL)} no período) são{" "}
          <strong className="font-medium text-(--fg-primary)">aproximados</strong>{" "}
          e cobrados diretamente pela Meta no cartão que você cadastrou lá — não
          passam pela Aswork.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function UsedInfoTooltip() {
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="O que é usado no período"
            className="inline-flex text-(--fg-tertiary) hover:text-(--fg-primary)"
          >
            <Icon name="info" size={15} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[280px] border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)"
        >
          Tudo que você consumiu no período: {brl(USED_WC_TOTAL)} em taxas da
          Aswork (WhatsApp Cloud, IA, leads) + {brl(USED_META_TOTAL)} aproximados
          do Meta.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ---------- DRE do período ---------- */

function DreSummary() {
  return (
    <div className="flex flex-col gap-1 border-t border-(--border-subtle) pt-5">
      <div className="mb-1 flex items-center gap-2">
        <p className="m-0 aw-eyebrow text-(--fg-tertiary)">
          Resumo financeiro do período
        </p>
        <span className="body-3xs text-(--fg-muted)">
          referente ao usado no período
        </span>
      </div>
      <ul className="m-0 flex list-none flex-col gap-0 p-0">
        {DRE_SUMMARY.map((line) => (
          <DreRow key={line.id} line={line} />
        ))}
      </ul>
    </div>
  );
}

function dreDotColor(kind: DRELine["kind"]): string {
  switch (kind) {
    case "subtract":
      return "var(--aw-emerald-500)";
    case "add":
      return "var(--aw-amber-500)";
    case "total":
      return "var(--fg-primary)";
    default:
      return "var(--aw-blue-500)";
  }
}

function DreRow({ line }: { line: DRELine }) {
  const isTotal = line.kind === "total";
  const sign =
    line.kind === "subtract" ? "−" : line.kind === "add" && line.value > 0 ? "+" : "";
  const valueClass =
    line.kind === "subtract"
      ? "text-(--accent-success)"
      : "text-(--fg-primary)";

  return (
    <li
      className={
        "flex items-center justify-between gap-4 py-2 " +
        (isTotal ? "mt-1 border-t border-(--border-subtle) pt-3" : "")
      }
    >
      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: dreDotColor(line.kind) }}
        />
        <span
          className={
            isTotal
              ? "body-sm font-semibold text-(--fg-primary)"
              : "body-sm text-(--fg-secondary)"
          }
        >
          {line.label}
        </span>
        <DreTooltip text={line.tooltip} />
      </span>
      <span
        className={
          "tabular-nums " +
          (isTotal ? "body-sm font-semibold " : "body-sm ") +
          valueClass
        }
      >
        {sign}
        {brl(Math.abs(line.value))}
      </span>
    </li>
  );
}

function DreTooltip({ text }: { text: string }) {
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Detalhe"
            className="inline-flex text-(--fg-tertiary) hover:text-(--fg-primary)"
          >
            <Icon name="info" size={13} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[280px] border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)"
        >
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ---------- faixa da diferença ---------- */

function DifferenceBand() {
  const positive = PERIOD_DIFF >= 0;
  return (
    <AwAlert
      variant="warning"
      icon="sync_alt"
      title={`Diferença do período: ${positive ? "+" : "−"}${brl(
        Math.abs(PERIOD_DIFF),
      )} (cobrado ${positive ? ">" : "<"} usado)`}
    >
      <p className="m-0 body-xs text-(--fg-primary)">
        {PERIOD_DIFF_REASON} Os valores do Meta não entram nesta conta — são
        cobrados diretamente pela Meta.
      </p>
    </AwAlert>
  );
}
