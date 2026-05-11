/**
 * Shared sample data + types for the Equipe & permissões pages.
 * Lives under `_components/` so Next.js does not treat the folder as a route.
 */

export type Role =
  | "Administrador"
  | "Gerente de Operações"
  | "Analista Sênior"
  | "Analista Pleno"
  | "Colaborador Externo"
  | "Gerente da conta"
  | "Operador";

export type MemberStatus = "active" | "invited" | "inactive";

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

export const ALL_PERMISSIONS: Permission[] = SCOPES.flatMap((s) =>
  s.groups.flatMap((g) => g.permissions)
);

export const ALL_PERMISSION_IDS: string[] = ALL_PERMISSIONS.map((p) => p.id);

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
  status: MemberStatus;
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

/** Pool of curated greyscale background images stored under public/assets/group-backgrounds/. */
export const GROUP_BACKGROUNDS: string[] = Array.from(
  { length: 40 },
  (_, i) => `/assets/group-backgrounds/group-bg-${String(i + 1).padStart(2, "0")}.jpg`
);

/** Deterministic pick from the pool — same group id always lands on the same image. */
export function pickGroupBackground(groupId: string): string {
  let hash = 0;
  for (let i = 0; i < groupId.length; i++) {
    hash = (hash * 31 + groupId.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % GROUP_BACKGROUNDS.length;
  return GROUP_BACKGROUNDS[index];
}

export type Group = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  icon: string;
  roles: Role[];
  /** Member ids that compose this group (used to render the avatar stack). */
  members: string[];
  /** Background image rendered on the top half of the group card. */
  backgroundImage: string;
};

export type RoleDefinition = {
  id: string;
  name: string;
  description: string;
  /** Curta nota descrevendo o perfil ideal pra essa função. */
  idealFor?: string;
  memberCount: number;
  capabilities: string[];
  isSystem: boolean;
  color: RoleColorId;
  icon: string;
};

export const DEFAULT_CUSTOM_ROLE_ICON = "badge";

export const ROLE_OPTIONS: Role[] = [
  "Administrador",
  "Gerente de Operações",
  "Analista Sênior",
  "Analista Pleno",
  "Colaborador Externo",
  "Gerente da conta",
  "Operador",
];

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
 * Role presets — capability subsets per role.
 * ----------------------------------------------------------------- */

const ADMINISTRADOR_PERMISSIONS = ALL_PERMISSION_IDS;

const GERENTE_OPERACOES_PERMISSIONS = ALL_PERMISSION_IDS.filter(
  (id) => !id.startsWith("workspace.billing.")
);

const ANALISTA_SENIOR_PERMISSIONS = [
  "agentes.access",
  "agentes.create",
  "agentes.edit",
  "agentes.publish",
  "agentes.types",
  "campanhas.access",
  "campanhas.create",
  "campanhas.edit",
  "campanhas.publish",
  "campanhas.pause",
  "conversas.access",
  "conversas.view.all",
  "conversas.export",
  "integracoes.access",
  "integracoes.tools.manage",
];

const ANALISTA_PLENO_PERMISSIONS = [
  "agentes.access",
  "agentes.create",
  "agentes.edit",
  "campanhas.access",
  "campanhas.create",
  "campanhas.edit",
  "conversas.access",
  "conversas.view.assigned",
  "integracoes.access",
];

const COLABORADOR_EXTERNO_PERMISSIONS = [
  "atendimento.access",
  "atendimento.tickets.respond",
  "campanhas.access",
  "campanhas.approve",
  "conversas.access",
  "conversas.view.assigned",
];

const GERENTE_DA_CONTA_PERMISSIONS = [
  "atendimento.access",
  "atendimento.tickets.assume",
  "atendimento.tickets.respond",
  "atendimento.tickets.status",
  "atendimento.tickets.close",
  "atendimento.transfer.operator",
  "atendimento.transfer.team",
  "campanhas.access",
  "conversas.access",
  "conversas.view.all",
  "conversas.financial",
  "agentes.access",
];

const OPERADOR_PERMISSIONS = [
  "atendimento.access",
  "atendimento.tickets.assume",
  "atendimento.tickets.respond",
  "atendimento.tickets.status",
  "conversas.access",
  "conversas.view.assigned",
  "agentes.access",
];

export const ROLE_DEFINITIONS: RoleDefinition[] = [
  {
    id: "r-administrador",
    name: "Administrador",
    description:
      "Controle total sobre a operação, ativos de IA e infraestrutura da organização.",
    idealFor:
      "Founders, CTOs e responsáveis pelo workspace inteiro.",
    memberCount: 1,
    capabilities: ADMINISTRADOR_PERMISSIONS,
    isSystem: true,
    color: "purple",
    icon: "admin_panel_settings",
  },
  {
    id: "r-gerente-operacoes",
    name: "Gerente de Operações",
    description:
      "Focado no sucesso da conta e na validação técnica. Cria e edita agentes e ferramentas, e gerencia fluxos de aprovação.",
    idealFor:
      "Supervisores de equipe e gestores de sucesso do cliente (CSMs).",
    memberCount: 3,
    capabilities: GERENTE_OPERACOES_PERMISSIONS,
    isSystem: true,
    color: "blue",
    icon: "manage_accounts",
  },
  {
    id: "r-analista-senior",
    name: "Analista Sênior",
    description:
      "Principal criador de conteúdo. Gerencia bases de conhecimento complexas, edita knowledge layers e configura disparos.",
    idealFor:
      "Especialistas em conteúdo e prompts que mantêm a qualidade dos agentes.",
    memberCount: 3,
    capabilities: ANALISTA_SENIOR_PERMISSIONS,
    isSystem: true,
    color: "amber",
    icon: "engineering",
  },
  {
    id: "r-analista-pleno",
    name: "Analista Pleno",
    description:
      "Focado na execução e manutenção. Cria agentes e alimenta as bases de conhecimento, testando no playground.",
    idealFor:
      "Analistas operacionais que tocam o dia a dia dos agentes.",
    memberCount: 3,
    capabilities: ANALISTA_PLENO_PERMISSIONS,
    isSystem: true,
    color: "teal",
    icon: "psychology",
  },
  {
    id: "r-colaborador-externo",
    name: "Colaborador Externo",
    description:
      "Perfil de supervisão focado em aprovações e controle de qualidade. Gerencia conversas e bases sem editar produção.",
    idealFor:
      "Parceiros, agências e consultores temporários com escopo restrito.",
    memberCount: 1,
    capabilities: COLABORADOR_EXTERNO_PERMISSIONS,
    isSystem: true,
    color: "gray",
    icon: "group",
  },
  {
    id: "r-gerente-conta",
    name: "Gerente da conta",
    description:
      "Responsável pelo relacionamento com clientes. Gerencia conversas, disparos e acompanha métricas de atendimento.",
    idealFor:
      "Especialistas Awsales designados pra acompanhar a sua organização.",
    memberCount: 1,
    capabilities: GERENTE_DA_CONTA_PERMISSIONS,
    isSystem: true,
    color: "emerald",
    icon: "support_agent",
  },
  {
    id: "r-operador",
    name: "Operador",
    description:
      "Acesso básico focado em monitoramento e suporte. Visualiza a maioria das áreas e usa o playground para testes.",
    idealFor:
      "Atendentes da linha de frente e novos membros em onboarding.",
    memberCount: 4,
    capabilities: OPERADOR_PERMISSIONS,
    isSystem: true,
    color: "pink",
    icon: "headset_mic",
  },
];

/* -----------------------------------------------------------------
 * Members
 * ----------------------------------------------------------------- */

export const MEMBERS: Member[] = [
  {
    id: "u-greg",
    name: "Gregório Pinheiro",
    email: "greg@awsales.io",
    role: "Administrador",
    initials: "GP",
    avatar: "/assets/users/greg.jpg",
    isYou: true,
    status: "active",
    lastActive: "agora mesmo",
    joinedAt: "12/01/2026",
    permissions: ADMINISTRADOR_PERMISSIONS,
    integrations: ["whatsapp", "instagram", "checkout"],
    activity: [
      { time: "há 2h", description: "Atualizou o agente \"Marina\"." },
      { time: "há 1d", description: "Convidou pedro.rocha@awsales.io." },
      { time: "há 3d", description: "Aprovou ação \"Reembolso de R$ 240\"." },
    ],
  },
  {
    id: "u-gabriel-rocha",
    name: "Gabriel Rocha",
    email: "gabriel.rocha@awsales.io",
    role: "Gerente da conta",
    initials: "GR",
    avatar: "/assets/ui-faces/male-1.jpg",
    status: "active",
    lastActive: "há 12 minutos",
    joinedAt: "11/04/2023",
    permissions: GERENTE_DA_CONTA_PERMISSIONS,
    integrations: ["whatsapp"],
    activity: [
      { time: "há 12min", description: "Encerrou conversa com cliente VIP." },
      { time: "há 1d", description: "Adicionou cliente \"Loja Marinha\"." },
    ],
  },
  {
    id: "u-larissa-pinto",
    name: "Larissa Pinto",
    email: "larissa.pinto@awsales.io",
    role: "Gerente de Operações",
    initials: "LP",
    avatar: "/assets/ui-faces/female-1.jpg",
    status: "active",
    lastActive: "há 1 hora",
    joinedAt: "31/08/2022",
    permissions: GERENTE_OPERACOES_PERMISSIONS,
    integrations: ["whatsapp", "instagram"],
    activity: [
      { time: "há 1h", description: "Atualizou status de 4 tickets." },
      { time: "há 2d", description: "Transferiu conversa para equipe." },
    ],
  },
  {
    id: "u-rafael-andrade",
    name: "Rafael Andrade",
    email: "rafael.andrade@awsales.io",
    role: "Analista Sênior",
    initials: "RA",
    avatar: "/assets/ui-faces/male-2.jpg",
    status: "active",
    lastActive: "há 2 horas",
    joinedAt: "07/02/2024",
    permissions: ANALISTA_SENIOR_PERMISSIONS,
    integrations: ["whatsapp"],
    activity: [
      { time: "há 2h", description: "Resolveu disputa de pagamento." },
      { time: "há 1d", description: "Subiu lista de leads do trimestre." },
    ],
  },
  {
    id: "u-camila-nogueira",
    name: "Camila Nogueira",
    email: "camila.nogueira@awsales.io",
    role: "Analista Pleno",
    initials: "CN",
    avatar: "/assets/ui-faces/female-2.jpg",
    status: "active",
    lastActive: "há 5 horas",
    joinedAt: "22/11/2023",
    permissions: ANALISTA_PLENO_PERMISSIONS,
    integrations: ["whatsapp", "checkout"],
    activity: [
      { time: "há 5h", description: "Acompanhou métricas semanais." },
      { time: "há 3d", description: "Reativou cliente \"Bossa Beauty\"." },
    ],
  },
  {
    id: "u-ana-souza",
    name: "Ana Souza",
    email: "ana.souza@awsales.io",
    role: "Gerente de Operações",
    initials: "AS",
    avatar: "/assets/ui-faces/female-3.jpg",
    status: "active",
    lastActive: "há 14 minutos",
    joinedAt: "14/01/2023",
    permissions: GERENTE_OPERACOES_PERMISSIONS,
    integrations: ["whatsapp", "instagram"],
    activity: [
      { time: "há 14min", description: "Aprovou troca de status de pedido." },
      { time: "há 1d", description: "Conectou nova conta Instagram." },
      { time: "há 4d", description: "Editou playbook de atendimento." },
    ],
  },
  {
    id: "u-carlos-lima",
    name: "Carlos Lima",
    email: "carlos.lima@awsales.io",
    role: "Gerente de Operações",
    initials: "CL",
    avatar: "/assets/ui-faces/male-3.jpg",
    status: "active",
    lastActive: "há 3 horas",
    joinedAt: "19/08/2022",
    permissions: GERENTE_OPERACOES_PERMISSIONS,
    integrations: ["whatsapp"],
    activity: [
      { time: "há 3h", description: "Aprovou nova campanha de retenção." },
      { time: "há 2d", description: "Atualizou template de SLA." },
    ],
  },
  {
    id: "u-henrique-tavares",
    name: "Henrique Tavares",
    email: "henrique.tavares@awsales.io",
    role: "Analista Sênior",
    initials: "HT",
    avatar: "/assets/ui-faces/male-4.jpg",
    status: "active",
    lastActive: "há 25 minutos",
    joinedAt: "08/05/2022",
    permissions: ANALISTA_SENIOR_PERMISSIONS,
    integrations: ["whatsapp", "instagram"],
    activity: [
      { time: "há 25min", description: "Publicou versão 3.2 do agente \"Vitrine\"." },
      { time: "há 1d", description: "Refatorou knowledge layer de catálogo." },
    ],
  },
  {
    id: "u-juliana-barreto",
    name: "Juliana Barreto",
    email: "juliana.barreto@awsales.io",
    role: "Analista Sênior",
    initials: "JB",
    avatar: "/assets/ui-faces/female-4.jpg",
    status: "active",
    lastActive: "há 50 minutos",
    joinedAt: "16/09/2022",
    permissions: ANALISTA_SENIOR_PERMISSIONS,
    integrations: ["whatsapp"],
    activity: [
      { time: "há 50min", description: "Configurou disparo segmentado de Black Friday." },
      { time: "há 2d", description: "Aprovou base de FAQ atualizada." },
    ],
  },
  {
    id: "u-diego-ferreira",
    name: "Diego Ferreira",
    email: "diego.ferreira@awsales.io",
    role: "Analista Pleno",
    initials: "DF",
    avatar: "/assets/ui-faces/male-5.jpg",
    status: "active",
    lastActive: "há 30 minutos",
    joinedAt: "04/06/2023",
    permissions: ANALISTA_PLENO_PERMISSIONS,
    integrations: ["whatsapp"],
    activity: [
      { time: "há 30min", description: "Criou novo agente \"Suporte Pro\"." },
      { time: "há 2d", description: "Subiu nova base de conhecimento." },
    ],
  },
  {
    id: "u-pedro-vasconcelos",
    name: "Pedro Vasconcelos",
    email: "pedro.vasconcelos@awsales.io",
    role: "Analista Pleno",
    initials: "PV",
    avatar: "/assets/ui-faces/male-6.jpg",
    status: "active",
    lastActive: "há 4 horas",
    joinedAt: "13/10/2023",
    permissions: ANALISTA_PLENO_PERMISSIONS,
    integrations: ["whatsapp"],
    activity: [
      { time: "há 4h", description: "Editou agente \"Pré-venda\"." },
      { time: "há 3d", description: "Testou nova chain de qualificação." },
    ],
  },
  {
    id: "u-marina-cavalcanti",
    name: "Marina Cavalcanti",
    email: "marina.cavalcanti@partner.io",
    role: "Colaborador Externo",
    initials: "MC",
    avatar: "/assets/ui-faces/female-5.jpg",
    status: "active",
    lastActive: "há 1 dia",
    joinedAt: "02/02/2024",
    permissions: COLABORADOR_EXTERNO_PERMISSIONS,
    integrations: [],
    activity: [
      { time: "há 1d", description: "Aprovou batch de 12 conversas de QA." },
      { time: "há 5d", description: "Sinalizou divergência no playbook." },
    ],
  },
  {
    id: "u-beatriz-mendes",
    name: "Beatriz Mendes",
    email: "beatriz@awsales.io",
    role: "Operador",
    initials: "BM",
    avatar: "/assets/ui-faces/female-6.jpg",
    status: "invited",
    lastActive: "—",
    joinedAt: "09/03/2024",
    permissions: OPERADOR_PERMISSIONS,
    integrations: [],
    activity: [
      { time: "há 2d", description: "Convite enviado por Gregório Pinheiro." },
    ],
  },
  {
    id: "u-thiago-oliveira",
    name: "Thiago Oliveira",
    email: "thiago.oliveira@awsales.io",
    role: "Operador",
    initials: "TO",
    avatar: "/assets/ui-faces/male-7.jpg",
    status: "active",
    lastActive: "há 8 minutos",
    joinedAt: "27/07/2023",
    permissions: OPERADOR_PERMISSIONS,
    integrations: ["whatsapp"],
    activity: [
      { time: "há 8min", description: "Atendeu cliente em fila prioritária." },
      { time: "há 1d", description: "Encerrou 14 conversas." },
    ],
  },
  {
    id: "u-bianca-rezende",
    name: "Bianca Rezende",
    email: "bianca.rezende@awsales.io",
    role: "Operador",
    initials: "BR",
    avatar: "/assets/ui-faces/female-7.jpg",
    status: "active",
    lastActive: "há 2 horas",
    joinedAt: "15/12/2023",
    permissions: OPERADOR_PERMISSIONS,
    integrations: ["whatsapp", "instagram"],
    activity: [
      { time: "há 2h", description: "Transferiu ticket para Gerente de Operações." },
      { time: "há 2d", description: "Marcou conversas como spam." },
    ],
  },
  {
    id: "u-fernanda-costa",
    name: "Fernanda Costa",
    email: "fernanda@awsales.io",
    role: "Operador",
    initials: "FC",
    avatar: "/assets/ui-faces/female-8.jpg",
    status: "inactive",
    lastActive: "há 3 meses",
    joinedAt: "31/10/2021",
    permissions: OPERADOR_PERMISSIONS,
    integrations: [],
    activity: [
      { time: "há 3 meses", description: "Último login antes da inatividade." },
    ],
  },
];

export const INVITATIONS: Invitation[] = [
  {
    id: "i-1",
    email: "marina@cliente.com",
    role: "Operador",
    initials: "M",
    sentAt: "há 2 dias",
  },
  {
    id: "i-2",
    email: "pedro.rocha@awsales.io",
    role: "Analista Pleno",
    initials: "P",
    sentAt: "há 5 horas",
  },
];

export const GROUPS: Group[] = [
  {
    id: "g-atendimento",
    name: "Atendimento",
    description:
      "Equipe dedicada a monitorar conversas em tempo real, garantindo o cumprimento rigoroso dos SLAs.",
    memberCount: 8,
    icon: "groups",
    roles: ["Operador", "Gerente de Operações"],
    members: [
      "u-thiago-oliveira",
      "u-bianca-rezende",
      "u-fernanda-costa",
      "u-larissa-pinto",
      "u-ana-souza",
      "u-carlos-lima",
      "u-rafael-andrade",
      "u-camila-nogueira",
    ],
    backgroundImage: pickGroupBackground("g-atendimento"),
  },
  {
    id: "g-comercial",
    name: "Comercial",
    description:
      "Vendas, qualificação de leads e follow-up — atua direto na ponta do funil para acelerar o ciclo.",
    memberCount: 5,
    icon: "groups",
    roles: ["Operador", "Gerente da conta"],
    members: [
      "u-gabriel-rocha",
      "u-juliana-barreto",
      "u-pedro-vasconcelos",
      "u-henrique-tavares",
      "u-diego-ferreira",
    ],
    backgroundImage: pickGroupBackground("g-comercial"),
  },
  {
    id: "g-operacoes",
    name: "Operações",
    description:
      "Setup de agentes, integrações e moderação. Cuida da espinha dorsal do workspace.",
    memberCount: 3,
    icon: "groups",
    roles: ["Gerente de Operações", "Administrador"],
    members: ["u-greg", "u-larissa-pinto", "u-ana-souza"],
    backgroundImage: pickGroupBackground("g-operacoes"),
  },
  {
    id: "g-suporte",
    name: "Suporte",
    description:
      "Time especializado em acompanhar conversas ao vivo, assegurando o cumprimento estrito dos SLAs.",
    memberCount: 2,
    icon: "groups",
    roles: ["Operador"],
    members: ["u-thiago-oliveira", "u-bianca-rezende"],
    backgroundImage: pickGroupBackground("g-suporte"),
  },
];
