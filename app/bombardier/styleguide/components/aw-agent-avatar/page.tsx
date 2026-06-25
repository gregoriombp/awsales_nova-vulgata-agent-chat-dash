import { AwAgentAvatar } from "@/components/ui/AwAgentAvatar"
import { agentCoreSrc } from "@/components/ui/AwAgentCore"
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
  StatesMatrix,
  Tldr,
  Toc,
  TokensConsumed,
} from "../../_primitives"

// Variantes — vários seeds + Cores. renderer="css" (zero WebGL) pra não
// estourar o orçamento de contextos da página.
const VARIANTS: Array<{ seed: string; n: number }> = [
  { seed: "agent-01", n: 1 },
  { seed: "agent-04", n: 4 },
  { seed: "agent-07", n: 7 },
  { seed: "agent-09", n: 9 },
]

const STATES: UserAgentState[] = ["idle", "responding", "paused"]

const SIZES = [48, 72, 96] as const

// Mock de linhas de agente — composição em lista.
const AGENT_ROWS: Array<{ name: string; role: string; seed: string; n: number }> = [
  { name: "Agente de Vendas", role: "roda no Core 5", seed: "agent-05", n: 5 },
  { name: "Agente de Suporte", role: "roda no Core 7", seed: "agent-07", n: 7 },
  { name: "Agente de Onboarding", role: "roda no Core 3", seed: "agent-03", n: 3 },
]

export default function AgentAvatarPage() {
  return (
    <>
      <PageHero title="Agent avatar">
        O jeito canônico de mostrar em cima de qual Core um agente roda: o
        círculo vivo é o <strong>agente</strong>, o diamante preso no canto é o{" "}
        <strong>Core</strong> (o framework). Igual foto de perfil + status dot —
        bate o olho e sabe qual framework cada agente usa.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>
              Representar um <strong>agente do usuário + o Core dele</strong> em
              listas, headers de conversa e cards de agente.
            </>,
            <>
              Mostrar de relance <strong>qual framework</strong> um agente
              escolheu na criação — o diamante no canto é o Core.
            </>,
          ]}
          dontUse={[
            <>
              Como avatar genérico de pessoa/entidade — pra isso existe o{" "}
              <code className="mono">Avatar</code>.
            </>,
            <>
              Em grids ultra-densos com muitos orbs WebGL ao vivo — reduza a
              amostra ou passe <code className="mono">renderer=&quot;css&quot;</code>{" "}
              (cada orb WebGL é um contexto, e o navegador limita ~16 por
              página).
            </>,
          ]}
        />

        <Toc
          items={[
            { id: "anatomia", label: "Anatomia" },
            { id: "variantes", label: "Variantes" },
            { id: "estados", label: "Estados" },
            { id: "tamanhos", label: "Tamanhos" },
            { id: "renderer", label: "Renderer" },
            { id: "composicao", label: "Composição" },
            { id: "api", label: "API" },
            { id: "tokens", label: "Tokens" },
            { id: "do-dont", label: "Do / Don't" },
            { id: "related", label: "Relacionados" },
          ]}
        />

        <Section
          id="anatomia"
          title="Anatomia"
          lead="O orb do agente (círculo, cor semeada pelo agentSeed) com o badge do Core (diamante) preso no canto inferior direito, exatamente como uma foto de perfil + status dot. Um leve overhang e um rim (--bg-canvas) atrás do diamante separam o badge do orb."
        >
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-8">
            <div className="flex items-center justify-center">
              <AwAgentAvatar
                size={120}
                renderer="webgl"
                coreSrc={agentCoreSrc(3)}
                agentSeed="agent-03"
                coreAlt="Core 03"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Spec
                k="orb"
                v="AwUserAgentOrb"
                d="Círculo animado, cor semeada por agentSeed. É o agente do usuário."
              />
              <Spec
                k="badge Core"
                v="AwAgentCore (diamante)"
                d="PNG do Core clipado em diamante, ~42% do size. É o framework."
              />
              <Spec
                k="rim"
                v="var(--bg-canvas)"
                d="Anel atrás do diamante que separa o badge do orb — como o anel de um status dot."
              />
              <Spec
                k="overhang"
                v="canto inferior direito"
                d="Overhang leve (~4% do size) — o badge transborda um pouco a borda do orb."
              />
            </div>
          </div>
        </Section>

        <Section
          id="variantes"
          title="Variantes"
          lead="Cada agente recebe uma paleta estável a partir do agentSeed (id/nome). Mesmo seed → mesmas cores, sempre. Abaixo, quatro seeds com Cores diferentes — todos em renderer='css' pra não custar contexto WebGL."
        >
          <Stage
            label="AwAgentAvatar · seeds + Cores variados"
            hint="renderer='css' — animado por transform, zero WebGL. O diamante é o Core que cada agente escolheu."
            gridClassName="grid grid-cols-2 sm:grid-cols-4 gap-8 place-items-center"
          >
            {VARIANTS.map(({ seed, n }) => (
              <div
                key={seed}
                className="flex flex-col items-center gap-2 text-[11px] text-(--fg-tertiary)"
              >
                <AwAgentAvatar
                  size={72}
                  renderer="css"
                  coreSrc={agentCoreSrc(n)}
                  agentSeed={seed}
                  coreAlt={`Core ${String(n).padStart(2, "0")}`}
                />
                <span className="mono">
                  {seed} · Core {String(n).padStart(2, "0")}
                </span>
              </div>
            ))}
          </Stage>
        </Section>

        <Section
          id="estados"
          title="Estados"
          lead="O state é repassado ao orb e anima o ciclo do agente — idle/responding mantêm a cor; paused fica grayscale e quase congela. Em avatares pequenos, prefira idle/responding."
        >
          <StatesMatrix
            columns={3}
            states={[
              ...STATES.map((s) => ({
                name: `state="${s}"`,
                node: (
                  <AwAgentAvatar
                    size={72}
                    renderer="css"
                    state={s}
                    coreSrc={agentCoreSrc(5)}
                    agentSeed="agent-05"
                    coreAlt="Core 05"
                  />
                ),
                note:
                  s === "idle"
                    ? "Repouso — respiração lenta, glow calmo. O look padrão."
                    : s === "responding"
                      ? "Gerando resposta — vivo mas fluido, o glow pulsa acima do normal."
                      : "Suspenso pelo usuário — quase congela e vira grayscale.",
              })),
              {
                name: "nota · thinking",
                node: (
                  <div className="caption text-(--fg-secondary) text-center">
                    Em tamanhos pequenos, o morph de{" "}
                    <code className="mono">thinking</code> pode aparecer num
                    canto ao lado do badge (o orb gira sob o diamante fixo).
                    Prefira <code className="mono">idle</code>/
                    <code className="mono">responding</code> em avatares
                    pequenos, ou aumente o <code className="mono">size</code>.
                  </div>
                ),
              },
            ]}
          />
        </Section>

        <Section
          id="tamanhos"
          title="Tamanhos"
          lead="O badge do Core escala junto com o orb (~42% do size) — basta passar o size em px. O rim e o overhang acompanham."
        >
          <Stage
            label="size · 48 / 72 / 96"
            hint="Mesmo agente e Core, só o size muda. renderer='css' pra não custar contexto WebGL."
            gridClassName="flex flex-wrap items-end gap-10"
          >
            {SIZES.map((px) => (
              <div
                key={px}
                className="flex flex-col items-center gap-2 text-[11px] text-(--fg-tertiary)"
              >
                <AwAgentAvatar
                  size={px}
                  renderer="css"
                  coreSrc={agentCoreSrc(7)}
                  agentSeed="agent-07"
                  coreAlt="Core 07"
                />
                <span className="mono">{px}px</span>
              </div>
            ))}
          </Stage>
        </Section>

        <Section
          id="renderer"
          title="Renderer"
          lead="O renderer é repassado ao orb. 'webgl' (default) usa o shader Synthesis — um contexto WebGL vivo por instância, ideal pra um hero ou dois. 'css' anima o mesmo mesh por transform, sem nenhum contexto WebGL — use em listas e grids densos. O navegador corta em ~16 contextos WebGL por página, então reserve 'webgl' pra uma ou duas instâncias de destaque."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Stage
              label='renderer="webgl" (default)'
              hint="Shader Synthesis — contexto WebGL vivo. Reserve pra hero / momentos de identidade."
            >
              <AwAgentAvatar
                size={120}
                renderer="webgl"
                coreSrc={agentCoreSrc(9)}
                agentSeed="agent-09"
                coreAlt="Core 09"
              />
            </Stage>
            <Stage
              label='renderer="css"'
              hint="Mesmo seed, mesmas cores — animado por transform, zero WebGL. Use em listas densas."
            >
              <AwAgentAvatar
                size={120}
                renderer="css"
                coreSrc={agentCoreSrc(9)}
                agentSeed="agent-09"
                coreAlt="Core 09"
              />
            </Stage>
          </div>
        </Section>

        <Section
          id="composicao"
          title="Composição"
          lead="O padrão em lista: avatar pequeno (renderer='css') + nome do agente + o papel/Core que ele roda. Encaixa em pickers, sidebars e linhas de gerenciamento de agentes."
        >
          <Stage
            label="Linhas de agente (uso real)"
            hint="size=40 + renderer='css' — denso e sem custo de WebGL."
            gridClassName="flex flex-col gap-2"
          >
            {AGENT_ROWS.map(({ name, role, seed, n }) => (
              <div
                key={seed}
                className="flex w-full max-w-[420px] items-center gap-3 rounded-md border border-(--border-subtle) bg-(--bg-surface) p-2.5"
              >
                <AwAgentAvatar
                  size={40}
                  renderer="css"
                  coreSrc={agentCoreSrc(n)}
                  agentSeed={seed}
                  coreAlt={`Core ${String(n).padStart(2, "0")}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-(--fg-primary)">
                    {name}
                  </div>
                  <div className="text-xs text-(--fg-tertiary)">{role}</div>
                </div>
              </div>
            ))}
          </Stage>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwAgentAvatar } from "@/components/ui/AwAgentAvatar" + import { agentCoreSrc } from "@/components/ui/AwAgentCore".`}
        >
          <ApiTable>
            <PropRow
              prop="agentSeed"
              type="string | number"
              def='"agent"'
              doc="Seed da paleta do orb (id/nome do agente). Mesmo seed → mesmas cores (SSR-safe)."
            />
            <PropRow
              prop="coreSrc"
              type="string"
              doc="PNG do Core — use agentCoreSrc(n), n de 1 a 20. Obrigatório."
            />
            <PropRow
              prop="coreAlt"
              type="string"
              def='""'
              doc="Texto alternativo do badge do Core."
            />
            <PropRow
              prop="state"
              type='"idle" | "thinking" | "responding" | "paused" | "error"'
              def='"idle"'
              doc="Repassado ao orb — anima o ciclo do agente. Em avatares pequenos, prefira idle/responding."
            />
            <PropRow
              prop="size"
              type="number"
              def="72"
              doc="Diâmetro do círculo do agente em px. O badge do Core escala junto (~42% do size)."
            />
            <PropRow
              prop="renderer"
              type='"webgl" | "css"'
              def='"webgl"'
              doc="Repassado ao orb. webgl = contexto vivo (hero); css = sem WebGL, pra listas/grids densos."
            />
            <PropRow
              prop="className"
              type="string"
              doc="Classe extra no wrapper do avatar."
            />
          </ApiTable>

          <CodeExample label="avatar com o Core" lang="tsx">{`import { AwAgentAvatar } from "@/components/ui/AwAgentAvatar"
import { agentCoreSrc } from "@/components/ui/AwAgentCore"

// O agente (círculo animado) + o Core que ele usa (diamante, no canto):
<AwAgentAvatar agentSeed={agent.id} coreSrc={agentCoreSrc(agent.coreId)} size={72} />

// Em listas / grids densos — sem custo de WebGL:
<AwAgentAvatar
  agentSeed={agent.id}
  coreSrc={agentCoreSrc(agent.coreId)}
  size={40}
  renderer="css"
/>`}</CodeExample>
        </Section>

        <Section
          id="tokens"
          title="Tokens consumidos"
          lead="No chrome do próprio avatar, só um token: o rim atrás do badge do Core. As cores do orb vêm da paleta semeada pelo agentSeed (não são tokens de tema)."
        >
          <TokensConsumed
            tokens={[
              {
                token: "--bg-canvas",
                role: "rim (anel) atrás do badge Core, separando o diamante do orb",
                value: "var(--bg-canvas)",
              },
            ]}
          />
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>
                Passe um <code className="mono">agentSeed</code> estável (id do
                agente) — a cor vira identidade fixa daquele agente.
              </>,
              <>
                Em listas e grids, use{" "}
                <code className="mono">renderer=&quot;css&quot;</code> — anima
                sem nenhum contexto WebGL.
              </>,
              <>
                Reserve <code className="mono">renderer=&quot;webgl&quot;</code>{" "}
                pra uma ou duas instâncias de destaque (hero, header da
                conversa).
              </>,
            ]}
            donts={[
              <>
                Não use como avatar genérico de pessoa — pra isso existe o{" "}
                <code className="mono">Avatar</code>.
              </>,
              <>
                Não encha a tela de{" "}
                <code className="mono">renderer=&quot;webgl&quot;</code> — cada
                orb é um contexto e o navegador corta em ~16 por página.
              </>,
              <>
                Não use <code className="mono">state=&quot;thinking&quot;</code>{" "}
                em avatares pequenos — o morph pode espiar num canto ao lado do
                badge.
              </>,
            ]}
          />
        </Section>

        <Section id="related" title="Relacionados">
          <RelatedLinks
            items={[
              {
                name: "Agente do usuário",
                href: "/bombardier/styleguide/components/user-agent",
                description: "O orb do agente (AwUserAgentOrb) e seus estados.",
              },
              {
                name: "Agent Core",
                href: "/bombardier/styleguide/components/agent-core",
                description: "O diamante do Core (AwAgentCore).",
              },
              {
                name: "Avatar",
                href: "/bombardier/styleguide/components/aw-avatar",
                description: "Avatar genérico de pessoa/entidade.",
              },
            ]}
          />
        </Section>
      </div>
    </>
  )
}
