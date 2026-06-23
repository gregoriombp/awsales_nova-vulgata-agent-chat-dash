"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AwButton } from "@/components/ui/AwButton";
import { AwCheckbox } from "@/components/ui/AwCheckbox";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { Icon } from "@/components/ui/Icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  agentType,
  AGENT_BREAKDOWN,
  formatQuantity,
  OPERATIONAL_FX,
  scaleBreakdown,
  scaleCustomBreakdown,
  SERVICE_BREAKDOWN,
  usd,
  USED_META_TOTAL,
  type AgentBreakdownRow,
  type ServiceBreakdownRow,
} from "../../financeiro/_components/data";
import { useConsumo } from "./ConsumoContext";

/* ----------------------------------------------------------------------------
 * Export CSV customizado — escopo, granularidade e colunas.
 *
 * Porte da lógica do PG (escopo Aswork × Aswork+Meta, por serviço/agente,
 * seletor de colunas), com a copy reescrita na voz do produto: "Aswork" no
 * lugar de jargão, sem "macro-fee/agent_id". Exporta sempre o período e o
 * filtro ATIVOS — o que está na tela vira o arquivo.
 * ------------------------------------------------------------------------- */

type Scope = "aswork" | "aswork-meta";
type Granularity = "service" | "agent";
type ColId =
  | "periodo"
  | "item"
  | "categoria"
  | "agente"
  | "tipo"
  | "status"
  | "quantidade"
  | "unitario"
  | "total_brl"
  | "total_usd"
  | "share"
  | "cambio";

const COLUMNS: {
  id: ColId;
  label: string;
  appliesTo: Granularity[];
}[] = [
  { id: "periodo", label: "Período", appliesTo: ["service", "agent"] },
  { id: "item", label: "Item / serviço", appliesTo: ["service"] },
  { id: "categoria", label: "Categoria / taxa", appliesTo: ["service"] },
  { id: "agente", label: "Agente", appliesTo: ["agent"] },
  { id: "tipo", label: "Tipo do agente", appliesTo: ["agent"] },
  { id: "status", label: "Status", appliesTo: ["agent"] },
  { id: "quantidade", label: "Quantidade", appliesTo: ["service"] },
  { id: "unitario", label: "Taxa efetiva (unitário)", appliesTo: ["service"] },
  { id: "total_brl", label: "Total (BRL)", appliesTo: ["service", "agent"] },
  { id: "total_usd", label: "Total (USD)", appliesTo: ["service", "agent"] },
  { id: "share", label: "% do período", appliesTo: ["service", "agent"] },
  { id: "cambio", label: "Câmbio operacional", appliesTo: ["service", "agent"] },
];

const DEFAULT_COLS: ColId[] = COLUMNS.map((c) => c.id);

function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function ExportCsvMenu() {
  const {
    grouping,
    selection,
    customDays,
    allowedRowIds,
    visibleIds,
    periodLabel,
    accumulated,
  } = useConsumo();

  const [open, setOpen] = React.useState(false);
  const [scope, setScope] = React.useState<Scope>("aswork");
  // Granularidade default segue a lente ativa, mas é independente.
  const [granularity, setGranularity] = React.useState<
    Record<Granularity, boolean>
  >({ service: grouping === "service", agent: grouping === "agent" });
  const [cols, setCols] = React.useState<Set<ColId>>(new Set(DEFAULT_COLS));

  // Mantém a granularidade sincronizada com a lente quando o usuário troca de
  // lente sem ter mexido manualmente (heurística leve, não trava a escolha).
  React.useEffect(() => {
    setGranularity((g) => {
      if (g.service || g.agent) return g;
      return { service: grouping === "service", agent: grouping === "agent" };
    });
  }, [grouping]);

  const noGranularity = !granularity.service && !granularity.agent;
  const colCount = cols.size;

  const scaledService = React.useMemo<ServiceBreakdownRow[]>(() => {
    const rows = (
      selection.kind === "custom"
        ? scaleCustomBreakdown(SERVICE_BREAKDOWN, customDays)
        : scaleBreakdown(SERVICE_BREAKDOWN, selection.id)
    ) as ServiceBreakdownRow[];
    return rows.filter((r) => allowedRowIds.has(r.id));
  }, [selection, customDays, allowedRowIds]);

  const scaledAgent = React.useMemo<AgentBreakdownRow[]>(() => {
    const rows = (
      selection.kind === "custom"
        ? scaleCustomBreakdown(AGENT_BREAKDOWN, customDays)
        : scaleBreakdown(AGENT_BREAKDOWN, selection.id)
    ) as AgentBreakdownRow[];
    return rows.filter((r) => visibleIds.has(r.id));
  }, [selection, customDays, visibleIds]);

  const buildAsworkCsv = (): string => {
    const active = COLUMNS.filter((c) => cols.has(c.id));
    const lines: string[] = [];
    lines.push(`Consumo e custos Aswork — ${periodLabel}`);
    lines.push("");

    if (granularity.service) {
      const used = active.filter((c) => c.appliesTo.includes("service"));
      lines.push("Por serviço / taxa");
      lines.push(used.map((c) => csvCell(c.label)).join(","));
      const total = scaledService.reduce((s, r) => s + r.total, 0);
      scaledService.forEach((r) => {
        lines.push(
          used
            .map((c) => csvCell(serviceCell(c.id, r, total, periodLabel)))
            .join(","),
        );
      });
      lines.push("");
    }

    if (granularity.agent) {
      const used = active.filter((c) => c.appliesTo.includes("agent"));
      lines.push("Por agente");
      lines.push(used.map((c) => csvCell(c.label)).join(","));
      const total = scaledAgent.reduce((s, r) => s + r.total, 0);
      scaledAgent.forEach((r) => {
        lines.push(
          used
            .map((c) => csvCell(agentCell(c.id, r, total, periodLabel)))
            .join(","),
        );
      });
      lines.push("");
    }

    lines.push(`Total Aswork no período,${accumulated.toFixed(2)}`);
    return lines.join("\n");
  };

  const buildMetaCsv = (): string => {
    const lines: string[] = [];
    lines.push(`Meta — valor aproximado · ${periodLabel}`);
    lines.push(
      "Valor aproximado, cobrado direto pela plataforma do Meta — não é documento fiscal Aswork.",
    );
    lines.push("");
    lines.push("Item,Valor aproximado (BRL)");
    lines.push(`Disparos e conversas (Meta),${USED_META_TOTAL.toFixed(2)}`);
    return lines.join("\n");
  };

  const download = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const onExport = () => {
    if (noGranularity) return;
    download("consumo-custos-aswork.csv", buildAsworkCsv());
    if (scope === "aswork-meta") {
      download("consumo-custos-meta-aproximado.csv", buildMetaCsv());
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <AwButton
          variant="secondary"
          size="sm"
          iconLeft="download"
          className="h-8!"
        >
          Exportar
          <Icon name="expand_more" size={15} className="ml-0.5" />
        </AwButton>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="flex w-[400px] flex-col gap-4 border border-(--border-subtle) bg-(--bg-raised) p-4 shadow-lg"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Icon name="download" size={16} className="text-(--fg-secondary)" />
            <h6 className="m-0 text-(--fg-primary)">Exportar CSV</h6>
          </div>
          <p className="m-0 body-xs text-(--fg-tertiary)">
            Escopo, granularidade e colunas. Exporta o período e o filtro ativos
            ({periodLabel}).
          </p>
        </div>

        {/* escopo */}
        <fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
          <legend className="mb-0.5 aw-eyebrow text-(--fg-tertiary)">
            Escopo
          </legend>
          <RadioRow
            checked={scope === "aswork"}
            onSelect={() => setScope("aswork")}
            title="Só Aswork"
            hint="Concilia 1:1 com a sua fatura / NF-e."
          />
          <RadioRow
            checked={scope === "aswork-meta"}
            onSelect={() => setScope("aswork-meta")}
            title="Aswork + Meta aproximado"
            hint="2 arquivos — o do Meta é informativo, não fiscal."
          />
        </fieldset>

        {/* granularidade + colunas */}
        <div className="flex flex-col gap-2.5">
          <span className="aw-eyebrow text-(--fg-tertiary)">Granularidade</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <label className="inline-flex cursor-pointer items-center gap-2 body-sm text-(--fg-primary)">
              <AwCheckbox
                checked={granularity.service}
                onChange={(v) =>
                  setGranularity((g) => ({ ...g, service: v }))
                }
                label="Por serviço / taxa"
              />
              Por serviço / taxa
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 body-sm text-(--fg-primary)">
              <AwCheckbox
                checked={granularity.agent}
                onChange={(v) => setGranularity((g) => ({ ...g, agent: v }))}
                label="Por agente"
              />
              Por agente
            </label>
            <ColumnsMenu cols={cols} setCols={setCols} count={colCount} />
          </div>
          {noGranularity && (
            <p className="m-0 body-xs text-(--accent-danger)">
              Escolha ao menos uma granularidade.
            </p>
          )}
        </div>

        {/* nota de escopo */}
        <div className="rounded-md border border-(--border-subtle) bg-(--bg-muted) px-3 py-2.5">
          <p className="m-0 flex gap-2 body-xs text-(--fg-secondary)">
            <Icon
              name="info"
              size={14}
              className="mt-0.5 shrink-0 text-(--fg-tertiary)"
            />
            <span>
              O arquivo Aswork traz só o que você paga à Aswork (bate com a
              fatura). Se incluir o Meta, ele vem em{" "}
              <strong className="font-medium text-(--fg-primary)">
                arquivo separado
              </strong>
              , marcado “valor aproximado, cobrado direto pela plataforma do
              Meta — não é documento fiscal Aswork”.
            </span>
          </p>
        </div>

        <div className="flex justify-end">
          <AwButton
            variant="primary"
            size="sm"
            iconLeft="download"
            disabled={noGranularity || colCount === 0}
            onClick={onExport}
          >
            Exportar CSV
          </AwButton>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function RadioRow({
  checked,
  onSelect,
  title,
  hint,
}: {
  checked: boolean;
  onSelect: () => void;
  title: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={cn(
        "flex items-start gap-2.5 rounded-md border px-3 py-2 text-left transition-colors duration-aw-fast",
        checked
          ? "border-(--fg-primary) bg-(--bg-muted)"
          : "border-(--border-subtle) hover:border-(--border-default) hover:bg-(--bg-hover)",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
          checked ? "border-(--fg-primary)" : "border-(--border-default)",
        )}
      >
        {checked && (
          <span className="h-2 w-2 rounded-full bg-(--fg-primary)" />
        )}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="body-sm font-medium text-(--fg-primary)">{title}</span>
        <span className="body-xs text-(--fg-tertiary)">{hint}</span>
      </span>
    </button>
  );
}

function ColumnsMenu({
  cols,
  setCols,
  count,
}: {
  cols: Set<ColId>;
  setCols: React.Dispatch<React.SetStateAction<Set<ColId>>>;
  count: number;
}) {
  const toggle = (id: ColId) =>
    setCols((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <AwDropdownMenu
      align="start"
      aria-label="Selecionar colunas"
      trigger={
        <button
          type="button"
          className="inline-flex items-center gap-1 body-sm font-medium text-(--accent-brand) hover:underline"
        >
          Selecionar colunas ({count})
          <Icon name="expand_more" size={15} />
        </button>
      }
      items={COLUMNS.map((c) => ({
        id: c.id,
        label: c.label,
        checked: cols.has(c.id),
        closeOnSelect: false,
        onSelect: () => toggle(c.id),
      }))}
    />
  );
}

/* ---------- montagem de célula por coluna ---------- */

function serviceCell(
  col: ColId,
  r: ServiceBreakdownRow,
  total: number,
  periodLabel: string,
): string | number {
  switch (col) {
    case "periodo":
      return periodLabel;
    case "item":
      return r.label;
    case "categoria":
      return r.category;
    case "quantidade":
      return formatQuantity(r.quantity, r.quantityFormat);
    case "unitario":
      return r.unitPriceLabel;
    case "total_brl":
      return r.total.toFixed(2);
    case "total_usd":
      return usd(r.total).toFixed(2);
    case "share":
      return total > 0 ? `${((r.total / total) * 100).toFixed(1)}%` : "0%";
    case "cambio":
      return OPERATIONAL_FX.toFixed(2);
    default:
      return "";
  }
}

function agentCell(
  col: ColId,
  r: AgentBreakdownRow,
  total: number,
  periodLabel: string,
): string | number {
  switch (col) {
    case "periodo":
      return periodLabel;
    case "agente":
      return r.label;
    case "tipo":
      return agentType(r.id);
    case "status":
      return r.status;
    case "total_brl":
      return r.total.toFixed(2);
    case "total_usd":
      return usd(r.total).toFixed(2);
    case "share":
      return total > 0 ? `${((r.total / total) * 100).toFixed(1)}%` : "0%";
    case "cambio":
      return OPERATIONAL_FX.toFixed(2);
    default:
      return "";
  }
}
