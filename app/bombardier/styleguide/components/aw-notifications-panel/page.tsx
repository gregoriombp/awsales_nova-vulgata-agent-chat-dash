"use client"

import { AwNotificationsPanel } from "@/components/ui/AwNotificationsPanel"
import { Icon } from "@/components/ui/Icon"
import { NOTIFICATIONS, type AppNotification } from "@/lib/notifications"
import {
  ApiTable,
  CodeExample,
  DoDont,
  PageHero,
  PropRow,
  Section,
  Spec,
  Stage,
} from "../../_primitives"

const noop = () => {}

/** Gatilho (sino) + painel aberto, com espaço embaixo pro drop absoluto. */
function BellDemo({
  bottom,
  ...props
}: {
  bottom: number
  notifications?: AppNotification[]
  limit?: number
}) {
  return (
    <div className="flex justify-center" style={{ paddingBottom: bottom }}>
      {/* Caixa de largura fixa = âncora do painel. O sino fica no topo-direita
       * e o painel (right-0, ~420px) cai logo abaixo, dentro da caixa — sem
       * estourar pra fora do Stage. */}
      <div className="relative" style={{ width: 440 }}>
        <div className="flex justify-end">
          <button
            type="button"
            aria-label="Notificações"
            className="flex h-9 w-9 items-center justify-center rounded-full text-fg-secondary"
          >
            <Icon name="notifications" size={18} />
          </button>
        </div>
        <AwNotificationsPanel isOpen onClose={noop} {...props} />
      </div>
    </div>
  )
}

export default function NotificationsPanelPage() {
  return (
    <>
      <PageHero title="Notificações">
        Painel do sino da topbar — um feed simples das notificações da
        plataforma, reusando o <code className="mono">NotificationRow</code>.
        Sem abas nem toggle: itens recentes e, só no rodapé, a opção{" "}
        <strong>Ver todas as notificações</strong>.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="basic"
            title="Uso padrão"
            lead="Ancora no canto superior direito do gatilho (o sino). Mostra os itens mais recentes (limit, default 6), com a contagem de não lidas no header e o link 'Ver todas' no rodapé."
          >
            <Stage label="Aberto — feed da plataforma">
              <BellDemo bottom={560} />
            </Stage>
          </Section>

          <Section
            id="empty"
            title="Estado vazio"
            lead="Quando não há notificações, o feed dá lugar a um estado vazio enxuto — o rodapé 'Ver todas' continua disponível."
          >
            <Stage label="Sem itens">
              <BellDemo bottom={240} notifications={[]} />
            </Stage>
          </Section>

          <Section
            id="limit"
            title="Limite de itens"
            lead="O painel é um resumo, não a caixa completa. Use limit para controlar quantos itens aparecem antes do 'Ver todas'."
          >
            <Stage label="limit = 3">
              <BellDemo bottom={380} limit={3} />
            </Stage>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Composição fixa, de cima pra baixo."
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Spec
                k="Header"
                v="Notificações"
                d="Título + contagem de não lidas + 'Marcar todas como lidas'. Sem abas."
              />
              <Spec
                k="Feed"
                v="NotificationRow[]"
                d="Lista dos itens recentes. Clique navega (href) e fecha o painel."
              />
              <Spec
                k="Rodapé"
                v="Ver todas as notificações"
                d="Única entrada pra página completa (seeAllHref)."
              />
            </div>
          </Section>

          <Section id="usage" title="Como usar" lead="Controle isOpen/onClose no gatilho (sino).">
            <CodeExample>{`const [open, setOpen] = useState(false)

<div className="relative">
  <AwButton iconOnly="notifications" onClick={() => setOpen(v => !v)} />
  <AwNotificationsPanel
    isOpen={open}
    onClose={() => setOpen(false)}
    seeAllHref="/notifications"
  />
</div>`}</CodeExample>
          </Section>

          <Section id="dodont" title="Boas práticas">
            <DoDont
              dos={[
                "Usar como resumo dos itens recentes — o link do rodapé leva à lista completa.",
                "Manter o feed plano: ícone neutro + título + descrição + horário.",
              ]}
              donts={[
                "Adicionar abas/toggle (Activity/Reminders, Todas/Não lidas). É um feed, não um painel de preferências.",
                "Espalhar vários 'ver mais' no meio — a única saída pra tudo é o rodapé.",
              ]}
            />
          </Section>

          <Section id="api" title="Props">
            <ApiTable>
              <PropRow
                prop="isOpen"
                type="boolean"
                def="—"
                doc="Controla a visibilidade do painel."
              />
              <PropRow
                prop="onClose"
                type="() => void"
                def="—"
                doc="Chamado ao clicar num item, no rodapé, ou ao dispensar."
              />
              <PropRow
                prop="notifications"
                type="AppNotification[]"
                def="NOTIFICATIONS"
                doc="Feed a exibir. Default = fixture da plataforma."
              />
              <PropRow
                prop="limit"
                type="number"
                def="6"
                doc="Quantos itens mostrar antes do 'Ver todas'."
              />
              <PropRow
                prop="seeAllHref"
                type="string"
                def='"/notifications"'
                doc="Rota da página com todas as notificações."
              />
              <PropRow
                prop="className"
                type="string"
                def="—"
                doc="Classe extra no wrapper posicionado."
              />
            </ApiTable>
          </Section>

          <Section
            id="a11y"
            title="Acessibilidade"
            lead={`Total no feed: ${NOTIFICATIONS.length} itens.`}
          >
            <p className="text-[var(--body-md-size)] text-[var(--fg-secondary)]">
              O painel é um <code className="mono">role=&quot;dialog&quot;</code> rotulado
              (&quot;Notificações&quot;). Cada item é um <code className="mono">NotificationRow</code>{" "}
              focável; o gatilho deve refletir <code className="mono">aria-expanded</code>. O
              consumidor é responsável por fechar ao clicar fora / Esc.
            </p>
          </Section>
        </div>
      </div>
    </>
  )
}
