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
      className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] overflow-hidden"
    >
      <header className="px-6 py-5 border-b border-[var(--border-subtle)] flex items-start justify-between gap-4">
        <div>
          <h2 className="m-0 text-[var(--h3-size)]">
            <span className="mono text-[var(--fg-tertiary)] text-[var(--h6-size)] mr-2">
              {number} ·
            </span>
            {title}
          </h2>
          <p className="mt-2 mb-0 body-sm text-[var(--fg-secondary)] max-w-2xl">
            {lead}
          </p>
        </div>
        <span className="aw-eyebrow whitespace-nowrap">{tag}</span>
      </header>
      <div className="p-8 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)]">
        {children}
      </div>
      <ul className="flex flex-col divide-y divide-[var(--border-subtle)]">
        {dos.map((d, i) => (
          <li
            key={`d-${i}`}
            className="flex items-start gap-3 px-6 py-3 text-sm text-[var(--fg-primary)]"
          >
            <span
              className="mono text-xs mt-0.5"
              style={{ color: "var(--aw-emerald-700)" }}
            >
              ✓
            </span>
            <span>{d}</span>
          </li>
        ))}
        {donts?.map((d, i) => (
          <li
            key={`x-${i}`}
            className="flex items-start gap-3 px-6 py-3 text-sm text-[var(--fg-secondary)]"
          >
            <span
              className="mono text-xs mt-0.5"
              style={{ color: "var(--aw-red-700)" }}
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
  const surface =
    state === "default"
      ? "bg-[var(--bg-raised)] border-[var(--border-subtle)]"
      : state === "hover"
        ? "bg-[var(--bg-hover)] border-[var(--border-subtle)]"
        : "bg-[var(--bg-selected)] border-transparent"
  const stateLabel =
    state === "default" ? "Default" : state === "hover" ? "Hover" : "Selected"
  return (
    <div
      className={
        "flex items-center gap-4 rounded-[var(--radius-lg)] border px-4 py-3 transition-colors duration-aw-fast " +
        surface
      }
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg-muted)] text-[var(--fg-secondary)]">
        <Icon name="person" size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[13.5px] font-medium text-[var(--fg-primary)]">
          Item da lista
        </p>
        <p className="m-0 text-[12px] text-[var(--fg-secondary)]">
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
          lead="Sidebar fixa à esquerda, topbar fina, canvas ao centro. Layout padrão de qualquer tela interna. A sidebar nunca colapsa em desktop — navegação precisa estar sempre à vista."
          dos={[
            <>Sidebar sempre visível em desktop (≥ 1024 px). Drawer só em mobile.</>,
            <>Topbar fina (56 px) com breadcrumb + ações globais. Sem logo — ela vive na sidebar.</>,
            <>Canvas respira. Margem interna mínima de 24 px; em telas densas, ainda 16 px.</>,
          ]}
          donts={[
            <>Não empilhar toolbars secundárias abaixo da topbar. Tabs dentro do canvas, não fora.</>,
          ]}
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-raised)] overflow-hidden h-[360px] flex">
            <aside
              className="w-[180px] p-4 flex flex-col gap-4"
              style={{
                backgroundColor: "var(--dark-bg)",
                color: "var(--dark-fg-primary)",
                borderRight: "1px solid var(--dark-border)",
              }}
            >
              <div className="text-sm font-medium">AwSales</div>
              <div style={{ color: "var(--dark-fg-tertiary)" }} className="aw-eyebrow">
                Geral
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <span style={{ color: "var(--dark-fg-primary)" }}>Dashboard</span>
                <span style={{ color: "var(--dark-fg-secondary)" }}>Agentes</span>
              </div>
              <div style={{ color: "var(--dark-fg-tertiary)" }} className="aw-eyebrow mt-2">
                Dados
              </div>
              <div className="flex flex-col gap-1 text-xs">
                <span style={{ color: "var(--dark-fg-secondary)" }}>Fontes</span>
                <span style={{ color: "var(--dark-fg-secondary)" }}>Conversas</span>
                <span style={{ color: "var(--dark-fg-secondary)" }}>Rastros</span>
              </div>
            </aside>
            <div className="flex-1 flex flex-col">
              <header className="h-[56px] px-5 flex items-center justify-between border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 text-xs text-[var(--fg-tertiary)]">
                  <span>Agentes</span>
                  <span className="opacity-50">/</span>
                  <span className="text-[var(--fg-primary)]">Atendimento FAQ</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="search" size={16} />
                  <Icon name="notifications" size={16} />
                </div>
              </header>
              <div className="flex-1 p-5 grid grid-cols-2 gap-3 bg-[var(--bg-canvas)]">
                <AwCard>
                  <div className="caption">Conversas 24h</div>
                  <div className="text-xl font-medium mt-1">1 840</div>
                </AwCard>
                <AwCard>
                  <div className="caption">Confiança média</div>
                  <div className="text-xl font-medium mt-1">94%</div>
                </AwCard>
                <AwCard>
                  <div className="caption">Tempo médio</div>
                  <div className="text-xl font-medium mt-1 mono">2.1 s</div>
                </AwCard>
                <AwCard>
                  <div className="caption">Escaladas</div>
                  <div className="text-xl font-medium mt-1">8</div>
                </AwCard>
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
          <AwCard className="max-w-[440px] mx-auto text-center">
            <div className="flex flex-col items-center gap-4 py-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, var(--aw-blue-400), var(--aw-purple-500))",
                }}
              >
                <Icon name="smart_toy" size={24} style={{ color: "#fff" }} />
              </div>
              <div>
                <h4 className="m-0 mb-2">Seu primeiro agente</h4>
                <p className="body-sm m-0 text-[var(--fg-secondary)] max-w-[32ch] mx-auto">
                  Um agente é um atendimento com papel claro, conhecimento
                  próprio e permissões. Comece do zero ou deixe a IA sugerir a
                  partir dos seus dados.
                </p>
              </div>
              <div className="flex gap-2">
                <AwButton variant="secondary" size="sm">
                  Criar do zero
                </AwButton>
                <AwButton variant="ai" size="sm" iconLeft="auto_awesome">
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
            <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-raised)] p-4 body-sm text-[var(--fg-tertiary)] line-through leading-relaxed">
              No momento estamos com dificuldades técnicas e por isso
              infelizmente não é possível processar seu pedido agora, pedimos
              desculpas pelo transtorno.
            </div>
            <div
              className="rounded-[var(--radius-md)] p-[1px]"
              style={{
                background:
                  "linear-gradient(135deg, var(--aw-blue-500), var(--aw-purple-500))",
              }}
            >
              <div className="rounded-[calc(var(--radius-md)-1px)] bg-[var(--bg-raised)] p-4 flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <Icon
                    name="auto_awesome"
                    size={16}
                    style={{ color: "var(--aw-blue-600)" }}
                  />
                  <div className="body-sm flex-1">
                    <strong>Sugestão:</strong> &ldquo;Seu pedido ficará em espera
                    e será processado em até 10 minutos. Você receberá um
                    e-mail quando estiver pronto.&rdquo;
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[var(--fg-tertiary)] pl-6">
                  <span>
                    Tom: <strong style={{ color: "var(--fg-secondary)" }}>resolutivo</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Fonte:{" "}
                    <span className="mono">playbook de incidentes v3</span>
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
                icon: "auto_awesome",
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
                className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-raised)] p-[14px] flex gap-3 items-start"
                style={{ boxShadow: "var(--shadow-lg)" }}
              >
                <Icon name={t.icon} size={18} style={{ color: t.iconColor }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium font-heading">
                    {t.title}
                  </div>
                  <div className="text-[12px] text-[var(--fg-tertiary)]">
                    {t.desc}
                  </div>
                </div>
                <span className="mono text-xs text-[var(--fg-tertiary)]">×</span>
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
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6">
            <p className="body-md m-0 text-[var(--fg-primary)] leading-relaxed">
              Padrões existem para serem repetidos. Se você precisa de um novo,
              primeiro pergunte:{" "}
              <strong>algum dos 6 acima serve com um pequeno ajuste?</strong>
            </p>
            <p className="body-md m-0 mt-3 text-[var(--fg-secondary)] leading-relaxed">
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
                className="block px-4 py-3 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] hover:bg-[var(--bg-surface)] text-sm text-[var(--fg-primary)] no-underline transition-colors duration-150"
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
