import Link from "next/link"
import type { Metadata } from "next"
import { AwButton } from "@/components/ui/AwButton"
import { BuiltShell } from "@/app/bombardier/projects/_components/BuiltShell"
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
    <BuiltShell breadcrumbs={[{ label: "Projetos", href: "/bombardier/projects" }, { label: "Memory Base", href: "/bombardier/projects/memory-base" }, "Boas-vindas"]}>

      {/* Conteúdo: a tela de boas-vindas, re-skinada */}
      <div className="relative flex min-h-full flex-col items-center justify-center py-16 text-center">
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
      </div>
    </BuiltShell>
  )
}
