"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { AwTable } from "@/components/ui/AwTable";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AgentDetailModal } from "./AgentDetailModal";
import {
  brl,
  usd,
  formatQuantity,
  agentType,
  selectionRatio,
  AGENT_BREAKDOWN,
  OVERVIEW_SPEND_CATEGORIES,
  OVERVIEW_SERVICE_GROUPS,
  type AgentBreakdownRow,
  type OverviewServiceGroup,
  type OverviewServiceLeaf,
  type PeriodSelection,
  type SpendingGrouping,
} from "./data";

/* ----------------------------------------------------------------------------
 * Tabela de detalhamento da Visão geral — segue a estrutura do explorador, mas
 * enxuta: SERVIÇO (Item · Quantidade · Unitário · BRL · USD · Participação, com
 * grupos que abrem nos sub-níveis canônicos) SEM a coluna de provedor; AGENTE
 * (Nome · Tipo · Status · BRL · USD · Ver detalhes). Acompanha o toggle do
 * gráfico. Soma fecha com o uso variável do ciclo.
 * ------------------------------------------------------------------------- */

const TH = "aw-eyebrow font-medium text-(--fg-tertiary)";
// Hover na LINHA inteira (não por célula): arredonda só as pontas da linha.
const ROW_HOVER =
  "[&_tbody_tr:hover_td]:!rounded-none " +
  "[&_tbody_tr:hover_td:first-child]:!rounded-l-md " +
  "[&_tbody_tr:hover_td:last-child]:!rounded-r-md";

// "Este mês" em vez de "Ciclo vigente": o usuário precisa ler que o recorte é o
// mês corrente com a data exata, não um jargão de ciclo. (cmt-e7234b9d)
const CYCLE_LABEL = "Este mês · 01–31 de maio";

/** Apoio curto por serviço — dá contexto sem virar jargão. */
const SERVICE_DESC: Record<string, string> = {
  disparos: "Disparos de WhatsApp — marketing, utilidade e serviço",
  mensagens: "Mensagens transacionadas pelos agentes",
  tokens: "Brain, Skills, Knowledge e Cortex dos agentes",
  leads: "Contatos que viraram lead ativo no período",
};

const AGENT_STATUS_VARIANT: Record<AgentBreakdownRow["status"], AwPillVariant> = {
  Ativo: "live",
  Pausado: "neutral",
  Treinando: "warning",
};

const AGENT_CHART_CATEGORIES = OVERVIEW_SPEND_CATEGORIES.agent.filter(
  (c) => c.id !== "outros",
);
const AGENT_CHART_COLOR_BY_ID = new Map(
  AGENT_CHART_CATEGORIES.map((c) => [c.id, c.color]),
);

function usdLabel(brlValue: number): string {
  return `US$ ${usd(brlValue).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Outlier = gasto ≥ 2× a mediana (sinaliza "Acima do esperado"). */
function isOutlier(value: number, all: number[]): boolean {
  const pos = all.filter((v) => v > 0);
  if (pos.length < 3 || value <= 0) return false;
  const sorted = [...pos].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  return median > 0 && value >= median * 2;
}

export function OverviewBreakdownTable({
  grouping,
  selection,
}: {
  grouping: SpendingGrouping;
  selection: PeriodSelection;
}) {
  const ratio = selectionRatio(selection);
  return grouping === "service" ? (
    <ServiceTable ratio={ratio} />
  ) : (
    <AgentTable ratio={ratio} />
  );
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Escala um item pelo fator do período (total + quantidade; -1 = agregado). */
function scaleLeaf(leaf: OverviewServiceLeaf, ratio: number): OverviewServiceLeaf {
  return {
    ...leaf,
    total: r2(leaf.total * ratio),
    quantity: leaf.quantity < 0 ? leaf.quantity : leaf.quantity * ratio,
  };
}
function scaleGroup(g: OverviewServiceGroup, ratio: number): OverviewServiceGroup {
  return {
    ...g,
    total: r2(g.total * ratio),
    quantity: g.quantity < 0 ? g.quantity : g.quantity * ratio,
    children: g.children?.map((c) => scaleLeaf(c, ratio)),
  };
}

/* ---------- serviço ---------- */

function ServiceTable({ ratio }: { ratio: number }) {
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set());
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const groups = React.useMemo(
    () =>
      OVERVIEW_SERVICE_GROUPS.map((g) => scaleGroup(g, ratio)).sort(
        (a, b) => b.total - a.total,
      ),
    [ratio],
  );
  const totalBrl = groups.reduce((s, g) => s + g.total, 0);

  return (
    <TooltipProvider delayDuration={120}>
    <AwTable className={ROW_HOVER}>
      <thead>
        <tr>
          <th className={TH}>Item</th>
          <th className={cn(TH, "text-right")}>Quantidade</th>
          <th className={TH}>Unitário</th>
          <th className={cn(TH, "text-right")}>Total BRL</th>
          <th className={cn(TH, "text-right")}>Total USD</th>
          <th className={cn(TH, "w-40")}>Participação</th>
          <th className="w-10" aria-hidden="true" />
        </tr>
      </thead>
      <tbody>
        {groups.map((g) => {
          const hasChildren = !!g.children?.length;
          const open = expanded.has(g.id);
          const share = totalBrl > 0 ? (g.total / totalBrl) * 100 : 0;
          return (
            <React.Fragment key={g.id}>
              <tr
                onClick={hasChildren ? () => toggle(g.id) : undefined}
                className={cn(hasChildren && "cursor-pointer")}
                aria-expanded={hasChildren ? open : undefined}
              >
                <td>
                  <span className="inline-flex items-center gap-3">
                    {hasChildren ? (
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-(--fg-tertiary)">
                        <Icon
                          name="keyboard_arrow_down"
                          size={18}
                          className={cn(
                            "transition-transform duration-aw-fast ease-aw-out",
                            !open && "-rotate-90",
                          )}
                        />
                      </span>
                    ) : (
                      <span className="h-6 w-6 shrink-0" aria-hidden="true" />
                    )}
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${g.color}26`, color: g.color }}
                    >
                      <Icon name={g.icon} size={18} fill={1} />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="inline-flex items-center gap-2">
                        <span className="truncate font-medium text-(--fg-primary)">
                          {g.label}
                        </span>
                        {g.tooltip && (
                          <InfoTip text={g.tooltip} label={`O que é ${g.label}`} />
                        )}
                      </span>
                      {SERVICE_DESC[g.id] && (
                        <span className="truncate body-xs text-(--fg-tertiary)">
                          {SERVICE_DESC[g.id]}
                        </span>
                      )}
                    </span>
                  </span>
                </td>
                <td className="text-right tabular-nums text-(--fg-secondary)">
                  {formatQuantity(g.quantity, g.quantityFormat)}
                </td>
                <td className="tabular-nums text-(--fg-tertiary)">
                  {g.unitPriceLabel}
                </td>
                <td className="text-right font-medium tabular-nums text-(--fg-primary)">
                  {brl(g.total)}
                </td>
                <td className="text-right tabular-nums text-(--fg-tertiary)">
                  {usdLabel(g.total)}
                </td>
                <td>
                  <ShareBar share={share} color={g.color} />
                </td>
                <td aria-hidden="true" />
              </tr>

              {open &&
                g.children!.map((child) => (
                  <ChildRow key={child.id} child={child} group={g} />
                ))}
            </React.Fragment>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={3} className="font-medium text-(--fg-secondary)">
            Total por serviço
          </td>
          <td className="text-right font-semibold tabular-nums text-(--fg-primary)">
            {brl(totalBrl)}
          </td>
          <td className="text-right font-medium tabular-nums text-(--fg-secondary)">
            {usdLabel(totalBrl)}
          </td>
          <td colSpan={2} aria-hidden="true" />
        </tr>
      </tfoot>
    </AwTable>
    </TooltipProvider>
  );
}

/** Ícone de info + tooltip — só nos itens que costumam gerar dúvida (Tokens e
 *  seus sub-níveis). Para o clique de não propagar pro toggle da linha-pai. */
function InfoTip({ text, label }: { text: string; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex shrink-0 text-(--fg-tertiary) transition-colors hover:text-(--fg-primary)"
        >
          <Icon name="info" size={14} />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[320px] border-(--border-subtle) bg-(--bg-raised) text-pretty text-(--fg-secondary)"
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

function ChildRow({
  child,
  group,
}: {
  child: OverviewServiceLeaf;
  group: OverviewServiceGroup;
}) {
  const share = group.total > 0 ? (child.total / group.total) * 100 : 0;
  return (
    <tr className="animate-in fade-in slide-in-from-top-1 duration-200 motion-reduce:animate-none">
      <td>
        <span className="inline-flex items-center gap-3 pl-9">
          <Icon
            name="subdirectory_arrow_right"
            size={16}
            className="text-(--fg-muted)"
          />
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-(--bg-muted) text-(--fg-tertiary)">
            <Icon name={child.icon} size={16} fill={1} />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="inline-flex items-center gap-1.5">
              <span className="truncate body-sm text-(--fg-secondary)">
                {child.label}
              </span>
              {child.tooltip && (
                <InfoTip text={child.tooltip} label={`O que é ${child.label}`} />
              )}
            </span>
            {child.desc && (
              <span className="truncate body-xs text-(--fg-tertiary)">
                {child.desc}
              </span>
            )}
          </span>
        </span>
      </td>
      <td className="text-right tabular-nums text-(--fg-tertiary)">
        {formatQuantity(child.quantity, child.quantityFormat)}
      </td>
      <td className="tabular-nums text-(--fg-tertiary)">{child.unitPriceLabel}</td>
      <td className="text-right tabular-nums text-(--fg-secondary)">
        {brl(child.total)}
      </td>
      <td className="text-right tabular-nums text-(--fg-tertiary)">
        {usdLabel(child.total)}
      </td>
      <td>
        <ShareBar share={share} color={group.color} muted />
      </td>
      <td aria-hidden="true" />
    </tr>
  );
}

/* ---------- agente ---------- */

function AgentTable({ ratio }: { ratio: number }) {
  const [detail, setDetail] = React.useState<AgentBreakdownRow | null>(null);
  const agents = React.useMemo(
    () =>
      AGENT_CHART_CATEGORIES
        .map((c) => AGENT_BREAKDOWN.find((a) => a.id === c.id))
        .filter((a): a is AgentBreakdownRow => Boolean(a))
        .map((a) => ({ ...a, total: r2(a.total * ratio) })),
    [ratio],
  );
  const allTotals = agents.map((a) => a.total);
  const totalBrl = agents.reduce((s, a) => s + a.total, 0);

  return (
    <>
      <AwTable className={ROW_HOVER}>
        <thead>
          <tr>
            <th className={TH}>Nome</th>
            <th className={TH}>Tipo</th>
            <th className={TH}>Status</th>
            <th className={cn(TH, "text-right")}>Total BRL</th>
            <th className={cn(TH, "text-right")}>Total USD</th>
            <th className="w-28" aria-hidden="true" />
          </tr>
        </thead>
        <tbody>
          {agents.map((a) => (
            <tr key={a.id}>
              <td>
                <span className="inline-flex items-center gap-3">
                  <AgentAvatarWithChartDot
                    agent={a}
                    color={AGENT_CHART_COLOR_BY_ID.get(a.id) ?? "var(--fg-tertiary)"}
                  />
                  <span className="inline-flex items-center gap-2">
                    <span className="truncate font-medium text-(--fg-primary)">
                      {a.label}
                    </span>
                    {isOutlier(a.total, allTotals) && <OutlierBadge />}
                  </span>
                </span>
              </td>
              <td className="text-(--fg-secondary)">{agentType(a.id)}</td>
              <td>
                <AwPill variant={AGENT_STATUS_VARIANT[a.status]}>
                  {a.status}
                </AwPill>
              </td>
              <td className="text-right font-medium tabular-nums text-(--fg-primary)">
                {brl(a.total)}
              </td>
              <td className="text-right tabular-nums text-(--fg-tertiary)">
                {usdLabel(a.total)}
              </td>
              <td className="text-right">
                <button
                  type="button"
                  onClick={() => setDetail(a)}
                  className="inline-flex items-center gap-1 whitespace-nowrap body-xs font-medium text-(--fg-primary) transition-colors duration-aw-fast hover:underline"
                >
                  Ver detalhes
                  <Icon name="arrow_forward" size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3} className="font-medium text-(--fg-secondary)">
              Total por agente
            </td>
            <td className="text-right font-semibold tabular-nums text-(--fg-primary)">
              {brl(totalBrl)}
            </td>
            <td className="text-right font-medium tabular-nums text-(--fg-secondary)">
              {usdLabel(totalBrl)}
            </td>
            <td aria-hidden="true" />
          </tr>
        </tfoot>
      </AwTable>

      <AgentDetailModal
        agent={detail}
        periodLabel={CYCLE_LABEL}
        open={detail !== null}
        onClose={() => setDetail(null)}
      />
    </>
  );
}

/* ---------- apoios ---------- */

function AgentAvatarWithChartDot({
  agent,
  color,
}: {
  agent: AgentBreakdownRow;
  color: string;
}) {
  return (
    <span className="relative inline-flex shrink-0">
      <AwAvatar size="sm" src={agent.avatar} alt={agent.label} />
      <span
        aria-hidden="true"
        className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: "0 0 0 2px var(--bg-raised)",
        }}
      />
    </span>
  );
}

function ShareBar({
  share,
  color,
  muted = false,
}: {
  share: number;
  color: string;
  muted?: boolean;
}) {
  return (
    <span className="flex items-center gap-3">
      <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-(--bg-muted)">
        <span
          className="block h-full rounded-full transition-[width] duration-aw-base ease-aw-out"
          style={{
            width: `${Math.max(2, share)}%`,
            background: color,
            opacity: muted ? 0.55 : 1,
          }}
        />
      </span>
      <span className="w-9 shrink-0 text-right body-xs tabular-nums text-(--fg-tertiary)">
        {share.toFixed(0)}%
      </span>
    </span>
  );
}

function OutlierBadge() {
  return (
    <AwPill variant="warning" dot={false}>
      <Icon name="warning" size={11} />
      Acima do esperado
    </AwPill>
  );
}
