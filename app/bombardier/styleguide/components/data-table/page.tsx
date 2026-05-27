import { DataTable, type Column } from "@/components/tool-ui/data-table"
import {
  ApiTable,
  PageHero,
  PropRow,
  Section,
  Stage,
  Tldr,
} from "../../_primitives"

type AgentRow = {
  id: string
  name: string
  status: string
  version: string
  conversations: number
  resolution: number
  updated: string
}

const agentRows: AgentRow[] = [
  {
    id: "atendimento-faq",
    name: "Atendimento FAQ",
    status: "live",
    version: "v12.4",
    conversations: 1840,
    resolution: 0.94,
    updated: "2026-05-15T13:46:00Z",
  },
  {
    id: "pre-venda-b2b",
    name: "Pré-venda B2B",
    status: "thinking",
    version: "v08.1",
    conversations: 412,
    resolution: 0.87,
    updated: "2026-05-15T12:00:00Z",
  },
  {
    id: "onboarding-sdk",
    name: "Onboarding SDK",
    status: "draft",
    version: "v01.0",
    conversations: 0,
    resolution: 0,
    updated: "2026-05-14T18:30:00Z",
  },
  {
    id: "retencao-pos-venda",
    name: "Retenção pós-venda",
    status: "error",
    version: "v04.2",
    conversations: 86,
    resolution: 0.41,
    updated: "2026-05-15T10:00:00Z",
  },
  {
    id: "qualificacao-inbound",
    name: "Qualificação inbound",
    status: "beta",
    version: "v02.0",
    conversations: 233,
    resolution: 0.76,
    updated: "2026-05-14T09:00:00Z",
  },
]

const agentColumns: Column<AgentRow>[] = [
  { key: "name", label: "Agente", priority: "primary" },
  {
    key: "status",
    label: "Status",
    sortable: false,
    format: {
      kind: "status",
      statusMap: {
        live: { tone: "success", label: "Live" },
        thinking: { tone: "info", label: "Pensando" },
        draft: { tone: "neutral", label: "Rascunho" },
        error: { tone: "danger", label: "Erro" },
        beta: { tone: "warning", label: "Beta" },
      },
    },
  },
  { key: "version", label: "Versão", hideOnMobile: true },
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
  {
    key: "updated",
    label: "Atualizado",
    format: { kind: "date", dateFormat: "relative" },
    hideOnMobile: true,
  },
]

type FormatterRow = {
  id: string
  produto: string
  preco: number
  margem: number
  estoque: number
  ativo: boolean
  categoria: string
  url: string
}

const formatterRows: FormatterRow[] = [
  {
    id: "p1",
    produto: "Plano Starter",
    preco: 49.9,
    margem: 0.42,
    estoque: 124,
    ativo: true,
    categoria: "saas",
    url: "https://example.com/starter",
  },
  {
    id: "p2",
    produto: "Plano Growth",
    preco: 149.0,
    margem: 0.58,
    estoque: 38,
    ativo: true,
    categoria: "saas",
    url: "https://example.com/growth",
  },
  {
    id: "p3",
    produto: "Add-on Whatsapp",
    preco: 19.0,
    margem: -0.04,
    estoque: 0,
    ativo: false,
    categoria: "addon",
    url: "https://example.com/whatsapp",
  },
]

const formatterColumns: Column<FormatterRow>[] = [
  { key: "produto", label: "Produto", format: { kind: "link", hrefKey: "url" } },
  {
    key: "preco",
    label: "Preço",
    align: "right",
    format: { kind: "currency", currency: "BRL" },
  },
  {
    key: "margem",
    label: "Δ margem",
    align: "right",
    format: { kind: "delta", decimals: 1 },
  },
  { key: "estoque", label: "Estoque", align: "right", format: { kind: "number" } },
  {
    key: "ativo",
    label: "Ativo",
    sortable: false,
    format: { kind: "boolean", labels: { true: "Sim", false: "Não" } },
  },
  {
    key: "categoria",
    label: "Categoria",
    sortable: false,
    format: {
      kind: "badge",
      colorMap: { saas: "info", addon: "neutral" },
    },
  },
]

type ConversaRow = {
  id: string
  cliente: string
  agente: string
  status: string
  mensagens: number
  ultimoContato: string
}

const conversaStatusMap = {
  resolvida: { tone: "success", label: "Resolvida" },
  aguardando: { tone: "warning", label: "Aguardando cliente" },
  escalada: { tone: "danger", label: "Escalada p/ humano" },
  ativa: { tone: "info", label: "Em andamento" },
} as const

const conversaAgents = [
  "Atendimento FAQ",
  "Pré-venda B2B",
  "Onboarding SDK",
  "Retenção pós-venda",
  "Qualificação inbound",
]

const conversaClientes = [
  "Avante Logística",
  "Bonsai Studio",
  "Casa Faroeste",
  "Drago Café",
  "Estúdio Quintal",
  "Flux Engenharia",
  "Garagem 47",
  "Helena & Filhos",
  "Iguá Solar",
  "Jambo Saúde",
  "Kibon Mercearia",
  "Lume Arquitetura",
  "Maré Náutica",
  "Norte Têxtil",
  "Ovo Frito Bar",
  "Pilar Imóveis",
  "Quartzo Joias",
  "Rampa Skate",
  "Sol & Sal Pousada",
  "Taberna do Porto",
  "Útero Cerâmica",
  "Vértice Arquitetos",
  "Whisky Cellars",
  "Xeque-mate Chess",
]

const conversaRows: ConversaRow[] = conversaClientes.map((cliente, i) => {
  const statuses = ["resolvida", "aguardando", "escalada", "ativa"] as const
  const status = statuses[i % statuses.length]
  const minutesAgo = (i + 1) * 17
  return {
    id: `conv-${String(i + 1).padStart(3, "0")}`,
    cliente,
    agente: conversaAgents[i % conversaAgents.length],
    status,
    mensagens: 3 + ((i * 7) % 42),
    ultimoContato: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
  }
})

const conversaColumns: Column<ConversaRow>[] = [
  { key: "cliente", label: "Cliente", priority: "primary" },
  { key: "agente", label: "Agente" },
  {
    key: "status",
    label: "Status",
    sortable: false,
    format: { kind: "status", statusMap: conversaStatusMap },
  },
  {
    key: "mensagens",
    label: "Mensagens",
    align: "right",
    format: { kind: "number" },
  },
  {
    key: "ultimoContato",
    label: "Último contato",
    format: { kind: "date", dateFormat: "relative" },
    hideOnMobile: true,
  },
]

export default function DataTablePage() {
  return (
    <>
      <PageHero title="Data table">
        Tabela <strong>data-driven</strong> do registry tool-ui. Você passa{" "}
        <code className="mono">columns</code> +{" "}
        <code className="mono">data</code> e ela cuida de sort tri-state,
        formatação declarativa (currency, percent, date relativo, status,
        link), e reflow pra cards no mobile. Pensada como surface de
        resultado de tool de agente — agente devolve JSON, render bonito sem
        cada célula montada na mão.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>Output de tool de agente que devolve uma lista (registros, métricas, resultados de busca).</>,
            <>Tabela com sort + filter global + paginação + reflow mobile, tudo declarativo.</>,
            <>Dados já vêm com tipo conhecido (number, currency, date) e o formatador resolve a apresentação.</>,
          ]}
          dontUse={[
            <>Listas curtas de UI de produto com células customizadas — use <code className="mono">AwTable</code>, controle total da estrutura.</>,
            <>Quando precisar de seleção de linha, column visibility toggle ou row actions menu — não tem (ainda).</>,
            <>Datasets grandes (1k+ linhas) — não tem virtualização.</>,
          ]}
        />

        <Section
          id="default"
          title="Default · agentes com sort, status e percent"
          lead="Clique nos headers (não nos opt-outs) pra ciclar sort: none → asc → desc → none. Status vem de statusMap; percent assume basis 0–1 por padrão."
        >
          <Stage label="5 linhas · sortable · status + percent + date relativo" gridClassName="flex w-full">
            <DataTable
              id="data-table-agents"
              rowIdKey="id"
              columns={agentColumns}
              data={agentRows}
              defaultSort={{ by: "conversations", direction: "desc" }}
              locale="pt-BR"
            />
          </Stage>
        </Section>

        <Section
          id="formatters"
          title="Formatters"
          lead="Cada coluna declara seu format. Link transforma a célula em <a> usando hrefKey; delta colore + sinal; boolean troca true/false por labels; badge usa colorMap (tones success/warning/danger/info/neutral)."
        >
          <Stage label="link · currency · delta · number · boolean · badge" gridClassName="flex w-full">
            <DataTable
              id="data-table-formatters"
              rowIdKey="id"
              columns={formatterColumns}
              data={formatterRows}
              locale="pt-BR"
            />
          </Stage>
        </Section>

        <Section
          id="filter"
          title="Filter · busca global"
          lead="Passe a prop filter pra ligar a busca acima da tabela. O input é case-insensitive e bate em todas as colunas por padrão; restrinja com filter.columns se quiser limitar (ex.: só cliente). Quando o filter narrow zera resultado, o estado vazio aparece automaticamente."
        >
          <Stage label="filter habilitado · busca em todas as colunas" gridClassName="flex w-full">
            <DataTable
              id="data-table-filter"
              rowIdKey="id"
              columns={conversaColumns}
              data={conversaRows}
              filter={{ placeholder: "Buscar cliente, agente ou status…" }}
              locale="pt-BR"
            />
          </Stage>
        </Section>

        <Section
          id="pagination"
          title="Paginação"
          lead="Passe pagination.pageSize pra fatiar o dataset em páginas. pageSizeOptions é opcional — se informado, vira um select de linhas por página. A footer mostra range (X–Y de Z) + prev/next; reset automático pra página 1 quando o filter narrow estoura o pageCount."
        >
          <Stage label="pageSize 8 · pageSizeOptions [8, 16, 24]" gridClassName="flex w-full">
            <DataTable
              id="data-table-pagination"
              rowIdKey="id"
              columns={conversaColumns}
              data={conversaRows}
              pagination={{ pageSize: 8, pageSizeOptions: [8, 16, 24] }}
              locale="pt-BR"
            />
          </Stage>
        </Section>

        <Section
          id="filter-pagination-sort"
          title="Combinado · filter + paginação + sort"
          lead="As três features funcionam juntas: o filter narrowa, o sort reordena o resultado filtrado, e a paginação fatia o resultado ordenado. Mudar o filter reseta a página pra 1."
        >
          <Stage label="todas ligadas · pageSize 6" gridClassName="flex w-full">
            <DataTable
              id="data-table-combined"
              rowIdKey="id"
              columns={conversaColumns}
              data={conversaRows}
              defaultSort={{ by: "mensagens", direction: "desc" }}
              filter={{
                placeholder: "Filtrar conversas…",
                columns: ["cliente", "agente"],
              }}
              pagination={{ pageSize: 6, pageSizeOptions: [6, 12, 24] }}
              locale="pt-BR"
            />
          </Stage>
        </Section>

        <Section
          id="empty"
          title="Estado vazio"
          lead="emptyMessage substitui o body quando data.length === 0. Mantém os headers desenhados pra preservar a estrutura visual."
        >
          <Stage label="data: []" gridClassName="flex w-full">
            <DataTable
              id="data-table-empty"
              rowIdKey="id"
              columns={agentColumns}
              data={[]}
              emptyMessage="Nenhum agente ativo no período."
              locale="pt-BR"
            />
          </Stage>
        </Section>

        <Section
          id="mobile"
          title="Responsive · auto stack"
          lead="Em viewports estreitos a tabela vira cards verticais: colunas priority='primary' sempre aparecem; secondary entram expansíveis; tertiary e hideOnMobile somem. Redimensione a janela pra ver."
        >
          <Stage label="Mesma tabela, viewport < 640px" gridClassName="flex w-full">
            <div className="w-full max-w-sm">
              <DataTable
                id="data-table-mobile"
                rowIdKey="id"
                columns={agentColumns}
                data={agentRows.slice(0, 3)}
                locale="pt-BR"
              />
            </div>
          </Stage>
        </Section>

        <Section
          id="api"
          title="API"
          lead="Props principais. Tipos completos (Column, FormatConfig, Tone) em components/tool-ui/data-table/types.ts e formatters.tsx."
        >
          <ApiTable>
            <PropRow
              prop="id"
              type="string"
              doc="Identificador único da surface; vai pro data-tool-ui-id."
            />
            <PropRow
              prop="columns"
              type="Column<T>[]"
              doc="Definição das colunas: key, label, format, align, priority, sortable, hideOnMobile."
            />
            <PropRow
              prop="data"
              type="T[]"
              doc="Linhas. Use primitivos (string, number, boolean, null) ou arrays de primitivos — pra link/badge, declare no column.format."
            />
            <PropRow
              prop="rowIdKey"
              type="keyof T?"
              doc="Recomendado. Key estável pro React reconciliar quando data reordena."
            />
            <PropRow
              prop="defaultSort"
              type='{ by, direction }?'
              doc="Estado inicial de sort (uncontrolled). Cycle: none → asc → desc → none."
            />
            <PropRow
              prop="sort / onSortChange"
              type="controlled"
              doc="Modo controlado — você guarda o sort em state e recebe updates."
            />
            <PropRow
              prop="emptyMessage"
              type="string?"
              doc="Texto exibido quando data.length === 0 (ou quando filter narrow zera o resultado)."
            />
            <PropRow
              prop="maxHeight"
              type="string?"
              doc="CSS height — ativa scroll vertical interno com header sticky."
            />
            <PropRow
              prop="locale"
              type="string?"
              def="'en-US'"
              doc="BCP-47 — pt-BR pra moeda/data em português."
            />
            <PropRow
              prop="filter"
              type="{ placeholder?, columns? }?"
              doc="Presença liga a busca global acima da tabela. columns restringe quais keys são matchadas (default: todas)."
            />
            <PropRow
              prop="defaultFilterValue"
              type="string?"
              doc="Query inicial (uncontrolled)."
            />
            <PropRow
              prop="filterValue / onFilterChange"
              type="controlled"
              doc="Modo controlado da busca — você guarda a query em state e recebe updates."
            />
            <PropRow
              prop="pagination"
              type="{ pageSize, pageSizeOptions? }?"
              doc="Presença liga a footer de paginação. pageSizeOptions habilita o select de linhas por página."
            />
            <PropRow
              prop="defaultPageIndex"
              type="number?"
              doc="Página inicial 0-based (uncontrolled)."
            />
            <PropRow
              prop="pageIndex / onPageChange"
              type="controlled"
              doc="Modo controlado da paginação — você guarda o índice e recebe updates."
            />
          </ApiTable>
        </Section>
      </div>
    </>
  )
}
