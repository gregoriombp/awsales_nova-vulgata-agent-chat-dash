import { create } from "zustand"
import { useHelpDrawer } from "@/lib/help/store"

/**
 * Open state for the Copilot (Cortex) drawer.
 *
 * The drawer itself lives in DashboardLayout, but the toggle needs to be
 * reachable from anywhere — the topbar orb and feature pages alike — so the
 * state is lifted into this tiny store instead of DashboardLayout's useState.
 */
type CopilotDrawerState = {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

/**
 * Cortex e Ajuda rápida dividem a mesma calha à direita e ambos empurram o
 * conteúdo — nunca os dois ao mesmo tempo. Abrir o Cortex fecha a Ajuda (o
 * simétrico vive em useHelpDrawer.openHelp). Import lazy via getState() dentro
 * da ação evita o ciclo de import em tempo de módulo.
 */
export const useCopilotDrawer = create<CopilotDrawerState>((set) => ({
  open: false,
  setOpen: (open) => {
    if (open) useHelpDrawer.getState().close()
    set({ open })
  },
  toggle: () =>
    set((s) => {
      const next = !s.open
      if (next) useHelpDrawer.getState().close()
      return { open: next }
    }),
}))
