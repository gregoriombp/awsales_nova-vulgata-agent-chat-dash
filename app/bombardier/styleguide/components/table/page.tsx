import { SortableTableDemo } from "./_sortable-demo"
import {
  PageHero,
  Section,
  Spec,
  PropRow,
  ApiTable,
  CodeExample,
  DoDont,
  Tldr,
  Toc,
  RelatedLinks,
} from "../../_primitives"

const tableDecision = [
  {
    need: "Markup nativo, células customizadas e controle total",
    component: "AwTable",
    route: "/bombardier/styleguide/components/table",
    note: "Default para produto. Você escreve thead, tbody e células com componentes Aw*.",
  },
  {
    need: "JSON de tool, formatters declarativos, sort, filter e paginação",
    component: "DataTable",
    route: "/bombardier/styleguide/components/data-table",
    note: "Use para resultado de agente/tool-ui. O schema decide a apresentação.",
  },
  {
    need: "Tabela de pessoas, permissões, presença e papel no workspace",
    component: "AwMembersTable",
    route: "/bombardier/styleguide/components/aw-members-table",
    note: "Padrão de domínio para membros. Não use como tabela genérica.",
  },
]

export default function TablePage() {
  return (
    <>
      <PageHero title="Tabelas">
        Hub canônico para tabelas do produto. Use esta página para escolher
        entre <code className="mono">AwTable</code>,{" "}
        <code className="mono">DataTable</code> e{" "}
        <code className="mono">AwMembersTable</code> antes de criar markup novo.
        A regra visual comum é densidade sóbria, bordas sutis, hover discreto e{" "}
        <strong>zero zebra</strong>.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
<div className="flex flex-col gap-16">
        <Tldr
          use={[
            <>Use <code className="mono">AwTable</code> como tabela base de produto.</>,
            <>Use <code className="mono">DataTable</code> quando a entrada é schema + dados de uma tool.</>,
            <>Use <code className="mono">AwMembersTable</code> só para pessoas, permissões e times.</>,
          ]}
          dontUse={[
            <>Não criar uma tabela nova para cada feature.</>,
            <>Não usar DataTable para layouts com células altamente customizadas.</>,
            <>Não usar AwMembersTable fora de contexto de membros/pessoas.</>,
          ]}
        />

        <Toc
          items={[
            { id: "decision", label: "Qual usar" },
            { id: "default", label: "AwTable" },
            { id: "columns", label: "Tipos de coluna" },
            { id: "anatomy", label: "Anatomia" },
            { id: "sort", label: "Sort" },
            { id: "api", label: "API" },
            { id: "do-dont", label: "Do / Don't" },
            { id: "related", label: "Relacionados" },
          ]}
        />

        <Section
          id="decision"
          title="Qual usar"
          lead="Uma família, três níveis. AwTable é o primitivo; DataTable é uma surface declarativa; AwMembersTable é um padrão de domínio."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-(--border-subtle)">
                  <th className="pb-2 aw-eyebrow">necessidade</th>
                  <th className="pb-2 aw-eyebrow">componente</th>
                  <th className="pb-2 aw-eyebrow">regra</th>
                </tr>
              </thead>
              <tbody>
                {tableDecision.map((row) => (
                  <tr
                    key={row.component}
                    className="border-b border-(--border-subtle) last:border-b-0 align-top"
                  >
                    <td className="py-3 pr-4 text-sm text-(--fg-primary)">
                      {row.need}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <a
                        href={row.route}
                        className="mono text-sm text-(--aw-blue-700) no-underline hover:underline"
                      >
                        {row.component}
                      </a>
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

        <Section
          id="default"
          title="AwTable"
          lead="Headers sortable de verdade — clique pra ciclar none → asc → desc. Coluna ativa fica em --fg-primary com a direção; as outras mostram ⇅ esmaecido. Sort vem do hook useTableSort (documentado abaixo)."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6">
            <SortableTableDemo />
          </div>
        </Section>

        <Section
          id="columns"
          title="Tipos de coluna"
          lead="Três classes utilitárias cobrem 95% dos casos. Combine com o próprio <td> normal para texto padrão."
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
          lead="Pra header sortable de verdade, plugue o hook useTableSort. Ele cuida do tri-state (none → asc → desc → none), guarda o estado interno, devolve as linhas ordenadas e os props pro <button> + ícone. Cada coluna sortable tem um <button class='aw-th-sort'> dentro do <th>; o resto é só markup nativo."
        >
          <CodeExample>{`"use client"
import { AwTable } from "@/components/ui/AwTable"
import { useTableSort } from "@/lib/hooks/useTableSort"

type Row = {
  id: string
  name: string
  conversations: number
  updatedAt: string  // ISO
}

const rows: Row[] = [/* ... */]

export function AgentsTable() {
  const { sortedRows, getHeaderProps, getSortIcon } =
    useTableSort<Row, "name" | "conversations" | "updatedAt">(rows, {
      initialSort: { by: "conversations", direction: "desc" },
    })

  const sortableTh = (key, label, className) => (
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
          {sortableTh("conversations", "Conversas", "aw-table__num")}
          {sortableTh("updatedAt", "Atualizado", "aw-table__mono")}
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((row) => (
          <tr key={row.id}>
            <td className="aw-table__name">{row.name}</td>
            <td className="aw-table__num">{row.conversations}</td>
            <td className="aw-table__mono">{row.updatedAt}</td>
          </tr>
        ))}
      </tbody>
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
              doc="Sort inicial. Omita pra começar sem ordenação (linhas na ordem do array)."
            />
            <PropRow
              prop="options.getSortValue"
              type="(row, key) => primitive?"
              doc="Override do valor comparado. Use quando a célula renderizada não ordena bem (ex.: 'há 2h' vira ISO timestamp, 'v12.4' vira número)."
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
              doc="Caractere pra colocar no span do ícone. ⇅ quando inativa, ↑/↓ quando ativa."
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

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Números em mono alinhados à direita.</>,
              <>Status via AwPill, não via texto colorido.</>,
              <>Coluna “nome” sempre em font-heading destacando a entidade.</>,
            ]}
              donts={[
              <>Zebra striping. A estética é sóbria, lista densa.</>,
              <>Ações inline por linha que não tenham ícone-only (vira ruído).</>,
              <>Tabela com paginação em lugar onde cabe uma lista de 8 itens.</>,
            ]}
          />
        </Section>

        <Section id="related" title="Relacionados">
          <RelatedLinks
            items={[
              {
                name: "Data table",
                href: "/bombardier/styleguide/components/data-table",
                description:
                  "Subpágina técnica da surface tool-ui para JSON, formatters, busca e paginação.",
              },
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
