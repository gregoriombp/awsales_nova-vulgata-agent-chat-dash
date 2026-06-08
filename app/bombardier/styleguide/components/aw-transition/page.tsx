"use client"

import * as React from "react"
import {
  AwTransition,
  type AwTransitionPreset,
} from "@/components/ui/AwTransition"
import { Icon } from "@/components/ui/Icon"
import {
  ApiTable,
  CodeExample,
  PageHero,
  PropRow,
  Section,
  Spec,
  Stage,
} from "../../_primitives"

const PRESETS: { id: AwTransitionPreset; label: string; desc: string }[] = [
  { id: "fade", label: "fade", desc: "Opacity 0 → 1, sem deslocamento." },
  {
    id: "slide-up",
    label: "slide-up",
    desc: "Entra subindo 16px com fade. Bom pra rows que aparecem.",
  },
  {
    id: "slide-down",
    label: "slide-down",
    desc: "Entra descendo 16px. Bom pra dropdowns abrindo de cima.",
  },
  {
    id: "slide-left",
    label: "slide-left",
    desc: "Entra a partir da direita. Bom pra drawers/sheets laterais.",
  },
  {
    id: "slide-right",
    label: "slide-right",
    desc: "Entra a partir da esquerda. Espelho de slide-left.",
  },
  {
    id: "scale",
    label: "scale",
    desc: "Pequeno scale (0.92 → 1) com fade. Útil pra cards inline.",
  },
  {
    id: "pop",
    label: "pop",
    desc: "Scale mais agressivo (0.7 → 1). Pra modais e popovers.",
  },
]

export default function AwTransitionPage() {
  return (
    <>
      <PageHero title="Transition">
        Componente headless que aplica animações de entrada e saída em um elemento
        controlado por um prop <code className="mono">mounted</code>. Inspirado
        no <code className="mono">Transition</code> do Mantine, mas implementado
        sem dependências — só inline styles + os tokens de easing do design system.
      </PageHero>

      <div className="max-w-[1100px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="presets"
            title="Presets"
            lead="Sete animações nomeadas. Cada uma combina opacity com um transform específico. Toggle pra ver cada uma."
          >
            <PresetsGrid />
          </Section>

          <Section
            id="duration"
            title="Duração e easing"
            lead="Por padrão, 240ms com o ease-out do design system. Use durações curtas (120–180ms) pra micro-interações, 240–320ms pra reveals e 400ms+ pra entradas mais marcadas."
          >
            <DurationGrid />
          </Section>

          <Section
            id="exit-asymmetric"
            title="Exit assimétrico"
            lead="Quando útil, separe a duração de saída — saídas mais rápidas que entradas dão sensação de responsividade (ex.: fechar um drawer)."
          >
            <ExitAsymmetricExample />
          </Section>

          <Section
            id="keep-mounted"
            title="keepMounted"
            lead="Por padrão, o elemento sai do DOM depois do exit. Use keepMounted quando precisar preservar o estado interno (ex.: formulário rascunhado) entre toggles."
          >
            <KeepMountedExample />
          </Section>

          <Section
            id="example"
            title="Como usar"
            lead="children é uma render-prop que recebe os styles inline e devolve o nó alvo. Você decide onde aplicar o style."
          >
            <CodeExample label="exemplo">
              {`import { AwTransition } from "@/components/ui/AwTransition"

function Reveal({ open }: { open: boolean }) {
  return (
    <AwTransition mounted={open} transition="slide-up" duration={260}>
      {(styles) => (
        <div style={styles} className="rounded-md border bg-bg-raised p-4">
          Conteúdo revelado
        </div>
      )}
    </AwTransition>
  )
}`}
            </CodeExample>
          </Section>

          <Section
            id="api"
            title="API"
            lead="Props do AwTransition. Sem children dinâmicos? Use fade ou scale com keepMounted=false (padrão)."
          >
            <ApiTable>
              <PropRow
                prop="mounted"
                type="boolean"
                doc="Quando true, anima entrada. Quando false, anima saída. Mudar este prop dispara as transições."
              />
              <PropRow
                prop="transition"
                type='"fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "scale" | "pop"'
                def='"fade"'
                doc="Preset de animação."
              />
              <PropRow
                prop="duration"
                type="number"
                def="240"
                doc="Duração da animação em ms. Vale pro enter e, se exitDuration não for passado, pro exit também."
              />
              <PropRow
                prop="exitDuration"
                type="number"
                def="= duration"
                doc="Duração do exit em ms, separada da entrada."
              />
              <PropRow
                prop="timingFunction"
                type="string"
                def="var(--ease-out)"
                doc="Qualquer timing function CSS válido. Usa o token do design system por padrão."
              />
              <PropRow
                prop="keepMounted"
                type="boolean"
                def="false"
                doc="Quando true, mantém o elemento no DOM depois da saída (com os styles de out). Útil pra preservar estado interno."
              />
              <PropRow
                prop="onEnter"
                type="() => void"
                doc="Chamado quando a animação de entrada termina."
              />
              <PropRow
                prop="onExit"
                type="() => void"
                doc="Chamado quando a animação de saída termina."
              />
              <PropRow
                prop="children"
                type="(styles: CSSProperties) => ReactNode"
                doc="Render-prop. Recebe os styles inline (opacity, transform e transition) e devolve o nó alvo."
              />
            </ApiTable>
          </Section>

          <Section
            id="tokens"
            title="Tokens usados"
            lead="Defaults vêm dos tokens do design system. Sobreponha por prop quando precisar."
          >
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
              <Spec
                k="duration · default"
                v="240ms"
                d="Equilíbrio entre velocidade e legibilidade."
              />
              <Spec
                k="timing · default"
                v="var(--ease-out)"
                d="cubic-bezier(0.22, 0.61, 0.36, 1) — desacelera no final."
              />
              <Spec
                k="transform · slide"
                v="±16px"
                d="Distância padrão dos slide-*."
              />
            </div>
          </Section>
        </div>
      </div>
    </>
  )
}

function PresetsGrid() {
  const [mounted, setMounted] = React.useState(true)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMounted((v) => !v)}
          className="aw-btn aw-btn--primary aw-btn--md"
        >
          <Icon
            name={mounted ? "visibility_off" : "visibility"}
            size={16}
            fill={1}
          />
          <span className="aw-btn__label">
            {mounted ? "Esconder todos" : "Mostrar todos"}
          </span>
        </button>
        <span className="caption">
          duration: 280ms · timing: var(--ease-out)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PRESETS.map((preset) => (
          <Stage key={preset.id} label={preset.label} hint={preset.desc}>
            <div className="flex h-[120px] w-full items-center justify-center">
              <AwTransition
                mounted={mounted}
                transition={preset.id}
                duration={280}
              >
                {(styles) => (
                  <div
                    style={styles}
                    className="flex h-16 w-32 items-center justify-center rounded-md border border-(--border-default) bg-(--bg-canvas) text-(--fg-primary)"
                  >
                    <span className="mono text-xs">{preset.id}</span>
                  </div>
                )}
              </AwTransition>
            </div>
          </Stage>
        ))}
      </div>
    </div>
  )
}

function DurationGrid() {
  const [mounted, setMounted] = React.useState(true)
  const durations: { ms: number; label: string }[] = [
    { ms: 120, label: "120ms — micro" },
    { ms: 240, label: "240ms — padrão" },
    { ms: 480, label: "480ms — marcado" },
  ]

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setMounted((v) => !v)}
        className="aw-btn aw-btn--secondary aw-btn--sm w-fit"
      >
        <Icon name="play_arrow" size={14} fill={1} />
        <span className="aw-btn__label">Disparar</span>
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {durations.map((d) => (
          <Stage key={d.ms} label={d.label}>
            <div className="flex h-[120px] w-full items-center justify-center">
              <AwTransition
                mounted={mounted}
                transition="slide-up"
                duration={d.ms}
              >
                {(styles) => (
                  <div
                    style={styles}
                    className="flex h-16 w-32 items-center justify-center rounded-md bg-(--fg-primary) text-(--bg-canvas)"
                  >
                    <span className="mono text-xs">{d.ms}ms</span>
                  </div>
                )}
              </AwTransition>
            </div>
          </Stage>
        ))}
      </div>
    </div>
  )
}

function ExitAsymmetricExample() {
  const [mounted, setMounted] = React.useState(true)
  return (
    <Stage
      label="duration=320, exitDuration=140"
      hint="Entra calmo, sai rápido. Bom padrão pra drawers e popovers."
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setMounted((v) => !v)}
          className="aw-btn aw-btn--secondary aw-btn--sm"
        >
          <span className="aw-btn__label">{mounted ? "Fechar" : "Abrir"}</span>
        </button>
        <div className="flex h-[120px] w-full items-center">
          <AwTransition
            mounted={mounted}
            transition="slide-left"
            duration={320}
            exitDuration={140}
          >
            {(styles) => (
              <div
                style={styles}
                className="flex h-20 w-64 items-center gap-3 rounded-md border border-(--border-default) bg-(--bg-raised) px-4"
              >
                <Icon
                  name="bookmark"
                  size={20}
                  className="text-(--aw-blue-700)"
                />
                <div>
                  <div className="text-sm font-medium text-(--fg-primary)">
                    Salvo no histórico
                  </div>
                  <div className="caption">Há um instante</div>
                </div>
              </div>
            )}
          </AwTransition>
        </div>
      </div>
    </Stage>
  )
}

function KeepMountedExample() {
  const [mounted, setMounted] = React.useState(true)
  const [text, setText] = React.useState("Rascunho preservado entre toggles")

  return (
    <Stage
      label="keepMounted={true}"
      hint="Digite, esconda e mostre — o texto continua lá porque o input nunca saiu do DOM."
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setMounted((v) => !v)}
          className="aw-btn aw-btn--secondary aw-btn--sm"
        >
          <Icon
            name={mounted ? "visibility_off" : "visibility"}
            size={14}
            fill={1}
          />
          <span className="aw-btn__label">{mounted ? "Esconder" : "Mostrar"}</span>
        </button>
        <div className="flex h-[120px] w-full items-center">
          <AwTransition
            mounted={mounted}
            transition="fade"
            duration={200}
            keepMounted
          >
            {(styles) => (
              <input
                style={styles}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="h-10 w-72 rounded-md border border-(--border-default) bg-(--bg-raised) px-3 text-sm text-(--fg-primary) outline-hidden focus:border-(--fg-primary)"
              />
            )}
          </AwTransition>
        </div>
      </div>
    </Stage>
  )
}
