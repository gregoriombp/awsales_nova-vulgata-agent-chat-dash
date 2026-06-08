import * as React from "react"

export type AwLogoProps = {
  variant?: "wordmark" | "mark"
  height?: number
  className?: string
  style?: React.CSSProperties
  "aria-label"?: string
}

/**
 * Catálogo oficial de exportações da logo Aswork.
 *
 * Use este registry como **fonte de verdade** para qualquer asset estático
 * (PNG ou SVG) servido a partir de `/public/assets/brand/`. Para uso
 * **dentro do app** prefira o componente `<AwLogo />` (SVG inline,
 * `fill="currentColor"`), que herda a cor do contexto.
 *
 * Assets estáticos são para: e-mail, deck, social, favicon, exports de
 * marketing — qualquer lugar onde `currentColor` não funciona.
 */
export const AW_LOGO_ASSETS = {
  mark: {
    brand: "/assets/brand/aswork-mark-brand.png",
    muted: "/assets/brand/aswork-mark-muted.png",
    black: "/assets/brand/aswork-mark-black.png",
    white: "/assets/brand/aswork-mark-white.png",
  },
  wordmark: {
    brand: "/assets/brand/aswork-wordmark-brand.png",
    muted: "/assets/brand/aswork-wordmark-muted.png",
    black: "/assets/brand/aswork-wordmark-black.png",
    brandOnDark: "/assets/brand/aswork-wordmark-brand-on-dark.png",
    mutedOnDark: "/assets/brand/aswork-wordmark-muted-on-dark.png",
    white: "/assets/brand/aswork-wordmark-white.png",
  },
  svg: {
    mark: "/assets/brand/aswork-mark.svg",
    markBrand: "/assets/brand/aswork-mark-brand.svg",
    markWhite: "/assets/brand/aswork-mark-white.svg",
    wordmarkBlack: "/assets/brand/aswork-wordmark-black.svg",
    wordmarkBrand: "/assets/brand/aswork-wordmark-brand.svg",
    wordmarkWhite: "/assets/brand/aswork-wordmark-white.svg",
  },
} as const

export type AwMarkTone = keyof typeof AW_LOGO_ASSETS.mark
export type AwWordmarkTone = keyof typeof AW_LOGO_ASSETS.wordmark

/** Aswork logo. Fill is currentColor so it adapts to light/dark surfaces. */
export function AwLogo({
  variant = "wordmark",
  height = 20,
  className,
  style,
  "aria-label": ariaLabel = "Aswork",
}: AwLogoProps) {
  if (variant === "mark") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 218.42 248.68"
        height={height}
        style={{ height, width: "auto", ...style }}
        className={className}
        role="img"
        aria-label={ariaLabel}
        fill="currentColor"
      >
        <path d="M91.47,0h35.13l91.82,248.68h-34.09l-26.43-75.82H58.78l-26.78,75.82H0L91.47,0ZM67.82,147.47h81.39l-28.52-83.47c-4.87-13.91-11.13-35.13-11.13-35.13h-.7s-6.61,20.87-11.48,35.13l-29.56,83.47Z" />
      </svg>
    )
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1079.01 253.9"
      height={height}
      style={{ height, width: "auto", ...style }}
      className={className}
      role="img"
      aria-label={ariaLabel}
      fill="currentColor"
    >
      <path d="M91.47,0h35.13l91.82,248.68h-34.09l-26.43-75.82H58.78l-26.78,75.82H0L91.47,0ZM67.82,147.47h81.39l-28.52-83.47c-4.87-13.91-11.13-35.13-11.13-35.13h-.7s-6.61,20.87-11.48,35.13l-29.56,83.47Z" />
      <path d="M209.38,190.25h28.87c3.83,31.3,24.69,40,51.48,40,29.56,0,41.73-12.87,41.73-29.56,0-20.17-13.91-25.39-46.95-32.35-35.48-7.3-67.13-14.61-67.13-53.91,0-29.91,22.96-49.39,64.69-49.39,44.52,0,66.43,21.22,70.6,56.34h-28.87c-2.78-23.65-15.65-34.08-42.43-34.08s-36.17,11.48-36.17,25.74c0,19.48,17.39,23.3,48.34,29.56,36.17,7.3,66.43,15.3,66.43,56.69,0,36.17-29.56,54.6-70.95,54.6-49.39,0-76.86-23.3-79.65-63.65Z" />
      <path d="M349.21,68.86h30.26s31.65,110.95,31.65,110.95c4.17,14.95,9.74,38.61,9.74,38.61h.7s5.22-23.65,9.04-37.91l30.26-111.65h29.56l29.22,111.65c3.83,14.61,8.7,37.91,8.7,37.91h.69s5.57-23.65,10.09-38.61l33.39-110.95h29.22l-58.78,179.82h-28.87l-29.91-108.86c-4.17-14.96-8.69-37.56-8.69-37.56h-.7s-4.87,22.61-9.04,37.56l-30.26,108.86h-29.22l-57.04-179.82Z" />
      <path d="M590.24,158.95c0-52.17,33.39-94.6,86.95-94.6s86.6,42.43,86.6,94.6-32.69,94.6-86.6,94.6-86.95-42.43-86.95-94.6ZM734.93,158.95c0-39.65-19.48-71.3-57.74-71.3s-58.08,31.65-58.08,71.3,19.83,70.95,58.08,70.95,57.74-31.3,57.74-70.95Z" />
      <path d="M801.71,98.78h.69c10.78-17.39,29.56-32,53.56-32,5.22,0,8,.7,11.48,2.09v27.13h-1.04c-4.17-1.39-6.96-1.74-12.52-1.74-27.83,0-52.17,20.87-52.17,54.61v99.82h-28.17V68.86h28.17v29.91Z" />
      <path d="M929,151.64l-26.43,25.04v71.99h-28.17V0h28.17v145.73l78.95-76.87h35.82l-68.86,64.69,77.21,115.12h-33.04l-63.65-97.04Z" />
      <path d="M1041.65,67.55h16.01v3.4h-5.98v16.51h-4.04v-16.51h-5.98v-3.4Z" />
      <path d="M1059.41,67.55h5.68l2.81,9.99c.69,2.5,1.25,5.37,1.25,5.37h.06s.53-2.87,1.22-5.37l2.81-9.99h5.76v19.9h-3.76v-11.41c0-1.61.17-4.12.17-4.12h-.06s-.44,2.34-.86,3.79l-3.42,11.75h-3.87l-3.34-11.75c-.42-1.45-.86-3.79-.86-3.79h-.05s.17,2.5.17,4.12v11.41h-3.7v-19.9Z" />
    </svg>
  )
}
