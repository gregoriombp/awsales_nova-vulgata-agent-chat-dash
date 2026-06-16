"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import {
  AwNavTree,
  type AwNavTreeGroup,
  type AwNavTreeLinkProps,
} from "@/components/ui/AwNavTree";
import { ONBOARDING_ORG } from "@/app/primeiro-acesso/_data";

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

export type SettingsNavGroup = {
  id: string;
  /** Label do grupo (eyebrow). Para o grupo da organização, é o nome real da org. */
  label: string;
  /** Quando true, o cabeçalho mostra o logo da organização ao lado do nome. */
  org?: boolean;
  items: SettingsNavItem[];
};

/**
 * Sidebar dividida em dois contextos — Pessoal (preferências do usuário) e
 * o workspace, identificado pelo nome real da organização. Espelha a convenção
 * de produtos como Notion, Linear e Attio: conta primeiro, organização depois.
 */
export const SETTINGS_NAV_GROUPS: SettingsNavGroup[] = [
  {
    id: "pessoal",
    label: "Pessoal",
    items: [
      {
        href: "/settings/perfil",
        label: "Perfil",
        icon: "account_circle",
        matchPrefixes: ["/settings/perfil"],
        subRoutes: {
          "dados-pessoais": "Dados pessoais",
          senha: "Senha e acesso",
          "sessoes-ativas": "Sessões ativas",
          "meus-dados": "Meus dados",
        },
        children: [
          { href: "/settings/perfil/dados-pessoais", label: "Dados pessoais" },
          { href: "/settings/perfil/senha", label: "Senha e acesso" },
          { href: "/settings/perfil/sessoes-ativas", label: "Sessões ativas" },
          { href: "/settings/perfil/meus-dados", label: "Meus dados" },
        ],
      },
      { href: "/settings/notificacoes", label: "Notificações", icon: "notifications" },
      { href: "/settings/aparencia", label: "Aparência", icon: "palette" },
    ],
  },
  {
    id: "workspace",
    label: ONBOARDING_ORG.name,
    org: true,
    items: [
      {
        href: "/settings/organizacao",
        label: "Organização",
        icon: "domain",
        matchPrefixes: ["/settings/organizacao"],
        subRoutes: {
          auditoria: "Privacidade & auditoria",
        },
        children: [
          {
            href: "/settings/organizacao/auditoria",
            label: "Privacidade & auditoria",
          },
        ],
      },
      {
        href: "/settings/equipe-permissoes",
        label: "Membros & funções",
        icon: "groups",
        matchPrefixes: ["/settings/equipe-permissoes"],
        subRoutes: {
          convites: "Convites",
          funcoes: "Funções",
          grupos: "Equipes",
        },
        children: [
          { href: "/settings/equipe-permissoes", label: "Membros" },
          { href: "/settings/equipe-permissoes/funcoes", label: "Funções" },
          { href: "/settings/equipe-permissoes/grupos", label: "Equipes" },
        ],
      },
      { href: "/settings/api", label: "API & desenvolvedores", icon: "key" },
      {
        href: "/settings/financeiro",
        label: "Financeiro",
        icon: "account_balance_wallet",
        matchPrefixes: ["/settings/financeiro"],
        subRoutes: {
          "visao-geral": "Visão geral",
          consumo: "Consumo",
          "metodos-pagamento": "Métodos de pagamento",
          "historico-faturas": "Faturas",
          auditoria: "Atividade",
        },
        children: [
          { href: "/settings/financeiro/visao-geral", label: "Visão geral" },
          { href: "/settings/financeiro/consumo", label: "Consumo" },
          {
            href: "/settings/financeiro/metodos-pagamento",
            label: "Métodos de pagamento",
          },
          { href: "/settings/financeiro/historico-faturas", label: "Faturas" },
          { href: "/settings/financeiro/auditoria", label: "Atividade" },
        ],
      },
      { href: "/settings/zona-de-perigo", label: "Zona de perigo", icon: "warning" },
    ],
  },
];

/** Lista achatada — usada pela barra de breadcrumbs do layout. */
export const SETTINGS_NAV_ITEMS: SettingsNavItem[] = SETTINGS_NAV_GROUPS.flatMap(
  (g) => g.items,
);

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

/** next/link como renderizador de links da árvore (mantém prefetch + SPA nav). */
function renderNavLink({ children, ...props }: AwNavTreeLinkProps) {
  return (
    <Link prefetch {...props}>
      {children}
    </Link>
  );
}

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

  // Converte a config de navegação no formato da árvore, resolvendo o estado
  // ativo de cada item/filho a partir da rota atual.
  const treeGroups = useMemo<AwNavTreeGroup[]>(
    () =>
      SETTINGS_NAV_GROUPS.map((group) => ({
        id: group.id,
        label: group.label,
        leading: group.org ? (
          <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-(--bg-muted) ring-1 ring-(--border-subtle)">
            <img
              src={ONBOARDING_ORG.logo}
              alt=""
              width={18}
              height={18}
              style={{ objectFit: "cover" }}
            />
          </span>
        ) : undefined,
        items: group.items.map((item) => ({
          label: item.label,
          icon: item.icon,
          href: item.href,
          active: isSettingsNavItemActive(pathname, item),
          children: item.children?.map((child) => ({
            label: child.label,
            href: child.href,
            active: pathname === child.href.split("#")[0],
          })),
        })),
      })),
    [pathname],
  );

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
            <h6 className="m-0 text-(--fg-primary)">Configurações</h6>
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

        <AwNavTree
          groups={treeGroups}
          collapsed={collapsed}
          renderLink={renderNavLink}
        />
      </div>
    </aside>
  );
}
