import { AwAgentCore, agentCoreSrc } from "@/components/ui/AwAgentCore"
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
} from "../../_primitives"

const CORES = Array.from({ length: 20 }, (_, i) => ({
  n: i + 1,
  label: `Core ${String(i + 1).padStart(2, "0")}`,
}))

const SIZE_SCALE = [
  { key: "xs", px: 20, note: "Inline em chips, breadcrumbs, listas densas." },
  { key: "sm", px: 28, note: "Avatar em linhas de tabela e dropdowns." },
  { key: "md", px: 40, note: "Selo do Core num card de agente." },
  { key: "lg", px: 64, note: "Cabeçalho de painel, picker de Core." },
  { key: "xl", px: 120, note: "Hero da página do Core, catálogo." },
] as const

export default function AgentCorePage() {
  return (
    <>
      <PageHero title="Agent Core">
        Os frameworks agênticos proprietários da AwSales. Cada Core é um{" "}
        <strong>orb colorido (PNG)</strong> recortado na silhueta de{" "}
        <strong>diamante</strong> (quadrado rotacionado 45°). É{" "}
        <strong>estático</strong> de propósito: o Core é a infraestrutura que o
        usuário <em>seleciona</em> ao criar um agente — um selo de framework,
        não o agente vivo. A textura animada é do{" "}
        <a
          className="underline text-(--aw-blue-700)"
          href="/bombardier/styleguide/components/user-agent"
        >
          Agente do Usuário
        </a>{" "}
        (um círculo). A silhueta separa as categorias: Core é diamante, agente é
        círculo, Cortex é hex.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>
              Represente um <strong>Agent Core</strong> — um framework
              proprietário da AwSales.
            </>,
            <>
              No <strong>picker</strong> em que o usuário escolhe o Core ao criar
              um agente.
            </>,
            <>
              Como <strong>selo</strong> indicando qual Core um agente usa
              (catálogo, card do agente, diagrama de arquitetura).
            </>,
          ]}
          dontUse={[
            <>
              Para o <strong>agente do usuário</strong> — esse é o círculo
              animado (<code className="mono">AwUserAgentOrb</code>).
            </>,
            <>
              Para o <strong>Cortex</strong> (cérebro) — esse é o hex via{" "}
              <code className="mono">AwCopilotOrb</code>.
            </>,
            <>
              Animando o Core — ele é estático. O movimento é do agente vivo.
            </>,
          ]}
        />

        <Toc
          items={[
            { id: "biblioteca", label: "Biblioteca" },
            { id: "tamanhos", label: "Tamanhos" },
            { id: "anatomia", label: "Anatomia" },
            { id: "controles", label: "Controles" },
            { id: "do-dont", label: "Do / Don't" },
            { id: "related", label: "Relacionados" },
          ]}
        />

        <Section
          id="biblioteca"
          title="Biblioteca de Cores"
          lead="20 frameworks proprietários. Cada Core tem arte própria; juntos formam a família da AwSales. São PNGs do repo, recortados no diamante — sem animação."
        >
          <Stage
            label="AwAgentCore · estático"
            hint="Orb (PNG) recortado na máscara diamante. A arte vem de /assets/agent_imgs/orbs/."
            gridClassName="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-5"
          >
            {CORES.map((c) => (
              <div
                key={c.n}
                className="flex flex-col items-center gap-2 text-[11px] text-(--fg-tertiary)"
              >
                <AwAgentCore src={agentCoreSrc(c.n)} alt={c.label} size={88} />
                <span className="mono">{c.label}</span>
              </div>
            ))}
          </Stage>
        </Section>

        <Section
          id="tamanhos"
          title="Tamanhos"
          lead="Mesma escala canônica dos outros visuais de agente (xs/sm/md/lg/xl). Use o token da escala — não invente valores intermediários."
        >
          <Stage
            label="escala · xs → xl"
            hint="Mesmo Core pra comparar só o tamanho."
            gridClassName="flex flex-wrap items-end gap-8"
          >
            {SIZE_SCALE.map((s) => (
              <div
                key={s.key}
                className="flex flex-col items-center gap-2 text-[11px] text-(--fg-tertiary)"
              >
                <AwAgentCore src={agentCoreSrc(3)} alt={`Core 03 ${s.key}`} size={s.px} />
                <span className="mono">
                  {s.key} · {s.px}px
                </span>
              </div>
            ))}
          </Stage>

          <div className="mt-6 rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
            {SIZE_SCALE.map((s) => (
              <Spec key={s.key} k={s.key} v={`${s.px}px`} d={s.note} />
            ))}
          </div>
        </Section>

        <Section
          id="anatomia"
          title="Anatomia"
          lead="Diamante = quadrado rotacionado 45° inscrito num box 1:1 (vértices no meio de cada aresta), aplicado como máscara SVG sobre a arte do orb. A mesma máscara dá a silhueta; a arte é a identidade de cada Core."
        >
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-8">
            <div className="flex items-center justify-center">
              <AwAgentCore src={agentCoreSrc(1)} alt="Core 01" size={140} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Spec
                k="silhueta"
                v="diamante (quadrado 45°)"
                d="Máscara SVG M50 0 L100 50 L50 100 L0 50 Z. Codifica a categoria Core."
              />
              <Spec
                k="fill"
                v="PNG (orb art)"
                d="next/image object-cover de /assets/agent_imgs/orbs/orb_model-a_NN.png."
              />
              <Spec
                k="movimento"
                v="estático"
                d="O Core é um selo de framework. Quem anima é o agente do usuário."
              />
              <Spec
                k="cor"
                v="da arte"
                d="20 variantes proprietárias — a cor vem do PNG, não de paleta gerada."
              />
            </div>
          </div>
        </Section>

        <Section
          id="controles"
          title="Controles"
          lead="API enxuta — é um selo estático."
        >
          <ApiTable>
            <PropRow
              prop="src"
              type="string"
              def="—"
              doc="Caminho do PNG do Core. Use o helper agentCoreSrc(n) (n = 1–20)."
            />
            <PropRow
              prop="size"
              type="number"
              def="64"
              doc="Lado do box em px. O diamante ocupa 100%."
            />
            <PropRow
              prop="alt"
              type="string"
              def='""'
              doc="Texto alternativo. Vazio = decorativo; preencha quando o Core for informativo."
            />
            <PropRow
              prop="className"
              type="string"
              def="—"
              doc="Classes extras no container (merge via cn)."
            />
          </ApiTable>

          <CodeExample label="uso" lang="tsx">
            {`import { AwAgentCore, agentCoreSrc } from "@/components/ui/AwAgentCore"

// Selo do Core 03, 40px:
<AwAgentCore src={agentCoreSrc(3)} alt="Core 03" size={40} />`}
          </CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>
                Use o <code className="mono">agentCoreSrc(n)</code> pra resolver
                a arte — mantém o mapeamento Core → PNG num lugar só.
              </>,
              <>
                Mantenha o Core <strong>estático</strong>; o movimento é a
                assinatura do agente vivo, não do framework.
              </>,
              <>
                Pareie Core (diamante) + Agente (círculo) quando precisar mostrar
                que um usa o outro.
              </>,
            ]}
            donts={[
              <>
                Não recolore o orb nem gere paleta pro Core — a cor é a arte do
                PNG. Paleta gerada é coisa do agente do usuário.
              </>,
              <>
                Não troque a silhueta — Core é diamante, agente é círculo, Cortex
                é hex.
              </>,
              <>
                Não substitua o orb por ícone genérico de robô/sparkle.
              </>,
            ]}
          />
        </Section>

        <Section id="related" title="Relacionados">
          <RelatedLinks
            items={[
              {
                name: "Agente do Usuário",
                href: "/bombardier/styleguide/components/user-agent",
                description:
                  "O círculo animado que o usuário cria — escolhe um Core no processo. É quem carrega a textura Synthesis.",
              },
              {
                name: "Visual dos agentes",
                href: "/bombardier/styleguide/components/agents",
                description:
                  "A linguagem completa: Agent Core (diamante), Agente do Usuário (círculo) e Cortex (hex).",
              },
              {
                name: "Specialists pair",
                href: "/bombardier/styleguide/components/aw-specialists-pair",
                description: "Gerente humano + Cortex — usa o mesmo shader Synthesis.",
              },
            ]}
          />
        </Section>
      </div>
    </>
  )
}
