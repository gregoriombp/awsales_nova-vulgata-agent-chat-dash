import { DataTable, type Column } from "@/components/tool-ui/data-table"
import {
  AwMembersTable,
  AwMembersTablePersonCell,
  AwMembersTableSelectCell,
  AwMembersTableTextCell,
} from "@/components/ui/AwMembersTable"
import { SortableTableDemo } from "./_sortable-demo"
import {
  PageHero,
  Section,
  Spec,
  PropRow,
  ApiTable,
  CodeExample,
  Toc,
  RelatedLinks,
} from "../../_primitives"

type ToolRow = {
  id: string
  name: string
  status: string
  conversations: number
  resolution: number
}

const toolRows: ToolRow[] = [
  {
    id: "atendimento-faq",
    name: "Atendimento FAQ",
    status: "live",
    conversations: 1840,
    resolution: 0.94,
  },
  {
    id: "pre-venda-b2b",
    name: "Pré-venda B2B",
    status: "draft",
    conversations: 412,
    resolution: 0.87,
  },
  {
    id: "retencao-pos-venda",
    name: "Retenção pós-venda",
    status: "error",
    conversations: 86,
    resolution: 0.41,
  },
]

const toolColumns: Column<ToolRow>[] = [
  { key: "name", label: "Agente", priority: "primary" },
  {
    key: "status",
    label: "Status",
    sortable: false,
    format: {
      kind: "status",
      statusMap: {
        live: { tone: "success", label: "Live" },
        draft: { tone: "neutral", label: "Rascunho" },
        error: { tone: "danger", label: "Erro" },
      },
    },
  },
  {
    key: "conversations",
    label: "Conversas",
    align: "right",
    format: { kind: "number" },
  },
  {
    key: "resolution",
    label: "Resolução",
    align: "right",
    format: { kind: "percent", decimals: 0 },
  },
]

const tableDecision = [
  {
    component: "AwTable",
    route: "/bombardier/styleguide/components/table#aw-table",
    use: "Tabela de produto com markup nativo, células customizadas e controle total.",
    dontUse:
      "Não use para JSON de tool que só precisa formatar dados declarativos.",
    note: "Default para produto. Você escreve thead, tbody e células com componentes Aw*.",
  },
  {
    component: "DataTable",
    route: "/bombardier/styleguide/components/table#data-table",
    use: "Resultado de agente/tool com columns + data, sort, filter, paginação e formatters.",
    dontUse:
      "Não use quando cada célula precisa de layout próprio, ações ricas ou composição manual.",
    note: "O schema decide a apresentação. Bom para outputs padronizados.",
  },
  {
    component: "AwMembersTable",
    route: "/bombardier/styleguide/components/aw-members-table",
    use: "Pessoas, permissões, presença, licença e gestão de membros do workspace.",
    dontUse:
      "Não use como tabela genérica de entidades que não são pessoas/membros.",
    note: "Padrão de domínio sobre AwTable airy + helpers de célula.",
  },
]

export default function TablePage() {
  return (
    <>
      <PageHero title="Tabelas">
        Hub canônico para tabelas do produto. Use esta página para ver a família
        inteira antes de escolher entre <code className="mono">AwTable</code>,{" "}
        <code className="mono">DataTable</code> e{" "}
        <code className="mono">AwMembersTable</code>. A regra visual comum é
        densidade sóbria, bordas sutis, hover discreto e{" "}
        <strong>zero zebra</strong>.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Toc
            items={[
              { id: "all", label: "Todas as tabelas" },
              { id: "aw-table", label: "AwTable" },
              { id: "data-table", label: "DataTable" },
              { id: "members-table", label: "Members table" },
              { id: "columns", label: "Tipos de coluna" },
              { id: "anatomy", label: "Anatomia" },
              { id: "sort", label: "Sort" },
              { id: "api", label: "API" },
              { id: "decision", label: "Quando usar" },
              { id: "related", label: "Relacionados" },
            ]}
          />

          <Section
            id="all"
            title="Todas as tabelas"
            lead="A família tem três níveis. Esta seção mostra as três sem trocar de página; as subpáginas continuam existindo para API detalhada."
          >
            <div className="grid grid-cols-1 gap-6">
              <div
                id="aw-table"
                className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="m-0">AwTable</h3>
                    <p className="body-sm m-0 mt-1 text-(--fg-secondary)">
                      Base canônica para tabela de produto com células montadas
                      manualmente.
                    </p>
                  </div>
                  <a
                    href="#decision"
                    className="mono text-xs text-(--aw-blue-700) no-underline hover:underline"
                  >
                    ver regra
                  </a>
                </div>
                <SortableTableDemo />
              </div>

              <div
                id="data-table"
                className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="m-0">DataTable</h3>
                    <p className="body-sm m-0 mt-1 text-(--fg-secondary)">
                      Surface declarativa para outputs de tool: schema entra,
                      formatação, sort e status saem prontos.
                    </p>
                  </div>
                  <a
                    href="#api"
                    className="mono text-xs text-(--aw-blue-700) no-underline hover:underline"
                  >
                    API detalhada
                  </a>
                </div>
                <DataTable
                  id="table-hub-data-table"
                  rowIdKey="id"
                  columns={toolColumns}
                  data={toolRows}
                  defaultSort={{ by: "conversations", direction: "desc" }}
                  locale="pt-BR"
                />
              </div>

              <div
                id="members-table"
                className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="m-0">AwMembersTable</h3>
                    <p className="body-sm m-0 mt-1 text-(--fg-secondary)">
                      Padrão de domínio para pessoas, permissões, licença e
                      presença.
                    </p>
                  </div>
                  <a
                    href="/bombardier/styleguide/components/aw-members-table"
                    className="mono text-xs text-(--aw-blue-700) no-underline hover:underline"
                  >
                    API detalhada
                  </a>
                </div>
                <AwMembersTable
                  columns={[
                    { label: "Person", icon: "person" },
                    { label: "Last viewed" },
                    { label: "Permissions", help: "Escopo de acesso." },
                    { label: "License", help: "Tipo de assento." },
                  ]}
                >
                  <tr>
                    <AwMembersTablePersonCell
                      name="Alex Smith"
                      email="alex@awsales.io"
                      initials="AS"
                    />
                    <AwMembersTableTextCell muted>
                      2 days ago
                    </AwMembersTableTextCell>
                    <AwMembersTableSelectCell value="Workspace" />
                    <AwMembersTableSelectCell value="Editor" />
                  </tr>
                  <tr>
                    <AwMembersTablePersonCell
                      name="Marina Costa"
                      email="marina@cliente.com"
                      initials="MC"
                      tag="ADMIN"
                    />
                    <AwMembersTableTextCell muted>
                      Nunca acessou
                    </AwMembersTableTextCell>
                    <AwMembersTableSelectCell value="Workspace and projects" />
                    <AwMembersTableTextCell>Viewer</AwMembersTableTextCell>
                  </tr>
                </AwMembersTable>
              </div>
            </div>
          </Section>

          <Section
            id="columns"
            title="Tipos de coluna"
            lead="Três classes utilitárias cobrem 95% dos casos em AwTable. Combine com o próprio <td> normal para texto padrão."
          >
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Spec
                k=".aw-table__name"
                v="500 · --fg-primary"
                d="Nome da entidade principal; primeira coluna da linha."
              />
              <Spec
                k=".aw-table__mono"
                v="mono 12 · --fg-secondary"
                d="IDs, versões, timestamps. Alinha à esquerda."
              />
              <Spec
                k=".aw-table__num"
                v="mono 12 · right-align"
                d="Contagens, porcentagens, valores agregados."
              />
            </div>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Lista densa sóbria — não planilha. Sem chrome próprio: a tabela respira dentro do wrapper da página. Hover ilumina a linha inteira, zero zebra."
          >
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Spec
                k="padding"
                v="16 · 20"
                d="Vertical · horizontal, em td. Header com vertical 12."
              />
              <Spec
                k="header"
                v="12 px · 500 · sentence-case"
                d="--fg-tertiary, fundo transparente. Sem uppercase."
              />
              <Spec
                k="hover row"
                v="--bg-surface"
                d="Transição base — suave, sem flash."
              />
              <Spec
                k="divisor"
                v="1px --border-subtle"
                d="Última linha sem divisor. Sem outer border."
              />
              <Spec
                k="body"
                v="14 px · --fg-primary"
                d="Texto padrão. Coluna nome em font-weight 500."
              />
              <Spec
                k="numeric"
                v="tabular-nums · right-align · 13 px"
                d="Coluna numérica alinha decimais e fica um clique menor."
              />
            </div>
          </Section>

          <Section
            id="sort"
            title="Sort · useTableSort"
            lead="Pra header sortable de verdade, plugue o hook useTableSort. Ele cuida do tri-state (none → asc → desc → none), guarda o estado interno, devolve as linhas ordenadas e os props pro <button> + ícone."
          >
            <CodeExample>{`"use client"
import { AwTable } from "@/components/ui/AwTable"
import { useTableSort } from "@/lib/hooks/useTableSort"

type Row = {
  id: string
  name: string
  conversations: number
  updatedAt: string
}

const rows: Row[] = [/* ... */]

export function AgentsTable() {
  const { sortedRows, getHeaderProps, getSortIcon } =
    useTableSort<Row, "name" | "conversations" | "updatedAt">(rows, {
      initialSort: { by: "conversations", direction: "desc" },
    })

  return (
    <AwTable>
      <thead>
        <tr>
          <th>
            <button {...getHeaderProps("name")} className="aw-th-sort">
              Agente
              <span aria-hidden className="aw-th-sort__icon">
                {getSortIcon("name")}
              </span>
            </button>
          </th>
        </tr>
      </thead>
      <tbody>{sortedRows.map((row) => <tr key={row.id}>{/* ... */}</tr>)}</tbody>
    </AwTable>
  )
}`}</CodeExample>

            <ApiTable>
              <PropRow
                prop="rows"
                type="readonly T[]"
                doc="Lista de linhas. O hook só reorganiza — não muta o array original."
              />
              <PropRow
                prop="options.initialSort"
                type='{ by, direction }?'
                doc="Sort inicial. Omita pra começar sem ordenação."
              />
              <PropRow
                prop="options.getSortValue"
                type="(row, key) => primitive?"
                doc="Override do valor comparado quando a célula renderizada não ordena bem."
              />
              <PropRow
                prop="→ sortedRows"
                type="T[]"
                doc="Linhas já ordenadas. Use direto no .map() do <tbody>."
              />
              <PropRow
                prop="→ getHeaderProps(key)"
                type="SortableHeaderProps"
                doc="Spread no <button> do header: dá type, onClick, aria-sort."
              />
              <PropRow
                prop="→ getSortIcon(key)"
                type='"⇅" | "↑" | "↓"'
                doc="Caractere pra colocar no span do ícone."
              />
            </ApiTable>
          </Section>

          <Section
            id="api"
            title="API"
            lead={`Import: import { AwTable } from "@/components/ui/AwTable".`}
          >
            <ApiTable>
              <PropRow
                prop="children"
                type="ReactNode"
                doc="Estrutura nativa de tabela: <thead>, <tbody>, <tr>, <th>, <td>."
              />
              <PropRow
                prop="...rest"
                type="TableHTMLAttributes"
                doc="Qualquer atributo nativo de <table>."
              />
            </ApiTable>

            <CodeExample>{`import { AwTable } from "@/components/ui/AwTable"
import { AwPill } from "@/components/ui/AwPill"

<AwTable>
  <thead>
    <tr>
      <th>Agente</th>
      <th>Status</th>
      <th className="aw-table__mono">Versão</th>
      <th className="aw-table__num">Conversas</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="aw-table__name">Atendimento FAQ</td>
      <td><AwPill variant="live">Live</AwPill></td>
      <td className="aw-table__mono">v12.4</td>
      <td className="aw-table__num">1 840</td>
    </tr>
  </tbody>
</AwTable>`}</CodeExample>
          </Section>

          <Section
            id="decision"
            title="Quando usar"
            lead="A decisão fica no fim como checklist. Se o caso cair em mais de uma linha, escolha a opção mais específica."
          >
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-(--border-subtle)">
                    <th className="pb-2 aw-eyebrow">componente</th>
                    <th className="pb-2 aw-eyebrow">quando usar</th>
                    <th className="pb-2 aw-eyebrow">quando não usar</th>
                    <th className="pb-2 aw-eyebrow">observação</th>
                  </tr>
                </thead>
                <tbody>
                  {tableDecision.map((row) => (
                    <tr
                      key={row.component}
                      className="border-b border-(--border-subtle) last:border-b-0 align-top"
                    >
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <a
                          href={row.route}
                          className="mono text-sm text-(--aw-blue-700) no-underline hover:underline"
                        >
                          {row.component}
                        </a>
                      </td>
                      <td className="py-3 pr-4 text-sm text-(--fg-primary)">
                        {row.use}
                      </td>
                      <td className="py-3 pr-4 text-sm text-(--fg-secondary)">
                        {row.dontUse}
                      </td>
                      <td className="py-3 text-sm text-(--fg-secondary)">
                        {row.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="related" title="Relacionados">
            <RelatedLinks
              items={[
                {
                  name: "Members table",
                  href: "/bombardier/styleguide/components/aw-members-table",
                  description:
                    "Subpágina técnica do padrão de membros, permissões e presença.",
                },
                {
                  name: "Pills",
                  href: "/bombardier/styleguide/components/pills",
                  description:
                    "Status em tabela deve usar AwPill, não texto colorido solto.",
                },
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
