"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { navigation } from "./navigation"
import ThemeToggle from "./ThemeToggle"
import { AwLogo } from "@/components/ui/AwLogo"
import { AwToastProvider } from "@/components/ui/AwToast"

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
    <div className="flex min-h-screen bg-[var(--bg-canvas)] text-[var(--fg-primary)]">
      <aside className="w-64 border-r border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 flex flex-col gap-8 fixed top-0 left-0 h-screen overflow-y-auto">
        <Link
          href="/styleguide"
          aria-label="AwSales Design System — voltar ao índice"
          className="inline-flex"
          style={{ color: "var(--fg-primary)" }}
        >
          <AwLogo variant="wordmark" height={22} />
        </Link>

        <nav className="flex flex-col gap-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <h3 className="aw-eyebrow mb-3">{section.title}</h3>
              <ul className="flex flex-col gap-1">
                {section.items.length === 0 && (
                  <li className="text-xs text-[var(--fg-tertiary)] italic px-3 py-2">
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
                            ? "bg-[var(--bg-inverse)] text-[var(--fg-on-inverse)]"
                            : "text-[var(--fg-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--fg-primary)]"
                        )}
                      >
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-auto text-xs text-[var(--fg-tertiary)] leading-relaxed">
          AwSales Design System
          <br />
          Mona Sans · JetBrains Mono
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
