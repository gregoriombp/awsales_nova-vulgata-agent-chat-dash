"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { AwButton } from "@/components/ui/AwButton"
import { AwInput } from "@/components/ui/AwInput"
import { AwModal } from "@/components/ui/AwModal"
import { AwPill } from "@/components/ui/AwPill"
import { AwTabs } from "@/components/ui/AwTabs"
import { Icon } from "@/components/ui/Icon"

/**
 * Tela "Produtos" (Etapa 5 do wizard) reconstruída no DS atual. No Figma eram 20
 * frames — 1 tela-base (escolha Novo/Existente) + estados de 3 modais. Aqui as
 * "repetições" viram modais INTERATIVOS de verdade:
 *   • "Novo produto" — form Nome + AwTabs (Arquivos/URL/Snippet/Integração)
 *   • "Produtos existentes" — busca + grid multi-seleção
 *   • "Você perderá seu progresso" — confirmação de descarte ao fechar com dados
 * Saída da ação "Construir no repo" pro cluster Produtos.
 */

const FIGMA_URL =
  "https://www.figma.com/design/QLLHzby4I8pGk83wFDY1hz?node-id=929-29942"

type Mode = null | "novo" | "existente" | "discard"
type Tab = "arquivos" | "url" | "snippet" | "integracao"
type Produto = { id: string; name: string; fontes: number }

const INTEGRACOES = [
  { id: "slack", name: "Slack", desc: "Importe mensagens e conteúdos de canais da sua equipe." },
  { id: "hotmart", name: "Hotmart", desc: "Importe informações dos seus produtos e conteúdos." },
  { id: "assiny", name: "Assiny", desc: "Acesse informações sobre suas assinaturas e produtos." },
  { id: "calendly", name: "Calendly", desc: "Acesse informações sobre agendamentos e eventos." },
  { id: "stripe", name: "Stripe", desc: "Acesse informações sobre pagamentos, clientes e assinaturas." },
]

const EXISTENTES = Array.from({ length: 6 }, (_, i) => ({
  id: `ex-${i}`,
  name: "Fyntra analytics",
  meta: "fyntra_analytics.pdf  ·  +3",
  used: "Utilizado por 2 bases de conhecimento",
}))

export default function ProdutosScreen() {
  const [mode, setMode] = React.useState<Mode>(null)
  const [produtos, setProdutos] = React.useState<Produto[]>([])
  const [finished, setFinished] = React.useState(false)

  // Estado do modal "Novo produto"
  const [tab, setTab] = React.useState<Tab>("arquivos")
  const [name, setName] = React.useState("")
  const [files, setFiles] = React.useState<string[]>([])
  const [urls, setUrls] = React.useState<string[]>([])
  const [urlDraft, setUrlDraft] = React.useState("")
  const [snippets, setSnippets] = React.useState<string[]>([])
  const [snippetDraft, setSnippetDraft] = React.useState("")
  const [integr, setIntegr] = React.useState<string[]>([])

  const novoDirty =
    name.trim().length > 0 ||
    files.length > 0 ||
    urls.length > 0 ||
    snippets.length > 0 ||
    integr.length > 0
  const fontes = files.length + urls.length + snippets.length + integr.length

  // Estado do modal "Produtos existentes"
  const [search, setSearch] = React.useState("")
  const [picked, setPicked] = React.useState<string[]>([])

  function resetNovo() {
    setTab("arquivos")
    setName("")
    setFiles([])
    setUrls([])
    setUrlDraft("")
    setSnippets([])
    setSnippetDraft("")
    setIntegr([])
  }

  function closeNovo() {
    if (novoDirty) setMode("discard")
    else {
      resetNovo()
      setMode(null)
    }
  }

  function salvarNovo() {
    setProdutos((p) => [
      ...p,
      { id: `np-${p.length}`, name: name.trim() || "Novo produto", fontes },
    ])
    resetNovo()
    setMode(null)
  }

  function selecionarExistentes() {
    setProdutos((p) => [
      ...p,
      ...picked.map((id, i) => ({
        id: `ex-${p.length}-${i}`,
        name: EXISTENTES.find((e) => e.id === id)?.name ?? "Produto",
        fontes: 4,
      })),
    ])
    setPicked([])
    setSearch("")
    setMode(null)
  }

  return (
    <div className="flex min-h-screen flex-col bg-(--bg-canvas) text-(--fg-primary)">
      {/* Barra de contexto */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--border-subtle) px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/bombardier/projects/memory-base" className="no-underline">
            <AwButton variant="ghost" size="sm" iconLeft="arrow_back">
              Memory Base
            </AwButton>
          </Link>
          <span className="text-sm text-(--fg-secondary)">
            Reconstruído de{" "}
            <strong className="font-medium text-(--fg-primary)">
              Tela 06 · Produtos (1 tela + 3 modais)
            </strong>
          </span>
          <AwPill variant="live">No design system atual</AwPill>
        </div>
        <a href={FIGMA_URL} target="_blank" rel="noopener noreferrer" className="no-underline">
          <AwButton variant="ghost" size="sm" iconRight="open_in_new">
            Original no Figma
          </AwButton>
        </a>
      </div>

      {/* Conteúdo */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl">
          <p className="aw-eyebrow mb-6">Etapa 5 de 6 · Produtos</p>
          <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
          <p className="mt-2 text-(--fg-secondary)">
            Selecione produtos já utilizados na organização ou crie novos itens
            para adicioná-los a esta base de conhecimento.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ChoiceCard
              icon="add_box"
              label="Novo produto"
              onClick={() => setMode("novo")}
            />
            <ChoiceCard
              icon="inventory_2"
              label="Produto existente"
              onClick={() => setMode("existente")}
            />
          </div>

          {produtos.length > 0 && (
            <div className="mt-6 flex flex-col gap-2">
              {produtos.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-xl border border-(--border-default) bg-(--bg-raised) px-4 py-3"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-(--bg-surface)">
                    <Icon name="inventory_2" size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-[11px] text-(--fg-tertiary)">
                      {p.fontes} {p.fontes === 1 ? "fonte" : "fontes"} de conhecimento
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProdutos((list) => list.filter((x) => x.id !== p.id))}
                    className="ml-auto text-(--fg-tertiary) hover:text-(--fg-primary)"
                    aria-label={`Remover ${p.name}`}
                  >
                    <Icon name="close" size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

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
              disabled={produtos.length === 0}
              onClick={() => setFinished(true)}
            >
              Avançar
            </AwButton>
          </div>
        </div>
      </main>

      {/* Modal: Novo produto */}
      <AwModal
        open={mode === "novo"}
        onClose={closeNovo}
        size="cockpit"
        title="Novo produto"
        footer={
          <div className="flex items-center justify-between">
            <AwButton variant="ghost" onClick={closeNovo}>
              Cancelar
            </AwButton>
            <AwButton variant="primary" disabled={!name.trim()} onClick={salvarNovo}>
              Salvar
            </AwButton>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm text-(--fg-secondary)">
            Adicione informações do produto com arquivos, URLs, snippets ou
            integrações. Para mais precisão, envie apenas conteúdos relacionados ao
            produto.
          </p>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Nome</span>
            <AwInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do produto"
            />
          </label>

          <AwTabs
            variant="underline"
            value={tab}
            onChange={(v) => setTab(v as Tab)}
            items={[
              { value: "arquivos", label: "Arquivos" },
              { value: "url", label: "URL" },
              { value: "snippet", label: "Snippet" },
              { value: "integracao", label: "Integração" },
            ]}
          />

          {tab === "arquivos" && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-(--border-strong) bg-(--bg-surface) px-6 py-8 text-center">
                <Icon name="cloud_upload" size={28} />
                <p className="text-sm font-medium">Arraste e solte arquivos aqui</p>
                <p className="text-xs text-(--fg-tertiary)">JPG, PNG ou PDF · até 10 MB</p>
                <div className="mt-1">
                  <AwButton
                    variant="primary"
                    size="sm"
                    iconLeft="add"
                    onClick={() =>
                      setFiles((f) => [...f, `documento-${f.length + 1}.pdf`])
                    }
                  >
                    Adicionar arquivos
                  </AwButton>
                </div>
              </div>
              {files.map((f, i) => (
                <SourceRow
                  key={i}
                  icon="picture_as_pdf"
                  label={f}
                  onRemove={() => setFiles((list) => list.filter((_, j) => j !== i))}
                />
              ))}
            </div>
          )}

          {tab === "url" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-end gap-2">
                <label className="flex flex-1 flex-col gap-1.5">
                  <span className="text-sm font-medium">URL</span>
                  <AwInput
                    value={urlDraft}
                    onChange={(e) => setUrlDraft(e.target.value)}
                    placeholder="http://"
                  />
                </label>
                <AwButton
                  variant="secondary"
                  iconLeft="add"
                  disabled={!urlDraft.trim()}
                  onClick={() => {
                    setUrls((u) => [...u, urlDraft.trim()])
                    setUrlDraft("")
                  }}
                >
                  Adicionar URL
                </AwButton>
              </div>
              {urls.map((u, i) => (
                <SourceRow
                  key={i}
                  icon="link"
                  label={u}
                  onRemove={() => setUrls((list) => list.filter((_, j) => j !== i))}
                />
              ))}
            </div>
          )}

          {tab === "snippet" && (
            <div className="flex flex-col gap-3">
              <textarea
                value={snippetDraft}
                onChange={(e) => setSnippetDraft(e.target.value)}
                placeholder="Insira um texto"
                rows={4}
                className="w-full resize-y rounded-xl border border-(--border-default) bg-(--bg-raised) px-3 py-2 text-sm text-(--fg-primary) outline-none placeholder:text-(--fg-tertiary) focus:border-(--border-strong)"
              />
              <div>
                <AwButton
                  variant="secondary"
                  iconLeft="add"
                  disabled={!snippetDraft.trim()}
                  onClick={() => {
                    setSnippets((s) => [...s, snippetDraft.trim()])
                    setSnippetDraft("")
                  }}
                >
                  Adicionar Snippet
                </AwButton>
              </div>
              {snippets.map((s, i) => (
                <SourceRow
                  key={i}
                  icon="code"
                  label={s}
                  onRemove={() => setSnippets((list) => list.filter((_, j) => j !== i))}
                />
              ))}
            </div>
          )}

          {tab === "integracao" && (
            <div className="flex flex-col gap-2">
              {INTEGRACOES.map((it) => {
                const on = integr.includes(it.id)
                return (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() =>
                      setIntegr((list) =>
                        on ? list.filter((x) => x !== it.id) : [...list, it.id],
                      )
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
                      <span className="block truncate text-xs text-(--fg-tertiary)">
                        {it.desc}
                      </span>
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

      {/* Modal: Produtos existentes */}
      <AwModal
        open={mode === "existente"}
        onClose={() => {
          setPicked([])
          setSearch("")
          setMode(null)
        }}
        size="cockpit"
        title="Produtos existentes"
        footer={
          <div className="flex items-center justify-between">
            <AwButton
              variant="ghost"
              onClick={() => {
                setPicked([])
                setSearch("")
                setMode(null)
              }}
            >
              Cancelar
            </AwButton>
            <AwButton
              variant="primary"
              disabled={picked.length === 0}
              onClick={selecionarExistentes}
            >
              Selecionar{picked.length > 0 ? ` (${picked.length})` : ""}
            </AwButton>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-(--fg-secondary)">
            Selecione um produto já criado em outra base para vinculá-lo a esta.
            Os arquivos associados são mantidos.
          </p>
          <AwInput
            iconLeft="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {EXISTENTES.filter((e) =>
              e.name.toLowerCase().includes(search.toLowerCase()),
            ).map((e) => {
              const on = picked.includes(e.id)
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() =>
                    setPicked((list) =>
                      on ? list.filter((x) => x !== e.id) : [...list, e.id],
                    )
                  }
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition",
                    on
                      ? "border-(--fg-primary) bg-(--bg-surface)"
                      : "border-(--border-default) bg-(--bg-raised) hover:border-(--border-strong)",
                  )}
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-(--bg-inverse) text-(--fg-on-inverse)">
                    <Icon name="inventory_2" size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{e.name}</span>
                    <span className="block truncate text-[11px] text-(--fg-tertiary)">
                      {e.meta}
                    </span>
                    <span className="block truncate text-[11px] text-(--fg-tertiary)">
                      {e.used}
                    </span>
                  </span>
                  <Icon
                    name={on ? "check_box" : "check_box_outline_blank"}
                    size={20}
                    fill={on ? 1 : 0}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </AwModal>

      {/* Modal: confirmação de descarte */}
      <AwModal
        open={mode === "discard"}
        onClose={() => setMode("novo")}
        size="md"
        dismissible={false}
        footer={
          <div className="flex items-center justify-end gap-3">
            <AwButton
              variant="ghost"
              onClick={() => {
                resetNovo()
                setMode(null)
              }}
            >
              Sair e perder dados
            </AwButton>
            <AwButton variant="primary" onClick={() => setMode("novo")}>
              Permanecer
            </AwButton>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <span className="text-(--accent-warning)">
            <Icon name="error" size={32} fill={1} />
          </span>
          <h2 className="text-lg font-semibold">Você perderá seu progresso</h2>
          <p className="max-w-sm text-sm text-(--fg-secondary)">
            Os dados e produtos adicionados ainda não foram salvos. Tem certeza
            que deseja interromper o preenchimento?
          </p>
        </div>
      </AwModal>
    </div>
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

function SourceRow({
  icon,
  label,
  onRemove,
}: {
  icon: string
  label: string
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-(--border-default) bg-(--bg-raised) px-3 py-2.5">
      <Icon name={icon} size={18} />
      <span className="min-w-0 flex-1 truncate text-sm">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="text-(--fg-tertiary) hover:text-(--fg-primary)"
        aria-label="Remover"
      >
        <Icon name="close" size={16} />
      </button>
    </div>
  )
}
