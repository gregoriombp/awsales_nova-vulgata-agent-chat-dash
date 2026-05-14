import { AwButton } from "@/components/ui/AwButton"
import {
  PageHero,
  Section,
  Stage,
  Spec,
  Tldr,
  Toc,
  StatesMatrix,
  PropRow,
  ApiTable,
  TokensConsumed,
  ResponsiveStage,
  KeyboardTable,
  CodeExample,
  DoDont,
  RelatedLinks,
} from "../../_primitives"

/* ============================================================
 * AwButton — página exemplar do padrão canônico do styleguide.
 * Doc do padrão: docs/styleguide-page-structure.md
 * Componente: components/ui/AwButton.tsx
 * ============================================================ */

const TOC = [
  { id: "anatomy", label: "Anatomia" },
  { id: "variants", label: "Variantes" },
  { id: "sizes", label: "Tamanhos" },
  { id: "states", label: "Estados" },
  { id: "composition", label: "Composition" },
  { id: "responsive", label: "Responsivo" },
  { id: "api", label: "API" },
  { id: "tokens", label: "Tokens consumidos" },
  { id: "accessibility", label: "Acessibilidade" },
  { id: "code", label: "Em código" },
  { id: "do-dont", label: "Do / Don't" },
  { id: "related", label: "Veja também" },
]

export default function ButtonsPage() {
  return (
    <>
      <PageHero title="Botões">
        Seis variantes, três tamanhos. <strong>Primary</strong> é alto
        contraste — uma só por tela. <strong>AI</strong> é reservado para ações
        que disparam o agente. <strong>Subtle</strong> é a pílula tonal entre
        ghost e secondary, indicada pra row actions em tabelas.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        {/* ── 2. Tldr ──────────────────────────────────────────────── */}
        <Tldr
          use={[
            <>Como CTA principal da tela (uma única primary).</>,
            <>Disparar uma ação clara e nomeável (verbo no infinitivo).</>,
            <>Em formulários, modais, tabelas, toolbars, empty states.</>,
            <>
              Em ações que invocam o agente (gerar, resumir, sugerir) — variant
              <code className="mono"> ai</code>.
            </>,
          ]}
          dontUse={[
            <>Para navegar entre páginas — use link/AwBreadcrumb.</>,
            <>Como toggle binário — use AwSwitch / AwCheckbox.</>,
            <>Como seletor de uma de várias opções — use AwPill ou tabs.</>,
            <>Mais de uma primary lado a lado na mesma tela.</>,
          ]}
        />

        {/* ── 3. Toc ───────────────────────────────────────────────── */}
        <Toc items={TOC} />

        {/* ── 4. Anatomy ───────────────────────────────────────────── */}
        <Section
          id="anatomy"
          title="Anatomia"
          lead="Quatro partes nomeadas, todas plugadas a tokens. O componente nunca hardcoda valores — mude o token, não o CSS."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-10 flex items-center justify-center">
            <AwButton variant="primary" size="lg" iconLeft="add">
              Criar agente
            </AwButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
            <Spec
              k="container"
              v="aw-btn"
              d="Wrapper inline-flex. Define altura, padding, radius, gap."
            />
            <Spec
              k="ícone"
              v="14 · 16 · 18 px"
              d="Material Symbols Rounded via componente Icon. Antes do label por padrão."
            />
            <Spec
              k="label"
              v="aw-btn__label"
              d="Texto. Verbo no infinitivo, sem emoji, sem exclamação."
            />
            <Spec
              k="spinner"
              v="aw-btn__spinner"
              d="Aparece quando loading=true, ao final. Botão fica aria-busy."
            />
            <Spec
              k="radius"
              v="var(--radius-md) · 8 px"
              d="Fixo. Não muda com size nem variant."
            />
            <Spec
              k="hit target"
              v="≥ 44 px (stacked)"
              d="Atendido via espaço externo — nunca encolha um botão pra evitar isso."
            />
          </div>
        </Section>

        {/* ── 5. Variants ──────────────────────────────────────────── */}
        <Section
          id="variants"
          title="Variantes"
          lead="Seis variantes, cada uma com papel definido na hierarquia. Não mixar arbitrariamente — a variante carrega a intenção."
        >
          <Stage
            label="primary · secondary · ghost · subtle · danger · ai"
            hint="Ordem da hierarquia, de mais forte a mais especializado."
          >
            <AwButton variant="primary" iconLeft="add">
              Criar agente
            </AwButton>
            <AwButton variant="secondary">Duplicar</AwButton>
            <AwButton variant="ghost">Cancelar</AwButton>
            <AwButton
              variant="subtle"
              iconOnly="more_vert"
              aria-label="Ações da linha"
            />
            <AwButton variant="danger" iconLeft="error">
              Arquivar
            </AwButton>
            <AwButton variant="ai" iconLeft="auto_awesome">
              Gerar sugestão
            </AwButton>
          </Stage>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <VariantCard
              demo={
                <AwButton variant="primary" size="sm" iconLeft="add">
                  Criar
                </AwButton>
              }
              title="primary"
              body={
                <>
                  Ação principal da tela. Uma só por superfície. Fundo{" "}
                  <code className="mono">--fg-primary</code>, texto branco.
                </>
              }
            />
            <VariantCard
              demo={
                <AwButton variant="secondary" size="sm">
                  Duplicar
                </AwButton>
              }
              title="secondary"
              body={
                <>
                  Ações complementares. Contorno 1px{" "}
                  <code className="mono">--border-default</code>; escurece no
                  hover.
                </>
              }
            />
            <VariantCard
              demo={
                <AwButton variant="ghost" size="sm">
                  Cancelar
                </AwButton>
              }
              title="ghost"
              body={
                <>
                  Baixa ênfase (cancelar, voltar). Sem borda; hover recebe fill{" "}
                  <code className="mono">--bg-surface</code>.
                </>
              }
            />
            <VariantCard
              demo={
                <AwButton
                  variant="subtle"
                  size="sm"
                  iconOnly="more_vert"
                  aria-label="Ações"
                />
              }
              title="subtle"
              body={
                <>
                  Pílula tonal — fundo{" "}
                  <code className="mono">--bg-muted</code> permanente. Ideal
                  como trigger de row action menu em tabelas, onde ghost some no
                  meio das linhas.
                </>
              }
            />
            <VariantCard
              demo={
                <AwButton variant="danger" size="sm" iconLeft="error">
                  Arquivar
                </AwButton>
              }
              title="danger"
              body={
                <>
                  Ações destrutivas (excluir, arquivar, revogar).{" "}
                  <code className="mono">--aw-red-700</code>. Sempre acompanhe
                  de confirmação.
                </>
              }
            />
            <VariantCard
              demo={
                <AwButton variant="ai" size="sm" iconLeft="auto_awesome">
                  Gerar sugestão
                </AwButton>
              }
              title="ai"
              body={
                <>
                  Reservada a ações do agente. Gradient{" "}
                  <code className="mono">--aw-blue-600 → --aw-purple-500</code>.
                  Nunca iniciar em cor quente.
                </>
              }
              wide
            />
          </div>
        </Section>

        {/* ── 6. Sizes ─────────────────────────────────────────────── */}
        <Section
          id="sizes"
          title="Tamanhos"
          lead="Três tamanhos cobrem 100% dos usos. Md é o padrão; lg só em CTA de hero; sm em toolbars e inline."
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
            <Spec k="sm" v="h 30 · pad 12 · 13px" d="toolbars, inline" />
            <Spec k="md" v="h 38 · pad 16 · 14px" d="padrão (default)" />
            <Spec k="lg" v="h 46 · pad 22 · 15px" d="CTA de hero" />
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5 mt-4 body-sm text-[var(--fg-secondary)]">
            <strong className="text-[var(--fg-primary)]">Ícone.</strong> 14 px em
            <code className="mono"> sm</code>, 16 px em
            <code className="mono"> md</code>, 18 px em
            <code className="mono"> lg</code>. Calculado automaticamente — não
            passe <code className="mono">style</code>.
          </div>
        </Section>

        {/* ── 7. States ────────────────────────────────────────────── */}
        <Section
          id="states"
          title="Estados"
          lead="Default, focus, loading e disabled são forçáveis via prop. Hover e active dependem do mouse — passe o cursor para conferir."
        >
          <StatesMatrix
            columns={3}
            states={[
              {
                name: "default",
                node: <AwButton variant="primary">Criar agente</AwButton>,
              },
              {
                name: "hover",
                node: <AwButton variant="primary">Criar agente</AwButton>,
                note: "Passe o mouse: translada 1px pra cima e escurece um passo.",
              },
              {
                name: "focus",
                node: (
                  <AwButton variant="primary" autoFocus>
                    Criar agente
                  </AwButton>
                ),
                note: "Ring 3px rgba(71,138,255,0.30). Só via teclado (focus-visible).",
              },
              {
                name: "active",
                node: <AwButton variant="primary">Criar agente</AwButton>,
                note: "Clique e mantenha: estado :active reduz translação.",
              },
              {
                name: "loading",
                node: (
                  <AwButton variant="primary" loading>
                    Criando
                  </AwButton>
                ),
                note: "Spinner 14px à direita; aria-busy=true.",
              },
              {
                name: "disabled",
                node: (
                  <AwButton variant="primary" disabled>
                    Indisponível
                  </AwButton>
                ),
                note: "opacity 0.5, pointer-events none.",
              },
            ]}
          />
        </Section>

        {/* ── 8. Composition ───────────────────────────────────────── */}
        <Section
          id="composition"
          title="Composition"
          lead="Padrões reais de uso. Combinações que aparecem em produção — copie o padrão, não invente."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Stage label="Modal footer · ghost + primary">
              <AwButton variant="ghost">Cancelar</AwButton>
              <AwButton variant="primary">Salvar alterações</AwButton>
            </Stage>

            <Stage label="Destrutivo · ghost + danger">
              <AwButton variant="ghost">Manter</AwButton>
              <AwButton variant="danger" iconLeft="delete">
                Excluir definitivamente
              </AwButton>
            </Stage>

            <Stage label="Row actions · subtle iconOnly">
              <AwButton
                variant="subtle"
                size="sm"
                iconOnly="more_vert"
                aria-label="Ações da linha 1"
              />
              <AwButton
                variant="subtle"
                size="sm"
                iconOnly="edit"
                aria-label="Editar"
              />
              <AwButton
                variant="subtle"
                size="sm"
                iconOnly="content_copy"
                aria-label="Duplicar"
              />
            </Stage>

            <Stage label="Empty state · primary block">
              <div style={{ width: "100%", maxWidth: 280 }}>
                <AwButton variant="primary" block iconLeft="add">
                  Criar primeiro agente
                </AwButton>
              </div>
            </Stage>

            <Stage label="Hero CTA · primary lg + ghost">
              <AwButton variant="primary" size="lg" iconLeft="bolt">
                Começar grátis
              </AwButton>
              <AwButton variant="ghost" size="lg">
                Ver demonstração
              </AwButton>
            </Stage>

            <Stage label="Agente · ai + secondary">
              <AwButton variant="ai" iconLeft="auto_awesome">
                Gerar resposta
              </AwButton>
              <AwButton variant="secondary">Reescrever manualmente</AwButton>
            </Stage>
          </div>

          {/* Dark shell */}
          <div className="dark mt-4">
            <Stage
              label="Sobre shell escuro"
              hint="Tokens semânticos invertem em .dark — primary usa branco sobre preto; AI preserva o gradient."
              dark
            >
              <AwButton variant="primary" iconLeft="add">
                Criar agente
              </AwButton>
              <AwButton variant="secondary">Duplicar</AwButton>
              <AwButton variant="ghost">Cancelar</AwButton>
              <AwButton
                variant="subtle"
                iconOnly="more_vert"
                aria-label="Ações"
              />
              <AwButton variant="danger" iconLeft="error">
                Arquivar
              </AwButton>
              <AwButton variant="ai" iconLeft="auto_awesome">
                Gerar
              </AwButton>
            </Stage>
          </div>
        </Section>

        {/* ── 9. Responsive ────────────────────────────────────────── */}
        <Section
          id="responsive"
          title="Responsivo"
          lead="O botão em si tem tamanho fixo — o que muda é o layout em volta. Em mobile, blocos full-width; em desktop, alinhados à direita."
        >
          <ResponsiveStage
            label="Modal footer · responsive"
            hint="Mobile empilha em block; desktop alinha à direita com ghost à esquerda."
            mobile={
              <div className="p-4 flex flex-col gap-2">
                <AwButton variant="primary" block>
                  Salvar alterações
                </AwButton>
                <AwButton variant="ghost" block>
                  Cancelar
                </AwButton>
              </div>
            }
            tablet={
              <div className="p-4 flex justify-end gap-2">
                <AwButton variant="ghost">Cancelar</AwButton>
                <AwButton variant="primary">Salvar alterações</AwButton>
              </div>
            }
            desktop={
              <div className="p-4 flex justify-end gap-2">
                <AwButton variant="ghost">Cancelar</AwButton>
                <AwButton variant="primary">Salvar alterações</AwButton>
              </div>
            }
          />
        </Section>

        {/* ── 10. API ──────────────────────────────────────────────── */}
        <Section
          id="api"
          title="API"
          lead={`Import: import { AwButton } from "@/components/ui/AwButton". Aceita todas as props nativas de <button>.`}
        >
          <ApiTable>
            <PropRow
              prop="variant"
              type='"primary" | "secondary" | "ghost" | "subtle" | "danger" | "ai"'
              def='"secondary"'
              doc="Hierarquia visual + intent. Ver seção Variantes."
            />
            <PropRow
              prop="size"
              type='"sm" | "md" | "lg"'
              def='"md"'
              doc="30 · 38 · 46 px de altura. Define tamanho do ícone automaticamente."
            />
            <PropRow
              prop="iconLeft"
              type="string"
              doc="Nome de glyph Material Symbols Rounded antes do label (ex: 'add')."
            />
            <PropRow
              prop="iconRight"
              type="string"
              doc="Idem, depois do label. Reservado a direções/navegação (→, ↗)."
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
              doc="Mostra spinner ao final, desativa interação, aria-busy=true."
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
              doc="Opacidade 0.5, pointer-events none."
            />
            <PropRow
              prop="asChild"
              type="boolean"
              def="false"
              doc="Renderiza o filho via Radix Slot — útil pra envolver <Link>."
            />
            <PropRow
              prop="...rest"
              type="ButtonHTMLAttributes<HTMLButtonElement>"
              doc="Qualquer prop nativa de <button> é repassada."
            />
          </ApiTable>
        </Section>

        {/* ── 11. TokensConsumed ───────────────────────────────────── */}
        <Section
          id="tokens"
          title="Tokens consumidos"
          lead="Tudo via CSS variables. Mudar o token muda o botão automaticamente — incluindo light/dark."
        >
          <TokensConsumed
            tokens={[
              {
                token: "--fg-primary",
                role: "fundo de primary; cor do label em secondary/ghost",
                value: "#0D0D0D (light) · #FFFFFF (dark)",
              },
              {
                token: "--fg-on-inverse",
                role: "label dentro de primary (branco no light, preto no dark)",
                value: "#FFFFFF (light) · #0D0D0D (dark)",
              },
              {
                token: "--border-default",
                role: "contorno do secondary",
                value: "var(--aw-gray-300)",
              },
              {
                token: "--bg-surface",
                role: "fill do ghost em hover",
                value: "var(--aw-gray-150)",
              },
              {
                token: "--bg-muted",
                role: "fundo permanente do subtle",
                value: "var(--aw-gray-200)",
              },
              {
                token: "--aw-red-700",
                role: "fundo do danger",
                value: "#A82222",
              },
              {
                token: "--aw-blue-600 / --aw-purple-500",
                role: "endpoints do gradient da variant ai",
                value: "linear-gradient 90°",
              },
              {
                token: "--radius-md",
                role: "border-radius do container",
                value: "8 px",
              },
              {
                token: "--dur-base · --ease-out",
                role: "transição de hover/focus",
                value: "180ms · cubic-bezier(0.22,0.61,0.36,1)",
              },
            ]}
          />
        </Section>

        {/* ── 12. Accessibility ────────────────────────────────────── */}
        <Section
          id="accessibility"
          title="Acessibilidade"
          lead="O <button> nativo carrega a semântica. O componente só adiciona aria-busy quando loading. iconOnly exige aria-label explícito."
        >
          <KeyboardTable
            rows={[
              { keys: ["Tab"], action: "Move o foco para o botão." },
              {
                keys: ["Shift", "Tab"],
                action: "Move o foco para o botão anterior na ordem do DOM.",
              },
              {
                keys: ["Enter"],
                action: "Aciona o botão (equivalente a click).",
              },
              {
                keys: ["Space"],
                action: "Aciona o botão (comportamento nativo de <button>).",
              },
            ]}
          />
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5 mt-4 body-sm text-[var(--fg-secondary)] flex flex-col gap-2">
            <p className="m-0">
              <strong className="text-[var(--fg-primary)]">iconOnly.</strong>{" "}
              Sempre passe <code className="mono">aria-label</code>. Sem ele, o
              screen reader anuncia apenas o nome do glyph.
            </p>
            <p className="m-0">
              <strong className="text-[var(--fg-primary)]">loading.</strong>{" "}
              O componente seta <code className="mono">aria-busy=&quot;true&quot;</code>{" "}
              e desabilita o click. O label permanece visível para preservar a
              largura — não troque o label por &quot;Aguarde…&quot;.
            </p>
            <p className="m-0">
              <strong className="text-[var(--fg-primary)]">contraste.</strong>{" "}
              Todas as variantes atingem WCAG AA (4.5:1) em texto. AI usa
              gradient com luminosidade controlada em ambos os endpoints.
            </p>
          </div>
        </Section>

        {/* ── 13. Code ─────────────────────────────────────────────── */}
        <Section
          id="code"
          title="Em código"
          lead="Cada padrão tem duas escritas. Esquerda: HTML + className representando a variant — formato usado dentro do próprio styleguide pra gerar telas rápido. Direita: AwButton no produto, onde os devs implementam pra valer."
        >
          <div className="rounded-[var(--radius-md)] border border-[var(--aw-blue-200)] bg-[var(--aw-blue-100)] px-4 py-3 text-sm text-[var(--aw-blue-900)]">
            Regra: <code className="mono">variant</code> e modificadores
            booleanos (<code className="mono">loading</code>,{" "}
            <code className="mono">block</code>,{" "}
            <code className="mono">iconOnly</code>) viram tokens na{" "}
            <code className="mono">className</code> do exemplo; props com valor
            (<code className="mono">iconLeft=&quot;add&quot;</code>) viram{" "}
            <code className="mono">data-icon-left=&quot;add&quot;</code>. Esse
            padrão se repete pra <em>todos</em> os componentes do styleguide.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col gap-2">
              <div className="aw-eyebrow">styleguide · HTML + className</div>
              <CodeExample label="básico">{`<button
  className="primary"
  data-icon-left="add"
>
  Criar agente
</button>`}</CodeExample>
              <CodeExample label="loading com estado">{`<button
  className="primary loading"
  aria-busy="true"
>
  Salvar alterações
</button>`}</CodeExample>
              <CodeExample label="iconOnly com aria-label">{`<button
  className="subtle icon-only"
  data-icon="more_vert"
  aria-label="Ações da linha"
/>`}</CodeExample>
              <CodeExample label="link estilizado como botão">{`<a
  className="primary"
  href="/onboarding"
  data-icon-right="arrow_forward"
>
  Continuar
</a>`}</CodeExample>
            </div>

            <div className="flex flex-col gap-2">
              <div className="aw-eyebrow">produto · AwButton</div>
              <CodeExample label="básico">{`import { AwButton } from "@/components/ui/AwButton"

<AwButton variant="primary" iconLeft="add">
  Criar agente
</AwButton>`}</CodeExample>
              <CodeExample label="loading com estado">{`const [saving, setSaving] = useState(false)

<AwButton
  variant="primary"
  loading={saving}
  onClick={async () => {
    setSaving(true)
    await save()
    setSaving(false)
  }}
>
  Salvar alterações
</AwButton>`}</CodeExample>
              <CodeExample label="iconOnly com aria-label">{`<AwButton
  variant="subtle"
  iconOnly="more_vert"
  aria-label="Ações da linha"
  onClick={openMenu}
/>`}</CodeExample>
              <CodeExample label="asChild com Link (Next.js)">{`import Link from "next/link"

<AwButton
  asChild
  variant="primary"
  iconRight="arrow_forward"
>
  <Link href="/onboarding">Continuar</Link>
</AwButton>`}</CodeExample>
            </div>
          </div>
        </Section>

        {/* ── 14. DoDont ───────────────────────────────────────────── */}
        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Uma única primary por tela.</>,
              <>
                Variant <code className="mono">ai</code> apenas em ações que
                disparam o agente (gerar, sugerir, resumir).
              </>,
              <>
                Variant <code className="mono">danger</code> sempre seguida de
                confirmação antes da ação destrutiva.
              </>,
              <>
                Verbos no infinitivo nos labels: &quot;Criar agente&quot;,
                &quot;Aprovar&quot;, &quot;Salvar alterações&quot;.
              </>,
              <>
                <code className="mono">iconOnly</code> sempre com{" "}
                <code className="mono">aria-label</code>.
              </>,
            ]}
            donts={[
              <>Duas primárias lado a lado na mesma superfície.</>,
              <>
                Usar <code className="mono">ai</code> em CRUD comum (salvar,
                duplicar, excluir).
              </>,
              <>Emoji, exclamação ou gírias no label.</>,
              <>Gradient começando em cor quente (laranja, rosa).</>,
              <>
                Trocar o label durante <code className="mono">loading</code> —
                o botão muda de largura.
              </>,
              <>
                Hardcode de cor ou padding —{" "}
                <code className="mono">bg-[#hex]</code>,{" "}
                <code className="mono">p-[12px]</code> nunca.
              </>,
            ]}
          />
        </Section>

        {/* ── 15. RelatedLinks ─────────────────────────────────────── */}
        <Section id="related" title="Veja também">
          <RelatedLinks
            items={[
              {
                name: "Iconography",
                href: "/bombardier/styleguide/foundation/iconography",
                description:
                  "Material Symbols Rounded — biblioteca dos glyphs aceitos em iconLeft / iconRight / iconOnly.",
              },
              {
                name: "Pills",
                href: "/bombardier/styleguide/components/pills",
                description:
                  "Pílulas tonais para filtros e tags — não confundir com variant subtle.",
              },
              {
                name: "Controls",
                href: "/bombardier/styleguide/components/controls",
                description:
                  "Switch / Checkbox / Radio — quando você precisa de toggle, não de botão.",
              },
              {
                name: "Toast",
                href: "/bombardier/styleguide/components/toast",
                description:
                  "Feedback assíncrono após acionar um botão (sucesso, erro).",
              },
              {
                name: "Cor",
                href: "/bombardier/styleguide/foundation/color",
                description:
                  "Tokens semânticos consumidos pelos botões — paleta completa.",
              },
              {
                name: "Spacing",
                href: "/bombardier/styleguide/foundation/spacing",
                description:
                  "Escala de espaço — gap entre botões, padding interno, hit target.",
              },
            ]}
          />
        </Section>
      </div>
    </>
  )
}

function VariantCard({
  demo,
  title,
  body,
  wide,
}: {
  demo: React.ReactNode
  title: string
  body: React.ReactNode
  wide?: boolean
}) {
  return (
    <div
      className={
        "rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5 " +
        (wide ? "md:col-span-2" : "")
      }
    >
      <div className="flex items-center gap-3 mb-2">{demo}</div>
      <div className="aw-eyebrow mb-1">{title}</div>
      <p className="body-sm m-0 text-[var(--fg-secondary)]">{body}</p>
    </div>
  )
}
