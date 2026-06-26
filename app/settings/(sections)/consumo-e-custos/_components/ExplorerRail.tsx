"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwLogo } from "@/components/ui/AwLogo";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { Icon } from "@/components/ui/Icon";
import { useConsumo } from "./ConsumoContext";
import { useReportsUI } from "./SavedReports";
import { reportTypeDef } from "./report-types";
import { DIMENSIONS } from "./explorer-model";

/* ----------------------------------------------------------------------------
 * Trilho esquerdo. Seções planas: voltar + título, "Dividir por" (Serviço /
 * Agente) e "Por destino" (chips pra incluir/tirar cada pagador do dashboard).
 * Pode colapsar pra uma faixa estreita só com o botão de expandir.
 * ------------------------------------------------------------------------- */

export function ExplorerRail() {
  const router = useRouter();
  const { isReportDirty, isDraft, clearDraft } = useConsumo();
  const [collapsed, setCollapsed] = React.useState(false);

  // Mudanças não salvas (rascunho ou relatório): avisa antes de refresh/fechar.
  React.useEffect(() => {
    if (!isReportDirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isReportDirty]);

  // Volta pra a página inicial "Análises detalhadas". Com mudanças não salvas,
  // confirma antes — e descarta o rascunho ao sair.
  const back = () => {
    if (
      isReportDirty &&
      !window.confirm("Sair sem salvar? As mudanças deste painel serão perdidas.")
    ) {
      return;
    }
    // Sair de um rascunho o descarta (não fica "pendente" pra reabrir sozinho).
    if (isDraft) clearDraft();
    router.push("/settings/consumo-e-custos");
  };

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col overflow-y-auto border-r border-(--border-subtle) bg-(--bg-canvas) transition-[width] duration-aw-base ease-aw-out",
        collapsed ? "w-14" : "w-[280px]",
      )}
      aria-label="Filtros do explorador"
    >
      {collapsed ? (
        <div className="flex flex-col items-center gap-4 px-2 pt-5">
          <RailToggle collapsed onToggle={() => setCollapsed(false)} />
        </div>
      ) : (
        <div className="flex flex-col gap-7 px-6 pb-10 pt-5">
          <Header onBack={back} onCollapse={() => setCollapsed(true)} />
          <DimensionList />
          <ByDestination />
          <SavedReportsSection />
        </div>
      )}
    </aside>
  );
}

function RailToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? "Expandir filtros" : "Recolher filtros"}
      aria-expanded={!collapsed}
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-(--fg-tertiary) transition-colors duration-aw-fast hover:bg-(--bg-hover) hover:text-(--fg-primary)"
    >
      <Icon name={collapsed ? "dock_to_left" : "dock_to_right"} size={18} />
    </button>
  );
}

function Header({
  onBack,
  onCollapse,
}: {
  onBack: () => void;
  onCollapse: () => void;
}) {
  const { periodLabel, reportType, activeReport, isDraft } = useConsumo();
  const def = reportType ? reportTypeDef(reportType) : null;
  // Identidade do relatório: nome salvo > título do tipo > genérico.
  const title = activeReport?.name ?? def?.title ?? "Explorar custos";
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="-ml-1 inline-flex w-fit items-center gap-1.5 rounded-md py-1 pl-1 pr-2 body-xs font-medium text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)"
        >
          <Icon name="arrow_back" size={16} />
          Voltar
        </button>
        <RailToggle collapsed={false} onToggle={onCollapse} />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2">
          {def && (
            <span
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
              style={{ backgroundColor: `color-mix(in srgb, ${def.accentVar} 16%, transparent)` }}
            >
              <Icon name={def.icon} size={14} fill={1} style={{ color: def.accentVar }} />
            </span>
          )}
          <h4 className="m-0 min-w-0 truncate text-(--fg-primary)" title={title}>
            {title}
          </h4>
        </div>
        {isDraft ? (
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-(--bg-muted) px-2 py-0.5 body-xs font-medium text-(--fg-tertiary)">
            <Icon name="edit_note" size={13} />
            Rascunho · não salvo
          </span>
        ) : (
          <p className="m-0 body-xs text-(--fg-tertiary)">
            {def && activeReport ? `${def.title} · ${periodLabel}` : periodLabel}
          </p>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="body-sm font-medium text-(--fg-secondary)">{children}</span>;
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

function SavedReportsSection() {
  const { reports, activeReportId, applyReport } = useConsumo();
  const { openTypeChooser, openRename, openDelete } = useReportsUI();

  return (
    <div className="flex flex-col gap-2.5">
      <SectionLabel>Relatórios</SectionLabel>
      <button
        type="button"
        onClick={openTypeChooser}
        className="inline-flex w-full items-center gap-2 rounded-lg border border-dashed border-(--border-default) px-2.5 py-2 text-left body-sm font-medium text-(--fg-secondary) transition-colors duration-aw-fast hover:border-(--border-strong) hover:bg-(--bg-hover) hover:text-(--fg-primary)"
      >
        <Icon name="add" size={16} className="text-(--fg-tertiary)" />
        Criar novo relatório
      </button>

      {reports.length === 0 ? (
        <p className="m-0 body-xs text-(--fg-muted)">
          Salve a lente, o período e o layout atuais pra voltar quando quiser.
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
          {reports.map((r) => {
            const active = r.id === activeReportId;
            return (
              <li key={r.id} className="group flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => applyReport(r.id)}
                  aria-current={active ? "true" : undefined}
                  title={r.name}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2.5 py-2 text-left body-sm transition-colors duration-aw-fast",
                    active
                      ? "bg-(--bg-selected) font-medium text-(--fg-primary)"
                      : "text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)",
                  )}
                >
                  <Icon
                    name="bookmark"
                    size={16}
                    fill={active ? 1 : 0}
                    className={active ? "text-(--accent-brand)" : "text-(--fg-tertiary)"}
                  />
                  <span className="truncate">{r.name}</span>
                </button>
                <AwDropdownMenu
                  align="end"
                  aria-label={`Ações do relatório ${r.name}`}
                  trigger={
                    <button
                      type="button"
                      aria-label={`Ações do relatório ${r.name}`}
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-(--fg-tertiary) opacity-0 transition-opacity duration-aw-fast hover:bg-(--bg-hover) hover:text-(--fg-primary) focus-visible:opacity-100 group-hover:opacity-100 aria-expanded:opacity-100"
                    >
                      <Icon name="more_vert" size={16} />
                    </button>
                  }
                  items={[
                    { id: "view", label: "Visualizar", icon: "visibility", onSelect: () => applyReport(r.id) },
                    { id: "rename", label: "Renomear", icon: "edit", onSelect: () => openRename(r.id, r.name) },
                    { id: "del", label: "Excluir", icon: "delete", danger: true, onSelect: () => openDelete(r.id, r.name) },
                  ]}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
