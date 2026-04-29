"use client"

import { create } from "zustand"
import type { ChatAttachment, ChatMessage, ElementRef } from "./types"

type ClaudeEditState = {
  open: boolean
  pickerActive: boolean
  messages: ChatMessage[]
  pendingRefs: ElementRef[]
  pendingAttachments: ChatAttachment[]
  composerText: string

  setOpen: (open: boolean) => void
  toggleOpen: () => void
  togglePicker: () => void
  setPickerActive: (active: boolean) => void

  addRef: (ref: ElementRef) => void
  removeRef: (id: string) => void
  clearRefs: () => void

  addAttachment: (att: ChatAttachment) => void
  removeAttachment: (id: string) => void
  clearAttachments: () => void

  setComposerText: (text: string) => void
  clearComposer: () => void

  appendMessage: (msg: ChatMessage) => void
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void
  patchLastAgent: (patch: Partial<ChatMessage>) => void
  clearHistory: () => void
}

export const useClaudeEdit = create<ClaudeEditState>()((set, get) => ({
  open: false,
  pickerActive: false,
  messages: [],
  pendingRefs: [],
  pendingAttachments: [],
  composerText: "",

  setOpen: (open) => set({ open }),
  toggleOpen: () => set({ open: !get().open }),
  togglePicker: () =>
    set((s) => ({ pickerActive: !s.pickerActive, open: true })),
  setPickerActive: (active) => set({ pickerActive: active }),

  addRef: (ref) =>
    set((s) =>
      s.pendingRefs.some(
        (r) =>
          r.fileName === ref.fileName &&
          r.lineNumber === ref.lineNumber &&
          r.componentName === ref.componentName
      )
        ? s
        : { pendingRefs: [...s.pendingRefs, ref] }
    ),
  removeRef: (id) =>
    set((s) => ({ pendingRefs: s.pendingRefs.filter((r) => r.id !== id) })),
  clearRefs: () => set({ pendingRefs: [] }),

  addAttachment: (att) =>
    set((s) => ({ pendingAttachments: [...s.pendingAttachments, att] })),
  removeAttachment: (id) =>
    set((s) => ({
      pendingAttachments: s.pendingAttachments.filter((a) => a.id !== id),
    })),
  clearAttachments: () => set({ pendingAttachments: [] }),

  setComposerText: (text) => set({ composerText: text }),
  clearComposer: () =>
    set({ composerText: "", pendingRefs: [], pendingAttachments: [] }),

  appendMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  updateMessage: (id, patch) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })),
  patchLastAgent: (patch) =>
    set((s) => {
      const idx = [...s.messages]
        .map((m, i) => ({ m, i }))
        .reverse()
        .find(({ m }) => m.role === "agent")?.i
      if (idx === undefined) return s
      const next = [...s.messages]
      next[idx] = { ...next[idx], ...patch }
      return { messages: next }
    }),
  clearHistory: () => set({ messages: [] }),
}))
