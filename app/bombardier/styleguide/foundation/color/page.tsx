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
  { id: "principles", label: "Princípios" },
  { id: "primitive", label: "Paleta primitiva" },
  { id: "semantic", label: "Tokens semânticos" },
  { id: "mapping", label: "Mapping primitivo → semântico" },
  { id: "dark", label: "Light vs Dark" },
  { id: "accessibility", label: "Contraste & a11y" },
  { id: "code", label: "Em código" },
  { id: "do-dont", label: "Do / Don't" },
  { id: "quando-usar", label: "Quando usar · quando não usar" },
  { id: "related", label: "Veja também" },
]

type Swatch = {
  name: string
  token: string
  hex: string
  dark?: boolean
}

type Scale = {
  title: string
  description: string
  intent: string
  swatches: Swatch[]
}

const graySteps: Swatch[] = [
  { name: "25", token: "--aw-gray-25", hex: "#FEFEFE" },
  { name: "50", token: "--aw-gray-50", hex: "#FDFDFD" },
  { name: "100", token: "--aw-gray-100", hex: "#FBFBFB" },
  { name: "150", token: "--aw-gray-150", hex: "#F9F9F9" },
  { name: "200", token: "--aw-gray-200", hex: "#F2F2F2" },
  { name: "300", token: "--aw-gray-300", hex: "#E5E5E5" },
  { name: "400", token: "--aw-gray-400", hex: "#D1D1D1" },
  { name: "500", token: "--aw-gray-500", hex: "#B8B8B8" },
  { name: "600", token: "--aw-gray-600", hex: "#999999" },
  { name: "700", token: "--aw-gray-700", hex: "#7A7A7A", dark: true },
  { name: "800", token: "--aw-gray-800", hex: "#5E5E5E", dark: true },
  { name: "900", token: "--aw-gray-900", hex: "#454545", dark: true },
  { name: "1000", token: "--aw-gray-1000", hex: "#2F2F2F", dark: true },
  { name: "1100", token: "--aw-gray-1100", hex: "#1A1A1A", dark: true },
  { name: "1200", token: "--aw-gray-1200", hex: "#0D0D0D", dark: true },
]

const blueSteps: Swatch[] = [
  { name: "100", token: "--aw-blue-100", hex: "#F2F7FF" },
  { name: "150", token: "--aw-blue-150", hex: "#E8F0FF" },
  { name: "200", token: "--aw-blue-200", hex: "#DDEBFF" },
  { name: "300", token: "--aw-blue-300", hex: "#B8D4FF" },
  { name: "400", token: "--aw-blue-400", hex: "#8FB8FF" },
  { name: "500", token: "--aw-blue-500", hex: "#478AFF" },
  { name: "600", token: "--aw-blue-600", hex: "#2F76E6", dark: true },
  { name: "700", token: "--aw-blue-700", hex: "#1A5EC8", dark: true },
  { name: "800", token: "--aw-blue-800", hex: "#1346A2", dark: true },
  { name: "900", token: "--aw-blue-900", hex: "#0D317A", dark: true },
  { name: "1000", token: "--aw-blue-1000", hex: "#09225A", dark: true },
  { name: "1100", token: "--aw-blue-1100", hex: "#06163D", dark: true },
  { name: "1200", token: "--aw-blue-1200", hex: "#030D25", dark: true },
]

const emeraldSteps: Swatch[] = [
  { name: "100", token: "--aw-emerald-100", hex: "#F2FBF5" },
  { name: "150", token: "--aw-emerald-150", hex: "#E8F9ED" },
  { name: "200", token: "--aw-emerald-200", hex: "#DDF7E5" },
  { name: "300", token: "--aw-emerald-300", hex: "#BFF2D0" },
  { name: "400", token: "--aw-emerald-400", hex: "#99EBB8" },
  { name: "500", token: "--aw-emerald-500", hex: "#5BDF9E" },
  { name: "600", token: "--aw-emerald-600", hex: "#40C987" },
  { name: "700", token: "--aw-emerald-700", hex: "#22A871", dark: true },
  { name: "800", token: "--aw-emerald-800", hex: "#17825A", dark: true },
  { name: "900", token: "--aw-emerald-900", hex: "#105E45", dark: true },
  { name: "1000", token: "--aw-emerald-1000", hex: "#0A4230", dark: true },
  { name: "1100", token: "--aw-emerald-1100", hex: "#062B1F", dark: true },
  { name: "1200", token: "--aw-emerald-1200", hex: "#041912", dark: true },
]

const redSteps: Swatch[] = [
  { name: "100", token: "--aw-red-100", hex: "#FFF2F2" },
  { name: "150", token: "--aw-red-150", hex: "#FDE6E6" },
  { name: "200", token: "--aw-red-200", hex: "#FDDDDD" },
  { name: "300", token: "--aw-red-300", hex: "#FBBFBF" },
  { name: "400", token: "--aw-red-400", hex: "#F29999" },
  { name: "500", token: "--aw-red-500", hex: "#DF5B5B" },
  { name: "600", token: "--aw-red-600", hex: "#C94040" },
  { name: "700", token: "--aw-red-700", hex: "#A82222", dark: true },
  { name: "800", token: "--aw-red-800", hex: "#821718", dark: true },
  { name: "900", token: "--aw-red-900", hex: "#5E1010", dark: true },
  { name: "1000", token: "--aw-red-1000", hex: "#420A0A", dark: true },
  { name: "1100", token: "--aw-red-1100", hex: "#2B0606", dark: true },
  { name: "1200", token: "--aw-red-1200", hex: "#190404", dark: true },
]

const amberSteps: Swatch[] = [
  { name: "100", token: "--aw-amber-100", hex: "#FFF7ED" },
  { name: "150", token: "--aw-amber-150", hex: "#FDEFD9" },
  { name: "200", token: "--aw-amber-200", hex: "#FDE6CC" },
  { name: "300", token: "--aw-amber-300", hex: "#FCD4A3" },
  { name: "400", token: "--aw-amber-400", hex: "#F2A95B" },
  { name: "500", token: "--aw-amber-500", hex: "#E6762F" },
  { name: "600", token: "--aw-amber-600", hex: "#CC5F1E" },
  { name: "700", token: "--aw-amber-700", hex: "#B05315", dark: true },
  { name: "800", token: "--aw-amber-800", hex: "#8C4112", dark: true },
  { name: "900", token: "--aw-amber-900", hex: "#7A3A10", dark: true },
  { name: "1000", token: "--aw-amber-1000", hex: "#54270A", dark: true },
  { name: "1100", token: "--aw-amber-1100", hex: "#331806", dark: true },
  { name: "1200", token: "--aw-amber-1200", hex: "#1F0E03", dark: true },
]

const purpleSteps: Swatch[] = [
  { name: "100", token: "--aw-purple-100", hex: "#F7F2FC" },
  { name: "150", token: "--aw-purple-150", hex: "#F0E7FA" },
  { name: "200", token: "--aw-purple-200", hex: "#EADDF8" },
  { name: "300", token: "--aw-purple-300", hex: "#DBBFF2" },
  { name: "400", token: "--aw-purple-400", hex: "#C499EB" },
  { name: "500", token: "--aw-purple-500", hex: "#9E5BDF" },
  { name: "600", token: "--aw-purple-600", hex: "#8740C9" },
  { name: "700", token: "--aw-purple-700", hex: "#7122A8", dark: true },
  { name: "800", token: "--aw-purple-800", hex: "#5A1782", dark: true },
  { name: "900", token: "--aw-purple-900", hex: "#45105E", dark: true },
  { name: "1000", token: "--aw-purple-1000", hex: "#300A42", dark: true },
]

const tealSteps: Swatch[] = [
  { name: "100", token: "--aw-teal-100", hex: "#DFF7F6" },
  { name: "200", token: "--aw-teal-200", hex: "#A1E6E6" },
  { name: "400", token: "--aw-teal-400", hex: "#64D4D7" },
  { name: "500", token: "--aw-teal-500", hex: "#45CCCF" },
  { name: "600", token: "--aw-teal-600", hex: "#26C3C7" },
  { name: "700", token: "--aw-teal-700", hex: "#20B2B4", dark: true },
  { name: "900", token: "--aw-teal-900", hex: "#16908F", dark: true },
]

const pinkSteps: Swatch[] = [
  { name: "100", token: "--aw-pink-100", hex: "#FDF2F8" },
  { name: "200", token: "--aw-pink-200", hex: "#FCE3EE" },
  { name: "300", token: "--aw-pink-300", hex: "#F9C4DB" },
  { name: "400", token: "--aw-pink-400", hex: "#F490B5" },
  { name: "500", token: "--aw-pink-500", hex: "#E85C91" },
  { name: "600", token: "--aw-pink-600", hex: "#D13F76" },
  { name: "700", token: "--aw-pink-700", hex: "#A82A5C", dark: true },
  { name: "800", token: "--aw-pink-800", hex: "#801F46", dark: true },
  { name: "900", token: "--aw-pink-900", hex: "#5A1530", dark: true },
  { name: "1000", token: "--aw-pink-1000", hex: "#3B0D20", dark: true },
  { name: "1200", token: "--aw-pink-1200", hex: "#1A0610", dark: true },
]

const limeSteps: Swatch[] = [
  { name: "100", token: "--aw-lime-100", hex: "#F4FBE5" },
  { name: "200", token: "--aw-lime-200", hex: "#E4F5BE" },
  { name: "400", token: "--aw-lime-400", hex: "#BDE862" },
  { name: "500", token: "--aw-lime-500", hex: "#A1D136" },
  { name: "600", token: "--aw-lime-600", hex: "#7FAB25" },
  { name: "700", token: "--aw-lime-700", hex: "#5F8018", dark: true },
  { name: "900", token: "--aw-lime-900", hex: "#354811", dark: true },
  { name: "1200", token: "--aw-lime-1200", hex: "#111706", dark: true },
]

const slateSteps: Swatch[] = [
  { name: "100", token: "--aw-slate-100", hex: "#F4F6F8" },
  { name: "200", token: "--aw-slate-200", hex: "#E4E8EE" },
  { name: "300", token: "--aw-slate-300", hex: "#C9D0DA" },
  { name: "400", token: "--aw-slate-400", hex: "#9FA9BA" },
  { name: "500", token: "--aw-slate-500", hex: "#7886A0" },
  { name: "600", token: "--aw-slate-600", hex: "#5D6A82", dark: true },
  { name: "700", token: "--aw-slate-700", hex: "#465267", dark: true },
  { name: "800", token: "--aw-slate-800", hex: "#333D4D", dark: true },
  { name: "900", token: "--aw-slate-900", hex: "#222A36", dark: true },
  { name: "1000", token: "--aw-slate-1000", hex: "#141922", dark: true },
  { name: "1200", token: "--aw-slate-1200", hex: "#080A0E", dark: true },
]

const scales: Scale[] = [
  {
    title: "Gray",
    description: "Estrutura: fundos, chrome, texto, bordas.",
    intent: "80%+ de qualquer tela é grayscale.",
    swatches: graySteps,
  },
  {
    title: "Blue",
    description: "Cor de marca. Origem do AI gradient (blue → purple).",
    intent: "Marca está em blue, mas a interface é grayscale — uso restrito a referências explícitas à IA (Cortex).",
    swatches: blueSteps,
  },
  {
    title: "Emerald",
    description: "Success.",
    intent: "Positive states, confirmações, runs completos.",
    swatches: emeraldSteps,
  },
  {
    title: "Red",
    description: "Destructive / error.",
    intent: "Delete, revoke, falhas críticas.",
    swatches: redSteps,
  },
  {
    title: "Amber",
    description: "Warning / pendência.",
    intent: "Alertas, aprovação pendente, prazo curto.",
    swatches: amberSteps,
  },
  {
    title: "Purple",
    description: "Acento decorativo &quot;thinking&quot;.",
    intent: "Endpoint do AI gradient (blue → purple).",
    swatches: purpleSteps,
  },
  {
    title: "Teal",
    description: "Informacional + data-viz.",
    intent: "Acento neutro frio. Charts.",
    swatches: tealSteps,
  },
  {
    title: "Pink",
    description: "Highlight de marketing.",
    intent: "Use raramente — vira ruído rápido.",
    swatches: pinkSteps,
  },
  {
    title: "Lime",
    description: "Growth / positive delta.",
    intent: "Indicadores de crescimento em métricas.",
    swatches: limeSteps,
  },
  {
    title: "Slate",
    description: "Neutro frio. Alternativa a gray.",
    intent: "Chrome sutil, data-viz, ambientes mais &quot;tech&quot;.",
    swatches: slateSteps,
  },
]

const ALL_SWATCHES: Swatch[] = scales.flatMap((s) => s.swatches)

function hexFor(name: string): string {
  if (name === "aw-white") return "#FFFFFF"
  if (name === "aw-black") return "#000000"
  const sw = ALL_SWATCHES.find((s) => s.token === `--${name}`)
  return sw?.hex ?? "transparent"
}

const SEMANTIC_GROUPS: Array<{
  title: string
  items: Array<{ token: string; role: string; lightValue: string; darkValue: string }>
}> = [
  {
    title: "Surfaces",
    items: [
      { token: "--bg-canvas", role: "Fundo da página", lightValue: "aw-white", darkValue: "aw-gray-1200" },
      { token: "--bg-surface", role: "Painéis insetos sutis", lightValue: "aw-gray-150", darkValue: "aw-gray-1100" },
      { token: "--bg-raised", role: "Cards, modais", lightValue: "aw-white", darkValue: "aw-gray-1100" },
      { token: "--bg-muted", role: "Fills mudos (pílulas subtle)", lightValue: "aw-gray-200", darkValue: "aw-gray-1000" },
      { token: "--bg-hover", role: "Hover em rows / dropdown", lightValue: "aw-gray-150", darkValue: "aw-gray-1000" },
      { token: "--bg-selected", role: "Item selecionado em lista", lightValue: "aw-gray-200", darkValue: "aw-gray-900" },
      { token: "--bg-inverse", role: "Shell escuro / sidebar", lightValue: "aw-gray-1200", darkValue: "aw-white" },
    ],
  },
  {
    title: "Foreground",
    items: [
      { token: "--fg-primary", role: "Texto principal", lightValue: "aw-gray-1200", darkValue: "aw-white" },
      { token: "--fg-secondary", role: "Texto secundário", lightValue: "aw-gray-800", darkValue: "aw-gray-500" },
      { token: "--fg-tertiary", role: "Caption, metadata", lightValue: "aw-gray-600", darkValue: "aw-gray-700" },
      { token: "--fg-muted", role: "Disabled, placeholder", lightValue: "aw-gray-500", darkValue: "aw-gray-800" },
      { token: "--fg-on-inverse", role: "Texto em shell escuro", lightValue: "aw-white", darkValue: "aw-gray-1200" },
    ],
  },
  {
    title: "Borders",
    items: [
      { token: "--border-subtle", role: "Hairlines, divisores 1px", lightValue: "aw-gray-200", darkValue: "aw-gray-1100" },
      { token: "--border-default", role: "Inputs, cards", lightValue: "aw-gray-300", darkValue: "aw-gray-1000" },
      { token: "--border-strong", role: "Foco enfático", lightValue: "aw-gray-500", darkValue: "aw-gray-900" },
      { token: "--border-inverse", role: "Bordas no shell escuro", lightValue: "aw-gray-1000", darkValue: "aw-gray-300" },
    ],
  },
  {
    title: "Accents",
    items: [
      { token: "--accent-brand", role: "Primary CTA / links (grayscale, não brand blue)", lightValue: "aw-slate-900", darkValue: "aw-slate-200" },
      { token: "--accent-brand-hover", role: "Hover do accent", lightValue: "aw-slate-1000", darkValue: "aw-slate-100" },
    ],
  },
]

export default function ColorPage() {
  return (
    <>
      <PageHero title="Cor">
        Dez escalas primitivas, ~30 tokens semânticos. Grayscale é estrutura;
        blue + purple são a voz da IA; os demais são funcionais (success, error,
        warning). 80%+ de qualquer tela é gray — color é grito, use com
        parcimônia.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Toc items={TOC} />

        {/* ── Princípios ─────────────────────────────────────────── */}
        <Section
          id="principles"
          title="Princípios"
          lead="Quatro regras. Color é a parte mais tentadora de violar."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Principle
              n="01"
              title="Grayscale primeiro"
              body="Comece em gray. Adicione cor só quando a função exige (sucesso, erro, warning)."
            />
            <Principle
              n="02"
              title="Semantic, não primitive"
              body="Consuma --bg-raised, não --aw-white. Dark mode é grátis."
            />
            <Principle
              n="03"
              title="Brand ≠ interface"
              body="A marca é azul; a interface é grayscale (com black e white). O gradient blue → purple aparece somente em referências explícitas à IA (Cortex). Proporção típica: 98% grayscale, 2% gradient."
            />
            <Principle
              n="04"
              title="Cor é intent"
              body="Cada cor sinaliza intenção: vermelho para destrutivo, verde para sucesso, âmbar para aviso. Decisão funcional, nunca estética."
            />
          </div>
        </Section>

        {/* ── Primitive ──────────────────────────────────────────── */}
        <Section
          id="primitive"
          title="Paleta primitiva"
          lead="Dez escalas. Cada uma 100-1200, com peso variável conforme a função. Estas são as cores cruas — não use direto no componente."
        >
          <div className="flex flex-col gap-4">
            {scales.map((s) => (
              <SwatchStrip key={s.title} scale={s} />
            ))}
          </div>
        </Section>

        {/* ── Semantic ───────────────────────────────────────────── */}
        <Section
          id="semantic"
          title="Tokens semânticos"
          lead="A camada de aplicação. Componentes referenciam aqui — dark mode troca o valor, primitive não muda."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SEMANTIC_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="text-[var(--h6-size)] font-medium mb-3">
                  {group.title}
                </h3>
                <div className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <SemanticRow key={item.token} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Mapping ────────────────────────────────────────────── */}
        <Section
          id="mapping"
          title="Mapping primitivo → semântico"
          lead="Como o sistema decide. Light mode usa o topo da escala (cores claras como fundo); dark mode inverte. Mudar o mapping aqui muda em cascata."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="pb-2 aw-eyebrow">semantic</th>
                  <th className="pb-2 aw-eyebrow">light</th>
                  <th className="pb-2 aw-eyebrow">dark</th>
                  <th className="pb-2 aw-eyebrow">role</th>
                </tr>
              </thead>
              <tbody>
                {SEMANTIC_GROUPS.flatMap((g) =>
                  g.items.map((item) => (
                    <tr
                      key={item.token}
                      className="border-b border-[var(--border-subtle)] last:border-b-0 align-top"
                    >
                      <td className="py-2 pr-4 mono text-xs text-[var(--fg-primary)] whitespace-nowrap">
                        {item.token}
                      </td>
                      <td className="py-2 pr-4 whitespace-nowrap">
                        <MappingValueCell value={item.lightValue} />
                      </td>
                      <td className="py-2 pr-4 whitespace-nowrap">
                        <MappingValueCell value={item.darkValue} />
                      </td>
                      <td className="py-2 text-sm text-[var(--fg-secondary)]">
                        {item.role}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Light vs Dark ──────────────────────────────────────── */}
        <Section
          id="dark"
          title="Light vs Dark"
          lead="Light é o produto. Dark é o shell (sidebar, command bar) e modos opcionais de feature. Toggle vive no styleguide layout."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SurfaceCard
              label="Light · bg-raised + fg-primary"
              dark={false}
            />
            <SurfaceCard
              label="Dark · bg-raised + fg-primary"
              dark={true}
            />
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--aw-blue-200)] bg-[var(--aw-blue-100)] px-5 py-4 mt-4 text-sm text-[var(--aw-blue-900)]">
            <strong>Como ativar.</strong> O dark mode usa{" "}
            <code className="mono">class=&quot;dark&quot;</code> em algum
            ancestor — o styleguide alterna no <code className="mono">html</code>{" "}
            inteiro via ThemeToggle. Em features opt-in (shell, side modal),
            envolva localmente em <code className="mono">&lt;div className=&quot;dark&quot;&gt;</code>.
          </div>
        </Section>

        {/* ── Accessibility ──────────────────────────────────────── */}
        <Section
          id="accessibility"
          title="Contraste &amp; a11y"
          lead="WCAG AA é o piso. Todos os pares semânticos default atingem 4.5:1 (texto normal) ou 3:1 (texto grande, ícones)."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ContrastCard
              fg="--fg-primary"
              bg="--bg-canvas"
              label="Primário sobre canvas"
              ratio="≥ 18:1 · AAA"
            />
            <ContrastCard
              fg="--fg-secondary"
              bg="--bg-canvas"
              label="Secundário sobre canvas"
              ratio="≥ 7:1 · AAA"
            />
            <ContrastCard
              fg="--fg-tertiary"
              bg="--bg-canvas"
              label="Terciário sobre canvas (limite!)"
              ratio="≥ 4.5:1 · AA"
            />
            <ContrastCard
              fg="--fg-muted"
              bg="--bg-canvas"
              label="Muted · disabled · só decorativo"
              ratio="< 4.5:1 — uso restrito"
            />
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--aw-amber-300)] bg-[var(--aw-amber-100)] px-5 py-4 mt-4 text-sm text-[var(--aw-amber-900)]">
            <strong>Cuidado com fg-muted.</strong> Não passa AA. Use só pra
            texto decorativo (placeholder, disabled label). Nunca pra
            conteúdo lido pelo usuário.
          </div>
        </Section>

        {/* ── Em código ──────────────────────────────────────────── */}
        <Section
          id="code"
          title="Em código"
          lead="Sempre via CSS var. Em Tailwind, use os aliases que apontam pra var."
        >
          <CodeExample label="tailwind (aliases semânticos)">{`<div className="bg-bg-raised text-fg-primary border border-border-subtle">
  Texto principal sobre superfície elevada.
</div>

<button className="bg-brand text-fg-on-inverse hover:bg-brand-hover">
  CTA
</button>`}</CodeExample>

          <CodeExample label="CSS / style inline" lang="css">{`.aw-card {
  background: var(--bg-raised);
  color: var(--fg-primary);
  border: 1px solid var(--border-subtle);
}

.aw-card--accent {
  background: var(--aw-blue-100);
  border-color: var(--aw-blue-200);
  color: var(--aw-blue-900);
}`}</CodeExample>

          <CodeExample label="acentos primitivos (uso raro)">{`<span
  className="rounded-md px-2 py-0.5"
  style={{
    background: "var(--aw-emerald-100)",
    color: "var(--aw-emerald-900)",
  }}
>
  Concluído
</span>`}</CodeExample>
        </Section>

        {/* ── Do / Don't ─────────────────────────────────────────── */}
        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>
                Use <strong>semantic tokens</strong> em qualquer componente
                reutilizável.
              </>,
              <>
                Comece em <strong>gray</strong>; adicione cor quando a função
                pede.
              </>,
              <>
                Brand = blue. AI gradient = blue → purple. Sucesso = emerald.
                Erro = red. Warning = amber.
              </>,
              <>
                Verifique contraste no texto sobre o fundo escolhido (mínimo AA).
              </>,
            ]}
            donts={[
              <>
                <code className="mono">bg-[#1A5EC8]</code> — hex hardcoded está
                proibido.
              </>,
              <>
                Usar primitive (<code className="mono">--aw-blue-600</code>) em
                componente que precisa de dark mode.
              </>,
              <>
                Mais de uma cor de acento na mesma seção (sem ser pra erro vs
                sucesso simultâneos).
              </>,
              <>
                Usar <code className="mono">--fg-muted</code> em texto que
                precisa ser lido.
              </>,
              <>
                Inventar uma nova escala antes de tentar reusar uma existente.
              </>,
            ]}
          />
        </Section>

        {/* ── Quando usar / não usar ─────────────────────────────── */}
        <Section
          id="quando-usar"
          title="Quando usar · quando não usar"
          lead="Resumo operacional. Se está em dúvida no meio de uma feature, leia esta seção antes de escolher token."
        >
          <Tldr
            use={[
              <>
                <strong>Semantic tokens</strong> (<code className="mono">--bg-*</code>,{" "}
                <code className="mono">--fg-*</code>, <code className="mono">--border-*</code>,{" "}
                <code className="mono">--accent-*</code>) em <strong>todo componente</strong>.
              </>,
              <>
                <strong>Primitive</strong> (<code className="mono">--aw-slate-900</code>,{" "}
                etc.) só para acentos pontuais que o sistema semântico não cobre.
              </>,
              <>Light e dark se resolvem sozinhos via semantic tokens.</>,
            ]}
            dontUse={[
              <>
                Hex hardcoded — <code className="mono">bg-[#1A5EC8]</code> está
                proibido.
              </>,
              <>
                Primitive em componente reutilizável (quebra dark mode automático).
              </>,
              <>Criar nova escala antes de tentar reusar uma existente.</>,
            ]}
          />
        </Section>

        {/* ── Related ────────────────────────────────────────────── */}
        <Section id="related" title="Veja também">
          <RelatedLinks
            items={[
              {
                name: "Tipografia",
                href: "/bombardier/styleguide/foundation/typography",
                description: "Hierarquia de --fg-* aplicada nos heads/body.",
              },
              {
                name: "Spacing",
                href: "/bombardier/styleguide/foundation/spacing",
                description: "Não tem dark mode — vive paralelo a cor.",
              },
              {
                name: "Botões",
                href: "/bombardier/styleguide/components/buttons",
                description:
                  "Exemplo de componente consumindo --accent-*, --fg-on-inverse.",
              },
              {
                name: "Alertas",
                href: "/bombardier/styleguide/components/alerts",
                description: "Como danger/warning/success se materializam.",
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

function SwatchStrip({ scale }: { scale: Scale }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] overflow-hidden bg-[var(--bg-raised)]">
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-baseline justify-between gap-4">
        <div>
          <div className="font-medium text-[var(--fg-primary)]">
            {scale.title}
          </div>
          <div
            className="caption mt-0.5"
            dangerouslySetInnerHTML={{ __html: scale.description }}
          />
          <div
            className="text-xs text-[var(--fg-tertiary)] mt-1 italic"
            dangerouslySetInnerHTML={{ __html: scale.intent }}
          />
        </div>
        <div className="text-xs text-[var(--fg-tertiary)] shrink-0">
          {scale.swatches.length} steps
        </div>
      </div>
      <div className="flex flex-wrap lg:flex-nowrap">
        {scale.swatches.map((s) => (
          <div
            key={s.token}
            className="relative p-3 h-20 flex flex-col justify-between basis-1/4 md:basis-1/6 lg:basis-0 lg:flex-1 min-w-0"
            style={{
              backgroundColor: s.hex,
              color: s.dark ? "#FFFFFF" : "#0D0D0D",
            }}
          >
            <span className="text-[10px] font-medium leading-none">
              {s.name}
            </span>
            <span className="mono text-[10px] leading-none opacity-70">
              {s.hex}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SemanticRow({
  item,
}: {
  item: { token: string; role: string; lightValue: string; darkValue: string }
}) {
  const isBg = item.token.startsWith("--bg-") || item.token.startsWith("--accent-")
  const isFg = item.token.startsWith("--fg-")
  const isBorder = item.token.startsWith("--border-")

  return (
    <div className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-raised)]">
      <div
        className="w-10 h-10 rounded-[var(--radius-sm)] shrink-0 flex items-center justify-center"
        style={{
          backgroundColor: isBg ? `var(${item.token})` : "var(--bg-surface)",
          color: isFg ? `var(${item.token})` : "var(--fg-primary)",
          border: isBorder
            ? `2px solid var(${item.token})`
            : "1px solid var(--border-subtle)",
        }}
      >
        {isFg && <span className="text-sm font-semibold">Aa</span>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mono text-xs text-[var(--fg-primary)] truncate">
          {item.token}
        </div>
        <div className="text-xs text-[var(--fg-tertiary)] truncate">
          {item.role}
        </div>
      </div>
    </div>
  )
}

function SurfaceCard({ label, dark }: { label: string; dark: boolean }) {
  return (
    <div className={dark ? "dark" : ""}>
      <div
        className="rounded-[var(--radius-lg)] border overflow-hidden flex flex-col"
        style={{
          background: "var(--bg-canvas)",
          color: "var(--fg-primary)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <div className="px-5 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <span className="text-sm font-medium">{label}</span>
          <span className="aw-eyebrow">{dark ? "dark" : "light"}</span>
        </div>
        <div className="p-6 flex flex-col gap-3">
          <div
            className="p-4 rounded-[var(--radius-md)] border"
            style={{
              background: "var(--bg-raised)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <div className="text-sm font-medium">Card raised</div>
            <div
              className="text-xs mt-1"
              style={{ color: "var(--fg-secondary)" }}
            >
              Texto secundário sobre bg-raised.
            </div>
          </div>
          <div
            className="p-4 rounded-[var(--radius-md)]"
            style={{ background: "var(--bg-surface)" }}
          >
            <div className="text-sm font-medium">Surface</div>
            <div
              className="text-xs mt-1"
              style={{ color: "var(--fg-tertiary)" }}
            >
              Painel inset usando bg-surface.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MappingValueCell({ value }: { value: string }) {
  const hex = hexFor(value)
  return (
    <div className="flex items-center gap-2">
      <span
        className="w-4 h-4 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] shrink-0"
        style={{ backgroundColor: hex }}
        aria-hidden
      />
      <div className="flex flex-col leading-tight">
        <code className="mono text-xs text-[var(--fg-secondary)]">{value}</code>
        <code className="mono text-[10px] text-[var(--fg-tertiary)] uppercase">
          {hex}
        </code>
      </div>
    </div>
  )
}

function ContrastCard({
  fg,
  bg,
  label,
  ratio,
}: {
  fg: string
  bg: string
  label: string
  ratio: string
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] overflow-hidden flex flex-col">
      <div
        className="p-6 flex items-center justify-center"
        style={{
          background: `var(${bg})`,
          color: `var(${fg})`,
          minHeight: 96,
        }}
      >
        <span className="text-xl font-medium">Aa · texto exemplar</span>
      </div>
      <div className="px-4 py-3 bg-[var(--bg-raised)] border-t border-[var(--border-subtle)] flex flex-col gap-1">
        <span className="text-sm font-medium text-[var(--fg-primary)]">
          {label}
        </span>
        <div className="flex items-center justify-between">
          <code className="mono text-[10px] text-[var(--fg-tertiary)]">
            {fg} on {bg}
          </code>
          <span className="aw-eyebrow text-[var(--aw-emerald-700)]">
            {ratio}
          </span>
        </div>
      </div>
    </div>
  )
}
