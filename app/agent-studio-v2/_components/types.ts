import type { AgentStatus, AvatarTone } from "./primitives"

export type AgentDraft = {
  id: string | null
  name: string
  objective: string
  audience: string
  kpi: string
  tones: string[]
  constraints: string
  skills: string[]
  channels: string[]
  core: string
  model: string
  checkpoint: string
  prompt: string | null
  _jumpTo?: StepId
}

export const EMPTY_AGENT: AgentDraft = {
  id: null,
  name: "",
  objective: "",
  audience: "",
  kpi: "Taxa de resposta",
  tones: ["Humano e próximo", "Consultivo"],
  constraints: "",
  skills: ["kb_answer", "schedule", "lead_qual"],
  channels: ["wa", "email"],
  core: "Sales SDR Assistant",
  model: "Claude Sonnet 4.5",
  checkpoint: "v0.5 — Atual",
  prompt: null,
}

export type StepId =
  | "objetivo"
  | "core"
  | "habilidades"
  | "canais"
  | "revisao"
  | "publicar"

export const BUILDER_STEPS: {
  id: StepId
  label: string
  icon: string
  num: number
}[] = [
  { id: "objetivo", label: "Objetivo", icon: "target", num: 1 },
  { id: "core", label: "Agente core", icon: "memory", num: 2 },
  { id: "habilidades", label: "Habilidades", icon: "extension", num: 3 },
  { id: "canais", label: "Canais", icon: "hub", num: 4 },
  { id: "revisao", label: "Revisão", icon: "fact_check", num: 5 },
  { id: "publicar", label: "Publicar", icon: "rocket_launch", num: 6 },
]

export type ViewState =
  | { screen: "home" }
  | { screen: "wizard" }
  | { screen: "builder"; step: StepId; published?: boolean }

export type AgentSeed = {
  id: string
  name: string
  objective: string
  icon: string
  status: AgentStatus
  core: string
  author: string
  avatarTone: AvatarTone
  createdAt: string
  kb: number
}

export const AGENT_SEED: AgentSeed[] = [
  {
    id: "a1",
    name: "Agente de Recuperação de Leads",
    objective: "Recuperar leads",
    icon: "target",
    status: "ativo",
    core: "Sales SDR Assistant",
    author: "Germano Faccio",
    avatarTone: "blue",
    createdAt: "14 mar 2026",
    kb: 124,
  },
  {
    id: "a2",
    name: "Assistente de Onboarding",
    objective: "Ativar novos clientes",
    icon: "rocket_launch",
    status: "publicado",
    core: "Onboarding Concierge",
    author: "Marina Silveira",
    avatarTone: "emerald",
    createdAt: "22 fev 2026",
    kb: 56,
  },
  {
    id: "a3",
    name: "Suporte N1 — WhatsApp",
    objective: "Atender suporte nível 1",
    icon: "support_agent",
    status: "ativo",
    core: "Customer Support Tier-1",
    author: "Lucas Andrade",
    avatarTone: "purple",
    createdAt: "04 fev 2026",
    kb: 312,
  },
  {
    id: "a4",
    name: "Qualificador de Oportunidades",
    objective: "Qualificar inbound",
    icon: "filter_alt",
    status: "revisao",
    core: "Inbound Qualifier",
    author: "Germano Faccio",
    avatarTone: "blue",
    createdAt: "31 jan 2026",
    kb: 48,
  },
  {
    id: "a5",
    name: "Agente de Follow-up Pós-venda",
    objective: "Nutrir pós-compra",
    icon: "mark_email_read",
    status: "pausado",
    core: "Post-Sale Nurture",
    author: "Sofia Rocha",
    avatarTone: "rose",
    createdAt: "22 jan 2026",
    kb: 89,
  },
  {
    id: "a6",
    name: "Cobrança amigável",
    objective: "Negociar em atraso",
    icon: "payments",
    status: "rascunho",
    core: "Dunning Negotiator",
    author: "Rafael Melo",
    avatarTone: "amber",
    createdAt: "19 jan 2026",
    kb: 22,
  },
]

export type Tweaks = {
  theme: "dark-shell" | "light-shell"
  density: "compact" | "regular" | "spacious"
  agentState: "rascunho" | "populado"
  sidebarMode: "expanded" | "collapsed"
}

export const DEFAULT_TWEAKS: Tweaks = {
  theme: "dark-shell",
  density: "regular",
  agentState: "rascunho",
  sidebarMode: "collapsed",
}
