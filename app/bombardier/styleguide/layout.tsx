"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as Collapsible from "@radix-ui/react-collapsible"
import { navigation } from "./navigation"
import ThemeToggle from "./ThemeToggle"
import { AwLogo } from "@/components/ui/AwLogo"
import { AwToastProvider } from "@/components/ui/AwToast"
import { Icon } from "@/components/ui/Icon"
import { SidebarSearch } from "./_SidebarSearch"

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export default function StyleguideLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <AwToastProvider>
    <div className="flex min-h-screen bg-(--bg-canvas) text-(--fg-primary)">
      <aside className="aw-sg-sidebar w-64 border-r border-(--border-subtle) p-6 flex flex-col gap-8 fixed top-0 left-0 h-screen overflow-y-auto">
        <Link
          href="/bombardier/styleguide"
          aria-label="AwSales Design System — voltar ao índice"
          className="inline-flex flex-col items-start no-underline"
          style={{ color: "var(--fg-primary)" }}
        >
          <AwLogo variant="wordmark" height={22} />
          <span className="aw-sg-sidebar__subtitle">Design System | 2026</span>
        </Link>

        <SidebarSearch />

        <nav className="flex flex-col gap-3">
          {navigation.map((section, i) => {
            const prevGroup = i > 0 ? navigation[i - 1].group : undefined
            const showGroupHeading = !!section.group && section.group !== prevGroup
            return (
            <div key={section.title} className="flex flex-col gap-3">
              {showGroupHeading && (
                <h2 className="m-0 mt-3 mb-0.5 px-0 text-[15px] font-semibold tracking-tight text-(--fg-primary)">
                  {section.group}
                </h2>
              )}
            <Collapsible.Root defaultOpen>
              <h3 className="aw-eyebrow m-0 mb-2">
                <Collapsible.Trigger className="group flex w-full items-center justify-between gap-2 text-left">
                  <span>{section.title}</span>
                  <Icon
                    name="expand_more"
                    size={16}
                    className="text-(--fg-tertiary) transition-transform duration-150 group-data-[state=closed]:-rotate-90"
                  />
                </Collapsible.Trigger>
              </h3>
              <Collapsible.Content className="aw-sg-collapsible-content">
                <ul className="flex flex-col gap-1">
                  {section.items.length === 0 && (
                    <li className="text-xs text-(--fg-tertiary) italic px-3 py-2">
                      — em breve —
                    </li>
                  )}
                  {section.items.map((item) => {
                    const active = pathname === item.href
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "block px-3 py-2 rounded-md text-sm no-underline transition-colors duration-150",
                            active
                              ? "bg-(--bg-inverse) text-(--fg-on-inverse)"
                              : "text-(--fg-secondary) hover:bg-(--bg-surface) hover:text-(--fg-primary)"
                          )}
                        >
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </Collapsible.Content>
            </Collapsible.Root>
            </div>
            )
          })}
        </nav>

        <div className="mt-auto text-xs text-(--fg-tertiary) leading-relaxed">
          AwSales Design System
          <br />
          Geist · Geist Mono
        </div>
      </aside>

      <main className="flex-1 ml-64 overflow-auto relative">
        <div className="fixed top-5 right-6 z-50">
          <ThemeToggle />
        </div>
        {children}
      </main>
    </div>
    </AwToastProvider>
  )
}
