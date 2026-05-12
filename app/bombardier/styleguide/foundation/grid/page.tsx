import {
  PageHero,
  Section,
  Spec,
  Tldr,
  Toc,
  CodeExample,
  DoDont,
  RelatedLinks,
  ResponsiveStage,
} from "../../_primitives"

const TOC = [
  { id: "principles", label: "Princípios" },
  { id: "container", label: "Container" },
  { id: "breakpoints", label: "Breakpoints" },
  { id: "columns", label: "12 colunas" },
  { id: "gutters", label: "Gutters & gaps" },
  { id: "layouts", label: "Layouts canônicos" },
  { id: "code", label: "Em código" },
  { id: "do-dont", label: "Do / Don't" },
  { id: "related", label: "Veja também" },
]

const breakpoints = [
  { name: "sm", value: "640px", use: "celular landscape" },
  { name: "md", value: "768px", use: "tablet portrait" },
  { name: "lg", value: "1024px", use: "tablet landscape · laptop pequeno" },
  { name: "xl", value: "1280px", use: "desktop padrão" },
  { name: "2xl", value: "1536px", use: "monitor amplo" },
]

const gaps = [
  {
    name: "gap-2",
    value: "8 px",
    use: "ícones e controles inline (toolbar, breadcrumb)",
  },
  {
    name: "gap-3",
    value: "12 px",
    use: "form fields, ações secundárias de modal",
  },
  {
    name: "gap-4",
    value: "16 px",
    use: "interior de cards (padding entre slots), grid de pills",
  },
  {
    name: "gap-6",
    value: "24 px",
    use: "entre cards de uma lista; grid de catálogo de integrações",
  },
  {
    name: "gap-8",
    value: "32 px",
    use: "entre blocos visuais distintos na mesma seção",
  },
  {
    name: "gap-16",
    value: "64 px",
    use: "entre <Section> do styleguide (padrão); entre módulos de página",
  },
]

export default function GridPage() {
  return (
    <>
      <PageHero title="Grid &amp; layout">
        Container de 1200 px, 12 colunas, gap-16 entre seções. Mobile-first
        via breakpoints do Tailwind. Todo layout do produto deve caber em uma
        das cinco formas canônicas abaixo — se não cabe, falar antes de
        inventar.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>
              Para qualquer página nova do produto (rotas em{" "}
              <code className="mono">app/*</code>).
            </>,
            <>
              Para decidir <strong>gutters</strong> entre componentes (use{" "}
              <code className="mono">gap-*</code> de Tailwind, não margens
              ad-hoc).
            </>,
            <>
              Quando o layout precisa <strong>reflua</strong> em mobile —
              comece pelo mobile, suba os modificadores <code className="mono">md:</code>{" "}
              <code className="mono">lg:</code>.
            </>,
          ]}
          dontUse={[
            <>Para definir cor, tipografia, radius — esses moram nos tokens.</>,
            <>Para criar um sexto layout custom sem alinhar com o time.</>,
            <>Para colocar conteúdo além de 1200 px de largura útil.</>,
          ]}
        />

        <Toc items={TOC} />

        {/* ── Princípios ─────────────────────────────────────────── */}
        <Section
          id="principles"
          title="Princípios"
          lead="Três regras inflexíveis. Tudo o mais derivam destas."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Principle
              n="01"
              title="Mobile-first"
              body="Comece pelo viewport mais estreito (sem prefixo); adicione md:, lg: pra ampliar. Nunca o contrário."
            />
            <Principle
              n="02"
              title="Gap, não margin"
              body="Espaço entre filhos é responsabilidade do pai via gap-*. Margin individual quebra o ritmo."
            />
            <Principle
              n="03"
              title="Tokens, não pixels"
              body="Padding e gap usam a escala existente (gap-2/3/4/6/8/16). Valores arbitrários (gap-[18px]) estão proibidos."
            />
          </div>
        </Section>

        {/* ── Container ──────────────────────────────────────────── */}
        <Section
          id="container"
          title="Container"
          lead="Largura máxima de 1200 px, centrado, com 40 px de padding lateral. O styleguide e o produto usam o mesmo container."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
            <div className="max-w-[1200px] mx-auto px-10 py-10 bg-[var(--bg-raised)] border-x border-dashed border-[var(--aw-blue-300)]">
              <div className="flex items-center justify-center h-32 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm text-[var(--fg-tertiary)]">
                <code className="mono">max-w-[1200px] mx-auto px-10</code>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
            <Spec
              k="max-width"
              v="1200 px"
              d="Linha de conforto pra leitura e densidade. Maior que isso quebra ritmo."
            />
            <Spec
              k="padding lateral"
              v="40 px (px-10)"
              d="Em mobile cai pra 24 px via responsivo (px-6)."
            />
            <Spec
              k="alinhamento"
              v="mx-auto"
              d="Centrado horizontal. Vertical fica com o conteúdo."
            />
          </div>
        </Section>

        {/* ── Breakpoints ────────────────────────────────────────── */}
        <Section
          id="breakpoints"
          title="Breakpoints"
          lead="Cinco breakpoints do Tailwind. O produto usa os defaults — não há overrides em tailwind.config.ts."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="pb-2 aw-eyebrow">prefix</th>
                  <th className="pb-2 aw-eyebrow">min-width</th>
                  <th className="pb-2 aw-eyebrow">uso típico</th>
                </tr>
              </thead>
              <tbody>
                {breakpoints.map((b) => (
                  <tr
                    key={b.name}
                    className="border-b border-[var(--border-subtle)] last:border-b-0 align-top"
                  >
                    <td className="py-3 pr-4 mono text-sm text-[var(--fg-primary)] whitespace-nowrap">
                      {b.name}:
                    </td>
                    <td className="py-3 pr-4 mono text-xs text-[var(--aw-blue-700)] whitespace-nowrap">
                      {b.value}
                    </td>
                    <td className="py-3 text-sm text-[var(--fg-secondary)]">
                      {b.use}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--aw-blue-200)] bg-[var(--aw-blue-100)] px-5 py-4 mt-4 text-sm text-[var(--aw-blue-900)]">
            <strong>Sem prefix</strong> = qualquer largura (a partir de 0).
            Mobile-first significa que <em>essa</em> é a regra base e os
            prefixes apenas ampliam.
          </div>
        </Section>

        {/* ── 12 colunas ─────────────────────────────────────────── */}
        <Section
          id="columns"
          title="12 colunas"
          lead="Grid de 12 colunas para layouts complexos. A maioria das telas precisa só de 1/2/3/4 colunas, mas o sistema suporta combinações 4-8, 3-6-3, etc."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
            <div className="grid grid-cols-12 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 rounded-[var(--radius-sm)] bg-[var(--aw-blue-100)] border border-[var(--aw-blue-200)] flex items-center justify-center text-xs font-medium text-[var(--aw-blue-900)]"
                >
                  {i + 1}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <ColumnExample
                spans={[12]}
                label="grid-cols-12 · col-span-12 · 100% width"
              />
              <ColumnExample
                spans={[6, 6]}
                label="2 colunas iguais · col-span-6"
              />
              <ColumnExample
                spans={[8, 4]}
                label="content + side · col-span-8 + col-span-4"
              />
              <ColumnExample
                spans={[4, 4, 4]}
                label="3 colunas iguais · col-span-4"
              />
              <ColumnExample
                spans={[3, 3, 3, 3]}
                label="4 colunas iguais · col-span-3"
              />
              <ColumnExample
                spans={[3, 6, 3]}
                label="rail + main + rail · 3 + 6 + 3"
              />
            </div>
          </div>
        </Section>

        {/* ── Gutters ────────────────────────────────────────────── */}
        <Section
          id="gutters"
          title="Gutters &amp; gaps"
          lead="Use a escala. gap-2 em tudo é tão errado quanto gap-[19px]. Cada nível tem uma intenção."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="pb-2 aw-eyebrow">class</th>
                  <th className="pb-2 aw-eyebrow">value</th>
                  <th className="pb-2 aw-eyebrow">quando usar</th>
                </tr>
              </thead>
              <tbody>
                {gaps.map((g) => (
                  <tr
                    key={g.name}
                    className="border-b border-[var(--border-subtle)] last:border-b-0 align-top"
                  >
                    <td className="py-3 pr-4 mono text-sm text-[var(--fg-primary)] whitespace-nowrap">
                      {g.name}
                    </td>
                    <td className="py-3 pr-4 mono text-xs text-[var(--aw-blue-700)] whitespace-nowrap">
                      {g.value}
                    </td>
                    <td className="py-3 text-sm text-[var(--fg-secondary)]">
                      {g.use}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--aw-blue-200)] bg-[var(--aw-blue-100)] px-5 py-4 mt-4 text-sm text-[var(--aw-blue-900)]">
            <strong>Regra de bolso.</strong> Quanto maior o componente, maior o
            gap entre eles: chips e ícones colam em <code className="mono">gap-2</code>;
            seções respiram em <code className="mono">gap-16</code>.
          </div>
        </Section>

        {/* ── Layouts canônicos ──────────────────────────────────── */}
        <Section
          id="layouts"
          title="Layouts canônicos"
          lead="Cinco moldes resolvem 95% das telas. Cada um tem um nome e um padrão de Tailwind correspondente."
        >
          <div className="flex flex-col gap-8">
            <Canonical
              n="01"
              title="Shell · sidebar + content"
              tailwind={`<div className="flex">
  <aside className="w-64 fixed h-screen">…</aside>
  <main className="flex-1 ml-64">…</main>
</div>`}
              description="Sidebar fixa de 256 px + conteúdo flex-1. É o esqueleto do produto inteiro."
              demo={
                <div className="flex h-40 rounded-[var(--radius-md)] overflow-hidden border border-[var(--border-subtle)]">
                  <div className="w-1/4 bg-[var(--aw-gray-1100)] text-[var(--aw-white)] flex items-center justify-center text-xs">
                    sidebar
                  </div>
                  <div className="flex-1 bg-[var(--bg-surface)] flex items-center justify-center text-xs text-[var(--fg-tertiary)]">
                    main
                  </div>
                </div>
              }
            />

            <Canonical
              n="02"
              title="Hero · stack centrado"
              tailwind={`<section className="max-w-[1200px] mx-auto px-10 py-16 flex flex-col items-center text-center gap-6">
  <h1>…</h1><p>…</p><AwButton size="lg">…</AwButton>
</section>`}
              description="Empilhado vertical, centrado horizontalmente. Para landing, onboarding, empty state."
              demo={
                <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-8 flex flex-col items-center text-center gap-3">
                  <div className="h-3 w-1/2 rounded-full bg-[var(--bg-muted)]" />
                  <div className="h-2 w-3/4 rounded-full bg-[var(--bg-muted)]" />
                  <div className="h-8 w-32 rounded-[var(--radius-sm)] bg-[var(--fg-primary)]" />
                </div>
              }
            />

            <Canonical
              n="03"
              title="Dashboard · grid de cards"
              tailwind={`<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(i => <AwCard key={i.id} … />)}
</div>`}
              description="Cards iguais que reflua: 1 col mobile → 2 tablet → 3 desktop. Use grid-cols, nunca flex-wrap."
              demo={
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]"
                    />
                  ))}
                </div>
              }
            />

            <Canonical
              n="04"
              title="List + detail · split view"
              tailwind={`<div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
  <aside>{/* lista */}</aside>
  <section>{/* detalhe */}</section>
</div>`}
              description="Coluna fixa de lista + detalhe flex. Mobile empilha (1 col); desktop divide. Para inbox, member detail, agent editor."
              demo={
                <div className="grid grid-cols-[140px_1fr] gap-3 h-40">
                  <div className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] flex flex-col gap-2 p-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-6 rounded-[var(--radius-xs)] bg-[var(--bg-muted)]"
                      />
                    ))}
                  </div>
                  <div className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]" />
                </div>
              }
            />

            <Canonical
              n="05"
              title="Form · coluna única"
              tailwind={`<form className="max-w-[480px] mx-auto flex flex-col gap-4">
  <AwInput label="…" />
  …
  <AwButton variant="primary" block>Salvar</AwButton>
</form>`}
              description="Largura ≤ 480 px pra leitura confortável de labels. Sempre centrado, sem grid horizontal."
              demo={
                <div className="max-w-[280px] mx-auto flex flex-col gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-8 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]"
                    />
                  ))}
                  <div className="h-8 rounded-[var(--radius-sm)] bg-[var(--fg-primary)] mt-2" />
                </div>
              }
            />
          </div>
        </Section>

        {/* ── Responsive demo ────────────────────────────────────── */}
        <Section
          id="responsive"
          title="Reflow em prática"
          lead="O mesmo layout 04 (list + detail) reflua em mobile pra coluna única. Veja:"
        >
          <ResponsiveStage
            label="Layout 04 · list + detail"
            hint="Mobile empilha; tablet começa a dividir; desktop fixa lista em 320 px."
            mobile={
              <div className="p-3 flex flex-col gap-2">
                <div className="h-24 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]" />
                <div className="h-32 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]" />
              </div>
            }
            tablet={
              <div className="p-3 grid grid-cols-[120px_1fr] gap-3">
                <div className="h-32 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]" />
                <div className="h-32 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]" />
              </div>
            }
            desktop={
              <div className="p-3 grid grid-cols-[160px_1fr] gap-3">
                <div className="h-32 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]" />
                <div className="h-32 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]" />
              </div>
            }
          />
        </Section>

        {/* ── Code ───────────────────────────────────────────────── */}
        <Section
          id="code"
          title="Em código"
          lead="Snippets prontos pra copiar. Sempre a partir do container canônico."
        >
          <CodeExample label="container padrão">{`<div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
  {/* sections com gap-16 entre elas */}
</div>`}</CodeExample>

          <CodeExample label="grid responsivo de cards">{`<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((i) => (
    <AwCard key={i.id}>{/* … */}</AwCard>
  ))}
</div>`}</CodeExample>

          <CodeExample label="list + detail (layout 04)">{`<div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
  <aside>{/* lista */}</aside>
  <section>{/* detalhe */}</section>
</div>`}</CodeExample>

          <CodeExample label="form de coluna única (layout 05)">{`<form className="max-w-[480px] mx-auto flex flex-col gap-4">
  <AwInput label="Nome" />
  <AwInput label="E-mail" />
  <AwButton variant="primary" block>
    Salvar
  </AwButton>
</form>`}</CodeExample>
        </Section>

        {/* ── Do / Don't ─────────────────────────────────────────── */}
        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>
                Mobile-first: comece sem prefixo, adicione{" "}
                <code className="mono">md:</code> <code className="mono">lg:</code>{" "}
                pra ampliar.
              </>,
              <>
                Use <code className="mono">gap-*</code> no pai, não{" "}
                <code className="mono">margin</code> no filho.
              </>,
              <>
                Sempre dentro do container 1200 px com{" "}
                <code className="mono">px-10</code>.
              </>,
              <>
                Reuse um dos 5 layouts canônicos antes de inventar outro.
              </>,
              <>
                Para grid de cards iguais, <code className="mono">grid-cols-*</code>{" "}
                — não <code className="mono">flex-wrap</code>.
              </>,
            ]}
            donts={[
              <>
                Larguras arbitrárias tipo <code className="mono">max-w-[1340px]</code>{" "}
                ou <code className="mono">px-[28px]</code>.
              </>,
              <>
                <code className="mono">gap-[19px]</code> ou qualquer valor fora
                da escala (2, 3, 4, 6, 8, 16).
              </>,
              <>Aninhar containers (container dentro de container).</>,
              <>
                Usar <code className="mono">flex</code> pra grid simétrico de N
                cards iguais — vai descalibrar quando um item for maior.
              </>,
              <>
                Esconder colunas com <code className="mono">hidden md:flex</code>{" "}
                em vez de empilhar mobile-first.
              </>,
            ]}
          />
        </Section>

        {/* ── Related ────────────────────────────────────────────── */}
        <Section id="related" title="Veja também">
          <RelatedLinks
            items={[
              {
                name: "Spacing",
                href: "/bombardier/styleguide/foundation/spacing",
                description:
                  "Escala completa de space-* — o que entra dentro do gap.",
              },
              {
                name: "Tipografia",
                href: "/bombardier/styleguide/foundation/typography",
                description: "Hierarquia tipográfica usada nos layouts.",
              },
              {
                name: "Cor",
                href: "/bombardier/styleguide/foundation/color",
                description: "Tokens de bg / fg / border consumidos.",
              },
              {
                name: "Padrões de UI",
                href: "/bombardier/styleguide/foundation/patterns",
                description: "Sequências de telas (onboarding, empty state).",
              },
            ]}
          />
        </Section>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────────── */

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

function ColumnExample({ spans, label }: { spans: number[]; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="grid grid-cols-12 gap-2">
        {spans.map((s, i) => (
          <div
            key={i}
            className="h-8 rounded-[var(--radius-sm)] bg-[var(--aw-blue-100)] border border-[var(--aw-blue-200)] flex items-center justify-center text-[10px] font-medium text-[var(--aw-blue-900)]"
            style={{ gridColumn: `span ${s} / span ${s}` }}
          >
            {s}
          </div>
        ))}
      </div>
      <div className="text-[10px] text-[var(--fg-tertiary)]">{label}</div>
    </div>
  )
}

function Canonical({
  n,
  title,
  description,
  tailwind,
  demo,
}: {
  n: string
  title: string
  description: string
  tailwind: string
  demo: React.ReactNode
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
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="p-6 bg-[var(--bg-surface)] border-b md:border-b-0 md:border-r border-[var(--border-subtle)]">
          {demo}
        </div>
        <div className="p-6">
          <CodeExample label="tailwind" lang="tsx">
            {tailwind}
          </CodeExample>
        </div>
      </div>
    </div>
  )
}
