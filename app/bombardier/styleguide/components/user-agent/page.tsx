import {
  AwUserAgentOrb,
  AwUserAgentOrbStatic,
} from "@/components/ui/AwUserAgentOrb"
import { AwAgentAvatar } from "@/components/ui/AwAgentAvatar"
import { agentCoreSrc } from "@/components/ui/AwAgentCore"
import { agentCorePalette } from "@/lib/agent-core-palette"
import { type UserAgentState } from "@/lib/user-agent-presets"
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

const seedOf = (i: number) => `agent-${String(i + 1).padStart(2, "0")}`

// Live WebGL budget for this page (~16 contexts max on Chrome): FAMILY(3) +
// STATES(5) + SIZE_SCALE(5) + estatico(1) + avatar hero(1) = 15. Keep these
// loops small — each live AwUserAgentOrb / animated AwAgentAvatar is 1 context.
const FAMILY = Array.from({ length: 3 }, (_, i) => seedOf(i))

// Color-rule gallery uses the *static* variant (no WebGL), so it can show many.
const RULE_SAMPLE = Array.from({ length: 12 }, (_, i) => seedOf(i))

const SIZE_SCALE = [
  { key: "xs", px: 20, note: "Inline em chips, breadcrumbs, listas densas." },
  { key: "sm", px: 28, note: "Avatar em linhas de tabela e dropdowns." },
  { key: "md", px: 40, note: "Cards de lista, item ativo na sidebar." },
  { key: "lg", px: 64, note: "Header da conversa com o agente." },
  { key: "xl", px: 120, note: "Hero da página do agente, onboarding." },
] as const

const STATES: Array<{
  state: UserAgentState
  label: string
  trigger: string
  feel: string
}> = [
  {
    state: "idle",
    label: "Idle / Normal",
    trigger: "Sem tarefa ativa — agente em repouso.",
    feel: "Respiração lenta, glow calmo. O look padrão.",
  },
  {
    state: "thinking",
    label: "Thinking",
    trigger: "Processando / raciocinando.",
    feel: "Acelera + ganha turbulência e glow, varre o espectro de hue (arco-íris) e a forma morpha — círculo ↔ quadrado girando suave.",
  },
  {
    state: "responding",
    label: "Responding",
    trigger: "Gerando a resposta (streaming).",
    feel: "Vivo mas fluido; o glow pulsa um pouco acima do normal. Mantém a cor.",
  },
  {
    state: "paused",
    label: "Paused",
    trigger: "Suspenso pelo usuário.",
    feel: "Quase congelado (speed 0.04), glow baixo e vai pra grayscale — sinaliza suspenso.",
  },
  {
    state: "error",
    label: "Error",
    trigger: "Falhou ou execução abortada.",
    feel: "Lento, grayscale com um vermelho contido (menos red) — pede atenção sem gritar.",
  },
]

const RULE_PILLARS: Array<{ label: string; tag: string; feel: string }> = [
  {
    label: "Hue = identidade",
    tag: "ângulo áureo",
    feel: "Cada agente tem uma hue própria, distribuída por ângulo áureo pelo seed — a família sai distinta, sem aglomerar numa cor.",
  },
  {
    label: "Zona de hue",
    tag: "drift pequeno",
    feel: "color2 e color3 ficam na mesma vizinhança de hue. O agente lê como UMA cor coerente — nunca duas que clasham.",
  },
  {
    label: "Contraste de saturação",
    tag: "viva ↔ suave",
    feel: "color3 é a viva e domina o fluxo + glow; color2 é a mesma hue mais suave. As duas brilhantes.",
  },
  {
    label: "color1 = branco",
    tag: "#ffffff fixo",
    feel: "Sempre branco — a camada de brilho do fluxo líquido. Não é prop, não varia.",
  },
]

function Swatch({ hex, label }: { hex: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-block w-4 h-4 rounded-sm border border-[var(--border-subtle)]"
        style={{ backgroundColor: hex }}
      />
      <code className="mono text-[11px] text-[var(--fg-tertiary)]">
        {hex}
        {label ? ` · ${label}` : ""}
      </code>
    </span>
  )
}

export default function UserAgentPage() {
  return (
    <>
      <PageHero title="Agente do Usuário">
        Qualquer agente que o usuário cria dentro da plataforma. É representado
        por um <strong>círculo</strong> com <strong>textura animada</strong> —
        o shader <code className="mono">Synthesis</code> (
        <code className="mono">@react-three/fiber</code>), o mesmo motor do
        Cortex. Ao criar o agente, o usuário escolhe um{" "}
        <a
          className="underline text-[var(--aw-blue-700)]"
          href="/bombardier/styleguide/components/agent-core"
        >
          Agent Core
        </a>{" "}
        (o framework, em diamante) — os dois trabalham juntos. A cor segue a
        regra: <strong>color1 sempre branco</strong>; cada agente tem uma{" "}
        <strong>hue própria</strong> e color2/color3 ficam na mesma zona de hue,
        variando só na saturação — uma viva, a outra suave, as duas brilhantes.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>
              Represente um <strong>agente criado pelo usuário</strong> — o
              avatar vivo dele na plataforma.
            </>,
            <>
              Use <code className="mono">AwUserAgentOrb</code> (animado) em
              heros, header da conversa e identidade do agente.
            </>,
            <>
              Use <code className="mono">AwUserAgentOrbStatic</code> em listas,
              tabelas e pickers — onde abrir dezenas de canvas WebGL é inviável.
            </>,
          ]}
          dontUse={[
            <>
              Para o <strong>Agent Core</strong> (framework) — esse é o diamante
              estático (<code className="mono">AwAgentCore</code>).
            </>,
            <>
              Para o <strong>Cortex</strong> (cérebro) — esse é o hex via{" "}
              <code className="mono">AwCopilotOrb</code>.
            </>,
            <>
              Sobrescrevendo <code className="mono">color1</code> — a regra fixa
              ele em branco. Só color2/color3 variam.
            </>,
          ]}
        />

        <Toc
          items={[
            { id: "biblioteca", label: "Biblioteca" },
            { id: "estados", label: "Estados" },
            { id: "regra-cor", label: "Regra de cor" },
            { id: "tamanhos", label: "Tamanhos" },
            { id: "estatico", label: "Estático vs animado" },
            { id: "avatar", label: "Agente + Core" },
            { id: "anatomia", label: "Anatomia" },
            { id: "controles", label: "Controles" },
            { id: "do-dont", label: "Do / Don't" },
            { id: "related", label: "Relacionados" },
          ]}
        />

        <Section
          id="biblioteca"
          title="Exemplos de agentes"
          lead="Cada agente recebe uma paleta estável a partir do seu seed (id/nome). Mesmo seed → mesmas cores, sempre — identidade fixa, sem flicker, SSR-safe. Estes três estão animando ao vivo (a variedade completa de cores está na galeria da Regra de cor)."
        >
          <Stage
            label="AwUserAgentOrb · ao vivo"
            hint="Círculo preenchido pelo shader Synthesis. color1 branco; color2/color3 vêm do seed."
            gridClassName="grid grid-cols-3 sm:grid-cols-6 gap-6 place-items-center"
          >
            {FAMILY.map((seed) => (
              <div
                key={seed}
                className="flex flex-col items-center gap-2 text-[11px] text-[var(--fg-tertiary)]"
              >
                <AwUserAgentOrb seed={seed} size={96} />
                <span className="mono">{seed}</span>
              </div>
            ))}
          </Stage>
        </Section>

        <Section
          id="estados"
          title="Estados"
          lead="O agente muda de estado conforme o que está fazendo — trocar a prop state já anima a transição. idle/responding mantêm a cor do agente; thinking varre todo o espectro de hue (arco-íris) e ainda morpha a forma (círculo ↔ quadrado, girando suave); paused fica grayscale e quase congela; error fica grayscale com um vermelho contido."
        >
          <Stage
            label="state · idle | thinking | responding | paused | error"
            hint="Mesmo agente (azul, seed agent-04) em cada estado, animando ao vivo. Observe ritmo, glow, cor e — no thinking — a forma."
            gridClassName="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5"
          >
            {STATES.map((s) => (
              <div key={s.state} className="flex flex-col gap-3">
                <div className="flex items-center justify-center py-2">
                  <AwUserAgentOrb seed="agent-04" state={s.state} size={104} />
                </div>
                <div className="flex flex-col gap-1">
                  <code className="mono text-[11px] text-[var(--aw-blue-700)]">
                    state=&quot;{s.state}&quot;
                  </code>
                  <div className="text-sm font-medium text-[var(--fg-primary)]">
                    {s.label}
                  </div>
                  <p className="caption m-0">
                    <strong className="text-[var(--fg-secondary)]">Dispara:</strong>{" "}
                    {s.trigger}
                  </p>
                  <p className="caption m-0">
                    <strong className="text-[var(--fg-secondary)]">Sensação:</strong>{" "}
                    {s.feel}
                  </p>
                </div>
              </div>
            ))}
          </Stage>

          <CodeExample label="trocar de estado" lang="tsx">
            {`// Anima o ciclo do agente — só troca a prop \`state\`.
<AwUserAgentOrb seed={agent.id} state="thinking" size={96} />

// idle (normal) | thinking | responding | paused | error`}
          </CodeExample>
        </Section>

        <Section
          id="regra-cor"
          title="Regra de cor"
          lead="O que mantém os agentes bonitos e distintos: a variação é só em hue + saturação, nunca cor 100% aleatória. Cada agente é UMA hue (espalhada pela família por ângulo áureo); dentro dela, color3 é viva e color2 é suave, as duas brilhantes. color1 é sempre branco."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {RULE_PILLARS.map((s) => (
              <div
                key={s.label}
                className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-4 flex flex-col gap-1"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <div className="text-sm font-medium text-[var(--fg-primary)]">
                    {s.label}
                  </div>
                  <code className="mono text-[11px] text-[var(--aw-blue-700)] whitespace-nowrap">
                    {s.tag}
                  </code>
                </div>
                <p className="caption m-0">{s.feel}</p>
              </div>
            ))}
          </div>

          <Stage
            label="seed → paleta (color1 branco fixo)"
            hint="Círculos estáticos (AwUserAgentOrbStatic) pra mostrar muitos sem custo de WebGL. Repare: cada agente é uma hue distinta, e dentro dele color2/color3 são a mesma hue — só muda a saturação."
            gridClassName="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {RULE_SAMPLE.map((seed) => {
              const p = agentCorePalette(seed)
              return (
                <div
                  key={seed}
                  className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3"
                >
                  <AwUserAgentOrbStatic seed={seed} size={44} />
                  <div className="flex flex-col gap-1 min-w-0">
                    <code className="mono text-[11px] text-[var(--fg-secondary)] truncate">
                      {seed} · {p.hue}°
                    </code>
                    <Swatch hex={p.color2} label={`S${p.sat2} suave`} />
                    <Swatch hex={p.color3} label={`S${p.sat3} viva`} />
                  </div>
                </div>
              )
            })}
          </Stage>

          <CodeExample label="gerando a paleta" lang="tsx">
            {`import { agentCorePalette } from "@/lib/agent-core-palette"

// Determinístico: mesmo seed → mesma paleta (estável + SSR-safe).
// O dígito final do seed ("agent-03" → 3) é o índice que espalha a hue.
const { color1, color2, color3, hue } = agentCorePalette("agent-03")
// color1 === "#ffffff"   (branco fixo)
// color2  = mesma hue, mais suave   → companion
// color3  = mesma hue, viva         → domina flow + glow

// O componente já faz isso internamente — basta o seed:
<AwUserAgentOrb seed="agent-03" size={96} />`}
          </CodeExample>
        </Section>

        <Section
          id="tamanhos"
          title="Tamanhos"
          lead="Mesma escala canônica dos outros visuais de agente (xs/sm/md/lg/xl). Abaixo de ~96px a textura se acalma sozinha (menos complexity, scale mais aberta) pra não virar ruído."
        >
          <Stage
            label="escala · xs → xl"
            hint="Todos animando ao vivo. Abaixo de ~96px a textura se acalma sozinha pra não virar ruído. Mesmo seed pra comparar só o tamanho."
            gridClassName="flex flex-wrap items-end gap-8"
          >
            {SIZE_SCALE.map((s) => (
              <div
                key={s.key}
                className="flex flex-col items-center gap-2 text-[11px] text-[var(--fg-tertiary)]"
              >
                <AwUserAgentOrb seed="agent-04" size={s.px} />
                <span className="mono">
                  {s.key} · {s.px}px
                </span>
              </div>
            ))}
          </Stage>

          <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
            {SIZE_SCALE.map((s) => (
              <Spec key={s.key} k={s.key} v={`${s.px}px`} d={s.note} />
            ))}
          </div>
        </Section>

        <Section
          id="estatico"
          title="Estático vs animado"
          lead="Cada AwUserAgentOrb ao vivo é um contexto WebGL — e o navegador limita ~16 por página. Em qualquer grid/lista/picker use a variante estática; reserve a animada para focos individuais. Pra não destoar do animado, o estático não é um gradiente linear de 2 cores — é um gradient mesh."
        >
          <Stage
            label="AwUserAgentOrb (ao vivo) · AwUserAgentOrbStatic (CSS)"
            hint="Mesma silhueta e mesma paleta seeded. O estático usa um gradient mesh (vários radiais: highlight branco + viva + recessos profundos + um vizinho de hue) pra puxar o espectro pra perto do animado."
            gridClassName="flex flex-wrap items-center gap-10"
          >
            <div className="flex flex-col items-center gap-2 text-[11px] text-[var(--fg-tertiary)]">
              <AwUserAgentOrb seed="agent-02" size={88} />
              <span className="mono">animado · WebGL</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-[11px] text-[var(--fg-tertiary)]">
              <AwUserAgentOrbStatic seed="agent-02" size={88} />
              <span className="mono">estático · CSS</span>
            </div>
          </Stage>

          <CodeExample label="quando usar cada um" lang="tsx">
            {`// Foco individual (hero, header da conversa) → animado:
<AwUserAgentOrb seed={agent.id} size={120} />

// Densidade (lista de agentes, tabela, picker) → estático, sem custo de GPU:
{agents.map((a) => <AwUserAgentOrbStatic key={a.id} seed={a.id} size={28} />)}`}
          </CodeExample>
        </Section>

        <Section
          id="avatar"
          title="Agente + Core"
          lead="O agente roda em cima de um Agent Core — e a gente mostra isso como um avatar + 'status dot': o círculo do agente com o Core (diamante) preso na ponta inferior direita. Bate o olho e sabe qual framework cada agente usa. Componente: AwAgentAvatar."
        >
          <Stage
            label="AwAgentAvatar · círculo do agente + Core no canto inferior direito"
            hint="Hero ao vivo + exemplos estáticos (densidade). O diamante é o Core que o agente escolheu na criação."
            gridClassName="flex flex-col gap-10"
          >
            <div className="flex flex-wrap items-end gap-10">
              <div className="flex flex-col items-center gap-2 text-[11px] text-[var(--fg-tertiary)]">
                <AwAgentAvatar
                  agentSeed="agent-04"
                  coreSrc={agentCoreSrc(3)}
                  coreAlt="Core 03"
                  size={132}
                  animated={true}
                />
                <span className="mono">ao vivo · agente azul + Core 03</span>
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-8">
              {[
                { a: "agent-01", c: 5 },
                { a: "agent-02", c: 11 },
                { a: "agent-08", c: 2 },
                { a: "agent-12", c: 17 },
                { a: "agent-06", c: 9 },
              ].map(({ a, c }) => (
                <div
                  key={a}
                  className="flex flex-col items-center gap-2 text-[11px] text-[var(--fg-tertiary)]"
                >
                  <AwAgentAvatar
                    agentSeed={a}
                    coreSrc={agentCoreSrc(c)}
                    coreAlt={`Core ${String(c).padStart(2, "0")}`}
                    animated={false}
                    size={76}
                  />
                  <span className="mono">
                    {a} · Core {String(c).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>
          </Stage>

          <CodeExample label="avatar com o Core" lang="tsx">
            {`import { AwAgentAvatar } from "@/components/ui/AwAgentAvatar"
import { agentCoreSrc } from "@/components/ui/AwAgentCore"

// O agente (círculo animado) + o Core que ele usa (diamante, no canto):
<AwAgentAvatar agentSeed={agent.id} coreSrc={agentCoreSrc(agent.coreId)} size={72} />

// Em listas/tabelas, sem custo de GPU:
<AwAgentAvatar agentSeed={agent.id} coreSrc={agentCoreSrc(agent.coreId)} animated={false} size={32} />`}
          </CodeExample>
        </Section>

        <Section
          id="anatomia"
          title="Anatomia"
          lead="Círculo simples (border-radius total) sobre o canvas do Synthesis. A silhueta redonda é o que separa o agente do usuário do Core (diamante) e do Cortex (hex). (Preview estático aqui por orçamento de WebGL — o fill real é o shader.)"
        >
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-8">
            <div className="flex items-center justify-center">
              <AwUserAgentOrbStatic seed="agent-01" size={140} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Spec
                k="silhueta"
                v="círculo"
                d="border-radius total + overflow-hidden. Codifica a categoria agente do usuário."
              />
              <Spec
                k="fill"
                v="shader Synthesis"
                d="@react-three/fiber via AwCortexSynthesis — o mesmo motor do Cortex."
              />
              <Spec
                k="color1"
                v="#ffffff (fixo)"
                d="Camada de brilho do fluxo. Nunca muda — não é prop."
              />
              <Spec
                k="color2 · color3"
                v="mesma hue · S diferente"
                d="Mesma zona de hue; color3 viva (alta S), color2 suave. As duas brilhantes. Vêm do seed."
              />
            </div>
          </div>
        </Section>

        <Section
          id="controles"
          title="Controles"
          lead="No uso normal basta o seed e o size — a paleta sai pronta. Os eixos do shader ficam expostos só para debug, marca ou prototipagem. color1 não é prop: a regra o fixa em branco."
        >
          <ApiTable>
            <PropRow
              prop="seed"
              type="string | number"
              def='"agent"'
              doc="Identidade estável da paleta. Mesmo seed → mesmas cores (SSR-safe). Passe o id/nome do agente."
            />
            <PropRow
              prop="state"
              type='"idle" | "thinking" | "responding" | "paused" | "error"'
              def='"idle"'
              doc="O que o agente está fazendo — ajusta a animação (speed/glow/turbulência). idle = normal; error vira vermelho. A hue do agente persiste nos demais."
            />
            <PropRow
              prop="size"
              type="number"
              def="64"
              doc="Diâmetro em px. Abaixo de ~96px a textura se acalma automaticamente."
            />
            <PropRow
              prop="color2"
              type="string (hex)"
              def="seed"
              doc="Override da cor companion (mesma hue, mais suave). Sem isso, vem do seed. Use só pra debug/branding."
            />
            <PropRow
              prop="color3"
              type="string (hex)"
              def="seed"
              doc="Override da cor viva / hero (domina o flow + modula o glow). Sem isso, vem do seed."
            />
            <PropRow
              prop="speed"
              type="number"
              def="0.22"
              doc="Ritmo do fluxo. Mais alto = mais turbulento."
            />
            <PropRow
              prop="scale"
              type="number"
              def="2.2 (eased ↓ p/ size pequeno)"
              doc="Zoom da malha. Maior = textura mais aberta."
            />
            <PropRow
              prop="complexity"
              type="number (1–20)"
              def="8 (eased ↓ p/ size pequeno)"
              doc="Iterações de domain warping. Custa GPU acima de ~12."
            />
            <PropRow
              prop="distortion"
              type="number"
              def="0.6 (eased ↓ p/ size pequeno)"
              doc="Amplitude do warp por iteração. Baixo = fluxo mais suave."
            />
            <PropRow
              prop="glowIntensity"
              type="number"
              def="1.15"
              doc="Brilho radial somado ao centro — faz a cor viva (color3) florescer no meio do orb."
            />
            <PropRow
              prop="flowFrequency"
              type="number"
              def="2"
              doc="Frequência das ondas que misturam as cores."
            />
            <PropRow
              prop="contrast"
              type="number"
              def="1.15"
              doc="Edge superior do smoothstep final. Menor = transições mais duras."
            />
          </ApiTable>

          <p className="caption mt-4">
            <code className="mono">AwUserAgentOrbStatic</code> aceita só{" "}
            <code className="mono">seed</code>, <code className="mono">size</code>{" "}
            e <code className="mono">className</code> — sem eixos de shader, já
            que é puro CSS.
          </p>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>
                Passe um <code className="mono">seed</code> estável (id do agente)
                — assim a cor vira identidade fixa daquele agente.
              </>,
              <>
                Troque para <code className="mono">AwUserAgentOrbStatic</code> em
                grids e listas; mantenha o animado em focos individuais.
              </>,
              <>
                Deixe <code className="mono">color1</code> em branco — é o que dá
                o aspecto de fluxo líquido de alto brilho.
              </>,
              <>
                Embrulhe com rótulo/nome do agente quando o usuário precisar
                identificá-lo; o orb é decorativo (<code className="mono">aria-hidden</code>).
              </>,
            ]}
            donts={[
              <>
                Não renderize dezenas de <code className="mono">AwUserAgentOrb</code>{" "}
                ao vivo na mesma tela — estoura o limite de contextos WebGL.
              </>,
              <>
                Não escolha color2/color3 na mão fora da regra — cores cruas
                clasham e quebram a coesão da família.
              </>,
              <>
                Não use o círculo para Agent Core (diamante) nem para Cortex
                (hex). A silhueta é o que codifica a categoria.
              </>,
              <>
                Não anime o seed (trocar a cada frame) — vira flicker e perde a
                identidade do agente.
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
                  "O framework proprietário (diamante estático) que o usuário escolhe ao criar o agente. Os dois andam juntos.",
              },
              {
                name: "Visual dos agentes",
                href: "/bombardier/styleguide/components/agents",
                description:
                  "A linguagem completa: Agent Core (diamante), Agente do Usuário (círculo) e Cortex (hex).",
              },
              {
                name: "Foundation · Gradient",
                href: "/bombardier/styleguide/foundation/gradient",
                description: "Os gradientes que codificam IA na plataforma.",
              },
            ]}
          />
        </Section>
      </div>
    </>
  )
}
