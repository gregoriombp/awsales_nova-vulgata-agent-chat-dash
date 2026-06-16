"use client"

import { useEffect, useState } from "react"
import { AwCopilotOrb } from "@/components/ui/AwCopilotDrawer"

/**
 * Ilha client pro brand page (server component): renderiza o COMPONENTE real
 * do Cortex (o mesmo orb do topbar, AwCopilotOrb) no lugar da ilustração
 * estática da constelação. Guard de `mounted` porque o orb usa WebGL
 * (react-three-fiber) e não pode montar no SSR.
 */
export function CortexMark({ size = 300 }: { size?: number }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) {
    return <div style={{ width: size, height: size }} aria-hidden />
  }
  return <AwCopilotOrb size={size} state="idle" />
}
