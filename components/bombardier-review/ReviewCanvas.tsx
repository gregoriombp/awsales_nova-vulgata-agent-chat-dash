"use client"

import * as React from "react"
import { useReviewStore } from "@/lib/bombardier-review/store"
import { useCommentsForUrl, useCurrentUrl } from "@/lib/bombardier-review/hooks"
import {
  cumulativeScrollFromElement,
  elementBelowOverlayAt,
  useCumulativeScrollOffset,
  useLayoutVersion,
} from "@/lib/bombardier-review/scrollOffset"
import {
  captureElementAnchor,
  resolveElementPoint,
} from "@/lib/bombardier-review/elementAnchor"
import { OVERLAY_DATA_ATTR, REVIEW_Z } from "./constants"
import { ReviewPinMarker } from "./ReviewPinMarker"
import type { ReviewDrawPath, ReviewPoint } from "./types"

function pointFromEvent(e: PointerEvent | React.PointerEvent): ReviewPoint {
  const below = elementBelowOverlayAt(e.clientX, e.clientY)
  const scroll = cumulativeScrollFromElement(below)
  return {
    x: e.clientX + scroll.x,
    y: e.clientY + scroll.y,
  }
}

function pointsToPolyline(points: ReviewPoint[]): string {
  return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
}

function PathPolyline({
  path,
  opacity = 1,
}: {
  path: ReviewDrawPath
  opacity?: number
}) {
  return (
    <polyline
      points={pointsToPolyline(path.points)}
      fill="none"
      stroke={path.strokeColorToken}
      strokeWidth={path.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={opacity}
      style={{ pointerEvents: "none" }}
    />
  )
}

export function ReviewCanvas() {
  const active = useReviewStore((s) => s.active)
  const mode = useReviewStore((s) => s.mode)
  const identity = useReviewStore((s) => s.identity)
  const drawingPath = useReviewStore((s) => s.drawingPath)
  const pendingAnchor = useReviewStore((s) => s.pendingAnchor)
  const selectedCommentId = useReviewStore((s) => s.selectedCommentId)

  const startDraw = useReviewStore((s) => s.startDraw)
  const appendDrawPoint = useReviewStore((s) => s.appendDrawPoint)
  const endDraw = useReviewStore((s) => s.endDraw)
  const placePin = useReviewStore((s) => s.placePin)
  const openThread = useReviewStore((s) => s.openThread)

  const url = useCurrentUrl()
  const comments = useCommentsForUrl(url)

  const isDrawingRef = React.useRef(false)
  const rafRef = React.useRef<number | null>(null)
  const pendingPointRef = React.useRef<ReviewPoint | null>(null)
  const scroll = useCumulativeScrollOffset()
  const layoutVersion = useLayoutVersion()

  // Posição renderizada de cada pin, em coords do grupo (que já é transladado
  // por -scroll). Quando o pin tem âncora de elemento e o elemento resolve, a
  // posição segue o reflow horizontal; senão, cai na coord absoluta salva.
  // `layoutVersion` força recálculo quando o layout muda sem scroll/resize.
  const pinPositions = React.useMemo(() => {
    void layoutVersion
    const map = new Map<string, ReviewPoint>()
    for (const c of comments) {
      if (c.origin === "ux-flow") continue
      if (c.anchor.kind === "pin") {
        const vp = c.anchor.el ? resolveElementPoint(c.anchor.el) : null
        map.set(
          c.id,
          vp ? { x: vp.x + scroll.x, y: vp.y + scroll.y } : c.anchor.position,
        )
      } else {
        map.set(c.id, c.anchor.centroid)
      }
    }
    return map
  }, [comments, scroll.x, scroll.y, layoutVersion])

  const captureMode =
    pendingAnchor === null && (mode === "draw" || mode === "pin")

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!identity) return
    if (mode === "draw") {
      isDrawingRef.current = true
      const point = pointFromEvent(e)
      startDraw(point, identity.colorToken)
      ;(e.target as Element).setPointerCapture?.(e.pointerId)
    } else if (mode === "pin") {
      const point = pointFromEvent(e)
      const el = captureElementAnchor(e.clientX, e.clientY)
      placePin(point, el ?? undefined)
    }
  }

  const flushPoint = React.useCallback(() => {
    rafRef.current = null
    const p = pendingPointRef.current
    if (p) {
      appendDrawPoint(p)
      pendingPointRef.current = null
    }
  }, [appendDrawPoint])

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawingRef.current || mode !== "draw") return
    pendingPointRef.current = pointFromEvent(e)
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(flushPoint)
    }
  }

  const onPointerUp = () => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (pendingPointRef.current) {
      appendDrawPoint(pendingPointRef.current)
      pendingPointRef.current = null
    }
    endDraw()
  }

  React.useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (!active) return null

  const cursor =
    mode === "draw" ? "crosshair" : mode === "pin" ? "copy" : "default"

  return (
    <svg
      {...{ [OVERLAY_DATA_ATTR]: "" }}
      className="fixed inset-0"
      width="100%"
      height="100%"
      style={{
        zIndex: REVIEW_Z.canvas,
        pointerEvents: captureMode ? "auto" : "none",
        cursor,
        touchAction: captureMode ? "none" : "auto",
        overflow: "visible",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <g transform={`translate(${-scroll.x} ${-scroll.y})`}>
        {/* ux-flow comments live on the diagram canvas (rendered by the flow
            editor) — their document-coord pins would drift here, so skip them. */}
        {comments.filter((c) => c.origin !== "ux-flow").map((c) => {
          if (c.anchor.kind === "draw") {
            return (
              <g key={c.id} style={{ pointerEvents: "auto" }}>
                <PathPolyline
                  path={c.anchor.path}
                  opacity={c.status === "resolved" ? 0.3 : 0.85}
                />
                <ReviewPinMarker
                  position={pinPositions.get(c.id) ?? c.anchor.centroid}
                  comment={c}
                  selected={selectedCommentId === c.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    openThread(c.id)
                  }}
                />
              </g>
            )
          }
          return (
            <ReviewPinMarker
              key={c.id}
              position={pinPositions.get(c.id) ?? c.anchor.position}
              comment={c}
              selected={selectedCommentId === c.id}
              onClick={(e) => {
                e.stopPropagation()
                openThread(c.id)
              }}
            />
          )
        })}

        {drawingPath && drawingPath.length > 0 && identity && (
          <PathPolyline
            path={{
              points: drawingPath,
              strokeColorToken: identity.colorToken,
              strokeWidth: 3,
            }}
          />
        )}

        {pendingAnchor?.kind === "draw" && (
          <PathPolyline path={pendingAnchor.path} />
        )}

        {pendingAnchor?.kind === "pin" && identity && (
          <circle
            cx={pendingAnchor.position.x}
            cy={pendingAnchor.position.y}
            r={10}
            fill={identity.colorToken}
            opacity={0.6}
          />
        )}
      </g>
    </svg>
  )
}
