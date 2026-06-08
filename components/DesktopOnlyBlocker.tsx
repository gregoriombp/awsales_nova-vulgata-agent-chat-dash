"use client"

import * as React from "react"
import { Icon } from "@/components/ui/Icon"

const DESKTOP_FLOOR = 512

export function DesktopOnlyBlocker({ children }: { children: React.ReactNode }) {
  const [tooSmall, setTooSmall] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const check = () => setTooSmall(window.innerWidth < DESKTOP_FLOOR)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  if (mounted && tooSmall) {
    return (
      <div className="fixed inset-0 z-9999 flex items-center justify-center bg-(--bg-canvas) px-8 text-center">
        <div className="flex max-w-[420px] flex-col items-center gap-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-(--bg-inverse) text-(--fg-on-inverse)">
            <Icon name="desktop_windows" size={28} />
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="m-0 text-(--fg-primary)">
              Disponível em desktop ou tablet
            </h2>
            <p className="m-0 body-sm text-(--fg-secondary)">
              O AwSales foi feito pra telas maiores. Abra essa mesma URL num
              dispositivo com pelo menos {DESKTOP_FLOOR}px de largura.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
