import {
  PageHero,
  Section,
  Spec,
  CodeExample,
  DoDont,
} from "../../_primitives"
import {
  DurationProbe,
  EasingProbe,
  ThinkingPulse,
  ShimmerDemo,
} from "./MotionDemos"

export default function MotionPage() {
  return (
    <>
      <PageHero title="Animação">
        Rápida e utilitária. 90% das transições usam{" "}
          <code className="mono">ease-out</code> entre{" "}
          <strong>120 e 280 ms</strong>. Sem bounce, sem overshoot, sem
          confete. A única animação expressiva é o pulse do agente.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
<div className="flex flex-col gap-16">
        <Section
          id="durations"
          title="Escala de duração"
          lead="Três durações cobrem 100% dos casos. Clique em animar para comparar."
        >
          <DurationProbe />

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <Spec
              k="--dur-fast"
              v="120 ms"
              d="Hover, focus, click response."
            />
            <Spec
              k="--dur-base"
              v="180 ms"
              d="Default. Color/transform/border."
            />
            <Spec
              k="--dur-slow"
              v="280 ms"
              d="Modal, popover, drawer enter/leave."
            />
          </div>
        </Section>

        <Section
          id="easing"
          title="Curvas de easing"
          lead="ease-out domina. ease-in-out só em loops contínuos. Linear só em progress bars determinísticas."
        >
          <EasingProbe />

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <Spec
              k="--ease-out"
              v="cubic-bezier(0.22, 0.61, 0.36, 1)"
              d="90% dos casos. Saída natural."
            />
            <Spec
              k="--ease-in-out"
              v="cubic-bezier(0.4, 0, 0.2, 1)"
              d="Simetria — loops e reversíveis."
            />
            <Spec
              k="linear"
              v="loading determinístico"
              d="Progress bars onde linearidade é a informação."
            />
          </div>
        </Section>

        <Section
          id="in-motion"
          title="Em movimento"
          lead="Quatro padrões de animação presentes no produto."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
              <h4 className="m-0 mb-2">Thinking pulse</h4>
              <p className="body-sm text-[var(--fg-secondary)] m-0 mb-4">
                Único pulse expressivo do sistema. Exclusivo da variante AI
                (pill, dot, avatar). Loop de 2.2 s, opacity 1 ⟷ 0.4.
              </p>
              <ThinkingPulse />
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
              <h4 className="m-0 mb-2">Skeleton shimmer</h4>
              <p className="body-sm text-[var(--fg-secondary)] m-0 mb-4">
                Feedback de loading em listas e formulários. Gradient linear
                percorrendo a largura em 1.4 s, ease-in-out.
              </p>
              <ShimmerDemo />
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
              <h4 className="m-0 mb-2">Modal enter</h4>
              <p className="body-sm text-[var(--fg-secondary)] m-0">
                Scrim fade-in (opacity 0 → 1) em paralelo com modal{" "}
                translateY(8px) → 0, ambos em{" "}
                <code className="mono">180 ms ease-out</code>. Exit é symm.
              </p>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
              <h4 className="m-0 mb-2">Button hover</h4>
              <p className="body-sm text-[var(--fg-secondary)] m-0">
                <code className="mono">translateY(-1px)</code> em{" "}
                <code className="mono">180 ms</code> — sem scale, sem bounce.
                Feedback discreto suficiente para um alvo clicável.
              </p>
            </div>
          </div>
        </Section>

        <Section
          id="rules"
          title="Regras gerais"
          lead="Diretrizes que valem pra toda animação que entrar no produto."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Spec
              k="duração"
              v="120–280 ms"
              d="Acima, fica lento; abaixo, imperceptível."
            />
            <Spec
              k="curva padrão"
              v="--ease-out"
              d="Simula física de desaceleração."
            />
            <Spec
              k="transformadas"
              v="translate / opacity"
              d="Barato (GPU). Nunca anime top/left/width."
            />
            <Spec
              k="cor"
              v="background / color / border-color"
              d="Com --dur-base. Não anime background-image."
            />
            <Spec
              k="loops"
              v="só variante AI + skeleton"
              d="Pulse contínuo é ruído visual em qualquer outro lugar."
            />
            <Spec
              k="prefers-reduced-motion"
              v="respeitar sempre"
              d="animation: none nos containers correspondentes."
            />
          </div>
        </Section>

        <Section
          id="tokens"
          title="Tokens"
          lead="Consumir via CSS variable. Não hardcodar valores."
        >
          <CodeExample lang="css">{`/* CSS */
.my-button {
  transition:
    background var(--dur-base) var(--ease-out),
    transform var(--dur-fast) var(--ease-out);
}

.my-modal {
  animation: modalIn var(--dur-slow) var(--ease-out);
}

@media (prefers-reduced-motion: reduce) {
  .my-button, .my-modal { transition: none; animation: none; }
}`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Sempre via tokens <code className="mono">--dur-*</code> e <code className="mono">--ease-*</code>.</>,
              <>Transform + opacity — GPU-friendly.</>,
              <>Respeitar <code className="mono">prefers-reduced-motion</code>.</>,
            ]}
            donts={[
              <>Spring bounce ou overshoot.</>,
              <>Duração {">"} 400 ms em UI functional (só em onboarding/hero).</>,
              <>Loops animados em elementos não-AI — cria ruído perpétuo.</>,
              <>Animar <code className="mono">top/left/width</code> — reflui layout.</>,
            ]}
          />
        </Section>
      </div>
    </div>
    </>
  )
}
