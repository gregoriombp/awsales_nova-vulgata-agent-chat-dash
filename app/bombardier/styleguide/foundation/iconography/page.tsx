import { Icon } from "@/components/ui/Icon"
import {
  PageHero,
  Section,
  Spec,
  CodeExample,
  DoDont,
} from "../../_primitives"

const IconCell = ({ name }: { name: string }) => (
  <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] hover:bg-[var(--bg-surface)] transition-colors duration-150">
    <Icon name={name} size={24} />
    <span className="mono text-[10px] text-[var(--fg-tertiary)] text-center leading-tight">
      {name}
    </span>
  </div>
)

const navIcons = [
  "dashboard",
  "smart_toy",
  "library_books",
  "chat",
  "history",
  "settings",
  "integration_instructions",
  "monitoring",
  "folder",
  "schedule",
  "security",
  "person",
]

const actionIcons = [
  "add",
  "close",
  "check",
  "edit",
  "delete",
  "refresh",
  "search",
  "download",
  "upload",
  "share",
  "content_copy",
  "link",
  "more_horiz",
  "more_vert",
  "arrow_forward",
  "arrow_back",
  "open_in_new",
  "filter_list",
]

const stateIcons = [
  "auto_awesome",
  "bolt",
  "sync",
  "check_circle",
  "error",
  "warning",
  "info",
  "block",
  "lock",
  "visibility",
  "visibility_off",
  "notifications",
]

const sizes = [12, 16, 20, 24, 28, 32]
const weights: Array<300 | 400 | 500 | 600 | 700> = [300, 400, 500, 600, 700]

export default function IconographyPage() {
  return (
    <>
      <PageHero title="Iconografia">
        <strong>Material Symbols Rounded</strong> é o sistema de ícones da
          AwSales. Fonte variável com 4 eixos — tamanho, peso, preenchimento e
          grade — tudo herdando <code className="mono">currentColor</code>.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
<div className="flex flex-col gap-16">
        <Section
          id="anatomy"
          title="Anatomia"
          lead="Um glyph Material Symbols é controlado por quatro eixos variáveis. Todos estão expostos como props no componente Icon."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Spec
              k="opsz"
              v="20..48"
              d="Optical size. Casamos opsz = size para legibilidade."
            />
            <Spec
              k="wght"
              v="300..700"
              d="Peso. 400 default; 500/600 em contexto dark."
            />
            <Spec
              k="FILL"
              v="0 | 1"
              d="0 outlined (default); 1 filled para ativos."
            />
            <Spec
              k="GRAD"
              v="-25..200"
              d="Grade. 0 default; +ajuste fino em superfícies escuras."
            />
          </div>
        </Section>

        <Section
          id="sizes"
          title="Tamanhos"
          lead="Seis tamanhos padrão. Não misturar com valores intermediários — preserva ritmo com a tipografia."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-8 flex flex-wrap items-end gap-6">
            {sizes.map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <Icon name="auto_awesome" size={s} />
                <span className="mono text-xs text-[var(--fg-tertiary)]">
                  {s}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="weights"
          title="Pesos"
          lead="Mesmo glyph, pesos de 300 a 700. 400 é o default; 500/600 quando o ícone precisa se destacar em superfície escura."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-8 flex flex-wrap items-end gap-6">
            {weights.map((w) => (
              <div key={w} className="flex flex-col items-center gap-2">
                <Icon name="auto_awesome" size={32} weight={w} />
                <span className="mono text-xs text-[var(--fg-tertiary)]">
                  {w}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="fill"
          title="FILL — default vs filled"
          lead="FILL=1 é reservado para estados selecionados ou ativos, nunca como default decorativo."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-8 flex gap-10 items-end flex-wrap">
            {["bolt", "favorite", "star", "notifications"].map((n) => (
              <div
                key={n}
                className="flex items-end gap-4"
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon name={n} size={28} fill={0} />
                  <span className="mono text-[10px] text-[var(--fg-tertiary)]">
                    FILL 0
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Icon name={n} size={28} fill={1} />
                  <span className="mono text-[10px] text-[var(--fg-tertiary)]">
                    FILL 1
                  </span>
                </div>
                <span className="mono text-xs text-[var(--fg-tertiary)] pb-1">
                  {n}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="library"
          title="Biblioteca"
          lead="Subset usado no produto. Agrupado por função — nav, ações, estados. Biblioteca completa em fonts.google.com/icons."
        >
          <div className="mb-3 text-sm font-medium text-[var(--fg-primary)]">
            Nav
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-8">
            {navIcons.map((n) => (
              <IconCell key={n} name={n} />
            ))}
          </div>

          <div className="mb-3 text-sm font-medium text-[var(--fg-primary)]">
            Ações
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-8">
            {actionIcons.map((n) => (
              <IconCell key={n} name={n} />
            ))}
          </div>

          <div className="mb-3 text-sm font-medium text-[var(--fg-primary)]">
            Estados
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {stateIcons.map((n) => (
              <IconCell key={n} name={n} />
            ))}
          </div>
        </Section>

        <Section
          id="ai"
          title="Ícones da IA"
          lead={`Três glyphs reservados para momentos do agente — auto_awesome ("gerar"), bolt ("executar"), sync ("sincronizar com o agente").`}
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-8 flex flex-wrap gap-8 items-center">
            {(["auto_awesome", "bolt", "sync"] as const).map((n) => (
              <div key={n} className="flex items-center gap-3">
                <Icon
                  name={n}
                  size={28}
                  style={{ color: "var(--aw-blue-600)" }}
                />
                <div>
                  <div className="mono text-sm text-[var(--fg-primary)]">
                    {n}
                  </div>
                  <div className="caption">
                    {n === "auto_awesome"
                      ? "gerar · sugerir"
                      : n === "bolt"
                        ? "executar · publicar"
                        : "sincronizar"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="code"
          title="Uso em código"
          lead={`Import: import { Icon } from "@/components/ui/Icon".`}
        >
          <CodeExample>{`import { Icon } from "@/components/ui/Icon"

// Default — herda currentColor, size 20, weight 400, outlined.
<Icon name="search" />

// Size 16 dentro de um AwButton sm.
<Icon name="add" size={16} />

// Filled + cor brand — estado selecionado.
<Icon name="star" size={24} fill={1} style={{ color: "var(--aw-blue-600)" }} />

// Weight 600 em superfície escura.
<Icon name="bolt" size={24} weight={600} />`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Sempre de 12/16/20/24/28/32 px — sem intermediários.</>,
              <>Herda <code className="mono">currentColor</code> — não hardcode cor.</>,
              <>FILL=1 apenas para estado selecionado/ativo.</>,
              <>Um ícone = um significado único no produto inteiro.</>,
            ]}
            donts={[
              <>Ícone rotacionado, espelhado ou esticado.</>,
              <>Ícone decorativo colorido — cor é reservada ao acento IA.</>,
              <>Mixar Material Symbols com outro icon set.</>,
              <>Ícone pequeno demais ({"<"}12 px) em alvo clicável — fere hit target.</>,
            ]}
          />
        </Section>
      </div>
    </div>
    </>
  )
}
