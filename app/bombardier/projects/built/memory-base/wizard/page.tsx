"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { AwButton } from "@/components/ui/AwButton"
import { BuiltShell } from "@/app/bombardier/projects/_components/BuiltShell"
import { AwInput } from "@/components/ui/AwInput"
import { AwPill } from "@/components/ui/AwPill"
import { AwMemoryBaseLogo } from "@/components/ui/AwMemoryBaseLogo"
import { Icon } from "@/components/ui/Icon"

/**
 * Wizard de criação da Memory Base — etapas 1 a 4 (Nome → Objetivo → Tipo de
 * segmento → Envio de dados). Reconstrução no DS atual das telas 02–05 do flow
 * do Figma: os 9 frames eram o mesmo screen por etapa com a seleção marcada, então
 * aqui as "repetições" viram ESTADO (useState) — card preto = selecionado, igual
 * ao Figma, e o "Avançar" só liga quando a etapa está respondida. Saída da
 * ação "Construir no repo" para essas 4 telas.
 */

const FIGMA_URL =
  "https://www.figma.com/design/QLLHzby4I8pGk83wFDY1hz?node-id=929-29942"

type Option = { id: string; label: string; icon: string; desc?: string }

const OBJETIVOS: Option[] = [
  { id: "vendas", label: "Vendas", icon: "sell" },
  { id: "onboarding", label: "Onboarding", icon: "rocket_launch" },
  { id: "suporte", label: "Suporte e Atendimento", icon: "headset_mic" },
  { id: "cs", label: "CS / Lançamento", icon: "trending_up" },
  { id: "lead", label: "Captação de Lead", icon: "person_add" },
]

const TIPOS: Option[] = [
  { id: "educacao", label: "Educação", icon: "school" },
  { id: "produto", label: "Produto físico", icon: "inventory_2" },
  { id: "servicos", label: "Serviços", icon: "concierge" },
]

const ENVIOS: Option[] = [
  {
    id: "padrao",
    label: "Padrão",
    icon: "scatter_plot",
    desc: "Indicada para quando os dados dos produtos são enviados individualmente, por meio de links e documentos específicos para cada item. As informações são estruturadas produto a produto.",
  },
  {
    id: "catalogo",
    label: "Catálogo",
    icon: "dataset",
    desc: "Indicada para quando os dados dos produtos são enviados de forma estruturada, por meio de arquivo CSV ou integração. As informações são organizadas em lote, seguindo uma estrutura padronizada.",
  },
]

const STEPS = ["Nome", "Objetivo", "Tipo de segmento", "Envio de dados"]

export default function MemoryBaseWizard() {
  const [step, setStep] = React.useState(0)
  const [done, setDone] = React.useState(false)
  const [name, setName] = React.useState("")
  const [objetivo, setObjetivo] = React.useState<string | null>(null)
  const [tipo, setTipo] = React.useState<string | null>(null)
  const [envio, setEnvio] = React.useState<string | null>(null)

  const canAdvance =
    step === 0
      ? name.trim().length > 0
      : step === 1
        ? !!objetivo
        : step === 2
          ? !!tipo
          : !!envio

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1)
    else setDone(true)
  }

  return (
    <BuiltShell breadcrumbs={[{ label: "Projetos", href: "/bombardier/projects" }, { label: "Memory Base", href: "/bombardier/projects/memory-base" }, "Wizard de criação"]} center>

      {/* Conteúdo do wizard */}
        <div className="w-full max-w-3xl">
          {done ? (
            <DonePanel
              name={name}
              objetivo={OBJETIVOS.find((o) => o.id === objetivo)?.label}
              tipo={TIPOS.find((t) => t.id === tipo)?.label}
              envio={ENVIOS.find((e) => e.id === envio)?.label}
              onRestart={() => {
                setStep(0)
                setDone(false)
                setName("")
                setObjetivo(null)
                setTipo(null)
                setEnvio(null)
              }}
            />
          ) : (
            <>
              <p className="aw-eyebrow mb-6">
                Etapa {step + 1} de {STEPS.length} · {STEPS[step]}
              </p>

              {step === 0 && (
                <div className="flex flex-col items-center text-center">
                  <AwMemoryBaseLogo size={88} className="text-(--fg-primary)" />
                  <h1 className="mt-7 text-3xl font-semibold tracking-tight">
                    Sua primeira Base de Conhecimento
                  </h1>
                  <p className="mt-2 max-w-lg text-(--fg-secondary)">
                    É o momento perfeito para enriquecer sua base com arquivos,
                    sites, trechos, integrações e muito mais.
                  </p>
                  <div className="mt-8 w-full max-w-md">
                    <AwInput
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Brandbook da Marca"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <Selectable
                  title="Qual o objetivo da sua base de conhecimento?"
                  subtitle="Defina o objetivo principal para começar a configurar a base de conhecimento."
                  options={OBJETIVOS}
                  value={objetivo}
                  onChange={setObjetivo}
                  cols={3}
                />
              )}

              {step === 2 && (
                <Selectable
                  title="Qual o tipo de segmento?"
                  subtitle="Defina o tipo de segmento da base de conhecimento."
                  options={TIPOS}
                  value={tipo}
                  onChange={setTipo}
                  cols={3}
                />
              )}

              {step === 3 && (
                <Selectable
                  title="Como os dados dos seus produtos serão enviados?"
                  subtitle="Escolha como os dados dos seus produtos serão enviados para a base de conhecimento."
                  options={ENVIOS}
                  value={envio}
                  onChange={setEnvio}
                  cols={2}
                  large
                />
              )}

              {/* Navegação */}
              <div className="mt-10 flex items-center justify-between">
                {step === 0 ? (
                  <Link
                    href="/bombardier/projects/memory-base"
                    className="no-underline"
                  >
                    <AwButton variant="ghost" iconLeft="arrow_back">
                      Voltar
                    </AwButton>
                  </Link>
                ) : (
                  <AwButton
                    variant="ghost"
                    iconLeft="arrow_back"
                    onClick={() => setStep((s) => s - 1)}
                  >
                    Voltar
                  </AwButton>
                )}
                <AwButton
                  variant="primary"
                  iconRight={step === STEPS.length - 1 ? "check" : "arrow_forward"}
                  disabled={!canAdvance}
                  onClick={next}
                >
                  {step === STEPS.length - 1 ? "Concluir" : "Avançar"}
                </AwButton>
              </div>
            </>
          )}
        </div>
    </BuiltShell>
  )
}

function Selectable({
  title,
  subtitle,
  options,
  value,
  onChange,
  cols,
  large,
}: {
  title: string
  subtitle: string
  options: Option[]
  value: string | null
  onChange: (id: string) => void
  cols: 2 | 3
  large?: boolean
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 text-(--fg-secondary)">{subtitle}</p>
      <div
        className={cn(
          "mt-8 grid gap-4",
          cols === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2",
        )}
      >
        {options.map((o) => {
          const selected = value === o.id
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={cn(
                "flex flex-col rounded-2xl border p-5 text-left transition",
                large ? "gap-3 min-h-[180px]" : "items-center gap-2 text-center",
                selected
                  ? "border-transparent bg-(--bg-inverse) text-(--fg-on-inverse)"
                  : "border-(--border-default) bg-(--bg-raised) text-(--fg-primary) hover:border-(--border-strong)",
              )}
            >
              <Icon name={o.icon} size={large ? 32 : 24} />
              <span className="text-sm font-medium">{o.label}</span>
              {o.desc && (
                <span
                  className={cn(
                    "text-xs leading-relaxed",
                    selected ? "text-(--fg-on-inverse) opacity-70" : "text-(--fg-tertiary)",
                  )}
                >
                  {o.desc}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DonePanel({
  name,
  objetivo,
  tipo,
  envio,
  onRestart,
}: {
  name: string
  objetivo?: string
  tipo?: string
  envio?: string
  onRestart: () => void
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-(--bg-muted) text-(--accent-success)">
        <Icon name="check_circle" size={32} fill={1} />
      </span>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        Base “{name}” configurada
      </h1>
      <p className="mt-2 max-w-md text-(--fg-secondary)">
        Fim do wizard (demo). No produto, o próximo passo cria a base e abre as
        fontes de conhecimento.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
        {objetivo && <AwPill variant="neutral">Objetivo: {objetivo}</AwPill>}
        {tipo && <AwPill variant="neutral">Segmento: {tipo}</AwPill>}
        {envio && <AwPill variant="neutral">Envio: {envio}</AwPill>}
      </div>
      <div className="mt-8">
        <AwButton variant="secondary" iconLeft="restart_alt" onClick={onRestart}>
          Recomeçar
        </AwButton>
      </div>
    </div>
  )
}
