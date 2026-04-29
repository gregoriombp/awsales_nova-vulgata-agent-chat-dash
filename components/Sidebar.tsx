"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AwNavRail,
  AwNavRailGroup,
  AwNavRailItem,
  AwNavRailOrgSwitcher,
  AwNavRailUserSwitcher,
  type AwNavRailOrgOption,
  type AwNavRailUserOption,
} from "@/components/ui/AwNavRail";

type NavItem = {
  label: string;
  href: string;
  icon: string;
  count?: number | string;
};

type NavSection = {
  label?: string;
  items: NavItem[];
};

const ORGANIZATIONS: AwNavRailOrgOption[] = [
  {
    id: "org-1",
    name: "Nome da organização",
    subtitle: "Organização",
    icon: "/assets/icon_artificial_concord_organization.png",
  },
  { id: "org-2", name: "AwSales Labs", subtitle: "Workspace" },
  { id: "org-3", name: "Cliente Demo", subtitle: "Organização" },
];

const USERS: AwNavRailUserOption[] = [
  {
    id: "user-1",
    name: "Gregório Pinheiro",
    title: "Super Administrador",
    initials: "GP",
    avatar: "/assets/users/greg.jpg",
  },
  {
    id: "user-2",
    name: "Gabriel Lima",
    title: "Administrador",
    initials: "GL",
    avatar: "/assets/users/gabriel_lima.jpg",
  },
  {
    id: "user-3",
    name: "José Júnior",
    title: "Estagiário",
    initials: "JJ",
    avatar: "/assets/users/jose.jpg",
  },
];

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: "Início", href: "/inicio", icon: "home" },
      { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
      { label: "Insights", href: "/insights", icon: "bolt" },
    ],
  },
  {
    label: "Agentes",
    items: [
      { label: "Agent studio", href: "/agent-studio", icon: "auto_awesome" },
      { label: "Aprovações", href: "/approvals", icon: "done_all" },
      { label: "Disparos", href: "/triggers", icon: "send" },
    ],
  },
  {
    label: "Fontes",
    items: [
      { label: "Memory base", href: "/knowledge-os", icon: "hub" },
      { label: "AOPs", href: "/aops", icon: "description" },
      { label: "Biblioteca", href: "/library", icon: "bookmark" },
      { label: "Tools", href: "/tools", icon: "build" },
      { label: "Integrações", href: "/integrations", icon: "extension" },
    ],
  },
  {
    label: "Acompanhamento",
    items: [
      { label: "Conversas", href: "/conversations", icon: "chat", count: 99 },
      { label: "Playground", href: "/playground", icon: "forum" },
      { label: "Histórico de alterações", href: "/history", icon: "history" },
    ],
  },
  {
    items: [{ label: "Configurações", href: "/settings", icon: "tune" }],
  },
];

export default function Sidebar({
  forcedCollapsed,
  floating,
}: {
  forcedCollapsed?: boolean;
  /** Liquid-glass rail that floats over the page. Starts collapsed. */
  floating?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(
    () =>
      forcedCollapsed ??
      floating ??
      (pathname?.startsWith("/knowledge-os") ?? false)
  );

  useEffect(() => {
    if (pathname?.startsWith("/knowledge-os")) setIsCollapsed(true);
  }, [pathname]);

  useEffect(() => {
    if (forcedCollapsed) setIsCollapsed(true);
  }, [forcedCollapsed]);

  useEffect(() => {
    if (floating) setIsCollapsed(true);
  }, [floating]);

  const [selectedOrgId, setSelectedOrgId] = useState<string>(ORGANIZATIONS[0].id);
  const [selectedUserId, setSelectedUserId] = useState<string>(USERS[0].id);

  const selectedOrg =
    ORGANIZATIONS.find((o) => o.id === selectedOrgId) ?? ORGANIZATIONS[0];
  const selectedUser =
    USERS.find((u) => u.id === selectedUserId) ?? USERS[0];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href) ?? false;
  };

  const handleNavigate = (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }
    event.preventDefault();
    if (href === "/knowledge-os") setIsCollapsed(true);
    router.push(href);
  };

  return (
    <aside
      className="h-screen flex-shrink-0 p-3 flex bg-transparent"
      style={{ width: isCollapsed ? 88 : 284 }}
    >
      <AwNavRail
        translucent
        collapsed={isCollapsed}
        onToggleCollapsed={() => setIsCollapsed((v) => !v)}
        style={{ height: "100%", width: "100%" }}
        top={
          <AwNavRailOrgSwitcher
            organization={selectedOrg}
            organizations={ORGANIZATIONS}
            onSelect={setSelectedOrgId}
            manageHref="/settings"
          />
        }
        bottom={
          <AwNavRailUserSwitcher
            user={selectedUser}
            users={USERS}
            onSelect={setSelectedUserId}
            signOutHref="/"
          />
        }
      >
        {NAV_SECTIONS.map((section, sectionIdx) => (
          <AwNavRailGroup
            key={section.label ?? `section-${sectionIdx}`}
            label={section.label}
          >
            {section.items.map((item) => (
              <AwNavRailItem
                key={item.href}
                icon={item.icon}
                href={item.href}
                active={isActive(item.href)}
                count={item.count}
                onClick={handleNavigate(item.href)}
              >
                {item.label}
              </AwNavRailItem>
            ))}
          </AwNavRailGroup>
        ))}
      </AwNavRail>
    </aside>
  );
}
