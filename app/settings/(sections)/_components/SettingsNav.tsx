"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

export type SettingsNavItem = {
  href: string;
  label: string;
  icon: string;
  /** Match any path that starts with one of these prefixes. */
  matchPrefixes?: string[];
  /** Label for sub-route segments — used to build the third breadcrumb. */
  subRoutes?: Record<string, string>;
};

export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  { href: "/settings/perfil", label: "Perfil", icon: "person" },
  { href: "/settings/organizacao", label: "Organização", icon: "domain" },
  {
    href: "/settings/equipe-permissoes",
    label: "Equipe & permissões",
    icon: "groups",
    matchPrefixes: ["/settings/equipe-permissoes"],
    subRoutes: {
      convites: "Convites",
      funcoes: "Funções",
      grupos: "Grupos",
    },
  },
  { href: "/settings/notificacoes", label: "Notificações", icon: "notifications" },
  { href: "/settings/aparencia", label: "Aparência", icon: "palette" },
  { href: "/settings/seguranca", label: "Segurança", icon: "shield" },
  { href: "/settings/api", label: "API & desenvolvedores", icon: "key" },
  { href: "/settings/faturamento", label: "Faturamento & uso", icon: "credit_card" },
  { href: "/settings/zona-de-perigo", label: "Zona de perigo", icon: "warning" },
];

export function isSettingsNavItemActive(
  pathname: string,
  item: SettingsNavItem,
): boolean {
  const prefixes = item.matchPrefixes ?? [item.href];
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function SettingsNav() {
  const pathname = usePathname() ?? "";

  return (
    <aside
      aria-label="Seções de configurações"
      className="hidden w-[260px] shrink-0 border-r border-[var(--border-subtle)] lg:block"
    >
      <div className="sticky top-0 px-6 pt-12 pb-8">
        <p className="m-0 mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--fg-tertiary)]">
          Configurações
        </p>
        <h2 className="m-0 mb-6 text-[18px] font-semibold tracking-[-0.01em] text-[var(--fg-primary)]">
          Workspace
        </h2>
        <nav className="aw-nav-rail aw-nav-rail--expanded !w-full !p-0 !border-0 !bg-transparent">
          <div className="aw-nav-rail__items">
            {SETTINGS_NAV_ITEMS.map((item) => {
              const active = isSettingsNavItemActive(pathname, item);
              const classes = [
                "aw-nav-rail__item",
                active && "aw-nav-rail__item--active",
              ]
                .filter(Boolean)
                .join(" ");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch
                  aria-current={active ? "page" : undefined}
                  className={classes}
                >
                  <Icon name={item.icon} size={20} fill={active ? 1 : 0} />
                  <span className="aw-nav-rail__item-label">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}
