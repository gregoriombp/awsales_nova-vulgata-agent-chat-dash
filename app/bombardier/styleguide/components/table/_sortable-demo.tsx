"use client"

import { AwTable } from "@/components/ui/AwTable"
import { AwPill, type AwPillVariant } from "@/components/ui/AwPill"
import { useTableSort } from "@/lib/hooks/useTableSort"

type Status = "live" | "thinking" | "draft" | "error" | "beta"

type Row = {
  id: string
  name: string
  status: Status
  version: string
  conversations: number | null
  resolution: number | null
  updatedAt: string
  updatedAtLabel: string
}

const statusPill: Record<Status, { variant: AwPillVariant; label: string }> = {
  live: { variant: "live", label: "Live" },
  thinking: { variant: "ai", label: "Pensando" },
  draft: { variant: "draft", label: "Rascunho" },
  error: { variant: "error", label: "Erro" },
  beta: { variant: "beta", label: "Beta" },
}

const rows: Row[] = [
  {
    id: "atendimento-faq",
    name: "Atendimento FAQ",
    status: "live",
    version: "v12.4",
    conversations: 1840,
    resolution: 0.94,
    updatedAt: "2026-05-15T13:46:00Z",
    updatedAtLabel: "14 min atrás",
  },
  {
    id: "pre-venda-b2b",
    name: "Pré-venda B2B",
    status: "thinking",
    version: "v08.1",
    conversations: 412,
    resolution: 0.87,
    updatedAt: "2026-05-15T12:00:00Z",
    updatedAtLabel: "2 h atrás",
  },
  {
    id: "onboarding-sdk",
    name: "Onboarding SDK",
    status: "draft",
    version: "v01.0",
    conversations: null,
    resolution: null,
    updatedAt: "2026-05-14T18:00:00Z",
    updatedAtLabel: "ontem",
  },
  {
    id: "retencao-pos-venda",
    name: "Retenção pós-venda",
    status: "error",
    version: "v04.2",
    conversations: 86,
    resolution: 0.41,
    updatedAt: "2026-05-15T10:00:00Z",
    updatedAtLabel: "4 h atrás",
  },
  {
    id: "qualificacao-inbound",
    name: "Qualificação inbound",
    status: "beta",
    version: "v02.0",
    conversations: 233,
    resolution: 0.76,
    updatedAt: "2026-05-14T09:00:00Z",
    updatedAtLabel: "1 d atrás",
  },
]

type SortKey =
  | "name"
  | "version"
  | "conversations"
  | "resolution"
  | "updatedAt"

export function SortableTableDemo() {
  const { sortedRows, getHeaderProps, getSortIcon } = useTableSort<Row, SortKey>(
    rows,
    {
      initialSort: { by: "conversations", direction: "desc" },
    },
  )

  const sortableTh = (key: SortKey, label: string, className?: string) => (
    <th className={className}>
      <button {...getHeaderProps(key)} className="aw-th-sort">
        {label}
        <span aria-hidden className="aw-th-sort__icon">
          {getSortIcon(key)}
        </span>
      </button>
    </th>
  )

  return (
    <AwTable>
      <thead>
        <tr>
          {sortableTh("name", "Agente")}
          <th>Status</th>
          {sortableTh("version", "Versão", "aw-table__mono")}
          {sortableTh("conversations", "Conversas", "aw-table__num")}
          {sortableTh("resolution", "Resolução", "aw-table__num")}
          {sortableTh("updatedAt", "Atualizado", "aw-table__mono")}
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((row) => {
          const pill = statusPill[row.status]
          return (
            <tr key={row.id}>
              <td className="aw-table__name">{row.name}</td>
              <td>
                <AwPill variant={pill.variant}>{pill.label}</AwPill>
              </td>
              <td className="aw-table__mono">{row.version}</td>
              <td className="aw-table__num">
                {row.conversations === null
                  ? "—"
                  : row.conversations.toLocaleString("pt-BR")}
              </td>
              <td className="aw-table__num">
                {row.resolution === null
                  ? "—"
                  : `${Math.round(row.resolution * 100)}%`}
              </td>
              <td className="aw-table__mono">{row.updatedAtLabel}</td>
            </tr>
          )
        })}
      </tbody>
    </AwTable>
  )
}
