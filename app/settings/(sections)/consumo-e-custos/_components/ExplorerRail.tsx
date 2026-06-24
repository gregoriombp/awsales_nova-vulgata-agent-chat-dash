"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwLogo } from "@/components/ui/AwLogo";
import { Icon } from "@/components/ui/Icon";
import { useConsumo } from "./ConsumoContext";
import { DIMENSIONS } from "./explorer-model";

/* ----------------------------------------------------------------------------
 * Trilho esquerdo. Seções planas: voltar + título, "Dividir por" (Serviço /
 * Agente) e "Por destino" (chips pra incluir/tirar cada pagador do dashboard).
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

function ByDestination() {
  const { destino, togglePayer } = useConsumo();
  return (
    <div className="flex flex-col gap-2.5">
      <SectionLabel>Por destino · pagador</SectionLabel>
      <p className="m-0 -mt-1 body-xs text-(--fg-muted)">
        Clique pra incluir ou tirar um pagador do dashboard.
      </p>
      <div className="mt-1 flex flex-wrap gap-2">
        {destino.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => togglePayer(d.id)}
            aria-pressed={d.active}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 body-sm font-medium transition-colors duration-aw-fast",
              d.active
                ? "border-(--border-default) bg-(--bg-selected) text-(--fg-primary)"
                : "border-(--border-subtle) bg-transparent text-(--fg-tertiary) hover:bg-(--bg-hover) hover:text-(--fg-secondary)",
            )}
          >
            <span className={cn("inline-flex shrink-0", !d.active && "opacity-50 grayscale")}>
              {d.id === "meta" ? (
                <AwBrandLogo brand="meta" size={15} markOnly />
              ) : (
                <AwLogo variant="mark" height={13} className="text-(--aw-blue-500)" />
              )}
            </span>
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}
