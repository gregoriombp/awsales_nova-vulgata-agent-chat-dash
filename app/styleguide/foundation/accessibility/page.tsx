import {
  PageHero,
  Section,
  Spec,
  CodeExample,
  DoDont,
} from "../../_primitives"

function Contrast({
  bg,
  fg,
  ratio,
  pass,
  label,
}: {
  bg: string
  fg: string
  ratio: string
  pass: "AA" | "AA-large" | "fail"
  label: string
}) {
  const tag =
    pass === "AA"
      ? { text: "AA", color: "var(--aw-emerald-700)", bg: "var(--aw-emerald-100)" }
      : pass === "AA-large"
        ? { text: "AA large", color: "var(--aw-amber-700)", bg: "var(--aw-amber-100)" }
        : { text: "fail", color: "var(--aw-red-700)", bg: "var(--aw-red-100)" }
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] overflow-hidden flex flex-col">
      <div
        style={{ background: bg, color: fg }}
        className="p-5 flex items-center justify-between"
      >
        <span className="text-sm font-medium">{label}</span>
        <span className="mono text-xs">{ratio}</span>
      </div>
      <div className="px-4 py-2 bg-[var(--bg-raised)] border-t border-[var(--border-subtle)] flex items-center justify-between">
        <span className="mono text-[10px] text-[var(--fg-tertiary)]">
          {fg} on {bg}
        </span>
        <span
          className="aw-eyebrow px-2 py-0.5 rounded-[var(--radius-xs)]"
          style={{ color: tag.color, background: tag.bg }}
        >
          {tag.text}
        </span>
      </div>
    </div>
  )
}

export default function AccessibilityPage() {
  return (
    <>
      <PageHero title="Acessibilidade">
        Alvos objetivos. Toda interface nova tem que{" "}
          <strong>passar no WCAG 2.2 AA</strong> no mínimo — contraste, hit
          target, foco visível e navegação por teclado. Acessibilidade não é
          camada extra, é default.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
<div className="flex flex-col gap-16">
        <Section
          id="targets"
          title="Alvos numéricos"
          lead="Metas mensuráveis do sistema. Desvios precisam de justificativa técnica."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec
              k="contraste texto"
              v="≥ 4.5 : 1"
              d="Body e UI em geral (WCAG AA)."
            />
            <Spec
              k="contraste texto grande"
              v="≥ 3.0 : 1"
              d="≥ 18 px regular ou ≥ 14 px bold."
            />
            <Spec
              k="contraste UI"
              v="≥ 3.0 : 1"
              d="Borda de input, ícones funcionais."
            />
            <Spec
              k="hit target"
              v="≥ 44 × 44 px"
              d="Garantido via espaço ao redor em controles pequenos."
            />
            <Spec
              k="focus ring"
              v="3 px · 30% opacity"
              d="Visível em TODOS os controles via teclado."
            />
            <Spec
              k="zoom"
              v="até 200% sem perder função"
              d="Layout reflui, nunca corta conteúdo."
            />
          </div>
        </Section>

        <Section
          id="contrast"
          title="Contraste na prática"
          lead="Combinações do sistema testadas. Use como referência antes de introduzir uma nova dupla."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Contrast
              label="primary text on canvas"
              bg="#FFFFFF"
              fg="#0D0D0D"
              ratio="20.4 : 1"
              pass="AA"
            />
            <Contrast
              label="secondary text on canvas"
              bg="#FFFFFF"
              fg="#5E5E5E"
              ratio="7.0 : 1"
              pass="AA"
            />
            <Contrast
              label="tertiary text on canvas"
              bg="#FFFFFF"
              fg="#999999"
              ratio="2.9 : 1"
              pass="fail"
            />
            <Contrast
              label="primary on dark shell"
              bg="#0D0D0D"
              fg="#FFFFFF"
              ratio="20.4 : 1"
              pass="AA"
            />
            <Contrast
              label="brand blue on canvas"
              bg="#FFFFFF"
              fg="#1A5EC8"
              ratio="6.8 : 1"
              pass="AA"
            />
            <Contrast
              label="success text"
              bg="#FFFFFF"
              fg="#17825A"
              ratio="4.8 : 1"
              pass="AA"
            />
          </div>
          <p className="caption mt-4">
            <strong>Exceção conhecida:</strong>{" "}
            <code className="mono">--fg-tertiary #999999</code> fica em 2.9:1
            sobre branco e não passa AA para texto. Reserve-o para{" "}
            <em>captions</em> e metadados onde a leitura não é crítica.
          </p>
        </Section>

        <Section
          id="focus"
          title="Foco visível, sempre"
          lead="Navegação por teclado é a única forma de descobrir que um controle é interativo quando o mouse falha. Nunca esconda o outline — customize."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-8 flex flex-col gap-4 max-w-[480px]">
            <p className="body-sm text-[var(--fg-secondary)] m-0">
              Foque via <kbd className="mono text-xs px-1.5 py-0.5 rounded-[var(--radius-xs)] border border-[var(--border-default)] bg-[var(--bg-surface)]">Tab</kbd>{" "}
              nos controles abaixo — cada um tem o mesmo padrão de ring 3 px
              azul a 30%.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button className="aw-btn aw-btn--primary aw-btn--md">
                Botão primary
              </button>
              <button className="aw-btn aw-btn--secondary aw-btn--md">
                Botão secondary
              </button>
              <input
                type="text"
                placeholder="Input com focus ring"
                className="aw-input"
                style={{ height: 38, flex: 1, minWidth: 200, padding: "0 12px" }}
              />
            </div>
          </div>

          <CodeExample label="padrão de focus ring" lang="css">{`/* Mesmo padrão em todos os controles */
:focus-visible {
  outline: 0;
  box-shadow: 0 0 0 3px rgba(71, 138, 255, 0.30);
}

/* Em erro (invalid) */
.aw-input--invalid:focus-within {
  box-shadow: 0 0 0 3px rgba(168, 34, 34, 0.18);
}`}</CodeExample>
        </Section>

        <Section
          id="keyboard"
          title="Atalhos de teclado"
          lead="Padrões esperados em qualquer produto moderno. Implementar em todos os fluxos transacionais."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left px-4 py-3 aw-eyebrow border-b border-[var(--border-subtle)]">
                    Atalho
                  </th>
                  <th className="text-left px-4 py-3 aw-eyebrow border-b border-[var(--border-subtle)]">
                    Efeito
                  </th>
                  <th className="text-left px-4 py-3 aw-eyebrow border-b border-[var(--border-subtle)]">
                    Contexto
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Tab", "Avança para o próximo controle focável", "Global"],
                  ["Shift + Tab", "Volta para o controle anterior", "Global"],
                  ["Enter", "Ativa o controle focado (button, link)", "Global"],
                  ["Esc", "Fecha modal, popover, menu", "Overlay"],
                  ["Space", "Toggle switch / checkbox", "Input"],
                  ["↑ ↓", "Navega itens em lista focável", "List / combobox"],
                  ["⌘ / Ctrl + K", "Abre command palette (quando existir)", "Global"],
                  ["/", "Foca busca global", "Dashboard"],
                ].map(([k, effect, ctx]) => (
                  <tr key={k as string} className="border-b border-[var(--border-subtle)] last:border-b-0">
                    <td className="px-4 py-3">
                      <kbd className="mono text-xs px-2 py-1 rounded-[var(--radius-xs)] border border-[var(--border-default)] bg-[var(--bg-surface)]">
                        {k}
                      </kbd>
                    </td>
                    <td className="px-4 py-3 text-[var(--fg-primary)]">
                      {effect}
                    </td>
                    <td className="px-4 py-3 text-[var(--fg-tertiary)] mono text-xs">
                      {ctx}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          id="motion-sr"
          title="Movimento e leitores de tela"
          lead="Duas frentes: respeitar prefers-reduced-motion e garantir que aria-* comunique o que a UI mostra visualmente."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
              <h4 className="m-0 mb-2">Reduced motion</h4>
              <p className="body-sm text-[var(--fg-secondary)] m-0">
                Windows/macOS expõem a preferência. Todo container que tem
                loop (shimmer, thinking pulse, gradient mesh) deve zerar
                animation dentro do media query.
              </p>
              <CodeExample label="media query" lang="css">{`@media (prefers-reduced-motion: reduce) {
  .aw-pill--ai .aw-pill__dot,
  .aw-chat__dots i,
  .login-bg-animate {
    animation: none;
  }
}`}</CodeExample>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
              <h4 className="m-0 mb-2">Leitores de tela</h4>
              <p className="body-sm text-[var(--fg-secondary)] m-0 mb-3">
                Sempre que a UI comunica algo via cor, forma ou movimento, um{" "}
                <code className="mono">aria-*</code> correspondente é
                obrigatório.
              </p>
              <ul className="body-sm flex flex-col gap-2 list-disc pl-4 text-[var(--fg-secondary)]">
                <li>
                  Ícones sem label → <code className="mono">aria-label</code>{" "}
                  explícito.
                </li>
                <li>
                  Modal → <code className="mono">role=&quot;dialog&quot;</code>{" "}
                  + <code className="mono">aria-modal=&quot;true&quot;</code>.
                </li>
                <li>
                  Toggle →{" "}
                  <code className="mono">role=&quot;switch&quot;</code> +{" "}
                  <code className="mono">aria-checked</code>.
                </li>
                <li>
                  Progress → <code className="mono">role=&quot;progressbar&quot;</code>{" "}
                  + <code className="mono">aria-valuenow/min/max</code>.
                </li>
                <li>
                  Loading/streaming →{" "}
                  <code className="mono">aria-busy=&quot;true&quot;</code>.
                </li>
              </ul>
            </div>
          </div>
        </Section>

        <Section
          id="checklist"
          title="Lista de revisão"
          lead="Antes de mandar pro repo, verifique cada item. Se algum falhar, não bloqueie — mas abra a issue."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
            <ul className="flex flex-col gap-3 list-none m-0 p-0">
              {[
                "Todo texto de conteúdo passa AA (≥ 4.5:1).",
                "Focus ring visível em todos os controles interativos (teclado).",
                "Nenhuma info comunicada apenas por cor (forma, label ou ícone duplicam).",
                "Modais fecham em Esc. Clique-fora quando dismissible.",
                "Hit target ≥ 44 px em elementos clicáveis (ou padding garante).",
                "Ícones sem label explícito têm aria-label.",
                "Listas navegáveis respeitam ↑/↓; não criar keybind que conflita com leitor.",
                "Layout reflui até 200% de zoom sem scroll horizontal.",
                "prefers-reduced-motion zera loops e animações decorativas.",
                "Formulários têm <label htmlFor> conectado ao id do input.",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-[var(--fg-primary)]"
                >
                  <span
                    className="mono text-xs mt-0.5"
                    style={{ color: "var(--aw-emerald-700)" }}
                  >
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Foco visível é default, não preferência.</>,
              <>aria-* sempre que a semântica não é nativa (role=switch, dialog, etc).</>,
              <>Testar com teclado antes de testar com mouse.</>,
              <>Usar leitor de tela (VoiceOver / NVDA) em fluxos críticos.</>,
            ]}
            donts={[
              <><code className="mono">outline: none</code> sem substituir por algo visível.</>,
              <>Comunicar estado só por cor (ex.: borda vermelha sem texto).</>,
              <>Criar componente custom quando existe o nativo — use <code className="mono">&lt;button&gt;</code>, não <code className="mono">&lt;div onClick&gt;</code>.</>,
              <>Ignorar <code className="mono">prefers-reduced-motion</code>.</>,
            ]}
          />
        </Section>
      </div>
    </div>
    </>
  )
}
