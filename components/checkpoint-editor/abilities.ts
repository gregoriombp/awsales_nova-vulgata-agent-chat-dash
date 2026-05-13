import type { AbilityGroup, CheckpointVariable, FollowUp } from "./types"

export const CHECKPOINT_ABILITY_GROUPS: AbilityGroup[] = [
  {
    id: "agent",
    title: "Agente",
    description: "Configurações e ações do agente.",
    icon: "smart_toy",
    items: [
      {
        id: "agent.ThinkOutLoud",
        label: "Pensar em Voz Alta",
        trigger: "@agent.ThinkOutLoud",
        description: "Utilize habilidades disponíveis nas suas integrações.",
        category: "agent",
        icon: "psychology_alt",
      },
      {
        id: "agent.responseGuardrail",
        label: "Guardrilha de Respostas",
        trigger: "@agent.responseGuardrail",
        description:
          "Verifica a resposta antes do envio para reduzir alucinações.",
        category: "agent",
        icon: "policy",
      },
      {
        id: "agent.addToBlacklist",
        label: "Adicionar à Lista Negra",
        trigger: "@agent.addToBlacklist",
        description:
          "Verifica a resposta antes do envio para reduzir alucinações.",
        category: "agent",
        icon: "block",
      },
      {
        id: "agent.searchProducts",
        label: "Pesquisar Produtos",
        trigger: "@agent.searchProducts",
        description:
          "Verifica a resposta antes do envio para reduzir alucinações.",
        category: "agent",
        icon: "search",
      },
    ],
  },
  {
    id: "handoff",
    title: "Colaboração e Transferência",
    description: "",
    items: [
      {
        id: "agent.askToAgent",
        label: "Consultar outro agente",
        trigger: "@agent.askToAgent",
        description: "Utilize habilidades disponíveis nas suas integrações.",
        category: "agent",
        icon: "forum",
      },
      {
        id: "agent.handoffToAgent",
        label: "Transferir para outro agente",
        trigger: "@agent.handoffToAgent",
        description:
          "Verifica a resposta antes do envio para reduzir alucinações.",
        category: "agent",
        icon: "compare_arrows",
      },
      {
        id: "agent.handoffToHuman",
        label: "Transferir para humano",
        trigger: "@agent.handoffToHuman",
        description:
          "Verifica a resposta antes do envio para reduzir alucinações.",
        category: "agent",
        icon: "support_agent",
      },
    ],
  },
  {
    id: "others",
    title: "Outros",
    description: "",
    items: [
      {
        id: "agent.do",
        label: "Comando Personalizado",
        trigger: "@agent.do",
        description: "Aciona o agente para um comando customizado no contexto.",
        category: "agent",
        icon: "auto_fix_high",
      },
    ],
  },
  {
    id: "flow",
    title: "Fluxo",
    description: "Controles de fluxo comportamental do checkpoint.",
    icon: "alt_route",
    items: [
      {
        id: "if",
        label: "Se",
        trigger: "@if / @else",
        description: "Executa lógica condicional baseada em variáveis e estados.",
        category: "flow",
        icon: "fork_right",
        accent: "#f59e0b",
      },
      {
        id: "goto",
        label: "Ir para",
        trigger: "@switch to Step",
        description: "Redireciona execução para outra etapa do checkpoint.",
        category: "flow",
        icon: "redo",
        accent: "#8b5cf6",
      },
      {
        id: "await_user",
        label: "Aguardar Usuário",
        trigger: "@wait.for.user.input",
        description: "Pausa o fluxo até receber resposta do usuário.",
        category: "flow",
        icon: "hourglass_top",
      },
      {
        id: "end_conversation",
        label: "Encerrar conversa",
        trigger: "@end.conversation",
        description: "Finaliza explicitamente a execução do agente.",
        category: "flow",
        icon: "stop_circle",
      },
      {
        id: "await",
        label: "Aguardar",
        trigger: "@wait",
        description:
          "Tempo de espera antes de prosseguir. Ideal para follow-ups.",
        category: "flow",
        icon: "schedule",
      },
    ],
  },
  {
    id: "context",
    title: "Contexto",
    description: "Medidas relacionadas ao contexto da conversa.",
    icon: "data_object",
    items: [
      {
        id: "user.id",
        label: "Identificar usuário",
        trigger: "@user.id",
        description: "Utilize habilidades disponíveis nas suas integrações.",
        category: "context",
        group: "Usuário",
        icon: "badge",
      },
      {
        id: "user.email",
        label: "E-mail",
        trigger: "@user.email",
        description:
          "Verifica a resposta antes do envio para reduzir alucinações.",
        category: "context",
        group: "Usuário",
        icon: "mail",
      },
      {
        id: "user.language",
        label: "Idioma Preferido",
        trigger: "@user.language",
        description:
          "Verifica a resposta antes do envio para reduzir alucinações.",
        category: "context",
        group: "Usuário",
        icon: "translate",
      },
      {
        id: "user.timezone",
        label: "Fuso Horário",
        trigger: "@user.timezone",
        description: "Utilize habilidades disponíveis nas suas integrações.",
        category: "context",
        group: "Usuário",
        icon: "schedule",
      },
      {
        id: "user.flags",
        label: "Flags comportamentais de risco",
        trigger: "@user.flags",
        description:
          "Verifica a resposta antes do envio para reduzir alucinações.",
        category: "context",
        group: "Usuário",
        icon: "outlined_flag",
      },
      {
        id: "user.phone",
        label: "Telefone",
        trigger: "@user.phone",
        description:
          "Verifica a resposta antes do envio para reduzir alucinações.",
        category: "context",
        group: "Usuário",
        icon: "call",
      },
      {
        id: "user.lastMessage",
        label: "Momento da última mensagem",
        trigger: "@user.last_message_at",
        description: "Utilize habilidades disponíveis nas suas integrações.",
        category: "context",
        group: "Usuário",
        icon: "history",
      },
      {
        id: "user.load",
        label: "Carregar dados do usuário",
        trigger: "@user.load",
        description:
          "Verifica a resposta antes do envio para reduzir alucinações.",
        category: "context",
        group: "Usuário",
        icon: "person",
      },
      {
        id: "conversation.CheckpointMark",
        label: "Marcar",
        trigger: "@conversation.CheckpointMark",
        description: "Escolha uma das opções listadas para marcar.",
        category: "context",
        group: "Conversa",
        icon: "bookmark_added",
      },
      {
        id: "conversation.goal",
        label: "Objetivo",
        trigger: "@conversation.goal",
        description:
          "Define o objetivo ativo da conversa naquele momento.",
        category: "context",
        group: "Conversa",
        icon: "flag",
      },
      {
        id: "conversation.step",
        label: "Checkpoint",
        trigger: "@conversation.step",
        description: "Identifica a etapa atual do fluxo dentro do checkpoint.",
        category: "context",
        group: "Conversa",
        icon: "trip_origin",
      },
      {
        id: "conversation.voiceTone",
        label: "Tom de voz",
        trigger: "@conversation.voiceTone",
        description:
          "Define ou consulta o tom de comunicação do agente na conversa.",
        category: "context",
        group: "Conversa",
        icon: "graphic_eq",
      },
      {
        id: "conversation.lastIntent",
        label: "Última intenção detectada",
        trigger: "@conversation.lastIntent",
        description: "Intenção mais recente identificada no input do usuário.",
        category: "context",
        group: "Conversa",
        icon: "psychology",
      },
      {
        id: "conversation.confidenceScore",
        label: "Confiança da decisão do Agente",
        trigger: "@conversation.confidenceScore",
        description:
          "Nível de confiança do agente na decisão ou resposta gerada.",
        category: "context",
        group: "Conversa",
        icon: "verified",
      },
    ],
  },
  {
    id: "aops",
    title: "AOPs",
    description: "Custom Agentic Procedures.",
    icon: "extension",
    items: [
      {
        id: "aop.ProceduresReembolso",
        label: "Procedimentos de Reembolso",
        trigger: "@aop.ProceduresReembolso",
        description:
          "Define como o agente deve conduzir solicitações de reembolso, seguindo regras…",
        category: "aops",
        icon: "receipt_long",
      },
      {
        id: "aop.CasosSucesso",
        label: "Listar Cases de Sucesso",
        trigger: "@aop.CasesSucesso",
        description:
          "Instrui o agente a selecionar e apresentar cases relevantes conforme o conte…",
        category: "aops",
        icon: "rocket_launch",
      },
    ],
  },
  {
    id: "google-calendar",
    title: "Google Calendar",
    description: "Habilidades do Google Calendar disponíveis.",
    icon: "event",
    collapsible: true,
    items: [],
  },
  {
    id: "pipedrive",
    title: "Pipedrive",
    description: "Habilidades do Pipedrive disponíveis.",
    icon: "leaderboard",
    collapsible: true,
    items: [],
  },
]

export const CHECKPOINT_VARIABLES: CheckpointVariable[] = [
  { id: "agent_name", name: "{{agent_name}}" },
  { id: "lead_name", name: "{{lead_name}}" },
  { id: "lead_phone", name: "{{lead_phone}}" },
  { id: "organization_name", name: "{{organization_name}}" },
  { id: "end_time", name: "{{end_time}}" },
  { id: "event_name", name: "{{event_name}}" },
]

export const CHECKPOINT_FOLLOWUPS: FollowUp[] = [
  { id: "fyntra_message", name: "Fyntra_message", hint: "Follow-ups configurados" },
]
