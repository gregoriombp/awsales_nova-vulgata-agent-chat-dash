"use client";

import { useEffect, useState } from "react";
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
  /** Subitens renderizados no nav, debaixo do pai (atalhos rápidos). */
  children?: { href: string; label: string }[];
};

export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = [
  {
    href: "/settings/perfil",
    label: "Perfil",
    icon: "person",
    children: [
      { href: "/settings/perfil", label: "Dados pessoais" },
      { href: "/settings/seguranca#senha", label: "Senha" },
      { href: "/settings/seguranca#sessoes", label: "Sessões ativas" },
      { href: "/settings/notificacoes", label: "Notificações" },
    ],
  },
  { href: "/settings/organizacao", label: "Organização", icon: "domain" },
  {
    href: "/settings/equipe-permissoes",
    label: "Equipe & permissões",
    icon: "groups",
    matchPrefixes: ["/settings/equipe-permissoes"],
    subRoutes: {
      convites: "Convites",
      funcoes: "Funções",
      grupos: "Equipes",
    },
  },
  { href: "/settings/notificacoes", label: "Notificações", icon: "notifications" },
  { href: "/settings/aparencia", label: "Aparência", icon: "palette" },
  { href: "/settings/seguranca", label: "Segurança", icon: "shield" },
  { href: "/settings/api", label: "API & desenvolvedores", icon: "key" },
  {
    href: "/settings/financeiro",
    label: "Financeiro",
    icon: "account_balance_wallet",
    matchPrefixes: ["/settings/financeiro"],
    subRoutes: {
      "visao-geral": "Visão geral",
      "metodos-pagamento": "Métodos de pagamento",
      "historico-faturas": "Faturas",
      auditoria: "Atividade",
    },
  },
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

const COLLAPSED_STORAGE_KEY = "awsales:settings-nav:collapsed";

export function SettingsNav() {
  const pathname = usePathname() ?? "";
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COLLAPSED_STORAGE_KEY);
      if (raw === "1") setCollapsed(true);
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(COLLAPSED_STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* noop */
      }
      return next;
    });
  };

  return (
    <aside
      aria-label="Seções de configurações"
      data-collapsed={collapsed ? "true" : "false"}
      className={`hidden h-full shrink-0 self-stretch border-r border-(--border-subtle) bg-(--aw-gray-50) transition-[width] duration-200 ease-out lg:block ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
      style={hydrated ? undefined : { visibility: "hidden" }}
    >
      <div className={`sticky top-0 ${collapsed ? "px-3" : "px-6"} pt-5 pb-8`}>
        <div
          className={`mb-5 flex items-center ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed && (
            <div>
              <p className="m-0 mb-1 aw-eyebrow text-(--fg-tertiary)">
                Configurações
              </p>
              <h6 className="m-0 text-(--fg-primary)">
                Workspace
              </h6>
            </div>
          )}
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Expandir navegação" : "Recolher navegação"}
            aria-expanded={!collapsed}
            className="flex h-8 w-8 items-center justify-center rounded-md text-(--fg-tertiary) hover:bg-(--bg-muted) hover:text-(--fg-primary)"
          >
            <Icon name={collapsed ? "menu_open" : "menu"} size={18} />
          </button>
        </div>

        <nav
          className={`aw-nav-rail ${
            collapsed ? "aw-nav-rail--collapsed" : "aw-nav-rail--expanded"
          } w-full! p-0! border-0! bg-transparent!`}
        >
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
                <div key={item.href} className="flex flex-col">
                  <Link
                    href={item.href}
                    prefetch
                    aria-current={active ? "page" : undefined}
                    aria-label={collapsed ? item.label : undefined}
                    title={collapsed ? item.label : undefined}
                    className={classes}
                  >
                    <Icon name={item.icon} size={20} fill={active ? 1 : 0} />
                    <span className="aw-nav-rail__item-label">{item.label}</span>
                  </Link>
                  {!collapsed && item.children && (
                    <div className="ml-9 mt-0.5 flex flex-col gap-px border-l border-(--border-subtle) pl-3">
                      {item.children.map((child) => {
                        const childActive = pathname === child.href.split("#")[0];
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            prefetch
                            className={`flex h-7 items-center rounded-md px-2 text-xs font-medium transition-colors duration-aw-fast ${
                              childActive
                                ? "text-(--fg-primary)"
                                : "text-(--fg-tertiary) hover:text-(--fg-secondary)"
                            }`}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}
