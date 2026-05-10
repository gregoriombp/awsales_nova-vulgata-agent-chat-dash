/**
 * Shared sample data + types for the Equipe & permissões pages.
 * Lives under `_components/` so Next.js does not treat the folder as a route.
 */

export type Role = "Owner" | "Admin" | "Operador" | "Viewer";

export type Capability = {
  id: string;
  label: string;
  description: string;
};

export type Integration = {
  id: string;
  name: string;
  icon: string;
};

export type ActivityEntry = {
  time: string;
  description: string;
};

export type Member = {
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
  avatar?: string;
  isYou?: boolean;
  lastActive: string;
  joinedAt: string;
  permissions: string[];
  integrations: string[];
  activity: ActivityEntry[];
};

export type Invitation = {
  id: string;
  email: string;
  role: Role;
  initials: string;
  sentAt: string;
};

export type Group = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  icon: string;
  roles: Role[];
};

export type RoleDefinition = {
  id: string;
  name: Role;
  description: string;
  memberCount: number;
  capabilities: string[];
  isSystem: boolean;
};

export const ROLE_OPTIONS: Role[] = ["Owner", "Admin", "Operador", "Viewer"];

export const PROJECT_OPTIONS = [
  "Vendas — WhatsApp",
  "Atendimento — Instagram",
  "Onboarding — Site",
  "Pós-venda",
];

export const CAPABILITIES: Capability[] = [
  {
    id: "agents.write",
    label: "Criar e editar agentes",
    description: "Pode publicar mudanças em agentes ativos.",
  },
  {
    id: "approvals",
    label: "Aprovar ações sensíveis",
    description: "Recebe e responde aprovações em tempo real.",
  },
  {
    id: "data.sensitive",
    label: "Ver dados financeiros",
    description: "Acessa pedidos, valores e métricas de receita.",
  },
  {
    id: "integrations.connect",
    label: "Conectar integrações",
    description: "Liga e desliga canais e ferramentas externas.",
  },
  {
    id: "members.invite",
    label: "Convidar membros",
    description: "Envia convites e gerencia funções.",
  },
  {
    id: "billing",
    label: "Faturamento e plano",
    description: "Atualiza cartão, troca plano e baixa faturas.",
  },
];

export const INTEGRATIONS: Integration[] = [
  { id: "whatsapp", name: "WhatsApp Business", icon: "chat" },
  { id: "instagram", name: "Instagram Direct", icon: "photo_camera" },
  { id: "checkout", name: "Custom Checkout", icon: "shopping_cart" },
];

export const MEMBERS: Member[] = [
  {
    id: "u-1",
    name: "Gregório Pinheiro",
    email: "greg@awsales.io",
    role: "Owner",
    initials: "GP",
    avatar: "/assets/users/greg.jpg",
    isYou: true,
    lastActive: "agora mesmo",
    joinedAt: "12 jan 2026",
    permissions: CAPABILITIES.map((c) => c.id),
    integrations: ["whatsapp", "instagram", "checkout"],
    activity: [
      { time: "há 2h", description: "Atualizou o agente \"Marina\"." },
      { time: "há 1d", description: "Convidou pedro.rocha@awsales.io." },
      { time: "há 3d", description: "Aprovou ação \"Reembolso de R$ 240\"." },
    ],
  },
  {
    id: "u-2",
    name: "Gabriel Lima",
    email: "gabriel@awsales.io",
    role: "Admin",
    initials: "GL",
    avatar: "/assets/users/gabriel_lima.jpg",
    lastActive: "há 14 minutos",
    joinedAt: "03 fev 2026",
    permissions: [
      "agents.write",
      "approvals",
      "data.sensitive",
      "integrations.connect",
      "members.invite",
    ],
    integrations: ["whatsapp", "instagram"],
    activity: [
      { time: "há 14min", description: "Aprovou troca de status de pedido." },
      { time: "há 1d", description: "Conectou nova conta Instagram." },
      { time: "há 4d", description: "Editou playbook de atendimento." },
    ],
  },
  {
    id: "u-3",
    name: "José Júnior",
    email: "jose@awsales.io",
    role: "Operador",
    initials: "JJ",
    avatar: "/assets/users/jose.jpg",
    lastActive: "há 3 horas",
    joinedAt: "21 fev 2026",
    permissions: ["agents.write", "approvals", "integrations.connect"],
    integrations: ["whatsapp"],
    activity: [
      { time: "há 3h", description: "Encerrou conversa com cliente VIP." },
      { time: "há 2d", description: "Marcou template como aprovado." },
      { time: "há 5d", description: "Subiu nova base de conhecimento." },
    ],
  },
];

export const INVITATIONS: Invitation[] = [
  {
    id: "i-1",
    email: "marina@cliente.com",
    role: "Viewer",
    initials: "M",
    sentAt: "há 2 dias",
  },
  {
    id: "i-2",
    email: "pedro.rocha@awsales.io",
    role: "Operador",
    initials: "P",
    sentAt: "há 5 horas",
  },
];

export const GROUPS: Group[] = [
  {
    id: "g-atendimento",
    name: "Atendimento",
    description: "Time que cuida de conversas em tempo real e SLAs.",
    memberCount: 8,
    icon: "support_agent",
    roles: ["Operador", "Admin"],
  },
  {
    id: "g-comercial",
    name: "Comercial",
    description: "Vendas, qualificação de leads e follow-up.",
    memberCount: 5,
    icon: "trending_up",
    roles: ["Operador"],
  },
  {
    id: "g-operacoes",
    name: "Operações",
    description: "Setup de agentes, integrações e moderação.",
    memberCount: 3,
    icon: "settings",
    roles: ["Admin"],
  },
];

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: "r-owner",
    name: "Owner",
    description:
      "Acesso total. Único papel com permissões irreversíveis (excluir organização, faturamento).",
    memberCount: 1,
    capabilities: CAPABILITIES.map((c) => c.id),
    isSystem: true,
  },
  {
    id: "r-admin",
    name: "Admin",
    description:
      "Gerencia agentes, integrações e equipe. Não pode mexer em faturamento ou excluir a organização.",
    memberCount: 1,
    capabilities: [
      "agents.write",
      "approvals",
      "data.sensitive",
      "integrations.connect",
      "members.invite",
    ],
    isSystem: true,
  },
  {
    id: "r-operador",
    name: "Operador",
    description:
      "Roda agentes, atende conversas e aprova ações comuns. Não convida membros nem mexe em integrações.",
    memberCount: 1,
    capabilities: ["agents.write", "approvals", "integrations.connect"],
    isSystem: true,
  },
  {
    id: "r-viewer",
    name: "Viewer",
    description:
      "Somente leitura. Vê dashboards, conversas e relatórios, sem editar nada.",
    memberCount: 0,
    capabilities: [],
    isSystem: true,
  },
];
