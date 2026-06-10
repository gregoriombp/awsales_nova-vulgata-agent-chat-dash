import Link from "next/link"
import { Icon } from "@/components/ui/Icon"
import { PageHero, Section } from "../../_primitives"

/**
 * Tom de voz — a voz da marca Aswork. Fonte: Diretrizes de Comunicação em
 * Redes (jan/2025), adaptadas ao rebrand. Cobre a voz de MARCA; o UX writing
 * in-product vive em Foundations → Escrita.
 */

const PRINCIPIOS = [
  "Falamos pouco, mas com peso.",
  "Não pedimos atenção — assumimos espaço.",
  "Não exageramos emocionalmente.",
  "Não prometemos milagres.",
  "Não usamos linguagem juvenil ou hype vazio.",
]

const POSTURAS = [
  {
    n: "01",
    title: "Confiança silenciosa",
    body: "Não gritamos “somos incríveis”. Agimos como quem já sabe o que é. Nada de hype exagerado ou promessas mágicas. É autoridade calma — quem sabe, sabe.",
  },
  {
    n: "02",
    title: "Técnico, mas elegante",
    body: "Comunicação é engenharia + estética. Falamos de modelos, performance, benchmarks e escalabilidade — com linguagem limpa, visual premium e frases curtas. Nunca acadêmico demais, nem raso.",
  },
  {
    n: "03",
    title: "Produto no centro, não marketing",
    body: "Nada deve parecer propaganda ou forçação de barra. Comunicamos release de tecnologia, atualização de sistema, avanço real. O produto fala; o marketing organiza o palco.",
  },
  {
    n: "04",
    title: "Frio? Um pouco. Humano? O suficiente.",
    body: "Existe emoção, mas é contida. Quando mostramos impacto, não apelamos. É storytelling minimalista, quase documental — e é isso que aumenta a credibilidade.",
  },
  {
    n: "05",
    title: "Linguagem de plataforma, não de ferramenta",
    body: "Não vendemos features. Vendemos infraestrutura. O subtexto é sempre: “isso vai virar parte do ecossistema de vocês”.",
  },
]

const EXEMPLOS: { errado: string; certo: string }[] = [
  {
    errado: "🚀 Não perca! A revolução da IA chegou para TRANSFORMAR suas vendas!!!",
    certo: "Seus agentes operam receita. Em produção.",
  },
  {
    errado: "Somos a plataforma mais incrível do mercado, feita com muito amor para você!",
    certo: "Infraestrutura de agentes para operações de receita enterprise.",
  },
  {
    errado: "Corre que é por tempo limitado: conheça AGORA nosso produto novo!",
    certo: "Cortex 2.0 está em produção. As notas de release explicam o que muda.",
  },
  {
    errado: "Nossa IA mágica resolve tudo sozinha, pode confiar!",
    certo: "O agente consulta a base, responde com fonte e registra o gap quando não sabe.",
  },
]

export default function TomDeVozPage() {
  return (
    <>
      <PageHero title="Tom de voz">
        Pensa naquela pessoa que entra numa sala e não precisa se apresentar
        porque todo mundo já sabe quem é. <strong>É essa a energia.</strong> A
        Aswork é uma marca enterprise — já estabelecida, sem precisar de
        validação. Esta página define a voz da marca; o texto de interface
        segue a página{" "}
        <Link
          href="/bombardier/styleguide/foundation/content"
          className="underline underline-offset-2"
        >
          Escrita
        </Link>
        .
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        {/* ── Quote manifesto ─────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-aw-gray-1200 px-12 py-16 text-aw-gray-25">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(46% 64% at 12% 100%, color-mix(in srgb, var(--aw-blue-700) 22%, transparent) 0%, transparent 100%)",
            }}
          />
          <div className="relative">
            <div className="aw-eyebrow text-aw-gray-600">o lema</div>
            <p className="m-0 mt-4 max-w-[860px] font-heading text-[clamp(26px,3vw,40px)] font-medium leading-[1.18] tracking-[-0.015em]">
              A Aswork não aparece para chamar atenção. Ela aparece para deixar
              claro quem manda no sistema.
            </p>
            <p className="mb-0 mt-6 text-[15px] text-aw-gray-500">
              Nós não vendemos, nós existimos. A mensagem implícita:{" "}
              <span className="text-aw-gray-200">
                &ldquo;Se você já chegou até aqui, você sabe quem somos.&rdquo;
              </span>
            </p>
          </div>
        </div>

        {/* ── Princípios ──────────────────────────────────────────────── */}
        <Section
          id="principios"
          title="Princípios de linguagem"
          lead="Clara, direta, técnica — sem ser fria."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised)">
            {PRINCIPIOS.map((p, i) => (
              <div
                key={p}
                className="flex items-baseline gap-6 border-b border-(--border-subtle) px-7 py-5 last:border-b-0"
              >
                <span className="font-heading text-xl font-medium text-(--fg-muted)">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[15px] font-medium text-(--fg-primary)">{p}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Posturas ────────────────────────────────────────────────── */}
        <Section
          id="posturas"
          title="As cinco posturas"
          lead="Como os princípios viram comportamento — em qualquer canal."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {POSTURAS.map((p) => (
              <div
                key={p.n}
                className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-7"
              >
                <div className="font-heading text-[26px] font-medium text-(--fg-muted)">
                  {p.n}
                </div>
                <h3 className="mb-0 mt-3 text-[15px] font-semibold">{p.title}</h3>
                <p className="mb-0 mt-2 text-sm leading-relaxed text-(--fg-secondary)">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Na prática ──────────────────────────────────────────────── */}
        <Section
          id="na-pratica"
          title="Na prática"
          lead="Três cortes que resolvem 90% dos textos."
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { t: "Explicando demais?", d: "Corta." },
              { t: "Vendendo demais?", d: "Corta." },
              { t: "Tentando convencer?", d: "Reescreve. A Aswork não força, ela apresenta." },
            ].map((r) => (
              <div
                key={r.t}
                className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-7"
              >
                <div className="text-sm text-(--fg-secondary)">{r.t}</div>
                <div className="mt-2 font-heading text-lg font-medium text-(--fg-primary)">
                  {r.d}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Certo e errado ──────────────────────────────────────────── */}
        <Section
          id="exemplos"
          title="Certo e errado"
          lead="O mesmo conteúdo, nas duas energias. A da esquerda nunca sai no nome da Aswork."
        >
          <div className="flex flex-col gap-3">
            {EXEMPLOS.map((e) => (
              <div key={e.certo} className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg border border-(--aw-red-200) bg-(--aw-red-100) p-5">
                  <Icon name="close" size={17} className="mt-0.5 shrink-0 text-(--aw-red-700)" />
                  <p className="m-0 text-sm leading-relaxed text-(--aw-red-900)">{e.errado}</p>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-(--aw-emerald-300) bg-(--aw-emerald-100) p-5">
                  <Icon name="check" size={17} className="mt-0.5 shrink-0 text-(--aw-emerald-800)" />
                  <p className="m-0 text-sm font-medium leading-relaxed text-(--aw-emerald-900)">
                    {e.certo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Teste rápido ────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-(--border-subtle) bg-(--bg-surface) px-10 py-9">
          <div className="aw-eyebrow">teste rápido</div>
          <p className="m-0 mt-3 max-w-[760px] font-heading text-[22px] font-medium leading-snug text-(--fg-primary)">
            Releia o que você escreveu. Se parece que foi escrito por alguém
            desesperado por atenção, não é Aswork.
          </p>
        </div>

        {/* ── Crosslinks ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link
            href="/bombardier/styleguide/foundation/content"
            className="group flex items-center justify-between rounded-2xl border border-(--border-subtle) bg-(--bg-raised) px-8 py-6 no-underline transition-colors hover:border-(--border-strong)"
          >
            <div>
              <div className="aw-eyebrow">no produto</div>
              <div className="mt-1 font-heading text-lg font-medium text-(--fg-primary)">
                Escrita de interface
              </div>
            </div>
            <Icon name="arrow_forward" size={20} className="text-(--fg-tertiary) transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/bombardier/styleguide/marca/imageria"
            className="group flex items-center justify-between rounded-2xl border border-(--border-subtle) bg-(--bg-raised) px-8 py-6 no-underline transition-colors hover:border-(--border-strong)"
          >
            <div>
              <div className="aw-eyebrow">continue</div>
              <div className="mt-1 font-heading text-lg font-medium text-(--fg-primary)">
                Imageria
              </div>
            </div>
            <Icon name="arrow_forward" size={20} className="text-(--fg-tertiary) transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </>
  )
}
