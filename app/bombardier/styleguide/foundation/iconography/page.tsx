import { Icon } from "@/components/ui/Icon"
import { AwPlanIcon } from "@/components/ui/AwPlanIcon"
import {
  PageHero,
  Section,
  Spec,
  CodeExample,
  DoDont,
} from "../../_primitives"

const IconCell = ({ name }: { name: string }) => (
  <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-md border border-(--border-subtle) bg-(--bg-raised) hover:bg-(--bg-surface) transition-colors duration-150">
    <Icon name={name} size={24} />
    <span className="mono text-[10px] text-(--fg-tertiary) text-center leading-tight">
      {name}
    </span>
  </div>
)

const navIcons = [
  "dashboard",
  "chat",
  "forum",
  "hub",
  "handyman",
  "extension",
  "apps",
  "groups",
  "settings",
  "tune",
  "monitoring",
  "folder",
  "folder_open",
  "schedule",
  "library_books",
  "history",
  "person",
  "person_search",
  "shield_person",
  "security",
]

const actionIcons = [
  "add",
  "remove",
  "close",
  "cancel",
  "check",
  "edit",
  "delete",
  "delete_sweep",
  "refresh",
  "search",
  "search_off",
  "download",
  "upload",
  "share",
  "content_copy",
  "link",
  "link_off",
  "more_horiz",
  "more_vert",
  "arrow_forward",
  "arrow_back",
  "arrow_upward",
  "arrow_downward",
  "north_east",
  "open_in_new",
  "filter_list",
  "expand_more",
  "expand_less",
  "chevron_right",
  "unfold_more",
  "drag_indicator",
  "menu",
  "menu_open",
  "touch_app",
  "ads_click",
  "center_focus_strong",
  "sync_alt",
  "key",
]

const stateIcons = [
  "auto_awesome",
  "bolt",
  "sync",
  "check_circle",
  "done_all",
  "error",
  "warning",
  "info",
  "block",
  "lock",
  "visibility",
  "visibility_off",
  "notifications",
  "verified",
  "shield",
  "circle",
  "star",
  "favorite",
  "flag",
  "help",
]

const contentIcons = [
  "image",
  "photo_camera",
  "description",
  "mail",
  "phone",
  "alternate_email",
  "webhook",
  "dashboard_customize",
  "layers",
  "sell",
  "target",
  "science",
  "menu_book",
  "shopping_cart",
  "integration_instructions",
]

const financeIcons = [
  "account_balance_wallet",
  "credit_card",
  "credit_card_off",
  "receipt_long",
  "redeem",
  "payments",
  "request_quote",
]

// Glyphs sancionados para superfícies de agente/IA. `agent` é o herói — o gesto
// animado que substitui o robô; os demais marcam momentos do agente.
const agentAiIcons = [
  "agent",
  "auto_awesome",
  "bolt",
  "sync",
  "neurology",
  "psychology",
  "hub",
  "account_tree",
  "conversion_path",
  "network_intelligence",
  "polyline",
  "graph_2",
]

// Ícones representativos para demonstrar a adaptação a todos os tamanhos.
const matrixIcons = ["agent", "auto_awesome", "search", "settings", "hub"]

const sizes = [12, 16, 20, 24, 28, 32]
const weights: Array<200 | 300 | 400 | 500 | 600 | 700> = [200, 300, 400, 500, 600, 700]

export default function IconographyPage() {
  return (
    <>
      <PageHero title="Iconografia">
        <strong>Material Symbols Rounded</strong> é o sistema de ícones da
          Aswork. Fonte variável com 4 eixos — tamanho, peso, preenchimento e
          grade — tudo herdando <code className="mono">currentColor</code>.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
<div className="flex flex-col gap-16">
        <Section
          id="anatomy"
          title="Anatomia"
          lead="Um glyph Material Symbols é controlado por quatro eixos variáveis. Todos estão expostos como props no componente Icon."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Spec
              k="opsz"
              v="20..48"
              d="Optical size. Casamos opsz = size para legibilidade."
            />
            <Spec
              k="wght"
              v="200..700"
              d="Peso. 200 default (thin); 300/400 regular; 500/600 em contexto dark."
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
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-8 flex flex-wrap items-end gap-6">
            {sizes.map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <Icon name="auto_awesome" size={s} />
                <span className="text-xs text-(--fg-tertiary)">
                  {s}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6">
            <div className="mb-5 text-sm font-medium text-(--fg-primary)">
              Mesmo glyph em toda a escala — sempre nítido
            </div>
            <div className="flex flex-col gap-5">
              {matrixIcons.map((n) => (
                <div key={n} className="flex items-end gap-7">
                  <code className="mono text-xs text-(--fg-tertiary) w-32 shrink-0">
                    {n}
                  </code>
                  {sizes.map((s) => (
                    <div
                      key={s}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <Icon name={n} size={s} />
                      <span className="text-3xs text-(--fg-tertiary)">
                        {s}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section
          id="weights"
          title="Pesos"
          lead="Mesmo glyph, pesos de 200 a 700. 200 é o default (thin/light); 300/400 para ênfase regular; 500/600 quando o ícone precisa se destacar em superfície escura."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-8 flex flex-wrap items-end gap-6">
            {weights.map((w) => (
              <div key={w} className="flex flex-col items-center gap-2">
                <Icon name="auto_awesome" size={32} weight={w} />
                <span className="text-xs text-(--fg-tertiary)">
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
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-8 flex gap-10 items-end flex-wrap">
            {["bolt", "favorite", "star", "notifications"].map((n) => (
              <div
                key={n}
                className="flex items-end gap-4"
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon name={n} size={28} fill={0} />
                  <span className="text-[10px] text-(--fg-tertiary)">
                    FILL 0
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Icon name={n} size={28} fill={1} />
                  <span className="text-[10px] text-(--fg-tertiary)">
                    FILL 1
                  </span>
                </div>
                <code className="mono text-xs text-(--fg-tertiary) pb-1">
                  {n}
                </code>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="library"
          title="Biblioteca"
          lead="Todos os glyphs usados no produto, agrupados por função. Biblioteca completa em fonts.google.com/icons (estilo Rounded)."
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-(--fg-primary)">
            Agentes &amp; IA
            <span className="mono text-3xs font-normal text-(--fg-tertiary)">
              agent é animado
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-8">
            {agentAiIcons.map((n) => (
              <IconCell key={n} name={n} />
            ))}
          </div>

          <div className="mb-3 text-sm font-medium text-(--fg-primary)">
            Navegação
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-8">
            {navIcons.map((n) => (
              <IconCell key={n} name={n} />
            ))}
          </div>

          <div className="mb-3 text-sm font-medium text-(--fg-primary)">
            Ações
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-8">
            {actionIcons.map((n) => (
              <IconCell key={n} name={n} />
            ))}
          </div>

          <div className="mb-3 text-sm font-medium text-(--fg-primary)">
            Estados & Feedback
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-8">
            {stateIcons.map((n) => (
              <IconCell key={n} name={n} />
            ))}
          </div>

          <div className="mb-3 text-sm font-medium text-(--fg-primary)">
            Conteúdo & Mídia
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-8">
            {contentIcons.map((n) => (
              <IconCell key={n} name={n} />
            ))}
          </div>

          <div className="mb-3 text-sm font-medium text-(--fg-primary)">
            Financeiro
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {financeIcons.map((n) => (
              <IconCell key={n} name={n} />
            ))}
          </div>
        </Section>

        <Section
          id="ai"
          title="Ícones da IA"
          lead={`Três glyphs reservados para momentos do agente — auto_awesome ("gerar"), bolt ("executar"), sync ("sincronizar com o agente").`}
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-8 flex flex-wrap gap-8 items-center">
            {(["auto_awesome", "bolt", "sync"] as const).map((n) => (
              <div key={n} className="flex items-center gap-3">
                <Icon
                  name={n}
                  size={28}
                  style={{ color: "var(--aw-blue-600)" }}
                />
                <div>
                  <div className="mono text-sm text-(--fg-primary)">
                    {n}
                  </div>
                  <div className="caption">
                    {n === "auto_awesome"
                      ? "Gerar · sugerir"
                      : n === "bolt"
                        ? "Executar · publicar"
                        : "Sincronizar"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="agents"
          title="Agentes — o gesto, não o robô"
          lead={`Quando um agente precisa de um ícone, ele é desenhado como um gesto: uma linha contínua que se desenha sozinha, em loop. É a alternativa de marca ao robô (smart_toy). Renderiza por <Icon name="agent" /> — herda currentColor e tamanho como qualquer glyph, e o traço acompanha o eixo de peso.`}
        >
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-8 flex flex-wrap items-end gap-8">
              {sizes.map((s) => (
                <div key={s} className="flex flex-col items-center gap-2">
                  <Icon name="agent" size={s} />
                  <span className="text-xs text-(--fg-tertiary)">{s}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-8 flex items-center justify-center gap-8">
                <div className="flex flex-col items-center gap-3 opacity-50">
                  <Icon name="smart_toy" size={32} />
                  <span className="caption">Antes — robô</span>
                </div>
                <Icon
                  name="arrow_forward"
                  size={20}
                  className="text-(--fg-tertiary)"
                />
                <div className="flex flex-col items-center gap-3">
                  <Icon
                    name="agent"
                    size={32}
                    style={{ color: "var(--aw-blue-600)" }}
                  />
                  <span className="caption">Agora — o gesto do agente</span>
                </div>
              </div>

              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-8 flex items-end justify-center gap-10">
                {([200, 400, 600] as const).map((w) => (
                  <div key={w} className="flex flex-col items-center gap-2">
                    <Icon name="agent" size={32} weight={w} />
                    <span className="text-xs text-(--fg-tertiary)">
                      wght {w}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 flex items-center gap-6">
              <div className="flex flex-col items-center gap-2 shrink-0">
                <Icon name="agent" size={28} animated={false} />
                <span className="caption">animated=false</span>
              </div>
              <p className="text-sm text-(--fg-secondary) max-w-md m-0">
                A animação respeita{" "}
                <code className="mono">prefers-reduced-motion</code> e pode ser
                desligada com <code className="mono">animated={"{false}"}</code> em
                listas densas ou superfícies estáticas — o traço fica desenhado,
                parado.
              </p>
            </div>
          </div>
        </Section>

        <Section
          id="agent-gradient"
          title="O gesto em gradient"
          lead={`Mesma marca, vestida com o gradient iridescente — azul → lavanda → pêssego — em vez do azul chapado. Para o herói do agente e momentos de destaque. Renderiza por <Icon name="agent" gradient /> e aceita size, weight e animação como a versão padrão. Use com parcimônia: a versão sólida é o default; o gradient é o acento.`}
        >
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-8 flex flex-wrap items-end gap-8">
              {sizes.map((s) => (
                <div key={s} className="flex flex-col items-center gap-2">
                  <Icon name="agent" gradient size={s} />
                  <span className="text-xs text-(--fg-tertiary)">{s}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-8 flex items-center justify-center gap-8">
                <div className="flex flex-col items-center gap-3">
                  <Icon
                    name="agent"
                    size={32}
                    style={{ color: "var(--aw-blue-600)" }}
                  />
                  <span className="caption">Sólido — azul</span>
                </div>
                <Icon
                  name="arrow_forward"
                  size={20}
                  className="text-(--fg-tertiary)"
                />
                <div className="flex flex-col items-center gap-3">
                  <Icon name="agent" gradient size={32} />
                  <span className="caption">Gradient — iridescente</span>
                </div>
              </div>

              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-inverse) p-8 flex items-center justify-center gap-10">
                <div className="flex flex-col items-center gap-3">
                  <Icon name="agent" gradient size={32} />
                  <span className="text-xs text-(--fg-on-inverse) opacity-70">
                    sobre superfície escura
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="agent-studio"
          title="Glyph customizado — Agent Studio"
          lead={`Mark próprio da superfície do Agent Studio. Padrão radial de pontos com paleta greyscale fixa, desenhada à mão nos 6 tamanhos canônicos — 12px é monotonal pra preservar leitura, do 16 ao 28 ganha gradiente de 4 tons, e 32 adensa em pontos pretos uniformes pra firmar como mark de header. Renderiza via <Icon name="agent_studio" />, snap automático ao tamanho mais próximo. Cor é baked-in: não responde a currentColor, weight nem fill.`}
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-8 flex flex-wrap items-end gap-6">
            {sizes.map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <Icon name="agent_studio" size={s} />
                <span className="text-xs text-(--fg-tertiary)">
                  {s}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="plan-icons"
          title="Ícones de plano"
          lead={`Glyphs customizados, um por nível de plano. variant="dark" usa stroke/fill branco (superfícies escuras); variant="light" inverte para --fg-primary (fundos brancos). Renderiza via <AwPlanIcon plan="enterprise" />.`}
        >
          <div className="grid grid-cols-3 gap-4">
            {(["starter", "pro", "enterprise"] as const).map((p) => (
              <div key={p} className="flex flex-col gap-3">
                <div className="flex items-center justify-center rounded-lg bg-(--bg-inverse) p-10">
                  <AwPlanIcon plan={p} size={80} variant="dark" />
                </div>
                <div className="flex items-center justify-center rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-10">
                  <AwPlanIcon plan={p} size={80} variant="light" />
                </div>
                <div className="text-center">
                  <code className="mono text-xs text-(--fg-primary) capitalize">{p}</code>
                  <span className="ml-2 mono text-3xs text-(--fg-tertiary)">dark / light</span>
                </div>
              </div>
            ))}
          </div>

          <CodeExample>{`import { AwPlanIcon } from "@/components/ui/AwPlanIcon"

// Dark bg (default) — strokes/fills brancos
<AwPlanIcon plan="enterprise" />

// Bg claro — inverte para --fg-primary
<AwPlanIcon plan="starter" variant="light" size={64} />`}</CodeExample>
        </Section>

        <Section
          id="code"
          title="Uso em código"
          lead={`Import: import { Icon } from "@/components/ui/Icon".`}
        >
          <CodeExample>{`import { Icon } from "@/components/ui/Icon"

// Default — herda currentColor, size 20, weight 200 (thin), outlined.
<Icon name="search" />

// Size 16 dentro de um AwButton sm.
<Icon name="add" size={16} />

// Weight 300 para contexto regular.
<Icon name="settings" size={20} weight={300} />

// Filled + cor brand — estado selecionado.
<Icon name="star" size={24} fill={1} style={{ color: "var(--aw-blue-600)" }} />

// Weight 600 em superfície escura.
<Icon name="bolt" size={24} weight={600} />

// Agente — o gesto animado que substitui o robô. Drop-in do smart_toy.
<Icon name="agent" size={20} />

// Sem animação (listas densas / superfície estática).
<Icon name="agent" size={16} animated={false} />

// Gradient iridescente (azul → lavanda → pêssego) — herói / destaque.
<Icon name="agent" gradient size={32} />`}</CodeExample>
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
