import { AwAgentCore, agentCoreSrc } from "@/components/ui/AwAgentCore"
import { AwUserAgentOrbStatic } from "@/components/ui/AwUserAgentOrb"
import { AwCopilotOrb } from "@/components/ui/AwCopilotDrawer"
import {
  CORTEX_STATE_PRESETS,
  type CortexState,
} from "@/lib/copilot-orb-presets"
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

const AGENT_CORES = Array.from({ length: 20 }, (_, i) => ({
  n: i + 1,
  label: `Core ${String(i + 1).padStart(2, "0")}`,
}))

const USER_AGENTS = Array.from({ length: 12 }, (_, i) => {
  const n = String(i + 1).padStart(2, "0")
  return { seed: `agent-${n}`, label: `Agente ${n}` }
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
    feel: "Cromo líquido B&W respirando lento. O standard puro — só o que veio do print.",
  },
  {
    state: "listening",
    label: "Listening",
    trigger: "Usuário digitando, falando, ou anexando contexto.",
    feel: "Mesmo cromo, color3 levemente frio (azul-grafite) e distortion 1.4. Sinaliza presença sem urgência.",
  },
  {
    state: "thinking",
    label: "Thinking",
    trigger: "Cortex coordenando Cores e raciocinando — pico de atividade.",
    feel: "Speed 3.5×, complexity 9, distortion 2.0, glow 0.08. O cromo acelera e ganha turbulência.",
  },
  {
    state: "responding",
    label: "Responding",
    trigger: "Output sendo gerado — Cortex compondo a resposta.",
    feel: "Color3 morno (âmbar escuro) e color2 cremoso. Mesma estrutura do standard, paleta vira chrome dourado.",
  },
  {
    state: "error",
    label: "Error",
    trigger: "Falha de conexão, Core indisponível ou execução abortada.",
    feel: "Speed 0.05, paleta vermelha completa, glow 0.2. Único estado que abandona o B&W — pede atenção.",
  },
]

const SIZE_SCALE: Array<{ key: string; label: string; px: number; note: string }> = [
  { key: "xs", label: "xs", px: 20, note: "Inline em chips, breadcrumbs, listas densas." },
  { key: "sm", label: "sm", px: 28, note: "Avatar em linhas de tabela e dropdowns." },
  { key: "md", label: "md", px: 40, note: "Cards de lista, item ativo na sidebar." },
  { key: "lg", label: "lg", px: 64, note: "Cabeçalho de painel, identidade na conversa." },
  { key: "xl", label: "xl", px: 120, note: "Hero da página do agente, onboarding." },
]

const AGENT_DECISION = [
  {
    subject: "Framework proprietário que o usuário escolhe",
    visual: "Agent Core",
    component: "AwAgentCore",
    shape: "diamante estático",
    rule: "Use para catálogo, configuração e indicação do framework ativo.",
  },
  {
    subject: "Agente criado pelo usuário",
    visual: "Agente do Usuário",
    component: "AwUserAgentOrb",
    shape: "círculo animado",
    rule: "Use como avatar/identidade do agente em listas, conversa e criação.",
  },
  {
    subject: "Cérebro central da plataforma",
    visual: "Cortex",
    component: "AwCopilotOrb",
    shape: "hex animado",
    rule: "Use apenas para o sistema raciocinando, topbar e drawer do copilot.",
  },
]

export default function AgentsPage() {
  return (
    <>
      <PageHero title="Visual dos agentes">
        A Aswork tem três peças distintas de IA na interface — cada uma com
        identidade visual própria. <strong>Agent Core</strong> são os
        frameworks proprietários da plataforma — <strong>diamantes estáticos</strong>{" "}
        (quadrado 45°), orbs coloridos (PNG). O usuário não cria um Core: ele{" "}
        <em>seleciona</em> um ao criar o agente. <strong>Agente do Usuário</strong>{" "}
        é o agente que o usuário cria — um <strong>círculo com textura animada</strong>{" "}
        (shader <code className="mono">Synthesis</code> via{" "}
        <code className="mono">@react-three/fiber</code>), colorido por uma paleta
        seeded (cada agente uma hue própria). <strong>Cortex</strong> é o cérebro
        do sistema — hex de vértices sharp, animado no mesmo shader (cromo líquido
        B&W), sempre no topbar e respondendo ao ciclo de pensamento. Agente e Core
        trabalham juntos: o círculo vivo roda em cima do framework que escolheu.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-10">
          <Tldr
            use={[
              <>
                Use o <strong>diamante estático</strong> (PNG) para representar
                um Agent Core — o framework proprietário.
              </>,
              <>
                Use o <strong>círculo animado</strong> (Synthesis) para o agente
                que o usuário cria — é o avatar vivo dele.
              </>,
              <>
                Use o <strong>Cortex hex</strong> apenas para o cérebro do
                sistema. Ele é singular: existe um Cortex, sempre no topbar.
              </>,
            ]}
            dontUse={[
              <>
                Não anime o Agent Core — ele é estático (PNG). O movimento é a
                assinatura do agente vivo e do Cortex.
              </>,
              <>
                Não troque as silhuetas — Agent Core é diamante, Agente é
                círculo, Cortex é hex. A forma comunica categoria.
              </>,
              <>
                Não use ícones genéricos de robô/sparkle para representar
                agentes — sempre o visual da categoria correta.
              </>,
            ]}
          />

          <Toc
            items={[
              { id: "decision", label: "Qual visual usar" },
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
            id="decision"
            title="Qual visual usar"
            lead="Esta é a decisão canônica. As rotas individuais de Agent Core e Agente do Usuário continuam existindo como subpáginas técnicas, mas a escolha entre Core, agente e Cortex deve começar aqui."
          >
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-(--border-subtle)">
                    <th className="pb-2 aw-eyebrow">quando fala de</th>
                    <th className="pb-2 aw-eyebrow">visual</th>
                    <th className="pb-2 aw-eyebrow">componente</th>
                    <th className="pb-2 aw-eyebrow">silhueta</th>
                    <th className="pb-2 aw-eyebrow">regra</th>
                  </tr>
                </thead>
                <tbody>
                  {AGENT_DECISION.map((row) => (
                    <tr
                      key={row.component}
                      className="border-b border-(--border-subtle) last:border-b-0 align-top"
                    >
                      <td className="py-3 pr-4 text-sm text-(--fg-primary)">
                        {row.subject}
                      </td>
                      <td className="py-3 pr-4 text-sm text-(--fg-primary)">
                        {row.visual}
                      </td>
                      <td className="py-3 pr-4 mono text-sm text-(--aw-blue-700) whitespace-nowrap">
                        {row.component}
                      </td>
                      <td className="py-3 pr-4 text-sm text-(--fg-secondary) whitespace-nowrap">
                        {row.shape}
                      </td>
                      <td className="py-3 text-sm text-(--fg-secondary)">
                        {row.rule}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section
            id="agent-core"
            title="Agent Core"
            lead="Frameworks de agentes proprietários da Aswork — peças fixas do sistema que rodam em conjunto com o agente do usuário (memória, contexto, orquestração, integrações internas). O usuário não cria nem edita um Core; ele seleciona um ao criar o agente. Visualmente é um selo estático: orb colorido (PNG) recortado no diamante."
          >
            <Stage
              label="Biblioteca de Cores · estático"
              hint="20 frameworks proprietários — orbs coloridos (PNG) recortados no diamante. Sem animação: o Core é um selo, não o agente vivo."
              gridClassName="flex flex-col gap-5"
            >
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-5">
                {AGENT_CORES.map((c) => (
                  <div
                    key={c.n}
                    className="flex flex-col items-center gap-2 text-[11px] text-(--fg-tertiary)"
                  >
                    <AwAgentCore src={agentCoreSrc(c.n)} alt={c.label} size={88} />
                    <span className="mono">{c.label}</span>
                  </div>
                ))}
              </div>
              <p className="caption m-0">
                Anatomia, tamanhos e API em{" "}
                <a
                  className="underline text-(--aw-blue-700)"
                  href="/bombardier/styleguide/components/agent-core"
                >
                  Agent Core →
                </a>
                .
              </p>
            </Stage>
          </Section>

          <Section
            id="user-agent"
            title="Agente do Usuário"
            lead="O agente que o usuário cria — objetivo, instruções, ferramentas e personalidade definidos por ele. É a peça viva da arquitetura: um círculo com textura animada (shader Synthesis). Ao criar, o usuário escolhe um Agent Core; o agente opera acoplado a ele (capacidades base) e ao Cortex (raciocínio). A cor vem de uma paleta seeded pelo id do agente — cada um uma hue própria."
          >
            <Stage
              label="Agentes do usuário · círculo animado"
              hint="color1 branco; cada agente uma hue própria. Previews estáticos (gradient mesh) por densidade — cada um anima ao vivo na página dedicada."
              gridClassName="flex flex-col gap-6"
            >
              <div className="flex items-center gap-4 flex-wrap">
                <AwUserAgentOrbStatic seed="agent-01" size={96} />
                <p className="caption m-0 max-w-md">
                  Cada agente é um círculo animado. Veja ao vivo, os estados e a
                  regra de cor em{" "}
                  <a
                    className="underline text-(--aw-blue-700)"
                    href="/bombardier/styleguide/components/user-agent"
                  >
                    Agente do Usuário →
                  </a>
                  .
                </p>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-6 gap-5">
                {USER_AGENTS.map((u) => (
                  <div
                    key={u.seed}
                    className="flex flex-col items-center gap-2 text-[11px] text-(--fg-tertiary)"
                  >
                    <AwUserAgentOrbStatic seed={u.seed} size={88} />
                    <span className="mono">{u.label}</span>
                  </div>
                ))}
              </div>
            </Stage>
          </Section>

          <Section
            id="cortex"
            title="Cortex"
            lead="O cérebro central — camada de raciocínio que coordena tudo. Decide qual Agent Core acionar, em que ordem, com que contexto, e como compor as respostas do Agente do Usuário. Já vive no topbar do app, sempre ativo. Não é imagem: vem de uma lib WebGL (@react-three/fiber + shader Synthesis) recortada por uma máscara hex flat-top de vértices sharp. O standard é o cromo líquido B&W — cada estado de pensamento parte dele e personaliza só o que faz sentido. Tudo escala via <AwCopilotOrb size />."
          >
            <Stage
              label="Cortex · idle, sempre ativo"
              hint="Renderizado pelo componente AwCopilotOrb — máscara SVG sharp + shader Synthesis."
              gridClassName="flex items-center justify-center gap-10 bg-(--bg-canvas)"
            >
              <AwCopilotOrb size={56} />
              <AwCopilotOrb size={88} />
              <AwCopilotOrb size={140} />
              <AwCopilotOrb size={200} />
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
                  className="flex flex-col gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-4"
                >
                  <div className="flex items-center justify-center py-2">
                    <AwCopilotOrb size={120} state={s.state} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <code className="mono text-[11px] text-(--aw-blue-700)">
                        state=&quot;{s.state}&quot;
                      </code>
                    </div>
                    <div className="text-sm font-medium text-(--fg-primary)">
                      {s.label}
                    </div>
                    <p className="caption m-0">
                      <strong className="text-(--fg-secondary)">
                        Dispara:
                      </strong>{" "}
                      {s.trigger}
                    </p>
                    <p className="caption m-0">
                      <strong className="text-(--fg-secondary)">
                        Sensação:
                      </strong>{" "}
                      {s.feel}
                    </p>
                  </div>
                </div>
              ))}
            </Stage>

            <div className="mt-6 rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 overflow-x-auto">
              <p className="caption m-0 mb-4">
                <strong className="text-(--fg-secondary)">Standard:</strong>{" "}
                <code className="mono text-[11px] text-(--fg-tertiary)">
                  scale 2.8 · complexity 8 · distortion 1.6 · glow 0 · flow 2 · contrast 1.0
                </code>
                . Estados variam só o que precisa pra comunicar o ciclo — o
                resto herda do idle.
              </p>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-(--border-subtle)">
                    <th className="pb-2 aw-eyebrow">state</th>
                    <th className="pb-2 aw-eyebrow">speed</th>
                    <th className="pb-2 aw-eyebrow">complex</th>
                    <th className="pb-2 aw-eyebrow">distort</th>
                    <th className="pb-2 aw-eyebrow">flow</th>
                    <th className="pb-2 aw-eyebrow">glow</th>
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
                        className="border-b border-(--border-subtle) last:border-b-0 align-middle"
                      >
                        <td className="py-3 pr-4 mono text-sm text-(--fg-primary) whitespace-nowrap">
                          {s.state}
                        </td>
                        <td className="py-3 pr-4 mono text-xs text-(--fg-secondary) whitespace-nowrap">
                          {p.speed}
                        </td>
                        <td className="py-3 pr-4 mono text-xs text-(--fg-secondary) whitespace-nowrap">
                          {p.complexity}
                        </td>
                        <td className="py-3 pr-4 mono text-xs text-(--fg-secondary) whitespace-nowrap">
                          {p.distortion}
                        </td>
                        <td className="py-3 pr-4 mono text-xs text-(--fg-secondary) whitespace-nowrap">
                          {p.flowFrequency}
                        </td>
                        <td className="py-3 pr-4 mono text-xs text-(--fg-secondary) whitespace-nowrap">
                          {p.glowIntensity}
                        </td>
                        {[p.color1, p.color2, p.color3, p.bg].map((c, i) => (
                          <td key={`${s.state}-c-${i}`} className="py-3 pr-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="inline-block w-4 h-4 rounded-sm border border-(--border-subtle)"
                                style={{ backgroundColor: c }}
                              />
                              <code className="mono text-[11px] text-(--fg-tertiary)">
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

  return <AwCopilotOrb size={32} state={state} />
}`}
            </CodeExample>
          </Section>

          <Section
            id="cortex-controls"
            title="Controles do Cortex"
            lead="AwCopilotOrb expõe o size e um state. Em casos avançados (debug, prototipagem, página de marca), você pode sobrescrever cada eixo do shader Synthesis individualmente — speed, três cores, scale, complexity, distortion, glow, flow, contrast e bg. Sem override, tudo vem do preset (idle = standard do print)."
          >
            <ApiTable>
              <PropRow
                prop="size"
                type="number"
                def="36"
                doc="Lado do bounding box em pixels. O hex flat-top ocupa 100% × 86.6% desse box. Também controla a densidade: abaixo de ~96px o componente acalma a textura automaticamente (menos complexity, scale mais aberta) pra não virar ruído no topbar/inline — orbs grandes mantêm o standard cheio."
              />
              <PropRow
                prop="state"
                type='"idle" | "listening" | "thinking" | "responding" | "error"'
                def='"idle"'
                doc="Preset que dita todos os eixos do shader. Trocar a prop é o jeito canônico de animar o ciclo de pensamento."
              />
              <PropRow
                prop="speed"
                type="number"
                def="preset · 0.1"
                doc="Ritmo do shader. 0.05 = quase parado · 0.35 = turbulento · 1.0 = caótico. Standard do print é 0.1 (cromo respirando)."
              />
              <PropRow
                prop="color1"
                type="string (hex)"
                def='preset · "#ffffff"'
                doc="Primeira camada do mix. Standard B&W deixa em branco puro."
              />
              <PropRow
                prop="color2"
                type="string (hex)"
                def='preset · "#ffffff"'
                doc="Segunda camada — mistura no flow1. Standard idem branco para chrome líquido."
              />
              <PropRow
                prop="color3"
                type="string (hex)"
                def='preset · "#4f4f4f"'
                doc="Terceira camada — mistura no flow2 e modula o glow. É a cor que mais carrega o mood do estado."
              />
              <PropRow
                prop="scale"
                type="number"
                def="preset · 2.8 (eased ↓ p/ size pequeno)"
                doc="Zoom da malha. Maior = padrão mais largo / textura mais aberta. 2.8 é o standard do print; em orbs pequenos abre automaticamente pra textura ficar legível. Passar a prop sobrescreve o auto."
              />
              <PropRow
                prop="complexity"
                type="number (1–20)"
                def="preset · 8 (eased ↓ p/ size pequeno)"
                doc="Quantas iterações de domain warping rodam. Maior = malha mais intrincada. Custa GPU acima de ~12. Em orbs pequenos cai automaticamente (até ~4) pra não virar ruído; passar a prop sobrescreve o auto."
              />
              <PropRow
                prop="distortion"
                type="number"
                def="preset · 1.6"
                doc="Amplitude do warp em cada iteração. Maior = curvas mais dramáticas, fluxo menos linear."
              />
              <PropRow
                prop="glowIntensity"
                type="number"
                def="preset · 0"
                doc="Brilho radial somado ao centro. 0 mantém o cromo plano (standard). Use só pra estados que pedem atenção."
              />
              <PropRow
                prop="flowFrequency"
                type="number"
                def="preset · 2"
                doc="Frequência das ondas senoidais que misturam as cores. Maior = mais bandas por frame, ritmo mais staccato."
              />
              <PropRow
                prop="contrast"
                type="number"
                def="preset · 1.0"
                doc="Edge superior do smoothstep final. Menor = transições mais duras entre claro/escuro. Mantenha em 1.0 salvo casos específicos."
              />
              <PropRow
                prop="bg"
                type="string (hex)"
                def='preset · "#000000"'
                doc="Cor do canvas atrás do shader. Define a sensação de profundidade do hex — o standard é preto puro."
              />
            </ApiTable>

            <CodeExample label="usos canônicos" lang="tsx">
              {`import { AwCopilotOrb } from "@/components/ui/AwCopilotDrawer"

// 1. Topbar — sempre idle, 28px. Textura acalma sozinha nesse tamanho.
<AwCopilotOrb size={28} />

// 2. Painel do copilot — header em listening enquanto o usuário digita.
<AwCopilotOrb size={46} state="listening" />

// 3. Hero da página do agente — thinking durante a execução.
<AwCopilotOrb size={140} state="thinking" />

// 4. Debug / página de marca — override total com a API do Synthesis.
<AwCopilotOrb
  size={200}
  speed={0.1}
  color1="#ffffff"
  color2="#ffffff"
  color3="#4f4f4f"
  scale={2.8}
  complexity={8}
  distortion={1.6}
  glowIntensity={0}
  flowFrequency={2}
  contrast={1.0}
  bg="#000000"
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
                    <div key={s.key} className="flex flex-col items-center gap-2 text-[11px] text-(--fg-tertiary)">
                      <AwAgentCore src={agentCoreSrc(1)} alt={`Core ${s.label}`} size={s.px} />
                      <span className="mono">{s.label} · {s.px}px</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="aw-eyebrow">Agente do Usuário</div>
                <div className="flex flex-wrap items-end gap-6">
                  {SIZE_SCALE.map((s) => (
                    <div key={s.key} className="flex flex-col items-center gap-2 text-[11px] text-(--fg-tertiary)">
                      <AwUserAgentOrbStatic seed="agent-01" size={s.px} />
                      <span className="mono">{s.label} · {s.px}px</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="aw-eyebrow">Cortex</div>
                <div className="flex flex-wrap items-end gap-6">
                  {SIZE_SCALE.map((s) => (
                    <div key={s.key} className="flex flex-col items-center gap-2 text-[11px] text-(--fg-tertiary)">
                      <AwCopilotOrb size={s.px} />
                      <span className="mono">{s.label} · {s.px}px</span>
                    </div>
                  ))}
                </div>
              </div>
            </Stage>

            <div className="mt-6 rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
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
              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <AwAgentCore src={agentCoreSrc(3)} alt="Agent Core" size={48} />
                  <div>
                    <div className="text-sm font-medium text-(--fg-primary)">Agent Core</div>
                    <div className="caption">Infraestrutura proprietária</div>
                  </div>
                </div>
                <ul className="body-sm m-0 pl-4 list-disc flex flex-col gap-1 text-(--fg-secondary)">
                  <li>Catálogo de Cores disponíveis no workspace.</li>
                  <li>Indicador de qual Core está ativo numa execução.</li>
                  <li>Diagrama de arquitetura do agente do usuário.</li>
                  <li>Painel de configuração / créditos por Core.</li>
                </ul>
              </div>

              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <AwUserAgentOrbStatic seed="agent-03" size={48} />
                  <div>
                    <div className="text-sm font-medium text-(--fg-primary)">Agente do Usuário</div>
                    <div className="caption">Customizável pelo usuário</div>
                  </div>
                </div>
                <ul className="body-sm m-0 pl-4 list-disc flex flex-col gap-1 text-(--fg-secondary)">
                  <li>Avatar do agente na lista de agentes do workspace.</li>
                  <li>Identidade no header da conversa com o agente.</li>
                  <li>No fluxo de criação — ao lado do Agent Core escolhido.</li>
                  <li>Card do agente em compartilhamentos e logs.</li>
                </ul>
              </div>

              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <AwCopilotOrb size={48} />
                  <div>
                    <div className="text-sm font-medium text-(--fg-primary)">Cortex</div>
                    <div className="caption">Cérebro do sistema</div>
                  </div>
                </div>
                <ul className="body-sm m-0 pl-4 list-disc flex flex-col gap-1 text-(--fg-secondary)">
                  <li>Sempre presente no canto direito do topbar.</li>
                  <li>Header do drawer / painel do copilot.</li>
                  <li>Estado de raciocínio durante uma execução do agente.</li>
                  <li>Páginas que falam do “sistema nervoso” da plataforma.</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="As três peças coexistem na mesma tela. A combinação shape + tratamento (estático × animado) é a regra que separa cada categoria."
          >
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Spec
                k="Agent Core"
                v="diamante · colorido · estático"
                d="AwAgentCore — orb (PNG) recortado no diamante. 20 variantes proprietárias; a cor vem da arte, não de paleta gerada."
              />
              <Spec
                k="Agente do Usuário"
                v="círculo · colorido · animado"
                d="AwUserAgentOrb — círculo preenchido pelo shader Synthesis. Paleta seeded pelo id (uma hue própria; branco + 2 saturações)."
              />
              <Spec
                k="Cortex"
                v="hex sharp · WebGL"
                d="AwCopilotOrb (máscara SVG flat-top sharp + shader Synthesis em cromo líquido B&W). Único, sempre ativo, com state controlando o pensamento."
              />
              <Spec
                k="silhueta"
                v="diamante · círculo · hex"
                d="Shape codifica categoria: Core é diamante, Agente é círculo, Cortex é hex."
              />
              <Spec
                k="cor"
                v="arte · seeded · B&W"
                d="Core: cor da arte (PNG). Agente: paleta seeded pelo id. Cortex: cromo líquido B&W."
              />
              <Spec
                k="movimento"
                v="estático ↔ animado"
                d="Agent Core é PNG estático (selo). Agente do usuário e Cortex animam em WebGL (Synthesis)."
              />
            </div>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>
                  Renderize Cortex sempre via{" "}
                  <code className="mono">AwCopilotOrb</code> — assim a animação e
                  a máscara hex ficam consistentes em qualquer tamanho.
                </>,
                <>
                  Renderize Core via <code className="mono">AwAgentCore</code>
                  {" "}(PNG, diamante) e o agente do usuário via{" "}
                  <code className="mono">AwUserAgentOrb</code> (círculo animado,
                  seed = id do agente).
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
                  Não anime o Agent Core nem deixe o agente do usuário estático
                  — o movimento separa o framework (selo) do agente vivo.
                </>,
                <>
                  Não use o Cortex hex para representar um agente individual.
                  Ele é o cérebro, não um agente.
                </>,
                <>
                  Não escolha as cores do agente na mão fora da regra — deixe o
                  seed gerar (hue própria, contraste de saturação).
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
                  name: "Agent Core",
                  href: "/bombardier/styleguide/components/agent-core",
                  description:
                    "Subpágina técnica do AwAgentCore: galeria, tamanhos e API do diamante estático.",
                },
                {
                  name: "Agente do Usuário",
                  href: "/bombardier/styleguide/components/user-agent",
                  description:
                    "Subpágina técnica do AwUserAgentOrb: shader, seed de cor e estados do agente vivo.",
                },
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
