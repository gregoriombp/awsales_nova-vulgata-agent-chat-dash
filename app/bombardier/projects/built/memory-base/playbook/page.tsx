"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { AwButton } from "@/components/ui/AwButton"
import { BuiltShell } from "@/app/bombardier/projects/_components/BuiltShell"
import { AwInput } from "@/components/ui/AwInput"
import { AwModal } from "@/components/ui/AwModal"
import { AwPill } from "@/components/ui/AwPill"
import { AwTabs } from "@/components/ui/AwTabs"
import { Icon } from "@/components/ui/Icon"

/**
 * Tela "Playbook" (Etapa 6 — última do wizard) reconstruída no DS atual. 10 frames
 * → 1 tela-base + 2 modais. Quase idêntica ao Produtos, mas sem campo Nome, com
 * as fontes agrupadas como "Arquivos anexados (N)" e o botão final "Criar base".
 */

const FIGMA_URL =
  "https://www.figma.com/design/QLLHzby4I8pGk83wFDY1hz?node-id=929-29942"

type Mode = null | "novo" | "existente"
type Tab = "arquivos" | "url" | "snippet" | "integracao"

const INTEGRACOES = [
  { id: "slack", name: "Slack", desc: "Importe mensagens e conteúdos de canais da sua equipe." },
  { id: "hotmart", name: "Hotmart", desc: "Importe informações dos seus produtos e conteúdos." },
  { id: "assiny", name: "Assiny", desc: "Acesse informações sobre suas assinaturas e produtos." },
  { id: "calendly", name: "Calendly", desc: "Acesse informações sobre agendamentos e eventos." },
  { id: "stripe", name: "Stripe", desc: "Acesse informações sobre pagamentos, clientes e assinaturas." },
]

const EXISTENTES = Array.from({ length: 3 }, (_, i) => ({
  id: `pb-${i}`,
  name: "Fyntra analytics",
  used: "Utilizado por 2 bases",
}))

type Playbook = { id: string; files: string[]; extra: number }

export default function PlaybookScreen() {
  const [mode, setMode] = React.useState<Mode>(null)
  const [playbook, setPlaybook] = React.useState<Playbook | null>(null)
  const [created, setCreated] = React.useState(false)

  const [tab, setTab] = React.useState<Tab>("arquivos")
  const [files, setFiles] = React.useState<string[]>([])
  const [urls, setUrls] = React.useState<string[]>([])
  const [urlDraft, setUrlDraft] = React.useState("")
  const [snippets, setSnippets] = React.useState<string[]>([])
  const [snippetDraft, setSnippetDraft] = React.useState("")
  const [integr, setIntegr] = React.useState<string[]>([])
  const [picked, setPicked] = React.useState<string | null>(null)

  const total = files.length + urls.length + snippets.length + integr.length

  function resetNovo() {
    setTab("arquivos")
    setFiles([])
    setUrls([])
    setUrlDraft("")
    setSnippets([])
    setSnippetDraft("")
    setIntegr([])
  }

  function salvar() {
    setPlaybook({
      id: "pb",
      files: files.length ? files : ["file-name", "file-2", "file"],
      extra: urls.length + snippets.length + integr.length,
    })
    resetNovo()
    setMode(null)
  }

  return (
    <BuiltShell breadcrumbs={[{ label: "Projetos", href: "/bombardier/projects" }, { label: "Memory Base", href: "/bombardier/projects/memory-base" }, "Playbook"]} center>

        <div className="w-full max-w-3xl">
          <p className="aw-eyebrow mb-6">Etapa 6 de 6 · Playbook</p>
          <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            Playbook
            <Icon name="info" size={18} />
          </h1>
          <p className="mt-2 text-(--fg-secondary)">
            Insira fontes de conhecimento para gerar novas knowledge layers, ou
            selecione o playbook de outra base de conhecimento.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ChoiceCard icon="auto_stories" label="Novo playbook" onClick={() => setMode("novo")} />
            <ChoiceCard
              icon="folder_open"
              label="Playbook existente"
              onClick={() => setMode("existente")}
            />
          </div>

          {playbook && (
            <div className="mt-6 rounded-2xl border border-(--border-default) bg-(--bg-raised) p-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-(--bg-inverse) text-(--fg-on-inverse)">
                  <Icon name="auto_stories" size={18} />
                </span>
                <div>
                  <p className="text-sm font-medium">
                    Arquivos anexados ({playbook.files.length + playbook.extra})
                  </p>
                  <p className="text-[11px] text-(--fg-tertiary)">Novo</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPlaybook(null)}
                  className="ml-auto text-xs text-(--accent-danger) hover:underline"
                >
                  Remover playbook
                </button>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {playbook.files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-xl border border-(--border-subtle) bg-(--bg-surface) px-3 py-2.5"
                  >
                    <Icon name="picture_as_pdf" size={18} />
                    <div className="min-w-0">
                      <p className="truncate text-sm">{f}</p>
                      <p className="text-[11px] text-(--fg-tertiary)">10 MB</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setMode("novo")}
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-(--fg-secondary) hover:text-(--fg-primary)"
              >
                <Icon name="add" size={16} /> Adicionar mais fontes
              </button>
            </div>
          )}

          {created && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-(--bg-muted) px-3 py-2 text-sm text-(--fg-secondary)">
              <span className="text-(--accent-success)">
                <Icon name="check_circle" size={18} fill={1} />
              </span>
              Base de conhecimento criada (demo) — fim do fluxo de criação.
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
              iconRight="auto_awesome"
              disabled={!playbook}
              onClick={() => setCreated(true)}
            >
              Criar base
            </AwButton>
          </div>
        </div>

      {/* Modal: Novo playbook */}
      <AwModal
        open={mode === "novo"}
        onClose={() => {
          resetNovo()
          setMode(null)
        }}
        size="cockpit"
        title="Novo playbook"
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
            <AwButton variant="primary" disabled={total === 0} onClick={salvar}>
              Salvar
            </AwButton>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm text-(--fg-secondary)">
            Adicione informações como arquivos, URLs, snippets ou integrações para
            gerar knowledge layers, ajudando a estruturar e organizar a base.
          </p>

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
                    onClick={() => setFiles((f) => [...f, `documento-${f.length + 1}.pdf`])}
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
                  onRemove={() => setFiles((l) => l.filter((_, j) => j !== i))}
                />
              ))}
            </div>
          )}

          {tab === "url" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-end gap-2">
                <label className="flex flex-1 flex-col gap-1.5">
                  <span className="text-sm font-medium">URL</span>
                  <AwInput value={urlDraft} onChange={(e) => setUrlDraft(e.target.value)} placeholder="http://" />
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
                <SourceRow key={i} icon="link" label={u} onRemove={() => setUrls((l) => l.filter((_, j) => j !== i))} />
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
                <SourceRow key={i} icon="code" label={s} onRemove={() => setSnippets((l) => l.filter((_, j) => j !== i))} />
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
                    onClick={() => setIntegr((l) => (on ? l.filter((x) => x !== it.id) : [...l, it.id]))}
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
                      <Icon name={on ? "check_box" : "check_box_outline_blank"} size={20} fill={on ? 1 : 0} />
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </AwModal>

      {/* Modal: Playbooks existentes */}
      <AwModal
        open={mode === "existente"}
        onClose={() => {
          setPicked(null)
          setMode(null)
        }}
        size="cockpit"
        title="Playbooks existentes"
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
                setPlaybook({ id: "ex", files: ["fyntra_analytics.pdf"], extra: 2 })
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
            Selecione entre um playbook existente na organização.
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
                    <Icon name="auto_stories" size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{e.name}</span>
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
    </BuiltShell>
  )
}

function ChoiceCard({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
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

function SourceRow({ icon, label, onRemove }: { icon: string; label: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-(--border-default) bg-(--bg-raised) px-3 py-2.5">
      <Icon name={icon} size={18} />
      <span className="min-w-0 flex-1 truncate text-sm">{label}</span>
      <button type="button" onClick={onRemove} className="text-(--fg-tertiary) hover:text-(--fg-primary)" aria-label="Remover">
        <Icon name="close" size={16} />
      </button>
    </div>
  )
}
