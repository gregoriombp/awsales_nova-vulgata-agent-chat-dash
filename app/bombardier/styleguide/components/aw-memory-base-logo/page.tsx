import { AwMemoryBaseLogo } from "@/components/ui/AwMemoryBaseLogo"
import {
  ApiTable,
  CodeExample,
  DoDont,
  PageHero,
  PropRow,
  Section,
  Spec,
  Stage,
} from "../../_primitives"

export default function MemoryBaseLogoPage() {
  return (
    <>
      <PageHero title="Memory Base logo">
        A marca animada da Memory Base: um cluster de pontos que pulsa em onda
        (opacidade + escala, com stagger por grupo de fase). A animação mora em{" "}
        <code className="mono">globals.css</code> sob{" "}
        <code className="mono">.memory-base-welcome-icon</code> — o componente só
        monta o ícone com o tamanho e a cor certos. Respeita{" "}
        <code className="mono">prefers-reduced-motion</code>.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="rounded-md border border-(--aw-blue-200) bg-(--aw-blue-100) px-5 py-4 mb-10 text-sm text-(--aw-blue-900)">
          <strong>Marca de feature, não a logo do Aswork.</strong> Use este
          símbolo só na superfície da Memory Base (onboarding, welcome, empty
          states do produto). Para a logo institucional, use{" "}
          <a
            href="/bombardier/styleguide/foundation/logos"
            className="underline underline-offset-2 hover:text-(--aw-blue-700)"
          >
            Foundation → Logos
          </a>
          .
        </div>
        <div className="flex flex-col gap-16">
          <Section
            id="sizes"
            title="Tamanhos"
            lead="Uma prop `size` (altura em px); a largura é derivada do viewBox 38×40 mantendo a proporção. Default 180px."
          >
            <Stage label="size · 64 / 120 / 180">
              <div className="flex items-end gap-10 text-(--fg-primary)">
                <AwMemoryBaseLogo size={64} />
                <AwMemoryBaseLogo size={120} />
                <AwMemoryBaseLogo size={180} />
              </div>
            </Stage>
          </Section>

          <Section
            id="color"
            title="Cor via currentColor"
            lead="O símbolo herda currentColor — quem monta define a cor com text-*. Em fundo escuro, inverta."
          >
            <Stage label="text-(--fg-primary) · text-(--aw-blue-600)">
              <div className="text-(--fg-primary)">
                <AwMemoryBaseLogo size={96} />
              </div>
              <div className="text-(--aw-blue-600)">
                <AwMemoryBaseLogo size={96} />
              </div>
              <div className="rounded-lg bg-(--aw-gray-1200) p-6 text-white">
                <AwMemoryBaseLogo size={96} />
              </div>
            </Stage>
          </Section>

          <Section id="api" title="API">
            <ApiTable>
              <PropRow
                prop="size"
                type="number"
                def="180"
                doc="Altura em px. A largura é calculada a partir do viewBox 38×40."
              />
              <PropRow
                prop="className"
                type="string"
                doc="Mergeado na classe .memory-base-welcome-icon do wrapper (via cn)."
              />
            </ApiTable>
            <CodeExample label="exemplo" lang="tsx">
              {`import { AwMemoryBaseLogo } from "@/components/ui/AwMemoryBaseLogo"

// cor herdada via currentColor
<div className="text-(--fg-primary)">
  <AwMemoryBaseLogo size={120} />
</div>`}
            </CodeExample>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Wrapper dimensionado + ícone SVG que herda a cor. A animação é puramente decorativa (aria-hidden)."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Spec k="viewBox" v="38 × 40" d="Proporção travada a partir da altura." />
              <Spec k="cor" v="currentColor" d="Definida pelo container com text-*." />
              <Spec
                k="animação"
                v="memory-base-dot-pulse"
                d="Pulso em onda com stagger de 4 grupos de fase."
              />
              <Spec
                k="acessibilidade"
                v="aria-hidden + reduced-motion"
                d="Decorativo; animação desligada quando o usuário pede menos movimento."
              />
            </div>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>Use nas superfícies da Memory Base (welcome, onboarding, empty).</>,
                <>Defina a cor no container com text-* — o símbolo herda.</>,
                <>Escale pela prop size; a largura acompanha sozinha.</>,
              ]}
              donts={[
                <>Não recolora o SVG diretamente — controle via currentColor.</>,
                <>Não use como logo institucional do Aswork.</>,
                <>Não anexe texto alternativo: é decorativo (aria-hidden).</>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
