import * as React from "react"
import { cn } from "@/lib/utils"

const MATRIX = 21
const SEED = 7
// QR é preto/branco por natureza — não são tokens de marca, são as cores do código.
const DARK = "#0D0D0D"
const LIGHT = "#FFFFFF"

export type AwQrPlaceholderProps = {
  /** Lado do quadrado, em px. Default 148. */
  px?: number
  /** Rótulo acessível. Default "QR code". */
  ariaLabel?: string
  className?: string
}

/**
 * AwQrPlaceholder — QR fake determinístico (só visual, não decodifica nada).
 * Placeholder para telas de 2FA (app autenticador) e Pix enquanto o QR real
 * não vem do back. O padrão é estável entre renders (seed fixa) pra não "piscar".
 */
export function AwQrPlaceholder({
  px = 148,
  ariaLabel = "QR code",
  className,
}: AwQrPlaceholderProps) {
  const cells = React.useMemo(() => {
    const arr: boolean[] = []
    let s = SEED
    for (let i = 0; i < MATRIX * MATRIX; i++) {
      s = (s * 9301 + 49297) % 233280
      arr.push(s / 233280 > 0.5)
    }
    return arr
  }, [])

  const isFinder = (x: number, y: number) =>
    (x < 7 && y < 7) ||
    (x >= MATRIX - 7 && y < 7) ||
    (x < 7 && y >= MATRIX - 7)

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn(
        "grid flex-shrink-0 rounded-md border border-border-subtle bg-white p-2.5",
        className
      )}
      style={{
        width: px,
        height: px,
        gridTemplateColumns: `repeat(${MATRIX}, 1fr)`,
      }}
    >
      {cells.map((on, i) => {
        const x = i % MATRIX
        const y = Math.floor(i / MATRIX)
        let fill: string
        if (isFinder(x, y)) {
          const fx = x < 7 ? x : x - (MATRIX - 7)
          const fy = y < 7 ? y : y - (MATRIX - 7)
          const onOuter = fx === 0 || fx === 6 || fy === 0 || fy === 6
          const onInner = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4
          fill = onOuter || onInner ? DARK : LIGHT
        } else {
          fill = on ? DARK : LIGHT
        }
        return <div key={i} style={{ background: fill, aspectRatio: "1 / 1" }} />
      })}
    </div>
  )
}
