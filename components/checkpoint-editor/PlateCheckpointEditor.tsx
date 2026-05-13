"use client"

import * as React from "react"
import type { Value, TElement } from "platejs"
import { Plate, PlateContent, usePlateEditor } from "platejs/react"
import {
  BoldPlugin,
  CodePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react"
import { BlockquotePlugin } from "@platejs/basic-nodes/react"
import { ListPlugin } from "@platejs/list/react"
import { LinkPlugin } from "@platejs/link/react"
import { MentionPlugin, MentionInputPlugin } from "@platejs/mention/react"
import { CodeBlockPlugin, CodeLinePlugin } from "@platejs/code-block/react"

import {
  BlockquoteElement,
  BoldLeaf,
  CodeBlockElement,
  CodeLeaf,
  CodeLineElement,
  H1Element,
  H2Element,
  H3Element,
  ItalicLeaf,
  LIElement,
  LinkElement,
  MentionElement,
  OLElement,
  ParagraphElement,
  ULElement,
  UnderlineLeaf,
} from "./elements"

export type CheckpointEditorValue = Value

export const DEFAULT_CHECKPOINT_VALUE = [
  {
    type: "h1",
    children: [{ text: "Checkpoint 01 — Abertura e Contextualização" }],
  },
  {
    type: "blockquote",
    children: [
      {
        text: "Objetivo: Estabelecer conexão calorosa e contextualizar o motivo do contato.",
      },
    ],
  },
  {
    type: "p",
    children: [
      { text: "Elementos de Abertura:" },
    ],
  },
  {
    type: "ul",
    children: [
      {
        type: "li",
        children: [
          {
            text: "Agradecer pelo interesse demonstrado do ",
          },
          {
            type: "mention",
            value: "lead_name",
            children: [{ text: "" }],
          },
          { text: "." },
        ],
      },
      {
        type: "li",
        children: [
          {
            text: "Perguntar se ainda tem interesse em receber adiantamento em dinheiro enquanto o processo segue.",
          },
        ],
      },
      {
        type: "li",
        children: [{ text: "Tom consultivo e não invasivo." }],
      },
    ],
  },
  {
    type: "h1",
    children: [{ text: "Checkpoint 02 — Descoberta do Motivo da Não-Ação" }],
  },
  {
    type: "blockquote",
    children: [
      {
        text: "Objetivo: Entender genuinamente por que não agendou após ser aprovado.",
      },
    ],
  },
  {
    type: "p",
    children: [
      {
        text: "“Vi que você demonstrou interesse mas não chegou a agendar a reunião. Aconteceu alguma coisa? Surgiu alguma dúvida que posso esclarecer?”",
      },
    ],
  },
  {
    type: "h1",
    children: [{ text: "Checkpoint 03 — Quebra de Objeções inicial" }],
  },
  {
    type: "blockquote",
    children: [
      {
        text: "Objetivo: Tentar quebrar a objeção inicial com elementos da base de conhecimento.",
      },
    ],
  },
  {
    type: "h1",
    children: [{ text: "Checkpoint 04 — Descoberta da Motivação Inicial" }],
  },
  {
    type: "blockquote",
    children: [
      {
        text: "Objetivo: Reconectar com o interesse inicial que levou ao preenchimento do formulário.",
      },
    ],
  },
  {
    type: "h1",
    children: [{ text: "Checkpoint 05 — Demonstração de valor com Cases" }],
  },
  {
    type: "blockquote",
    children: [
      {
        text: "Objetivo: Conectar a dor específica com um case relevante da Fyntra.",
      },
    ],
  },
  {
    type: "h1",
    children: [{ text: "Checkpoint 06 — Criação de Urgência" }],
  },
  {
    type: "blockquote",
    children: [
      {
        text: "Objetivo: Conectar o problema a uma consequência negativa real para criar urgência.",
      },
    ],
  },
  {
    type: "h1",
    children: [{ text: "Checkpoint 07 — Call To Action, Agendamento" }],
  },
  {
    type: "blockquote",
    children: [
      {
        text: "Objetivo: Converter o interesse em compromisso concreto com a reunião.",
      },
    ],
  },
] as unknown as Value

const PLUGINS = [
  // Marks
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  CodePlugin,
  // Block-level
  BlockquotePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  ListPlugin,
  LinkPlugin,
  CodeBlockPlugin,
  CodeLinePlugin,
  // Mentions (@ / {{ }} triggers)
  MentionPlugin.configure({
    options: {
      trigger: ["@", "{"],
      insertSpaceAfterMention: true,
    },
  }),
  MentionInputPlugin,
]

const COMPONENTS = {
  p: ParagraphElement,
  h1: H1Element,
  h2: H2Element,
  h3: H3Element,
  blockquote: BlockquoteElement,
  ul: ULElement,
  ol: OLElement,
  li: LIElement,
  a: LinkElement,
  code_block: CodeBlockElement,
  code_line: CodeLineElement,
  mention: MentionElement,
  // marks
  bold: BoldLeaf,
  italic: ItalicLeaf,
  underline: UnderlineLeaf,
  code: CodeLeaf,
}

export type PlateCheckpointEditorHandle = {
  toggleMark: (mark: "bold" | "italic" | "underline" | "code") => void
  setBlock: (type: "h1" | "h2" | "h3" | "p" | "blockquote") => void
  toggleList: (type: "ul" | "ol") => void
  insertText: (text: string) => void
  insertMention: (value: string) => void
  focus: () => void
}

export type PlateCheckpointEditorProps = {
  initialValue?: CheckpointEditorValue
  readOnly?: boolean
  onChange?: (value: CheckpointEditorValue) => void
  className?: string
  contentClassName?: string
  onSelectionInfo?: (info: { hasFocus: boolean }) => void
}

export const PlateCheckpointEditor = React.forwardRef<
  PlateCheckpointEditorHandle,
  PlateCheckpointEditorProps
>(function PlateCheckpointEditor(
  {
    initialValue,
    readOnly = false,
    onChange,
    className,
    contentClassName,
    onSelectionInfo,
  },
  ref,
) {
  const editor = usePlateEditor({
    plugins: PLUGINS,
    components: COMPONENTS,
    value: initialValue ?? DEFAULT_CHECKPOINT_VALUE,
  })

  React.useImperativeHandle(
    ref,
    () => ({
      toggleMark(mark) {
        editor.tf.toggleMark(mark)
        editor.tf.focus()
      },
      setBlock(type) {
        editor.tf.toggleBlock(type)
        editor.tf.focus()
      },
      toggleList(type) {
        editor.tf.toggleBlock(type)
        editor.tf.focus()
      },
      insertText(text) {
        editor.tf.insertText(text)
        editor.tf.focus()
      },
      insertMention(value) {
        const mentionNode: TElement = {
          type: "mention",
          value,
          children: [{ text: "" }],
        } as TElement
        editor.tf.insertNodes(mentionNode)
        editor.tf.insertText(" ")
        editor.tf.focus()
      },
      focus() {
        editor.tf.focus()
      },
    }),
    [editor],
  )

  return (
    <div className={className}>
      <Plate
        editor={editor}
        onChange={({ value }) => onChange?.(value as CheckpointEditorValue)}
        readOnly={readOnly}
        onSelectionChange={() => {
          onSelectionInfo?.({ hasFocus: true })
        }}
      >
        <PlateContent
          className={
            "checkpoint-editor-content max-w-none focus:outline-none " +
            (contentClassName ?? "")
          }
          placeholder="Comece a escrever o checkpoint…"
          spellCheck
        />
      </Plate>
    </div>
  )
})
