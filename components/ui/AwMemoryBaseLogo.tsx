"use client";

import MemoryBaseIcon from "@/components/memory-base/MemoryBaseIcon";
import { cn } from "@/lib/utils";

/**
 * Logo animado da Memory Base: o cluster de pontos pulsa em onda (opacidade +
 * escala, com stagger por grupo de fase). A animação mora em globals.css na
 * classe `.memory-base-welcome-icon` — aqui só montamos o ícone com o tamanho
 * e a cor certos. Respeita `prefers-reduced-motion`.
 */
export function AwMemoryBaseLogo({
  size = 180,
  className,
}: {
  size?: number;
  className?: string;
}) {
  // O ícone tem viewBox 38×40 — mantém a proporção a partir da altura.
  const width = Math.round((size * 38) / 40);

  return (
    <div
      className={cn("memory-base-welcome-icon", className)}
      style={{ width, height: size }}
      aria-hidden
    >
      {/* cor herdada via currentColor — quem monta define text-white / text-[#0d0d0d] */}
      <MemoryBaseIcon width={width} height={size} className="h-full w-full" />
    </div>
  );
}

export default AwMemoryBaseLogo;
