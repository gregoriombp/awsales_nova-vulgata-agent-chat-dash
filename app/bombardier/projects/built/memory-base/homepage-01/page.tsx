import Link from "next/link"
import type { Metadata } from "next"
import { AwButton } from "@/components/ui/AwButton"
import { AwPill } from "@/components/ui/AwPill"
import { AwMemoryBaseLogo } from "@/components/ui/AwMemoryBaseLogo"

/**
 * Página REAL gerada pela ação "Construir no repo" da tela
 * `Tela 01 · Homepage 01` do projeto Memory Base. É a tela de boas-vindas do
 * Figma (design system antigo) reconstruída com componentes Aw* e tokens atuais
 * — o cluster de pontos do Figma virou o AwMemoryBaseLogo, e a copy/CTA foram
 * remapeados pro design system vigente. Prova de conceito do fluxo ponta-a-ponta.
 */

export const metadata: Metadata = {
  title: "Memory Base — Boas-vindas (reconstruído)",
}

const FIGMA_URL =
  "https://www.figma.com/design/QLLHzby4I8pGk83wFDY1hz?node-id=1026-34291"

export default function BuiltMemoryBaseHomepage01() {
  return (
    <div className="flex min-h-screen flex-col bg-(--bg-canvas) text-(--fg-primary)">
      {/* Barra de contexto: deixa explícito que é uma tela reconstruída */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--border-subtle) px-6 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/bombardier/projects/memory-base"
            className="no-underline"
          >
            <AwButton variant="ghost" size="sm" iconLeft="arrow_back">
              Memory Base
            </AwButton>
          </Link>
          <span className="text-sm text-(--fg-secondary)">
            Reconstruído de{" "}
            <strong className="font-medium text-(--fg-primary)">
              Tela 01 · Homepage 01
            </strong>
          </span>
          <AwPill variant="live">No design system atual</AwPill>
        </div>
        <a
          href={FIGMA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline"
        >
          <AwButton variant="ghost" size="sm" iconRight="open_in_new">
            Original no Figma
          </AwButton>
        </a>
      </div>

      {/* Conteúdo: a tela de boas-vindas, re-skinada */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[420px] w-[420px] -translate-x-1/2 -translate-y-[60%] rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--bg-muted) 0%, transparent 70%)",
          }}
        />
        <div className="relative flex flex-col items-center">
          <AwMemoryBaseLogo size={112} className="text-(--fg-primary)" />
          <h1 className="mt-8 text-4xl font-semibold tracking-tight">
            Bem-vindo à Memory Base
          </h1>
          <p className="mt-3 max-w-xl text-lg leading-relaxed text-(--fg-secondary)">
            A Memory Base é onde você organiza todo o conhecimento dos seus
            agentes. Crie bases para armazenar documentos, URLs, snippets e
            integrações que alimentam suas conversas inteligentes.
          </p>
          <div className="mt-8">
            <AwButton variant="primary" iconLeft="add">
              Criar base de conhecimento
            </AwButton>
          </div>
        </div>
      </main>
    </div>
  )
}
