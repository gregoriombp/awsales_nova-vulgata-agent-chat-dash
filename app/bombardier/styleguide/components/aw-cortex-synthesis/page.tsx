import { AwCortexSynthesis } from "@/components/ui/AwCortexSynthesis"
import {
  ApiTable,
  CodeExample,
  DoDont,
  PageHero,
  PropRow,
  RelatedLinks,
  Section,
  Spec,
  Stage,
  Tldr,
  Toc,
  TokensConsumed,
} from "../../_primitives"

export default function CortexSynthesisPage() {
  return (
    <>
      <PageHero title="Cortex synthesis">
        A textura WebGL animada que vive atrás do Cortex e dos orbs de agente —
        um shader de &ldquo;neural synthesis&rdquo; em fluxo contínuo. É sempre
        um preenchimento de fundo, mascarado e contido pela forma da aplicação
        (o hexágono do Cortex, o círculo do agente), nunca um elemento solto.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Toc
          items={[
            { id: "anatomy", label: "Anatomia" },
            { id: "preview", label: "Preview base" },
            { id: "colors", label: "Variantes de cor" },
            { id: "knobs", label: "Knobs" },
            { id: "mask", label: "Máscara" },
            { id: "api", label: "API" },
            { id: "tokens", label: "Tokens" },
            { id: "code", label: "Código" },
            { id: "do-dont", label: "Do / Don't" },
          ]}
        />

        <Tldr
          use={[
            <>
              Como fundo vivo dentro de um container mascarado — o hexágono do{" "}
              <code className="mono">AwCopilotOrb</code>, o círculo do orb de
              agente.
            </>,
            <>Em heros de agente, onde a textura preenche um bloco contido.</>,
            <>
              Sempre dentro de um parent{" "}
              <code className="mono">relative</code> com altura explícita e{" "}
              <code className="mono">overflow-hidden</code>.
            </>,
          ]}
          dontUse={[
            <>
              Como blob decorativo solto, sem máscara nem container — ela é
              fundo, não enfeite.
            </>,
            <>
              Como fundo atrás de texto — o movimento e o contraste do shader
              comem a legibilidade.
            </>,
            <>
              Espalhada em dezenas de instâncias na mesma tela — cada Canvas é
              um contexto WebGL (orçamento ~16).
            </>,
          ]}
        />

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Um shader fragmentado renderizado via react-three-fiber. O componente é um fill absoluto: ele preenche o parent, não se dimensiona sozinho."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec
              k="render"
              v="fragment shader"
              d="react-three-fiber Canvas + ShaderMaterial (neural synthesis)."
            />
            <Spec
              k="layout"
              v="absolute inset-0"
              d="Preenche o parent. Parent precisa ser relative + altura explícita."
            />
            <Spec
              k="mount"
              v="near-viewport only"
              d="IntersectionObserver (rootMargin 300px) só monta o Canvas perto da tela."
            />
            <Spec
              k="budget"
              v="~16 contextos WebGL"
              d="Cada Canvas é um contexto; o lazy-mount segura a contagem."
            />
            <Spec k="dpr" v="1" d="Pixel ratio fixo em 1 — fundo, não detalhe." />
            <Spec
              k="pointer"
              v="pointer-events-none"
              d="Nunca intercepta cliques — é só pintura de fundo."
            />
          </div>
        </Section>

        <Section
          id="preview"
          title="Preview base"
          lead="Defaults: preto-e-branco (color1/color2 brancos, color3 #4f4f4f, fundo preto). O parent é relative com altura e overflow-hidden — sem isso o fill não tem onde aparecer."
        >
          <Stage label="<AwCortexSynthesis />" gridClassName="block">
            <div className="relative h-[240px] rounded-lg overflow-hidden border border-(--border-subtle)">
              <AwCortexSynthesis />
            </div>
          </Stage>
        </Section>

        <Section
          id="colors"
          title="Variantes de cor"
          lead="As cores são uniforms WebGL (hex passados a THREE.Color), não tokens CSS. Default em B&W; uma tinta de marca via color3; e o sweep arco-íris via hueSpeed."
        >
          <Stage
            label="color uniforms"
            hint="color1/2/3 e backgroundColor são hex de shader, não classes de token"
            gridClassName="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="flex flex-col gap-2">
              <div className="relative h-[200px] rounded-lg overflow-hidden border border-(--border-subtle)">
                <AwCortexSynthesis />
              </div>
              <span className="mono text-(--fg-tertiary) text-[11px]">
                default · B&amp;W
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="relative h-[200px] rounded-lg overflow-hidden border border-(--border-subtle)">
                <AwCortexSynthesis color3="#2563eb" />
              </div>
              <span className="mono text-(--fg-tertiary) text-[11px]">
                color3=&quot;#2563eb&quot; · tinta de marca
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="relative h-[200px] rounded-lg overflow-hidden border border-(--border-subtle)">
                <AwCortexSynthesis hueSpeed={0.05} />
              </div>
              <span className="mono text-(--fg-tertiary) text-[11px]">
                hueSpeed=&#123;0.05&#125; · rainbow
              </span>
            </div>
          </Stage>
          <p className="body-sm text-(--fg-secondary)">
            <code className="mono">color3=&quot;#2563eb&quot;</code> não é um
            token CSS — é um uniform que vira{" "}
            <code className="mono">THREE.Color</code> no shader. Passar hex
            nessas props (color1/2/3, backgroundColor) é o uso correto;
            tokenizar não faz sentido para um valor de GPU.
          </p>
        </Section>

        <Section
          id="knobs"
          title="Knobs"
          lead="scale, complexity, distortion e contrast remodelam o fluxo. Cada tile abaixo está contido no seu próprio parent relative — a legenda em mono mostra o ajuste."
        >
          <Stage label="settings" gridClassName="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <div className="relative h-[200px] rounded-lg overflow-hidden border border-(--border-subtle)">
                <AwCortexSynthesis scale={1.4} complexity={4} />
              </div>
              <span className="mono text-(--fg-tertiary) text-[11px]">
                scale=&#123;1.4&#125; complexity=&#123;4&#125; · macro, calmo
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="relative h-[200px] rounded-lg overflow-hidden border border-(--border-subtle)">
                <AwCortexSynthesis scale={4.2} complexity={14} distortion={2.4} />
              </div>
              <span className="mono text-(--fg-tertiary) text-[11px]">
                scale=&#123;4.2&#125; complexity=&#123;14&#125; distortion=&#123;2.4&#125; · denso
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="relative h-[200px] rounded-lg overflow-hidden border border-(--border-subtle)">
                <AwCortexSynthesis contrast={1.8} glowIntensity={0.4} />
              </div>
              <span className="mono text-(--fg-tertiary) text-[11px]">
                contrast=&#123;1.8&#125; glowIntensity=&#123;0.4&#125; · alto contraste
              </span>
            </div>
          </Stage>
        </Section>

        <Section
          id="mask"
          title="Máscara"
          lead="A textura é sempre recortada pela forma do container. O mesmo shader, dois recortes: círculo e card arredondado. Na aplicação, AwCopilotOrb aplica a máscara hexagonal de verdade."
        >
          <Stage label="mesma textura, formas diferentes" gridClassName="flex flex-wrap items-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="relative h-[160px] w-[160px] rounded-full overflow-hidden border border-(--border-subtle)">
                <AwCortexSynthesis />
              </div>
              <span className="mono text-(--fg-tertiary) text-[11px]">
                rounded-full · orb de agente
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="relative h-[160px] w-[240px] rounded-lg overflow-hidden border border-(--border-subtle)">
                <AwCortexSynthesis />
              </div>
              <span className="mono text-(--fg-tertiary) text-[11px]">
                rounded-lg · hero contido
              </span>
            </div>
          </Stage>
          <p className="body-sm text-(--fg-secondary)">
            O recorte vem do container (
            <code className="mono">overflow-hidden</code> +{" "}
            <code className="mono">border-radius</code>). O shader não conhece a
            forma — ele só preenche. No produto, o{" "}
            <code className="mono">AwCopilotOrb</code> usa uma máscara hexagonal
            real por cima da mesma textura.
          </p>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwCortexSynthesis } from "@/components/ui/AwCortexSynthesis". Todas as props são opcionais.`}
        >
          <ApiTable>
            <PropRow
              prop="speed"
              type="number"
              def="0.1"
              doc="Velocidade do fluxo (multiplica o tempo do shader)."
            />
            <PropRow
              prop="color1"
              type="string"
              def='"#ffffff"'
              doc="Cor base A. uniform WebGL (hex), não é token CSS."
            />
            <PropRow
              prop="color2"
              type="string"
              def='"#ffffff"'
              doc="Cor base B. uniform WebGL (hex), não é token CSS."
            />
            <PropRow
              prop="color3"
              type="string"
              def='"#4f4f4f"'
              doc="Cor de profundidade / glow. uniform WebGL (hex), não é token CSS."
            />
            <PropRow
              prop="scale"
              type="number"
              def="2.8"
              doc="Zoom do campo. Menor = padrão macro; maior = mais denso."
            />
            <PropRow
              prop="complexity"
              type="number"
              def="8"
              doc="Iterações de dobra do shader (1–20). Mais = mais detalhe."
            />
            <PropRow
              prop="distortion"
              type="number"
              def="1.6"
              doc="Intensidade da distorção em cada iteração."
            />
            <PropRow
              prop="glowIntensity"
              type="number"
              def="0"
              doc="Brilho radial central (usa color3). 0 = desligado."
            />
            <PropRow
              prop="flowFrequency"
              type="number"
              def="2"
              doc="Frequência das ondas de fluxo que misturam as cores."
            />
            <PropRow
              prop="contrast"
              type="number"
              def="1.0"
              doc="Curva de contraste (smoothstep) sobre a cor final."
            />
            <PropRow
              prop="hueSpeed"
              type="number"
              def="0"
              doc="Velocidade de rotação de matiz. 0 = off; >0 = sweep arco-íris."
            />
            <PropRow
              prop="backgroundColor"
              type="string"
              def='"#000000"'
              doc="Cor do fundo do container. uniform/CSS de shader (hex), não é token CSS."
            />
            <PropRow
              prop="className"
              type="string"
              doc="Classes extras no wrapper absolute inset-0."
            />
            <PropRow
              prop="style"
              type="React.CSSProperties"
              doc="Estilo inline no wrapper (mesclado com backgroundColor)."
            />
          </ApiTable>
          <CodeExample>{`import { AwCortexSynthesis } from "@/components/ui/AwCortexSynthesis"

// SEMPRE dentro de um parent relative + altura + overflow-hidden
<div className="relative h-[240px] rounded-lg overflow-hidden">
  <AwCortexSynthesis />
</div>

// tinta de marca (uniform WebGL, não token)
<AwCortexSynthesis color3="#2563eb" />

// sweep arco-íris
<AwCortexSynthesis hueSpeed={0.05} />

// macro e calmo
<AwCortexSynthesis scale={1.4} complexity={4} />`}</CodeExample>
        </Section>

        <Section
          id="tokens"
          title="Tokens consumidos"
          lead="O componente é WebGL puro — não lê tokens CSS. Só o chrome desta página (bordas, textos, fundos) usa tokens."
        >
          <TokensConsumed
            tokens={[
              {
                token: "—",
                role:
                  "componente não consome tokens CSS (shader WebGL); cores são uniforms",
                value: "—",
              },
            ]}
          />
        </Section>

        <Section
          id="code"
          title="Código"
          lead="O padrão obrigatório: container relative com altura explícita e overflow-hidden. Sem isso o fill absoluto colapsa em 0px e nada aparece."
        >
          <CodeExample label="Hero de agente contido">{`<div className="relative h-[320px] rounded-2xl overflow-hidden">
  <AwCortexSynthesis color3="#2563eb" scale={3.2} contrast={1.4} />
  {/* conteúdo do hero por cima, com sua própria camada/overlay */}
</div>`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>
                Sempre dentro de um parent{" "}
                <code className="mono">relative</code> + altura +{" "}
                <code className="mono">overflow-hidden</code>.
              </>,
              <>
                Passe hex nas props de cor (color1/2/3, backgroundColor) — são
                uniforms de shader, não tokens.
              </>,
              <>
                Mantenha-a mascarada por uma forma (hexágono, círculo, card) — é
                fundo do orb, não solta.
              </>,
            ]}
            donts={[
              <>
                Usar sem container ou sem altura — o fill{" "}
                <code className="mono">absolute inset-0</code> some.
              </>,
              <>
                Pôr texto direto por cima sem overlay — o movimento mata o
                contraste.
              </>,
              <>
                Instanciar dezenas na mesma tela — cada Canvas é um contexto
                WebGL (orçamento ~16).
              </>,
            ]}
          />
        </Section>

        <RelatedLinks
          items={[
            {
              name: "Copilot drawer",
              href: "/bombardier/styleguide/components/aw-copilot-drawer",
              description:
                "O orb (AwCopilotOrb) que mascara esta textura num hexágono.",
            },
            {
              name: "Agente do usuário",
              href: "/bombardier/styleguide/components/user-agent",
              description: "O orb do agente, também sobre esta textura.",
            },
            {
              name: "Beams",
              href: "/bombardier/styleguide/components/aw-beams",
              description: "Outro fundo animado da marca.",
            },
          ]}
        />
      </div>
    </>
  )
}
