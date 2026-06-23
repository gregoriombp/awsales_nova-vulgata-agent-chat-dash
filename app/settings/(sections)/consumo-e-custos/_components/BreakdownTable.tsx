"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import { AwTable } from "@/components/ui/AwTable";
import { Icon } from "@/components/ui/Icon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AgentDetailModal } from "../../financeiro/_components/AgentDetailModal";
import {
  agentType,
  AGENT_BREAKDOWN,
  brl,
  formatQuantity,
  OPERATIONAL_FX,
  scaleBreakdown,
  scaleCustomBreakdown,
  SERVICE_BREAKDOWN,
  usd,
  type AgentBreakdownRow,
  type ServiceBreakdownRow,
} from "../../financeiro/_components/data";
import { useConsumo } from "./ConsumoContext";
import { WidgetShell } from "./WidgetBoard";

/* ----------------------------------------------------------------------------
 * Tabela de detalhamento (widget). Porte da tabela agrupada canônica (W2C) do
 * VariableSpendingBlock, agora lendo grouping/período/filtro do contexto.
 * ------------------------------------------------------------------------- */

function fmtUsd(brlValue: number): string {
  return `US$ ${usd(brlValue).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function BreakdownTableWidget({
  dragHandle,
  resizeButton,
}: {
  dragHandle?: React.ReactNode;
  resizeButton?: React.ReactNode;
}) {
  const { grouping } = useConsumo();
  return (
    <WidgetShell
      title="Detalhamento"
      icon="table_rows"
      description={
        grouping === "service"
          ? "Por serviço / taxa — taxonomia canônica, com BRL e USD"
          : "Por agente — consumo do ciclo, com BRL e USD"
      }
      dragHandle={dragHandle}
      resizeButton={resizeButton}
    >
      {grouping === "service" ? <ServiceTable /> : <AgentTable />}
    </WidgetShell>
  );
}

/* ---------- serviço ---------- */

type ServiceGroupDef = {
  id: string;
  label: string;
  icon: string;
  rowIds: string[];
  unitNoun: string;
  aggregateFormat: ServiceBreakdownRow["quantityFormat"];
};

const SERVICE_GROUPS: ServiceGroupDef[] = [
  { id: "meta", label: "Meta", icon: "campaign", rowIds: ["disp-mkt", "disp-util"], unitNoun: "disparos", aggregateFormat: "decimal" },
  { id: "msg", label: "Mensagem", icon: "forum", rowIds: ["msgs"], unitNoun: "mensagens", aggregateFormat: "decimal" },
  { id: "leads", label: "Leads", icon: "person_add", rowIds: ["leads"], unitNoun: "leads ativos", aggregateFormat: "decimal" },
  { id: "tel", label: "Telefone", icon: "call", rowIds: ["linha"], unitNoun: "linha", aggregateFormat: "decimal" },
  { id: "ai", label: "AI", icon: "agent", rowIds: ["tok-k", "tok-b", "tok-s"], unitNoun: "tokens", aggregateFormat: "abbrev" },
  { id: "outros", label: "Outros", icon: "more_horiz", rowIds: ["outros"], unitNoun: "itens", aggregateFormat: "lump" },
];

const DEFAULT_EXPANDED = ["meta", "ai"];

function isOutlier(value: number, all: number[]): boolean {
  const positives = all.filter((v) => v > 0);
  if (positives.length < 3 || value <= 0) return false;
  const sorted = [...positives].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  return median > 0 && value >= median * 2;
}

function OutlierBadge() {
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-default">
            <AwPill variant="warning" dot={false}>
              <Icon name="warning" size={11} />
              Outlier
            </AwPill>
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-[240px] border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)"
        >
          Gasto ≥ 2× a mediana dos outros grupos no período — vale investigar.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

type ServiceGroup = {
  def: ServiceGroupDef;
  members: ServiceBreakdownRow[];
  groupTotal: number;
  qtySum: number;
  hasQty: boolean;
};

function ServiceTable() {
  const { selection, customDays, allowedRowIds, accumulated } = useConsumo();
  const [expanded, setExpanded] = React.useState<Set<string>>(
    () => new Set(DEFAULT_EXPANDED),
  );

  const rows = React.useMemo<ServiceBreakdownRow[]>(() => {
    const scaled = (
      selection.kind === "custom"
        ? scaleCustomBreakdown(SERVICE_BREAKDOWN, customDays)
        : scaleBreakdown(SERVICE_BREAKDOWN, selection.id)
    ) as ServiceBreakdownRow[];
    return scaled.filter((r) => allowedRowIds.has(r.id));
  }, [selection, customDays, allowedRowIds]);

  const byId = React.useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]);

  const groups = React.useMemo<ServiceGroup[]>(() => {
    return SERVICE_GROUPS.flatMap((def) => {
      const members = def.rowIds
        .map((id) => byId.get(id))
        .filter((r): r is ServiceBreakdownRow => Boolean(r));
      if (members.length === 0) return [];
      const groupTotal = members.reduce((s, r) => s + r.total, 0);
      const qtySum = members.reduce(
        (s, r) => (r.quantity >= 0 ? s + r.quantity : s),
        0,
      );
      const hasQty = members.some((r) => r.quantity >= 0);
      return [{ def, members, groupTotal, qtySum, hasQty }];
    });
  }, [byId]);

  const allTotals = React.useMemo(() => groups.map((g) => g.groupTotal), [groups]);
  const total = groups.reduce((s, g) => s + g.groupTotal, 0);
  const matchesCard = Math.abs(total - accumulated) < 1;

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (groups.length === 0) {
    return (
      <p className="m-0 py-6 text-center body-sm text-(--fg-tertiary)">
        Nenhum serviço no filtro selecionado.
      </p>
    );
  }

  return (
    <AwTable>
      <thead>
        <tr>
          <th>Grupo / Sub-nível</th>
          <th>Quantidade</th>
          <th>Unitário</th>
          <th className="text-right">Total BRL</th>
          <th className="text-right">Total USD</th>
        </tr>
      </thead>
      <tbody>
        {groups.map((g, gi) => {
          const expandable = g.members.length > 1;
          const isOpen = expandable && expanded.has(g.def.id);
          const outlier = isOutlier(g.groupTotal, allTotals);
          const qtyFmt = expandable ? g.def.aggregateFormat : g.members[0].quantityFormat;
          const qtyLabel = g.hasQty
            ? `${formatQuantity(g.qtySum, qtyFmt)} ${g.def.unitNoun}`
            : "—";
          const unitLabel = expandable ? "Misto" : g.members[0].unitPriceLabel;

          // Cada item da tabela é uma linha arredondada. Grupos COM filhos ganham
          // bg-cinza fixo e se fundem com seus sub-níveis num único painel (topo
          // arredondado aqui, base no último filho). Linhas soltas ficam
          // transparentes e arredondam no hover.
          const cellBase = cn("border-0!", expandable && "bg-(--bg-muted)");
          const firstCorner = expandable && isOpen ? "rounded-tl-lg" : "rounded-l-lg";
          const lastCorner = expandable && isOpen ? "rounded-tr-lg" : "rounded-r-lg";

          return (
            <React.Fragment key={g.def.id}>
              <tr>
                <td className={cn(cellBase, firstCorner)}>
                  {expandable ? (
                    <button
                      type="button"
                      onClick={() => toggle(g.def.id)}
                      aria-expanded={isOpen}
                      className="group/exp inline-flex items-start gap-2 text-left"
                    >
                      <Icon
                        name="chevron_right"
                        size={18}
                        className={
                          "mt-0.5 shrink-0 text-(--fg-tertiary) transition-transform duration-aw-base ease-aw-out " +
                          (isOpen ? "rotate-90" : "")
                        }
                      />
                      <Icon name={g.def.icon} size={18} className="mt-0.5 shrink-0 text-(--fg-tertiary)" />
                      <span className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-2">
                          <span className="font-medium text-(--fg-primary)">{g.def.label}</span>
                          {outlier && <OutlierBadge />}
                        </span>
                        <span className="body-3xs text-(--fg-tertiary)">
                          {g.members.length} sub-{g.members.length === 1 ? "nível" : "níveis"} canônico
                        </span>
                      </span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-2 pl-[26px]">
                      <Icon name={g.def.icon} size={18} className="shrink-0 text-(--fg-tertiary)" />
                      <span className="font-medium text-(--fg-primary)">{g.def.label}</span>
                      {outlier && <OutlierBadge />}
                    </span>
                  )}
                </td>
                <td className={cn(cellBase, "align-top tabular-nums text-(--fg-secondary)")}>{qtyLabel}</td>
                <td className={cn(cellBase, "align-top tabular-nums text-(--fg-secondary)")}>{unitLabel}</td>
                <td className={cn(cellBase, "align-top text-right font-medium tabular-nums text-(--fg-primary)")}>
                  {brl(g.groupTotal)}
                </td>
                <td className={cn(cellBase, lastCorner, "align-top text-right tabular-nums text-(--fg-tertiary)")}>
                  {fmtUsd(g.groupTotal)}
                </td>
              </tr>
              {expandable &&
                g.members.map((sub, idx) => {
                  const last = idx === g.members.length - 1;
                  return (
                    <tr key={sub.id}>
                      <SubCell
                        open={isOpen}
                        corner={cn(last && "rounded-bl-lg")}
                        inner="pl-[52px] pr-5 py-2.5 body-sm text-(--fg-secondary)"
                      >
                        <span className="text-(--fg-tertiary)">↳</span> {sub.label}
                      </SubCell>
                      <SubCell open={isOpen} inner="px-5 py-2.5 body-xs tabular-nums text-(--fg-tertiary)">
                        {formatQuantity(sub.quantity, sub.quantityFormat)}
                      </SubCell>
                      <SubCell open={isOpen} inner="px-5 py-2.5 body-xs tabular-nums text-(--fg-tertiary)">
                        {sub.unitPriceLabel}
                      </SubCell>
                      <SubCell open={isOpen} inner="px-5 py-2.5 text-right body-xs tabular-nums text-(--fg-secondary)">
                        {brl(sub.total)}
                      </SubCell>
                      <SubCell
                        open={isOpen}
                        corner={cn(last && "rounded-br-lg")}
                        inner="px-5 py-2.5 text-right body-xs tabular-nums text-(--fg-tertiary)"
                      >
                        {fmtUsd(sub.total)}
                      </SubCell>
                    </tr>
                  );
                })}
              {gi < groups.length - 1 && (
                <tr aria-hidden="true">
                  <td colSpan={5} className="h-2 border-0! p-0!" />
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={3} className="border-t border-(--border-subtle)! align-top pt-4">
            <span className="font-semibold text-(--fg-primary)">TOTAL</span>
            <span className="block body-3xs text-(--fg-tertiary)">
              câmbio operacional R$ {OPERATIONAL_FX.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · taxonomia canon (W2C)
            </span>
          </td>
          <td className="border-t border-(--border-subtle)! align-top pt-4 text-right font-semibold tabular-nums text-(--fg-primary)">
            {brl(total)}
            {matchesCard && (
              <span className="mt-0.5 flex items-center justify-end gap-0.5 body-3xs font-medium text-(--accent-success)">
                <Icon name="check" size={13} />
                bate com card
              </span>
            )}
          </td>
          <td className="border-t border-(--border-subtle)! align-top pt-4 text-right font-semibold tabular-nums text-(--fg-secondary)">
            {fmtUsd(total)}
          </td>
        </tr>
      </tfoot>
    </AwTable>
  );
}

/* Célula de sub-nível com colapso suave. A linha continua na grade da tabela
 * (colunas alinhadas com o grupo), mas a altura anima de verdade: a `<td>` zera
 * padding/borda e o conteúdo vive num wrapper `grid-rows: 0fr → 1fr` com
 * overflow oculto — abre e fecha sem "pular". O `bg` fica na própria célula e os
 * 4 cantos externos do bloco recebem `corner` pra ler como um painel cinza
 * levemente arredondado. Respeita `prefers-reduced-motion`. */
function SubCell({
  open,
  corner,
  inner,
  children,
}: {
  open: boolean;
  corner?: string;
  inner: string;
  children: React.ReactNode;
}) {
  return (
    <td className={cn("bg-(--bg-muted) border-0! p-0!", corner)}>
      <div
        className="grid transition-[grid-template-rows] duration-aw-base ease-aw-out motion-reduce:transition-none"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className={inner}>{children}</div>
        </div>
      </div>
    </td>
  );
}

/* ---------- agente ---------- */

type SortKey = "label" | "role" | "status" | "total" | "usd";
type SortDir = "asc" | "desc";

function agentStatusVariant(status: AgentBreakdownRow["status"]): AwPillVariant {
  switch (status) {
    case "Ativo":
      return "live";
    case "Pausado":
      return "draft";
    case "Treinando":
      return "beta";
  }
}

function AgentTable() {
  const { selection, customDays, visibleIds, accumulated, periodLabel } =
    useConsumo();
  const [sortKey, setSortKey] = React.useState<SortKey>("total");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  const [detail, setDetail] = React.useState<AgentBreakdownRow | null>(null);

  const scaled = React.useMemo<AgentBreakdownRow[]>(() => {
    const rows = (
      selection.kind === "custom"
        ? scaleCustomBreakdown(AGENT_BREAKDOWN, customDays)
        : scaleBreakdown(AGENT_BREAKDOWN, selection.id)
    ) as AgentBreakdownRow[];
    return rows.filter((r) => visibleIds.has(r.id));
  }, [selection, customDays, visibleIds]);

  const sorted = React.useMemo(() => {
    const rows = [...scaled];
    rows.sort((a, b) => {
      let av: number | string;
      let bv: number | string;
      if (sortKey === "usd") {
        av = usd(a.total);
        bv = usd(b.total);
      } else if (sortKey === "total") {
        av = a.total;
        bv = b.total;
      } else if (sortKey === "label") {
        av = a.label;
        bv = b.label;
      } else if (sortKey === "role") {
        av = agentType(a.id);
        bv = agentType(b.id);
      } else if (sortKey === "status") {
        av = a.status;
        bv = b.status;
      } else {
        return 0;
      }
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return rows;
  }, [scaled, sortKey, sortDir]);

  const total = scaled.reduce((s, r) => s + r.total, 0);
  const allTotals = React.useMemo(() => scaled.map((r) => r.total), [scaled]);
  const matchesCard = Math.abs(total - accumulated) < 1;

  const headerClick = (k: SortKey) => {
    if (k === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir(k === "total" || k === "usd" ? "desc" : "asc");
    }
  };

  if (scaled.length === 0) {
    return (
      <p className="m-0 py-6 text-center body-sm text-(--fg-tertiary)">
        Nenhum agente no filtro selecionado.
      </p>
    );
  }

  return (
    <>
      <AwTable>
        <thead>
          <tr>
            <SortableHeader label="Nome" sortKey="label" current={sortKey} dir={sortDir} onClick={headerClick} />
            <SortableHeader label="Tipo" sortKey="role" current={sortKey} dir={sortDir} onClick={headerClick} />
            <SortableHeader label="Status" sortKey="status" current={sortKey} dir={sortDir} onClick={headerClick} />
            <SortableHeader label="Total BRL" sortKey="total" current={sortKey} dir={sortDir} onClick={headerClick} align="right" />
            <SortableHeader label="Total USD" sortKey="usd" current={sortKey} dir={sortDir} onClick={headerClick} align="right" />
            <th />
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.id}>
              <td>
                <span className="inline-flex items-center gap-2">
                  <AwAvatar size="sm" src={r.avatar} alt={r.label} />
                  <span className="font-medium text-(--fg-primary)">{r.label}</span>
                  {isOutlier(r.total, allTotals) && <OutlierBadge />}
                </span>
              </td>
              <td className="body-xs text-(--fg-secondary)">{agentType(r.id)}</td>
              <td>
                <AwPill variant={agentStatusVariant(r.status)}>{r.status}</AwPill>
              </td>
              <td className="align-middle text-right font-medium tabular-nums text-(--fg-primary)">
                {brl(r.total)}
              </td>
              <td className="align-middle text-right tabular-nums text-(--fg-tertiary)">
                {fmtUsd(r.total)}
              </td>
              <td className="text-right">
                <button
                  type="button"
                  onClick={() => setDetail(r)}
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
            <td colSpan={3} className="align-top text-right text-(--fg-secondary)">Total por agente</td>
            <td className="align-top text-right font-semibold tabular-nums text-(--fg-primary)">
              {brl(total)}
              {matchesCard && (
                <span className="mt-0.5 flex items-center justify-end gap-0.5 body-3xs font-medium text-(--accent-success)">
                  <Icon name="check" size={13} />
                  bate com card
                </span>
              )}
            </td>
            <td className="align-top text-right font-semibold tabular-nums text-(--fg-secondary)">
              {fmtUsd(total)}
            </td>
            <td />
          </tr>
        </tfoot>
      </AwTable>

      <AgentDetailModal
        agent={detail}
        periodLabel={periodLabel}
        open={detail !== null}
        onClose={() => setDetail(null)}
      />
    </>
  );
}

function SortableHeader({
  label,
  sortKey,
  current,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onClick: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = current === sortKey;
  return (
    <th
      className={align === "right" ? "text-right" : undefined}
      aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={() => onClick(sortKey)}
        className={
          "group inline-flex items-center gap-1 transition-colors duration-aw-fast " +
          (align === "right" ? "flex-row-reverse " : "") +
          (active ? "text-(--fg-primary)" : "text-(--fg-tertiary) hover:text-(--fg-primary)")
        }
      >
        {label}
        <Icon
          name={active ? (dir === "asc" ? "arrow_upward" : "arrow_downward") : "unfold_more"}
          size={12}
          className={active ? "text-(--fg-secondary)" : "opacity-0 group-hover:opacity-100"}
        />
      </button>
    </th>
  );
}
