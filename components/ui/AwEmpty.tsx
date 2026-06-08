import * as React from "react"

/**
 * AwEmpty — empty / zero-state container. Composed primitives so each slot
 * can be styled independently. Port of shadcn/ui's `Empty` adapted to the
 * Aswork token system (no shadcn dependency).
 *
 * <AwEmpty>
 *   <AwEmptyHeader>
 *     <AwEmptyMedia variant="icon"><Icon name="search_off" /></AwEmptyMedia>
 *     <AwEmptyTitle>Nenhuma integração encontrada</AwEmptyTitle>
 *     <AwEmptyDescription>Tente outro termo.</AwEmptyDescription>
 *   </AwEmptyHeader>
 *   <AwEmptyContent>...buttons...</AwEmptyContent>
 * </AwEmpty>
 */

type DivProps = React.HTMLAttributes<HTMLDivElement>

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ")
}

export function AwEmpty({ className, ...rest }: DivProps) {
  return (
    <div
      data-slot="aw-empty"
      className={cx("aw-empty", className)}
      {...rest}
    />
  )
}

export function AwEmptyHeader({ className, ...rest }: DivProps) {
  return (
    <div
      data-slot="aw-empty-header"
      className={cx("aw-empty__header", className)}
      {...rest}
    />
  )
}

export type AwEmptyMediaVariant = "default" | "icon"

export function AwEmptyMedia({
  variant = "default",
  className,
  ...rest
}: DivProps & { variant?: AwEmptyMediaVariant }) {
  return (
    <div
      data-slot="aw-empty-media"
      data-variant={variant}
      className={cx(
        "aw-empty__media",
        variant === "icon" && "aw-empty__media--icon",
        className
      )}
      {...rest}
    />
  )
}

export function AwEmptyTitle({
  className,
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      data-slot="aw-empty-title"
      className={cx("aw-empty__title", className)}
      {...rest}
    />
  )
}

export function AwEmptyDescription({
  className,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="aw-empty-description"
      className={cx("aw-empty__description", className)}
      {...rest}
    />
  )
}

export function AwEmptyContent({ className, ...rest }: DivProps) {
  return (
    <div
      data-slot="aw-empty-content"
      className={cx("aw-empty__content", className)}
      {...rest}
    />
  )
}
