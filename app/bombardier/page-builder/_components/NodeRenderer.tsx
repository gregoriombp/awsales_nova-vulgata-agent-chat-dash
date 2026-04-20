"use client"

import * as React from "react"
import { useDraggable, useDroppable } from "@dnd-kit/core"
import { AwAlert, type AwAlertVariant } from "@/components/ui/AwAlert"
import { AwButton, type AwButtonProps } from "@/components/ui/AwButton"
import { AwCard } from "@/components/ui/AwCard"
import { AwChatBubble } from "@/components/ui/AwChatBubble"
import { AwInput } from "@/components/ui/AwInput"
import { AwLogo } from "@/components/ui/AwLogo"
import { AwPill, type AwPillProps } from "@/components/ui/AwPill"
import { AwProgress, type AwProgressVariant } from "@/components/ui/AwProgress"
import { AwSkeleton, type AwSkeletonShape } from "@/components/ui/AwSkeleton"
import { AwToggle } from "@/components/ui/AwToggle"
import { Icon } from "@/components/ui/Icon"
import { useBuilder } from "@/lib/bombardier/store"
import type { BuilderNode } from "@/lib/bombardier/types"

const spaceMap: Record<string, string> = {
  none: "0px",
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
}

const radiusMap: Record<string, string> = {
  none: "0px",
  xs: "var(--radius-xs)",
  sm: "var(--radius-sm)",
  md: "var(--radius-md)",
  lg: "var(--radius-lg)",
  xl: "var(--radius-xl)",
  "2xl": "var(--radius-2xl)",
  full: "9999px",
}

const shadowMap: Record<string, string> = {
  none: "none",
  xs: "0 1px 2px rgba(0,0,0,0.06)",
  sm: "0 2px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  md: "0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
  lg: "0 12px 32px rgba(0,0,0,0.10), 0 4px 8px rgba(0,0,0,0.04)",
  overlay: "0 24px 64px rgba(0,0,0,0.18)",
}

const alignMap: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
}

const justifyMap: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
}

const textSizeMap: Record<string, string> = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
}

const textWeightMap: Record<string, string> = {
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
}

const textToneMap: Record<string, string> = {
  primary: "text-[var(--fg-primary)]",
  secondary: "text-[var(--fg-secondary)]",
  tertiary: "text-[var(--fg-tertiary)]",
}

const textAlignMap: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
  justify: "text-justify",
}

const widthMap: Record<string, string> = {
  auto: "auto",
  "100%": "100%",
  "75%": "75%",
  "50%": "50%",
  "33%": "33.3333%",
  "25%": "25%",
}

export type RenderCtx = {
  selectedId: string | null
  onSelectNode: (id: string) => void
}

function NodeWrapper({
  node,
  ctx,
  children,
}: {
  node: BuilderNode
  ctx: RenderCtx
  children: React.ReactNode
}) {
  const selected = ctx.selectedId === node.id
  const editingNodeId = useBuilder((s) => s.editingNodeId)
  const isEditing = editingNodeId === node.id
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `node-${node.id}`,
    data: { source: "node", nodeId: node.id },
    disabled: isEditing,
  })
  return (
    <div
      ref={setNodeRef}
      data-node-id={node.id}
      {...(isEditing ? {} : listeners)}
      {...(isEditing ? {} : attributes)}
      onClick={
        isEditing
          ? undefined
          : (e) => {
              e.stopPropagation()
              ctx.onSelectNode(node.id)
            }
      }
      className={[
        "relative rounded-[var(--radius-sm)] transition-[outline]",
        selected
          ? "outline outline-2 outline-offset-2 outline-[var(--accent-brand)]"
          : "hover:outline hover:outline-1 hover:outline-offset-2 hover:outline-[var(--border-default)]",
        isDragging ? "opacity-30" : "",
        "cursor-default focus:outline-none",
      ].join(" ")}
    >
      {children}
    </div>
  )
}

function EditableText({
  nodeId,
  value,
  onCommit,
  tag: Tag,
  className,
  style,
  multiline = false,
}: {
  nodeId: string
  value: string
  onCommit: (next: string) => void
  tag: "h1" | "h2" | "h3" | "h4" | "p"
  className?: string
  style?: React.CSSProperties
  multiline?: boolean
}) {
  const editingNodeId = useBuilder((s) => s.editingNodeId)
  const setEditingNode = useBuilder((s) => s.setEditingNode)
  const isEditing = editingNodeId === nodeId
  const ref = React.useRef<HTMLElement | null>(null)
  const initialRef = React.useRef<string>(value)

  React.useEffect(() => {
    if (isEditing && ref.current) {
      initialRef.current = value
      ref.current.focus()
      const sel = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(ref.current)
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing])

  const commonProps = {
    className: [
      className,
      "m-0",
      isEditing
        ? "outline outline-2 outline-[var(--accent-brand)] outline-offset-2 rounded-[var(--radius-xs)] cursor-text"
        : "cursor-text",
    ]
      .filter(Boolean)
      .join(" "),
    style,
    onDoubleClick: (e: React.MouseEvent) => {
      e.stopPropagation()
      setEditingNode(nodeId)
    },
    onPointerDown: isEditing
      ? (e: React.PointerEvent) => e.stopPropagation()
      : undefined,
  }

  if (isEditing) {
    return React.createElement(Tag, {
      ...commonProps,
      ref: ref as React.RefObject<never>,
      contentEditable: true,
      suppressContentEditableWarning: true,
      spellCheck: false,
      onBlur: (e: React.FocusEvent<HTMLElement>) => {
        const next = (e.currentTarget.innerText ?? "").replace(/\r/g, "")
        setEditingNode(null)
        if (next !== initialRef.current) onCommit(next)
      },
      onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === "Escape") {
          e.preventDefault()
          if (ref.current) ref.current.innerText = initialRef.current
          setEditingNode(null)
          ;(e.currentTarget as HTMLElement).blur()
        }
        if (e.key === "Enter" && !e.shiftKey && !multiline) {
          e.preventDefault()
          ;(e.currentTarget as HTMLElement).blur()
        }
      },
      children: value,
    })
  }

  return React.createElement(Tag, {
    ...commonProps,
    children: value,
  })
}

export function FrameRootDropZone({
  frameId,
  children,
  empty,
}: {
  frameId: string
  children?: React.ReactNode
  empty: boolean
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `drop-frame-${frameId}`,
    data: { target: "frame-root", frameId },
  })
  return (
    <div
      ref={setNodeRef}
      className={[
        "w-full h-full flex flex-col gap-4 p-8 overflow-auto transition-colors",
        isOver ? "bg-[var(--aw-blue-100)]" : "",
      ].join(" ")}
    >
      {empty ? (
        <div className="flex-1 flex items-center justify-center text-sm text-[var(--fg-tertiary)] pointer-events-none select-none">
          <div className="flex flex-col items-center gap-2">
            <span className="inline-flex items-center justify-center h-10 w-10 rounded-full border border-dashed border-[var(--border-default)]">
              +
            </span>
            <span>{isOver ? "Solte aqui" : "Arraste componentes da paleta"}</span>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  )
}

function FlexDropZone({
  parentId,
  empty,
  children,
  direction,
  gap,
  padding,
  align,
  justify,
  wrap,
  minHeight = 60,
}: {
  parentId: string
  empty: boolean
  children?: React.ReactNode
  direction: "column" | "row"
  gap: string
  padding: string
  align?: string
  justify?: string
  wrap?: boolean
  minHeight?: number
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `drop-${parentId}`,
    data: { target: "node", nodeId: parentId },
  })
  return (
    <div
      ref={setNodeRef}
      style={{
        display: "flex",
        flexDirection: direction,
        gap,
        padding,
        alignItems: align ? alignMap[align] : undefined,
        justifyContent: justify ? justifyMap[justify] : undefined,
        flexWrap: wrap ? "wrap" : "nowrap",
        minHeight: empty ? minHeight : undefined,
      }}
      className={[
        "rounded-[var(--radius-sm)] transition-colors",
        empty
          ? "items-center justify-center border-2 border-dashed border-[var(--border-subtle)]"
          : "",
        isOver ? "bg-[var(--aw-blue-100)] border-[var(--accent-brand)]" : "",
      ].join(" ")}
    >
      {empty ? (
        <span className="text-xs text-[var(--fg-tertiary)] pointer-events-none select-none">
          {isOver ? "Solte aqui" : "Arraste aqui"}
        </span>
      ) : (
        children
      )}
    </div>
  )
}

function GridDropZone({
  parentId,
  empty,
  children,
  columns,
  gap,
  rowGap,
  padding,
  minHeight = 80,
}: {
  parentId: string
  empty: boolean
  children?: React.ReactNode
  columns: number
  gap: string
  rowGap?: string
  padding: string
  minHeight?: number
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `drop-${parentId}`,
    data: { target: "node", nodeId: parentId },
  })
  return (
    <div
      ref={setNodeRef}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap,
        rowGap: rowGap || undefined,
        padding,
        minHeight: empty ? minHeight : undefined,
      }}
      className={[
        "rounded-[var(--radius-sm)] transition-colors",
        empty
          ? "border-2 border-dashed border-[var(--border-subtle)] items-center justify-center"
          : "",
        isOver ? "bg-[var(--aw-blue-100)] border-[var(--accent-brand)]" : "",
      ].join(" ")}
    >
      {empty ? (
        <div className="col-span-full flex items-center justify-center text-xs text-[var(--fg-tertiary)] pointer-events-none select-none">
          {isOver ? "Solte aqui" : `Grid ${columns} cols — arraste aqui`}
        </div>
      ) : (
        children
      )}
    </div>
  )
}

function Leaf({ node }: { node: BuilderNode }) {
  const updateProps = useBuilder((s) => s.updateProps)

  switch (node.type) {
    case "heading": {
      const level = Number(node.props.level ?? 1)
      const sizeCls =
        level === 1
          ? "text-4xl"
          : level === 2
          ? "text-3xl"
          : level === 3
          ? "text-2xl"
          : "text-xl"
      const align = textAlignMap[(node.props.align as string) ?? "left"] ?? ""
      const color = (node.props.color as string) || undefined
      const extra = (node.props.className as string) || ""
      const content = String(node.props.content ?? "")
      const className = `${sizeCls} ${align} font-semibold tracking-tight font-heading ${extra}`.trim()
      const style = color ? { color } : undefined
      const tag: "h1" | "h2" | "h3" | "h4" =
        level === 1
          ? "h1"
          : level === 2
          ? "h2"
          : level === 3
          ? "h3"
          : "h4"
      return (
        <EditableText
          nodeId={node.id}
          value={content}
          tag={tag}
          className={className}
          style={style}
          onCommit={(next) => updateProps(node.id, { content: next })}
        />
      )
    }
    case "text": {
      const size = (node.props.size as string) || "md"
      const tone = (node.props.tone as string) || "primary"
      const weight = (node.props.weight as string) || "normal"
      const align = (node.props.align as string) || "left"
      const extra = (node.props.className as string) || ""
      const cls = [
        textSizeMap[size] ?? textSizeMap.md,
        textToneMap[tone] ?? textToneMap.primary,
        textWeightMap[weight] ?? textWeightMap.normal,
        textAlignMap[align] ?? textAlignMap.left,
        "leading-relaxed",
        extra,
      ]
        .filter(Boolean)
        .join(" ")
      return (
        <EditableText
          nodeId={node.id}
          value={String(node.props.content ?? "")}
          tag="p"
          className={cls}
          style={{ whiteSpace: "pre-wrap" }}
          multiline
          onCommit={(next) => updateProps(node.id, { content: next })}
        />
      )
    }
    case "link": {
      const href = (node.props.href as string) || "#"
      const target = (node.props.target as string) || "_self"
      const underline = node.props.underline !== false
      const extra = (node.props.className as string) || ""
      return (
        <a
          href={href}
          target={target}
          onClick={(e) => e.preventDefault()}
          className={[
            "text-[var(--accent-brand)]",
            underline ? "underline underline-offset-2" : "no-underline",
            extra,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {String(node.props.text ?? "")}
        </a>
      )
    }
    case "image": {
      const src = (node.props.src as string) || ""
      const alt = (node.props.alt as string) || ""
      const width = Number(node.props.width ?? 320)
      const height = Number(node.props.height ?? 200)
      const fit = (node.props.fit as React.CSSProperties["objectFit"]) || "cover"
      const rounded =
        radiusMap[(node.props.rounded as string) ?? "md"] ?? radiusMap.md
      const extra = (node.props.className as string) || ""
      if (!src) {
        return (
          <div
            style={{ width, height, borderRadius: rounded }}
            className={[
              "flex items-center justify-center bg-[var(--bg-canvas)] border-2 border-dashed border-[var(--border-subtle)] text-[var(--fg-tertiary)]",
              extra,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="flex flex-col items-center gap-1 text-xs">
              <Icon name="image" size={20} />
              <span>Sem URL</span>
            </div>
          </div>
        )
      }
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          style={{ width, height, objectFit: fit, borderRadius: rounded }}
          className={extra}
        />
      )
    }
    case "icon": {
      const name = (node.props.name as string) || "star"
      const size = Number(node.props.size ?? 24)
      const color = (node.props.color as string) || undefined
      const fill: 0 | 1 = node.props.fill ? 1 : 0
      return (
        <span style={{ color, display: "inline-flex" }}>
          <Icon name={name} size={size} fill={fill} />
        </span>
      )
    }
    case "divider": {
      const tone = (node.props.tone as string) || "default"
      const thickness = Number(node.props.thickness ?? 1)
      const color = (node.props.color as string) || ""
      const bg =
        color ||
        (tone === "subtle"
          ? "var(--border-subtle)"
          : tone === "strong"
          ? "var(--border-strong)"
          : "var(--border-default)")
      return (
        <hr
          style={{
            border: 0,
            borderTop: `${thickness}px solid ${bg}`,
            margin: 0,
            width: "100%",
          }}
        />
      )
    }
    case "spacer": {
      const size = Number(node.props.size ?? 24)
      const direction = (node.props.direction as string) || "vertical"
      if (direction === "horizontal") {
        return (
          <span
            style={{
              display: "inline-block",
              width: size,
              height: 1,
            }}
          />
        )
      }
      return <div style={{ height: size, width: "100%" }} />
    }
    case "AwButton":
      return (
        <AwButton
          variant={node.props.variant as AwButtonProps["variant"]}
          size={node.props.size as AwButtonProps["size"]}
          tabIndex={-1}
        >
          {String(node.props.children ?? "")}
        </AwButton>
      )
    case "AwPill":
      return (
        <AwPill variant={node.props.variant as AwPillProps["variant"]}>
          {String(node.props.children ?? "")}
        </AwPill>
      )
    case "AwInput":
      return (
        <AwInput
          type={(node.props.type as string) || "text"}
          placeholder={(node.props.placeholder as string) || ""}
          iconLeft={(node.props.iconLeft as string) || undefined}
          readOnly
          tabIndex={-1}
        />
      )
    case "AwAlert":
      return (
        <AwAlert
          variant={node.props.variant as AwAlertVariant}
          title={(node.props.title as string) || undefined}
          icon={(node.props.icon as string) || undefined}
        >
          {String(node.props.content ?? "")}
        </AwAlert>
      )
    case "AwProgress": {
      const value = Number(node.props.value ?? 0)
      const max = Number(node.props.max ?? 100)
      return (
        <AwProgress
          value={value}
          max={max}
          label={(node.props.label as string) || undefined}
          variant={node.props.variant as AwProgressVariant}
        />
      )
    }
    case "AwSkeleton":
      return (
        <AwSkeleton
          shape={node.props.shape as AwSkeletonShape}
          width={Number(node.props.width ?? 240)}
          height={Number(node.props.height ?? 20)}
        />
      )
    case "AwChatBubble":
      return (
        <AwChatBubble
          variant={node.props.variant as "user" | "agent"}
          timestamp={(node.props.timestamp as string) || undefined}
        >
          {String(node.props.children ?? "")}
        </AwChatBubble>
      )
    case "AwLogo":
      return (
        <AwLogo
          variant={(node.props.variant as "wordmark" | "mark") ?? "wordmark"}
          height={Number(node.props.height ?? 24)}
        />
      )
    case "AwToggle":
      return (
        <AwToggle
          checked={Boolean(node.props.checked)}
          label={(node.props.label as string) || undefined}
          onChange={() => {}}
        />
      )
    default:
      return (
        <div className="text-xs text-[var(--aw-red-600)]">
          Desconhecido: {node.type}
        </div>
      )
  }
}

function renderStack(node: BuilderNode, ctx: RenderCtx): React.ReactNode {
  const empty = !node.children || node.children.length === 0
  const gap = spaceMap[(node.props.gap as string) ?? "md"] ?? spaceMap.md
  const pad = spaceMap[(node.props.padding as string) ?? "md"] ?? spaceMap.md
  const align = (node.props.align as string) ?? "stretch"
  const justify = (node.props.justify as string) ?? "start"
  const extra = (node.props.className as string) || ""
  return (
    <NodeWrapper key={node.id} node={node} ctx={ctx}>
      <div className={extra}>
        <FlexDropZone
          parentId={node.id}
          empty={empty}
          direction="column"
          gap={gap}
          padding={pad}
          align={align}
          justify={justify}
        >
          {node.children?.map((c) => renderNode(c, ctx))}
        </FlexDropZone>
      </div>
    </NodeWrapper>
  )
}

function renderRow(node: BuilderNode, ctx: RenderCtx): React.ReactNode {
  const empty = !node.children || node.children.length === 0
  const gap = spaceMap[(node.props.gap as string) ?? "md"] ?? spaceMap.md
  const pad = spaceMap[(node.props.padding as string) ?? "md"] ?? spaceMap.md
  const align = (node.props.align as string) ?? "center"
  const justify = (node.props.justify as string) ?? "start"
  const wrap = Boolean(node.props.wrap)
  const extra = (node.props.className as string) || ""
  return (
    <NodeWrapper key={node.id} node={node} ctx={ctx}>
      <div className={extra}>
        <FlexDropZone
          parentId={node.id}
          empty={empty}
          direction="row"
          gap={gap}
          padding={pad}
          align={align}
          justify={justify}
          wrap={wrap}
        >
          {node.children?.map((c) => renderNode(c, ctx))}
        </FlexDropZone>
      </div>
    </NodeWrapper>
  )
}

function renderGrid(node: BuilderNode, ctx: RenderCtx): React.ReactNode {
  const empty = !node.children || node.children.length === 0
  const columns = Math.max(1, Math.min(12, Number(node.props.columns ?? 3)))
  const gap = spaceMap[(node.props.gap as string) ?? "md"] ?? spaceMap.md
  const rowGap = node.props.rowGap
    ? spaceMap[node.props.rowGap as string]
    : undefined
  const pad = spaceMap[(node.props.padding as string) ?? "md"] ?? spaceMap.md
  const extra = (node.props.className as string) || ""
  return (
    <NodeWrapper key={node.id} node={node} ctx={ctx}>
      <div className={extra}>
        <GridDropZone
          parentId={node.id}
          empty={empty}
          columns={columns}
          gap={gap}
          rowGap={rowGap}
          padding={pad}
        >
          {node.children?.map((c) => renderNode(c, ctx))}
        </GridDropZone>
      </div>
    </NodeWrapper>
  )
}

function renderBox(node: BuilderNode, ctx: RenderCtx): React.ReactNode {
  const empty = !node.children || node.children.length === 0
  const p = node.props
  const padding = spaceMap[(p.padding as string) ?? "md"] ?? spaceMap.md
  const radius = radiusMap[(p.borderRadius as string) ?? "md"] ?? radiusMap.md
  const shadow = shadowMap[(p.shadow as string) ?? "none"] ?? shadowMap.none
  const width = widthMap[(p.width as string) ?? "auto"] ?? "auto"
  const minHeight = Number(p.minHeight ?? 0) || undefined
  const extra = (p.className as string) || ""
  const style: React.CSSProperties = {
    backgroundColor: (p.background as string) || undefined,
    color: (p.foreground as string) || undefined,
    padding,
    borderRadius: radius,
    border: p.border
      ? `1px solid ${(p.borderColor as string) || "var(--border-default)"}`
      : undefined,
    boxShadow: shadow !== "none" ? shadow : undefined,
    width,
    minHeight,
    textAlign: (p.textAlign as React.CSSProperties["textAlign"]) || undefined,
  }
  return (
    <NodeWrapper key={node.id} node={node} ctx={ctx}>
      <div style={style} className={extra}>
        <FlexDropZone
          parentId={node.id}
          empty={empty}
          direction="column"
          gap="8px"
          padding="0px"
          minHeight={40}
        >
          {node.children?.map((c) => renderNode(c, ctx))}
        </FlexDropZone>
      </div>
    </NodeWrapper>
  )
}

export function renderNode(node: BuilderNode, ctx: RenderCtx): React.ReactNode {
  if (node.type === "stack") return renderStack(node, ctx)
  if (node.type === "row") return renderRow(node, ctx)
  if (node.type === "grid") return renderGrid(node, ctx)
  if (node.type === "box") return renderBox(node, ctx)

  if (node.type === "AwCard") {
    const empty = !node.children || node.children.length === 0
    return (
      <NodeWrapper key={node.id} node={node} ctx={ctx}>
        <AwCard
          variant={node.props.variant as "default" | "ai"}
          interactive={Boolean(node.props.interactive)}
        >
          <FlexDropZone
            parentId={node.id}
            empty={empty}
            direction="column"
            gap="12px"
            padding="20px"
            minHeight={80}
          >
            {node.children?.map((c) => renderNode(c, ctx))}
          </FlexDropZone>
        </AwCard>
      </NodeWrapper>
    )
  }

  return (
    <NodeWrapper key={node.id} node={node} ctx={ctx}>
      <Leaf node={node} />
    </NodeWrapper>
  )
}
