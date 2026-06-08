"use client"

import * as React from "react"
import { AwDashboardLayout } from "@/components/ui/AwDashboardLayout"
import type { BreadcrumbsItems } from "@/components/ui/AwBreadcrumbsBar"

/**
 * Casca das telas reconstruídas do workbench: renderiza o conteúdo dentro do
 * shell do produto (AwDashboardLayout) — no container central, com sidebar +
 * header em volta, como qualquer página de produto. `center` centraliza o
 * conteúdo verticalmente (telas de wizard/escolha); sem ele, o conteúdo flui do
 * topo (telas de gestão).
 */
export function BuiltShell({
  breadcrumbs,
  center,
  children,
}: {
  breadcrumbs: BreadcrumbsItems
  center?: boolean
  children: React.ReactNode
}) {
  return (
    <AwDashboardLayout breadcrumbs={breadcrumbs}>
      {center ? (
        <div className="flex min-h-full items-center justify-center">{children}</div>
      ) : (
        children
      )}
    </AwDashboardLayout>
  )
}
