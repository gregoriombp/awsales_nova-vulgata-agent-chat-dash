import {
  PageHero,
  Section,
  Spec,
  PropRow,
  ApiTable,
  CodeExample,
  DoDont,
} from "../../_primitives"
import { LiveDemo, StaticRail } from "./NavRailDemo"

function Panel({
  label,
  tint,
  children,
}: {
  label: string
  tint: "light" | "dark"
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-8 flex items-start justify-center relative min-h-[560px]">
      <div className="absolute top-3 right-5 aw-eyebrow">{label}</div>
      <div
        style={
          tint === "dark"
            ? {
                padding: 24,
                borderRadius: "var(--radius-xl)",
                background: "var(--dark-bg)",
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }
            : {
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }
        }
      >
        {children}
      </div>
    </div>
  )
}

/** Panel com canvas "rico" (gradiente + arte) para exibir
 * a variante translúcida — a blur do backdrop precisa de algo
 * visualmente denso por trás para aparecer. */
function GlassPanel({
  label,
  tint,
  children,
}: {
  label: string
  tint: "light" | "dark"
  children: React.ReactNode
}) {
  const lightCanvas: React.CSSProperties = {
    background:
      "radial-gradient(1200px 600px at 0% 0%, #ffd4c2 0%, transparent 60%)," +
      "radial-gradient(800px 600px at 100% 100%, #c7d9ff 0%, transparent 55%)," +
      "linear-gradient(135deg, #f6f3ee 0%, #e8e5df 100%)",
  }
  const darkCanvas: React.CSSProperties = {
    background:
      "radial-gradient(900px 500px at 15% 15%, rgba(167,139,250,0.55) 0%, transparent 55%)," +
      "radial-gradient(700px 500px at 85% 85%, rgba(6,182,212,0.50) 0%, transparent 55%)," +
      "radial-gradient(500px 400px at 50% 50%, rgba(236,72,153,0.28) 0%, transparent 60%)," +
      "#0a0e17",
  }
  return (
    <div className="rounded-lg border border-(--border-subtle) overflow-hidden relative min-h-[560px] p-8 flex items-start justify-center">
      <div
        className="absolute inset-0 pointer-events-none"
        style={tint === "dark" ? darkCanvas : lightCanvas}
        aria-hidden
      />
      <div
        className={`absolute top-3 right-5 aw-eyebrow ${
          tint === "dark" ? "text-white/80" : ""
        }`}
      >
        {label}
      </div>
      <div
        style={{
          position: "relative",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default function NavRailPage() {
  return (
    <>
      <PageHero title="Navigation rail">
        Navegação primária vertical do produto. Duas larguras —{" "}
        <strong>collapsed</strong> (64 px, só ícones) e{" "}
        <strong>expanded</strong> (260 px). Topo traz o seletor de
        organização; base traz o seletor de usuário. Botão de expandir /
        recolher sempre presente no header.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="live"
            title="Demo interativo"
            lead="Toggle do collapsed, toggle de tema, troca de organização e troca de usuário via dropdowns reais. Clique fora ou Esc pra fechar os menus."
          >
            <LiveDemo />
          </Section>

          <Section
            id="variants"
            title="Todas as 4 variantes"
            lead="Combinações de width × theme. Em collapsed os switchers viram apenas o ícone; os dropdowns abrem à direita do rail em vez de abaixo/acima."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Panel label="collapsed · dark" tint="dark">
                <StaticRail collapsed theme="dark" />
              </Panel>
              <Panel label="collapsed · light" tint="light">
                <StaticRail collapsed theme="light" />
              </Panel>
              <Panel label="expanded · dark" tint="dark">
                <StaticRail collapsed={false} theme="dark" />
              </Panel>
              <Panel label="expanded · light" tint="light">
                <StaticRail collapsed={false} theme="light" />
              </Panel>
            </div>
          </Section>

          <Section
            id="translucent"
            title="Translucent — liquid glass"
            lead="Acabamento em vidro líquido: fundo translúcido + backdrop blur-sm + saturação. Use quando o rail flutua sobre um canvas rico (arte, gradiente, mídia). Duas versões — claro e escuro — tingem o vidro para canvases de cada cor."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassPanel label="translucent · light" tint="light">
                <StaticRail collapsed translucent theme="light" />
              </GlassPanel>
              <GlassPanel label="translucent · dark" tint="dark">
                <StaticRail collapsed translucent theme="dark" />
              </GlassPanel>
              <GlassPanel label="translucent · light · expanded" tint="light">
                <StaticRail collapsed={false} translucent theme="light" />
              </GlassPanel>
              <GlassPanel label="translucent · dark · expanded" tint="dark">
                <StaticRail collapsed={false} translucent theme="dark" />
              </GlassPanel>
            </div>

            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <Spec
                k="prop"
                v="translucent={true}"
                d="Combina com theme='light' ou 'dark' — pinta o vidro para o canvas."
              />
              <Spec
                k="blur"
                v="backdrop-filter: blur(24px)"
                d="Saturação 180% para cores vivas do fundo aparecerem atrás."
              />
              <Spec
                k="fill"
                v="rgba branco 55% / preto 42%"
                d="Legibilidade garantida para texto do rail."
              />
              <Spec
                k="specular"
                v="inset 0 1px 0 rgba(255,255,255,…)"
                d="Borda superior realçada simula o highlight do vidro."
              />
              <Spec
                k="quando usar"
                v="canvas rico"
                d="Hero, empty state, landing — qualquer cena onde o chrome deve recuar."
              />
              <Spec
                k="quando não usar"
                v="canvas chapado / denso de texto"
                d="Sobre superfície uniforme o blur-sm some; use a variante sólida."
              />
            </div>
          </Section>

          <Section
            id="structure"
            title="Estrutura"
            lead="3 slots bem definidos: top (org switcher + toggle), body (grupos de navegação) e bottom (user switcher)."
          >
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Spec
                k="top"
                v="toolbar + AwNavRailOrgSwitcher"
                d="Botão de collapse no canto superior-direito; org abaixo."
              />
              <Spec
                k="body"
                v="AwNavRailGroup × N"
                d="Grupos separados por hairline. Rolam se excederem a altura."
              />
              <Spec
                k="bottom"
                v="AwNavRailUserSwitcher"
                d="Sticky no pé, acima do divisor."
              />
              <Spec
                k="dropdown direction"
                v="expanded: abaixo (org) / acima (user)"
                d="Collapsed: ambos abrem à direita do rail."
              />
              <Spec
                k="click-outside + Esc"
                v="fecham menus"
                d="Implementado internamente em cada switcher."
              />
              <Spec
                k="collapse toggle"
                v="menu · menu_open"
                d="Só aparece quando onToggleCollapsed é passado."
              />
            </div>
          </Section>

          <Section
            id="anatomy"
            title="Anatomia"
            lead="Mesmos valores das variantes anteriores; adicionais para os novos slots."
          >
            <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Spec
                k="largura"
                v="collapsed 64 · expanded 260"
                d="Altura = 100% do container pai."
              />
              <Spec
                k="radius container"
                v="--radius-xl · 16 px"
                d="Rail flutua como uma peça de chrome."
              />
              <Spec
                k="switcher btn"
                v="bg --bg-surface · radius-md"
                d="Avatar 32×32 + título 12.5/500 + subtítulo 11/tertiary."
              />
              <Spec
                k="avatar org"
                v="32 × 32 · radius-sm"
                d="Imagem object-cover ou inicial."
              />
              <Spec
                k="avatar user"
                v="32 × 32 · radius-full"
                d="Imagem object-cover ou iniciais 2 chars."
              />
              <Spec
                k="dropdown"
                v="radius-md + shadow-md + border-default"
                d="Min-width 240. Opens up/down no expanded, right no collapsed."
              />
              <Spec
                k="toggle button"
                v="28 × 28 · radius-sm"
                d="Muted hover no --bg-surface / --dark-bg-hover."
              />
              <Spec
                k="item"
                v="padding 8 · 12 · radius-md"
                d="Collapsed: 40 × 40 quadrado."
              />
              <Spec
                k="ícone"
                v="20 px Material Symbols"
                d="FILL=1 quando active."
              />
            </div>
          </Section>

          <Section
            id="api"
            title="API"
            lead={`Import: import { AwNavRail, AwNavRailGroup, AwNavRailItem, AwNavRailOrgSwitcher, AwNavRailUserSwitcher } from "@/components/ui/AwNavRail".`}
          >
            <h3 className="text-(--h5-size) font-medium mt-4 mb-3">
              AwNavRail
            </h3>
            <ApiTable>
              <PropRow
                prop="collapsed"
                type="boolean"
                def="false"
                doc="64 px icon-only; false = 260 px com labels."
              />
              <PropRow
                prop="theme"
                type='"light" | "dark"'
                def='"light"'
                doc="Explícito. Use dark em shell escuro."
              />
              <PropRow
                prop="translucent"
                type="boolean"
                def="false"
                doc="Liquid-glass — backdrop-blur-sm + fundo translúcido. Combine com theme para tingir o vidro."
              />
              <PropRow
                prop="onToggleCollapsed"
                type="() => void"
                doc="Quando passado, renderiza o botão de collapse no header."
              />
              <PropRow
                prop="top"
                type="ReactNode"
                doc="Slot do topo. Normalmente <AwNavRailOrgSwitcher>."
              />
              <PropRow
                prop="bottom"
                type="ReactNode"
                doc="Slot do pé. Normalmente <AwNavRailUserSwitcher>."
              />
              <PropRow
                prop="children"
                type="ReactNode"
                doc="Um ou mais <AwNavRailGroup>."
              />
            </ApiTable>

            <h3 className="text-(--h5-size) font-medium mt-8 mb-3">
              AwNavRailOrgSwitcher
            </h3>
            <ApiTable>
              <PropRow
                prop="organization"
                type="{ id, name, subtitle?, icon? }"
                doc="Organização atualmente selecionada."
              />
              <PropRow
                prop="organizations"
                type="OrgOption[]"
                doc="Lista que preenche o dropdown. Omitir = não há menu."
              />
              <PropRow
                prop="onSelect"
                type="(id: string) => void"
                doc="Handler ao escolher uma org."
              />
              <PropRow
                prop="manageHref"
                type="string"
                doc="Link de rodapé — “Gerenciar organizações”."
              />
              <PropRow
                prop="manageLabel"
                type="string"
                def='"Gerenciar organizações"'
                doc="Label custom do link de rodapé."
              />
            </ApiTable>

            <h3 className="text-(--h5-size) font-medium mt-8 mb-3">
              AwNavRailUserSwitcher
            </h3>
            <ApiTable>
              <PropRow
                prop="user"
                type="{ id, name, title?, avatar?, initials? }"
                doc="Usuário atual. Se avatar vier, sobrepõe initials."
              />
              <PropRow
                prop="users"
                type="UserOption[]"
                doc="Lista que preenche o dropdown."
              />
              <PropRow
                prop="onSelect"
                type="(id: string) => void"
                doc="Handler ao escolher um usuário."
              />
              <PropRow
                prop="signOutHref"
                type="string"
                doc="Link de rodapé — vermelho, rotula “Sair / trocar conta”."
              />
            </ApiTable>

            <CodeExample>{`"use client"
import { useState } from "react"
import {
  AwNavRail,
  AwNavRailGroup,
  AwNavRailItem,
  AwNavRailOrgSwitcher,
  AwNavRailUserSwitcher,
} from "@/components/ui/AwNavRail"

const ORGS = [
  { id: "o-1", name: "AwSales", subtitle: "Organização", icon: "/org.png" },
  { id: "o-2", name: "AwSales Labs", subtitle: "Workspace" },
]

const USERS = [
  { id: "u-1", name: "Gregório", title: "Admin", avatar: "/greg.jpg" },
  { id: "u-2", name: "Gabriel", title: "Editor", avatar: "/gabriel.jpg" },
]

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [orgId, setOrgId] = useState(ORGS[0].id)
  const [userId, setUserId] = useState(USERS[0].id)

  return (
    <AwNavRail
      collapsed={collapsed}
      theme="dark"
      onToggleCollapsed={() => setCollapsed(c => !c)}
      top={
        <AwNavRailOrgSwitcher
          organization={ORGS.find(o => o.id === orgId)!}
          organizations={ORGS}
          onSelect={setOrgId}
          manageHref="/settings"
        />
      }
      bottom={
        <AwNavRailUserSwitcher
          user={USERS.find(u => u.id === userId)!}
          users={USERS}
          onSelect={setUserId}
          signOutHref="/logout"
        />
      }
    >
      <AwNavRailGroup label="Workspace">
        <AwNavRailItem icon="home" href="/" active>Início</AwNavRailItem>
        <AwNavRailItem icon="dashboard" href="/dashboard">Dashboard</AwNavRailItem>
        <AwNavRailItem icon="bolt" href="/activity" count={12}>
          Atividade
        </AwNavRailItem>
      </AwNavRailGroup>
    </AwNavRail>
  )
}`}</CodeExample>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>Um único item <em>active</em> por rail.</>,
                <>Toggle collapse sempre presente — usuários densos recolhem por padrão.</>,
                <>Org switcher no topo, user switcher no pé. Nunca inverter.</>,
                <>Count inline muted, não badge vermelho.</>,
              ]}
              donts={[
                <>Dropdowns que ocupam mais de 320 px de largura.</>,
                <>Ações administrativas (deletar, impersonar) dentro dos dropdowns — são navegação, não console.</>,
                <>Theme dark sobre canvas claro — só em shell escuro.</>,
                <>Mais de 3 grupos de navegação — rail perde escaneabilidade.</>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
