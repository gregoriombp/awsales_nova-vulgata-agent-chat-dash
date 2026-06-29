/**
 * Conversas — monitoramento em tempo real das conversas entre os usuários das
 * empresas (leads/clientes) e os Agentes da AwSales.
 *
 * Fonte única consumida pela rota /conversations: a lista (coluna esquerda), a
 * thread (centro) e o painel de detalhes (direita). Em produção isto vem do
 * Execution Engine + Cortex; aqui o shape é o contrato.
 *
 * A peça central é o RACIOCÍNIO: toda resposta do agente carrega a sua linha de
 * pensamento (`thinking`) — os passos, as fontes consultadas e as decisões que
 * levaram à resposta. É isso que esta tela expõe em tempo real.
 */

import { agentCoreSrc } from "@/components/ui/AwAgentCore";
import { getOrbForAgent } from "@/lib/agentOrbs";
import type { AwChannelId } from "@/components/ui/AwChannelIcon";

/* ─────────────────────────────────────────────────────────────────────────
 * Raciocínio do agente
 * ───────────────────────────────────────────────────────────────────────── */

/** Cores aceitas pelas badges de fonte (espelha o BadgeColor do kit Fluid). */
export type SourceColor =
  | "gray"
  | "blue"
  | "emerald"
  | "teal"
  | "amber"
  | "purple"
  | "pink"
  | "lime"
  | "red"
  | "slate";

export type ReasoningSource = {
  label: string;
  color?: SourceColor;
};

/** Um passo da linha de pensamento — o que o agente fez antes de responder. */
export type ReasoningStep = {
  /** Glyph Material Symbols. Omitido → marcador de ponto. */
  icon?: string;
  label: string;
  description?: string;
  /** Fontes consultadas neste passo (CRM, Memory Base, integração…). */
  sources?: ReasoningSource[];
  /** Bloco "ver detalhes" — regras/trechos que o passo abriu. */
  details?: { summary: string; items: string[] };
};

/* ─────────────────────────────────────────────────────────────────────────
 * Mensagens
 * ───────────────────────────────────────────────────────────────────────── */

export type MessageRole = "lead" | "agent" | "human";

export type Message = {
  id: string;
  role: MessageRole;
  text: string;
  /** Hora curta exibida no balão (ex.: "14:32"). */
  time: string;
  /** Para `role: "human"` — quem assumiu a conversa. */
  author?: string;
  /** Raciocínio que precede a resposta do agente. */
  thinking?: ReasoningStep[];
  /** Fontes citadas no rodapé da resposta (grounding). */
  sources?: { label: string; kind?: "document" | "qa" | "knowledge" | "web" | "integration"; detail?: string }[];
};

/** Turno que ainda vai acontecer: o agente raciocina e responde ao vivo. */
export type PendingTurn = {
  thinking: ReasoningStep[];
  answer: string;
  time: string;
  sources?: Message["sources"];
};

/* ─────────────────────────────────────────────────────────────────────────
 * Conversa
 * ───────────────────────────────────────────────────────────────────────── */

/** active = agente conduzindo · handoff = humano assumiu · waiting = aguarda o
 *  lead · resolved = encerrada pelo agente. */
export type ConversationStatus = "active" | "handoff" | "waiting" | "resolved";

export type ConversationAgent = {
  id: string;
  name: string;
  /** Agente Core (framework) que o agente roda. */
  coreName: string;
  coreSrc: string;
  /** Objetivo do agente nesta conversa. */
  objective: string;
};

export type Conversation = {
  id: string;
  lead: {
    name: string;
    company?: string;
    initials: string;
    avatar?: string;
    location?: string;
    email?: string;
    phone?: string;
  };
  channel: AwChannelId;
  agent: ConversationAgent;
  status: ConversationStatus;
  /** Checkpoint atual da Natural Logic Board. */
  checkpoint: string;
  /** Etiqueta curta do assunto (ex.: "Dúvida de preço"). */
  topic: string;
  preview: string;
  lastActivity: string;
  unread?: number;
  sentiment?: "positive" | "neutral" | "negative";
  /** Score qualitativo da condução, como no Figma. */
  quality?: { label: string; value: number };
  /** Latências de raciocínio da última resposta (ms). */
  latency?: { reasoning: number; actions: number; decision: number };
  messages: Message[];
  /** Quando presente, o agente está gerando a próxima resposta ao vivo. */
  pendingTurn?: PendingTurn;
};

export const CHANNEL_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  messenger: "Messenger",
  telegram: "Telegram",
  email: "E-mail",
  slack: "Slack",
};

export const STATUS_META: Record<
  ConversationStatus,
  { label: string; pill: "live" | "warning" | "neutral" | "info"; dot: "live" | "attention" | "offline" | "info" }
> = {
  active: { label: "Agente ativo", pill: "live", dot: "live" },
  handoff: { label: "Com humano", pill: "warning", dot: "attention" },
  waiting: { label: "Aguardando lead", pill: "info", dot: "info" },
  resolved: { label: "Resolvida", pill: "neutral", dot: "offline" },
};

/* ─────────────────────────────────────────────────────────────────────────
 * Agentes (mock) — três agentes conduzindo a operação
 * ───────────────────────────────────────────────────────────────────────── */

const AGENT_SALES: ConversationAgent = {
  id: "sales",
  name: "Agente de vendas",
  coreName: "Closer Pro",
  coreSrc: agentCoreSrc(7),
  objective: "Qualificar o lead e agendar uma demonstração",
};

const AGENT_RECOVERY: ConversationAgent = {
  id: "leads-recovery",
  name: "Agente de recuperação",
  coreName: "Meeting Recovery",
  coreSrc: agentCoreSrc(3),
  objective: "Reengajar leads que pararam de responder",
};

const AGENT_SUPPORT: ConversationAgent = {
  id: "customer-support",
  name: "Agente de suporte",
  coreName: "Empathy Core",
  coreSrc: agentCoreSrc(12),
  objective: "Resolver tickets de nível 1 e escalar quando preciso",
};

/** Orb estático do agente (PNG) — usado em listas densas, sem WebGL. */
export const agentOrb = (agentId: string) => getOrbForAgent(agentId);

/* ─────────────────────────────────────────────────────────────────────────
 * Conversas (mock)
 * ───────────────────────────────────────────────────────────────────────── */

export const CONVERSATIONS: Conversation[] = [
  // 1 — AO VIVO: agente raciocinando e respondendo agora.
  {
    id: "brook-taylor",
    lead: {
      name: "Brook Taylor",
      company: "SL Mobbin",
      initials: "BT",
      avatar: "/assets/ui-faces/female-4.jpg",
      location: "Lisboa, Portugal",
      email: "brook@slmobbin.com",
      phone: "+351 912 004 118",
    },
    channel: "whatsapp",
    agent: AGENT_SALES,
    status: "active",
    checkpoint: "Qualificação · entender necessidade",
    topic: "Dúvida de preço",
    preview: "Faz sentido. E quanto custa pra um time de 12 pessoas?",
    lastActivity: "agora",
    unread: 2,
    sentiment: "positive",
    quality: { label: "Excelente", value: 94 },
    latency: { reasoning: 1720, actions: 1420, decision: 1820 },
    messages: [
      {
        id: "m1",
        role: "lead",
        text: "Oi! Conheci a Aswork agora há pouco. O que vocês fazem exatamente?",
        time: "14:28",
      },
      {
        id: "m2",
        role: "agent",
        text: "Oi, Brook! A Aswork monta agentes de IA que conduzem vendas e atendimento de ponta a ponta — qualificam o lead, respondem na hora e executam ações reais (agendam, cobram, atualizam o CRM). Você está olhando pra vendas, suporte, ou os dois?",
        time: "14:28",
        thinking: [
          {
            icon: "person_search",
            label: "Recuperando o contexto do lead",
            description: "Primeiro contato, origem WhatsApp",
            sources: [
              { label: "CRM", color: "blue" },
              { label: "Memory Base", color: "emerald" },
            ],
          },
          {
            icon: "flag",
            label: "Identificando a etapa do funil",
            description: "Topo de funil — descoberta",
          },
          {
            icon: "edit",
            label: "Escrevendo a resposta",
            description: "Explicar o produto e qualificar a intenção",
          },
        ],
        sources: [
          { label: "Visão geral da Aswork", kind: "knowledge", detail: "Memory Base" },
        ],
      },
      {
        id: "m3",
        role: "lead",
        text: "Os dois, mas começando por vendas. Hoje a gente perde muito lead que chega de madrugada e ninguém responde.",
        time: "14:30",
      },
      {
        id: "m4",
        role: "agent",
        text: "Esse é exatamente o caso onde o agente mais paga por si: ele responde em segundos, 24/7, e só te passa o lead quando ele está pronto pra conversar com um humano. Times parecidos recuperaram entre 20% e 30% dos leads que antes esfriavam fora do horário. Quantos leads novos vocês recebem por mês, mais ou menos?",
        time: "14:31",
        thinking: [
          {
            icon: "history",
            label: "Lendo o histórico da conversa",
            description: "Dor declarada: leads fora do horário comercial",
          },
          {
            icon: "menu_book",
            label: "Buscando prova social do segmento",
            sources: [
              { label: "Cases", color: "purple" },
              { label: "Playbook comercial", color: "teal" },
            ],
            details: {
              summary: "2 referências aplicáveis",
              items: [
                "Recuperação média de 20–30% de leads fora do horário",
                "Resposta em < 30s aumenta conversão em ~2x",
              ],
            },
          },
          {
            icon: "trending_up",
            label: "Ancorando em valor, não em desconto",
            description: "Diretriz do objetivo: vender resultado",
          },
          {
            icon: "edit",
            label: "Escrevendo a resposta",
            description: "Reforçar o ganho e pedir o volume de leads",
          },
        ],
        sources: [
          { label: "Case · recuperação fora do horário", kind: "qa", detail: "Cases" },
          { label: "Playbook comercial", kind: "document", detail: "p. 14" },
        ],
      },
      {
        id: "m5",
        role: "lead",
        text: "Faz sentido. E quanto custa pra um time de 12 pessoas?",
        time: "agora",
      },
    ],
    pendingTurn: {
      time: "agora",
      thinking: [
        {
          icon: "person_search",
          label: "Recuperando o contexto do lead",
          description: "SL Mobbin · time de 12 · interesse em vendas",
          sources: [
            { label: "CRM", color: "blue" },
            { label: "Memory Base", color: "emerald" },
          ],
        },
        {
          icon: "payments",
          label: "Consultando a política de preços",
          sources: [{ label: "Tabela 2026", color: "amber" }],
          details: {
            summary: "3 regras aplicáveis",
            items: [
              "Preço por conversa resolvida, não por assento",
              "Onboarding incluído no plano Growth",
              "Desconto só com aprovação acima de 10%",
            ],
          },
        },
        {
          icon: "rule",
          label: "Avaliando o checkpoint atual",
          description: "Qualificação ainda aberta — confirmar volume antes do preço",
        },
        {
          icon: "edit",
          label: "Escrevendo a resposta",
          description: "Dar a faixa e amarrar ao volume de leads",
        },
      ],
      answer:
        "Boa pergunta — e a parte boa é que você não paga por assento. O preço acompanha o volume de conversas que o agente resolve, então um time de 12 não muda a conta: o que pesa é quantos leads ele atende. Pra te passar um número certeiro, me diz a faixa de leads novos por mês? Com isso eu já te mostro a faixa do plano Growth, com onboarding incluído.",
      sources: [
        { label: "Tabela de preços 2026", kind: "document", detail: "Plano Growth" },
        { label: "Política comercial", kind: "knowledge", detail: "Memory Base" },
      ],
    },
  },

  // 2 — AO VIVO (em lista): recuperação de carrinho.
  {
    id: "marina-alves",
    lead: {
      name: "Marina Alves",
      company: "Fyntra",
      initials: "MA",
      avatar: "/assets/ui-faces/female-2.jpg",
      location: "São Paulo, BR",
      email: "marina.alves@gmail.com",
    },
    channel: "instagram",
    agent: AGENT_RECOVERY,
    status: "active",
    checkpoint: "Reengajamento · quebrar objeção",
    topic: "Carrinho abandonado",
    preview: "Ainda dá tempo de garantir a condição de ontem?",
    lastActivity: "1 min",
    unread: 1,
    sentiment: "neutral",
    quality: { label: "Excelente", value: 91 },
    latency: { reasoning: 1540, actions: 980, decision: 1610 },
    messages: [
      {
        id: "m1",
        role: "agent",
        text: "Oi, Marina! Vi que você chegou a montar o pedido ontem mas não finalizou. Ficou alguma dúvida que eu possa resolver agora?",
        time: "11:02",
        thinking: [
          {
            icon: "bolt",
            label: "Disparado por gatilho",
            description: "Evento: carrinho_abandonado (18h)",
            sources: [{ label: "Stripe", color: "purple" }],
          },
          {
            icon: "schedule",
            label: "Checando a janela de envio",
            description: "Dentro do horário permitido (08:00–22:00)",
          },
          {
            icon: "edit",
            label: "Abrindo com contexto, sem pressionar",
          },
        ],
      },
      {
        id: "m2",
        role: "lead",
        text: "Oi! É que achei o frete um pouco caro na hora de fechar.",
        time: "11:05",
      },
    ],
    pendingTurn: {
      time: "agora",
      thinking: [
        {
          icon: "sell",
          label: "Classificando a objeção",
          description: "Objeção de preço — frete",
        },
        {
          icon: "menu_book",
          label: "Consultando a política de frete",
          sources: [{ label: "Regras de frete", color: "teal" }],
          details: {
            summary: "1 regra aplicável",
            items: ["Frete grátis acima de R$ 300 — pedido está em R$ 268"],
          },
        },
        {
          icon: "lightbulb",
          label: "Buscando o caminho de menor atrito",
          description: "Faltam R$ 32 pro frete grátis",
        },
        {
          icon: "edit",
          label: "Escrevendo a resposta",
        },
      ],
      answer:
        "Te entendo — e dá pra resolver isso fácil. Seu pedido está em R$ 268 e o frete sai de graça a partir de R$ 300. Se você incluir mais um item (tem refil por R$ 39, que é o que a maioria leva junto), o frete zera e no fim sai mais barato que pagar a entrega. Quer que eu já deixe o carrinho pronto assim pra você?",
      sources: [{ label: "Regras de frete", kind: "knowledge", detail: "Memory Base" }],
    },
  },

  // 3 — HANDOFF: humano assumiu um caso de reembolso.
  {
    id: "carlos-mendes",
    lead: {
      name: "Carlos Mendes",
      company: "Grupo Vitru",
      initials: "CM",
      avatar: "/assets/ui-faces/male-3.jpg",
      location: "Belo Horizonte, BR",
      email: "carlos.mendes@vitru.com",
    },
    channel: "email",
    agent: AGENT_SUPPORT,
    status: "handoff",
    checkpoint: "Transferência para humano",
    topic: "Reembolso",
    preview: "Você: Oi Carlos, sou a Ana do time. Já estou com o seu caso aqui.",
    lastActivity: "8 min",
    sentiment: "negative",
    quality: { label: "Média", value: 68 },
    latency: { reasoning: 1980, actions: 1310, decision: 2040 },
    messages: [
      {
        id: "m1",
        role: "lead",
        text: "Pedi o reembolso há 9 dias e até agora nada. Já é a terceira vez que eu cobro. Isso é inaceitável.",
        time: "09:12",
      },
      {
        id: "m2",
        role: "agent",
        text: "Carlos, sinto muito pela demora — isso não deveria ter acontecido. Vejo aqui que o seu reembolso foi aberto no dia 18 e está parado em análise. Esse caso passa do que eu resolvo sozinho, então vou te colocar agora com uma pessoa do time pra destravar isso ainda hoje.",
        time: "09:13",
        thinking: [
          {
            icon: "sentiment_dissatisfied",
            label: "Lendo o tom do cliente",
            description: "Frustração alta, terceiro contato",
          },
          {
            icon: "integration_instructions",
            label: "Conferindo o status do reembolso",
            sources: [{ label: "ERP", color: "blue" }],
            details: {
              summary: "Reembolso #48213",
              items: ["Aberto há 9 dias", "Parado em análise financeira"],
            },
          },
          {
            icon: "rule",
            label: "Avaliando a política de escalonamento",
            description: "Reembolso > 7 dias + cliente irritado → handoff humano",
          },
          {
            icon: "support_agent",
            label: "Acionando a transferência para humano",
          },
        ],
        sources: [{ label: "Política de reembolso", kind: "document", detail: "§ 4" }],
      },
      {
        id: "m3",
        role: "human",
        author: "Ana Ribeiro",
        text: "Oi Carlos, sou a Ana do time. Já estou com o seu caso aqui e acionei o financeiro em prioridade. Te dou um retorno com prazo ainda hoje, combinado?",
        time: "09:21",
      },
    ],
  },

  // 4 — RESOLVIDA: demo agendada com sucesso.
  {
    id: "julia-ferreira",
    lead: {
      name: "Júlia Ferreira",
      company: "StartSe",
      initials: "JF",
      avatar: "/assets/ui-faces/female-7.jpg",
      location: "Florianópolis, BR",
      email: "julia@startse.com",
    },
    channel: "whatsapp",
    agent: AGENT_SALES,
    status: "resolved",
    checkpoint: "Conversão · demo agendada",
    topic: "Agendamento de demo",
    preview: "Fechado, quinta às 15h então. Obrigada!",
    lastActivity: "2 h",
    sentiment: "positive",
    quality: { label: "Excelente", value: 96 },
    latency: { reasoning: 1380, actions: 1120, decision: 1450 },
    messages: [
      {
        id: "m1",
        role: "lead",
        text: "Topo, quero ver funcionando. Como faço pra marcar uma demo?",
        time: "12:40",
      },
      {
        id: "m2",
        role: "agent",
        text: "Perfeito! Consigo te encaixar essa semana. Tenho quinta às 15h ou sexta às 10h — qual fica melhor pra você?",
        time: "12:40",
        thinking: [
          {
            icon: "event_available",
            label: "Consultando a agenda do time",
            sources: [{ label: "Google Calendar", color: "blue" }],
          },
          {
            icon: "edit",
            label: "Oferecendo dois horários objetivos",
          },
        ],
      },
      {
        id: "m3",
        role: "lead",
        text: "Quinta às 15h é ótimo.",
        time: "12:42",
      },
      {
        id: "m4",
        role: "agent",
        text: "Agendado! Reservei quinta, 15h, e te mandei o convite por e-mail com o link da call. Qualquer imprevisto é só me chamar por aqui que eu remarco.",
        time: "12:42",
        thinking: [
          {
            icon: "bookmark_added",
            label: "Criando o evento e o convite",
            sources: [{ label: "Google Calendar", color: "blue" }],
            details: {
              summary: "Evento criado",
              items: ["Demo Aswork · qui 15h", "Convite enviado para julia@startse.com"],
            },
          },
          {
            icon: "task_alt",
            label: "Confirmando o fechamento do checkpoint",
            description: "Objetivo atingido — demo agendada",
          },
        ],
        sources: [{ label: "Agenda do time", kind: "integration", detail: "Google Calendar" }],
      },
      {
        id: "m5",
        role: "lead",
        text: "Fechado, quinta às 15h então. Obrigada!",
        time: "12:43",
      },
    ],
  },

  // 5 — AGUARDANDO: lead ainda não respondeu ao follow-up.
  {
    id: "pedro-santos",
    lead: {
      name: "Pedro Santos",
      company: "Tambasa",
      initials: "PS",
      avatar: "/assets/ui-faces/male-8.jpg",
      location: "Curitiba, BR",
      email: "pedro.santos@tambasa.com",
    },
    channel: "messenger",
    agent: AGENT_SUPPORT,
    status: "waiting",
    checkpoint: "Aguardando retorno do lead",
    topic: "Integração com o catálogo",
    preview: "Te mandei o passo a passo. Conseguiu testar a sincronização?",
    lastActivity: "1 d",
    sentiment: "neutral",
    quality: { label: "Excelente", value: 89 },
    latency: { reasoning: 1610, actions: 1240, decision: 1700 },
    messages: [
      {
        id: "m1",
        role: "lead",
        text: "A sincronização do catálogo não tá puxando os preços novos. O que pode ser?",
        time: "ontem 16:50",
      },
      {
        id: "m2",
        role: "agent",
        text: "Na maioria das vezes é a frequência de sincronização — ela roda a cada 6h por padrão. Dá pra forçar uma sincronização manual em Integrações › Catálogo › Sincronizar agora. Te mandei o passo a passo com print. Conseguiu testar?",
        time: "ontem 16:52",
        thinking: [
          {
            icon: "troubleshoot",
            label: "Reproduzindo o cenário descrito",
            description: "Preços desatualizados no catálogo",
          },
          {
            icon: "auto_stories",
            label: "Buscando na central de ajuda",
            sources: [{ label: "Central de ajuda", color: "emerald" }],
            details: {
              summary: "Causa mais provável",
              items: ["Sincronização automática roda a cada 6h", "Sincronização manual força a atualização"],
            },
          },
          {
            icon: "edit",
            label: "Escrevendo o passo a passo",
          },
        ],
        sources: [{ label: "Sincronização de catálogo", kind: "document", detail: "Central de ajuda" }],
      },
    ],
  },
];

export const getConversation = (id: string) =>
  CONVERSATIONS.find((c) => c.id === id);
