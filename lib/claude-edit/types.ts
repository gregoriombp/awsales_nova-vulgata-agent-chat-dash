export type BridgeHealth = {
  ok: boolean
  version: string
  phase: string
  cwd?: string
  claude: {
    ready: boolean
    version?: string
    executable?: string
    reason?: string
  }
  port: number
}

export type BridgeState =
  | { kind: "checking" }
  | { kind: "offline" }
  | { kind: "half"; info: BridgeHealth }
  | { kind: "ready"; info: BridgeHealth }

export type ElementRef = {
  id: string
  fileName?: string
  lineNumber?: number
  columnNumber?: number
  componentName?: string
  tagName: string
  classNames?: string
  textContent?: string
  outerHtmlPreview?: string
  url?: string
}

export type ToolCall = {
  id: string
  name: string
  input: unknown
  result?: string
  isError?: boolean
}

export type ChatAttachment = {
  id: string
  dataUrl: string
  mediaType: string
  base64: string
  sizeKB: number
}

export type ChatMessage = {
  id: string
  role: "user" | "agent"
  text: string
  status: "streaming" | "done" | "error"
  refs?: ElementRef[]
  attachments?: ChatAttachment[]
  tools?: ToolCall[]
  costUsd?: number
  durationMs?: number
  error?: string
}
