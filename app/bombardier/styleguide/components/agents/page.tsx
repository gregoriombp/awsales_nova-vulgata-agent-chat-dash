import Image from "next/image"
import {
  CopilotOrb,
  CORTEX_STATE_PRESETS,
  type CortexState,
} from "@/components/CopilotDrawer"
import {
  PageHero,
  Section,
  Stage,
  Spec,
  Tldr,
  Toc,
  RelatedLinks,
  DoDont,
  ApiTable,
  PropRow,
  CodeExample,
} from "../../_primitives"

const AGENT_CORES = Array.from({ length: 20 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0")
  return { id: `core-${n}`, label: `Core ${n}`, src: `/assets/agent_imgs/orbs/orb_model-a_${n}.png` }
})

const USER_AGENTS = Array.from({ length: 12 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0")
  return {
    id: `user-${n}`,
    label: `Modelo ${n}`,
    src: `/assets/agent_imgs/orbs/orb_model-a_${n}-1.png`,
  }
})

const CORTEX_STATES: Array<{
  state: CortexState
  label: string
  trigger: string
  feel: string
}> = [
  {
    state: "idle",
    label: "Idle",
    trigger: "Nenhum input ativo — Cortex em repouso, vivendo no topbar.",
    feel: "Prata + branco respirando lento sobre grafite. Quase imperceptível.",
  },
  {
    state: "listening",
    label: "Listening",
    trigger: "Usuário digitando, falando, ou anexando contexto.",
    feel: "Tom levemente frio (índigo). Movimento um pouco mais presente, sem urgência.",
  },
  {
    state: "thinking",
    label: "Thinking",
    trigger: "Cortex coordenando Cores e raciocinando — pico de atividade.",
    feel: "Prata acelerado, flow amplo (2–9). Comunica processamento sem virar ansiedade.",
  },
  {
    state: "responding",
    label: "Responding",
    trigger: "Output sendo gerado — Cortex compondo a resposta.",
    feel: "Tom morno (âmbar). Mais calmo que thinking, sinaliza saída fluindo.",
  },
  {
    state: "error",
    label: "Error",
    trigger: "Falha de conexão, Core indisponível ou execução abortada.",
    feel: "Vermelho profundo quase parado. Único estado com chroma alta — pede atenção.",
  },
]

const SIZE_SCALE: Array<{ key: string; label: string; px: number; note: string }> = [
  { key: "xs", label: "xs", px: 20, note: "Inline em chips, breadcrumbs, listas densas." },
  { key: "sm", label: "sm", px: 28, note: "Avatar em linhas de tabela e dropdowns." },
  { key: "md", label: "md", px: 40, note: "Cards de lista, item ativo na sidebar." },
  { key: "lg", label: "lg", px: 64, note: "Cabeçalho de painel, identidade na conversa." },
  { key: "xl", label: "xl", px: 120, note: "Hero da página do agente, onboarding." },
]

function OrbThumb({ src, alt, size = 96 }: { src: string; alt: string; size?: number }) {
  return (
    <div
      className="relative shrink-0 rounded-full overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-cover"
        unoptimized
      />
    </div>
  )
}

export default function AgentsPage() {
  return (
    <>
      <PageHero title="Visual dos agentes">
        A AwSales tem três peças distintas de IA na interface — cada uma com
        identidade visual própria. <strong>Agent Core</strong> são os
        frameworks proprietários da plataforma (orbs coloridos, fixos).{" "}
        <strong>Agente do Usuário</strong> é qualquer agente criado dentro do
        produto (orbs em grayscale, customizáveis). <strong>Cortex</strong> é
        o cérebro do sistema — hex de vértices sharp, animado em WebGL via{" "}
        <code className="mono">@react-three/fiber</code> + shader{" "}
        <code className="mono">AstralFlow</code>, sempre presente no topbar e
        respondendo ao ciclo de pensamento da conversa.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-10">
          <Tldr
            use={[
              <>
                Use o orb <strong>colorido</strong> sempre que estiver
                representando um Agent Core da AwSales.
              </>,
              <>
                Use o orb em <strong>grayscale</strong> para qualquer agente
                criado pelo usuário — neutro, sem competir visualmente com os
                Cores.
              </>,
              <>
                Use o <strong>Cortex hex</strong> apenas para o cérebro do
                sistema. Ele é singular: existe um Cortex, e ele aparece no
                topbar e no painel do copilot.
              </>,
            ]}
            dontUse={[
              <>
                Não troque a paleta entre as categorias — colorido para Cores,
                cinza para Usuário. A diferença codifica hierarquia.
              </>,
              <>
                Não renderize um Agent Core como hexágono nem o Cortex como
                orb redondo. As silhuetas (circular × hexagonal) também
                comunicam categoria.
              </>,
              <>
                Não use ícones genéricos de robô/sparkle para representar
                agentes — sempre o orb da categoria correta.
              </>,
            ]}
          />

          <Toc
            items={[
              { id: "agent-core", label: "Agent Core" },
              { id: "user-agent", label: "Agente do Usuário" },
              { id: "cortex", label: "Cortex" },
              { id: "cortex-states", label: "Estados de pensamento" },
              { id: "cortex-controls", label: "Controles do Cortex" },
              { id: "sizes", label: "Tamanhos" },
              { id: "use-cases", label: "Casos de uso" },
              { id: "anatomy", label: "Anatomia" },
              { id: "do-dont", label: "Do / Don't" },
              { id: "related", label: "Relacionados" },
            ]}
          />

          <Section
            id="agent-core"
            title="Agent Core"
            lead="Frameworks de agentes proprietários da AwSales — peças fixas do sistema, mantidas pela própria AwSales, que rodam em conjunto com o agente do usuário. Funcionam como camada de infraestrutura: cuidam de capacidades transversais (memória, contexto, orquestração, integrações internas) que qualquer Agente do Usuário herda automaticamente. O usuário não cria nem edita um Core — ele apenas se conecta."
          >
            <Stage
              label="Biblioteca de Cores"
              hint="20 orbs coloridos. Cada Core tem identidade visual única; juntos formam a família proprietária."
              gridClassName="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-5"
            >
              {AGENT_CORES.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col items-center gap-2 text-[11px] text-[var(--fg-tertiary)]"
                >
                  <OrbThumb src={c.src} alt={c.label} size={88} />
                  <span className="mono">{c.label}</span>
                </div>
              ))}
            </Stage>
          </Section>

          <Section
            id="user-agent"
            title="Agente do Usuário"
            lead="Qualquer agente criado pelo próprio usuário dentro da plataforma — objetivo, instruções, ferramentas e personalidade definidos por ele. Ao ser instanciado, opera acoplado aos Agent Cores (recebendo capacidades base) e ao Cortex (recebendo raciocínio e decisão). É a peça customizável da arquitetura — por isso o orb vem em grayscale: serve de tela neutra que o usuário pode reconhecer como seu sem competir com os Cores."
          >
            <Stage
              label="Biblioteca grayscale"
              hint="12 modelos neutros. O usuário escolhe um na criação e ele passa a representar o agente em toda a plataforma."
              gridClassName="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-6 gap-5"
            >
              {USER_AGENTS.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-col items-center gap-2 text-[11px] text-[var(--fg-tertiary)]"
                >
                  <OrbThumb src={u.src} alt={u.label} size={88} />
                  <span className="mono">{u.label}</span>
                </div>
              ))}
            </Stage>
          </Section>

          <Section
            id="cortex"
            title="Cortex"
            lead="O cérebro central — camada de raciocínio que coordena tudo. Decide qual Agent Core acionar, em que ordem, com que contexto, e como compor as respostas do Agente do Usuário. Já vive no topbar do app, sempre ativo. Não é imagem: vem de uma lib WebGL (@react-three/fiber + shader AstralFlow) recortada por uma máscara hex flat-top de vértices sharp. Tudo escala via <CopilotOrb size />."
          >
            <Stage
              label="Cortex · idle, sempre ativo"
              hint="Renderizado pelo componente CopilotOrb — máscara SVG sharp + AstralFlow."
              gridClassName="flex items-center justify-center gap-10 bg-[var(--bg-canvas)]"
            >
              <CopilotOrb size={56} />
              <CopilotOrb size={88} />
              <CopilotOrb size={140} />
              <CopilotOrb size={200} />
            </Stage>
          </Section>

          <Section
            id="cortex-states"
            title="Estados de pensamento"
            lead="O Cortex muda de estado conforme o ciclo da conversa. Cada estado é um preset de speed + paleta + flow no shader — não vira ícone, não vira PNG. O componente roda em GPU, então a transição entre estados é só trocar a prop."
          >
            <Stage
              label="state · idle | listening | thinking | responding | error"
              hint="Cada peça mostra o estado vivo, animando em loop. Observe a paleta e o ritmo."
              gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5"
            >
              {CORTEX_STATES.map((s) => (
                <div
                  key={s.state}
                  className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-4"
                >
                  <div className="flex items-center justify-center py-2">
                    <CopilotOrb size={120} state={s.state} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <code className="mono text-[11px] text-[var(--aw-blue-700)]">
                        state=&quot;{s.state}&quot;
                      </code>
                    </div>
                    <div className="text-sm font-medium text-[var(--fg-primary)]">
                      {s.label}
                    </div>
                    <p className="caption m-0">
                      <strong className="text-[var(--fg-secondary)]">
                        Dispara:
                      </strong>{" "}
                      {s.trigger}
                    </p>
                    <p className="caption m-0">
                      <strong className="text-[var(--fg-secondary)]">
                        Sensação:
                      </strong>{" "}
                      {s.feel}
                    </p>
                  </div>
                </div>
              ))}
            </Stage>

            <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)]">
                    <th className="pb-2 aw-eyebrow">state</th>
                    <th className="pb-2 aw-eyebrow">speed</th>
                    <th className="pb-2 aw-eyebrow">flow</th>
                    <th className="pb-2 aw-eyebrow">color1</th>
                    <th className="pb-2 aw-eyebrow">color2</th>
                    <th className="pb-2 aw-eyebrow">color3</th>
                    <th className="pb-2 aw-eyebrow">bg</th>
                  </tr>
                </thead>
                <tbody>
                  {CORTEX_STATES.map((s) => {
                    const p = CORTEX_STATE_PRESETS[s.state]
                    return (
                      <tr
                        key={s.state}
                        className="border-b border-[var(--border-subtle)] last:border-b-0 align-middle"
                      >
                        <td className="py-3 pr-4 mono text-sm text-[var(--fg-primary)] whitespace-nowrap">
                          {s.state}
                        </td>
                        <td className="py-3 pr-4 mono text-xs text-[var(--fg-secondary)] whitespace-nowrap">
                          {p.speed}
                        </td>
                        <td className="py-3 pr-4 mono text-xs text-[var(--fg-secondary)] whitespace-nowrap">
                          {p.flowMin} – {p.flowMax}
                        </td>
                        {[p.color1, p.color2, p.color3, p.bg].map((c) => (
                          <td key={c} className="py-3 pr-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="inline-block w-4 h-4 rounded-sm border border-[var(--border-subtle)]"
                                style={{ backgroundColor: c }}
                              />
                              <code className="mono text-[11px] text-[var(--fg-tertiary)]">
                                {c}
                              </code>
                            </span>
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <CodeExample label="ciclo de estado típico" lang="tsx">
              {`// Cortex acompanha o ciclo da conversa.
// Você só troca a prop \`state\` — speed/paleta/flow saem do preset.

function CortexBadge({ phase }: { phase: ConversationPhase }) {
  const state =
    phase === "idle" ? "idle" :
    phase === "user-typing" ? "listening" :
    phase === "reasoning" ? "thinking" :
    phase === "streaming" ? "responding" :
    phase === "fault" ? "error" : "idle"

  return <CopilotOrb size={32} state={state} />
}`}
            </CodeExample>
          </Section>

          <Section
            id="cortex-controls"
            title="Controles do Cortex"
            lead="CopilotOrb expõe o size e um state. Em casos avançados (debug, prototipagem, página de marca), você pode sobrescrever cada eixo do shader individualmente — speed, três cores, faixa de flow e bg. Sem override, tudo vem do preset."
          >
            <ApiTable>
              <PropRow
                prop="size"
                type="number"
                def="36"
                doc="Lado do bounding box em pixels. O hex flat-top ocupa 100% × 86.6% desse box."
              />
              <PropRow
                prop="state"
                type='"idle" | "listening" | "thinking" | "responding" | "error"'
                def='"idle"'
                doc="Preset que dita speed, paleta e flow. Trocar a prop é o jeito canônico de animar o ciclo de pensamento."
              />
              <PropRow
                prop="speed"
                type="number"
                def="preset"
                doc="Override do ritmo do shader (0.05 = quase parado · 1.0 = turbulento). Use só pra debug ou casos de marca."
              />
              <PropRow
                prop="color1"
                type="string (hex)"
                def="preset"
                doc="Base mais escura da malha — define o tom de fundo do fluxo."
              />
              <PropRow
                prop="color2"
                type="string (hex)"
                def="preset"
                doc="Tom intermediário — onde a malha respira."
              />
              <PropRow
                prop="color3"
                type="string (hex)"
                def="preset"
                doc="Highlights — wisps brilhantes que cruzam a superfície."
              />
              <PropRow
                prop="flowMin"
                type="number"
                def="preset"
                doc="Limite inferior da respiração do fluxo. Quanto mais baixo, mais o fluxo encolhe no ciclo."
              />
              <PropRow
                prop="flowMax"
                type="number"
                def="preset"
                doc="Limite superior. Diferença flowMax − flowMin = amplitude do movimento. Maior = mais turbulento."
              />
              <PropRow
                prop="bg"
                type="string (hex)"
                def="preset"
                doc="Cor do canvas atrás do shader. Define a sensação de profundidade do hex."
              />
            </ApiTable>

            <CodeExample label="usos canônicos" lang="tsx">
              {`import { CopilotOrb } from "@/components/CopilotDrawer"

// 1. Topbar — sempre idle, sempre 20px.
<CopilotOrb size={20} />

// 2. Painel do copilot — header em listening enquanto o usuário digita.
<CopilotOrb size={46} state="listening" />

// 3. Hero da página do agente — thinking durante a execução.
<CopilotOrb size={140} state="thinking" />

// 4. Debug / página de marca — override total.
<CopilotOrb
  size={200}
  speed={0.4}
  color1="#0a0a14"
  color2="#3a2f5a"
  color3="#cfb8ff"
  flowMin={2}
  flowMax={9}
  bg="#06060a"
/>`}
            </CodeExample>
          </Section>

          <Section
            id="sizes"
            title="Tamanhos"
            lead="Os três visuais compartilham a mesma escala canônica de tamanhos. Use o token da escala — não invente valores intermediários."
          >
            <Stage
              label="Escala canônica"
              hint="xs · sm · md · lg · xl — aplicada em qualquer um dos três visuais."
              gridClassName="grid grid-cols-1 gap-6"
            >
              <div className="flex flex-col gap-3">
                <div className="aw-eyebrow">Agent Core</div>
                <div className="flex flex-wrap items-end gap-6">
                  {SIZE_SCALE.map((s) => (
                    <div key={s.key} className="flex flex-col items-center gap-2 text-[11px] text-[var(--fg-tertiary)]">
                      <OrbThumb src="/assets/agent_imgs/orbs/orb_model-a_01.png" alt={`Core xs`} size={s.px} />
                      <span className="mono">{s.label} · {s.px}px</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="aw-eyebrow">Agente do Usuário</div>
                <div className="flex flex-wrap items-end gap-6">
                  {SIZE_SCALE.map((s) => (
                    <div key={s.key} className="flex flex-col items-center gap-2 text-[11px] text-[var(--fg-tertiary)]">
                      <OrbThumb src="/assets/agent_imgs/orbs/orb_model-a_01-1.png" alt={`User ${s.label}`} size={s.px} />
                      <span className="mono">{s.label} · {s.px}px</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="aw-eyebrow">Cortex</div>
                <div className="flex flex-wrap items-end gap-6">
                  {SIZE_SCALE.map((s) => (
                    <div key={s.key} className="flex flex-col items-center gap-2 text-[11px] text-[var(--fg-tertiary)]">
                      <CopilotOrb size={s.px} />
                      <span className="mono">{s.label} · {s.px}px</span>
                    </div>
                  ))}
                </div>
              </div>
            </Stage>

            <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
              {SIZE_SCALE.map((s) => (
                <Spec key={s.key} k={s.label} v={`${s.px}px`} d={s.note} />
              ))}
            </div>
          </Section>

          <Section
            id="use-cases"
            title="Casos de uso"
            lead="Cada visual tem um lugar canônico na interface. A consistência ensina o usuário a ler a hierarquia."
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <OrbThumb src="/assets/agent_imgs/orbs/orb_model-a_03.png" alt="Agent Core" size={48} />
                  <div>
                    <div className="text-sm font-medium text-[var(--fg-primary)]">Agent Core</div>
                    <div className="caption">Infraestrutura proprietária</div>
                  </div>
                </div>
                <ul className="body-sm m-0 pl-4 list-disc flex flex-col gap-1 text-[var(--fg-secondary)]">
                  <li>Catálogo de Cores disponíveis no workspace.</li>
                  <li>Indicador de qual Core está ativo numa execução.</li>
                  <li>Diagrama de arquitetura do agente do usuário.</li>
                  <li>Painel de configuração / créditos por Core.</li>
                </ul>
              </div>

              <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <OrbThumb src="/assets/agent_imgs/orbs/orb_model-a_03-1.png" alt="Agente do Usuário" size={48} />
                  <div>
                    <div className="text-sm font-medium text-[var(--fg-primary)]">Agente do Usuário</div>
                    <div className="caption">Customizável pelo usuário</div>
                  </div>
                </div>
                <ul className="body-sm m-0 pl-4 list-disc flex flex-col gap-1 text-[var(--fg-secondary)]">
                  <li>Avatar do agente na lista de agentes do workspace.</li>
                  <li>Identidade no header da conversa com o agente.</li>
                  <li>Picker de modelo na criação do agente.</li>
                  <li>Card do agente em compartilhamentos e logs.</li>
                </ul>
              </div>

              <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <CopilotOrb size={48} />
                  <div>
                    <div className="text-sm font-medium text-[var(--fg-primary)]">Cortex</div>
                    <div className="caption">Cérebro do sistema</div>
                  </div>
                </div>
                <ul className="body-sm m-0 pl-4 list-disc flex flex-col gap-1 text-[var(--fg-secondary)]">
                  <li>Sempre presente no canto direito do topbar.</li>
                  <li>Header do drawer / painel do copilot.</li>
                  <li>Estado de raciocínio durante uma execução do agente.</li>
                  <li>Páginas que falam do "sistema nervoso" da plataforma.</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="As três peças coexistem na mesma tela. A combinação shape + paleta é a regra que separa cada categoria."
          >
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Spec
                k="Agent Core"
                v="círculo · colorido"
                d="PNG do registry. 20 variantes proprietárias da AwSales."
              />
              <Spec
                k="Agente do Usuário"
                v="círculo · grayscale"
                d="PNG do registry. 12 variantes neutras escolhidas pelo usuário."
              />
              <Spec
                k="Cortex"
                v="hex sharp · WebGL"
                d="CopilotOrb (máscara SVG flat-top sharp + shader AstralFlow). Único, sempre ativo, com state controlando o pensamento."
              />
              <Spec
                k="silhueta"
                v="circle ↔ hex"
                d="Shape codifica categoria: agentes são círculos, Cortex é hex."
              />
              <Spec
                k="paleta"
                v="color ↔ gray"
                d="Cor distingue origem: Core é AwSales, Usuário é neutro."
              />
              <Spec
                k="movimento"
                v="estático ↔ animado"
                d="Orbs são imagens estáticas. Cortex sempre tem fluxo animado."
              />
            </div>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>
                  Renderize Cortex sempre via{" "}
                  <code className="mono">CopilotOrb</code> — assim a animação e
                  a máscara hex ficam consistentes em qualquer tamanho.
                </>,
                <>
                  Importe as PNGs dos orbs de{" "}
                  <code className="mono">/assets/agent_imgs/orbs/</code> e
                  mantenha o mapeamento Core → colorido, Usuário → grayscale.
                </>,
                <>
                  Combine orb + nome do agente quando o usuário precisar
                  identificá-lo (listas, conversas, picker).
                </>,
                <>
                  Use a escala canônica (xs/sm/md/lg/xl). Densidade da UI
                  decide o tamanho, não o tipo do agente.
                </>,
              ]}
              donts={[
                <>
                  Não inverta paletas (Core em grayscale, Usuário colorido) —
                  você quebra a hierarquia inteira do sistema.
                </>,
                <>
                  Não use o Cortex hex para representar um agente individual.
                  Ele é o cérebro, não um agente.
                </>,
                <>
                  Não recolorize um orb do Usuário com brand do workspace —
                  use os 12 modelos neutros como estão.
                </>,
                <>
                  Não substitua o orb por iniciais, emoji ou ícone genérico.
                  O orb é a identidade do agente.
                </>,
              ]}
            />
          </Section>

          <Section id="related" title="Relacionados">
            <RelatedLinks
              items={[
                {
                  name: "Specialists pair",
                  href: "/bombardier/styleguide/components/aw-specialists-pair",
                  description:
                    "Bloco que apresenta o Gerente humano + Cortex. Usa o mesmo gradient AI da máscara hex.",
                },
                {
                  name: "Chat bubbles",
                  href: "/bombardier/styleguide/components/chat",
                  description:
                    "Conversa com o Agente do Usuário — o orb aparece como avatar do lado do bot.",
                },
                {
                  name: "Foundation · Gradient",
                  href: "/bombardier/styleguide/foundation/gradient",
                  description:
                    "Gradient ai-cortex (silver mesh) e ai-warm — os fundos que codificam IA na plataforma.",
                },
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
