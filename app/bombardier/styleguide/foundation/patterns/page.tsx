import Link from "next/link"
import { Icon } from "@/components/ui/Icon"
import { AwButton } from "@/components/ui/AwButton"
import { AwCard } from "@/components/ui/AwCard"
import { AwPill } from "@/components/ui/AwPill"
import { PageHero, Section } from "../../_primitives"

function Pattern({
  number,
  tag,
  title,
  lead,
  children,
  dos,
  donts,
}: {
  number: string
  tag: string
  title: string
  lead: React.ReactNode
  children: React.ReactNode
  dos: React.ReactNode[]
  donts?: React.ReactNode[]
}) {
  return (
    <section
      id={`p-${number}`}
      className="rounded-xl border border-(--border-subtle) bg-(--bg-raised) overflow-hidden"
    >
      <header className="px-6 py-5 border-b border-(--border-subtle) flex items-start justify-between gap-4">
        <div>
          <h2 className="m-0 text-(--h3-size)">
            <span className="text-(--fg-tertiary) text-(--h6-size) mr-2 font-medium">
              {number} ·
            </span>
            {title}
          </h2>
          <p className="mt-2 mb-0 body-sm text-(--fg-secondary) max-w-2xl">
            {lead}
          </p>
        </div>
        <span className="aw-eyebrow whitespace-nowrap">{tag}</span>
      </header>
      <div className="p-8 bg-(--bg-surface) border-b border-(--border-subtle)">
        {children}
      </div>
      <ul className="flex flex-col divide-y divide-(--border-subtle)">
        {dos.map((d, i) => (
          <li
            key={`d-${i}`}
            className="flex items-start gap-3 px-6 py-3 text-sm text-(--fg-primary)"
          >
            <span
              className="text-sm mt-0.5"
              style={{ color: "var(--aw-emerald-700)" }}
              aria-hidden="true"
            >
              ✓
            </span>
            <span>{d}</span>
          </li>
        ))}
        {donts?.map((d, i) => (
          <li
            key={`x-${i}`}
            className="flex items-start gap-3 px-6 py-3 text-sm text-(--fg-secondary)"
          >
            <span
              className="text-sm mt-0.5"
              style={{ color: "var(--aw-red-700)" }}
              aria-hidden="true"
            >
              ✗
            </span>
            <span>{d}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function SelectableRow({
  state,
}: {
  state: "default" | "hover" | "selected"
}) {
  const selected = state === "selected"
  const surface =
    state === "default"
      ? "bg-(--bg-raised) border-(--border-subtle)"
      : state === "hover"
        ? "bg-(--bg-hover) border-(--border-subtle)"
        : "bg-(--bg-inverse) border-transparent"
  const stateLabel =
    state === "default" ? "Default" : state === "hover" ? "Hover" : "Selected"
  return (
    <div
      className={
        "flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors duration-aw-fast " +
        surface
      }
    >
      <span
        className={
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full " +
          // Selected fica num bg dark; o avatar precisa de um dark mais claro
          // que a linha (gray-1000 vs --bg-inverse) pra dar contraste, e ícone claro.
          (selected
            ? "bg-(--aw-gray-1000) text-(--fg-on-inverse)"
            : "bg-(--bg-muted) text-(--fg-secondary)")
        }
      >
        <Icon name="person" size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={
            "m-0 text-[13.5px] font-medium " +
            (selected ? "text-(--fg-on-inverse)" : "text-(--fg-primary)")
          }
        >
          Item da lista
        </p>
        <p
          className={
            "m-0 text-[12px] " +
            (selected ? "text-(--fg-on-inverse)/70" : "text-(--fg-secondary)")
          }
        >
          item@exemplo.com
        </p>
      </div>
      <AwPill variant="neutral" dot={false}>
        {stateLabel}
      </AwPill>
    </div>
  )
}

export default function PatternsPage() {
  return (
    <>
      <PageHero title="Padrões de UI">
        Compor componentes em situações recorrentes. Cada padrão aqui tem uma{" "}
        <em>razão de existir</em> e regras sobre <em>quando não usar</em>.
        Quando em dúvida entre dois padrões, escolha o que{" "}
        <strong>expõe mais o raciocínio do agente</strong>.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
<div className="flex flex-col gap-10">
        {/* ───────── 1 · Shell de produto ───────── */}
        <Pattern
          number="1"
          tag="shell / navigation"
          title="Shell de produto"
          lead="Sidebar primária light à esquerda (320 px expandida, 88 px colapsada), content panel com gutters de 8 px à direita, e cortex flutuando sobre o canto direito quando aberto. O header de ações globais flutua no canto superior direito — sem topbar de largura total. Breadcrumbs vivem dentro do content panel."
          dos={[
            <>Sidebar primária sempre visível em desktop (≥ 1024 px). Colapsa pra 88 px nas rotas que exigem foco (memory-base, agent-studio).</>,
            <>Content panel respira com <code className="mono">my-2 mr-2</code> (8 px). À esquerda abuta a sidebar — sem gutter ali.</>,
            <>Header flutuante (botões 40 × 40) mora em <code className="mono">top-4 right-5</code>, z-30. Não ocupa altura no fluxo.</>,
            <>Breadcrumbs em uma barra fina (44 px) no topo do content panel. Tabs vão dentro do canvas, não acima.</>,
            <>Cortex/Copilot drawer (405 px) flutua à direita sobre o content panel, z-20. Abre/fecha via animação de width.</>,
          ]}
          donts={[
            <>Não usar sidebar dark como padrão — a chrome do produto é light. Dark fica reservada pra superfícies específicas (preview escuro, contraste forçado).</>,
            <>Não empilhar toolbars secundárias abaixo dos breadcrumbs.</>,
            <>Não colocar logo no header — a marca vive no topo da sidebar.</>,
          ]}
        >
          <div className="relative rounded-xl border border-(--border-default) bg-(--bg-surface) overflow-hidden h-[400px] flex">
            {/* Sidebar primária 320 light (proporcional ao mockup: ~140) */}
            <aside className="w-[140px] shrink-0 bg-(--bg-surface) p-3 flex flex-col gap-3">
              <div className="rounded-md border border-(--border-subtle) bg-(--bg-raised) h-9 flex items-center px-2 text-[11px] font-medium text-(--fg-primary)">
                Aswork
              </div>
              <div className="rounded-sm bg-(--bg-raised) border border-(--border-subtle) h-6" />
              <div className="aw-eyebrow text-[9px] text-(--fg-tertiary) px-1 mt-1">
                Geral
              </div>
              <div className="flex flex-col gap-1">
                <div className="rounded-sm bg-(--bg-raised) h-7 flex items-center px-2 text-[11px] font-medium text-(--fg-primary)">
                  Dashboard
                </div>
                <div className="rounded-sm h-7 flex items-center px-2 text-[11px] text-(--fg-secondary)">
                  Agentes
                </div>
              </div>
              <div className="aw-eyebrow text-[9px] text-(--fg-tertiary) px-1 mt-1">
                Dados
              </div>
              <div className="flex flex-col gap-1">
                <div className="rounded-sm h-7 flex items-center px-2 text-[11px] text-(--fg-secondary)">
                  Fontes
                </div>
                <div className="rounded-sm h-7 flex items-center px-2 text-[11px] text-(--fg-secondary)">
                  Conversas
                </div>
              </div>
              <div className="mt-auto rounded-md border border-(--border-subtle) bg-(--bg-raised) h-9" />
            </aside>
            {/* Outer flex containing content panel + cortex zone */}
            <div className="relative flex-1 py-2 pr-2 flex">
              {/* Content panel rounded */}
              <div className="flex-1 rounded-lg border border-(--border-subtle) bg-(--bg-raised) overflow-hidden flex flex-col">
                {/* Breadcrumbs bar */}
                <header className="h-[28px] px-4 flex items-center border-b border-(--border-subtle) text-[11px] text-(--fg-tertiary) gap-1.5">
                  <span>Agentes</span>
                  <span className="opacity-50">›</span>
                  <span className="text-(--fg-primary)">
                    Atendimento FAQ
                  </span>
                </header>
                <div className="flex-1 p-4 grid grid-cols-2 gap-3 bg-(--bg-canvas)">
                  <AwCard>
                    <div className="caption">Conversas 24h</div>
                    <div className="text-xl font-semibold mt-1">1.840</div>
                  </AwCard>
                  <AwCard>
                    <div className="caption">Confiança média</div>
                    <div className="text-xl font-semibold mt-1">94%</div>
                  </AwCard>
                  <AwCard>
                    <div className="caption">Tempo médio</div>
                    <div className="text-xl font-semibold mt-1">2,1 s</div>
                  </AwCard>
                  <AwCard>
                    <div className="caption">Escaladas</div>
                    <div className="text-xl font-semibold mt-1">8</div>
                  </AwCard>
                </div>
              </div>
              {/* Cortex zone — ghost indicator on the right */}
              <div
                className="ml-2 w-[60px] rounded-lg border border-dashed flex flex-col items-center justify-start pt-3 gap-2 opacity-60"
                style={{
                  borderColor: "var(--aw-purple-400)",
                  background:
                    "linear-gradient(180deg, var(--aw-purple-50), transparent)",
                }}
                aria-hidden="true"
              >
                <Icon
                  name="auto_awesome"
                  size={14}
                  style={{ color: "var(--aw-purple-500)" }}
                />
                <span className="text-[8px] text-center text-(--aw-purple-700) leading-tight px-1">
                  Cortex 405 px
                </span>
              </div>
              {/* Floating header — top right */}
              <div className="absolute right-4 top-4 flex gap-1.5">
                <span className="h-7 w-7 rounded-full bg-(--bg-raised) border border-(--border-subtle) flex items-center justify-center shadow-sm">
                  <Icon
                    name="search"
                    size={14}
                    style={{ color: "var(--fg-secondary)" }}
                  />
                </span>
                <span className="h-7 w-7 rounded-full bg-(--bg-raised) border border-(--border-subtle) flex items-center justify-center shadow-sm">
                  <Icon
                    name="notifications"
                    size={14}
                    style={{ color: "var(--fg-secondary)" }}
                  />
                </span>
              </div>
            </div>
          </div>
        </Pattern>

        {/* ───────── 2 · Empty state ───────── */}
        <Pattern
          number="2"
          tag="onboarding / zero"
          title="Empty state"
          lead="Quando uma coleção está vazia, o empty state não é um vazio — é um começo. Explica o conceito em uma frase, oferece 1–2 ações e, quando aplicável, sugere que o agente gere o primeiro item."
          dos={[
            <>Ícone grande, título curto — 1–3 palavras. O que é aquilo em concreto.</>,
            <>Uma frase de explicação, no máximo duas. Evite parágrafos.</>,
            <>Sempre ofereça o caminho com IA quando há dados suficientes para gerar.</>,
          ]}
          donts={[
            <>Não usar “Você ainda não tem nada aqui” — fale sobre a coisa, não sobre a ausência.</>,
          ]}
        >
          <AwCard className="max-w-[440px] mx-auto text-center bg-(--bg-inverse) border-transparent">
            <div className="flex flex-col items-center gap-4 py-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, var(--aw-blue-400), var(--aw-purple-500))",
                }}
              >
                <Icon name="agent" size={24} style={{ color: "#fff" }} />
              </div>
              <div>
                <h4 className="m-0 mb-2 text-(--fg-on-inverse)">Seu primeiro agente</h4>
                <p className="body-sm m-0 text-(--fg-on-inverse) max-w-[32ch] mx-auto">
                  Um agente é um atendimento com papel claro, conhecimento
                  próprio e permissões. Comece do zero ou deixe a IA sugerir a
                  partir dos seus dados.
                </p>
              </div>
              <div className="flex gap-2">
                <AwButton variant="secondary" size="sm">
                  Criar do zero
                </AwButton>
                <AwButton variant="ai" size="sm" iconLeft="agent">
                  Gerar com IA
                </AwButton>
              </div>
            </div>
          </AwCard>
        </Pattern>

        {/* ───────── 3 · Confirmação destrutiva ───────── */}
        <Pattern
          number="3"
          tag="modal / confirm"
          title="Confirmação destrutiva"
          lead="Ações que destroem ou despublicam algo usam modal centrada. O botão primário NÃO é vermelho — vermelho é cor de estado (erro), não de ação. O CTA destrutivo é um botão secundário com rótulo explícito."
          dos={[
            <>Rótulo é o verbo: “Despublicar agora”, “Arquivar conversa”, “Remover fonte” — não “OK”.</>,
            <>Ação secundária à direita, alinhada ao fim da linha — a mão vai onde o olhar termina.</>,
            <>Diga as consequências, não a severidade: o que acontece com conversas em andamento, com links públicos.</>,
          ]}
          donts={[<>Evite “Tem certeza?”. O botão já é a certeza.</>]}
        >
          <div
            className="aw-modal aw-modal--md mx-auto"
            style={{ animation: "none" }}
          >
            <header className="aw-modal__head">
              <h2 className="aw-modal__title">
                Despublicar &ldquo;Pré-venda B2B&rdquo;?
              </h2>
            </header>
            <div className="aw-modal__body">
              A versão ativa será removida de 2 canais. Conversas abertas
              continuam até o próximo turno do usuário.
            </div>
            <footer className="aw-modal__foot">
              <AwButton variant="ghost">Cancelar</AwButton>
              <AwButton variant="danger" iconLeft="block">
                Despublicar agora
              </AwButton>
            </footer>
          </div>
        </Pattern>

        {/* ───────── 4 · Sugestão inline do agente ───────── */}
        <Pattern
          number="4"
          tag="ai / inline"
          title="Sugestão inline do agente"
          lead="Quando o agente oferece uma reescrita, não abra popup: mostra abaixo do bloco selecionado, com halo azul→roxo e atalhos explícitos. O texto original nunca é sobrescrito silenciosamente."
          dos={[
            <>Sugestão é proposta, não imposição. Aceitar / Editar / Dispensar, sempre nesta ordem.</>,
            <>Sempre mostra fonte e tom — o raciocínio do agente precisa ser auditável em uma olhada.</>,
            <>Halo azul→roxo marca conteúdo vindo de IA. Sem exceções.</>,
          ]}
          donts={[<>Não aplique automaticamente — mesmo com alta confiança.</>]}
        >
          <div className="max-w-[640px] mx-auto flex flex-col gap-3">
            <div className="rounded-md border border-(--border-default) bg-(--bg-raised) p-4 body-sm text-(--fg-tertiary) line-through leading-relaxed">
              No momento estamos com dificuldades técnicas e por isso
              infelizmente não é possível processar seu pedido agora, pedimos
              desculpas pelo transtorno.
            </div>
            <div
              className="rounded-xl p-px"
              style={{
                background:
                  "linear-gradient(135deg, var(--aw-blue-500), var(--aw-purple-500))",
              }}
            >
              <div className="rounded-[calc(var(--radius-xl)-1px)] bg-(--bg-raised) p-4 flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <Icon
                    name="agent"
                    size={16}
                    style={{ color: "var(--aw-blue-600)" }}
                  />
                  <div className="body-sm flex-1">
                    <strong>Sugestão:</strong> &ldquo;Seu pedido ficará em espera
                    e será processado em até 10 minutos. Você receberá um
                    e-mail quando estiver pronto.&rdquo;
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-(--fg-tertiary) pl-6">
                  <span>
                    Tom: <strong style={{ color: "var(--fg-secondary)" }}>resolutivo</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Fonte:{" "}
                    <span style={{ color: "var(--fg-secondary)" }}>
                      playbook de incidentes v3
                    </span>
                  </span>
                </div>
                <div className="flex gap-2 pl-6">
                  <AwButton variant="ai" size="sm" iconLeft="check">
                    Aceitar
                  </AwButton>
                  <AwButton variant="secondary" size="sm" iconLeft="edit">
                    Editar
                  </AwButton>
                  <AwButton variant="ghost" size="sm">
                    Dispensar
                  </AwButton>
                </div>
              </div>
            </div>
          </div>
        </Pattern>

        {/* ───────── 5 · Feedback pós-ação (toast) ───────── */}
        <Pattern
          number="5"
          tag="feedback / toast"
          title="Feedback pós-ação (toast)"
          lead={
            <>
              Confirmações curtas aparecem como toast no canto inferior direito.
              Ficam 4 s. Ações reversíveis (&ldquo;Desfazer&rdquo;) ficam 8 s.
              Toast não é pra erro bloqueante — veja{" "}
              <Link
                href="/bombardier/styleguide/components/toast"
                className="underline decoration-dotted underline-offset-2"
              >
                página do componente
              </Link>{" "}
              pra regras completas.
            </>
          }
          dos={[
            <>Dois rótulos no toast, máximo: título verbal (&ldquo;Agente publicado&rdquo;) + 1 linha de detalhe.</>,
            <>Ação inline quando há &ldquo;Desfazer&rdquo; — link sublinhado, nunca botão.</>,
            <>Empilham no canto inferior direito, máximo 3 visíveis. Os restantes esperam.</>,
          ]}
          donts={[
            <>Nunca use toast para erros que exigem decisão — use alert inline ou modal.</>,
          ]}
        >
          <div className="flex flex-col gap-2 max-w-[420px] mx-auto">
            {[
              {
                icon: "check_circle",
                iconColor: "var(--aw-emerald-600)",
                title: "Agente publicado",
                desc: "Live em Web e WhatsApp.",
              },
              {
                icon: "agent",
                iconColor: "var(--aw-blue-600)",
                title: "6 respostas reescritas",
                desc: (
                  <>
                    Revise antes de publicar ·{" "}
                    <span
                      style={{
                        color: "var(--aw-blue-600)",
                        borderBottom: "1px solid currentColor",
                      }}
                    >
                      desfazer
                    </span>
                  </>
                ),
              },
              {
                icon: "error",
                iconColor: "var(--aw-red-600)",
                title: "Não foi possível salvar",
                desc: (
                  <>
                    Conexão caiu.{" "}
                    <span
                      style={{
                        color: "var(--aw-red-600)",
                        borderBottom: "1px solid currentColor",
                      }}
                    >
                      tentar novamente
                    </span>
                  </>
                ),
              },
            ].map((t, i) => (
              <div
                key={i}
                className="rounded-xl border border-(--border-default) bg-(--bg-raised) p-5 flex gap-3 items-start"
                style={{ boxShadow: "var(--shadow-sm)" }}
              >
                <Icon name={t.icon} size={18} style={{ color: t.iconColor }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium font-heading">
                    {t.title}
                  </div>
                  <div className="text-[12px] text-(--fg-tertiary)">
                    {t.desc}
                  </div>
                </div>
                <span
                  className="text-xs text-(--fg-tertiary)"
                  aria-hidden="true"
                >
                  ×
                </span>
              </div>
            ))}
          </div>
        </Pattern>

        {/* ───────── 6 · Loading skeleton ───────── */}
        <Pattern
          number="6"
          tag="loading / skeleton"
          title="Loading skeleton"
          lead={
            <>
              Spinners são raros. Para carregar listas e cards, usamos skeletons
              que imitam a estrutura final — assim a tela não &ldquo;salta&rdquo;
              quando os dados chegam. Shimmer sutil, 1.6 s, da esquerda pra
              direita. Ver{" "}
              <Link
                href="/bombardier/styleguide/components/skeleton"
                className="underline decoration-dotted underline-offset-2"
              >
                componente AwSkeleton
              </Link>
              .
            </>
          }
          dos={[
            <>Skeleton imita a forma, não o conteúdo. Altura igual ao row final.</>,
            <>Spinner só pra esperas {"<"} 1 s em estados de botão (ex.: salvando inline).</>,
            <>Respeita reduced-motion — shimmer some, cor estática fica.</>,
          ]}
          donts={[
            <>Não usar &ldquo;Carregando…&rdquo; como rótulo — ninguém precisa ser informado de que a aplicação está viva.</>,
          ]}
        >
          <div className="flex flex-col gap-3 max-w-[480px] mx-auto">
            <div className="aw-skel" />
            <div className="aw-skel" />
            <div className="aw-skel" />
            <div className="aw-skel" style={{ width: "70%" }} />
          </div>
        </Pattern>

        {/* ───────── 7 · Selectable item ───────── */}
        <Pattern
          number="7"
          tag="lists / selection"
          title="Item selecionável"
          lead={
            <>
              Linhas e cards que podem ser selecionados de uma lista (membros,
              integrações, modelos, contas) usam três estados visuais. O fill
              carrega o sinal — borda some quando o item é o ativo, evitando
              ruído de duplo destaque (stroke + fill).
            </>
          }
          dos={[
            <>
              Default: fundo <code className="mono">--bg-raised</code>, borda{" "}
              <code className="mono">--border-subtle</code>.
            </>,
            <>
              Hover: fundo <code className="mono">--bg-hover</code>,{" "}
              <strong>borda mantida</strong>. Indica afetabilidade sem
              comprometer.
            </>,
            <>
              Selected: fundo <code className="mono">--bg-selected</code>{" "}
              (gray-300, mais escuro que hover), <strong>borda transparente</strong>.
              O fill é o sinal — stroke ali seria redundante.
            </>,
          ]}
          donts={[
            <>
              Não use stroke colorido (azul, verde) pra marcar seleção em
              listas neutras — distrai do conteúdo.
            </>,
            <>
              Não combine stroke + fill no estado selected. Um ou outro,
              nunca os dois.
            </>,
          ]}
        >
          <div className="flex flex-col gap-3 max-w-[520px] mx-auto">
            <SelectableRow state="default" />
            <SelectableRow state="hover" />
            <SelectableRow state="selected" />
          </div>
        </Pattern>

        <Section
          id="principle"
          title="Princípio geral de composição"
          lead="Quando em dúvida entre dois padrões, escolha o que expõe mais o raciocínio do agente."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6">
            <p className="body-md m-0 text-(--fg-primary) leading-relaxed">
              Padrões existem para serem repetidos. Se você precisa de um novo,
              primeiro pergunte:{" "}
              <strong>algum dos 6 acima serve com um pequeno ajuste?</strong>
            </p>
            <p className="body-md m-0 mt-3 text-(--fg-secondary) leading-relaxed">
              Se sim, ajuste. Se não serve de verdade, proponha o novo padrão
              antes de codificar — documente no styleguide junto com um
              exemplo, uma razão de existir e uma regra de quando não usar.
            </p>
          </div>
        </Section>

        <Section
          id="related"
          title="Onde estão as regras"
          lead="Este documento é só a camada de composição. As regras atômicas de cada peça vivem nas páginas dos componentes."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: "Botões", href: "/bombardier/styleguide/components/buttons" },
              { label: "Cards", href: "/bombardier/styleguide/components/cards" },
              { label: "Modais", href: "/bombardier/styleguide/components/modals" },
              { label: "Toast", href: "/bombardier/styleguide/components/toast" },
              { label: "Skeleton", href: "/bombardier/styleguide/components/skeleton" },
              { label: "Alertas", href: "/bombardier/styleguide/components/alerts" },
            ].map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="block px-4 py-3 rounded-md border border-(--border-subtle) bg-(--bg-raised) hover:bg-(--bg-surface) text-sm text-(--fg-primary) no-underline transition-colors duration-150"
              >
                <div className="flex items-center justify-between">
                  <span>{p.label}</span>
                  <Icon name="arrow_forward" size={16} />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <AwPill variant="neutral" dot={false}>
              Shell
            </AwPill>
            <AwPill variant="neutral" dot={false}>
              Onboarding
            </AwPill>
            <AwPill variant="neutral" dot={false}>
              Confirm
            </AwPill>
            <AwPill variant="ai" dot={false}>
              AI inline
            </AwPill>
            <AwPill variant="neutral" dot={false}>
              Feedback
            </AwPill>
            <AwPill variant="neutral" dot={false}>
              Loading
            </AwPill>
          </div>
        </Section>
      </div>
    </div>
    </>
  )
}
