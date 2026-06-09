import type { ReactNode } from "react"
import { AwBrandLogo } from "@/components/ui/AwBrandLogo"
import { Icon } from "@/components/ui/Icon"
import {
  PageHero,
  Section,
  Spec,
  PropRow,
  ApiTable,
  CodeExample,
  Toc,
  RelatedLinks,
} from "../../_primitives"

const modalDecision = [
  {
    component: "AwModal",
    route: "/bombardier/styleguide/components/modals#aw-modal",
    use: "Confirmação, alerta destrutivo, formulário curto ou decisão de foco único.",
    dontUse:
      "Não use para fluxos longos, navegação interna, integração de terceiro ou onboarding celebrativo.",
    note: "Base canônica. Conteúdo cabe em título, corpo e footer.",
  },
  {
    component: "AwConnectModal",
    route: "/bombardier/styleguide/components/connect-modal",
    use: "Conectar OAuth, webhook ou API key com permissões, stepper ou credenciais.",
    dontUse:
      "Não recrie permissões, stepper, redirect URL ou naming field dentro de feature page.",
    note: "Wrapper de domínio para integrações de terceiros.",
  },
  {
    component: "AwContactChannelModal",
    route: "/bombardier/styleguide/components/aw-contact-channel-modal",
    use: "Escolher WhatsApp ou Slack para falar com o gerente de contas.",
    dontUse:
      "Não use como picker genérico de canal, nem para suporte que não envolve gerente humano.",
    note: "Modal curto de domínio, aberto pelo card do especialista humano.",
  },
  {
    component: "AwWelcomeModal",
    route: "/bombardier/styleguide/components/aw-welcome-modal",
    use: "Momento one-shot com imagem e próximos passos: fim de onboarding ou milestone.",
    dontUse:
      "Não use para confirmação comum, erro, alerta recorrente ou ação destrutiva.",
    note: "Image-led, com tile actions empilhadas.",
  },
  {
    component: "AwAddIntegrationModal",
    route: "/bombardier/styleguide/components/integration-catalog",
    use: "Catálogo de integrações com categorias, busca e card de integração personalizada.",
    dontUse:
      "Não use para conectar uma integração já escolhida; aí o fluxo é AwConnectModal.",
    note: "Modal-cockpit de seleção, não modal de autorização.",
  },
]

function PreviewShell({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) overflow-hidden">
      <div className="border-b border-(--border-subtle) px-5 py-3">
        <div className="text-sm font-medium text-(--fg-primary)">{title}</div>
      </div>
      <div className="bg-(--bg-surface) p-6">{children}</div>
    </div>
  )
}

function StaticAwModal() {
  return (
    <div className="mx-auto aw-modal aw-modal--md shadow-(--shadow-sm)">
      <header className="aw-modal__head">
        <h2 className="aw-modal__title">Publicar agente</h2>
        <span className="aw-modal__close" aria-hidden="true">
          <Icon name="close" size={18} />
        </span>
      </header>
      <div className="aw-modal__body">
        O agente começa a receber tráfego real no canal conectado. Revise o
        escopo antes de publicar.
      </div>
      <footer className="aw-modal__foot">
        <button type="button" className="aw-btn aw-btn--ghost aw-btn--md">
          Cancelar
        </button>
        <button type="button" className="aw-btn aw-btn--primary aw-btn--md">
          Publicar agora
        </button>
      </footer>
    </div>
  )
}

function StaticConnectModal() {
  return (
    <div className="mx-auto aw-modal aw-connect-modal aw-connect-modal--oauth shadow-(--shadow-sm)">
      <span className="aw-modal__close aw-connect-modal__close" aria-hidden="true">
        <Icon name="close" size={18} />
      </span>
      <div className="aw-connect-modal__hero">
        <div className="aw-connect-modal__logos">
          <span className="aw-connect-modal__mark">
            <Icon name="hub" size={24} />
          </span>
          <span aria-hidden="true" className="aw-connect-modal__connector">
            <Icon name="sync_alt" size={16} />
          </span>
          <AwBrandLogo brand="hubla" size="lg" />
        </div>
        <h2 className="aw-connect-modal__title">
          Conectar Aswork para Hubla
        </h2>
        <p className="aw-connect-modal__desc">
          Autorize leitura de pedidos e eventos de checkout para treinar o
          agente.
        </p>
      </div>
      <div className="aw-connect-modal__perms">
        <h3 className="aw-connect-modal__perms-title">
          Permissões solicitadas
        </h3>
        <ul className="aw-connect-modal__perms-list">
          {["Ler pedidos", "Receber webhooks", "Sincronizar produtos"].map((perm) => (
            <li key={perm} className="aw-connect-modal__perm">
              <Icon
                name="check_circle"
                size={16}
                className="aw-connect-modal__perm-icon"
              />
              <span>{perm}</span>
            </li>
          ))}
        </ul>
      </div>
      <footer className="aw-connect-modal__foot">
        <button type="button" className="aw-btn aw-btn--ghost aw-btn--md">
          Como funciona
        </button>
        <div className="aw-connect-modal__foot-actions">
          <button type="button" className="aw-btn aw-btn--secondary aw-btn--md">
            Cancelar
          </button>
          <button type="button" className="aw-btn aw-btn--primary aw-btn--md">
            Permitir acesso
          </button>
        </div>
      </footer>
    </div>
  )
}

function StaticContactChannelModal() {
  return (
    <div className="mx-auto aw-modal aw-modal--md shadow-(--shadow-sm)">
      <header className="aw-modal__head">
        <h2 className="aw-modal__title">Conversar com seu gerente</h2>
        <span className="aw-modal__close" aria-hidden="true">
          <Icon name="close" size={18} />
        </span>
      </header>
      <div className="aw-modal__body">
        <div className="flex flex-col gap-4">
          <p className="m-0 body-xs text-(--fg-secondary)">
            Escolha por onde falar com Marina.
          </p>
          <div className="flex flex-col gap-2">
            {[
              { label: "WhatsApp", hint: "Resposta rápida no horário comercial.", icon: "chat" },
              { label: "Slack", hint: "Canal compartilhado da sua conta.", icon: "tag" },
            ].map((channel) => (
              <button
                key={channel.label}
                type="button"
                className="aw-card flex items-center gap-3 px-4! py-3! text-left"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--bg-inverse) text-(--fg-on-inverse)">
                  <Icon name={channel.icon} size={20} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-semibold text-(--fg-primary)">
                    {channel.label}
                  </span>
                  <span className="body-xs text-(--fg-secondary)">
                    {channel.hint}
                  </span>
                </span>
                <Icon
                  name="chevron_right"
                  size={18}
                  className="ml-auto text-(--fg-tertiary)"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StaticWelcomeModal() {
  return (
    <div
      className="mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-xl bg-(--bg-raised) shadow-(--shadow-sm)"
      data-slot="welcome-modal"
    >
      <div className="relative">
        <div
          className="relative h-48 w-full overflow-hidden bg-(--bg-surface)"
          style={{
            backgroundImage:
              "url('/assets/background-images/background-image@2x.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-b from-transparent to-(--bg-raised)" />
        </div>
        <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-(--bg-raised)/85 text-(--fg-primary)">
          <Icon name="close" size={16} />
        </span>
      </div>
      <div className="flex flex-col gap-5 px-7 pb-7 pt-1">
        <div className="flex flex-col gap-2">
          <span className="aw-eyebrow text-(--fg-tertiary)">
            Bem-vindo à Aswork
          </span>
          <h4 className="m-0 text-(--fg-primary)">Sua primeira base está pronta</h4>
          <p className="m-0 body-sm text-(--fg-secondary)">
            Escolha o próximo passo para colocar seu agente em operação.
          </p>
        </div>
        <ul className="flex flex-col gap-2">
          {[
            { icon: "person_add", label: "Convidar equipe", helper: "Traga quem opera o atendimento." },
            { icon: "play_arrow", label: "Fazer tour guiado", helper: "Veja os pontos principais." },
          ].map((action, i) => (
            <li key={action.label}>
              <button
                type="button"
                data-primary={i === 0 || undefined}
                className="group flex w-full items-center gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-raised) px-3.5 py-3 text-left data-[primary=true]:border-(--fg-primary) data-[primary=true]:bg-(--fg-primary)"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--bg-inverse) text-(--fg-on-inverse) group-data-[primary=true]:bg-(--bg-raised)/15 group-data-[primary=true]:text-(--bg-raised)">
                  <Icon name={action.icon} size={18} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="body-sm font-medium text-(--fg-primary) group-data-[primary=true]:text-(--bg-raised)">
                    {action.label}
                  </span>
                  <span className="body-xs text-(--fg-secondary) group-data-[primary=true]:text-(--bg-raised)/80">
                    {action.helper}
                  </span>
                </span>
                <Icon
                  name="chevron_right"
                  size={18}
                  className="text-(--fg-tertiary) group-data-[primary=true]:text-(--bg-raised)/80"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function StaticAddIntegrationModal() {
  return (
    <div
      className="mx-auto max-h-96 aw-modal aw-add-int-modal shadow-(--shadow-sm)"
    >
      <header className="aw-add-int-modal__head">
        <div className="aw-add-int-modal__title-row">
          <span className="aw-add-int-modal__title-icon" aria-hidden="true">
            <Icon name="extension" size={20} />
          </span>
          <h2 className="aw-add-int-modal__title">Adicionar integração</h2>
        </div>
        <span className="aw-modal__close" aria-hidden="true">
          <Icon name="close" size={18} />
        </span>
      </header>
      <div className="aw-add-int-modal__body">
        <nav className="aw-add-int-modal__nav" aria-label="Categorias">
          <ul className="aw-add-int-modal__nav-list">
            {["Todas as integrações", "Checkouts", "Formulários", "Calendários"].map((item, i) => (
              <li key={item}>
                <button
                  type="button"
                  className={
                    "aw-add-int-modal__nav-item" +
                    (i === 0 ? " aw-add-int-modal__nav-item--active" : "")
                  }
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <section className="aw-add-int-modal__main">
          <div className="aw-add-int-modal__main-head">
            <h3 className="aw-add-int-modal__main-title">
              Todas as integrações
            </h3>
            <div className="h-9 w-64 rounded-md border border-(--border-default) bg-(--bg-surface) px-3 text-sm leading-9 text-(--fg-tertiary)">
              Buscar integrações...
            </div>
          </div>
          <div className="aw-add-int-modal__grid">
            {[
              { brand: "hubla", name: "Hubla", desc: "Pedidos e webhooks." },
              { brand: "hotmart", name: "Hotmart", desc: "Vendas e assinaturas." },
              { brand: "typeform", name: "Typeform", desc: "Leads e respostas." },
            ].map((item) => (
              <button key={item.name} type="button" className="aw-add-int-modal__card">
                <span className="aw-add-int-modal__card-logo">
                  <AwBrandLogo brand={item.brand} size="md" />
                </span>
                <span className="aw-add-int-modal__card-name">{item.name}</span>
                <span className="aw-add-int-modal__card-desc">{item.desc}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default function ModalsPage() {
  return (
    <>
      <PageHero title="Modais">
        Hub canônico para dialogs e modais de domínio. Esta página mostra todos
        os modais inline; use as subpáginas apenas quando precisar da API
        detalhada ou de exemplos mais profundos.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Toc
            items={[
              { id: "all", label: "Todos os modais" },
              { id: "aw-modal", label: "AwModal" },
              { id: "connect-modal", label: "Connect modal" },
              { id: "contact-channel-modal", label: "Contact channel" },
              { id: "welcome-modal", label: "Welcome modal" },
              { id: "add-integration-modal", label: "Add integration" },
              { id: "patterns", label: "Padrões" },
              { id: "sizes", label: "Tamanhos" },
              { id: "anatomy", label: "Anatomia" },
              { id: "api", label: "API" },
              { id: "decision", label: "Quando usar" },
              { id: "related", label: "Relacionados" },
            ]}
          />

          <Section
            id="all"
            title="Todos os modais"
            lead="A família inclui o modal base e wrappers de domínio. O objetivo aqui é comparar a forma de cada um sem abrir overlays."
          >
            <div className="grid grid-cols-1 gap-6">
              <div id="aw-modal">
                <PreviewShell title="AwModal · base">
                  <StaticAwModal />
                </PreviewShell>
              </div>
              <div id="connect-modal">
                <PreviewShell title="AwConnectModal · integração">
                  <StaticConnectModal />
                </PreviewShell>
              </div>
              <div id="contact-channel-modal">
                <PreviewShell title="AwContactChannelModal · contato humano">
                  <StaticContactChannelModal />
                </PreviewShell>
              </div>
              <div id="welcome-modal">
                <PreviewShell title="AwWelcomeModal · boas-vindas">
                  <StaticWelcomeModal />
                </PreviewShell>
              </div>
              <div id="add-integration-modal">
                <PreviewShell title="AwAddIntegrationModal · catálogo">
                  <StaticAddIntegrationModal />
                </PreviewShell>
              </div>
            </div>
          </Section>

          <Section
            id="patterns"
            title="Padrões"
            lead="Estes padrões descrevem intenção, não uma lista de componentes novos."
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
                <h5 className="m-0 mb-1">Confirmação</h5>
                <p className="body-sm m-0">
                  Copy curto, footer com <em>Cancelar</em> e ação principal.
                </p>
              </div>
              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
                <h5 className="m-0 mb-1">Formulário</h5>
                <p className="body-sm m-0">
                  2 a 4 campos no máximo. Mais que isso vira página ou sheet.
                </p>
              </div>
              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
                <h5 className="m-0 mb-1">Destrutivo</h5>
                <p className="body-sm m-0">
                  Ação principal vira <em>danger</em>. Nunca auto-fechar por timer.
                </p>
              </div>
              <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-5">
                <h5 className="m-0 mb-1">Especializado</h5>
                <p className="body-sm m-0">
                  OAuth, catálogo, boas-vindas e contato humano usam wrapper de
                  domínio.
                </p>
              </div>
            </div>
          </Section>

          <Section
            id="sizes"
            title="Tamanhos"
            lead="Duas larguras no modal base. Wrappers de domínio têm largura própria quando a tarefa exige."
          >
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <Spec
                k="domínio"
                v="480–1080 px"
                d="Connect, Welcome e Add Integration definem a largura pelo fluxo."
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
                d="Maior que isso normalmente é drawer, cockpit ou página."
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
                d="Single focus — conteúdo atrás fica fora de foco."
              />
              <Spec
                k="shadow"
                v="--shadow-overlay"
                d="Elevação de overlay."
              />
              <Spec
                k="motion"
                v="180 ms --ease-out"
                d="Translate 8px + fade. Sem scale, sem bounce."
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

            <CodeExample label="produto · AwModal">{`"use client"
import { useState } from "react"
import { AwModal } from "@/components/ui/AwModal"
import { AwButton } from "@/components/ui/AwButton"

const [open, setOpen] = useState(false)

<AwModal
  open={open}
  onClose={() => setOpen(false)}
  title="Publicar agente"
  footer={
    <>
      <AwButton variant="ghost" onClick={() => setOpen(false)}>
        Cancelar
      </AwButton>
      <AwButton variant="primary" onClick={handlePublish}>
        Publicar agora
      </AwButton>
    </>
  }
>
  O agente começa a receber tráfego real no canal conectado.
</AwModal>`}</CodeExample>
          </Section>

          <Section
            id="decision"
            title="Quando usar"
            lead="Use esta tabela como checklist. Se o caso cair em mais de uma linha, escolha o wrapper mais específico."
          >
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-(--border-subtle)">
                    <th className="pb-2 aw-eyebrow">componente</th>
                    <th className="pb-2 aw-eyebrow">quando usar</th>
                    <th className="pb-2 aw-eyebrow">quando não usar</th>
                    <th className="pb-2 aw-eyebrow">observação</th>
                  </tr>
                </thead>
                <tbody>
                  {modalDecision.map((row) => (
                    <tr
                      key={row.component}
                      className="border-b border-(--border-subtle) last:border-b-0 align-top"
                    >
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <a
                          href={row.route}
                          className="mono text-sm text-(--aw-blue-700) no-underline hover:underline"
                        >
                          {row.component}
                        </a>
                      </td>
                      <td className="py-3 pr-4 text-sm text-(--fg-primary)">
                        {row.use}
                      </td>
                      <td className="py-3 pr-4 text-sm text-(--fg-secondary)">
                        {row.dontUse}
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
                  name: "Integration catalog",
                  href: "/bombardier/styleguide/components/integration-catalog",
                  description:
                    "Catálogo de integração que usa AwAddIntegrationModal.",
                },
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
