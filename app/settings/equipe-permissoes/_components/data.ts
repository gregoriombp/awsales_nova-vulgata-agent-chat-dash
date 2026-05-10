/**
 * Shared sample data + types for the Equipe & permissões pages.
 * Lives under `_components/` so Next.js does not treat the folder as a route.
 */

export type Role = "Owner" | "Admin" | "Operador" | "Viewer";

export type RoleColorId =
  | "blue"
  | "emerald"
  | "amber"
  | "red"
  | "purple"
  | "teal"
  | "pink"
  | "gray";

export type RoleColor = {
  id: RoleColorId;
  label: string;
  token: string;
};

export const ROLE_COLORS: RoleColor[] = [
  { id: "blue", label: "Azul", token: "var(--aw-blue-500)" },
  { id: "emerald", label: "Verde", token: "var(--aw-emerald-500)" },
  { id: "amber", label: "Âmbar", token: "var(--aw-amber-500)" },
  { id: "red", label: "Vermelho", token: "var(--aw-red-500)" },
  { id: "purple", label: "Roxo", token: "var(--aw-purple-500)" },
  { id: "teal", label: "Turquesa", token: "var(--aw-teal-500)" },
  { id: "pink", label: "Rosa", token: "var(--aw-pink-500)" },
  { id: "gray", label: "Cinza", token: "var(--aw-gray-500)" },
];

export function getRoleColor(id: RoleColorId | undefined): RoleColor {
  return ROLE_COLORS.find((c) => c.id === id) ?? ROLE_COLORS[0];
}

/* -----------------------------------------------------------------
 * Capability-based permissions, grouped by scope.
 *
 * Within each scope, permissions sit in groups tagged with an *intent*:
 *   - "module"          → access to the module/screen itself
 *   - "operational"     → day-to-day actions on resources
 *   - "administrative"  → sensitive/admin actions
 *
 * The intent drives accent + ordering in the UI; not every scope needs
 * every intent.
 * ----------------------------------------------------------------- */

export type PermissionIntent = "module" | "operational" | "administrative";

export type Permission = {
  id: string;
  label: string;
  description?: string;
};

export type ScopeGroup = {
  id: string;
  label: string;
  intent: PermissionIntent;
  permissions: Permission[];
};

export type Scope = {
  id: string;
  name: string;
  icon: string;
  description: string;
  groups: ScopeGroup[];
};

export const SCOPES: Scope[] = [
  {
    id: "atendimento",
    name: "Central de Atendimento",
    icon: "support_agent",
    description: "Tickets, fila, transferências e configurações do help desk.",
    groups: [
      {
        id: "access",
        label: "Acesso",
        intent: "module",
        permissions: [
          {
            id: "atendimento.access",
            label: "Acessar central de atendimento",
            description: "Vê o módulo na navegação e abre a tela de tickets.",
          },
        ],
      },
      {
        id: "tickets",
        label: "Tickets",
        intent: "operational",
        permissions: [
          {
            id: "atendimento.tickets.assume",
            label: "Assumir ticket",
            description: "Pega um ticket da fila para si.",
          },
          {
            id: "atendimento.tickets.respond",
            label: "Responder clientes",
            description: "Envia mensagens em conversas ativas.",
          },
          {
            id: "atendimento.tickets.status",
            label: "Atualizar status",
            description: "Move tickets entre etapas (aberto → resolvido).",
          },
          {
            id: "atendimento.tickets.close",
            label: "Encerrar ticket",
            description: "Fecha o atendimento e arquiva a conversa.",
          },
        ],
      },
      {
        id: "transfer",
        label: "Transferência",
        intent: "operational",
        permissions: [
          {
            id: "atendimento.transfer.operator",
            label: "Transferir para operador",
          },
          {
            id: "atendimento.transfer.team",
            label: "Transferir para equipe",
          },
          {
            id: "atendimento.transfer.queue",
            label: "Retornar para fila geral",
          },
        ],
      },
      {
        id: "admin",
        label: "Administração",
        intent: "administrative",
        permissions: [
          {
            id: "atendimento.admin.queues",
            label: "Gerenciar filas",
            description: "Cria, edita e arquiva filas de atendimento.",
          },
          {
            id: "atendimento.admin.tags",
            label: "Gerenciar tags",
          },
          {
            id: "atendimento.admin.config",
            label: "Editar configurações de atendimento",
          },
        ],
      },
    ],
  },
  {
    id: "agentes",
    name: "Agentes",
    icon: "smart_toy",
    description: "Criação, edição e publicação de agentes de IA.",
    groups: [
      {
        id: "access",
        label: "Acesso",
        intent: "module",
        permissions: [
          {
            id: "agentes.access",
            label: "Acessar área de agentes",
          },
        ],
      },
      {
        id: "edit",
        label: "Edição",
        intent: "operational",
        permissions: [
          { id: "agentes.create", label: "Criar agente" },
          { id: "agentes.edit", label: "Editar agente" },
          {
            id: "agentes.publish",
            label: "Publicar mudanças",
            description: "Promove versões em rascunho para produção.",
          },
        ],
      },
      {
        id: "admin",
        label: "Administração",
        intent: "administrative",
        permissions: [
          { id: "agentes.delete", label: "Excluir agentes" },
          {
            id: "agentes.types",
            label: "Gerenciar tipos de agentes",
            description: "Define templates e categorias usados pela equipe.",
          },
        ],
      },
    ],
  },
  {
    id: "campanhas",
    name: "Campanhas",
    icon: "campaign",
    description: "Disparos, segmentação e aprovações de campanha.",
    groups: [
      {
        id: "access",
        label: "Acesso",
        intent: "module",
        permissions: [{ id: "campanhas.access", label: "Acessar campanhas" }],
      },
      {
        id: "edit",
        label: "Edição",
        intent: "operational",
        permissions: [
          { id: "campanhas.create", label: "Criar campanha" },
          { id: "campanhas.edit", label: "Editar campanha" },
        ],
      },
      {
        id: "publish",
        label: "Publicação",
        intent: "operational",
        permissions: [
          {
            id: "campanhas.publish",
            label: "Publicar campanha",
            description: "Inicia o disparo após aprovação.",
          },
          { id: "campanhas.pause", label: "Pausar campanha" },
        ],
      },
      {
        id: "approvals",
        label: "Aprovações",
        intent: "administrative",
        permissions: [
          {
            id: "campanhas.approve",
            label: "Aprovar campanha",
            description: "Libera campanhas que aguardam validação.",
          },
        ],
      },
    ],
  },
  {
    id: "conversas",
    name: "Conversas",
    icon: "forum",
    description: "Histórico, transcripts e dados sensíveis de clientes.",
    groups: [
      {
        id: "access",
        label: "Acesso",
        intent: "module",
        permissions: [{ id: "conversas.access", label: "Acessar conversas" }],
      },
      {
        id: "view",
        label: "Visualização",
        intent: "operational",
        permissions: [
          {
            id: "conversas.view.assigned",
            label: "Ver conversas atribuídas",
            description: "Acessa apenas o que foi designado ao usuário.",
          },
          {
            id: "conversas.view.all",
            label: "Ver todas as conversas",
            description: "Vê o histórico completo do workspace.",
          },
        ],
      },
      {
        id: "sensitive",
        label: "Dados sensíveis",
        intent: "administrative",
        permissions: [
          { id: "conversas.export", label: "Exportar transcripts" },
          {
            id: "conversas.financial",
            label: "Ver dados financeiros do cliente",
            description: "Pedidos, valores e métricas atreladas à conversa.",
          },
        ],
      },
    ],
  },
  {
    id: "integracoes",
    name: "Integrações & Tools",
    icon: "extension",
    description: "Canais externos e ferramentas customizadas dos agentes.",
    groups: [
      {
        id: "access",
        label: "Acesso",
        intent: "module",
        permissions: [
          { id: "integracoes.access", label: "Acessar integrações" },
        ],
      },
      {
        id: "channels",
        label: "Canais",
        intent: "operational",
        permissions: [
          { id: "integracoes.connect", label: "Conectar canais" },
          { id: "integracoes.disconnect", label: "Desconectar canais" },
        ],
      },
      {
        id: "tools",
        label: "Tools customizadas",
        intent: "administrative",
        permissions: [
          {
            id: "integracoes.tools.manage",
            label: "Gerenciar tools customizadas",
            description: "Cria/edita ferramentas que os agentes podem chamar.",
          },
        ],
      },
    ],
  },
  {
    id: "workspace",
    name: "Workspace & Faturamento",
    icon: "settings",
    description: "Membros, funções e gestão do plano da organização.",
    groups: [
      {
        id: "members",
        label: "Membros",
        intent: "administrative",
        permissions: [
          { id: "workspace.members.invite", label: "Convidar membros" },
          { id: "workspace.members.remove", label: "Remover membros" },
          {
            id: "workspace.members.roles",
            label: "Atribuir funções",
            description: "Muda a função de membros existentes.",
          },
        ],
      },
      {
        id: "billing",
        label: "Faturamento",
        intent: "administrative",
        permissions: [
          { id: "workspace.billing.view", label: "Ver faturas" },
          { id: "workspace.billing.plan", label: "Atualizar plano" },
          {
            id: "workspace.billing.payment",
            label: "Atualizar método de pagamento",
          },
        ],
      },
    ],
  },
];

/** Flat list of every permission across every scope. */
export const ALL_PERMISSIONS: Permission[] = SCOPES.flatMap((s) =>
  s.groups.flatMap((g) => g.permissions)
);

export const ALL_PERMISSION_IDS: string[] = ALL_PERMISSIONS.map((p) => p.id);

/** Map permission id → { permission, group, scope } for quick lookup. */
export type PermissionLocation = {
  permission: Permission;
  group: ScopeGroup;
  scope: Scope;
};

export const PERMISSION_INDEX: Record<string, PermissionLocation> = (() => {
  const index: Record<string, PermissionLocation> = {};
  for (const scope of SCOPES) {
    for (const group of scope.groups) {
      for (const permission of group.permissions) {
        index[permission.id] = { permission, group, scope };
      }
    }
  }
  return index;
})();

/* -----------------------------------------------------------------
 * Members / invites / groups
 * ----------------------------------------------------------------- */

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
  ticketsThisWeek: number;
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
  name: string;
  description: string;
  memberCount: number;
  capabilities: string[];
  isSystem: boolean;
  color: RoleColorId;
  icon: string;
};

export const DEFAULT_CUSTOM_ROLE_ICON = "badge";

export const ROLE_OPTIONS: Role[] = ["Owner", "Admin", "Operador", "Viewer"];

export const PROJECT_OPTIONS = [
  "Vendas — WhatsApp",
  "Atendimento — Instagram",
  "Onboarding — Site",
  "Pós-venda",
];

export const INTEGRATIONS: Integration[] = [
  { id: "whatsapp", name: "WhatsApp Business", icon: "chat" },
  { id: "instagram", name: "Instagram Direct", icon: "photo_camera" },
  { id: "checkout", name: "Custom Checkout", icon: "shopping_cart" },
];

/* -----------------------------------------------------------------
 * Role presets — drive both the role list and member sample data.
 * ----------------------------------------------------------------- */

const ADMIN_PERMISSIONS = ALL_PERMISSION_IDS.filter(
  (id) => !id.startsWith("workspace.billing.")
);

const OPERADOR_PERMISSIONS = [
  "atendimento.access",
  "atendimento.tickets.assume",
  "atendimento.tickets.respond",
  "atendimento.tickets.status",
  "atendimento.tickets.close",
  "atendimento.transfer.operator",
  "atendimento.transfer.team",
  "atendimento.transfer.queue",
  "agentes.access",
  "agentes.edit",
  "campanhas.access",
  "campanhas.edit",
  "conversas.access",
  "conversas.view.assigned",
  "integracoes.access",
];

const VIEWER_PERMISSIONS = [
  "atendimento.access",
  "agentes.access",
  "campanhas.access",
  "conversas.access",
  "conversas.view.assigned",
  "integracoes.access",
];

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: "r-owner",
    name: "Owner",
    description:
      "Acesso total. Único papel com permissões irreversíveis (excluir organização, faturamento).",
    memberCount: 1,
    capabilities: ALL_PERMISSION_IDS,
    isSystem: true,
    color: "purple",
    icon: "workspace_premium",
  },
  {
    id: "r-admin",
    name: "Admin",
    description:
      "Gerencia agentes, integrações, atendimento e equipe. Não toca em faturamento.",
    memberCount: 1,
    capabilities: ADMIN_PERMISSIONS,
    isSystem: true,
    color: "blue",
    icon: "admin_panel_settings",
  },
  {
    id: "r-operador",
    name: "Operador",
    description:
      "Roda agentes, atende conversas e aprova ações comuns. Não convida membros nem mexe em integrações.",
    memberCount: 1,
    capabilities: OPERADOR_PERMISSIONS,
    isSystem: true,
    color: "emerald",
    icon: "support_agent",
  },
  {
    id: "r-viewer",
    name: "Viewer",
    description:
      "Somente leitura. Vê dashboards, conversas atribuídas e relatórios, sem editar nada.",
    memberCount: 0,
    capabilities: VIEWER_PERMISSIONS,
    isSystem: true,
    color: "gray",
    icon: "visibility",
  },
];

/* -----------------------------------------------------------------
 * Members
 * ----------------------------------------------------------------- */

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
    ticketsThisWeek: 12,
    permissions: ALL_PERMISSION_IDS,
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
    ticketsThisWeek: 8,
    permissions: ADMIN_PERMISSIONS,
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
    ticketsThisWeek: 23,
    permissions: OPERADOR_PERMISSIONS,
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
