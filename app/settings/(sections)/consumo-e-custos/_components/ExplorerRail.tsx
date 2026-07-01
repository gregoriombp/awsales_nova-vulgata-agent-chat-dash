"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AwButton } from "@/components/ui/AwButton";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwModal } from "@/components/ui/AwModal";
import { Icon } from "@/components/ui/Icon";
import { useConsumo } from "./ConsumoContext";
import { useReportsUI } from "./SavedReports";
import { reportTypeDef } from "./report-types";
import { DIMENSIONS } from "./explorer-model";

/* ----------------------------------------------------------------------------
 * Trilho esquerdo. Seções planas: voltar + título, a lente "Dividir por" e os
 * relatórios salvos. A lente voltou pro trilho (o Greg achou que, com a pill de
 * agentes na topbar, o dropdown de lente ficava estranho lado a lado); o filtro
 * de pagador segue na topbar. Pode colapsar pra uma faixa estreita.
 * ------------------------------------------------------------------------- */

export function ExplorerRail() {
  const router = useRouter();
  const { isReportDirty, isDraft, clearDraft } = useConsumo();
  const [collapsed, setCollapsed] = React.useState(false);
  // Confirmação de saída com mudanças não salvas — modal da interface (AwModal),
  // no lugar do confirm() nativo do navegador.
  const [confirmLeave, setConfirmLeave] = React.useState(false);

  // Mudanças não salvas (rascunho ou relatório): avisa antes de refresh/fechar a
  // aba. Esse é o único caso em que o aviso PRECISA ser nativo — o navegador não
  // deixa customizar o beforeunload. A saída pelo "Voltar" usa o modal abaixo.
  React.useEffect(() => {
    if (!isReportDirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isReportDirty]);

  // Sai de fato: descarta o rascunho (não fica "pendente" pra reabrir sozinho) e
  // volta pra aba "Análises" (a casa dos relatórios).
  const leave = React.useCallback(() => {
    if (isDraft) clearDraft();
    router.push("/settings/consumo-e-custos/analises");
  }, [isDraft, clearDraft, router]);

  // "Voltar": com mudanças não salvas, abre o modal de confirmação; sem mudanças,
  // sai direto.
  const back = () => {
    if (isReportDirty) setConfirmLeave(true);
    else leave();
  };

  return (
    <>
      <aside
        className={cn(
          "flex h-full shrink-0 flex-col overflow-y-auto border-r border-(--border-subtle) bg-(--bg-canvas) transition-[width] duration-aw-base ease-aw-out",
          collapsed ? "w-14" : "w-[280px]",
        )}
        aria-label="Relatórios e navegação do explorador"
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-4 px-2 pt-5">
            <RailToggle collapsed onToggle={() => setCollapsed(false)} />
          </div>
        ) : (
          <div className="flex flex-col gap-7 px-6 pb-10 pt-5">
            <Header onBack={back} onCollapse={() => setCollapsed(true)} />
            <DimensionList />
            <SavedReportsSection />
          </div>
        )}
      </aside>

      <AwModal
        open={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        size="md"
        title="Sair sem salvar?"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <AwButton variant="ghost" onClick={() => setConfirmLeave(false)}>
              Continuar editando
            </AwButton>
            <AwButton
              variant="danger"
              onClick={() => {
                setConfirmLeave(false);
                leave();
              }}
            >
              Sair sem salvar
            </AwButton>
          </div>
        }
      >
        <p className="m-0 body-sm text-(--fg-secondary)">
          As mudanças deste painel — lente, período, filtros e gráficos — serão
          perdidas. Salve antes se quiser guardá-las.
        </p>
      </AwModal>
    </>
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
  const { periodLabel, reportType, activeReport } = useConsumo();
  const def = reportType ? reportTypeDef(reportType) : null;
  // Identidade do relatório: nome salvo > título do tipo > o nome do espaço
  // (mesmo rótulo da página inicial, pra não introduzir um terceiro nome).
  const title = activeReport?.name ?? def?.title ?? "Análises detalhadas";
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
          <h4 className="m-0 min-w-0 break-words leading-tight text-(--fg-primary)">
            {title}
          </h4>
        </div>
        <p className="m-0 body-xs text-(--fg-tertiary)">
          {def && activeReport ? `${def.title} · ${periodLabel}` : periodLabel}
        </p>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="body-sm font-medium text-(--fg-secondary)">{children}</span>;
}

/** Lente "Dividir por" (Serviço × Agente) — de volta ao trilho a pedido do Greg. */
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
                    ? "bg-(--fg-primary) font-medium text-(--bg-raised)"
                    : "text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)",
                )}
              >
                <Icon
                  name={d.icon}
                  size={18}
                  fill={active ? 1 : 0}
                  className={active ? "text-(--bg-raised)" : "text-(--fg-tertiary)"}
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
                    { id: "view", label: "Abrir", icon: "arrow_forward", onSelect: () => applyReport(r.id) },
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
