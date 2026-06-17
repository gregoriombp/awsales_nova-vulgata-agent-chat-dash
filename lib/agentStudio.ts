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
  author: { name: string; initials: string; avatar?: string };
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
    author: { name: "Gregório Pinheiro", initials: "GP", avatar: "/assets/ui-faces/male-1.jpg" },
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
    author: { name: "Gregório Pinheiro", initials: "GP", avatar: "/assets/ui-faces/male-1.jpg" },
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
    author: { name: "Gregório Pinheiro", initials: "GP", avatar: "/assets/ui-faces/male-1.jpg" },
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
    author: { name: "Gregório Pinheiro", initials: "GP", avatar: "/assets/ui-faces/male-1.jpg" },
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
    author: { name: "Bea Costa", initials: "BC", avatar: "/assets/ui-faces/female-1.jpg" },
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
    author: { name: "Carlos Sun", initials: "CS", avatar: "/assets/ui-faces/male-3.jpg" },
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
    author: { name: "Dani Rocha", initials: "DR", avatar: "/assets/ui-faces/female-2.jpg" },
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
    author: { name: "Eva Lima", initials: "EL", avatar: "/assets/ui-faces/female-4.jpg" },
    createdAt: "9 jan 2026, 17:20",
    knowledgeBase: "Fyntra | Data warehouse",
  },
];

export const ALL_AGENTES: Agent[] = [...MEUS_AGENTES, ...TODOS_OS_AGENTES];

export function getAgentById(id: string): Agent {
  const found = ALL_AGENTES.find((a) => a.id === id);
  if (found) return found;
  // Cópias criadas na listagem usam o id da origem + sufixo "-copia[-n]".
  // Resolver aqui (e não via localStorage) mantém a função pura — mesmo
  // resultado no servidor e no cliente, sem risco de hidratação divergente.
  const copia = id.match(/^(.*)-copia(?:-\d+)?$/);
  if (copia) {
    const origem = getAgentById(copia[1]);
    return {
      ...origem,
      id,
      title: `${origem.title} (cópia)`,
      status: "draft",
    };
  }
  return ALL_AGENTES[0];
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
    icon: "account_balance",
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
  // Visão geral aparece quando o agente é publicado pela primeira vez —
  // por enquanto fica na última posição da navegação.
  {
    id: "visao-geral",
    label: "Visão geral",
    icon: "dashboard",
    description: "Resumo de tudo que define este agente.",
  },
];

export function isEditorTabId(value: string | null): value is EditorTabId {
  return EDITOR_TABS.some((t) => t.id === value);
}

/* ─────────────────────────────────────────────────────────────────────────
 * Catálogo de habilidades
 *
 * Espelha o painel "Habilidades disponíveis" do editor de checkpoint: grupos
 * nativos (Agente, Fluxo, Contexto, AOPs) + integrações conectadas. Cada
 * habilidade tem um token namespaced (@agent.thinkOutLoud) que é o id usado
 * na serialização `@[id]` dos textos de checkpoint.
 * ───────────────────────────────────────────────────────────────────────── */

export type SkillTone = "teal" | "purple" | "amber" | "pink" | "blue";

/**
 * Classes literais por tom — Tailwind só gera o que enxerga no fonte.
 * `chip` veste menções inline; `tile` veste o quadradinho de ícone no painel.
 */
export const SKILL_TONE_CLASSES: Record<
  SkillTone,
  { chip: string; tile: string }
> = {
  teal: {
    chip: "bg-(--aw-teal-100) text-(--aw-teal-800)",
    tile: "bg-(--aw-teal-100) text-(--aw-teal-800)",
  },
  purple: {
    chip: "bg-(--aw-purple-100) text-(--aw-purple-800)",
    tile: "bg-(--aw-purple-100) text-(--aw-purple-800)",
  },
  amber: {
    chip: "bg-(--aw-amber-100) text-(--aw-amber-900)",
    tile: "bg-(--aw-amber-100) text-(--aw-amber-900)",
  },
  pink: {
    chip: "bg-(--aw-pink-100) text-(--aw-pink-800)",
    tile: "bg-(--aw-pink-100) text-(--aw-pink-800)",
  },
  blue: {
    chip: "bg-(--aw-blue-100) text-(--aw-blue-800)",
    tile: "bg-(--aw-blue-100) text-(--aw-blue-800)",
  },
};

export type HabilidadeConfigurada = {
  /** Token namespaced — também é o id serializado em `@[id]`. */
  id: string;
  nome: string;
  descricao: string;
  /** Id do grupo no catálogo (SKILL_GROUPS). */
  grupo: string;
  /** Material Symbol exibido no painel e no menu @. */
  icon?: string;
  /** Subgrupo opcional dentro do painel ("Usuário", "Conversa"…). */
  subgrupo?: string;
};

export type SkillGroup = {
  id: string;
  nome: string;
  descricao: string;
  /** Material Symbol do header do grupo. */
  icon: string;
  tone: SkillTone;
  /** Brand key do AwBrandLogo — presente apenas em grupos de integração. */
  brand?: string;
  skills: HabilidadeConfigurada[];
};

function skill(
  grupo: string,
  id: string,
  nome: string,
  descricao: string,
  icon: string,
  subgrupo?: string,
): HabilidadeConfigurada {
  return { id, nome, descricao, grupo, icon, subgrupo };
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: "agente",
    nome: "Agente",
    descricao: "Ações nativas do agente durante a conversa.",
    icon: "agent",
    tone: "teal",
    skills: [
      skill(
        "agente",
        "agent.thinkOutLoud",
        "Pensar em voz alta",
        "Raciocina internamente antes de responder ao usuário.",
        "graphic_eq",
      ),
      skill(
        "agente",
        "agent.searchKnowledge",
        "Consultar base de conhecimento",
        "Busca a resposta nas bases conectadas ao agente.",
        "account_balance",
      ),
      skill(
        "agente",
        "agent.loadUserData",
        "Carregar dados do usuário",
        "Puxa os dados do usuário das integrações conectadas.",
        "person_search",
      ),
      skill(
        "agente",
        "agent.memorize",
        "Memorizar",
        "Guarda uma informação da conversa na memória do agente.",
        "bookmark_add",
      ),
      skill(
        "agente",
        "agent.learn",
        "Aprender",
        "Registra um aprendizado para os próximos atendimentos.",
        "school",
      ),
      skill(
        "agente",
        "agent.mark",
        "Registrar marcação",
        "Marca uma das opções de classificação do checkpoint.",
        "rule",
      ),
      skill(
        "agente",
        "agent.updateStatus",
        "Atualizar status",
        "Atualiza o status do lead no fluxo e no CRM conectado.",
        "sync_alt",
      ),
      skill(
        "agente",
        "agent.handoffToHuman",
        "Transferir para humano",
        "Encaminha a conversa para um atendente humano.",
        "support_agent",
        "Colaboração e transferência",
      ),
      skill(
        "agente",
        "agent.handoffToAgent",
        "Transferir para outro agente",
        "Passa a conversa para outro agente com o contexto completo.",
        "swap_horiz",
        "Colaboração e transferência",
      ),
      skill(
        "agente",
        "agent.askAgent",
        "Consultar outro agente",
        "Pede apoio de outro agente sem transferir a conversa.",
        "forum",
        "Colaboração e transferência",
      ),
      skill(
        "agente",
        "agent.addToBlacklist",
        "Adicionar à lista negra",
        "Marca o contato para não receber novas abordagens.",
        "block",
        "Colaboração e transferência",
      ),
    ],
  },
  {
    id: "fluxo",
    nome: "Fluxo",
    descricao: "Controles de fluxo entre as etapas.",
    icon: "conversion_path",
    tone: "purple",
    skills: [
      skill(
        "fluxo",
        "flow.goTo",
        "Ir para etapa",
        "Redireciona a execução para outra etapa do checkpoint.",
        "arrow_forward",
      ),
      skill(
        "fluxo",
        "flow.waitForUser",
        "Aguardar resposta",
        "Pausa o fluxo até receber resposta do usuário.",
        "hourglass_empty",
      ),
      skill(
        "fluxo",
        "flow.wait",
        "Aguardar tempo",
        "Tempo de espera antes de prosseguir. Ideal para follow-ups.",
        "schedule",
      ),
      skill(
        "fluxo",
        "flow.endConversation",
        "Encerrar conversa",
        "Finaliza explicitamente a execução do agente.",
        "stop_circle",
      ),
    ],
  },
  {
    id: "google-calendar",
    nome: "Google Calendar",
    descricao: "Habilidades do Google Calendar disponíveis.",
    icon: "event",
    tone: "blue",
    brand: "googlecal",
    skills: [
      skill(
        "google-calendar",
        "googlecal.createEvent",
        "Criar evento",
        "Cria um evento na agenda conectada.",
        "event",
      ),
      skill(
        "google-calendar",
        "googlecal.checkAvailability",
        "Consultar disponibilidade",
        "Lista horários livres na agenda conectada.",
        "event_available",
      ),
    ],
  },
  {
    id: "pipedrive",
    nome: "Pipedrive",
    descricao: "Habilidades do Pipedrive disponíveis.",
    icon: "monitoring",
    tone: "blue",
    brand: "pipedrive",
    skills: [
      skill(
        "pipedrive",
        "pipedrive.updateDeal",
        "Atualizar negócio",
        "Atualiza o estágio do negócio no funil.",
        "monitoring",
      ),
      skill(
        "pipedrive",
        "pipedrive.logActivity",
        "Registrar atividade",
        "Registra a conversa como atividade no CRM.",
        "edit_note",
      ),
    ],
  },
];

/**
 * Grupo de habilidades derivado dos AOPs ativos do agente — cada protocolo
 * personalizado vira uma menção `@[aop.…]` disponível no editor.
 */
export function buildAopSkillGroup(aops: AgentAop[]): SkillGroup {
  return {
    id: "aops",
    nome: "AOPs",
    descricao: "Protocolos personalizados criados pela sua equipe.",
    icon: "description",
    tone: "pink",
    skills: aops
      .filter((a) => a.status === "ativo")
      .map((a) =>
        skill(
          "aops",
          `aop.${a.id.replace(/^aop-/, "")}`,
          a.nome,
          a.descricao,
          "description",
        ),
      ),
  };
}

/** Catálogo completo de um agente: grupos nativos + integrações + AOPs ativos. */
export function buildSkillGroups(aops: AgentAop[]): SkillGroup[] {
  const base = [...SKILL_GROUPS];
  const aopGroup = buildAopSkillGroup(aops);
  // AOPs entram depois de Fluxo, antes das integrações.
  base.splice(2, 0, aopGroup);
  return base;
}

/** Lista plana do catálogo base — resolve menções `@[id]` em qualquer texto. */
export const ALL_SKILLS: HabilidadeConfigurada[] = SKILL_GROUPS.flatMap(
  (g) => g.skills,
);

const SKILL_TONE_BY_GROUP: Record<string, SkillTone> = {
  agente: "teal",
  fluxo: "purple",
  aops: "pink",
};

const SKILL_GROUP_BY_ID = new Map(SKILL_GROUPS.map((g) => [g.id, g]));

export function getSkillGroup(grupoId: string): SkillGroup | undefined {
  return SKILL_GROUP_BY_ID.get(grupoId);
}

/** Tom (cor) de uma habilidade — herdado do grupo; integrações caem em blue. */
export function skillTone(hab: { grupo: string } | undefined): SkillTone {
  if (!hab) return "teal";
  return (
    SKILL_TONE_BY_GROUP[hab.grupo] ??
    SKILL_GROUP_BY_ID.get(hab.grupo)?.tone ??
    "blue"
  );
}

/** Grupos de integração têm brand (logo real) — os demais são nativos. */
export function isIntegrationGroup(grupoId: string): boolean {
  return Boolean(SKILL_GROUP_BY_ID.get(grupoId)?.brand);
}

/* ─────────────────────────────────────────────────────────────────────────
 * Dados estendidos do editor
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * Regra condicional do checkpoint — "Se [condição] então [ação]".
 * A condição é texto livre em linguagem natural (estilo procedures do
 * Intercom Fin); a ação é texto token-rich (`@[flow.goTo] Fechamento`).
 */
export type CheckpointRegra = {
  id: string;
  /** Condição em linguagem natural (aceita tokens e **negrito**). */
  se: string;
  /** Ação executada quando a condição bate (token-rich). */
  entao: string;
};

export type CheckpointMarqueOpcao = {
  texto: string;
  /** Ações encadeadas quando o agente marca esta opção (texto token-rich). */
  acoes?: string;
};

/**
 * Checkpoint — etapa do guia de execução do agente.
 *
 * O `corpo` é a instrução em LINGUAGEM NATURAL: texto livre, multiline, com
 * tokens inline. Todos os campos de texto aceitam:
 *   - `@[id]`      → menção a uma tool/AOP do catálogo (ALL_SKILLS)
 *   - `{{nome}}`   → variável ou dado de contexto
 *   - `**texto**`  → negrito · `*texto*` → itálico
 *
 * As habilidades exibidas no card e no diagrama são DERIVADAS das menções `@[…]`
 * presentes no texto — não existe campo `habilidades` armazenado.
 * Helpers de parse/derivação: components/agent-studio/editor/checkpointTokens.ts.
 */
export type Checkpoint = {
  id: string;
  numero: number;
  titulo: string;
  objetivo: string;
  /** Instruções em linguagem natural — parágrafos livres com tokens inline. */
  corpo: string;
  /** Bloco de marcação — o agente classifica a resposta do lead. */
  marque?: {
    /** Verbo do chip ("Marque" classifica; "Escolha" seleciona abordagem). */
    verbo?: "Marque" | "Escolha";
    rotulo: string;
    opcoes: CheckpointMarqueOpcao[];
  };
  /** Regras condicionais avaliadas ao fim do checkpoint. */
  regras?: CheckpointRegra[];
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
  autor: { name: string; initials: string; avatar?: string };
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
  /** Agrupa o menu {{ — "Personalizadas" (default), "Lead", "Conversa". */
  grupo?: string;
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
    corpo: `Analise o histórico do usuário e capture o tom das primeiras palavras antes de responder.
Agradeça pelo interesse demonstrado do {{lead_name}} e recupere o contexto com @[agent.loadUserData] antes da primeira mensagem.
Pergunte se ainda tem interesse em receber o adiantamento enquanto o processo segue — tom consultivo, nunca invasivo.`,
    marque: {
      rotulo: "a Resposta Inicial do Lead",
      opcoes: [
        { texto: "**Receptivo:** demonstra interesse, responde positivamente" },
        { texto: "**Neutro:** responde, mas sem entusiasmo claro" },
        { texto: "**Resistente:** demonstra pressa ou desinteresse" },
        { texto: "Sem resposta inicial" },
      ],
    },
  },
  {
    id: "cp-2",
    numero: 2,
    titulo: "Descoberta do Motivo da Não-Ação",
    objetivo: "Entender genuinamente por que não agendou após ser aprovado.",
    corpo: `Use o tom {{conversation.voiceTone}} **natural e empático** na abordagem de descoberta:
*"Vi que você demonstrou interesse, mas não chegou a agendar a reunião. Aconteceu alguma coisa? Surgiu alguma dúvida que posso esclarecer?"*`,
    marque: {
      rotulo: "o Motivo Principal Identificado",
      opcoes: [
        { texto: '**Agenda/Tempo:** "Estou sem tempo", "Agenda complicada"' },
        {
          texto:
            '**Dúvida sobre valor:** "Não sei se é para mim", "Preciso entender melhor"',
        },
        {
          texto:
            '**Questão financeira:** "Preciso ver valores primeiro", "Momento financeiro"',
        },
        { texto: '**Aprovação:** "Preciso falar com sócio/equipe"' },
        {
          texto:
            '**Prioridades:** "Não é prioridade agora", "Tenho outras urgências"',
        },
        { texto: '**Esquecimento:** "Acabei esquecendo", "Passou batido"' },
        { texto: "Outro" },
      ],
    },
    regras: [
      {
        id: "r-cp2-outro",
        se: "o motivo identificado for **Outro**",
        entao: "@[agent.memorize] o motivo relatado pelo lead",
      },
    ],
  },
  {
    id: "cp-3",
    numero: 3,
    titulo: "Quebra de Objeções Inicial",
    objetivo:
      "Tentar quebrar a objeção inicial com elementos da base de conhecimento.",
    corpo:
      "Responda a objeção consultando @[agent.searchKnowledge] antes de argumentar — nunca improvise dados.",
    marque: {
      rotulo: "a Resposta à Quebra Inicial",
      opcoes: [{ texto: "Convencido" }, { texto: "Ainda resistente" }],
    },
    regras: [
      {
        id: "r-cp3-convencido",
        se: "o lead estiver **convencido**",
        entao: "@[flow.goTo] Fechamento",
      },
      {
        id: "r-cp3-resistente",
        se: "o lead seguir **resistente**",
        entao: "@[flow.goTo] Etapa 04",
      },
    ],
  },
  {
    id: "cp-4",
    numero: 4,
    titulo: "Descoberta da Motivação Inicial",
    objetivo:
      "Reconectar com o interesse inicial que levou ao preenchimento do formulário.",
    corpo: `Se ainda houver interesse, faça a pergunta de reconexão:
*"Me ajuda a entender: o que especificamente te fez se interessar pela Fyntra?"*
@[agent.learn] a dor central verbalizada pelo usuário.`,
  },
  {
    id: "cp-5",
    numero: 5,
    titulo: "Demonstração de Valor com Cases",
    objetivo: "Conectar a dor específica com um case relevante da Fyntra.",
    corpo:
      "Use @[aop.cases] e escolha o case que mais se adapta ao perfil do cliente.",
  },
  {
    id: "cp-6",
    numero: 6,
    titulo: "Criação de Urgência",
    objetivo:
      "Conectar o problema a uma consequência negativa real para criar urgência.",
    corpo:
      "Conecte o problema do lead a uma consequência concreta de não agir agora.",
    marque: {
      verbo: "Escolha",
      rotulo: "um ângulo para focar",
      opcoes: [
        {
          texto:
            '**Custo do tempo perdido:** "E enquanto você não resolve isso, quanto tempo mais você acha que vai levar para ter seus primeiros resultados?"',
        },
        {
          texto:
            '**Custo da oportunidade perdida:** "Enquanto isso, outras pessoas estão conseguindo adiantamentos para cobrir suas contas. Você sente que está ficando para trás?"',
        },
        {
          texto:
            '**Custo da frustração:** "Esse sentimento de estar travado não é frustrante? O risco não é acabar desistindo do seu objetivo?"',
        },
        {
          texto:
            "**Consequência negativa verbalizada:** o que o lead perde ao não agir?",
        },
      ],
    },
  },
  {
    id: "cp-7",
    numero: 7,
    titulo: "Call to Action e Agendamento",
    objetivo: "Converter o interesse em compromisso concreto com a reunião.",
    corpo: `Use o tom {{conversation.voiceTone}} **natural e empático** na abordagem de fechamento:
*"{{lead_name}}, baseado no que conversamos — seu desafio com pressão financeira durante o processo e como pessoas em casos similares conseguiram adiantamentos de até US$ 50.000 sem risco — faz sentido separarmos 15 minutos para você ver exatamente como isso funciona no seu caso?"*`,
    marque: {
      rotulo: "o Status do CTA",
      opcoes: [
        {
          texto: "Aceito",
          acoes: '@[googlecal.createEvent] + @[agent.updateStatus] para "agendado".',
        },
        {
          texto: "Hesitante",
          acoes: "Reforçar valor + @[flow.waitForUser]",
        },
        {
          texto: "Recusado",
          acoes: "@[agent.thinkOutLoud] + faça uma última tentativa",
        },
        {
          texto: "Situação complexa",
          acoes: "@[agent.handoffToHuman]",
        },
      ],
    },
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

/* Autores mock do workspace — os mesmos usuários (e fotos) do AwSidebar. */
const PESSOA_GREG = {
  name: "Gregório Pinheiro",
  initials: "GP",
  avatar: "/assets/users/greg.jpg",
};
const PESSOA_GABRIEL = {
  name: "Gabriel Lima",
  initials: "GL",
  avatar: "/assets/users/gabriel_lima.jpg",
};
const PESSOA_JOSE = {
  name: "José Almeida",
  initials: "JA",
  avatar: "/assets/users/jose.jpg",
};

const HISTORICO_PADRAO: HistoryDay[] = [
  {
    data: "10 fev 2026",
    entradas: [
      {
        id: "h-1",
        autor: PESSOA_JOSE,
        acao: "Alterou o Checkpoint 02 — Descoberta do Motivo da Não-Ação.",
        quando: "5 min atrás",
      },
      {
        id: "h-2",
        autor: PESSOA_GABRIEL,
        acao: "Alterou a base de conhecimento para “Políticas oficiais”.",
        quando: "45 min atrás",
      },
      {
        id: "h-3",
        autor: PESSOA_GREG,
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
        autor: PESSOA_GREG,
        acao: "Ativou o AOP Análise de Risco do Usuário.",
        quando: "18:47",
      },
      {
        id: "h-5",
        autor: PESSOA_GABRIEL,
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
        autor: PESSOA_GREG,
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
    grupo: "Personalizadas",
  },
  {
    nome: "{{lead_name}}",
    tipo: "Texto",
    descricao: "Primeiro nome do lead em atendimento.",
    grupo: "Personalizadas",
  },
  {
    nome: "{{lead_phone}}",
    tipo: "Telefone",
    descricao: "Telefone principal do lead.",
    grupo: "Personalizadas",
  },
  {
    nome: "{{company_name}}",
    tipo: "Texto",
    descricao: "Nome da empresa exibido nas mensagens.",
    grupo: "Personalizadas",
  },
];

/**
 * Dados de contexto lidos em tempo real — entram no menu {{ junto com as
 * variáveis do agente. São leitura (o canal/conversa preenche), não config.
 */
export const CONTEXT_VARIABLES: AgentVariable[] = [
  {
    nome: "{{user.email}}",
    tipo: "Texto",
    descricao: "E-mail principal do usuário identificado.",
    grupo: "Lead",
  },
  {
    nome: "{{user.language}}",
    tipo: "Texto",
    descricao: "Idioma detectado nas mensagens.",
    grupo: "Lead",
  },
  {
    nome: "{{user.timezone}}",
    tipo: "Texto",
    descricao: "Fuso horário estimado do usuário.",
    grupo: "Lead",
  },
  {
    nome: "{{user.lastMessageAt}}",
    tipo: "Data",
    descricao: "Momento da última mensagem recebida.",
    grupo: "Lead",
  },
  {
    nome: "{{conversation.goal}}",
    tipo: "Texto",
    descricao: "Objetivo ativo da conversa neste momento.",
    grupo: "Conversa",
  },
  {
    nome: "{{conversation.voiceTone}}",
    tipo: "Texto",
    descricao: "Tom de comunicação configurado para o agente.",
    grupo: "Conversa",
  },
  {
    nome: "{{conversation.step}}",
    tipo: "Texto",
    descricao: "Etapa atual do fluxo dentro do checkpoint.",
    grupo: "Conversa",
  },
  {
    nome: "{{conversation.lastIntent}}",
    tipo: "Texto",
    descricao: "Intenção mais recente identificada no input do usuário.",
    grupo: "Conversa",
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
  const habilidades = [
    ...ALL_SKILLS,
    ...buildAopSkillGroup(AOPS_PADRAO).skills,
  ];

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
    habilidadesConfiguradas: habilidades,
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
