import { AwAccordion } from "@/components/ui/AwAccordion"
import {
  ApiTable,
  CodeExample,
  DoDont,
  KeyboardTable,
  PageHero,
  PropRow,
  RelatedLinks,
  Section,
  Spec,
  Stage,
  Tldr,
  TokensConsumed,
} from "../../_primitives"

const FAQ = [
  {
    value: "cobranca",
    title: "Como funciona a cobrança por consumo?",
    content:
      "Você paga pelo que os agentes consomem — tokens de modelo, execuções e integrações. O Detalhamento mostra o gasto por agente e por provedor em tempo real.",
  },
  {
    value: "limites",
    title: "Posso definir um teto de gasto?",
    content:
      "Sim. Cada organização define um limite mensal; ao se aproximar dele, a Aswork avisa e você decide se eleva o teto ou pausa execuções não essenciais.",
  },
  {
    value: "membros",
    title: "Como adiciono membros à organização?",
    content:
      "Em Configurações → Equipe, envie o convite por e-mail. O membro define a senha no primeiro acesso e já entra com o papel que você atribuiu.",
  },
]

const SETTINGS = [
  {
    value: "perfil",
    icon: "person",
    title: "Perfil",
    meta: "Completo",
    content: "Nome, foto e fuso horário do agente do usuário.",
  },
  {
    value: "notificacoes",
    icon: "notifications",
    title: "Notificações",
    meta: "3 ativas",
    content: "Canais e gatilhos de notificação por evento.",
  },
  {
    value: "seguranca",
    icon: "lock",
    title: "Segurança",
    content: "Sessões ativas, códigos de backup e autenticação em duas etapas.",
  },
]

export default function AccordionPage() {
  return (
    <>
      <PageHero title="Accordion">
        Disclosure que expande/colapsa conteúdo suspenso. Wrapper da AwSales sobre
        o primitivo Radix — já traz a transição de expand/collapse (
        <code className="mono">animate-accordion-down/up</code>) e o chevron que
        gira com o estado. Nunca monte um disclosure na mão: a animação vem de
        graça aqui.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Tldr
          use={[
            <>FAQ, listas de configurações, detalhes secundários que poluiriam a tela se sempre abertos.</>,
            <>Quando só um item deve ficar aberto por vez (<code className="mono">type=&quot;single&quot;</code>).</>,
            <>Conteúdo denso que o usuário escaneia por título antes de abrir.</>,
          ]}
          dontUse={[
            <>Navegação entre seções de página — use <code className="mono">AwTabs</code>.</>,
            <>Um único bloco que abre/fecha isolado — um <code className="mono">collapsible</code> basta.</>,
            <>Conteúdo crítico que precisa estar sempre visível.</>,
          ]}
        />

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Cada item é trigger (header clicável) + content (corpo animado). O chevron e a borda inferior são padrão; ícone e meta são opcionais."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec k="trigger" v="header clicável" d="Título + chevron. Ícone e meta opcionais." />
            <Spec k="content" v="corpo animado" d="animate-accordion-down/up (0.2s ease-out)." />
            <Spec k="chevron" v="expand_more" d="Gira 180° em data-state=open." />
            <Spec k="divisória" v="border-subtle" d="Borda inferior entre itens (some no último)." />
            <Spec k="type" v="single / multiple" d="Single abre um por vez; multiple, vários." />
            <Spec k="collapsible" v="true (single)" d="Permite fechar o item aberto." />
          </div>
        </Section>

        <Section
          id="variants"
          title="Variantes"
          lead="Single (um aberto por vez, com collapsible) é o padrão de FAQ. Multiple deixa o usuário abrir vários ao mesmo tempo."
        >
          <Stage label='type="single" · collapsible (padrão)' gridClassName="block">
            <div className="max-w-[680px]">
              <AwAccordion items={FAQ} defaultValue="cobranca" />
            </div>
          </Stage>
          <div className="h-4" />
          <Stage label='type="multiple"' gridClassName="block">
            <div className="max-w-[680px]">
              <AwAccordion type="multiple" items={FAQ} defaultValue={["cobranca", "limites"]} />
            </div>
          </Stage>
        </Section>

        <Section
          id="with-icon"
          title="Com ícone e meta"
          lead="Item aceita um Material Symbol à esquerda e um texto secundário (meta) à direita do título — bom para listas de configurações."
        >
          <Stage label="icon + meta" gridClassName="block">
            <div className="max-w-[680px]">
              <AwAccordion items={SETTINGS} defaultValue="perfil" />
            </div>
          </Stage>
        </Section>

        <Section
          id="states"
          title="Estados"
          lead="Itens podem vir desabilitados (não abrem, não recebem foco)."
        >
          <Stage label="disabled" gridClassName="block">
            <div className="max-w-[680px]">
              <AwAccordion
                items={[
                  FAQ[0],
                  { ...FAQ[1], disabled: true, title: "Item desabilitado" },
                  FAQ[2],
                ]}
              />
            </div>
          </Stage>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwAccordion } from "@/components/ui/AwAccordion".`}
        >
          <ApiTable>
            <PropRow
              prop="items"
              type="AwAccordionItemData[]"
              doc="Lista de itens: { value, title, content, icon?, meta?, disabled? }."
            />
            <PropRow
              prop="type"
              type='"single" | "multiple"'
              def='"single"'
              doc="Single abre um item por vez; multiple permite vários abertos."
            />
            <PropRow
              prop="collapsible"
              type="boolean"
              def="true"
              doc="Em single, permite fechar o item aberto clicando de novo."
            />
            <PropRow
              prop="defaultValue"
              type="string | string[]"
              doc="Item(ns) aberto(s) no início (uncontrolled)."
            />
            <PropRow
              prop="value / onValueChange"
              type="string | string[] / (v) => void"
              doc="Controle externo do estado aberto/fechado."
            />
            <PropRow prop="className" type="string" doc="Classe extra no Root." />
          </ApiTable>
          <CodeExample>{`import { AwAccordion } from "@/components/ui/AwAccordion"

<AwAccordion
  defaultValue="cobranca"
  items={[
    { value: "cobranca", title: "Como funciona a cobrança?", content: <p>…</p> },
    { value: "limites", title: "Posso definir um teto?", content: <p>…</p> },
  ]}
/>

// vários abertos + ícone/meta
<AwAccordion
  type="multiple"
  items={[
    { value: "perfil", icon: "person", title: "Perfil", meta: "Completo", content: <p>…</p> },
  ]}
/>`}</CodeExample>
        </Section>

        <Section
          id="tokens"
          title="Tokens consumidos"
          lead="A transição usa os tokens de motion; cor e divisória usam tokens semânticos."
        >
          <TokensConsumed
            tokens={[
              { token: "--animate-accordion-down", role: "expandir o conteúdo", value: "accordion-down 0.2s ease-out" },
              { token: "--animate-accordion-up", role: "colapsar o conteúdo", value: "accordion-up 0.2s ease-out" },
              { token: "--border-subtle", role: "divisória entre itens" },
              { token: "--fg-primary", role: "título do item" },
              { token: "--fg-secondary", role: "corpo / ícone" },
              { token: "--fg-tertiary", role: "meta / chevron" },
            ]}
          />
        </Section>

        <Section
          id="accessibility"
          title="Acessibilidade"
          lead="Radix entrega teclado e ARIA de accordion prontos. O trigger é um <button> com aria-expanded."
        >
          <KeyboardTable
            rows={[
              { keys: ["Tab"], action: "Move o foco entre os triggers." },
              { keys: ["Enter", "Espaço"], action: "Abre/fecha o item focado." },
              { keys: ["↑", "↓"], action: "Move o foco entre triggers (Radix)." },
              { keys: ["Home", "End"], action: "Primeiro / último trigger." },
            ]}
          />
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Use para FAQ, configurações e detalhes secundários escaneáveis por título.</>,
              <>Passe <code className="mono">type=&quot;single&quot;</code> quando só um item deve ficar aberto.</>,
              <>Deixe a animação por conta do componente — ela já vem dos tokens de motion.</>,
            ]}
            donts={[
              <>Montar um disclosure na mão (<code className="mono">{`{open && …}`}</code>) — perde a transição de collapse.</>,
              <>Usar como navegação de seções — isso é <code className="mono">AwTabs</code>.</>,
              <>Esconder conteúdo crítico atrás de um item fechado.</>,
            ]}
          />
        </Section>

        <Section id="related" title="Veja também">
          <RelatedLinks
            items={[
              { name: "Tabs", href: "/bombardier/styleguide/components/aw-tabs", description: "Alternar entre seções no mesmo nível." },
              { name: "List group", href: "/bombardier/styleguide/components/aw-list-group", description: "Grupo de itens colapsável." },
              { name: "Animação", href: "/bombardier/styleguide/foundation/motion", description: "Tokens de motion e a regra de overlays." },
            ]}
          />
        </Section>
      </div>
    </>
  )
}
