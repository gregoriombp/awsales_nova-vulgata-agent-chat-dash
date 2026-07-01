"use client";

import { Icon } from "@/components/ui/Icon";
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usd, type AgentBreakdownRow } from "./data";

/* ----------------------------------------------------------------------------
 * Células/primitivos COMPARTILHADOS das tabelas de detalhamento — a do
 * Financeiro (OverviewBreakdownTable) e a do explorador de custos
 * (DetalhamentoWidget) são a MESMA leitura em telas diferentes, então falam
 * pelos mesmos primitivos (pedido do Greg, cmt-55aa536b: "linkadas do melhor
 * jeito possível a nível de componente").
 * ------------------------------------------------------------------------- */

/** "US$ 181.23" — formatação única do par BRL→USD (USD = base de cálculo). */
export function usdLabel(brlValue: number): string {
  return `US$ ${usd(brlValue).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Status do agente → variant do AwPill — mapa único das duas tabelas. */
export const AGENT_STATUS_VARIANT: Record<AgentBreakdownRow["status"], AwPillVariant> = {
  Ativo: "live",
  Pausado: "neutral",
  Treinando: "warning",
};

/** Barra de participação (share) — a régua visual comum das duas tabelas. */
export function ShareBarCell({
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

/** Selo "Acima do esperado" — mesmo critério e cara nas duas tabelas. */
export function OutlierBadge() {
  return (
    <AwPill variant="warning" dot={false}>
      <Icon name="warning" size={11} />
      Acima do esperado
    </AwPill>
  );
}

/** Info por item da tabela (não propaga o clique pro toggle da linha). */
export function RowInfoTip({ text, label }: { text: string; label: string }) {
  return (
    <TooltipProvider delayDuration={120}>
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
    </TooltipProvider>
  );
}
