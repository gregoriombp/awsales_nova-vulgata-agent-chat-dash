import {
  PageHero,
  Section,
  Spec,
  PropRow,
  ApiTable,
  CodeExample,
  DoDont,
  Tldr,
  Toc,
  RelatedLinks,
} from "../../_primitives"
import { ModalDemo } from "./ModalDemo"

const modalDecision = [
  {
    need: "Confirmação, alerta destrutivo ou formulário curto",
    component: "AwModal",
    route: "/bombardier/styleguide/components/modals",
    note: "Base canônica. Use quando o conteúdo cabe em título, corpo e footer.",
  },
  {
    need: "Conectar OAuth, webhook ou API key",
    component: "AwConnectModal",
    route: "/bombardier/styleguide/components/connect-modal",
    note: "Padrão de integração. Não recrie permissões, stepper ou campo de nome.",
  },
  {
    need: "Escolher WhatsApp ou Slack para falar com gerente",
    component: "AwContactChannelModal",
    route: "/bombardier/styleguide/components/aw-contact-channel-modal",
    note: "Modal de domínio. Use só nesse fluxo de contato humano.",
  },
  {
    need: "Momento final de onboarding com imagem e próximos passos",
    component: "AwWelcomeModal",
    route: "/bombardier/styleguide/components/aw-welcome-modal",
    note: "Modal celebrativo e image-led. Não usar para confirmação comum.",
  },
  {
    need: "Tarefa longa com navegação interna ou edição densa",
    component: "AwSheet",
    route: "/bombardier/styleguide/components/sheet",
    note: "Troque modal por sheet quando o usuário precisa manter contexto lateral.",
  },
]

export default function ModalsPage() {
  return (
    <>
      <PageHero title="Modais">
        Hub canônico para dialogs, modais de domínio e sheets relacionados.
        Comece por esta página antes de abrir uma rota específica: ela diz qual
        componente usar, quando manter o modal simples e quando migrar para um
        padrão especializado.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
<div className="flex flex-col gap-16">
        <Tldr
          use={[
            <>Use <code className="mono">AwModal</code> para interrupções curtas com foco único.</>,
            <>Use os modais especializados quando o fluxo já existe no DS: conectar integração, boas-vindas ou canal de contato.</>,
            <>Use <code className="mono">AwSheet</code> quando o usuário precisa editar, comparar ou manter contexto da tela.</>,
          ]}
          dontUse={[
            <>Não criar uma nova página de modal para cada caso de produto.</>,
            <>Não duplicar layout de OAuth, webhook, boas-vindas ou contato humano dentro de feature page.</>,
            <>Não empilhar modal dentro de modal. Redesenhe como sheet, página ou fluxo em etapas.</>,
          ]}
        />

        <Toc
          items={[
            { id: "decision", label: "Qual usar" },
            { id: "demo", label: "Demo" },
            { id: "patterns", label: "Padrões" },
            { id: "sizes", label: "Tamanhos" },
            { id: "anatomy", label: "Anatomia" },
            { id: "api", label: "API" },
            { id: "do-dont", label: "Do / Don't" },
            { id: "related", label: "Relacionados" },
          ]}
        />

        <Section
          id="decision"
          title="Qual usar"
          lead="Esta matriz é a entrada única para humanos e agentes. Se o caso não aparece aqui, comece com AwModal ou redesenhe como página antes de criar um novo componente."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-(--border-subtle)">
                  <th className="pb-2 aw-eyebrow">necessidade</th>
                  <th className="pb-2 aw-eyebrow">componente</th>
                  <th className="pb-2 aw-eyebrow">regra</th>
                </tr>
              </thead>
              <tbody>
                {modalDecision.map((row) => (
                  <tr
                    key={row.component}
                    className="border-b border-(--border-subtle) last:border-b-0 align-top"
                  >
                    <td className="py-3 pr-4 text-sm text-(--fg-primary)">
                      {row.need}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">
                      <a
                        href={row.route}
                        className="mono text-sm text-(--aw-blue-700) no-underline hover:underline"
                      >
                        {row.component}
                      </a>
                    </td>
                    <td className="py-3 text-sm text-(--fg-secondary)">
                      {row.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          id="demo"
          title="Demo"
          lead="Clique para abrir. Use Esc ou clique fora para fechar (exceto no não-dismissible)."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-8">
            <ModalDemo />
          </div>
        </Section>

        <Section
          id="patterns"
          title="Padrões"
          lead="Quatro padrões cobrem quase todos os usos. Eles descrevem intenção, não uma lista de componentes novos."
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
              <h5 className="m-0 mb-1">Confirmação</h5>
              <p className="body-sm m-0">
                Copy curto, footer com <em>Cancelar</em> (ghost) e ação
                principal (primary).
              </p>
            </div>
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
              <h5 className="m-0 mb-1">Formulário</h5>
              <p className="body-sm m-0">
                2–4 campos no máximo. Mais que isso vira página ou cockpit.
              </p>
            </div>
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
              <h5 className="m-0 mb-1">Destrutivo</h5>
              <p className="body-sm m-0">
                Ação principal vira <em>danger</em>. Nunca auto-fechar no
                sucesso — user precisa ver o efeito.
              </p>
            </div>
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
              <h5 className="m-0 mb-1">Especializado</h5>
              <p className="body-sm m-0">
                OAuth, webhook, boas-vindas e contato humano usam wrapper de
                domínio. Não copie a anatomia manualmente.
              </p>
            </div>
          </div>
        </Section>

        <Section
          id="sizes"
          title="Tamanhos"
          lead="Duas larguras. md é o default; cockpit é a extensão para painéis com sub-navegação interna."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Spec
              k='size="md"'
              v="520 px · radius-xl"
              d="Default. Confirmação, formulário curto, ação destrutiva."
            />
            <Spec
              k='size="cockpit"'
              v="760 px · radius 18 px"
              d="Header + body + footer em bandas. Sidebar interna opcional."
            />
          </div>
        </Section>

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Scrim preto 55% com blur-sm 8px. Sombra do modal: --shadow-overlay."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec
              k="max width"
              v="520 px"
              d="Maior que isso é drawer ou página."
            />
            <Spec
              k="padding"
              v="32 px"
              d="Generoso — modais são momentos de foco."
            />
            <Spec
              k="radius"
              v="--radius-xl · 16 px"
              d="Levemente maior que cards."
            />
            <Spec
              k="scrim"
              v="rgba(0,0,0,.55) + blur-sm 8px"
              d="Single focus — conteúdo atrás fica legível mas fora de foco."
            />
            <Spec
              k="shadow"
              v="--shadow-overlay"
              d="0 24px 64px rgba(0,0,0,.18)."
            />
            <Spec
              k="motion"
              v="180 ms --ease-out"
              d="Translate 8px + fade. Sem scale, sem bounce."
            />
            <Spec
              k="close button"
              v="28 px · --radius-sm"
              d="Só aparece quando há title."
            />
            <Spec
              k="esc"
              v="fecha sempre"
              d="Mesmo quando dismissible={false}, Esc permanece ativo."
            />
            <Spec
              k="scroll lock"
              v="body overflow: hidden"
              d="Restaurado ao fechar."
            />
          </div>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwModal } from "@/components/ui/AwModal".`}
        >
          <ApiTable>
            <PropRow
              prop="open"
              type="boolean"
              doc="Controle externo — modal renderiza apenas quando true."
            />
            <PropRow
              prop="onClose"
              type="() => void"
              doc="Invocado em Esc, clique no scrim (se dismissible) e no botão fechar."
            />
            <PropRow
              prop="title"
              type="string"
              doc="Opcional. Renderiza header com botão fechar."
            />
            <PropRow
              prop="children"
              type="ReactNode"
              doc="Corpo do modal."
            />
            <PropRow
              prop="footer"
              type="ReactNode"
              doc="Footer alinhado à direita. Normalmente AwButton ghost + primary."
            />
            <PropRow
              prop="dismissible"
              type="boolean"
              def="true"
              doc="Quando false, clique-fora não fecha."
            />
          </ApiTable>

          <div className="rounded-md border border-(--aw-blue-200) bg-(--aw-blue-100) px-4 py-3 text-sm text-(--aw-blue-900) mt-4">
            <code className="mono">size</code> e modificadores booleanos
            (<code className="mono">closeOnOverlay=&#123;false&#125;</code>{" "}
            → <code className="mono">overlay-locked</code>) viram tokens na{" "}
            <code className="mono">className</code>; <em>slots</em> com valor
            (title, footer) viram filhos com a sua className própria.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex flex-col gap-2">
              <div className="aw-eyebrow">styleguide · HTML + className</div>
              <CodeExample label="confirmação">{`<dialog className="modal md" open>
  <header className="modal-header">
    <h2 className="modal-title">
      Publicar agente
    </h2>
    <button
      className="ghost icon-only"
      data-icon="close"
      aria-label="Fechar"
    />
  </header>
  <div className="modal-body">
    O agente começa a receber tráfego real no canal conectado.
  </div>
  <footer className="modal-footer">
    <button className="ghost">Cancelar</button>
    <button className="primary">
      Publicar agora
    </button>
  </footer>
</dialog>`}</CodeExample>
            </div>

            <div className="flex flex-col gap-2">
              <div className="aw-eyebrow">produto · AwModal</div>
              <CodeExample label="confirmação">{`"use client"
import { useState } from "react"
import { AwModal } from "@/components/ui/AwModal"
import { AwButton } from "@/components/ui/AwButton"

const [open, setOpen] = useState(false)

<AwButton onClick={() => setOpen(true)}>
  Publicar
</AwButton>

<AwModal
  open={open}
  onClose={() => setOpen(false)}
  title="Publicar agente"
  footer={
    <>
      <AwButton
        variant="ghost"
        onClick={() => setOpen(false)}
      >
        Cancelar
      </AwButton>
      <AwButton
        variant="primary"
        onClick={handlePublish}
      >
        Publicar agora
      </AwButton>
    </>
  }
>
  O agente começa a receber tráfego real no canal conectado.
</AwModal>`}</CodeExample>
            </div>
          </div>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Esc e botão fechar sempre habilitados — acessibilidade é default.</>,
              <>Ação primária no footer, do lado direito.</>,
              <>Ação destrutiva usa <em>danger</em> sempre, nunca primary.</>,
            ]}
            donts={[
              <>Modal dentro de modal — redesenhe o fluxo.</>,
              <>Formulário com rolagem vertical longa — vira página.</>,
              <>Auto-fechamento por timer. Usuário decide quando fechar.</>,
              <>Scrim transparente — perde o ponto do modal.</>,
            ]}
          />
        </Section>

        <Section id="related" title="Relacionados">
          <RelatedLinks
            items={[
              {
                name: "Connect modal",
                href: "/bombardier/styleguide/components/connect-modal",
                description:
                  "Subpágina técnica do AwConnectModal com OAuth, webhook e API key.",
              },
              {
                name: "Welcome modal",
                href: "/bombardier/styleguide/components/aw-welcome-modal",
                description:
                  "Subpágina do modal celebrativo usado no fim de onboarding.",
              },
              {
                name: "Sheets e drawers",
                href: "/bombardier/styleguide/components/sheet",
                description:
                  "Use quando a tarefa é lateral, longa ou precisa preservar contexto.",
              },
            ]}
          />
        </Section>
      </div>
    </div>
    </>
  )
}
