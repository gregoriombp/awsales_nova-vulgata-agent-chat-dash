"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AwAvatar } from "@/components/ui/AwAvatar";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwInput } from "@/components/ui/AwInput";
import { AwPageHeader } from "@/components/ui/AwPageHeader";
import { AwTable } from "@/components/ui/AwTable";
import { Icon } from "@/components/ui/Icon";
import { useConsumo } from "./_components/ConsumoContext";
import { useReportsUI } from "./_components/SavedReports";
import {
  REPORT_TYPES,
  reportTypeDef,
  type ReportTypeDef,
  type SavedReport,
} from "./_components/report-types";

/* ----------------------------------------------------------------------------
 * "Análises detalhadas" — página inicial do espaço de consumo e custos.
 *
 * Antes essa rota abria direto o explorador. Agora ela é o ponto de entrada:
 * três tipos de relatório pra começar e a lista de relatórios salvos. Criar (ou
 * abrir) um relatório leva pro explorador (`/explorar`) no recorte certo.
 * ------------------------------------------------------------------------- */

const EXPLORER_PATH = "/settings/consumo-e-custos/explorar";
const explorerHref = (id: string) => `${EXPLORER_PATH}?relatorio=${encodeURIComponent(id)}`;

export default function AnalisesDetalhadasPage() {
  const { reports } = useConsumo();
  const { beginReport, openTypeChooser, openSavedReport, openRename, openDelete } = useReportsUI();
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...reports].sort((a, b) => b.updatedAt - a.updatedAt);
    if (!q) return sorted;
    return sorted.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.owner?.name ?? "").toLowerCase().includes(q) ||
        (r.org?.name ?? "").toLowerCase().includes(q),
    );
  }, [reports, query]);

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-10 pb-20 pt-12">
      <AwPageHeader
        size="default"
        divider={false}
        title="Análises detalhadas"
        description="Monte relatórios do seu consumo e dos seus custos. Escolha um tipo pra começar ou abra um relatório salvo — cada um vira um painel de gráficos que você organiza e guarda."
      />

      {/* Os três tipos de relatório */}
      <section aria-label="Tipos de relatório" className="grid grid-cols-3 gap-5">
        {REPORT_TYPES.map((t) => (
          <ReportTypeCard key={t.type} def={t} onSelect={() => beginReport(t.type)} />
        ))}
      </section>

      {/* Relatórios salvos */}
      <section aria-label="Seus relatórios" className="flex flex-col gap-5">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h4 className="m-0 text-(--fg-primary)">Seus relatórios</h4>
            <p className="m-0 mt-1 body-xs text-(--fg-tertiary)">
              {reports.length === 0
                ? "Nada salvo ainda."
                : reports.length === 1
                  ? "1 relatório salvo."
                  : `${reports.length} relatórios salvos.`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-64">
              <AwInput
                iconLeft="search"
                placeholder="Buscar relatório…"
                aria-label="Buscar relatório"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                dense
              />
            </div>
            <AwButton variant="primary" iconLeft="add" onClick={openTypeChooser}>
              Criar novo relatório
            </AwButton>
          </div>
        </header>

        {filtered.length === 0 ? (
          <EmptyReports searching={query.trim().length > 0} onCreate={openTypeChooser} />
        ) : (
          <ReportsTable
            reports={filtered}
            onOpen={openSavedReport}
            onRename={(r) => openRename(r.id, r.name)}
            onDelete={(r) => openDelete(r.id, r.name)}
          />
        )}
      </section>
    </div>
  );
}

/* ---------- card de tipo de relatório ---------- */

function ReportTypeCard({ def, onSelect }: { def: ReportTypeDef; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex flex-col overflow-hidden rounded-2xl border border-(--border-subtle) bg-(--bg-raised) text-left transition-[border-color,box-shadow,transform] duration-aw-base ease-aw-out hover:-translate-y-0.5 hover:border-(--border-default) hover:shadow-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-(--ring-focus)"
    >
      <TypePreview def={def} />
      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <span className="inline-flex items-center gap-2">
          <Icon name={def.icon} size={20} fill={1} className="text-(--fg-primary)" />
          <span className="text-(length:--h5-size) font-semibold leading-tight tracking-heading text-(--fg-primary)">
            {def.title}
          </span>
        </span>
        <span className="body-sm text-(--fg-tertiary)">{def.desc}</span>
        <span className="mt-2 inline-flex items-center gap-1 body-sm font-medium text-(--accent-brand)">
          Criar relatório
          <Icon
            name="arrow_forward"
            size={16}
            className="transition-transform duration-aw-fast group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </button>
  );
}

/** Prévia tokenizada — um motivo gráfico distinto por tipo, sobre um banho do acento. */
function TypePreview({ def }: { def: ReportTypeDef }) {
  return (
    <div className="relative h-32 overflow-hidden border-b border-(--border-subtle) bg-(--bg-muted)">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08]"
        style={{ backgroundColor: def.accentVar }}
      />
      <div className="absolute inset-0 grid place-items-center">
        <TypeMotif def={def} />
      </div>
    </div>
  );
}

function TypeMotif({ def }: { def: ReportTypeDef }) {
  if (def.type === "variaveis") {
    // Barras de consumo.
    const heights = ["h-6", "h-10", "h-7", "h-12", "h-9", "h-14", "h-8"];
    return (
      <div className="flex items-end gap-1.5">
        {heights.map((h, i) => (
          <span
            key={i}
            className={cn("w-2.5 rounded-sm", h)}
            style={{
              backgroundColor: def.accentVar,
              opacity: 0.45 + (i % 3) * 0.2,
            }}
          />
        ))}
      </div>
    );
  }
  if (def.type === "faturas") {
    // Linhas de uma fatura (documento).
    const widths = ["w-28", "w-20", "w-24", "w-16"];
    return (
      <div className="flex flex-col gap-2 rounded-lg bg-(--bg-raised) p-3.5 shadow-sm">
        {widths.map((w, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: def.accentVar }} />
            <span className={cn("h-2 rounded-full bg-(--border-default)", w)} />
          </span>
        ))}
      </div>
    );
  }
  // cobrancas — rosca Aswork × Meta ("quem pegou meu dinheiro").
  return (
    <div
      className="grid h-16 w-16 place-items-center rounded-full"
      style={{ background: `conic-gradient(${def.accentVar} 0 64%, var(--aw-blue-400) 64% 100%)` }}
    >
      <div className="h-9 w-9 rounded-full bg-(--bg-muted)" />
    </div>
  );
}

/* ---------- tabela de relatórios salvos ---------- */

function reportTypeOf(r: SavedReport): ReportTypeDef {
  const t = r.snapshot.reportType ?? (r.snapshot.kind === "invoice" ? "faturas" : "variaveis");
  return reportTypeDef(t);
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ReportsTable({
  reports,
  onOpen,
  onRename,
  onDelete,
}: {
  reports: SavedReport[];
  onOpen: (id: string) => void;
  onRename: (r: SavedReport) => void;
  onDelete: (r: SavedReport) => void;
}) {
  return (
    <AwTable>
      <thead>
        <tr className="border-b border-(--border-subtle) text-left">
          <Th className="pl-2">Nome</Th>
          <Th>Proprietário</Th>
          <Th>Última modificação</Th>
          <Th>Organização</Th>
          <Th className="w-12" srOnly>
            Ações
          </Th>
        </tr>
      </thead>
      <tbody>
        {reports.map((r) => {
          const def = reportTypeOf(r);
          return (
            <tr
              key={r.id}
              onClick={() => onOpen(r.id)}
              className="group cursor-pointer border-b border-(--border-subtle) transition-colors duration-aw-fast last:border-b-0 hover:bg-(--bg-hover)"
            >
              <td className="py-3.5 pl-2 pr-4">
                <span className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `color-mix(in srgb, ${def.accentVar} 14%, transparent)` }}
                  >
                    <Icon name={def.icon} size={18} fill={1} style={{ color: def.accentVar }} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate body-sm font-medium text-(--fg-primary)">{r.name}</span>
                    <span className="truncate body-xs text-(--fg-tertiary)">{def.title}</span>
                  </span>
                </span>
              </td>
              <td className="py-3.5 pr-4">
                <span className="flex items-center gap-2.5">
                  <AwAvatar size="sm" initials={r.owner?.initials ?? "—"} />
                  <span className="truncate body-sm text-(--fg-secondary)">
                    {r.owner?.name ?? "—"}
                  </span>
                </span>
              </td>
              <td className="py-3.5 pr-4">
                <span className="body-sm tabular-nums text-(--fg-secondary)">
                  {formatDate(r.updatedAt)}
                </span>
              </td>
              <td className="py-3.5 pr-4">
                <span className="flex items-center gap-2.5">
                  {r.org ? (
                    <>
                      <AwBrandLogo brand={r.org.brand} size={24} />
                      <span className="truncate body-sm text-(--fg-secondary)">{r.org.name}</span>
                    </>
                  ) : (
                    <span className="body-sm text-(--fg-tertiary)">—</span>
                  )}
                </span>
              </td>
              <td className="py-3.5 pr-2 text-right" onClick={(e) => e.stopPropagation()}>
                <AwDropdownMenu
                  align="end"
                  aria-label={`Ações do relatório ${r.name}`}
                  trigger={
                    <button
                      type="button"
                      aria-label={`Ações do relatório ${r.name}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-(--fg-tertiary) opacity-0 transition-[opacity,color,background-color] duration-aw-fast hover:bg-(--bg-muted) hover:text-(--fg-primary) focus-visible:opacity-100 group-hover:opacity-100 aria-expanded:opacity-100"
                    >
                      <Icon name="more_vert" size={18} />
                    </button>
                  }
                  items={[
                    { id: "view", label: "Visualizar", icon: "visibility", onSelect: () => onOpen(r.id) },
                    {
                      id: "newtab",
                      label: "Abrir em nova guia",
                      icon: "open_in_new",
                      onSelect: () => window.open(explorerHref(r.id), "_blank", "noopener"),
                    },
                    { id: "rename", label: "Renomear", icon: "edit", onSelect: () => onRename(r) },
                    {
                      id: "export",
                      label: "Exportar",
                      icon: "download",
                      onSelect: () => exportReportCsv(r),
                    },
                    { id: "sep", separator: true },
                    {
                      id: "delete",
                      label: "Excluir",
                      icon: "delete",
                      danger: true,
                      onSelect: () => onDelete(r),
                    },
                  ]}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </AwTable>
  );
}

function Th({
  children,
  className,
  srOnly,
}: {
  children: React.ReactNode;
  className?: string;
  srOnly?: boolean;
}) {
  return (
    <th
      scope="col"
      className={cn("py-2.5 pr-4 body-xs font-medium text-(--fg-tertiary)", className)}
    >
      {srOnly ? <span className="sr-only">{children}</span> : children}
    </th>
  );
}

function EmptyReports({ searching, onCreate }: { searching: boolean; onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-(--border-default) px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--bg-muted) text-(--fg-tertiary)">
        <Icon name={searching ? "search_off" : "assessment"} size={24} />
      </span>
      {searching ? (
        <p className="m-0 body-sm text-(--fg-secondary)">Nenhum relatório com esse nome.</p>
      ) : (
        <>
          <p className="m-0 body-sm text-(--fg-secondary)">
            Você ainda não salvou nenhum relatório.
          </p>
          <AwButton variant="secondary" iconLeft="add" onClick={onCreate}>
            Criar novo relatório
          </AwButton>
        </>
      )}
    </div>
  );
}

/* ---------- exportar relatório (CSV da definição do relatório) ---------- */

function exportReportCsv(r: SavedReport) {
  const def = reportTypeOf(r);
  const rows: [string, string][] = [
    ["Nome", r.name],
    ["Tipo", def.title],
    ["Proprietário", r.owner?.name ?? ""],
    ["Organização", r.org?.name ?? ""],
    ["Criado em", formatDate(r.createdAt)],
    ["Última modificação", formatDate(r.updatedAt)],
    ["Lente", r.snapshot.grouping === "agent" ? "Agente" : "Serviço"],
    ["Fatura", r.snapshot.invoiceId ?? "—"],
  ];
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = ["Campo,Valor", ...rows.map(([k, v]) => `${esc(k)},${esc(v)}`)].join("\r\n");
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${r.name.replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
