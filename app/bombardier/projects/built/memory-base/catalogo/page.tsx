"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { AwButton } from "@/components/ui/AwButton"
import { BuiltShell } from "@/app/bombardier/projects/_components/BuiltShell"
import { AwInput } from "@/components/ui/AwInput"
import { AwModal } from "@/components/ui/AwModal"
import { AwSheet } from "@/components/ui/AwSheet"
import { AwPill } from "@/components/ui/AwPill"
import { AwTabs } from "@/components/ui/AwTabs"
import { Icon } from "@/components/ui/Icon"

/**
 * Tela "Catálogo" (Etapa 5, ramo CSV) reconstruída no DS atual. 14 frames do
 * Figma → 1 tela-base + 2 modais + 1 drawer lateral. Diferente do Produtos: aqui
 * o fluxo é de CSV em lote (envio estruturado), com instruções de planilha num
 * AwSheet por cima do modal, e um passo de "dados variáveis detectados".
 */

const FIGMA_URL =
  "https://www.figma.com/design/QLLHzby4I8pGk83wFDY1hz?node-id=929-29942"

type Mode = null | "novo" | "variaveis" | "existente"
type Tab = "arquivos" | "integracao"
type Catalogo = { id: string; name: string }

const INTEGRACOES = [
  { id: "slack", name: "Slack", desc: "Importe mensagens e conteúdos de canais da sua equipe." },
  { id: "hotmart", name: "Hotmart", desc: "Importe informações dos seus produtos e conteúdos." },
  { id: "assiny", name: "Assiny", desc: "Acesse informações sobre suas assinaturas e produtos." },
  { id: "calendly", name: "Calendly", desc: "Acesse informações sobre agendamentos e eventos." },
  { id: "stripe", name: "Stripe", desc: "Acesse informações sobre pagamentos, clientes e assinaturas." },
]

const COLUNAS = [
  { col: "codigo_produto_unico", req: true, desc: "Identificador único do produto." },
  { col: "descricao", req: true, desc: "Descrição do produto." },
  { col: "unidade", req: true, desc: "Unidade de venda (ex: 'UN', 'CX', 'KG')." },
  { col: "unidade_metrica", req: true, desc: "Quantidade por unidade (ex: '1', '12', '0.5')." },
  { col: "grupo", req: true, desc: "Nome da categoria principal." },
  { col: "grupo_id", req: true, desc: "ID da categoria." },
  { col: "link_imagem", req: false, desc: "URL da imagem do produto." },
  { col: "tags", req: false, desc: "Palavras-chave que facilitam a localização do produto." },
]

const VARIAVEIS = ["preço (coluna D)", "estoque (coluna F)", "link_produto (coluna H)"]

const EXISTENTES = Array.from({ length: 4 }, (_, i) => ({
  id: `cat-${i}`,
  name: "Fyntra catalog",
  meta: i === 2 ? "Stripe" : "fyntra_analytics.csv",
  used: "Utilizado por 2 bases de conhecimento",
}))

export default function CatalogoScreen() {
  const [mode, setMode] = React.useState<Mode>(null)
  const [showInstr, setShowInstr] = React.useState(false)
  const [catalogos, setCatalogos] = React.useState<Catalogo[]>([])
  const [finished, setFinished] = React.useState(false)

  const [tab, setTab] = React.useState<Tab>("arquivos")
  const [name, setName] = React.useState("")
  const [csv, setCsv] = React.useState(false)
  const [integr, setIntegr] = React.useState<string[]>([])
  const [picked, setPicked] = React.useState<string | null>(null)

  function resetNovo() {
    setTab("arquivos")
    setName("")
    setCsv(false)
    setIntegr([])
  }

  function addCatalogo() {
    setCatalogos((c) => [...c, { id: `c-${c.length}`, name: name.trim() || "Catálogo Fyntra" }])
    resetNovo()
    setMode(null)
  }

  const novoCanAdvance = name.trim().length > 0 && (csv || integr.length > 0)

  return (
    <BuiltShell breadcrumbs={[{ label: "Projetos", href: "/bombardier/projects" }, { label: "Memory Base", href: "/bombardier/projects/memory-base" }, "Catálogo"]} center>

        <div className="w-full max-w-3xl">
          <p className="aw-eyebrow mb-6">Etapa 5 de 6 · Catálogo</p>
          <h1 className="text-2xl font-semibold tracking-tight">Catálogo</h1>
          <p className="mt-2 text-(--fg-secondary)">
            Selecione um catálogo já utilizado na organização ou crie um novo para
            adicioná-lo a esta base de conhecimento.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ChoiceCard icon="dataset" label="Novo catálogo" onClick={() => setMode("novo")} />
            <ChoiceCard
              icon="folder_open"
              label="Catálogo existente"
              onClick={() => setMode("existente")}
            />
          </div>

          {catalogos.map((c) => (
            <div
              key={c.id}
              className="mt-6 rounded-2xl border border-(--border-default) bg-(--bg-raised) p-4"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-(--bg-inverse) text-(--fg-on-inverse)">
                  <Icon name="dataset" size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-[11px] text-(--fg-tertiary)">Novo catálogo</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCatalogos((l) => l.filter((x) => x.id !== c.id))}
                  className="ml-auto text-xs text-(--accent-danger) hover:underline"
                >
                  Remover catálogo
                </button>
              </div>
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-(--border-subtle) bg-(--bg-surface) px-3 py-2.5">
                <Icon name="table_chart" size={18} />
                <div>
                  <p className="text-sm">fyntra_analytics.csv</p>
                  <p className="text-[11px] text-(--fg-tertiary)">100.000 produtos · 10 categorias</p>
                </div>
              </div>
            </div>
          ))}

          {finished && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-(--bg-muted) px-3 py-2 text-sm text-(--fg-secondary)">
              <span className="text-(--accent-success)">
                <Icon name="check_circle" size={18} fill={1} />
              </span>
              Etapa concluída (demo) — próximo: Playbook.
            </div>
          )}

          <div className="mt-10 flex items-center justify-between">
            <Link href="/bombardier/projects/memory-base" className="no-underline">
              <AwButton variant="ghost" iconLeft="arrow_back">
                Voltar
              </AwButton>
            </Link>
            <AwButton
              variant="primary"
              iconRight="arrow_forward"
              disabled={catalogos.length === 0}
              onClick={() => setFinished(true)}
            >
              Avançar
            </AwButton>
          </div>
        </div>

      {/* Modal: Novo catálogo */}
      <AwModal
        open={mode === "novo"}
        onClose={() => {
          resetNovo()
          setMode(null)
        }}
        size="cockpit"
        title="Novo catálogo"
        footer={
          <div className="flex items-center justify-between">
            <AwButton
              variant="ghost"
              onClick={() => {
                resetNovo()
                setMode(null)
              }}
            >
              Cancelar
            </AwButton>
            <AwButton
              variant="primary"
              disabled={!novoCanAdvance}
              onClick={() => (csv ? setMode("variaveis") : addCatalogo())}
            >
              Avançar
            </AwButton>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm text-(--fg-secondary)">
            Envie os dados do catálogo por meio de um único arquivo CSV ou usando
            uma integração. As informações devem estar organizadas e estruturadas
            no arquivo para garantir melhor processamento.
          </p>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Nome do catálogo</span>
            <AwInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" />
          </label>

          <AwTabs
            variant="underline"
            value={tab}
            onChange={(v) => setTab(v as Tab)}
            items={[
              { value: "arquivos", label: "Arquivos" },
              { value: "integracao", label: "Integração" },
            ]}
          />

          {tab === "arquivos" ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-(--border-strong) bg-(--bg-surface) px-6 py-8 text-center">
              <Icon name="grid_view" size={28} />
              <p className="text-sm font-medium">
                Sincronize vários produtos de catálogo de uma vez
              </p>
              <p className="max-w-md text-xs text-(--fg-tertiary)">
                O arquivo CSV permite cadastrar todos os seus produtos numa única
                vez. Preencha o modelo com as informações e envie pelo sistema.
              </p>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                <AwButton variant="secondary" size="sm" iconLeft="help" onClick={() => setShowInstr(true)}>
                  Instruções para arquivo CSV
                </AwButton>
                <AwButton
                  variant={csv ? "subtle" : "primary"}
                  size="sm"
                  iconLeft={csv ? "check" : "upload_file"}
                  onClick={() => setCsv(true)}
                >
                  {csv ? "fyntra_analytics.csv" : "Escolher arquivo CSV"}
                </AwButton>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {INTEGRACOES.map((it) => {
                const on = integr.includes(it.id)
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() =>
                      setIntegr((l) => (on ? l.filter((x) => x !== it.id) : [...l, it.id]))
                    }
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition",
                      on
                        ? "border-(--fg-primary) bg-(--bg-surface)"
                        : "border-(--border-default) bg-(--bg-raised) hover:border-(--border-strong)",
                    )}
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-(--bg-muted) text-xs font-semibold">
                      {it.name[0]}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        {it.name}
                        <AwPill variant="live">Ativo</AwPill>
                      </span>
                      <span className="block truncate text-xs text-(--fg-tertiary)">{it.desc}</span>
                    </span>
                    <span className="ml-auto text-(--fg-primary)">
                      <Icon
                        name={on ? "check_box" : "check_box_outline_blank"}
                        size={20}
                        fill={on ? 1 : 0}
                      />
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </AwModal>

      {/* Modal: dados variáveis detectados */}
      <AwModal
        open={mode === "variaveis"}
        onClose={() => setMode("novo")}
        size="md"
        title="Novo catálogo"
        footer={
          <div className="flex items-center justify-between gap-3">
            <AwButton variant="ghost" iconLeft="arrow_back" onClick={() => setMode("novo")}>
              Voltar
            </AwButton>
            <div className="flex items-center gap-2">
              <AwButton variant="secondary" onClick={addCatalogo}>
                Manter dados estáticos
              </AwButton>
              <AwButton variant="primary" iconLeft="build" onClick={addCatalogo}>
                Configurar tool
              </AwButton>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">Dados variáveis detectados</h2>
          <p className="text-sm text-(--fg-secondary)">
            Identificamos colunas que tendem a mudar com frequência:
          </p>
          <ul className="flex flex-col gap-1.5">
            {VARIAVEIS.map((v) => (
              <li key={v} className="flex items-center gap-2 text-sm">
                <Icon name="bolt" size={16} /> {v}
              </li>
            ))}
          </ul>
          <p className="text-xs text-(--fg-tertiary)">
            Pra manter sempre atualizadas, recomendamos configurar uma Tool que
            consulte esses dados em tempo real. Se mudam raramente, pode mantê-las
            no CSV como dados estáticos.
          </p>
        </div>
      </AwModal>

      {/* Modal: catálogos existentes */}
      <AwModal
        open={mode === "existente"}
        onClose={() => {
          setPicked(null)
          setMode(null)
        }}
        size="cockpit"
        title="Catálogos existentes"
        footer={
          <div className="flex items-center justify-between">
            <AwButton
              variant="ghost"
              onClick={() => {
                setPicked(null)
                setMode(null)
              }}
            >
              Fechar
            </AwButton>
            <AwButton
              variant="primary"
              disabled={!picked}
              onClick={() => {
                setCatalogos((c) => [...c, { id: `e-${c.length}`, name: "Fyntra catalog" }])
                setPicked(null)
                setMode(null)
              }}
            >
              Adicionar
            </AwButton>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-(--fg-secondary)">
            Selecione entre um catálogo existente na organização.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {EXISTENTES.map((e) => {
              const on = picked === e.id
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setPicked(e.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition",
                    on
                      ? "border-(--fg-primary) bg-(--bg-surface)"
                      : "border-(--border-default) bg-(--bg-raised) hover:border-(--border-strong)",
                  )}
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-(--bg-inverse) text-(--fg-on-inverse)">
                    <Icon name="dataset" size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{e.name}</span>
                    <span className="block truncate text-[11px] text-(--fg-tertiary)">{e.meta}</span>
                    <span className="block truncate text-[11px] text-(--fg-tertiary)">{e.used}</span>
                  </span>
                  <Icon
                    name={on ? "radio_button_checked" : "radio_button_unchecked"}
                    size={20}
                    fill={on ? 1 : 0}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </AwModal>

      {/* Drawer lateral: instruções do CSV (acima do modal) */}
      <AwSheet
        open={showInstr}
        onClose={() => setShowInstr(false)}
        size="default"
        title="Instruções para arquivo CSV"
        zIndex={1100}
        footer={
          <AwButton variant="secondary" block iconLeft="download">
            Baixar modelo CSV
          </AwButton>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-(--fg-secondary)">
            Pra evitar erros no processamento, use o modelo disponibilizado. O
            arquivo deve ter no máximo 30 mil produtos.
          </p>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-(--fg-tertiary)">
              Colunas
            </p>
            {COLUNAS.map((c) => (
              <div
                key={c.col}
                className="rounded-xl border border-(--border-subtle) bg-(--bg-raised) px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{c.col}</span>
                  {c.req ? (
                    <AwPill variant="warning">obrigatória</AwPill>
                  ) : (
                    <AwPill variant="neutral">opcional</AwPill>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-(--fg-tertiary)">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </AwSheet>
    </BuiltShell>
  )
}

function ChoiceCard({
  icon,
  label,
  onClick,
}: {
  icon: string
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl border border-(--border-default) bg-(--bg-raised) px-5 py-7 text-center transition hover:border-(--border-strong)"
    >
      <Icon name={icon} size={24} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}
