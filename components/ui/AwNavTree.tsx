"use client";

import * as React from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

/* ============================================================
 * AwNavTree — navegação lateral em árvore.
 *
 * Itens-pai com `children` viram seções expansíveis/recolhíveis
 * por um chevron, com transição suave de altura. Os filhos
 * aparecem ligados por uma guia vertical (estilo Notion), e o
 * filho ativo ganha um segmento sólido na guia + realce de fundo.
 *
 * Reusa a linguagem visual dos itens da nav-rail (`.aw-nav-rail__item`)
 * para manter a consistência com o app shell. Suporta o modo
 * recolhido (icon-only) da rail.
 * ============================================================ */

export type AwNavTreeSubItem = {
  label: string;
  href: string;
  active?: boolean;
};

export type AwNavTreeItem = {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
  iconFill?: 0 | 1;
  children?: AwNavTreeSubItem[];
  /** Abre no primeiro render. Por padrão, abre quando o item está ativo. */
  defaultExpanded?: boolean;
};

export type AwNavTreeGroup = {
  id: string;
  /** Rótulo do grupo (sentence case, não uppercase). */
  label?: string;
  /** Conteúdo à esquerda do rótulo — ex.: logo da organização. */
  leading?: React.ReactNode;
  items: AwNavTreeItem[];
};

export type AwNavTreeLinkProps = {
  href: string;
  className: string;
  children: React.ReactNode;
  "aria-current"?: "page";
  "aria-label"?: string;
  title?: string;
};

export type AwNavTreeProps = {
  groups: AwNavTreeGroup[];
  /** Modo icon-only da rail — esconde rótulos, filhos e chevrons. */
  collapsed?: boolean;
  /** Renderizador de link (ex.: next/link). Default: `<a>`. */
  renderLink?: (props: AwNavTreeLinkProps) => React.ReactNode;
  className?: string;
  "aria-label"?: string;
};

function defaultRenderLink({ children, ...props }: AwNavTreeLinkProps) {
  return <a {...props}>{children}</a>;
}

export function AwNavTree({
  groups,
  collapsed = false,
  renderLink = defaultRenderLink,
  className,
  "aria-label": ariaLabel,
}: AwNavTreeProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "aw-nav-rail w-full! border-0! bg-transparent! p-0!",
        collapsed ? "aw-nav-rail--collapsed" : "aw-nav-rail--expanded",
        className,
      )}
    >
      {groups.map((group, i) => (
        <div
          key={group.id}
          className={cn(
            i > 0 &&
              (collapsed
                ? "mt-4 border-t border-(--border-subtle) pt-4"
                : "mt-7"),
          )}
        >
          {!collapsed && group.label && (
            <div className="mb-2 flex items-center gap-2 px-1">
              {group.leading}
              <span className="body-sm font-medium tracking-tight text-(--fg-tertiary)">
                {group.label}
              </span>
            </div>
          )}

          <div className="aw-nav-rail__items">
            {group.items.map((item) => (
              <AwNavTreeRow
                key={item.href}
                item={item}
                collapsed={collapsed}
                renderLink={renderLink}
              />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function AwNavTreeRow({
  item,
  collapsed,
  renderLink,
}: {
  item: AwNavTreeItem;
  collapsed: boolean;
  renderLink: (props: AwNavTreeLinkProps) => React.ReactNode;
}) {
  const hasChildren = !collapsed && !!item.children?.length;
  const childActive = item.children?.some((c) => c.active) ?? false;
  const defaultOpen = item.defaultExpanded ?? (item.active || childActive);

  // `undefined` = segue o default (abre quando ativo); um booleano = override do usuário.
  const [override, setOverride] = React.useState<boolean | undefined>(undefined);
  const open = hasChildren && (override ?? defaultOpen);

  // Ao navegar para dentro da seção, garante que ela apareça aberta
  // mesmo que o usuário tenha recolhido antes.
  React.useEffect(() => {
    if (item.active || childActive) setOverride(undefined);
  }, [item.active, childActive]);

  const regionId = React.useId();

  const linkClasses = cn(
    "aw-nav-rail__item",
    item.active && "aw-nav-rail__item--active",
    hasChildren && "pr-9!",
  );

  const link = renderLink({
    href: item.href,
    className: linkClasses,
    "aria-current": item.active ? "page" : undefined,
    "aria-label": collapsed ? item.label : undefined,
    title: collapsed ? item.label : undefined,
    children: (
      <>
        <Icon
          name={item.icon}
          size={20}
          fill={item.iconFill ?? (item.active ? 1 : 0)}
        />
        <span className="aw-nav-rail__item-label">{item.label}</span>
      </>
    ),
  });

  return (
    <div className="flex flex-col">
      <div className={hasChildren ? "relative" : undefined}>
        {link}
        {hasChildren && (
          <button
            type="button"
            onClick={() => setOverride(!open)}
            aria-expanded={open}
            aria-controls={regionId}
            aria-label={`${open ? "Recolher" : "Expandir"} ${item.label}`}
            className={cn(
              "absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md transition-colors duration-aw-fast",
              item.active
                ? "text-(--fg-on-inverse) opacity-80 hover:opacity-100"
                : "text-(--fg-tertiary) hover:bg-(--bg-surface) hover:text-(--fg-primary)",
            )}
          >
            <Icon
              name="chevron_right"
              size={18}
              className={cn(
                "transition-transform duration-aw-base ease-aw-out motion-reduce:transition-none",
                open && "rotate-90",
              )}
            />
          </button>
        )}
      </div>

      {hasChildren && (
        <div
          id={regionId}
          aria-hidden={!open}
          style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
          className="grid transition-[grid-template-rows] duration-aw-base ease-aw-out motion-reduce:transition-none"
        >
          <div className="min-h-0 overflow-hidden">
            <ul
              className={cn(
                "m-0 mt-0.5 mb-1 ml-7 flex list-none flex-col gap-0.5 border-l border-(--border-subtle) p-0 pl-3 transition-opacity duration-aw-base",
                open ? "opacity-100" : "opacity-0",
              )}
            >
              {item.children!.map((child) => (
                <li key={child.href} className="m-0 list-none">
                  {renderLink({
                    href: child.href,
                    className: cn(
                      "relative flex h-7 items-center rounded-md px-2 text-xs font-medium transition-colors duration-aw-fast",
                      child.active
                        ? "bg-(--bg-surface) text-(--fg-primary) before:absolute before:top-1 before:bottom-1 before:-left-3 before:w-0.5 before:rounded-full before:bg-(--fg-primary) before:content-['']"
                        : "text-(--fg-tertiary) hover:bg-(--bg-hover) hover:text-(--fg-secondary)",
                    ),
                    "aria-current": child.active ? "page" : undefined,
                    children: child.label,
                  })}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
