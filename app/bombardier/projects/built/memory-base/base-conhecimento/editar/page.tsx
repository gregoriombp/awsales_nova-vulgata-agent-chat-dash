"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { AwButton } from "@/components/ui/AwButton"
import { AwInput } from "@/components/ui/AwInput"
import { AwPill } from "@/components/ui/AwPill"
import { Icon } from "@/components/ui/Icon"

/**
 * "Edição de Knowledge Layer" (Tela 10 · seção Editar Knowledge Layer) — página
 * irmã da gestão da Base de conhecimento. Pergunta + Resposta + Status + dropzone
 * de arquivos. Reconstruída no DS atual.
 */

const FIGMA_URL =
  "https://www.figma.com/design/QLLHzby4I8pGk83wFDY1hz?node-id=929-29942"

export default function EditarKnowledgeLayer() {
  const [pergunta, setPergunta] = React.useState("O que é a Fyntra?")
  const [resposta, setResposta] = React.useState(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut faucibus at dui eu gravida. Etiam nec pretium est, ac suscipit nibh.",
  )
  const [ativo, setAtivo] = React.useState(true)
  const [files, setFiles] = React.useState<string[]>([])
  const dirty = true

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
              Tela 10 · Edição de Knowledge Layer
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

      <main className="mx-auto w-full max-w-[1100px] px-8 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href="/bombardier/projects/built/memory-base/base-conhecimento"
              className="no-underline"
            >
              <span className="mb-2 inline-flex items-center gap-1.5 text-sm text-(--fg-secondary) hover:text-(--fg-primary)">
                <Icon name="arrow_back" size={16} /> Voltar
              </span>
            </Link>
            <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
              <Icon name="layers" size={26} /> Edição de Knowledge Layer
            </h1>
          </div>
          <AwButton variant="primary" disabled={!dirty} iconLeft="check">
            Salvar alterações
          </AwButton>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Coluna esquerda: form */}
          <div className="flex flex-col gap-6">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Pergunta</span>
              <AwInput value={pergunta} onChange={(e) => setPergunta(e.target.value)} />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Resposta</span>
              <textarea
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                rows={6}
                className="w-full resize-y rounded-xl border border-(--border-default) bg-(--bg-raised) px-3 py-2 text-sm leading-relaxed text-(--fg-primary) outline-none placeholder:text-(--fg-tertiary) focus:border-(--border-strong)"
              />
              <span className="text-[11px] text-(--fg-tertiary)">
                Digite {"{}"} para ver as variáveis disponíveis.
              </span>
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Status</span>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={ativo}
                  onClick={() => setAtivo((v) => !v)}
                  className={cn(
                    "relative h-6 w-10 rounded-full transition",
                    ativo ? "bg-(--accent-success)" : "bg-(--bg-muted)",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-(--bg-canvas) transition-all",
                      ativo ? "left-[18px]" : "left-0.5",
                    )}
                  />
                </button>
                <span className="text-sm text-(--fg-secondary)">
                  {ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          </div>

          {/* Coluna direita: dropzone */}
          <div className="flex flex-col gap-3">
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-(--border-strong) bg-(--bg-surface) px-6 py-10 text-center">
              <Icon name="cloud_upload" size={30} />
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
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-(--border-default) bg-(--bg-raised) px-3 py-2.5"
              >
                <Icon name="picture_as_pdf" size={18} />
                <span className="min-w-0 flex-1 truncate text-sm">{f}</span>
                <button
                  type="button"
                  onClick={() => setFiles((l) => l.filter((_, j) => j !== i))}
                  className="text-(--fg-tertiary) hover:text-(--fg-primary)"
                  aria-label="Remover"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
