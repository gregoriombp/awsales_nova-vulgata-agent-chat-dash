import { AwNavTree, type AwNavTreeGroup } from "@/components/ui/AwNavTree"
import {
  PageHero,
  Section,
  Stage,
  Spec,
  PropRow,
  ApiTable,
  CodeExample,
  DoDont,
} from "../../_primitives"

const DEMO_GROUPS: AwNavTreeGroup[] = [
  {
    id: "pessoal",
    label: "Pessoal",
    items: [
      {
        label: "Perfil",
        icon: "account_circle",
        href: "#perfil",
        active: true,
        children: [
          { label: "Dados pessoais", href: "#dados" },
          { label: "Senha e acesso", href: "#senha", active: true },
          { label: "Sessões ativas", href: "#sessoes" },
          { label: "Meus dados", href: "#meus-dados" },
        ],
      },
      { label: "Notificações", icon: "notifications", href: "#notificacoes" },
      { label: "Aparência", icon: "palette", href: "#aparencia" },
    ],
  },
  {
    id: "workspace",
    label: "Acme Inc.",
    items: [
      {
        label: "Organização",
        icon: "domain",
        href: "#org",
        children: [
          { label: "Privacidade & auditoria", href: "#org-auditoria" },
        ],
      },
      { label: "Membros & funções", icon: "groups", href: "#membros" },
      { label: "Financeiro", icon: "account_balance_wallet", href: "#financeiro" },
    ],
  },
]

function SidebarPanel({
  children,
  width,
}: {
  children: React.ReactNode
  width: number
}) {
  return (
    <div
      style={{ width }}
      className="rounded-xl border border-(--border-subtle) bg-(--aw-gray-50) px-3 py-4"
    >
      {children}
    </div>
  )
}

export default function NavTreePage() {
  return (
    <>
      <PageHero title="Nav tree">
        Navegação lateral em árvore. Itens-pai com filhos viram seções que
        expandem e recolhem por um chevron, com transição suave de altura. Os
        filhos aparecem ligados por uma guia vertical e o item ativo ganha um
        segmento sólido na guia. Base da sidebar de configurações.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="default"
            title="Árvore expandida"
            lead="Cabeçalho de grupo em sentence case (não uppercase). O pai ativo abre por padrão; o chevron expande/recolhe qualquer pai. Clique no chevron de 'Organização' para abrir."
          >
            <Stage label="Dois grupos — Pessoal e workspace">
              <SidebarPanel width={260}>
                <AwNavTree groups={DEMO_GROUPS} aria-label="Configurações" />
              </SidebarPanel>
            </Stage>
          </Section>

          <Section
            id="collapsed"
            title="Recolhida (icon-only)"
            lead="No modo recolhido da rail, some tudo menos os ícones — rótulos de grupo, chevrons e filhos ficam ocultos. Os grupos viram blocos separados por um divisor."
          >
            <Stage label="Rail recolhida">
              <SidebarPanel width={72}>
                <AwNavTree groups={DEMO_GROUPS} collapsed aria-label="Configurações" />
              </SidebarPanel>
            </Stage>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Itens reusam a linguagem da nav-rail (ativo = pill --bg-inverse). O novo é o cabeçalho de grupo, o chevron e a guia em árvore dos filhos."
          >
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Spec
                k="cabeçalho de grupo"
                v="body-sm · 500"
                d="Sentence case, --fg-tertiary. Sem uppercase."
              />
              <Spec
                k="transição de altura"
                v="grid-rows 0fr → 1fr"
                d="duration-aw-base · ease-aw-out. Respeita reduce-motion."
              />
              <Spec
                k="chevron"
                v="chevron_right · 18 px"
                d="Rotaciona 90° ao abrir. Botão separado do link."
              />
              <Spec
                k="guia dos filhos"
                v="border-l --border-subtle"
                d="ml-7, alinhada sob o ícone do pai."
              />
              <Spec
                k="filho ativo"
                v="--fg-primary + --bg-surface"
                d="Segmento sólido --fg-primary sobre a guia."
              />
              <Spec
                k="item ativo"
                v="--bg-inverse"
                d="Pill escuro herdado da nav-rail."
              />
            </div>
          </Section>

          <Section
            id="api"
            title="API"
            lead={`Import: import { AwNavTree } from "@/components/ui/AwNavTree".`}
          >
            <ApiTable>
              <PropRow
                prop="groups"
                type="AwNavTreeGroup[]"
                doc="Grupos da árvore. Cada grupo tem id, label, leading? e items."
              />
              <PropRow
                prop="AwNavTreeItem.children"
                type="AwNavTreeSubItem[]"
                doc="Quando presente, o item vira seção expansível com chevron."
              />
              <PropRow
                prop="AwNavTreeItem.active"
                type="boolean"
                def="false"
                doc="Estado selecionado. Um pai ativo abre seus filhos por padrão."
              />
              <PropRow
                prop="AwNavTreeGroup.leading"
                type="ReactNode"
                doc="Conteúdo à esquerda do label — ex.: logo da organização."
              />
              <PropRow
                prop="collapsed"
                type="boolean"
                def="false"
                doc="Modo icon-only: oculta rótulos, chevrons e filhos."
              />
              <PropRow
                prop="renderLink"
                type="(props) => ReactNode"
                def="<a>"
                doc="Renderizador de link — passe next/link para manter prefetch e SPA nav."
              />
            </ApiTable>
            <CodeExample>{`import { AwNavTree } from "@/components/ui/AwNavTree"
import Link from "next/link"

<AwNavTree
  collapsed={collapsed}
  groups={[
    {
      id: "pessoal",
      label: "Pessoal",
      items: [
        {
          label: "Perfil",
          icon: "account_circle",
          href: "/settings/perfil",
          active: true,
          children: [
            { label: "Dados pessoais", href: "/settings/perfil/dados-pessoais" },
            { label: "Senha e acesso", href: "/settings/perfil/senha", active: true },
          ],
        },
        { label: "Notificações", icon: "notifications", href: "/settings/notificacoes" },
      ],
    },
  ]}
  renderLink={({ children, ...props }) => (
    <Link prefetch {...props}>{children}</Link>
  )}
/>`}</CodeExample>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>Abrir o pai ativo por padrão — o usuário vê onde está.</>,
                <>Children só de um nível — Perfil → Dados pessoais, sem netos.</>,
                <>Rótulo de grupo em sentence case, descrevendo o contexto.</>,
              ]}
              donts={[
                <>Uppercase no rótulo de grupo — abandonamos isso de propósito.</>,
                <>Aninhar árvores dentro de árvores — vira labirinto.</>,
                <>Animar a altura sem <em>overflow: hidden</em> no wrapper interno.</>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
