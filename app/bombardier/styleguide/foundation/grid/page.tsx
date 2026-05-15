import {
  PageHero,
  Section,
  Tldr,
  Toc,
  CodeExample,
  DoDont,
  RelatedLinks,
} from "../../_primitives"

const TOC = [
  { id: "intents", label: "Três intents" },
  { id: "tokens", label: "Tokens" },
  { id: "ultrawide", label: "Regra do ultrawide" },
  { id: "lateral", label: "Painel lateral (page-local)" },
  { id: "columns", label: "12 colunas (quando)" },
  { id: "overlay", label: "Grid em viewport real" },
  { id: "gutters", label: "Gutters & gaps" },
  { id: "viewports", label: "Viewports do produto" },
  { id: "code", label: "Em código" },
  { id: "migration", label: "Larguras hoje → recomendado" },
  { id: "do-dont", label: "Do / Don't" },
  { id: "related", label: "Veja também" },
]

/* ─────────────────────────────────────────────────────────────────── *
 * Intents — o coração do sistema. Cada página escolhe UM antes de
 * escrever qualquer max-width.
 * ─────────────────────────────────────────────────────────────────── */

const INTENTS = [
  {
    key: "narrow",
    token: "--content-narrow",
    max: 720,
    title: "narrow",
    purpose: "Leitura em uma coluna",
    when: "Forms com labels, onboarding, single-form pages, perfil. Tudo que pede leitura linha-a-linha.",
    examples: ["Perfil", "Onboarding step", "Login / signup", "Single-form modal"],
    notRight: "Conteúdo com cards em grid ou tabelas com 4+ colunas.",
    accent: "blue",
  },
  {
    key: "default",
    token: "--content-default",
    max: 1200,
    title: "default",
    purpose: "Conteúdo misto",
    when: "Páginas de documentação, catálogos, sub-páginas de settings, billing overview. Mistura de texto, cards 2-3 col e listas.",
    examples: ["Styleguide", "Integrations index", "Billing overview", "Histórico de faturas"],
    notRight: "Dashboards com 4+ KPI cards lado a lado, ou canvas de agent studio.",
    accent: "emerald",
  },
  {
    key: "wide",
    token: "--content-wide",
    max: 1440,
    title: "wide",
    purpose: "Densidade de dados",
    when: "Dashboards, tabelas grandes, canvases de visualização. Telas onde 'mais largura = mais informação útil'.",
    examples: ["Dashboard", "Agent studio canvas", "Tabela de membros", "Inbox"],
    notRight: "Páginas predominantemente textuais — vão diluir o ritmo de leitura.",
    accent: "purple",
  },
] as const

const VIEWPORTS = [
  { name: "lg", value: "1024px", use: "Laptop pequeno — floor do produto" },
  { name: "xl", value: "1280px", use: "Desktop padrão — alvo principal de design" },
  { name: "2xl", value: "1536px", use: "Monitor amplo" },
  { name: "—", value: "1920px+", use: "Ultrawide — canvas centra (ver seção acima)" },
]

const GAPS = [
  { name: "gap-2",  value: "8 px",  use: "Ícones e controles inline (toolbar, breadcrumb)" },
  { name: "gap-3",  value: "12 px", use: "Form fields, ações secundárias de modal" },
  { name: "gap-4",  value: "16 px", use: "Interior de cards (padding entre slots), grid de pills" },
  { name: "gap-6",  value: "24 px", use: "Entre cards de uma lista; gutter default da grid de página" },
  { name: "gap-8",  value: "32 px", use: "Entre blocos visuais distintos na mesma seção" },
  { name: "gap-16", value: "64 px", use: "Entre <Section> do styleguide (padrão); entre módulos de página" },
]

/* Larguras reais encontradas no app hoje (auditoria do código) e o intent
 * sugerido. Usado pra contextualizar a migração na seção "Larguras hoje". */
const REAL_WIDTHS = [
  { width: "1200 px", count: 59, where: "container canônico (styleguide, docs, várias páginas)", intent: "default" },
  { width: "1544 px", count: 10, where: "dashboard / páginas de dados", intent: "wide" },
  { width: "880 px",  count: 1,  where: "financeiro (antes do bump)", intent: "default" },
  { width: "1040 px", count: 1,  where: "financeiro (atual)", intent: "default" },
  { width: "760 px",  count: 13, where: "leads de página, blocos textuais", intent: "narrow" },
  { width: "1440 px", count: 3,  where: "agent studio, dashboard antigo", intent: "wide" },
]

export default function GridPage() {
  return (
    <>
      <PageHero title="Grid &amp; layout">
        Toda página escolhe <strong>uma intent de container</strong> — não inventa
        um <code className="mono">max-w-[1340px]</code> qualquer. São três:
        <em> narrow</em>, <em>default</em>, <em>wide</em>. Acima do limite, o
        canvas <strong>centra</strong>, nunca estica. Painéis laterais são
        decisão de página, não regra global.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>
              Toda vez que uma página nova vai pra <code className="mono">app/*</code> — escolha o intent antes de codar.
            </>,
            <>
              Pra decidir entre dois layouts: o que o conteúdo <em>quer ler</em>, não o que o monitor <em>aguenta mostrar</em>.
            </>,
            <>
              Pra justificar <strong>por que</strong> uma página tem painel lateral (só dashboard/agent studio têm hoje).
            </>,
          ]}
          dontUse={[
            <>Pra definir tipografia, cor, radius — esses moram nos tokens próprios.</>,
            <>Pra inventar um quarto intent (<code className="mono">extra-wide</code>, <code className="mono">jumbo</code>). Se cabe em <em>wide</em>, é wide.</>,
            <>Pra usar o sistema como desculpa pra estourar 1440 em página textual.</>,
          ]}
        />

        <Toc items={TOC} />

        {/* ── INTENTS ────────────────────────────────────────────── */}
        <Section
          id="intents"
          title="Três intents"
          lead="O sistema não define 'qual a largura'. A página define a intenção, e o sistema dá o número. Escolha uma das três antes de pensar em pixels."
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {INTENTS.map((i) => (
              <IntentCard key={i.key} intent={i} />
            ))}
          </div>

          <div className="mt-6">
            <IntentScaleDemo />
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--aw-blue-200)] bg-[var(--aw-blue-100)] px-5 py-4 mt-4 text-sm text-[var(--aw-blue-900)]">
            <strong>Regra de bolso.</strong> Se você está hesitando entre dois
            intents, o conteúdo provavelmente tá <em>pedindo o menor</em> — o
            maior só parece certo porque cabe na tela. Espaço sobrando ≠
            justificativa pra esticar.
          </div>
        </Section>

        {/* ── TOKENS ─────────────────────────────────────────────── */}
        <Section
          id="tokens"
          title="Tokens"
          lead="Cada intent é uma CSS var. Use sempre via var(--content-*) — nunca hardcode 720/1200/1440."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="pb-2 aw-eyebrow">token</th>
                  <th className="pb-2 aw-eyebrow">value</th>
                  <th className="pb-2 aw-eyebrow">role</th>
                </tr>
              </thead>
              <tbody>
                <TokenRow t="--content-narrow"  v="720 px"  r="Container das páginas narrow." />
                <TokenRow t="--content-default" v="1200 px" r="Container das páginas default. É o canônico." />
                <TokenRow t="--content-wide"    v="1440 px" r="Container das páginas wide (dados densos)." />
                <TokenRow t="--content-px"      v="40 px"   r="Padding lateral dentro do container." />
                <TokenRow t="--content-gutter"  v="24 px"   r="Gutter default entre cards (gap-6)." />
              </tbody>
            </table>
          </div>

          <CodeExample label="container em código" lang="tsx">{`<div className="mx-auto w-full max-w-[var(--content-default)] px-[var(--content-px)] pb-14 flex flex-col gap-16">
  {/* sections */}
</div>`}</CodeExample>
        </Section>

        {/* ── ULTRAWIDE ──────────────────────────────────────────── */}
        <Section
          id="ultrawide"
          title="Regra do ultrawide"
          lead="Acima do limite do intent, o canvas centra. Sem painéis fantasma, sem estiramento. A página em 1920 e a página em 3440 ocupam o mesmo espaço visual."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
            <div className="grid grid-cols-2 gap-6">
              <UltrawideFrame
                viewport={1280}
                contentMax={1200}
                label="1280 — encosta no max"
                hint="O conteúdo respira até 1200, com 40px de cada lado."
                variant="correct"
              />
              <UltrawideFrame
                viewport={1920}
                contentMax={1200}
                label="1920 — centra com whitespace"
                hint="Mesmo conteúdo de 1200, centrado. Os ~360px de cada lado são whitespace intencional."
                variant="correct"
              />
              <UltrawideFrame
                viewport={2560}
                contentMax={1200}
                label="2560 — continua centrado"
                hint="Não cresce. O conteúdo já alcançou o tamanho que o intent prevê."
                variant="correct"
              />
              <UltrawideFrame
                viewport={2560}
                contentMax={2560}
                label="2560 esticado (errado)"
                hint="Tabelas de 16 colunas de 140px cada. Cards de 4 com 600px cada. Diluição."
                variant="wrong"
              />
            </div>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--aw-red-300)] bg-[var(--aw-red-100)] px-5 py-4 mt-4 text-sm text-[var(--aw-red-900)]">
            <strong>Por que não esticar?</strong> Densidade cognitiva. Um gráfico
            de 12 meses esticado em 2400px tem cada mês com 200px — o olho não
            ancora. Em 1200px, cada mês ocupa ~100px, ainda dentro da fóvea
            quando você varre da esquerda pra direita.
          </div>
        </Section>

        {/* ── LATERAL ────────────────────────────────────────────── */}
        <Section
          id="lateral"
          title="Painel lateral (page-local)"
          lead="Algumas páginas têm um rail à direita — observer, copilot, AI insights, activity feed. Isso é decisão da página, não regra do sistema. Não aparece automaticamente em ultrawide."
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LateralExample
              kind="dashboard"
              title="Dashboard · canvas + observer rail"
              tw={`<div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
  <main>{/* KPIs + charts */}</main>
  <aside>{/* observer / AI insights */}</aside>
</div>`}
              description="Página declara o rail. Em viewports < xl, empilha. O rail tem largura fixa (360) porque conteúdo dele é específico — observers, métricas vivas."
            />
            <LateralExample
              kind="no-rail"
              title="Settings · sem rail"
              tw={`<div className="mx-auto max-w-[var(--content-default)] px-[var(--content-px)]">
  {/* conteúdo flui linear */}
</div>`}
              description="Mesma página em 1920 ou 3440: nunca ganha um painel só porque tem espaço. Whitespace lateral é o estado correto."
            />
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--aw-blue-200)] bg-[var(--aw-blue-100)] px-5 py-4 mt-4 text-sm text-[var(--aw-blue-900)]">
            <strong>Quando justifica um rail?</strong> O conteúdo do rail é{" "}
            <em>específico daquela página</em> (observer do dashboard, copilot
            do agent studio). Se for genérico tipo "notificações", isso vai pro
            shell do produto, não pra um rail da página.
          </div>
        </Section>

        {/* ── 12 COLUMNS ─────────────────────────────────────────── */}
        <Section
          id="columns"
          title="12 colunas (quando)"
          lead="Grid de 12 colunas existe. Mas a maioria das telas precisa de 1, 2 ou 3 colunas — não 12. Use 12 só quando estiver empacotando dados densos."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
            <div className="grid grid-cols-12 gap-[var(--content-gutter)]">
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
              <ColumnExample spans={[12]}        label="Block único · col-span-12" />
              <ColumnExample spans={[6, 6]}      label="Dois iguais · col-span-6" />
              <ColumnExample spans={[8, 4]}      label="Content + side · col-span-8 + col-span-4" />
              <ColumnExample spans={[4, 4, 4]}   label="KPIs / cards iguais · col-span-4" />
              <ColumnExample spans={[3, 3, 3, 3]} label="Quatro métricas · col-span-3" />
              <ColumnExample spans={[3, 6, 3]}   label="Rail + main + rail · 3 + 6 + 3 (raro)" />
            </div>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--aw-blue-200)] bg-[var(--aw-blue-100)] px-5 py-4 mt-4 text-sm text-[var(--aw-blue-900)]">
            <strong>Atalho.</strong> Pra "cards iguais", use{" "}
            <code className="mono">grid-cols-3 gap-6</code> direto — não{" "}
            <code className="mono">grid-cols-12 col-span-4</code>. Mais simples,
            mesmo resultado. Se um card precisa ser mais largo em monitor
            amplo, aí sim <code className="mono">xl:grid-cols-4</code>.
          </div>
        </Section>

        {/* ── OVERLAY ────────────────────────────────────────────── */}
        <Section
          id="overlay"
          title="Grid em viewport real"
          lead="Overlay tipo Figma — colunas tintadas e gutters em branco — mostrando como cada intent ocupa o canvas em diferentes viewports desktop. Padding 40, gutter 24, 12 colunas."
        >
          <div className="flex flex-col gap-6">
            <OverlayRow
              title="Mesmo intent, viewports diferentes"
              caption="default (1200px) em xl, 2xl e ultrawide. Container fica do mesmo tamanho — o que muda é o whitespace lateral."
              frames={[
                { viewport: 1280, contentMax: 1200, intent: "default" },
                { viewport: 1536, contentMax: 1200, intent: "default" },
                { viewport: 1920, contentMax: 1200, intent: "default" },
              ]}
            />
            <OverlayRow
              title="Mesmo viewport, intents diferentes"
              caption="xl (1280px) com narrow, default e wide. wide encosta nas margens; narrow respira muito; default é o middle ground."
              frames={[
                { viewport: 1280, contentMax: 720, intent: "narrow" },
                { viewport: 1280, contentMax: 1200, intent: "default" },
                { viewport: 1280, contentMax: 1280, intent: "wide", note: "wide clampa a 1280 aqui" },
              ]}
            />
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--aw-blue-200)] bg-[var(--aw-blue-100)] px-5 py-4 mt-4 text-sm text-[var(--aw-blue-900)]">
            <strong>Como ler.</strong> Os tons rosados são as 12 colunas. As
            faixas brancas no meio são os gutters de 24px. O espaço cinza fora
            do container é whitespace — é desktop respirando, não tela
            desperdiçada.
          </div>
        </Section>

        {/* ── GUTTERS ────────────────────────────────────────────── */}
        <Section
          id="gutters"
          title="Gutters &amp; gaps"
          lead="A escala existe pra ser usada. gap-2 em tudo é tão errado quanto gap-[19px]. Cada nível tem uma intenção."
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
                {GAPS.map((g) => (
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
            gap entre eles: chips colam em <code className="mono">gap-2</code>,
            cards respiram em <code className="mono">gap-6</code>, seções em{" "}
            <code className="mono">gap-16</code>. Nunca <code className="mono">margin</code>{" "}
            individual no filho — gap no pai.
          </div>
        </Section>

        {/* ── VIEWPORTS ──────────────────────────────────────────── */}
        <Section
          id="viewports"
          title="Viewports do produto"
          lead="AwSales é desktop. Floor é lg (1024px), alvo principal é xl (1280px). Não existe layout mobile/tablet — abaixo de lg não é cenário de produto."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="pb-2 aw-eyebrow">prefix</th>
                  <th className="pb-2 aw-eyebrow">min-width</th>
                  <th className="pb-2 aw-eyebrow">papel</th>
                </tr>
              </thead>
              <tbody>
                {VIEWPORTS.map((b) => (
                  <tr
                    key={b.name + b.value}
                    className="border-b border-[var(--border-subtle)] last:border-b-0 align-top"
                  >
                    <td className="py-3 pr-4 mono text-sm text-[var(--fg-primary)] whitespace-nowrap">
                      {b.name}
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
            <strong>Sem prefixos pequenos no produto.</strong> Não use{" "}
            <code className="mono">sm:</code> nem <code className="mono">md:</code>{" "}
            em código de página — eles miram viewports abaixo do floor. Use{" "}
            <code className="mono">xl:</code> e <code className="mono">2xl:</code>{" "}
            só quando houver diferença legítima dentro do desktop (ex.: rail
            aparece em <code className="mono">xl:</code>, empilha em{" "}
            <code className="mono">lg:</code>).
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--aw-amber-300)] bg-[var(--aw-amber-100)] px-5 py-4 mt-4 text-sm text-[var(--aw-amber-900)]">
            <strong>Abaixo de 1024.</strong> Mostrar uma tela de bloqueio
            pedindo pro usuário acessar via desktop ou tablet. Não é reflow,
            não é "tela maior por favor" simpaticamente — é um state explícito
            do app. Componente ainda não existe (TODO){" "}
            <code className="mono">app/_components/DesktopOnlyBlocker</code>.
          </div>
        </Section>

        {/* ── CODE ───────────────────────────────────────────────── */}
        <Section
          id="code"
          title="Em código"
          lead="Snippets canônicos. Sempre via tokens, nunca hardcoded."
        >
          <CodeExample label="container narrow (forms, perfil)">{`<div className="mx-auto w-full max-w-[var(--content-narrow)] px-[var(--content-px)] pb-14 flex flex-col gap-16">
  {/* form fields, single-column reading */}
</div>`}</CodeExample>

          <CodeExample label="container default (a maioria das páginas)">{`<div className="mx-auto w-full max-w-[var(--content-default)] px-[var(--content-px)] pb-14 flex flex-col gap-16">
  {/* docs, catálogos, settings, billing overview */}
</div>`}</CodeExample>

          <CodeExample label="container wide (dashboard, agent studio)">{`<div className="mx-auto w-full max-w-[var(--content-wide)] px-[var(--content-px)] pb-14 flex flex-col gap-16">
  {/* KPIs, charts, big tables */}
</div>`}</CodeExample>

          <CodeExample label="dashboard wide + observer rail (page-local)">{`<div className="mx-auto w-full max-w-[var(--content-wide)] px-[var(--content-px)] pb-14">
  <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
    <main className="flex flex-col gap-6">{/* canvas */}</main>
    <aside className="flex flex-col gap-4">{/* observer */}</aside>
  </div>
</div>`}</CodeExample>

          <CodeExample label="grid de cards iguais (desktop)">{`<div className="grid grid-cols-3 gap-6">
  {items.map((i) => (
    <AwCard key={i.id}>{/* … */}</AwCard>
  ))}
</div>`}</CodeExample>

          <CodeExample label="form de coluna única dentro de narrow">{`<form className="max-w-[480px] mx-auto flex flex-col gap-4">
  <AwInput label="Nome" />
  <AwInput label="E-mail" />
  <AwButton variant="primary" block>Salvar</AwButton>
</form>`}</CodeExample>
        </Section>

        {/* ── MIGRATION ──────────────────────────────────────────── */}
        <Section
          id="migration"
          title="Larguras hoje → recomendado"
          lead="Auditoria das larguras que aparecem no código hoje, com o intent que a página deveria adotar. Não migra tudo de uma vez — converte por página, quando você tocar nela."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="pb-2 aw-eyebrow">largura atual</th>
                  <th className="pb-2 aw-eyebrow">ocorrências</th>
                  <th className="pb-2 aw-eyebrow">onde</th>
                  <th className="pb-2 aw-eyebrow">intent sugerido</th>
                </tr>
              </thead>
              <tbody>
                {REAL_WIDTHS.map((row) => (
                  <tr
                    key={row.width}
                    className="border-b border-[var(--border-subtle)] last:border-b-0 align-top"
                  >
                    <td className="py-3 pr-4 mono text-sm text-[var(--fg-primary)] whitespace-nowrap">
                      {row.width}
                    </td>
                    <td className="py-3 pr-4 mono text-xs text-[var(--fg-tertiary)] whitespace-nowrap">
                      {row.count}×
                    </td>
                    <td className="py-3 pr-4 text-sm text-[var(--fg-secondary)]">
                      {row.where}
                    </td>
                    <td className="py-3 mono text-xs whitespace-nowrap">
                      <code className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--aw-blue-100)] text-[var(--aw-blue-900)]">
                        {row.intent}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--aw-blue-200)] bg-[var(--aw-blue-100)] px-5 py-4 mt-4 text-sm text-[var(--aw-blue-900)]">
            <strong>Estratégia.</strong> Cada vez que você tocar numa página
            que ainda usa largura hardcoded, troque pelo intent. Não fazer big
            bang. O sistema antigo (1200 universal) e o novo coexistem sem
            quebrar nada.
          </div>
        </Section>

        {/* ── DO / DON'T ─────────────────────────────────────────── */}
        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Escolher um dos três intents antes de codar um <code className="mono">max-w-*</code>.</>,
              <>Usar <code className="mono">var(--content-default)</code>, nunca <code className="mono">max-w-[1200px]</code> hardcoded.</>,
              <>Em ultrawide: deixar centrar. Whitespace é estado correto.</>,
              <>Declarar painéis laterais <em>na página</em>, com conteúdo específico.</>,
              <>Floor é <code className="mono">lg</code> (1024). Use <code className="mono">xl:</code> só pra diferenças legítimas dentro do desktop.</>,
              <>Usar <code className="mono">gap-*</code> no pai pra controlar respiro.</>,
            ]}
            donts={[
              <>Inventar um intent novo (<code className="mono">extra-wide</code>, <code className="mono">jumbo</code>).</>,
              <>Esticar tabelas / charts pra ocupar 100% do ultrawide.</>,
              <>Adicionar painéis "AI insights" só porque a tela é grande.</>,
              <>Documentar reflow mobile/tablet — produto é desktop-only.</>,
              <>Usar <code className="mono">sm:</code> ou <code className="mono">md:</code> em código de página de produto.</>,
              <>Usar <code className="mono">grid-cols-12</code> pra um grid de 3 cards iguais.</>,
              <>Aninhar containers (container dentro de container).</>,
            ]}
          />
        </Section>

        {/* ── RELATED ────────────────────────────────────────────── */}
        <Section id="related" title="Veja também">
          <RelatedLinks
            items={[
              {
                name: "Spacing",
                href: "/bombardier/styleguide/foundation/spacing",
                description: "A escala space-* que alimenta os gaps e paddings.",
              },
              {
                name: "Tipografia",
                href: "/bombardier/styleguide/foundation/typography",
                description: "Hierarquia que decide quanto texto cabe num intent.",
              },
              {
                name: "Cor",
                href: "/bombardier/styleguide/foundation/color",
                description: "Tokens de bg / fg / border consumidos pelos blocos.",
              },
              {
                name: "Padrões de UI",
                href: "/bombardier/styleguide/foundation/patterns",
                description: "Sequências de telas que usam os intents em prática.",
              },
            ]}
          />
        </Section>
      </div>
    </>
  )
}

/* ─────────────────────────────────────────────────────────────────── *
 * Demos / sub-componentes locais
 * ─────────────────────────────────────────────────────────────────── */

type Intent = (typeof INTENTS)[number]

const ACCENT_BG: Record<Intent["accent"], string> = {
  blue: "var(--aw-blue-100)",
  emerald: "var(--aw-emerald-100)",
  purple: "var(--aw-purple-100)",
}
const ACCENT_BORDER: Record<Intent["accent"], string> = {
  blue: "var(--aw-blue-300)",
  emerald: "var(--aw-emerald-300)",
  purple: "var(--aw-purple-300)",
}
const ACCENT_FG: Record<Intent["accent"], string> = {
  blue: "var(--aw-blue-900)",
  emerald: "var(--aw-emerald-900)",
  purple: "var(--aw-purple-900)",
}

function IntentCard({ intent }: { intent: Intent }) {
  return (
    <div
      className="rounded-[var(--radius-lg)] border bg-[var(--bg-raised)] p-5 flex flex-col gap-3"
      style={{ borderColor: ACCENT_BORDER[intent.accent] }}
    >
      <div className="flex items-baseline justify-between">
        <div
          className="aw-eyebrow"
          style={{ color: ACCENT_FG[intent.accent] }}
        >
          {intent.title}
        </div>
        <code className="mono text-xs text-[var(--fg-tertiary)]">
          {intent.max}px
        </code>
      </div>
      <div>
        <div className="text-base font-medium text-[var(--fg-primary)]">
          {intent.purpose}
        </div>
        <code className="mono text-[10px] text-[var(--fg-tertiary)]">
          {intent.token}
        </code>
      </div>
      <p className="body-sm m-0 text-[var(--fg-secondary)]">{intent.when}</p>
      <div
        className="rounded-[var(--radius-sm)] px-3 py-2 text-xs"
        style={{
          backgroundColor: ACCENT_BG[intent.accent],
          color: ACCENT_FG[intent.accent],
        }}
      >
        <div className="aw-eyebrow mb-1" style={{ color: ACCENT_FG[intent.accent] }}>
          exemplos
        </div>
        <div className="text-[var(--fg-primary)]">
          {intent.examples.join(" · ")}
        </div>
      </div>
      <div className="caption mt-auto">
        <strong>Não é certo pra:</strong> {intent.notRight}
      </div>
    </div>
  )
}

/**
 * IntentScaleDemo — mostra os três intents na mesma escala, lado a lado,
 * com o mesmo viewport simulado (1600px) por trás. Faz a diferença de
 * largura ficar visceral.
 */
function IntentScaleDemo() {
  const viewport = 1600
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--border-subtle)] flex items-baseline justify-between">
        <div>
          <div className="text-sm font-medium text-[var(--fg-primary)]">
            Mesma página em três intents
          </div>
          <div className="caption mt-0.5">
            Viewport simulado: 1600px (típico desktop). Os três contêineres
            centram dentro dele.
          </div>
        </div>
      </div>
      <div className="p-6 flex flex-col gap-4 bg-[var(--bg-surface)]">
        {INTENTS.map((i) => (
          <IntentFrame key={i.key} intent={i} viewport={viewport} />
        ))}
      </div>
    </div>
  )
}

function IntentFrame({ intent, viewport }: { intent: Intent; viewport: number }) {
  const widthPct = (intent.max / viewport) * 100
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <div className="aw-eyebrow" style={{ color: ACCENT_FG[intent.accent] }}>
          {intent.title}
        </div>
        <code className="mono text-[10px] text-[var(--fg-tertiary)]">
          {intent.max}px · {Math.round(widthPct)}% do viewport
        </code>
      </div>
      <div className="relative h-14 rounded-[var(--radius-sm)] border border-dashed border-[var(--border-subtle)] bg-[var(--bg-canvas)] overflow-hidden">
        <div
          className="absolute top-0 bottom-0 rounded-[var(--radius-sm)] flex items-center justify-center"
          style={{
            left: `${(100 - widthPct) / 2}%`,
            width: `${widthPct}%`,
            backgroundColor: ACCENT_BG[intent.accent],
            border: `1px solid ${ACCENT_BORDER[intent.accent]}`,
            color: ACCENT_FG[intent.accent],
          }}
        >
          <span className="text-xs font-medium">
            conteúdo · {intent.max}px
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * UltrawideFrame — visualiza o canvas dentro de um viewport simulado.
 * variant="correct" mostra o conteúdo no max do intent, centrado.
 * variant="wrong" mostra o conteúdo esticado em 100% do viewport.
 */
function UltrawideFrame({
  viewport,
  contentMax,
  label,
  hint,
  variant,
}: {
  viewport: number
  contentMax: number
  label: string
  hint: string
  variant: "correct" | "wrong"
}) {
  // simulação proporcional dentro de uma "moldura" de 100% de largura
  const refViewport = 2560
  const viewportPct = (viewport / refViewport) * 100
  const widthPct = (contentMax / viewport) * 100
  const isWrong = variant === "wrong"
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-medium text-[var(--fg-primary)]">
          {label}
        </div>
        <code className="mono text-[10px] text-[var(--fg-tertiary)]">
          {viewport}px
        </code>
      </div>
      <div
        className="relative h-20 rounded-[var(--radius-sm)] border bg-[var(--bg-canvas)] overflow-hidden mx-auto"
        style={{
          width: `${viewportPct}%`,
          borderColor: isWrong ? "var(--aw-red-300)" : "var(--border-subtle)",
        }}
      >
        <div
          className="absolute top-0 bottom-0 flex items-center justify-center"
          style={{
            left: `${(100 - widthPct) / 2}%`,
            width: `${widthPct}%`,
            backgroundColor: isWrong
              ? "var(--aw-red-100)"
              : "var(--aw-emerald-100)",
            borderLeft: `1px solid ${
              isWrong ? "var(--aw-red-300)" : "var(--aw-emerald-300)"
            }`,
            borderRight: `1px solid ${
              isWrong ? "var(--aw-red-300)" : "var(--aw-emerald-300)"
            }`,
            color: isWrong ? "var(--aw-red-900)" : "var(--aw-emerald-900)",
          }}
        >
          <span className="text-[10px] font-medium">
            {contentMax}px
          </span>
        </div>
      </div>
      <div className="caption">{hint}</div>
    </div>
  )
}

/**
 * LateralExample — uma página com vs sem rail. Não interativa, só visual.
 */
function LateralExample({
  kind,
  title,
  tw,
  description,
}: {
  kind: "dashboard" | "no-rail"
  title: string
  tw: string
  description: string
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
        <div className="text-sm font-medium text-[var(--fg-primary)]">
          {title}
        </div>
        <p className="mt-1 mb-0 body-sm text-[var(--fg-secondary)]">
          {description}
        </p>
      </div>
      <div className="p-6 bg-[var(--bg-surface)] flex-1 flex items-center justify-center">
        {kind === "dashboard" ? (
          <div className="w-full max-w-[420px] grid grid-cols-[1fr_120px] gap-3">
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 rounded-[var(--radius-xs)] bg-[var(--bg-raised)] border border-[var(--border-subtle)]"
                  />
                ))}
              </div>
              <div className="h-24 rounded-[var(--radius-sm)] bg-[var(--bg-raised)] border border-[var(--border-subtle)]" />
            </div>
            <div className="rounded-[var(--radius-sm)] border border-dashed border-[var(--aw-blue-300)] bg-[var(--aw-blue-100)] flex items-center justify-center text-[10px] text-[var(--aw-blue-900)] font-medium">
              observer
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[420px] flex flex-col gap-2">
            <div className="h-8 rounded-[var(--radius-xs)] bg-[var(--bg-raised)] border border-[var(--border-subtle)]" />
            <div className="h-24 rounded-[var(--radius-sm)] bg-[var(--bg-raised)] border border-[var(--border-subtle)]" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-16 rounded-[var(--radius-sm)] bg-[var(--bg-raised)] border border-[var(--border-subtle)]" />
              <div className="h-16 rounded-[var(--radius-sm)] bg-[var(--bg-raised)] border border-[var(--border-subtle)]" />
            </div>
          </div>
        )}
      </div>
      <div className="p-6 border-t border-[var(--border-subtle)]">
        <CodeExample label="tailwind" lang="tsx">
          {tw}
        </CodeExample>
      </div>
    </div>
  )
}

function TokenRow({ t, v, r }: { t: string; v: string; r: string }) {
  return (
    <tr className="border-b border-[var(--border-subtle)] last:border-b-0 align-top">
      <td className="py-3 pr-4 mono text-sm text-[var(--fg-primary)] whitespace-nowrap">
        {t}
      </td>
      <td className="py-3 pr-4 mono text-xs text-[var(--aw-blue-700)] whitespace-nowrap">
        {v}
      </td>
      <td className="py-3 text-sm text-[var(--fg-secondary)]">{r}</td>
    </tr>
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

/* ─────────────────────────────────────────────────────────────────── *
 * Grid overlay (Figma-style) — colunas tintadas, gutters em branco,
 * tudo proporcional ao viewport simulado. Nada de pixel real: tudo em %
 * pra escalar com o tamanho da frame na página.
 * ─────────────────────────────────────────────────────────────────── */

type OverlayFrame = {
  viewport: number
  contentMax: number
  intent: "narrow" | "default" | "wide"
  note?: string
}

const INTENT_TINT: Record<OverlayFrame["intent"], { col: string; border: string; fg: string }> = {
  narrow:  { col: "var(--aw-blue-150)",    border: "var(--aw-blue-300)",    fg: "var(--aw-blue-800)" },
  default: { col: "var(--aw-emerald-150)", border: "var(--aw-emerald-300)", fg: "var(--aw-emerald-800)" },
  wide:    { col: "var(--aw-purple-150)",  border: "var(--aw-purple-300)",  fg: "var(--aw-purple-800)" },
}

function OverlayRow({
  title,
  caption,
  frames,
}: {
  title: string
  caption: string
  frames: OverlayFrame[]
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--border-subtle)]">
        <div className="text-sm font-medium text-[var(--fg-primary)]">
          {title}
        </div>
        <div className="caption mt-0.5">{caption}</div>
      </div>
      <div className="p-6 bg-[var(--bg-surface)] flex flex-col gap-5">
        {frames.map((f, i) => (
          <GridOverlayFrame key={i} {...f} />
        ))}
      </div>
    </div>
  )
}

function GridOverlayFrame({ viewport, contentMax, intent, note }: OverlayFrame) {
  const padding = 40
  const gutter = 24
  const innerWidth = contentMax - 2 * padding
  const tint = INTENT_TINT[intent]

  // % do viewport ocupados pelo container
  const containerPct = (contentMax / viewport) * 100
  // padding lateral como % da largura do container
  const paddingPctOfContainer = (padding / contentMax) * 100
  // gutter como % do content-box do grid (que é innerWidth)
  const gapPctOfInner = (gutter / innerWidth) * 100

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <span className="aw-eyebrow" style={{ color: tint.fg }}>
            {intent}
          </span>
          <span className="text-xs text-[var(--fg-secondary)]">
            container <span className="mono">{contentMax}px</span>
          </span>
        </div>
        <code className="mono text-[10px] text-[var(--fg-tertiary)]">
          viewport {viewport}px
        </code>
      </div>
      <div
        className="relative rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] overflow-hidden"
        style={{ height: 88 }}
      >
        {/* container */}
        <div
          className="absolute top-0 bottom-0 flex"
          style={{
            left: `${(100 - containerPct) / 2}%`,
            width: `${containerPct}%`,
            borderLeft: `1px dashed ${tint.border}`,
            borderRight: `1px dashed ${tint.border}`,
            paddingLeft: `${paddingPctOfContainer}%`,
            paddingRight: `${paddingPctOfContainer}%`,
            boxSizing: "border-box",
          }}
        >
          {/* 12 columns grid */}
          <div
            className="flex-1 h-full"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(12, 1fr)",
              columnGap: `${gapPctOfInner}%`,
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: tint.col,
                  borderLeft: `1px solid ${tint.border}`,
                  borderRight: `1px solid ${tint.border}`,
                }}
              />
            ))}
          </div>
        </div>

        {/* padding label, only if there's room */}
        {containerPct < 95 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 mono text-[9px] text-[var(--fg-tertiary)]"
            style={{ left: 8 }}
          >
            {Math.round(((viewport - contentMax) / 2))}px
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <code className="mono text-[10px] text-[var(--fg-tertiary)]">
          12 cols · gap {gutter}px · padding {padding}px · inner {innerWidth}px ·
          col ≈ {Math.round((innerWidth - (gutter * 11)) / 12)}px
        </code>
        {note && (
          <span className="caption" style={{ color: tint.fg }}>
            {note}
          </span>
        )}
      </div>
    </div>
  )
}

