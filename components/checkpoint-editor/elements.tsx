"use client"

import * as React from "react"
import {
  PlateElement,
  PlateLeaf,
  type PlateElementProps,
  type PlateLeafProps,
} from "platejs/react"

export function ParagraphElement(props: PlateElementProps) {
  return (
    <PlateElement
      {...props}
      className="my-1 text-[14px] leading-[1.7] text-fg-primary"
    >
      {props.children}
    </PlateElement>
  )
}

export function H1Element(props: PlateElementProps) {
  return (
    <PlateElement
      as="h1"
      {...props}
      className="mt-6 mb-2 flex items-center gap-2 text-[20px] font-semibold tracking-tight text-fg-primary"
    >
      <span className="text-fg-tertiary" aria-hidden>
        ◇
      </span>
      <span className="flex-1">{props.children}</span>
    </PlateElement>
  )
}

export function H2Element(props: PlateElementProps) {
  return (
    <PlateElement
      as="h2"
      {...props}
      className="mt-5 mb-1.5 text-[17px] font-semibold tracking-tight text-fg-primary"
    >
      {props.children}
    </PlateElement>
  )
}

export function H3Element(props: PlateElementProps) {
  return (
    <PlateElement
      as="h3"
      {...props}
      className="mt-4 mb-1 text-[15px] font-semibold tracking-tight text-fg-primary"
    >
      {props.children}
    </PlateElement>
  )
}

export function BlockquoteElement(props: PlateElementProps) {
  return (
    <PlateElement
      as="blockquote"
      {...props}
      className="my-3 rounded-md border-l-2 border-aw-gray-400 bg-bg-muted px-3 py-2 text-[14px] leading-relaxed text-fg-secondary"
    >
      {props.children}
    </PlateElement>
  )
}

export function CodeBlockElement(props: PlateElementProps) {
  return (
    <PlateElement
      as="pre"
      {...props}
      className="my-3 overflow-x-auto rounded-lg bg-aw-gray-1200 px-4 py-3 font-mono text-[13px] leading-relaxed text-white"
    >
      <code>{props.children}</code>
    </PlateElement>
  )
}

export function CodeLineElement(props: PlateElementProps) {
  return (
    <PlateElement as="div" {...props}>
      {props.children}
    </PlateElement>
  )
}

export function ULElement(props: PlateElementProps) {
  return (
    <PlateElement
      as="ul"
      {...props}
      className="my-2 list-disc pl-6 text-[14px] leading-[1.7] text-fg-primary marker:text-aw-gray-500"
    >
      {props.children}
    </PlateElement>
  )
}

export function OLElement(props: PlateElementProps) {
  return (
    <PlateElement
      as="ol"
      {...props}
      className="my-2 list-decimal pl-6 text-[14px] leading-[1.7] text-fg-primary marker:text-aw-gray-500"
    >
      {props.children}
    </PlateElement>
  )
}

export function LIElement(props: PlateElementProps) {
  return (
    <PlateElement as="li" {...props} className="my-1">
      {props.children}
    </PlateElement>
  )
}

export function LinkElement(props: PlateElementProps) {
  const url = (props.element as { url?: string }).url ?? "#"
  return (
    <PlateElement
      as="a"
      {...props}
      attributes={{ ...props.attributes, href: url }}
      className="text-aw-blue-700 underline decoration-aw-blue-400 underline-offset-2 hover:decoration-aw-blue-700"
    >
      {props.children}
    </PlateElement>
  )
}

export function MentionElement(props: PlateElementProps) {
  const value = (props.element as { value?: string }).value ?? ""
  const trigger = value.startsWith("@") ? value : `@${value}`
  return (
    <PlateElement
      as="span"
      {...props}
      attributes={{ ...props.attributes, contentEditable: false }}
      className="mention-chip mx-0.5 inline-flex select-none items-center rounded-md bg-aw-purple-100 px-1.5 py-0.5 align-baseline font-mono text-[12.5px] text-aw-purple-800 ring-1 ring-aw-purple-200"
    >
      {trigger}
      {props.children}
    </PlateElement>
  )
}

export function BoldLeaf(props: PlateLeafProps) {
  return (
    <PlateLeaf as="strong" {...props}>
      {props.children}
    </PlateLeaf>
  )
}

export function ItalicLeaf(props: PlateLeafProps) {
  return (
    <PlateLeaf as="em" {...props}>
      {props.children}
    </PlateLeaf>
  )
}

export function UnderlineLeaf(props: PlateLeafProps) {
  return (
    <PlateLeaf as="u" {...props}>
      {props.children}
    </PlateLeaf>
  )
}

export function CodeLeaf(props: PlateLeafProps) {
  return (
    <PlateLeaf
      as="code"
      {...props}
      className="rounded bg-aw-gray-200 px-1 py-px font-mono text-[12.5px] text-fg-primary"
    >
      {props.children}
    </PlateLeaf>
  )
}
