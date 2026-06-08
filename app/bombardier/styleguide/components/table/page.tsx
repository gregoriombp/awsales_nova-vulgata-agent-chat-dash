import { SortableTableDemo } from "./_sortable-demo"
import {
  PageHero,
  Section,
  Spec,
  PropRow,
  ApiTable,
  CodeExample,
  DoDont,
} from "../../_primitives"

export default function TablePage() {
  return (
    <>
      <PageHero title="Tabela">
        Lista densa de entidades. Bordas sutis, hover discreto,{" "}
          <strong>zero zebra</strong>. Dados numéricos e técnicos em mono,
          alinhados à direita. Pra tabela com sort + responsive auto +
          formatters declarativos, veja{" "}
        <a className="underline" href="/bombardier/styleguide/components/data-table">
          Data table
        </a>{" "}
        (surface tool-ui).
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
<div className="flex flex-col gap-16">
        <Section
          id="default"
          title="Exemplo"
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
      </div>
    </div>
    </>
  )
}
