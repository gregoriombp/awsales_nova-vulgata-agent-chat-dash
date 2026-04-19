import { AwButton } from "@/components/ui/AwButton"

/* ============================================================
 * Botões — AwSales Design System
 * Fonte de verdade: AwSales Design System (2).zip
 *   · design_handoff_awsales_ds_react/packages/ui/src/Button/*
 *   · design_handoff_awsales_ds_react/reference_html/componentes.html
 *   · colors_and_type.css
 * ============================================================ */

function Section({
  id,
  title,
  lead,
  children,
}: {
  id: string
  title: string
  lead?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-16">
      <div className="mb-6">
        <h2 className="m-0">{title}</h2>
        {lead && (
          <p className="text-[var(--body-md-size)] text-[var(--fg-secondary)] mt-2 max-w-2xl">
            {lead}
          </p>
        )}
      </div>
      {children}
    </section>
  )
}

function Stage({
  label,
  hint,
  children,
  dark,
}: {
  label: string
  hint?: string
  children: React.ReactNode
  dark?: boolean
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--border-subtle)] flex items-baseline justify-between">
        <div>
          <div className="text-sm font-medium text-[var(--fg-primary)]">
            {label}
          </div>
          {hint && <div className="caption mt-0.5">{hint}</div>}
        </div>
      </div>
      <div
        className="p-8 flex flex-wrap items-center gap-3"
        style={
          dark
            ? {
                backgroundColor: "var(--dark-bg)",
                color: "var(--dark-fg-primary)",
              }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  )
}

function PropRow({
  prop,
  type,
  def,
  doc,
}: {
  prop: string
  type: string
  def?: string
  doc: string
}) {
  return (
    <tr className="border-b border-[var(--border-subtle)] last:border-b-0 align-top">
      <td className="py-3 pr-4 mono text-sm text-[var(--fg-primary)] whitespace-nowrap">
        {prop}
      </td>
      <td className="py-3 pr-4 mono text-xs text-[var(--aw-blue-700)] whitespace-nowrap">
        {type}
      </td>
      <td className="py-3 pr-4 mono text-xs text-[var(--fg-tertiary)] whitespace-nowrap">
        {def ?? "—"}
      </td>
      <td className="py-3 text-sm text-[var(--fg-secondary)]">{doc}</td>
    </tr>
  )
}

function Spec({ k, v, d }: { k: string; v: string; d?: string }) {
  return (
    <div>
      <div className="aw-eyebrow mb-1">{k}</div>
      <div className="mono text-sm text-[var(--fg-primary)]">{v}</div>
      {d && <div className="caption mt-1">{d}</div>}
    </div>
  )
}

export default function ButtonsPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-10 py-14">
      <header className="mb-14">
        <h1 className="m-0">Botões</h1>
        <p className="text-[var(--body-lg-size)] text-[var(--fg-secondary)] mt-4 max-w-2xl leading-relaxed">
          Cinco variantes. <strong>Primary</strong> é alto contraste — a ação
          principal da tela. <strong>AI</strong> é reservado para ações que
          disparam o agente. Três tamanhos: 30 · 38 · 46 px. O padrão é{" "}
          <code className="mono">md</code>; <code className="mono">lg</code> só
          em CTA de hero.
        </p>
      </header>

      <div className="flex flex-col gap-16">
        {/* ───────── Variants ───────── */}
        <Section
          id="variants"
          title="Variantes"
          lead="Cinco variantes. Cada uma tem um papel definido na hierarquia de ações — não mixar arbitrariamente."
        >
          <Stage
            label="Primary · Secondary · Ghost · Danger · AI"
            hint="Ordem de hierarquia de cima pra baixo."
          >
            <AwButton variant="primary" iconLeft="add">
              Criar agente
            </AwButton>
            <AwButton variant="secondary">Duplicar</AwButton>
            <AwButton variant="ghost">Cancelar</AwButton>
            <AwButton variant="danger" iconLeft="error">
              Arquivar
            </AwButton>
            <AwButton variant="ai" iconLeft="auto_awesome">
              Gerar sugestão
            </AwButton>
          </Stage>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="flex items-center gap-3 mb-2">
                <AwButton variant="primary" size="sm" iconLeft="add">
                  Criar
                </AwButton>
              </div>
              <p className="body-sm m-0">
                Ação principal da tela. Use uma única primária por superfície.
                Fundo preto (<code className="mono">--fg-primary</code>), texto
                branco.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="flex items-center gap-3 mb-2">
                <AwButton variant="secondary" size="sm">
                  Duplicar
                </AwButton>
              </div>
              <p className="body-sm m-0">
                Ações complementares. Contorno 1px{" "}
                <code className="mono">--border-default</code>; escurece no
                hover.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="flex items-center gap-3 mb-2">
                <AwButton variant="ghost" size="sm">
                  Cancelar
                </AwButton>
              </div>
              <p className="body-sm m-0">
                Ação de baixa ênfase (cancelar, voltar). Sem borda. Hover
                recebe fill suave (<code className="mono">--bg-surface</code>).
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="flex items-center gap-3 mb-2">
                <AwButton variant="danger" size="sm" iconLeft="error">
                  Arquivar
                </AwButton>
              </div>
              <p className="body-sm m-0">
                Ações destrutivas (excluir, arquivar, revogar). Vermelho{" "}
                <code className="mono">--aw-red-700</code>. Confirmação sempre
                recomendada.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5 md:col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <AwButton variant="ai" size="sm" iconLeft="auto_awesome">
                  Gerar sugestão
                </AwButton>
              </div>
              <p className="body-sm m-0">
                Reservada para ações que invocam o agente (gerar, sugerir,
                resumir). Gradient blue → purple —{" "}
                <code className="mono">--aw-blue-600 → --aw-purple-500</code>.
                Nunca iniciar gradiente em cor quente.
              </p>
            </div>
          </div>
        </Section>

        {/* ───────── Sizes ───────── */}
        <Section
          id="sizes"
          title="Tamanhos"
          lead="Três tamanhos cobrem 100% dos usos. Uso padrão = md. lg só em CTA de hero. sm em toolbars e inline."
        >
          <Stage label="sm · md · lg" hint="30 · 38 · 46 px de altura.">
            <AwButton variant="primary" size="sm">
              Sm · 30
            </AwButton>
            <AwButton variant="primary" size="md">
              Md · 38
            </AwButton>
            <AwButton variant="primary" size="lg">
              Lg · 46
            </AwButton>
          </Stage>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
            <Spec k="sm" v="height 30 · pad 12 · 13px" d="toolbars, inline" />
            <Spec k="md" v="height 38 · pad 16 · 14px" d="padrão" />
            <Spec k="lg" v="height 46 · pad 22 · 15px" d="CTA de hero" />
          </div>
        </Section>

        {/* ───────── Icons ───────── */}
        <Section
          id="icons"
          title="Com ícone"
          lead="Ícones Material Symbols Rounded. iconLeft por padrão; iconRight só em “Próximo” ou “Ver detalhes →”."
        >
          <Stage label="iconLeft · iconRight · iconOnly">
            <AwButton variant="primary" iconLeft="add">
              Adicionar fonte
            </AwButton>
            <AwButton variant="secondary" iconRight="arrow_forward">
              Ver detalhes
            </AwButton>
            <AwButton variant="primary" iconLeft="download">
              Exportar
            </AwButton>
            <AwButton variant="ghost" iconLeft="settings">
              Configurar
            </AwButton>
            <AwButton
              variant="secondary"
              iconOnly="more_horiz"
              aria-label="Mais ações"
            />
            <AwButton
              variant="ghost"
              iconOnly="close"
              aria-label="Fechar"
            />
          </Stage>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5 mt-4 body-sm">
            <strong>Regra.</strong> Ícone 14–18 px dependendo do tamanho do
            botão. Sempre antes do texto — a única exceção é um ícone direcional
            (→, ↗) sinalizando navegação.
          </div>
        </Section>

        {/* ───────── States ───────── */}
        <Section
          id="states"
          title="Estados"
          lead="Hover translada 1px para cima; focus usa ring azul a 30%; disabled fica em 50% opacity sem pointer events."
        >
          <Stage label="default · hover · focus · loading · disabled">
            <AwButton variant="primary">Default</AwButton>
            <AwButton variant="primary" className="aw-btn--hover-preview">
              Hover
            </AwButton>
            <AwButton variant="primary" autoFocus>
              Focus
            </AwButton>
            <AwButton variant="primary" loading>
              Carregando
            </AwButton>
            <AwButton variant="primary" disabled>
              Publicado
            </AwButton>
          </Stage>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">hover</div>
              <p className="body-sm m-0">
                <code className="mono">transform: translateY(-1px)</code> +
                escurece um passo na escala da variante. Sem scale, sem bounce.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">focus-visible</div>
              <p className="body-sm m-0">
                <code className="mono">
                  box-shadow: 0 0 0 3px rgba(71,138,255,0.30)
                </code>
                . Visível apenas para navegação por teclado.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">loading</div>
              <p className="body-sm m-0">
                Spinner 14px circular à direita do label. O label fica em 60%
                opacity. Botão fica não-interativo (aria-busy).
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <div className="aw-eyebrow mb-2">disabled</div>
              <p className="body-sm m-0">
                <code className="mono">opacity: 0.5</code>,{" "}
                <code className="mono">pointer-events: none</code>. Nenhum
                efeito de hover.
              </p>
            </div>
          </div>
        </Section>

        {/* ───────── Block / Full-width ───────── */}
        <Section
          id="block"
          title="Full-width"
          lead="Block buttons ocupam 100% do container — formulários mobile, modais em coluna única e empty-states."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 max-w-[360px]">
            <AwButton variant="primary" block iconLeft="bolt">
              Publicar agora
            </AwButton>
            <div className="h-2" />
            <AwButton variant="ghost" block>
              Cancelar
            </AwButton>
          </div>
        </Section>

        {/* ───────── On dark shell ───────── */}
        <Section
          id="on-dark"
          title="Sobre shell escuro"
          lead="Tokens semânticos invertem em .dark — primary usa branco sobre preto; ghost brilha via --bg-surface. AI preserva o gradiente."
        >
          <div className="dark">
            <Stage label="Dark shell · sidebar / top-bar" dark>
              <AwButton variant="primary" iconLeft="add">
                Criar agente
              </AwButton>
              <AwButton variant="secondary">Duplicar</AwButton>
              <AwButton variant="ghost">Cancelar</AwButton>
              <AwButton variant="danger" iconLeft="error">
                Arquivar
              </AwButton>
              <AwButton variant="ai" iconLeft="auto_awesome">
                Gerar sugestão
              </AwButton>
            </Stage>
          </div>
        </Section>

        {/* ───────── Anatomy / Tokens ───────── */}
        <Section
          id="anatomy"
          title="Anatomia"
          lead="Todos os valores abaixo saem de tokens em globals.css. Não hardcodar — mudar o token, não o componente."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border-b border-[var(--border-subtle)]">
              <Spec
                k="tamanhos"
                v="sm 30 · md 38 · lg 46"
                d="Uso padrão = md. lg só em CTA de hero."
              />
              <Spec
                k="hit target"
                v="≥ 44 px (stacked)"
                d="Garantido via espaço ao redor — nunca ao arrepio do touch."
              />
              <Spec
                k="ícone"
                v="14–18 px · antes do texto"
                d="Depois do texto só em “Próximo” ou “Ver detalhes →”."
              />
              <Spec
                k="radius"
                v="--radius-md · 8px"
                d="Fixo em todas as variantes e tamanhos."
              />
              <Spec
                k="focus ring"
                v="3 px · rgba(71,138,255,0.30)"
                d="Visível apenas via teclado (focus-visible)."
              />
              <Spec
                k="motion"
                v="--dur-base · --ease-out"
                d="180ms · cubic-bezier(0.22,0.61,0.36,1)."
              />
              <Spec
                k="primary bg"
                v="--fg-primary"
                d="#0D0D0D no light; inverte em .dark para branco."
              />
              <Spec
                k="danger bg"
                v="--aw-red-700 (#A82222)"
                d="Hover cai para --aw-red-800."
              />
              <Spec
                k="ai bg"
                v="blue-600 → purple-500"
                d="Gradiente linear-90°. Nunca iniciar em cor quente."
              />
            </div>
          </div>
        </Section>

        {/* ───────── API ───────── */}
        <Section
          id="api"
          title="API"
          lead={`Import direto: import { AwButton } from "@/components/ui/AwButton".`}
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="pb-2 aw-eyebrow">prop</th>
                  <th className="pb-2 aw-eyebrow">type</th>
                  <th className="pb-2 aw-eyebrow">default</th>
                  <th className="pb-2 aw-eyebrow">doc</th>
                </tr>
              </thead>
              <tbody>
                <PropRow
                  prop="variant"
                  type='"primary" | "secondary" | "ghost" | "danger" | "ai"'
                  def='"secondary"'
                  doc="Hierarquia visual + intent. Ver seção Variantes."
                />
                <PropRow
                  prop="size"
                  type='"sm" | "md" | "lg"'
                  def='"md"'
                  doc="30 · 38 · 46 px de altura."
                />
                <PropRow
                  prop="iconLeft"
                  type="string"
                  doc="Nome de glyph Material Symbols Rounded (ex: 'add')."
                />
                <PropRow
                  prop="iconRight"
                  type="string"
                  doc="Idem, depois do label. Reservado a direções/navegação."
                />
                <PropRow
                  prop="iconOnly"
                  type="string"
                  doc="Botão quadrado apenas com ícone. Exige aria-label."
                />
                <PropRow
                  prop="loading"
                  type="boolean"
                  def="false"
                  doc="Mostra spinner, desativa interação, define aria-busy."
                />
                <PropRow
                  prop="block"
                  type="boolean"
                  def="false"
                  doc="Ocupa 100% da largura do container."
                />
                <PropRow
                  prop="disabled"
                  type="boolean"
                  def="false"
                  doc="Opacidade 0.5, sem pointer events."
                />
                <PropRow
                  prop="...rest"
                  type="ButtonHTMLAttributes"
                  doc="Qualquer prop nativa de <button> é repassada."
                />
              </tbody>
            </table>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 mt-4">
            <div className="aw-eyebrow mb-2">exemplo</div>
            <pre className="mono text-sm text-[var(--fg-primary)] m-0 whitespace-pre-wrap">{`import { AwButton } from "@/components/ui/AwButton"

<AwButton variant="primary" iconLeft="add">
  Criar agente
</AwButton>

<AwButton variant="ai" iconLeft="auto_awesome" loading>
  Gerando resposta
</AwButton>

<AwButton variant="secondary" iconOnly="more_horiz" aria-label="Mais" />`}</pre>
          </div>
        </Section>

        {/* ───────── Do / Don't ───────── */}
        <Section
          id="do-dont"
          title="Do / Don't"
          lead="Regras que vêm da documentação original — desvios são correção, não criatividade."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--aw-emerald-300)] bg-[var(--aw-emerald-100)] p-5">
              <div className="aw-eyebrow mb-2 text-[var(--aw-emerald-800)]">
                do
              </div>
              <ul className="body-sm m-0 pl-4 list-disc flex flex-col gap-1 text-[var(--aw-emerald-900)]">
                <li>Uma única primary por tela.</li>
                <li>
                  AI apenas para ações que disparam o agente (gerar, sugerir,
                  resumir).
                </li>
                <li>
                  Danger sempre acompanhado de confirmação antes de executar.
                </li>
                <li>Infinitivos nos labels: “Criar agente”, “Aprovar”.</li>
              </ul>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--aw-red-300)] bg-[var(--aw-red-100)] p-5">
              <div className="aw-eyebrow mb-2 text-[var(--aw-red-800)]">
                don&apos;t
              </div>
              <ul className="body-sm m-0 pl-4 list-disc flex flex-col gap-1 text-[var(--aw-red-900)]">
                <li>Duas primárias lado a lado.</li>
                <li>AI em ações puramente CRUD (salvar, duplicar).</li>
                <li>Emoji no label. Exclamação. “Vamos lá!”.</li>
                <li>Gradient iniciando em cor quente (laranja, rosa).</li>
                <li>Botões de 2px de borda. Sempre 1px.</li>
              </ul>
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}
