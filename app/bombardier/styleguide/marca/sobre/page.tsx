/* eslint-disable @next/next/no-img-element */
import Link from "next/link"
import { AwLogo } from "@/components/ui/AwLogo"
import { AwBrandIllustration } from "@/components/ui/AwBrandIllustration"
import { Icon } from "@/components/ui/Icon"
import { PageHero, Section } from "../../_primitives"

/**
 * A marca — a página que abre a apresentação do design system. Conta a
 * história da Aswork (workforce artificial para operações de receita), as
 * três entidades e suas formas, a constelação, o Cortex e os porquês do
 * azul e da imageria lunar. Fonte: brand guidelines internas + diretrizes
 * de comunicação (jan/2025), adaptadas ao rebrand Aswork.
 */

const ENTITIES = [
  {
    shape: "hexagon" as const,
    name: "Cortex",
    role: "O observador. Aprende com todas as conversas, detecta gaps e otimiza os agentes — no passado, no presente e no futuro.",
  },
  {
    shape: "diamond" as const,
    name: "Agent Core",
    role: "Frameworks exclusivos da Aswork. Cada agente criado nasce apoiado em um core — a engenharia por trás do comportamento.",
  },
  {
    shape: "circle" as const,
    name: "Agente do Usuário",
    role: "O agente que a sua empresa cria. Tem objetivo, base de conhecimento e identidade próprias — e nunca trabalha sozinho.",
  },
]

const CONSTELLATION_STEPS = [
  {
    n: "01",
    title: "O agente encontra um limite",
    body: "Um agente de recuperação de carrinho descobre que o cliente desistiu por não saber se o tamanho da camiseta serviria. Essa informação não é da alçada dele.",
  },
  {
    n: "02",
    title: "Ele consulta um especialista",
    body: "Em vez de inventar, ele pergunta ao agente de catálogo — o que conhece cada produto da loja — e recebe a resposta verificada.",
  },
  {
    n: "03",
    title: "A venda volta para o trilho",
    body: "O cliente recebe a informação na mesma conversa. O Cortex registra o gap — a tabela de medidas não estava no site — e sugere a correção.",
  },
]

function EntityShape({ shape }: { shape: "hexagon" | "diamond" | "circle" }) {
  if (shape === "circle") {
    return <span className="block h-14 w-14 rounded-full bg-(--fg-primary)" />
  }
  if (shape === "diamond") {
    return <span className="block h-11 w-11 rotate-45 rounded-[6px] bg-(--fg-primary)" />
  }
  return (
    <svg viewBox="0 0 100 100" className="h-14 w-14" aria-hidden>
      <polygon
        points="50,4 90,27 90,73 50,96 10,73 10,27"
        fill="var(--fg-primary)"
      />
    </svg>
  )
}

export default function MarcaSobrePage() {
  return (
    <>
      <PageHero title="A marca">
        A Aswork é uma camada de <strong>força de trabalho artificial</strong>{" "}
        para operações de receita. Esta página é a versão curta da história —
        o que a marca acredita, como ela se desenha e por que o produto tem a
        cara que tem.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        {/* ── Manifesto ───────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-aw-gray-1200 px-12 py-16 text-aw-gray-25">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(52% 70% at 82% 0%, color-mix(in srgb, var(--aw-blue-600) 26%, transparent) 0%, color-mix(in srgb, var(--aw-blue-900) 18%, transparent) 48%, transparent 100%)",
            }}
          />
          <div className="relative flex flex-col gap-10">
            <AwLogo variant="mark" height={40} className="text-aw-gray-25" />
            <div>
              <p className="m-0 max-w-[820px] font-heading text-[clamp(28px,3.4vw,44px)] font-medium leading-[1.12] tracking-[-0.015em]">
                Aswork is an artificial workforce layer for revenue operations.
              </p>
              <p className="mt-5 text-[17px] text-aw-gray-500">
                Your company, working beyond itself.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 border-t border-white/10 pt-7 text-[13px] text-aw-gray-500">
              <span>Agentes que cumprem objetivos, não só conversas</span>
              <span className="text-aw-gray-800">·</span>
              <span>Construída para decisores enterprise</span>
              <span className="text-aw-gray-800">·</span>
              <span>Receita como métrica final</span>
            </div>
          </div>
        </div>

        {/* ── O que é ─────────────────────────────────────────────────── */}
        <Section
          id="o-que-e"
          title="O que é a Aswork"
          lead="Agentic AI com um diferencial claro: os agentes não atendem para melhorar CSAT — atendem para cumprir objetivos e aumentar receita."
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-7 text-[15px] leading-relaxed text-(--fg-secondary)">
              <p className="m-0">
                Você dá o objetivo, as informações e as integrações. Os agentes
                entregam o resto: atendem, vendem, recuperam, detectam gaps e
                preveem cenários. O mercado de agentes foca em atendimento e
                suporte; a Aswork faz isso <em>e</em> opera receita — é outra
                categoria de responsabilidade.
              </p>
              <p className="mb-0 mt-4">
                O público é quem decide: founders, líderes de revenue, gestores
                que não precisam de discurso motivacional — precisam de
                capacidade real. Tudo que a marca produz reflete essa
                maturidade.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { k: "Constelação", v: "Um agente nunca trabalha sozinho." },
                { k: "Um observador", v: "O Cortex aprende com tudo, o tempo todo." },
                { k: "Quarta dimensão", v: "Passado, presente e futuro conectados." },
              ].map((f) => (
                <div
                  key={f.k}
                  className="flex items-center justify-between gap-6 rounded-lg border border-(--border-subtle) bg-(--bg-raised) px-6 py-5"
                >
                  <span className="aw-eyebrow">{f.k}</span>
                  <span className="text-right text-sm text-(--fg-primary)">{f.v}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Entidades ───────────────────────────────────────────────── */}
        <Section
          id="entidades"
          title="As três entidades"
          lead="A linguagem geométrica oficial. Três formas, três papéis — a assinatura visual da Aswork dentro do produto."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {ENTITIES.map((e) => (
              <div
                key={e.name}
                className="flex flex-col gap-5 rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-7"
              >
                <div className="flex h-20 items-center">
                  <EntityShape shape={e.shape} />
                </div>
                <div>
                  <h3 className="m-0 text-base font-semibold">{e.name}</h3>
                  <p className="mb-0 mt-2 text-sm leading-relaxed text-(--fg-secondary)">
                    {e.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/bombardier/styleguide/components/agents"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-(--fg-secondary) no-underline transition-colors hover:text-(--fg-primary)"
          >
            Ver o visual dos agentes no styleguide
            <Icon name="arrow_forward" size={16} />
          </Link>
        </Section>

        {/* ── Constelação ─────────────────────────────────────────────── */}
        <Section
          id="constelacao"
          title="Constelação, não fila de chatbots"
          lead="Se um agente não sabe, ele pergunta a quem sabe. O exemplo canônico:"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {CONSTELLATION_STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-7"
              >
                <div className="font-heading text-[28px] font-medium text-(--fg-muted)">
                  {s.n}
                </div>
                <h3 className="mb-0 mt-3 text-[15px] font-semibold">{s.title}</h3>
                <p className="mb-0 mt-2 text-sm leading-relaxed text-(--fg-secondary)">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Cortex 4D ───────────────────────────────────────────────── */}
        <Section
          id="cortex"
          title="Cortex: a quarta dimensão"
          lead="Pense num sistema com o Cortex ao centro e agentes interligados ao redor. Agora adicione o tempo. O Cortex não é 3D — é 4D."
        >
          <div className="overflow-hidden rounded-2xl bg-aw-gray-1200 text-aw-gray-25">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
              <div className="flex items-center justify-center p-10">
                <AwBrandIllustration
                  name="constellation"
                  size={300}
                  title="Constelação de agentes ao redor do Cortex"
                />
              </div>
              <div className="flex flex-col justify-center gap-6 border-t border-white/10 p-10 lg:border-l lg:border-t-0">
                {[
                  {
                    t: "Passado",
                    d: "Aprende com cada conversa, decisão e padrão já registrado na operação.",
                  },
                  {
                    t: "Presente",
                    d: "Observa as conversas entre agentes e clientes em tempo real — e aponta gaps.",
                  },
                  {
                    t: "Futuro",
                    d: "Prediz cenários e, com a sua permissão, otimiza os próprios agentes.",
                  },
                ].map((item, i) => (
                  <div key={item.t} className="flex gap-5">
                    <span className="font-heading text-sm text-aw-gray-600">
                      0{i + 1}
                    </span>
                    <div>
                      <h3 className="m-0 text-[15px] font-semibold text-aw-gray-25">
                        {item.t}
                      </h3>
                      <p className="mb-0 mt-1 text-sm leading-relaxed text-aw-gray-500">
                        {item.d}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ── Por que o azul ──────────────────────────────────────────── */}
        <Section
          id="azul"
          title="Por que o azul"
          lead="Ao deixar a Terra, cruzamos um degradê que começa no azul e termina no preto. É a ignição — a saída para o lugar onde os agentes operam."
        >
          <div className="overflow-hidden rounded-2xl">
            <div
              className="relative flex min-h-[320px] items-center justify-between gap-10 px-12 py-12 text-aw-gray-25"
              style={{
                background:
                  "linear-gradient(168deg, var(--aw-blue-400) 0%, var(--aw-blue-700) 34%, var(--aw-blue-1000) 62%, var(--aw-gray-1200) 100%)",
              }}
            >
              <div className="max-w-[440px]">
                <div className="aw-eyebrow text-aw-blue-150">a ignição</div>
                <p className="mb-0 mt-3 font-heading text-[26px] font-medium leading-snug tracking-[-0.01em]">
                  O azul é o ponto de origem do espectro — onde a interface
                  encosta na IA, o gradiente começa.
                </p>
                <p className="mb-0 mt-4 text-sm leading-relaxed text-aw-blue-150/90">
                  No produto, isso vira regra: superfícies neutras em grayscale
                  e o azul reservado para os momentos de inteligência — busca
                  semântica, construção de base, ações de IA.
                </p>
              </div>
              <AwBrandIllustration
                name="ignition"
                size={280}
                className="hidden opacity-90 lg:block"
                title="Explosão radial — a ignição"
              />
            </div>
          </div>
        </Section>

        {/* ── Por que a imageria ──────────────────────────────────────── */}
        <Section
          id="imageria"
          title="Por que a imageria é lunar"
          lead="O ambiente onde os agentes operam é um campo neutro — um whitefield. Fora da Terra; nuvens seriam baixas demais."
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="relative min-h-[300px] overflow-hidden rounded-2xl">
              <img
                src="/assets/background-images/background-image@2x.jpg"
                alt="Textura lunar em grayscale — a imageria oficial da marca"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 30%, rgba(13,13,13,0.82) 100%)",
                }}
              />
              <p className="absolute bottom-0 left-0 m-0 max-w-[420px] p-8 text-sm leading-relaxed text-aw-gray-200">
                Rochas, dunas e montanhas em grayscale. A textura é neutra de
                propósito: o contexto de cada cliente é quem colore.
              </p>
            </div>
            <div className="flex flex-col justify-between gap-6 rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-7">
              <p className="m-0 text-sm leading-relaxed text-(--fg-secondary)">
                É lá — em outro lugar, dimensão e tempo — que a sua empresa
                também opera. Uma versão alternativa da realidade que traz
                resultados para esta. Por isso, <strong>Aswork</strong>.
              </p>
              <Link
                href="/bombardier/styleguide/marca/imageria"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-(--fg-secondary) no-underline transition-colors hover:text-(--fg-primary)"
              >
                Diretrizes de imageria
                <Icon name="arrow_forward" size={16} />
              </Link>
            </div>
          </div>
        </Section>

        {/* ── Próxima página ──────────────────────────────────────────── */}
        <Link
          href="/bombardier/styleguide/marca/tom-de-voz"
          className="group flex items-center justify-between rounded-2xl border border-(--border-subtle) bg-(--bg-raised) px-8 py-7 no-underline transition-colors hover:border-(--border-strong)"
        >
          <div>
            <div className="aw-eyebrow">continue</div>
            <div className="mt-1 font-heading text-xl font-medium text-(--fg-primary)">
              Tom de voz: confiança silenciosa
            </div>
          </div>
          <Icon
            name="arrow_forward"
            size={22}
            className="text-(--fg-tertiary) transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </>
  )
}
