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
 * Tela "Base de conhecimento" (Tela 10) reconstruída no DS atual. 14 frames →
 * 1 tela de GESTÃO (tabela com abas Playbook/Produtos, toggle Lista/Card, menu de
 * ações por linha) + modal de detalhe do Knowledge Layer. A "Edição de Knowledge
 * Layer" é a página irmã em ./editar.
 */

const FIGMA_URL =
  "https://www.figma.com/design/QLLHzby4I8pGk83wFDY1hz?node-id=929-29942"

type Quality = "Muito alta" | "Alta" | "Razoável" | "Péssimo"

const LAYERS: {
  id: string
  title: string
  desc: string
  fonte: string
  uso: string
  mod: string
  q: Quality
}[] = [
  { id: "kl1", title: "O que é a Fyntra?", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", fonte: "Market_Analysis_Q3.pdf", uso: "Utilizado por 1 agente", mod: "04 de mar 2026", q: "Muito alta" },
  { id: "kl2", title: "Benefícios do produto Swiss Airlines", desc: "Sumário dos principais argumentos para o cliente.", fonte: "Project_Roadmap_2024.pdf", uso: "Utilizado por 2 agentes", mod: "04 de mar 2026", q: "Alta" },
  { id: "kl3", title: "Política de reembolso", desc: "Regras e prazos de reembolso por canal.", fonte: "Report.pdf", uso: "Utilizado por 1 agente", mod: "04 de mar 2026", q: "Péssimo" },
  { id: "kl4", title: "Processo de onboarding", desc: "Passo a passo do onboarding do cliente novo.", fonte: "Assessment.pdf", uso: "Utilizado por 1 agente", mod: "04 de mar 2026", q: "Razoável" },
  { id: "kl5", title: "Auditoria interna 2026", desc: "Sumário dos achados da auditoria interna.", fonte: "Internal_Audit_Findings.pdf", uso: "Utilizado por 2 agentes", mod: "04 de mar 2026", q: "Muito alta" },
]

const PRODUTOS = [
  { id: "1233456", nome: "E-commerce platform", sub: "Produto compartilhado", cat: "Assinatura", arq: "fyntra_process.pdf +3", preco: "R$0,00" },
  { id: "789101", nome: "Chatbot inteligente", sub: "Novo produto", cat: "Assinatura", arq: "fyntra_process.pdf", preco: "R$0,00" },
  { id: "111213", nome: "Dashboard analytics", sub: "Novo produto", cat: "Assinatura", arq: "fyntra_process.pdf", preco: "R$0,00" },
  { id: "141516", nome: "App mobile banking", sub: "Novo produto", cat: "Assinatura", arq: "fyntra_process.pdf +3", preco: "R$0,00" },
  { id: "171819", nome: "Blueprint do Negócio Online", sub: "Novo produto", cat: "Assinatura", arq: "fyntra_process.pdf +3", preco: "R$0,00" },
]

const Q_COLOR: Record<Quality, string> = {
  "Muito alta": "var(--accent-success)",
  Alta: "var(--accent-success)",
  Razoável: "var(--accent-warning)",
  Péssimo: "var(--accent-danger)",
}

export default function BaseConhecimentoScreen() {
  const [tab, setTab] = React.useState<"playbook" | "produtos">("playbook")
  const [view, setView] = React.useState<"lista" | "card">("lista")
  const [menuId, setMenuId] = React.useState<string | null>(null)
  const [detail, setDetail] = React.useState<(typeof LAYERS)[number] | null>(null)
  const [rows, setRows] = React.useState(LAYERS)
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    if (!menuId) return
    const close = () => setMenuId(null)
    window.addEventListener("click", close)
    return () => window.removeEventListener("click", close)
  }, [menuId])

  const filtered = rows.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen flex-col bg-(--bg-canvas) text-(--fg-primary)">
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
              Tela 10 · Base de conhecimento (gestão + modal)
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

      <main className="mx-auto w-full max-w-[1200px] px-8 py-10">
        {/* Header da base */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs text-(--fg-tertiary)">
              <Icon name="folder" size={14} /> Memory Base / Produtos Fyntra
            </div>
            <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
              <Icon name="folder_open" size={26} /> Produtos Fyntra
            </h1>
            <div className="mt-2 flex items-center gap-4 text-xs text-(--fg-tertiary)">
              <span className="inline-flex items-center gap-1.5">
                <Icon name="settings" size={14} /> 11 Fontes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="layers" size={14} /> 254 Knowledge Layers
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AwButton variant="secondary" iconLeft="visibility">
              Visualizar fontes
            </AwButton>
            <AwButton variant="primary" iconRight="expand_more">
              Adicionar novo
            </AwButton>
          </div>
        </div>

        {/* Abas */}
        <div className="mt-8 border-b border-(--border-subtle)">
          <AwTabs
            variant="underline"
            value={tab}
            onChange={(v) => setTab(v as "playbook" | "produtos")}
            items={[
              { value: "playbook", label: "Playbook", count: 254 },
              { value: "produtos", label: "Produtos", count: 30 },
            ]}
          />
        </div>

        {/* Toolbar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="w-full max-w-sm">
            <AwInput
              iconLeft="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tab === "playbook" ? "Pesquisar em Memory Base" : "Pesquisar por nome de base"}
            />
          </div>
          <div className="inline-flex rounded-full border border-(--border-default) p-1">
            <ViewToggle active={view === "lista"} onClick={() => setView("lista")} icon="view_list" label="Lista" />
            <ViewToggle active={view === "card"} onClick={() => setView("card")} icon="grid_view" label="Card" />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="mt-5">
          {tab === "playbook" ? (
            view === "lista" ? (
              <div className="overflow-hidden rounded-2xl border border-(--border-default)">
                <div className="grid grid-cols-[2.4fr_0.8fr_1.2fr_1.2fr_1fr_1.4fr_40px] gap-3 border-b border-(--border-subtle) bg-(--bg-surface) px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-(--fg-tertiary)">
                  <span>Knowledge Layer</span>
                  <span>Status</span>
                  <span>Fonte</span>
                  <span>Uso</span>
                  <span>Última modificação</span>
                  <span>Qualidade</span>
                  <span />
                </div>
                {filtered.map((r) => (
                  <div
                    key={r.id}
                    className="grid grid-cols-[2.4fr_0.8fr_1.2fr_1.2fr_1fr_1.4fr_40px] items-center gap-3 border-b border-(--border-subtle) px-4 py-3 last:border-0 hover:bg-(--bg-hover)"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{r.title}</p>
                      <p className="truncate text-[11px] text-(--fg-tertiary)">{r.desc}</p>
                    </div>
                    <AwPill variant="live">Ativo</AwPill>
                    <span className="inline-flex items-center gap-1.5 truncate text-xs text-(--fg-secondary)">
                      <Icon name="picture_as_pdf" size={14} /> {r.fonte}
                    </span>
                    <span className="truncate text-xs text-(--fg-secondary)">{r.uso}</span>
                    <span className="text-xs text-(--fg-secondary)">{r.mod}</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: Q_COLOR[r.q] }}>
                      <Icon name="trending_up" size={14} /> {r.q}
                    </span>
                    <RowMenu
                      open={menuId === r.id}
                      onToggle={() => setMenuId(menuId === r.id ? null : r.id)}
                      onView={() => { setDetail(r); setMenuId(null) }}
                      onDelete={() => { setRows((l) => l.filter((x) => x.id !== r.id)); setMenuId(null) }}
                    />
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="px-4 py-10 text-center text-sm text-(--fg-tertiary)">
                    Nenhum Knowledge Layer encontrado.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setDetail(r)}
                    className="flex flex-col gap-2 rounded-2xl border border-(--border-default) bg-(--bg-raised) p-4 text-left transition hover:border-(--border-strong)"
                  >
                    <p className="text-sm font-semibold">{r.title}</p>
                    <p className="line-clamp-3 text-xs text-(--fg-secondary)">{r.desc}</p>
                    <span className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-(--fg-tertiary)">
                      <Icon name="picture_as_pdf" size={13} /> {r.fonte}
                    </span>
                    <div className="mt-2 flex items-center justify-between border-t border-(--border-subtle) pt-2">
                      <span className="text-[11px] text-(--fg-tertiary)">{r.uso}</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: Q_COLOR[r.q] }}>
                        <Icon name="trending_up" size={13} /> {r.q}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : view === "lista" ? (
            <div className="overflow-hidden rounded-2xl border border-(--border-default)">
              <div className="grid grid-cols-[2fr_1fr_1.2fr_1.6fr_0.8fr] gap-3 border-b border-(--border-subtle) bg-(--bg-surface) px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-(--fg-tertiary)">
                <span>Produto</span>
                <span>ID</span>
                <span>Categoria</span>
                <span>Arquivos</span>
                <span>Preço</span>
              </div>
              {PRODUTOS.map((p) => (
                <div key={p.id} className="grid grid-cols-[2fr_1fr_1.2fr_1.6fr_0.8fr] items-center gap-3 border-b border-(--border-subtle) px-4 py-3 last:border-0 hover:bg-(--bg-hover)">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.nome}</p>
                    <p className="text-[11px] text-(--fg-tertiary)">{p.sub}</p>
                  </div>
                  <span className="text-xs text-(--fg-secondary)">{p.id}</span>
                  <span className="text-xs text-(--fg-secondary)">{p.cat}</span>
                  <span className="inline-flex items-center gap-1.5 truncate text-xs text-(--fg-secondary)">
                    <Icon name="picture_as_pdf" size={14} /> {p.arq}
                  </span>
                  <span className="text-xs text-(--fg-secondary)">{p.preco}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {PRODUTOS.map((p) => (
                <div key={p.id} className="flex flex-col gap-2 rounded-2xl border border-(--border-default) bg-(--bg-raised) p-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{p.nome}</p>
                    <AwPill variant="neutral">{p.sub}</AwPill>
                  </div>
                  <p className="text-xs text-(--fg-tertiary)">Categoria: {p.cat}</p>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-(--fg-tertiary)">
                    <Icon name="picture_as_pdf" size={13} /> {p.arq}
                  </span>
                  <div className="mt-1 flex items-center justify-between border-t border-(--border-subtle) pt-2 text-[11px] text-(--fg-tertiary)">
                    <span>{p.id}</span>
                    <span>{p.preco}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal: detalhe do Knowledge Layer (Visualizar) */}
      <AwModal
        open={detail !== null}
        onClose={() => setDetail(null)}
        size="md"
        title="Knowledge Layer"
        footer={
          <div className="flex items-center justify-end">
            <Link href="/bombardier/projects/built/memory-base/base-conhecimento/editar" className="no-underline">
              <AwButton variant="primary" iconLeft="edit">
                Editar
              </AwButton>
            </Link>
          </div>
        }
      >
        {detail && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-base font-semibold">{detail.title}</h3>
              <p className="mt-1 text-sm text-(--fg-secondary)">{detail.desc} Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-(--fg-tertiary)">Arquivo</p>
              <span className="mt-1 inline-flex items-center gap-1.5 text-sm">
                <Icon name="picture_as_pdf" size={16} /> {detail.fonte}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-(--border-subtle) pt-3 text-xs">
              <div>
                <p className="text-(--fg-tertiary)">Status</p>
                <AwPill variant="live">Ativo</AwPill>
              </div>
              <div>
                <p className="text-(--fg-tertiary)">Qualidade</p>
                <span className="font-medium" style={{ color: Q_COLOR[detail.q] }}>{detail.q}</span>
              </div>
              <div>
                <p className="text-(--fg-tertiary)">Última atualização</p>
                <span>{detail.mod}</span>
              </div>
            </div>
          </div>
        )}
      </AwModal>
    </div>
  )
}

function ViewToggle({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "inline-flex items-center gap-1.5 rounded-full bg-(--bg-inverse) px-3 py-1.5 text-xs font-medium text-(--fg-on-inverse)"
          : "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-(--fg-secondary) hover:text-(--fg-primary)"
      }
    >
      <Icon name={icon} size={15} />
      {label}
    </button>
  )
}

function RowMenu({
  open,
  onToggle,
  onView,
  onDelete,
}: {
  open: boolean
  onToggle: () => void
  onView: () => void
  onDelete: () => void
}) {
  const items: { label: string; icon: string; onClick?: () => void; danger?: boolean }[] = [
    { label: "Visualizar", icon: "visibility", onClick: onView },
    { label: "Editar", icon: "edit" },
    { label: "Duplicar", icon: "content_copy" },
    { label: "Inativar", icon: "block" },
    { label: "Excluir", icon: "delete", onClick: onDelete, danger: true },
  ]
  return (
    <div className="relative flex justify-end">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onToggle() }}
        className="text-(--fg-tertiary) hover:text-(--fg-primary)"
        aria-label="Ações"
      >
        <Icon name="more_vert" size={18} />
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-7 z-10 w-40 overflow-hidden rounded-xl border border-(--border-default) bg-(--bg-raised) py-1 shadow-lg"
        >
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              onClick={it.onClick}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-(--bg-hover)",
                it.danger ? "text-(--accent-danger)" : "text-(--fg-primary)",
              )}
            >
              <Icon name={it.icon} size={16} /> {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
