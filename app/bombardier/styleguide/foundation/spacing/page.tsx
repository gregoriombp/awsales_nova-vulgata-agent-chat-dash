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
  { id: "scale", label: "Escala" },
  { id: "rules", label: "Regras de uso" },
  { id: "patterns", label: "Padrões canônicos" },
  { id: "code", label: "Em código" },
  { id: "do-dont", label: "Do / Don't" },
  { id: "related", label: "Veja também" },
]

const SCALE = [
  { name: "1", token: "--space-1", px: 4, tailwind: "p-1 · gap-1", use: "Interior íntimo (ícone+texto inline, chip)" },
  { name: "2", token: "--space-2", px: 8, tailwind: "p-2 · gap-2", use: "Controles inline (toolbar, breadcrumb)" },
  { name: "3", token: "--space-3", px: 12, tailwind: "p-3 · gap-3", use: "Form fields, ações de modal" },
  { name: "4", token: "--space-4", px: 16, tailwind: "p-4 · gap-4", use: "Interior de cards · default" },
  { name: "5", token: "--space-5", px: 20, tailwind: "p-5 · gap-5", use: "Padding de card de hero" },
  { name: "6", token: "--space-6", px: 24, tailwind: "p-6 · gap-6", use: "Grid de cards · padding grande" },
  { name: "8", token: "--space-8", px: 32, tailwind: "p-8 · gap-8", use: "Padding generoso · entre blocos da seção" },
  { name: "10", token: "--space-10", px: 40, tailwind: "p-10 · gap-10", use: "Padding lateral da página (px-10)" },
  { name: "12", token: "--space-12", px: 48, tailwind: "p-12 · gap-12", use: "Hero compacto" },
  { name: "16", token: "--space-16", px: 64, tailwind: "p-16 · gap-16", use: "Entre <Section> · padding de hero amplo" },
  { name: "18", token: "--space-18", px: 72, tailwind: "p-18 · gap-18", use: "Respiração extra (landing externa)" },
]

const PATTERNS = [
  {
    name: "Gap entre sections",
    spec: "gap-16 (64 px)",
    use: "Entre <Section> dentro do container da página.",
  },
  {
    name: "Padding lateral da página",
    spec: "px-10 (40 px)",
    use: "Padding horizontal do container principal. Em mobile cai pra px-6.",
  },
  {
    name: "Padding interno de card",
    spec: "p-5 ou p-6 (20/24 px)",
    use: "p-5 em card compacto, p-6 em card de hero.",
  },
  {
    name: "Gap entre cards",
    spec: "gap-4 ou gap-6 (16/24 px)",
    use: "gap-4 em dashboard apertado, gap-6 em catálogo (padrão).",
  },
  {
    name: "Gap em form vertical",
    spec: "gap-4 (16 px)",
    use: "Entre fields verticais. Não use margin nos AwInput.",
  },
  {
    name: "Gap em toolbar inline",
    spec: "gap-2 (8 px)",
    use: "Entre botões agrupados na mesma toolbar.",
  },
  {
    name: "Padding de modal",
    spec: "p-6 (24 px) header · p-6 body · p-4 footer",
    use: "Diferentes regiões do modal usam paddings distintos.",
  },
]

export default function SpacingPage() {
  return (
    <>
      <PageHero title="Spacing">
        Escala de base 4 px, passo padrão 8 px. Onze degraus cobrem do interior
        íntimo (4 px) ao espaço entre seções (64 px). Sair da escala é
        sintoma — não invente <code className="mono">gap-[18px]</code>.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>Para definir <strong>padding</strong> interno de qualquer container.</>,
            <>Para definir <strong>gap</strong> entre filhos em flex/grid.</>,
            <>
              Como referência ao escolher <code className="mono">margin</code>{" "}
              entre dois blocos que pertencem a parents diferentes.
            </>,
          ]}
          dontUse={[
            <>Para ajustes minúsculos de alinhamento — isso é problema de layout, não de spacing.</>,
            <>Para criar valores fora da escala (gap-[10px], p-[18px]).</>,
            <>Pra definir width/height — esses são responsivos e contextuais.</>,
          ]}
        />

        <Toc items={TOC} />

        {/* ── Princípios ─────────────────────────────────────────── */}
        <Section
          id="principles"
          title="Princípios"
          lead="Quatro regras. Tudo o mais derivam destas."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Principle
              n="01"
              title="Base 4 px"
              body="Toda medida é múltipla de 4. O olho lê ritmo, não pixels."
            />
            <Principle
              n="02"
              title="Passo padrão 8"
              body="Entre componentes use 8/16/24/32. 4 é reservado pra interior íntimo de UI."
            />
            <Principle
              n="03"
              title="Gap > margin"
              body="Espaço entre filhos é responsabilidade do pai. Margin individual quebra reuso."
            />
            <Principle
              n="04"
              title="Quanto maior, mais respira"
              body="Cards de hero pedem p-6; pílulas pedem p-1. Densidade segue o tamanho."
            />
          </div>
        </Section>

        {/* ── Escala ─────────────────────────────────────────────── */}
        <Section
          id="scale"
          title="Escala completa"
          lead="Onze tokens. Use sempre o token, não o valor — assim mudanças globais ficam triviais."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="px-5 pt-4 pb-2 aw-eyebrow w-16">name</th>
                  <th className="px-5 pt-4 pb-2 aw-eyebrow w-48">token</th>
                  <th className="px-5 pt-4 pb-2 aw-eyebrow w-20">px</th>
                  <th className="px-5 pt-4 pb-2 aw-eyebrow w-32">visual</th>
                  <th className="px-5 pt-4 pb-2 aw-eyebrow w-48">tailwind</th>
                  <th className="px-5 pt-4 pb-2 aw-eyebrow">uso</th>
                </tr>
              </thead>
              <tbody>
                {SCALE.map((s) => (
                  <tr
                    key={s.token}
                    className="border-b border-[var(--border-subtle)] last:border-b-0 align-middle"
                  >
                    <td className="px-5 py-3 text-sm font-medium text-[var(--fg-primary)] whitespace-nowrap">
                      {s.name}
                    </td>
                    <td className="px-5 py-3 mono text-xs text-[var(--aw-blue-700)] whitespace-nowrap">
                      {s.token}
                    </td>
                    <td className="px-5 py-3 text-xs text-[var(--fg-tertiary)] whitespace-nowrap">
                      {s.px} px
                    </td>
                    <td className="px-5 py-3">
                      <div
                        className="h-4 rounded-[var(--radius-xs)] bg-[var(--aw-blue-500)]"
                        style={{ width: s.px * 2 }}
                      />
                    </td>
                    <td className="px-5 py-3 mono text-xs text-[var(--fg-secondary)] whitespace-nowrap">
                      {s.tailwind}
                    </td>
                    <td className="px-5 py-3 text-sm text-[var(--fg-secondary)]">
                      {s.use}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Regras de uso ──────────────────────────────────────── */}
        <Section
          id="rules"
          title="Regras de uso"
          lead="Onde cada degrau aparece dentro do produto. Decora pra não pensar duas vezes."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Rule
              tier="4 / 8 px"
              title="Interior íntimo"
              body="Ícone + texto, chip, pílula. Componentes que cabem em uma linha — aqui o ritmo é apertado."
            />
            <Rule
              tier="12 / 16 px"
              title="Interior padrão"
              body="Forms, cards de lista, dropdowns. A maioria dos componentes vive aqui."
            />
            <Rule
              tier="20 / 24 px"
              title="Container amplo"
              body="Cards de hero, painéis laterais, modais. Mais respiração, foco no conteúdo."
            />
            <Rule
              tier="32 / 40 px"
              title="Padding de página"
              body="Padding lateral do container (px-10) e gap entre blocos visuais maiores na mesma seção."
            />
            <Rule
              tier="48 / 64 px"
              title="Entre seções"
              body="gap-16 entre <Section>. Hero generoso usa p-16. Marca território."
            />
            <Rule
              tier="72 px"
              title="Página externa"
              body="Landing, splash, splash dark. Use quando o ar é parte do design."
            />
          </div>
        </Section>

        {/* ── Padrões canônicos ──────────────────────────────────── */}
        <Section
          id="patterns"
          title="Padrões canônicos"
          lead="Sete combinações que aparecem o tempo todo. Memorize e pare de decidir caso a caso."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="px-5 pt-4 pb-2 aw-eyebrow">padrão</th>
                  <th className="px-5 pt-4 pb-2 aw-eyebrow">spec</th>
                  <th className="px-5 pt-4 pb-2 aw-eyebrow">uso</th>
                </tr>
              </thead>
              <tbody>
                {PATTERNS.map((p) => (
                  <tr
                    key={p.name}
                    className="border-b border-[var(--border-subtle)] last:border-b-0 align-top"
                  >
                    <td className="px-5 py-3 text-sm text-[var(--fg-primary)] whitespace-nowrap">
                      {p.name}
                    </td>
                    <td className="px-5 py-3 mono text-xs text-[var(--aw-blue-700)] whitespace-nowrap">
                      {p.spec}
                    </td>
                    <td className="px-5 py-3 text-sm text-[var(--fg-secondary)]">
                      {p.use}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
            <Spec
              k="entre seções"
              v="gap-16 · 64 px"
              d="Padrão fixo do styleguide e do produto."
            />
            <Spec
              k="entre cards"
              v="gap-6 · 24 px"
              d="Catálogo, dashboard, grid de pills."
            />
            <Spec
              k="interior de card"
              v="p-5 ou p-6"
              d="20 ou 24 px conforme densidade."
            />
          </div>
        </Section>

        {/* ── Em código ──────────────────────────────────────────── */}
        <Section
          id="code"
          title="Em código"
          lead="CSS vars + Tailwind utilities. Use o que combina com a ferramenta — nunca hardcode pixels."
        >
          <CodeExample label="tailwind (preferido em React)">{`<section className="flex flex-col gap-16">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {items.map((i) => (
      <AwCard key={i.id} className="p-5">…</AwCard>
    ))}
  </div>
</section>`}</CodeExample>

          <CodeExample label="CSS var (preferido em CSS custom)" lang="css">{`.aw-page {
  padding-inline: var(--space-10); /* 40 px lateral */
  padding-block: var(--space-16); /* 64 px topo/base */
  gap: var(--space-16);
}

.aw-card {
  padding: var(--space-6); /* 24 px */
  gap: var(--space-4); /* 16 px entre slots */
}`}</CodeExample>

          <CodeExample label="form vertical canônico">{`<form className="max-w-[480px] mx-auto flex flex-col gap-4">
  <AwInput label="Nome" />
  <AwInput label="E-mail" />
  <AwButton variant="primary" block>Salvar</AwButton>
</form>`}</CodeExample>
        </Section>

        {/* ── Do / Don't ─────────────────────────────────────────── */}
        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>
                Sempre escolher um valor da escala (1, 2, 3, 4, 5, 6, 8, 10, 12,
                16, 18).
              </>,
              <>
                <code className="mono">gap-*</code> no pai &gt;{" "}
                <code className="mono">margin</code> no filho.
              </>,
              <>
                <code className="mono">gap-16</code> entre seções é regra do
                styleguide e do produto.
              </>,
              <>
                Em CSS custom, use <code className="mono">var(--space-*)</code>{" "}
                em vez de px crus.
              </>,
            ]}
            donts={[
              <>
                <code className="mono">gap-[18px]</code>,{" "}
                <code className="mono">p-[27px]</code> e qualquer valor fora da
                escala.
              </>,
              <>
                Margins individuais nos itens de uma lista — descalibra quando
                um item vai pro fim.
              </>,
              <>
                <code className="mono">space-y-*</code> em containers
                heterogêneos — vira pesadelo de override.
              </>,
              <>
                Pixel-pushing pra &quot;centralizar visualmente&quot;. Se
                precisou, o componente tá errado.
              </>,
            ]}
          />
        </Section>

        {/* ── Related ────────────────────────────────────────────── */}
        <Section id="related" title="Veja também">
          <RelatedLinks
            items={[
              {
                name: "Grid &amp; layout",
                href: "/bombardier/styleguide/foundation/grid",
                description:
                  "Onde os gaps de spacing entram nos 5 layouts canônicos.",
              },
              {
                name: "Tipografia",
                href: "/bombardier/styleguide/foundation/typography",
                description:
                  "Line-height segue lógica similar à escala de spacing.",
              },
              {
                name: "Cor",
                href: "/bombardier/styleguide/foundation/color",
                description: "Tokens semânticos. Spacing não tem dark mode.",
              },
              {
                name: "Botões",
                href: "/bombardier/styleguide/components/buttons",
                description:
                  "Exemplo de componente consumindo a escala (sm 30, md 38, lg 46).",
              },
            ]}
          />
        </Section>
      </div>
    </>
  )
}

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

function Rule({
  tier,
  title,
  body,
}: {
  tier: string
  title: string
  body: string
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5 flex flex-col gap-2">
      <div className="body-xs font-medium text-[var(--aw-blue-800)]">{tier}</div>
      <div className="text-base font-medium text-[var(--fg-primary)]">
        {title}
      </div>
      <p className="body-sm m-0 text-[var(--fg-secondary)]">{body}</p>
    </div>
  )
}
