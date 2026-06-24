"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwLogo } from "@/components/ui/AwLogo";
import { Icon } from "@/components/ui/Icon";
import { brl } from "../../financeiro/_components/data";
import { useConsumo } from "./ConsumoContext";
import { DIMENSIONS, PROVIDERS } from "./explorer-model";

/* ----------------------------------------------------------------------------
 * Trilho esquerdo. Seções planas: voltar + título, "Dividir por" (Serviço /
 * Agente), "Filtros ativos" e "Por destino" (quebra por provedor, só leitura).
 * ------------------------------------------------------------------------- */

export function ExplorerRail() {
  const router = useRouter();

  const back = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/settings/financeiro/visao-geral");
    }
  };

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col overflow-y-auto border-r border-(--border-subtle) bg-(--bg-surface)">
      <div className="flex flex-col gap-7 px-6 pb-10 pt-5">
        <Header onBack={back} />
        <DimensionList />
        <ActiveFilters />
        <ByDestination />
      </div>
    </aside>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  const { periodLabel, currencyLabel } = useConsumo();
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onBack}
        className="-ml-1 inline-flex w-fit items-center gap-1.5 rounded-md py-1 pl-1 pr-2 body-xs font-medium text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)"
      >
        <Icon name="arrow_back" size={16} />
        Voltar
      </button>
      <div className="flex flex-col gap-0.5">
        <h4 className="m-0 text-(--fg-primary)">Explorar custos</h4>
        <p className="m-0 body-xs text-(--fg-tertiary)">
          {periodLabel} · {currencyLabel}
        </p>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="aw-eyebrow text-(--fg-tertiary)">{children}</span>;
}

function DimensionList() {
  const { grouping, setGrouping } = useConsumo();
  return (
    <nav className="flex flex-col gap-2" aria-label="Dividir por">
      <SectionLabel>Dividir por</SectionLabel>
      <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
        {DIMENSIONS.map((d) => {
          const active = d.id === grouping;
          return (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => setGrouping(d.id)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left body-sm transition-colors duration-aw-fast",
                  active
                    ? "bg-(--bg-selected) font-medium text-(--fg-primary)"
                    : "text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)",
                )}
              >
                <Icon
                  name={d.icon}
                  size={18}
                  fill={active ? 1 : 0}
                  className={active ? "text-(--accent-brand)" : "text-(--fg-tertiary)"}
                />
                {d.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ActiveFilters() {
  const { filterChips } = useConsumo();
  return (
    <div className="flex flex-col gap-2.5">
      <SectionLabel>Filtros ativos</SectionLabel>
      {filterChips.length === 0 ? (
        <p className="m-0 body-xs text-(--fg-muted)">Nenhum filtro — vendo todos os custos.</p>
      ) : (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {filterChips.map((chip) => (
            <li key={chip.id}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border-subtle) bg-(--bg-raised) py-1 pl-2.5 pr-1.5 body-xs text-(--fg-secondary)">
                {chip.label}
                <button
                  type="button"
                  onClick={chip.onRemove}
                  aria-label={`Remover ${chip.label}`}
                  className="inline-flex h-4 w-4 items-center justify-center rounded-full text-(--fg-tertiary) hover:bg-(--bg-hover) hover:text-(--fg-primary)"
                >
                  <Icon name="close" size={13} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ByDestination() {
  const { destino, togglePayer } = useConsumo();
  return (
    <div className="flex flex-col gap-2.5">
      <SectionLabel>Por destino · pagador</SectionLabel>
      <p className="m-0 -mt-1 body-xs text-(--fg-muted)">
        Clique pra incluir ou tirar um pagador do dashboard.
      </p>
      <ul className="m-0 mt-1 flex list-none flex-col gap-2 p-0">
        {destino.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => togglePayer(d.id)}
              aria-pressed={d.active}
              className={cn(
                "-mx-1.5 flex w-full flex-col gap-1.5 rounded-lg px-1.5 py-1.5 text-left transition-colors duration-aw-fast hover:bg-(--bg-hover)",
                !d.active && "opacity-45",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="inline-flex items-center gap-2 body-sm font-medium text-(--fg-primary)">
                  {d.id === "meta" ? (
                    <AwBrandLogo brand="meta" size={16} markOnly />
                  ) : (
                    <AwLogo variant="mark" height={15} className="text-(--aw-blue-500)" />
                  )}
                  {d.label}
                  {!d.active && (
                    <Icon name="visibility_off" size={13} className="text-(--fg-tertiary)" />
                  )}
                </span>
                <span className="shrink-0 body-xs font-medium tabular-nums text-(--fg-secondary)">
                  {d.share.toFixed(0)}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-(--bg-muted)">
                <div
                  className="h-full rounded-full transition-[width] duration-aw-base ease-aw-out"
                  style={{ width: `${Math.max(2, d.share)}%`, background: d.colorVar }}
                />
              </div>
              <span className="body-xs tabular-nums text-(--fg-tertiary)">
                {brl(d.total)} · {PROVIDERS[d.id].desc}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
