import { AwButton } from "@/components/ui/AwButton"
import {
  PageHero,
  Section,
  Spec,
  Tldr,
  Toc,
  CodeExample,
  DoDont,
  RelatedLinks,
} from "../../_primitives"

const TOC = [
  { id: "principles", label: "Princípios" },
  { id: "palette", label: "Paleta iridescente" },
  { id: "patterns", label: "Três padrões" },
  { id: "context", label: "Em contexto" },
  { id: "code", label: "Em código" },
  { id: "accessibility", label: "Acessibilidade" },
  { id: "do-dont", label: "Do / Don't" },
  { id: "related", label: "Veja também" },
]

const PALETTE = [
  {
    role: "Início (frio)",
    token: "--aw-blue-400",
    hex: "#8FB8FF",
    intent: "Origem do gradient. A 'voz da IA' começa em azul.",
  },
  {
    role: "Fundo (frio claro)",
    token: "--aw-blue-300",
    hex: "#B8D4FF",
    intent: "Linear base do filled gradient. Mais claro pra dar luminosidade.",
  },
  {
    role: "Transição (neutro)",
    token: "--aw-purple-200",
    hex: "#EADDF8",
    intent: "Lavender que costura o azul ao peach. Não é cor protagonista.",
  },
  {
    role: "Destino (quente claro)",
    token: "--aw-amber-200",
    hex: "#FDE6CC",
    intent: "Peach/cream da direita. Onde o gradient 'esfria' (paradoxalmente).",
  },
  {
    role: "Destino linear",
    token: "--aw-pink-200",
    hex: "#FCE3EE",
    intent: "Rose suave usado na linear base — mais rosado que amber, evita amarelado.",
  },
  {
    role: "Border (saturado)",
    token: "--aw-amber-300",
    hex: "#FCD4A3",
    intent: "Peach mais quente, usado no stroke iridescente sobre fundo dark.",
  },
]

export default function GradientPage() {
  return (
    <>
      <PageHero title="Gradient">
        Um único padrão visual de marca: o <strong>gradient iridescente</strong>
        — azul-céu → lavender → peach/cream. Reservado para superfícies da IA
        (botão, card, banner, badge). Aplica-se em três variantes:{" "}
        <strong>fill</strong>, <strong>soft mesh</strong> e <strong>border</strong>.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>
              Ações que <strong>invocam o agente</strong>: gerar, resumir,
              sugerir, capturar.
            </>,
            <>
              Superfícies (card, banner) que sinalizam <strong>inteligência</strong>:
              insight gerado, recomendação, tom captado.
            </>,
            <>
              Como destaque pontual — uma região por viewport, no máximo.
            </>,
          ]}
          dontUse={[
            <>
              Em CRUD comum (salvar, duplicar, listar). Vira ruído de marca.
            </>,
            <>
              Como background de página inteira ou seção grande — perde força.
            </>,
            <>
              Misturado com outros gradients (azul puro, vermelho, etc.) no
              mesmo container.
            </>,
            <>
              Iniciando em cor quente (laranja, vermelho, rosa saturado). A
              origem é <strong>sempre</strong> azul.
            </>,
          ]}
        />

        <Toc items={TOC} />

        {/* ── Princípios ─────────────────────────────────────────── */}
        <Section
          id="principles"
          title="Princípios"
          lead="Cinco regras que sustentam o gradient. Tudo o mais derivam destas."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Principle
              n="01"
              title="Origem azul"
              body="Toda iteração começa em --aw-blue-400. É a primeira cor que o olho registra — diz 'pensando'."
            />
            <Principle
              n="02"
              title="Iridescente, não saturado"
              body="Tons 200–400 da paleta. Saturação alta vira tech genérico — o ponto é luminoso, não vibrante."
            />
            <Principle
              n="03"
              title="Peach é destino"
              body="Sempre termina em amber/pink claro. Quente esfria o azul e dá personalidade."
            />
            <Principle
              n="04"
              title="Texto escuro"
              body="Sempre --aw-gray-1200 sobre o fill. O gradient carrega a luz; o texto carrega a clareza."
            />
            <Principle
              n="05"
              title="Um por vista"
              body="No máximo uma superfície iridescente visível por viewport. É grito, use com parcimônia."
            />
          </div>
        </Section>

        {/* ── Paleta ─────────────────────────────────────────────── */}
        <Section
          id="palette"
          title="Paleta iridescente"
          lead="Seis tokens existentes da paleta primitiva, recombinados. Nenhum token novo foi criado — o gradient é composição."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="px-5 pt-4 pb-2 aw-eyebrow w-32">role</th>
                  <th className="px-5 pt-4 pb-2 aw-eyebrow w-20">swatch</th>
                  <th className="px-5 pt-4 pb-2 aw-eyebrow w-40">token</th>
                  <th className="px-5 pt-4 pb-2 aw-eyebrow w-20">hex</th>
                  <th className="px-5 pt-4 pb-2 aw-eyebrow">intent</th>
                </tr>
              </thead>
              <tbody>
                {PALETTE.map((p) => (
                  <tr
                    key={p.token}
                    className="border-b border-[var(--border-subtle)] last:border-b-0 align-middle"
                  >
                    <td className="px-5 py-3 text-sm text-[var(--fg-primary)] whitespace-nowrap">
                      {p.role}
                    </td>
                    <td className="px-5 py-3">
                      <div
                        className="w-10 h-6 rounded-[var(--radius-sm)] border border-[var(--border-subtle)]"
                        style={{ backgroundColor: p.hex }}
                      />
                    </td>
                    <td className="px-5 py-3 mono text-xs text-[var(--aw-blue-700)] whitespace-nowrap">
                      {p.token}
                    </td>
                    <td className="px-5 py-3 mono text-xs text-[var(--fg-tertiary)] whitespace-nowrap">
                      {p.hex}
                    </td>
                    <td className="px-5 py-3 text-sm text-[var(--fg-secondary)]">
                      {p.intent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Três padrões ───────────────────────────────────────── */}
        <Section
          id="patterns"
          title="Três padrões"
          lead="Filled, soft mesh e border. Cada um tem um uso definido. Todos compartilham a mesma história de cor."
        >
          <div className="flex flex-col gap-6">
            {/* Filled */}
            <PatternBlock
              n="01"
              title="Iridescent fill"
              utility=".aw-gradient-iridescent"
              description="Superfícies acionáveis: AwButton variant ai, badges. Texto escuro. Inner stroke branco em dark."
              demos={
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-3">
                    <AwButton variant="ai" iconLeft="auto_awesome">
                      Get Started
                    </AwButton>
                    <AwButton variant="ai" iconLeft="bolt">
                      Capture o tom
                    </AwButton>
                    <AwButton
                      variant="ai"
                      iconOnly="auto_awesome"
                      aria-label="Gerar"
                    />
                  </div>
                  <div className="dark rounded-[var(--radius-md)] p-6 bg-[var(--dark-bg)] border border-[var(--dark-border)] flex flex-wrap gap-3">
                    <AwButton variant="ai" iconLeft="auto_awesome">
                      Get Started
                    </AwButton>
                    <AwButton variant="ai" iconRight="arrow_forward">
                      Schedule a Call
                    </AwButton>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="aw-gradient-iridescent inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-full)] text-xs font-medium text-[var(--aw-gray-1200)]">
                      Capture o Tom das Primeiras Palavras do Lead
                    </span>
                  </div>
                </div>
              }
            />

            {/* Border */}
            <PatternBlock
              n="02"
              title="Iridescent border"
              utility=".aw-gradient-iridescent-border"
              description="Stroke 1px sobre fill plano (escuro ou claro). Use em ação secundária da IA, cards opt-in, hero outline."
              demos={
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="aw-gradient-iridescent-border px-5 h-[38px] rounded-[var(--radius-full)] text-sm font-medium inline-flex items-center gap-2 text-[var(--fg-primary)]"
                      style={
                        {
                          "--aw-iridescent-fill": "var(--bg-canvas)",
                        } as React.CSSProperties
                      }
                    >
                      Learn more
                    </button>
                    <button
                      type="button"
                      className="aw-gradient-iridescent-border px-5 h-[38px] rounded-[var(--radius-full)] text-sm font-medium inline-flex items-center gap-2 text-[var(--fg-primary)]"
                    >
                      Saiba como funciona →
                    </button>
                  </div>
                  <div className="dark rounded-[var(--radius-md)] p-6 bg-[var(--dark-bg)] border border-[var(--dark-border)] flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="aw-gradient-iridescent-border px-5 h-[38px] rounded-[var(--radius-full)] text-sm font-medium inline-flex items-center gap-2"
                      style={
                        {
                          "--aw-iridescent-fill": "var(--dark-bg)",
                          color: "var(--dark-fg-primary)",
                        } as React.CSSProperties
                      }
                    >
                      Learn more
                    </button>
                    <button
                      type="button"
                      className="aw-gradient-iridescent-border px-5 h-[38px] rounded-[var(--radius-full)] text-sm font-medium inline-flex items-center gap-2"
                      style={
                        {
                          "--aw-iridescent-fill": "var(--dark-bg)",
                          color: "var(--dark-fg-primary)",
                        } as React.CSSProperties
                      }
                    >
                      Schedule a Call ↗
                    </button>
                  </div>
                </div>
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
            <Spec
              k="fill"
              v=".aw-gradient-iridescent"
              d="Usar em buttons, badges, banners — superfícies acionáveis."
            />
            <Spec
              k="soft mesh"
              v=".aw-gradient-iridescent-soft"
              d="Background sutil em card passivo (--aw-card--ai também)."
            />
            <Spec
              k="border"
              v=".aw-gradient-iridescent-border"
              d="1px stroke iridescente; passe --aw-iridescent-fill."
            />
          </div>
        </Section>

        {/* ── Em contexto ────────────────────────────────────────── */}
        <Section
          id="context"
          title="Em contexto"
          lead="O gradient não vive sozinho. Aqui em três layouts canônicos: hero CTA, insight banner, row action."
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden">
              <div className="px-5 py-3 border-b border-[var(--border-subtle)] aw-eyebrow">
                hero · landing
              </div>
              <div className="p-8 flex flex-col items-center text-center gap-4">
                <h3 className="m-0">Agentes que pensam com você</h3>
                <p className="body-sm m-0 text-[var(--fg-secondary)]">
                  Crie em minutos, refine em horas, escale em dias.
                </p>
                <div className="flex gap-2">
                  <AwButton variant="ai" iconLeft="auto_awesome">
                    Gerar agora
                  </AwButton>
                  <AwButton variant="ghost">Ver demo</AwButton>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden">
              <div className="px-5 py-3 border-b border-[var(--border-subtle)] aw-eyebrow">
                insight banner
              </div>
              <div className="p-5">
                <div className="aw-card aw-card--ai p-5 flex flex-col gap-1">
                  <div className="text-sm font-medium">
                    Sugestão pronta pra revisar
                  </div>
                  <p className="body-sm m-0 text-[var(--fg-secondary)]">
                    Capturei o tom das primeiras palavras do lead. Confere?
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden">
              <div className="px-5 py-3 border-b border-[var(--border-subtle)] aw-eyebrow">
                row action
              </div>
              <div className="p-5 flex flex-col gap-2">
                {["Pedro Silva", "Ana Costa", "João Mendes"].map((name, i) => (
                  <div
                    key={name}
                    className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)]"
                  >
                    <div className="text-sm">{name}</div>
                    {i === 0 ? (
                      <AwButton
                        variant="ai"
                        size="sm"
                        iconOnly="auto_awesome"
                        aria-label="Gerar resposta"
                      />
                    ) : (
                      <AwButton
                        variant="subtle"
                        size="sm"
                        iconOnly="more_vert"
                        aria-label="Ações"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── Em código ──────────────────────────────────────────── */}
        <Section
          id="code"
          title="Em código"
          lead="Sempre prefira o AwButton/AwCard com a variant correspondente. Use o utility direto só quando precisar do gradient em outro elemento (badge, banner, ícone)."
        >
          <CodeExample label="botão da IA (filled)">{`import { AwButton } from "@/components/ui/AwButton"

<AwButton variant="ai" iconLeft="auto_awesome">
  Gerar resposta
</AwButton>`}</CodeExample>

          <CodeExample label="card de insight (soft mesh)">{`import { AwCard } from "@/components/ui/AwCard"

<AwCard variant="ai">
  <h4>Insight do agente</h4>
  <p>3 leads aquecidos esperando resposta.</p>
</AwCard>`}</CodeExample>

          <CodeExample label="badge inline com fill iridescente">{`<span className="aw-gradient-iridescent inline-flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-full)] text-xs font-medium text-[var(--aw-gray-1200)]">
  Capture o Tom das Primeiras Palavras do Lead
</span>`}</CodeExample>

          <CodeExample label="border iridescente em fundo dark">{`<button
  className="aw-gradient-iridescent-border px-5 h-[38px] rounded-[var(--radius-full)] text-sm font-medium"
  style={{
    "--aw-iridescent-fill": "var(--dark-bg)",
    color: "var(--dark-fg-primary)",
  } as React.CSSProperties}
>
  Learn more
</button>`}</CodeExample>
        </Section>

        {/* ── Acessibilidade ─────────────────────────────────────── */}
        <Section
          id="accessibility"
          title="Acessibilidade"
          lead="O gradient tem regiões de contraste variável. O texto sempre escuro garante leitura em qualquer ponto do mesh."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5 body-sm text-[var(--fg-secondary)] flex flex-col gap-2">
            <p className="m-0">
              <strong className="text-[var(--fg-primary)]">contraste.</strong>{" "}
              Texto <code className="mono">--aw-gray-1200</code> sobre as
              regiões mais claras do gradient (peach, lavender) atinge ≥ 12:1.
              Sobre as regiões mais saturadas (blue-400) atinge ≥ 4.5:1 (AA).
              Não use texto branco sobre o filled — fica ilegível no peach.
            </p>
            <p className="m-0">
              <strong className="text-[var(--fg-primary)]">animação.</strong>{" "}
              O gradient é estático por padrão. Se animar (mesh drift),
              respeite{" "}
              <code className="mono">prefers-reduced-motion: reduce</code> e
              congele a posição.
            </p>
            <p className="m-0">
              <strong className="text-[var(--fg-primary)]">semântica.</strong>{" "}
              O gradient não substitui label nem ícone — é decoração. Use{" "}
              <code className="mono">aria-label</code> sempre que o botão for
              iconOnly.
            </p>
          </div>
        </Section>

        {/* ── Do / Don't ─────────────────────────────────────────── */}
        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>
                Comece sempre em <code className="mono">--aw-blue-400</code> à
                esquerda e termine em peach/cream à direita.
              </>,
              <>
                Texto sempre <code className="mono">--aw-gray-1200</code> sobre
                fill iridescente — não branco.
              </>,
              <>
                Reserve para superfícies da IA: gerar, sugerir, resumir,
                capturar.
              </>,
              <>
                Uma superfície iridescente por viewport, no máximo.
              </>,
              <>
                Em dark, mantém o mesmo gradient + inner stroke branco a 55%
                pra lift.
              </>,
            ]}
            donts={[
              <>
                Gradient começando em cor quente (laranja, vermelho, rosa
                saturado).
              </>,
              <>
                Mais de uma região iridescente lado a lado — perde força e vira
                ruído.
              </>,
              <>
                Texto branco sobre o filled. Peach + branco ≪ 3:1.
              </>,
              <>
                Usar variant <code className="mono">ai</code> em ações comuns
                (salvar, duplicar, excluir).
              </>,
              <>
                Hardcode dos hex (<code className="mono">#8FB8FF</code>,{" "}
                <code className="mono">#FDE6CC</code>) — sempre via{" "}
                <code className="mono">var(--aw-*)</code>.
              </>,
              <>
                Saturação alta — vira tech genérico. O ponto é{" "}
                <em>luminoso</em>, não vibrante.
              </>,
            ]}
          />
        </Section>

        {/* ── Veja também ────────────────────────────────────────── */}
        <Section id="related" title="Veja também">
          <RelatedLinks
            items={[
              {
                name: "Cor",
                href: "/bombardier/styleguide/foundation/color",
                description:
                  "Paleta primitiva — os tokens que compõem o iridescente.",
              },
              {
                name: "Botões",
                href: "/bombardier/styleguide/components/buttons",
                description:
                  "AwButton variant ai · entrypoint canônico do gradient filled.",
              },
              {
                name: "Cards",
                href: "/bombardier/styleguide/components/cards",
                description:
                  "AwCard variant ai · entrypoint canônico do gradient mesh.",
              },
              {
                name: "Animação",
                href: "/bombardier/styleguide/foundation/motion",
                description:
                  "Padrões de movimento — mesh drift respeita prefers-reduced-motion.",
              },
            ]}
          />
        </Section>
      </div>
    </>
  )
}

/* ──────────────────────────────────────────────────────────────── */

function Principle({
  n,
  title,
  body,
}: {
  n: string
  title: string
  body: string
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5 flex flex-col gap-2">
      <span className="text-xs text-[var(--fg-tertiary)]">{n}</span>
      <div className="text-sm font-medium text-[var(--fg-primary)]">
        {title}
      </div>
      <p className="body-sm m-0 text-[var(--fg-secondary)]">{body}</p>
    </div>
  )
}

function PatternBlock({
  n,
  title,
  utility,
  description,
  demos,
}: {
  n: string
  title: string
  utility: string
  description: string
  demos: React.ReactNode
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden">
      <header className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-start justify-between gap-4">
        <div>
          <h3 className="m-0 text-[var(--h5-size)]">
            <span className="text-[var(--fg-tertiary)] text-sm mr-2">
              {n} ·
            </span>
            {title}
          </h3>
          <p className="mt-1 mb-0 body-sm text-[var(--fg-secondary)]">
            {description}
          </p>
        </div>
        <code className="mono text-xs text-[var(--aw-blue-700)] shrink-0 mt-1">
          {utility}
        </code>
      </header>
      <div className="p-6 bg-[var(--bg-surface)]">{demos}</div>
    </div>
  )
}
