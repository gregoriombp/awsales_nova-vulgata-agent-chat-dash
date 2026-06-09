/**
 * Agent Studio — registry de agentes (mock) + dados estendidos do editor.
 *
 * Fonte única consumida pela listagem (/agent-studio), pelo editor
 * (/agent-studio/[id]) e pela revisão (/agent-studio/[id]/review).
 * Em produção tudo isso vem do backend; aqui o shape é o contrato.
 */

import { agentCoreSrc } from "@/components/ui/AwAgentCore";
import type { AwPillVariant } from "@/components/ui/AwPill";

/* ─────────────────────────────────────────────────────────────────────────
 * Agentes (linhas da listagem)
 * ───────────────────────────────────────────────────────────────────────── */

export type AgentStatus = "active" | "draft" | "paused";

export type Agent = {
  id: string;
  title: string;
  /** Objetivo curto do agente (uma linha). */
  objetivo: string;
  status: AgentStatus;
  /** Nome do Agent Core (framework) que o agente roda. */
  coreName: string;
  /** PNG do Core (1–20). */
  coreSrc: string;
  author: { name: string; initials: string };
  createdAt: string;
  knowledgeBase: string;
};

export const AGENT_STATUS_META: Record<
  AgentStatus,
  { label: string; variant: AwPillVariant }
> = {
  active: { label: "Ativo", variant: "live" },
  draft: { label: "Rascunho", variant: "draft" },
  paused: { label: "Pausado", variant: "neutral" },
};

export const MEUS_AGENTES: Agent[] = [
  {
    id: "leads-recovery",
    title: "Agente de recuperação de leads",
    objetivo: "Recuperar leads",
    status: "active",
    coreName: "Upsell Specialist",
    coreSrc: agentCoreSrc(3),
    author: { name: "Gregório Pinheiro", initials: "GP" },
    createdAt: "9 fev 2026, 20:21",
    knowledgeBase: "Fyntra | Dados Gerais 2026",
  },
  {
    id: "sales",
    title: "Agente de vendas",
    objetivo: "Qualificar lead e agendar demo",
    status: "active",
    coreName: "Closer Pro",
    coreSrc: agentCoreSrc(7),
    author: { name: "Gregório Pinheiro", initials: "GP" },
    createdAt: "2 fev 2026, 11:08",
    knowledgeBase: "Fyntra | Playbook comercial",
  },
  {
    id: "customer-support",
    title: "Agente de suporte",
    objetivo: "Resolver tickets de nível 1",
    status: "active",
    coreName: "Empathy Core",
    coreSrc: agentCoreSrc(12),
    author: { name: "Gregório Pinheiro", initials: "GP" },
    createdAt: "28 jan 2026, 16:42",
    knowledgeBase: "Fyntra | Central de ajuda",
  },
  {
    id: "hr",
    title: "Agente de RH",
    objetivo: "Onboarding e dúvidas de políticas",
    status: "draft",
    coreName: "People Ops",
    coreSrc: agentCoreSrc(15),
    author: { name: "Gregório Pinheiro", initials: "GP" },
    createdAt: "24 jan 2026, 09:15",
    knowledgeBase: "Fyntra | Manual interno",
  },
];

export const TODOS_OS_AGENTES: Agent[] = [
  {
    id: "research",
    title: "Agente de research",
    objetivo: "Sintetizar briefs de mercado",
    status: "active",
    coreName: "Insight Engine",
    coreSrc: agentCoreSrc(5),
    author: { name: "Bea Costa", initials: "BC" },
    createdAt: "18 jan 2026, 14:30",
    knowledgeBase: "Fyntra | Inteligência de mercado",
  },
  {
    id: "qa",
    title: "Agente de QA",
    objetivo: "Checar regressões antes do deploy",
    status: "paused",
    coreName: "Guardian",
    coreSrc: agentCoreSrc(9),
    author: { name: "Carlos Sun", initials: "CS" },
    createdAt: "15 jan 2026, 10:00",
    knowledgeBase: "Fyntra | Release notes",
  },
  {
    id: "onboarding",
    title: "Agente de onboarding",
    objetivo: "Guiar os primeiros 90 dias",
    status: "active",
    coreName: "Pathfinder",
    coreSrc: agentCoreSrc(2),
    author: { name: "Dani Rocha", initials: "DR" },
    createdAt: "12 jan 2026, 08:45",
    knowledgeBase: "Fyntra | Onboarding workspace",
  },
  {
    id: "data",
    title: "Agente de dados",
    objetivo: "Rodar queries e montar dashboards",
    status: "active",
    coreName: "Data Forge",
    coreSrc: agentCoreSrc(18),
    author: { name: "Eva Lima", initials: "EL" },
    createdAt: "9 jan 2026, 17:20",
    knowledgeBase: "Fyntra | Data warehouse",
  },
];

export const ALL_AGENTES: Agent[] = [...MEUS_AGENTES, ...TODOS_OS_AGENTES];

export function getAgentById(id: string): Agent {
  return ALL_AGENTES.find((a) => a.id === id) ?? ALL_AGENTES[0];
}

/* ─────────────────────────────────────────────────────────────────────────
 * Navegação do editor (/agent-studio/[id]?tab=…)
 * ───────────────────────────────────────────────────────────────────────── */

export type EditorTabId =
  | "visao-geral"
  | "prompt-checkpoint"
  | "visualizacao-modular"
  | "base-conhecimento"
  | "aops"
  | "follow-up"
  | "atendimento-humano"
  | "playground"
  | "historico"
  | "insights"
  | "preferencias";

export type EditorTab = {
  id: EditorTabId;
  label: string;
  /** Material Symbols (via components/ui/Icon). */
  icon: string;
  /** Subtítulo exibido no header da seção. */
  description: string;
};

export const EDITOR_TABS: EditorTab[] = [
  {
    id: "visao-geral",
    label: "Visão geral",
    icon: "dashboard",
    description: "Resumo de tudo que define este agente.",
  },
  {
    id: "prompt-checkpoint",
    label: "Prompt e Checkpoint",
    icon: "terminal",
    description: "Instruções e etapas que guiam a conversa do agente.",
  },
  {
    id: "visualizacao-modular",
    label: "Visualização modular",
    icon: "account_tree",
    description: "O fluxo de checkpoints em formato de diagrama.",
  },
  {
    id: "base-conhecimento",
    label: "Base de conhecimento",
    icon: "database",
    description: "Selecione as bases de conhecimento utilizadas pelo agente.",
  },
  {
    id: "aops",
    label: "AOPs",
    icon: "description",
    description:
      "Procedimentos operacionais que orientam as decisões e ações do agente.",
  },
  {
    id: "follow-up",
    label: "Follow-up",
    icon: "schedule_send",
    description:
      "Regras de follow-up para reengajar leads automaticamente.",
  },
  {
    id: "atendimento-humano",
    label: "Atendimento humano",
    icon: "support_agent",
    description:
      "Defina quando e como a conversa deve ser transferida para um atendente.",
  },
  {
    id: "playground",
    label: "Playground",
    icon: "forum",
    description:
      "Teste o comportamento do agente em tempo real antes de publicar.",
  },
  {
    id: "historico",
    label: "Histórico de alterações",
    icon: "history",
    description:
      "Acompanhe as modificações em instruções, bases, AOPs e checkpoints.",
  },
  {
    id: "insights",
    label: "Insights",
    icon: "lightbulb",
    description:
      "Insights e recomendações para melhorar o desempenho do agente.",
  },
  {
    id: "preferencias",
    label: "Preferências",
    icon: "tune",
    description:
      "Configurações gerais do agente, incluindo identidade e status.",
  },
];

export function isEditorTabId(value: string | null): value is EditorTabId {
  return EDITOR_TABS.some((t) => t.id === value);
}

/* ─────────────────────────────────────────────────────────────────────────
 * Dados estendidos do editor
 * ───────────────────────────────────────────────────────────────────────── */

export type Checkpoint = {
  id: string;
  numero: number;
  titulo: string;
  objetivo: string;
  /** Chips de análise ("Analise o Histórico do Usuário"). */
  analises?: string[];
  /** Bullets de orientação do checkpoint. */
  itens: string[];
  /** Bloco de marcação — o agente classifica a resposta do lead. */
  marque?: { rotulo: string; opcoes: string[] };
  /** Habilidades referenciadas via @ neste checkpoint. */
  habilidades?: string[];
};

export type HabilidadeConfigurada = {
  id: string;
  nome: string;
  descricao: string;
  /** Grupos nativos vêm do core; integrações vêm das conexões da org. */
  grupo: "nativo" | "integracao";
};

export type AgentIntegration = {
  id: string;
  nome: string;
  dominio: string;
};

export type AgentAop = {
  id: string;
  nome: string;
  descricao: string;
  status: "ativo" | "desativado";
  criadoPor: string;
  atualizadoEm: string;
};

export type FollowUpRule = {
  id: string;
  nome: string;
  gatilho: string;
  espera: string;
  canal: string;
  status: "ativo" | "pausado";
  mensagens: number;
};

export type HistoryEntry = {
  id: string;
  autor: { name: string; initials: string };
  acao: string;
  quando: string;
};

export type HistoryDay = {
  data: string;
  entradas: HistoryEntry[];
};

export type AgentVariable = {
  nome: string;
  tipo: string;
  descricao: string;
};

export type AgentEditorData = {
  agent: Agent;
  /** Quando o agente começa a operar (exibido na visão geral). */
  programacao: string;
  social: { nomeSocial: string; empresa: string };
  canal: { nome: string; telefone: string };
  origem: { plataformas: string[]; eventoConversao: string };
  kb: {
    nome: string;
    fontes: number;
    knowledgeLayers: number;
    usadoPorAgentes: number;
  };
  basesDisponiveis: {
    id: string;
    nome: string;
    fontes: number;
    knowledgeLayers: number;
  }[];
  /** Personalidade resumida (Prompt do agente). */
  prompt: string;
  checkpoints: Checkpoint[];
  habilidadesConfiguradas: HabilidadeConfigurada[];
  integracoes: AgentIntegration[];
  aops: AgentAop[];
  followUps: FollowUpRule[];
  atendimentoHumano: { ativo: boolean; modo: "manual" | "automatica" };
  variaveis: AgentVariable[];
  templates: { label: string; valor: string }[];
  historico: HistoryDay[];
  /** Score de qualidade (0–100) exibido na revisão. */
  qualidade: number;
};

const BASES_DISPONIVEIS = [
  {
    id: "dados-gerais",
    nome: "Fyntra | Dados Gerais 2026",
    fontes: 5,
    knowledgeLayers: 178,
  },
  {
    id: "playbook",
    nome: "Fyntra | Playbook comercial",
    fontes: 3,
    knowledgeLayers: 96,
  },
  {
    id: "central-ajuda",
    nome: "Fyntra | Central de ajuda",
    fontes: 8,
    knowledgeLayers: 214,
  },
];

const CHECKPOINTS_PADRAO: Checkpoint[] = [
  {
    id: "cp-1",
    numero: 1,
    titulo: "Abertura e Contextualização",
    objetivo:
      "Estabelecer conexão calorosa e contextualizar o motivo do contato.",
    analises: ["Analise o Histórico do Usuário"],
    itens: [
      "Agradecer pelo interesse demonstrado do {{lead_name}}.",
      "Perguntar se ainda tem interesse em avançar enquanto o processo segue.",
      "Tom consultivo e não invasivo.",
    ],
    marque: {
      rotulo: "a Resposta Inicial do Lead",
      opcoes: [
        "Receptivo: demonstra interesse, responde positivamente",
        "Neutro: responde mas sem entusiasmo claro",
        "Resistente: demonstra pressa ou desinteresse",
        "Sem resposta inicial",
      ],
    },
    habilidades: ["Contexto"],
  },
  {
    id: "cp-2",
    numero: 2,
    titulo: "Descoberta do Motivo da Não-Ação",
    objetivo: "Entender genuinamente por que não avançou após ser aprovado.",
    analises: ["Capture o Tom das Primeiras Palavras do Lead"],
    itens: [
      "Perguntar de forma aberta o que impediu o avanço.",
      "Não rebater a primeira objeção — registrar e aprofundar.",
      "Identificar se o bloqueio é de tempo, confiança ou prioridade.",
    ],
    habilidades: ["Fluxo", "AOPs"],
  },
  {
    id: "cp-3",
    numero: 3,
    titulo: "Reapresentação de Valor",
    objetivo:
      "Reconectar a oferta ao objetivo original do lead com base no contexto coletado.",
    itens: [
      "Citar o benefício mais aderente ao motivo identificado no checkpoint anterior.",
      "Usar a base de conhecimento para responder dúvidas de produto.",
      "Evitar repetir argumentos que o lead já recebeu.",
    ],
    habilidades: ["Base de conhecimento"],
  },
  {
    id: "cp-4",
    numero: 4,
    titulo: "Tratamento de Objeções",
    objetivo: "Responder objeções com dados e casos reais, sem pressionar.",
    itens: [
      "Consultar cases relevantes para o segmento do lead.",
      "Se a objeção for financeira, apresentar condições disponíveis.",
      "Escalar para atendimento humano se a objeção fugir do escopo.",
    ],
    marque: {
      rotulo: "o Tipo de Objeção",
      opcoes: ["Preço", "Tempo", "Confiança", "Sem objeção"],
    },
    habilidades: ["AOPs", "Atendimento humano"],
  },
  {
    id: "cp-5",
    numero: 5,
    titulo: "Encaminhamento e Agendamento",
    objetivo: "Converter o reengajamento em um próximo passo concreto.",
    itens: [
      "Propor horários reais a partir da agenda conectada.",
      "Confirmar canal preferido do lead para o follow-up.",
      "Registrar o desfecho da conversa no CRM.",
    ],
    habilidades: ["Google Calendar", "Pipedrive"],
  },
];

const HABILIDADES_CONFIGURADAS: HabilidadeConfigurada[] = [
  {
    id: "agente",
    nome: "Agente",
    descricao: "Configurações e ações do agente.",
    grupo: "nativo",
  },
  {
    id: "fluxo",
    nome: "Fluxo",
    descricao: "Controles de fluxo comportamental do checkpoint.",
    grupo: "nativo",
  },
  {
    id: "contexto",
    nome: "Contexto",
    descricao: "Medidas relacionadas ao contexto da conversa.",
    grupo: "nativo",
  },
  {
    id: "aops",
    nome: "AOPs",
    descricao: "Procedimentos operacionais do agente.",
    grupo: "nativo",
  },
  {
    id: "google-calendar",
    nome: "Google Calendar",
    descricao: "Habilidades do Google Calendar disponíveis.",
    grupo: "integracao",
  },
  {
    id: "pipedrive",
    nome: "Pipedrive",
    descricao: "Habilidades do Pipedrive disponíveis.",
    grupo: "integracao",
  },
];

const INTEGRACOES_PADRAO: AgentIntegration[] = [
  { id: "stripe", nome: "Stripe", dominio: "stripe.com" },
  { id: "calendly", nome: "Calendly", dominio: "calendly.com" },
  { id: "pipedrive", nome: "Pipedrive", dominio: "pipedrive.com" },
  { id: "slack", nome: "Slack", dominio: "slack.com" },
  { id: "hotmart", nome: "Hotmart", dominio: "hotmart.com" },
  { id: "hubspot", nome: "Hubspot", dominio: "br.hubspot.com" },
];

const AOPS_PADRAO: AgentAop[] = [
  {
    id: "aop-risco",
    nome: "Análise de Risco do Usuário",
    descricao: "Analisa o histórico de fraude do usuário por risco.",
    status: "ativo",
    criadoPor: "Gregório Pinheiro",
    atualizadoEm: "10 fev 2026, 14:32",
  },
  {
    id: "aop-cases",
    nome: "Cases Relevantes",
    descricao: "Seleciona cases relevantes para o cliente.",
    status: "ativo",
    criadoPor: "Gregório Pinheiro",
    atualizadoEm: "10 fev 2026, 14:10",
  },
  {
    id: "aop-liberacao",
    nome: "Liberação de Conta Após Análise",
    descricao: "Desbloqueio de contas após validação de segurança.",
    status: "desativado",
    criadoPor: "Gregório Pinheiro",
    atualizadoEm: "9 fev 2026, 18:47",
  },
  {
    id: "aop-limites",
    nome: "Gestão de Limites e Restrições",
    descricao: "Define regras para análise, aumento, redução ou bloqueio.",
    status: "desativado",
    criadoPor: "Gregório Pinheiro",
    atualizadoEm: "9 fev 2026, 18:21",
  },
  {
    id: "aop-cadastro",
    nome: "Atualização de Dados Cadastrais",
    descricao: "Atualização de dados pessoais do usuário.",
    status: "ativo",
    criadoPor: "Gregório Pinheiro",
    atualizadoEm: "8 fev 2026, 11:05",
  },
];

const HISTORICO_PADRAO: HistoryDay[] = [
  {
    data: "10 fev 2026",
    entradas: [
      {
        id: "h-1",
        autor: { name: "Pedro Ramalho", initials: "PR" },
        acao: "Alterou o Checkpoint 02 — Descoberta do Motivo da Não-Ação.",
        quando: "5 min atrás",
      },
      {
        id: "h-2",
        autor: { name: "Ana Carolina", initials: "AC" },
        acao: "Alterou a base de conhecimento para “Políticas oficiais”.",
        quando: "45 min atrás",
      },
      {
        id: "h-3",
        autor: { name: "Arthur Veras", initials: "AV" },
        acao: "Alterou o Prompt do agente.",
        quando: "1 hora atrás",
      },
    ],
  },
  {
    data: "9 fev 2026",
    entradas: [
      {
        id: "h-4",
        autor: { name: "Gregório Pinheiro", initials: "GP" },
        acao: "Ativou o AOP Análise de Risco do Usuário.",
        quando: "18:47",
      },
      {
        id: "h-5",
        autor: { name: "Gregório Pinheiro", initials: "GP" },
        acao: "Conectou a integração Google Calendar.",
        quando: "15:12",
      },
    ],
  },
  {
    data: "1 fev 2026",
    entradas: [
      {
        id: "h-6",
        autor: { name: "Gregório Pinheiro", initials: "GP" },
        acao: "Criou o agente a partir do Agent Studio.",
        quando: "09:30",
      },
    ],
  },
];

const VARIAVEIS_PADRAO: AgentVariable[] = [
  {
    nome: "{{agent_name}}",
    tipo: "Texto",
    descricao: "Nome social usado pelo agente nas conversas.",
  },
  {
    nome: "{{lead_name}}",
    tipo: "Texto",
    descricao: "Primeiro nome do lead em atendimento.",
  },
  {
    nome: "{{lead_phone}}",
    tipo: "Telefone",
    descricao: "Telefone principal do lead.",
  },
  {
    nome: "{{company_name}}",
    tipo: "Texto",
    descricao: "Nome da empresa exibido nas mensagens.",
  },
];

const FOLLOW_UPS_LEADS_RECOVERY: FollowUpRule[] = [
  {
    id: "fu-inatividade",
    nome: "Sequência de inatividade",
    gatilho: "Lead sem resposta",
    espera: "24 horas",
    canal: "WhatsApp",
    status: "ativo",
    mensagens: 3,
  },
  {
    id: "fu-reuniao",
    nome: "Lembrete de reunião",
    gatilho: "Reunião agendada",
    espera: "1 hora antes",
    canal: "WhatsApp",
    status: "ativo",
    mensagens: 1,
  },
];

const PROMPT_PADRAO = (agent: Agent) =>
  `Você é {{agent_name}}, agente de ${agent.objetivo.toLowerCase()} da {{company_name}}.

Seu tom é acolhedor, profissional e consultivo. Você escuta antes de propor, evita repetir argumentos e nunca pressiona o lead.

Use a base de conhecimento conectada para responder dúvidas de produto. Quando a conversa sair do seu escopo, transfira para atendimento humano com o contexto completo.`;

/**
 * Resolve os dados completos do editor para um agente.
 * Ids desconhecidos caem no primeiro agente do registry — assim qualquer
 * /agent-studio/[id] renderiza uma tela completa no protótipo.
 */
export function getAgentEditorData(id: string): AgentEditorData {
  const agent = getAgentById(id);
  const isLeadsRecovery = agent.id === "leads-recovery";

  return {
    agent,
    programacao: "9 abr 2026, 17:00",
    social: { nomeSocial: "João", empresa: "Fyntra" },
    canal: { nome: "WhatsApp", telefone: "+55 (31) 99949 6803" },
    origem: {
      plataformas: ["Stripe", "Typeform", "Hotmart"],
      eventoConversao: "Pagamento confirmado na Stripe",
    },
    kb: {
      nome: agent.knowledgeBase,
      fontes: 5,
      knowledgeLayers: 178,
      usadoPorAgentes: 2,
    },
    basesDisponiveis: BASES_DISPONIVEIS,
    prompt: PROMPT_PADRAO(agent),
    checkpoints: CHECKPOINTS_PADRAO,
    habilidadesConfiguradas: HABILIDADES_CONFIGURADAS,
    integracoes: INTEGRACOES_PADRAO,
    aops: AOPS_PADRAO,
    followUps: isLeadsRecovery ? FOLLOW_UPS_LEADS_RECOVERY : [],
    atendimentoHumano: { ativo: true, modo: "manual" },
    variaveis: VARIAVEIS_PADRAO,
    templates: [
      { label: "Abertura", valor: "fyntra_produtos" },
      { label: "Assinatura cancelada", valor: "assinatura_cancelada" },
      { label: "Pagamento falhou", valor: "pagamento_falhou" },
      { label: "Carrinho abandonado", valor: "carrinho_abandonado_fyntra" },
    ],
    historico: HISTORICO_PADRAO,
    qualidade: 94,
  };
}
