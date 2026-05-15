import * as React from "react"

export type AwLogoProps = {
  variant?: "wordmark" | "mark"
  height?: number
  className?: string
  style?: React.CSSProperties
  "aria-label"?: string
}

/**
 * Catálogo oficial de exportações da logo AwSales.
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
    brand: "/assets/brand/awsales-mark-brand.png",
    muted: "/assets/brand/awsales-mark-muted.png",
    black: "/assets/brand/awsales-mark-black.png",
    white: "/assets/brand/awsales-mark-white.png",
  },
  wordmark: {
    brand: "/assets/brand/awsales-wordmark-brand.png",
    muted: "/assets/brand/awsales-wordmark-muted.png",
    black: "/assets/brand/awsales-wordmark-black.png",
    brandOnDark: "/assets/brand/awsales-wordmark-brand-on-dark.png",
    mutedOnDark: "/assets/brand/awsales-wordmark-muted-on-dark.png",
    white: "/assets/brand/awsales-wordmark-white.png",
  },
  svg: {
    mark: "/assets/brand/awsales-mark.svg",
    markBrand: "/assets/brand/awsales-mark-brand.svg",
    markWhite: "/assets/brand/awsales-mark-white.svg",
    wordmarkBlack: "/assets/brand/awsales-wordmark-black.svg",
    wordmarkBrand: "/assets/brand/awsales-wordmark-brand.svg",
    wordmarkWhite: "/assets/brand/awsales-wordmark-white.svg",
  },
} as const

export type AwMarkTone = keyof typeof AW_LOGO_ASSETS.mark
export type AwWordmarkTone = keyof typeof AW_LOGO_ASSETS.wordmark

/** AwSales logo. Fill is currentColor so it adapts to light/dark surfaces. */
export function AwLogo({
  variant = "wordmark",
  height = 20,
  className,
  style,
  "aria-label": ariaLabel = "AwSales",
}: AwLogoProps) {
  if (variant === "mark") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 269.26 143.78"
        height={height}
        style={{ height, width: "auto", ...style }}
        className={className}
        role="img"
        aria-label={ariaLabel}
        fill="currentColor"
      >
        <path d="M29.1,143.66H0L57.51,0h20.03l57.51,143.66h-29.1l-12.53-30.72h-52.7l-11.63,30.72ZM68.33,41.38l-19,47.25h37.1l-18.1-47.25Z" />
        <path d="M151.69,143.78l-31.88-102.36h28.81l17.03,60.58,18.24-60.58h22.21l18.24,60.58,17.03-60.58h27.9l-30.98,102.36h-23.77l-19.53-60.04-19.53,60.04h-23.77Z" />
      </svg>
    )
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 660 143.78"
      height={height}
      style={{ height, width: "auto", ...style }}
      className={className}
      role="img"
      aria-label={ariaLabel}
      fill="currentColor"
    >
      <path d="M29.1,143.66H0L57.51,0h20.03l57.51,143.66h-29.1l-12.53-30.72h-52.7l-11.63,30.72ZM68.33,41.38l-19,47.25h37.1l-18.1-47.25Z" />
      <path d="M151.69,143.78l-31.88-102.36h28.81l17.03,60.58,18.24-60.58h22.21l18.24,60.58,17.03-60.58h27.9l-30.98,102.36h-23.77l-19.53-60.04-19.53,60.04h-23.77Z" />
      <path d="M306.7,143.69c-16.66,0-31.49-7.85-38.45-20.99l16.11-11.87c5.13,8.03,12.45,13.69,22.34,13.69,8.79,0,14.1-3.29,14.1-8.03,0-5.84-4.94-8.21-20.14-13.33-19.04-6.21-29.3-14.06-29.3-29.21,0-16.06,15.75-27.75,35.89-27.75,15.38,0,28.01,7.3,34.06,18.44l-15.93,11.5c-3.85-6.39-9.7-10.95-18.49-10.95-7.51,0-13.18,3.47-13.18,8.58,0,4.75,5.13,7.48,19.41,12.6,17.76,6.57,30.03,12.6,30.03,29.57,0,15.7-14.83,27.75-36.44,27.75Z" />
      <path d="M408.87,84.44v-2.09c0-10.41-7.51-15.52-18.68-15.52-10.07,0-18.86,4.75-24.72,11.5l-12.45-15.15c8.79-10.41,22.15-16.98,38.82-16.98,24.9,0,40.1,13.87,40.1,36.33v58.96h-21.97v-12.6c-5.31,9.31-15.2,14.79-27.65,14.79-17.76,0-35.73-11.5-35.73-27.38,0-14.06,6.14-31.53,35.36-31.53l26.92-.34ZM387.08,125.43c12.82,0,22.16-7.07,22.16-18.93v-4.02l-21.79.24c-17.97,0-17.97,6.1-17.97,12.13s10.1,10.59,17.6,10.59Z" />
      <path d="M448.18,116.31V6.93h23.8v105.17c0,5.84,1.1,10.59,8.24,10.59,1.65,0,3.85-.18,6.23-1.1v20.08c-3.11,1.28-6.77,2.01-11.17,2.01-15.38,0-27.1-7.85-27.1-27.38Z" />
      <path d="M535.9,46.21c26.55,0,43.94,18.44,43.94,43.08,0,4.02-.73,8.21-1.46,11.5h-65.55c1.46,14.6,13.73,22.27,27.46,22.27,10.62,0,19.04-4.56,24.54-10.41l13.18,15.7c-11.35,10.77-23.62,15.33-38.82,15.33-30.76,0-51.08-21.18-51.08-48.56s19.96-48.92,47.79-48.92ZM535.72,66.1c-11.72,0-21.06,6.94-22.89,18.62h43.76v-.18c-.92-11.32-9.7-18.44-20.87-18.44Z" />
      <path d="M623.56,143.69c-16.66,0-31.49-7.85-38.45-20.99l16.11-11.87c5.13,8.03,12.45,13.69,22.34,13.69,8.79,0,14.1-3.29,14.1-8.03,0-5.84-4.94-8.21-20.14-13.33-19.04-6.21-29.3-14.06-29.3-29.21,0-16.06,15.75-27.75,35.89-27.75,15.38,0,28.01,7.3,34.06,18.44l-15.93,11.5c-3.85-6.39-9.7-10.95-18.49-10.95-7.51,0-13.18,3.47-13.18,8.58,0,4.75,5.13,7.48,19.41,12.6,17.76,6.57,30.03,12.6,30.03,29.57,0,15.7-14.83,27.75-36.44,27.75Z" />
    </svg>
  )
}
