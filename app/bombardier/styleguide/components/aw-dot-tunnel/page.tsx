import { AwDotTunnel } from "@/components/ui/AwDotTunnel"
import {
  ApiTable,
  CodeExample,
  PageHero,
  PropRow,
  Section,
  Spec,
  Stage,
  Tldr,
} from "../../_primitives"

const SIZES = [80, 120, 200, 320] as const

export default function AwDotTunnelPage() {
  return (
    <>
      <PageHero title="Dot tunnel">
        Animação SVG radial que simula um túnel — 28 raios × 14 pontos
        pulsando do centro para fora, com zoom contínuo do conjunto. Usada
        como motivo de hero na entrada do{" "}
        <code className="mono">Agent Studio</code> (empty state) e disponível
        para qualquer tela que precise de uma ambientação visual silenciosa
        enquanto carrega ou espera entrada. Respeita{" "}
        <code className="mono">prefers-reduced-motion</code>.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>Empty states em telas vazias (ex: primeiro acesso ao Agent Studio).</>,
            <>Hero motif silencioso — fundo de tela vazia ou loading ambiente.</>,
            <>Tamanhos sugeridos: 80 (avatar-ish), 120 (inline), 200 (card hero), 320 (full hero).</>,
          ]}
          dontUse={[
            <>Como ícone funcional — não tem affordance.</>,
            <>Decoração em telas densas — compete com conteúdo.</>,
            <>Em loops curtos &lt; 60s sem sentido contextual.</>,
          ]}
        />

        <Section id="sizes" title="Tamanhos">
          <Stage
            label="Escala recomendada"
            hint="px 80 · 120 · 200 · 320 — todos compartilham o mesmo SVG"
          >
            <div className="flex items-end justify-center gap-10 py-10 flex-wrap">
              {SIZES.map((size) => (
                <div
                  key={size}
                  className="flex flex-col items-center gap-3"
                >
                  <AwDotTunnel size={size} />
                  <div className="aw-eyebrow">{size}px</div>
                </div>
              ))}
            </div>
          </Stage>
        </Section>

        <Section id="specs" title="Especificações">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec
              k="Geometria"
              v="28 raios × 14 pontos"
              d="392 círculos por instância, distribuídos radialmente"
            />
            <Spec
              k="Zoom loop"
              v="8s · ease-in-out"
              d="Escala 1 → 1.06 → 1 com opacity 0.95 → 1 → 0.95"
            />
            <Spec
              k="Pulse loop"
              v="3s · ease-in-out"
              d="Opacity 0.3 → 0.95 e scale 1 → 1.15, com delay por ponto"
            />
            <Spec
              k="Cor"
              v="var(--fg-primary)"
              d="Inverte automaticamente em dark mode via token semântico"
            />
            <Spec
              k="ViewBox"
              v="0 0 200 200"
              d="Container quadrado responsivo via prop size"
            />
            <Spec
              k="Acessibilidade"
              v="aria-hidden + reduced-motion"
              d="Animação para em prefers-reduced-motion: reduce"
            />
          </div>
        </Section>

        <Section id="api" title="API">
          <ApiTable>
            <PropRow
              prop="size"
              type="number"
              doc="Lado do container quadrado em px"
              def="320"
            />
            <PropRow
              prop="className"
              type="string"
              doc="Classes extras para o container (positioning, margin)"
            />
          </ApiTable>
        </Section>

        <Section id="example" title="Exemplo">
          <CodeExample>{`import { AwDotTunnel } from "@/components/ui/AwDotTunnel"

export function Hero() {
  return (
    <div className="flex flex-col items-center gap-10">
      <AwDotTunnel size={320} />
      <h1>Agent Studio</h1>
    </div>
  )
}`}</CodeExample>
        </Section>
      </div>
    </>
  )
}
