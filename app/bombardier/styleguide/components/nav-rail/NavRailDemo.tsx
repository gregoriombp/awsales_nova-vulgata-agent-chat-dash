"use client"

import * as React from "react"
import {
  AwNavRail,
  AwNavRailGroup,
  AwNavRailItem,
  AwNavRailOrgSwitcher,
  AwNavRailUserSwitcher,
  type AwNavRailOrgOption,
  type AwNavRailUserOption,
  type AwNavRailTheme,
} from "@/components/ui/AwNavRail"
import { AwButton } from "@/components/ui/AwButton"

const ORGS: AwNavRailOrgOption[] = [
  {
    id: "org-1",
    name: "Nome da organização",
    subtitle: "Organização",
    icon: "/assets/icon_artificial_concord_organization.png",
  },
  { id: "org-2", name: "Aswork Labs", subtitle: "Workspace" },
  { id: "org-3", name: "Cliente Demo", subtitle: "Organização" },
]

const USERS: AwNavRailUserOption[] = [
  {
    id: "u-1",
    name: "Gregório Pinheiro",
    title: "Super Administrador",
    avatar: "/assets/users/greg.jpg",
    initials: "GP",
  },
  {
    id: "u-2",
    name: "Gabriel Lima",
    title: "Administrador",
    avatar: "/assets/users/gabriel_lima.jpg",
    initials: "GL",
  },
  {
    id: "u-3",
    name: "José Júnior",
    title: "Estagiário",
    avatar: "/assets/users/jose.jpg",
    initials: "JJ",
  },
]

function NavContent({ activeId }: { activeId: string }) {
  const items: Array<{ id: string; icon: string; label: string; count?: number }> = [
    { id: "home", icon: "home", label: "Início" },
    { id: "dashboard", icon: "dashboard", label: "Dashboard" },
    { id: "activity", icon: "bolt", label: "Atividade", count: 12 },
  ]
  const agentItems: Array<{ id: string; icon: string; label: string }> = [
    { id: "studio", icon: "smart_toy", label: "Agent Studio" },
    { id: "tasks", icon: "done_all", label: "Tarefas" },
    { id: "dispatch", icon: "send", label: "Disparos" },
  ]
  return (
    <>
      <AwNavRailGroup label="Workspace">
        {items.map((it) => (
          <AwNavRailItem
            key={it.id}
            icon={it.icon}
            href="#"
            count={it.count}
            active={it.id === activeId}
          >
            {it.label}
          </AwNavRailItem>
        ))}
      </AwNavRailGroup>

      <AwNavRailGroup label="Agentes">
        {agentItems.map((it) => (
          <AwNavRailItem
            key={it.id}
            icon={it.icon}
            href="#"
            active={it.id === activeId}
          >
            {it.label}
          </AwNavRailItem>
        ))}
      </AwNavRailGroup>

      <AwNavRailGroup>
        <AwNavRailItem
          icon="storage"
          href="#"
          active={activeId === "knowledge"}
        >
          Conhecimento
        </AwNavRailItem>
      </AwNavRailGroup>
    </>
  )
}

/** Live demo — a single rail you can toggle collapsed / theme on. */
export function LiveDemo() {
  const [collapsed, setCollapsed] = React.useState(false)
  const [theme, setTheme] = React.useState<AwNavRailTheme>("light")
  const [orgId, setOrgId] = React.useState(ORGS[0].id)
  const [userId, setUserId] = React.useState(USERS[0].id)

  const organization = ORGS.find((o) => o.id === orgId) ?? ORGS[0]
  const user = USERS.find((u) => u.id === userId) ?? USERS[0]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <AwButton
          variant="secondary"
          size="sm"
          iconLeft={collapsed ? "menu_open" : "menu"}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? "Expandir" : "Recolher"}
        </AwButton>
        <AwButton
          variant="secondary"
          size="sm"
          iconLeft={theme === "dark" ? "light_mode" : "dark_mode"}
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        >
          Tema: {theme}
        </AwButton>
        <span className="caption">
          Testa tudo junto: toggle, dropdowns, seleção.
        </span>
      </div>

      <div
        className="rounded-lg border border-(--border-subtle) p-6 flex"
        style={{
          background:
            theme === "dark" ? "var(--dark-bg)" : "var(--bg-surface)",
          minHeight: 640,
        }}
      >
        <AwNavRail
          collapsed={collapsed}
          theme={theme}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          top={
            <AwNavRailOrgSwitcher
              organization={organization}
              organizations={ORGS}
              onSelect={setOrgId}
              manageHref="#"
            />
          }
          bottom={
            <AwNavRailUserSwitcher
              user={user}
              users={USERS}
              onSelect={setUserId}
              signOutHref="#"
            />
          }
        >
          <NavContent activeId="studio" />
        </AwNavRail>
      </div>
    </div>
  )
}

/** Static panel — one of the 4 visual variants. Handlers are no-ops. */
export function StaticRail({
  collapsed,
  theme,
  translucent,
}: {
  collapsed: boolean
  theme: AwNavRailTheme
  translucent?: boolean
}) {
  const org = ORGS[0]
  const user = USERS[0]
  return (
    <AwNavRail
      collapsed={collapsed}
      theme={theme}
      translucent={translucent}
      onToggleCollapsed={() => {}}
      top={
        <AwNavRailOrgSwitcher organization={org} organizations={ORGS} />
      }
      bottom={
        <AwNavRailUserSwitcher user={user} users={USERS} />
      }
    >
      <NavContent activeId="studio" />
    </AwNavRail>
  )
}
