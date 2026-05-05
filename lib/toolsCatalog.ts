/** Catalog of native tools exposed by each integration. Tools are the
 *  unit of capability that agents pick up — an integration is the auth
 *  bundle, a tool is a single callable action (read state, write state,
 *  perform a side-effect).
 *
 *  Tools are defined once by integration *category* and then expanded
 *  for every brand inside that category — so connecting Hotmart vs.
 *  Kiwify yields the same checkout toolset, with the brand label
 *  baked into each tool. The single-brand exceptions (AI providers,
 *  signatures, marketplaces) are listed inline below.
 */

import {
  INTEGRATION_CATALOG,
  type IntegrationCategory,
  type IntegrationCatalogItem,
} from "./integrationsCatalog";

export type ToolKind = "read" | "write" | "action";

export interface ToolParam {
  name: string;
  type: "string" | "number" | "boolean" | "enum" | "object" | "array";
  required?: boolean;
  description: string;
  /** Enum values rendered as inline chips on the detail panel. */
  values?: string[];
}

export interface CatalogTool {
  /** Stable id — kebab-case, prefixed with the integration id so it is
   *  globally unique across the catalog. Example: `calendly.create-booking`. */
  id: string;
  /** Owner integration. Always references an entry in INTEGRATION_CATALOG. */
  integrationId: string;
  /** Short, action-oriented name shown in the row. */
  name: string;
  /** One-sentence description. Surfaces in the row + detail panel. */
  description: string;
  /** Read = pure lookup, Write = mutates third-party state, Action = has
   *  user-visible side-effects (sending a message, charging a card, etc). */
  kind: ToolKind;
  /** Material Symbol name. */
  icon: string;
  /** Optional input schema preview, surfaced in the detail panel. */
  params?: ToolParam[];
  /** Optional response shape preview, surfaced in the detail panel. */
  returns?: string;
}

export const KIND_LABELS: Record<ToolKind, string> = {
  read: "Leitura",
  write: "Escrita",
  action: "Ação",
};

export const KIND_PILL_VARIANT: Record<
  ToolKind,
  "neutral" | "live" | "ai"
> = {
  read: "neutral",
  write: "live",
  action: "ai",
};

/* ----------------------------------------------------------------
 * Per-category tool packs. Each pack is parametrised on the brand
 * name so the displayed text reads naturally for every integration
 * (e.g. "Buscar transação na Hotmart" vs. "Buscar transação no Stripe").
 * ---------------------------------------------------------------- */

type Pack = (brand: IntegrationCatalogItem) => CatalogTool[];

const checkoutsPack: Pack = (b) => [
  {
    id: `${b.id}.search-transaction`,
    integrationId: b.id,
    name: "Buscar transação",
    description: `Localiza uma transação na ${b.name} por id, e-mail ou telefone do comprador.`,
    kind: "read",
    icon: "receipt_long",
    params: [
      { name: "query", type: "string", required: true, description: "Id, e-mail ou telefone do comprador." },
      { name: "limit", type: "number", description: "Máximo de resultados. Default 10." },
    ],
    returns: "Array<Transaction>",
  },
  {
    id: `${b.id}.list-recent-orders`,
    integrationId: b.id,
    name: "Listar pedidos recentes",
    description: `Retorna os pedidos mais recentes da ${b.name}, com filtros por status e janela de tempo.`,
    kind: "read",
    icon: "list_alt",
    params: [
      {
        name: "status",
        type: "enum",
        description: "Status do pedido.",
        values: ["paid", "pending", "refunded", "chargeback"],
      },
      { name: "since", type: "string", description: "ISO 8601 — janela inicial." },
    ],
  },
  {
    id: `${b.id}.get-subscription`,
    integrationId: b.id,
    name: "Detalhar assinatura",
    description: `Recupera o ciclo, próximo vencimento e histórico de uma assinatura na ${b.name}.`,
    kind: "read",
    icon: "autorenew",
    params: [{ name: "subscription_id", type: "string", required: true, description: "Identificador da assinatura." }],
  },
  {
    id: `${b.id}.refund-transaction`,
    integrationId: b.id,
    name: "Reembolsar transação",
    description: `Solicita reembolso integral ou parcial de uma cobrança na ${b.name}.`,
    kind: "action",
    icon: "currency_exchange",
    params: [
      { name: "transaction_id", type: "string", required: true, description: "Transação a ser reembolsada." },
      { name: "amount", type: "number", description: "Valor parcial. Omitir reembolsa o total." },
      { name: "reason", type: "string", description: "Motivo registrado no log." },
    ],
  },
];

const meetingsPack: Pack = (b) => [
  {
    id: `${b.id}.list-event-types`,
    integrationId: b.id,
    name: "Listar tipos de reunião",
    description: `Retorna os tipos de evento configurados na ${b.name} (duração, link, regras).`,
    kind: "read",
    icon: "event_note",
  },
  {
    id: `${b.id}.find-availability`,
    integrationId: b.id,
    name: "Buscar horários livres",
    description: `Consulta os próximos horários disponíveis na agenda ${b.name}, respeitando timezone.`,
    kind: "read",
    icon: "event_available",
    params: [
      { name: "event_type_id", type: "string", required: true, description: "Tipo de evento alvo." },
      { name: "from", type: "string", description: "ISO 8601 — janela inicial." },
      { name: "to", type: "string", description: "ISO 8601 — janela final." },
    ],
  },
  {
    id: `${b.id}.create-booking`,
    integrationId: b.id,
    name: "Agendar reunião",
    description: `Cria um agendamento na ${b.name}. O agente envia o link e confirma o horário pelo canal.`,
    kind: "action",
    icon: "calendar_add_on",
    params: [
      { name: "event_type_id", type: "string", required: true, description: "Tipo de evento alvo." },
      { name: "start_at", type: "string", required: true, description: "ISO 8601 — início do evento." },
      { name: "invitee_email", type: "string", required: true, description: "E-mail do convidado." },
      { name: "invitee_name", type: "string", description: "Nome do convidado." },
    ],
  },
  {
    id: `${b.id}.cancel-booking`,
    integrationId: b.id,
    name: "Cancelar reunião",
    description: `Cancela um agendamento ativo na ${b.name} e notifica o convidado.`,
    kind: "action",
    icon: "event_busy",
    params: [
      { name: "booking_id", type: "string", required: true, description: "Agendamento alvo." },
      { name: "reason", type: "string", description: "Motivo registrado no histórico." },
    ],
  },
];

const crmsPack: Pack = (b) => [
  {
    id: `${b.id}.search-contact`,
    integrationId: b.id,
    name: "Buscar contato",
    description: `Localiza um contato na ${b.name} por e-mail, telefone ou nome.`,
    kind: "read",
    icon: "person_search",
    params: [
      { name: "query", type: "string", required: true, description: "Termo de busca." },
      { name: "limit", type: "number", description: "Máximo de resultados. Default 5." },
    ],
  },
  {
    id: `${b.id}.create-lead`,
    integrationId: b.id,
    name: "Criar lead",
    description: `Cria um novo lead na ${b.name} com os dados coletados pelo agente.`,
    kind: "write",
    icon: "person_add",
    params: [
      { name: "name", type: "string", required: true, description: "Nome completo." },
      { name: "email", type: "string", description: "E-mail principal." },
      { name: "phone", type: "string", description: "Telefone com DDI." },
      { name: "source", type: "string", description: "Origem do lead (canal, campanha, etc)." },
    ],
  },
  {
    id: `${b.id}.update-deal-stage`,
    integrationId: b.id,
    name: "Avançar etapa do funil",
    description: `Move uma oportunidade entre etapas do pipeline na ${b.name}.`,
    kind: "write",
    icon: "trending_up",
    params: [
      { name: "deal_id", type: "string", required: true, description: "Oportunidade alvo." },
      { name: "stage_id", type: "string", required: true, description: "Nova etapa." },
    ],
  },
  {
    id: `${b.id}.log-activity`,
    integrationId: b.id,
    name: "Registrar atividade",
    description: `Anexa uma atividade (ligação, e-mail, reunião) ao contato na ${b.name}.`,
    kind: "write",
    icon: "history_edu",
    params: [
      { name: "contact_id", type: "string", required: true, description: "Contato alvo." },
      { name: "type", type: "enum", required: true, description: "Tipo de atividade.", values: ["call", "email", "meeting", "note"] },
      { name: "summary", type: "string", required: true, description: "Resumo da atividade." },
    ],
  },
  {
    id: `${b.id}.add-note`,
    integrationId: b.id,
    name: "Adicionar nota",
    description: `Cria uma nota livre vinculada ao contato ou deal na ${b.name}.`,
    kind: "write",
    icon: "sticky_note_2",
  },
];

const formsPack: Pack = (b) => [
  {
    id: `${b.id}.list-forms`,
    integrationId: b.id,
    name: "Listar formulários",
    description: `Retorna os formulários ativos na ${b.name}.`,
    kind: "read",
    icon: "list",
  },
  {
    id: `${b.id}.list-responses`,
    integrationId: b.id,
    name: "Listar respostas",
    description: `Retorna as submissões de um formulário ${b.name}, com filtros por data.`,
    kind: "read",
    icon: "fact_check",
    params: [
      { name: "form_id", type: "string", required: true, description: "Formulário alvo." },
      { name: "since", type: "string", description: "ISO 8601 — janela inicial." },
    ],
  },
  {
    id: `${b.id}.get-response`,
    integrationId: b.id,
    name: "Detalhar resposta",
    description: `Recupera uma resposta específica de um formulário ${b.name}, com todos os campos.`,
    kind: "read",
    icon: "description",
    params: [{ name: "response_id", type: "string", required: true, description: "Resposta alvo." }],
  },
];

const membersPack: Pack = (b) => [
  {
    id: `${b.id}.find-student`,
    integrationId: b.id,
    name: "Buscar aluno",
    description: `Localiza um aluno na ${b.name} por e-mail ou identificador.`,
    kind: "read",
    icon: "school",
    params: [{ name: "query", type: "string", required: true, description: "E-mail ou id do aluno." }],
  },
  {
    id: `${b.id}.get-progress`,
    integrationId: b.id,
    name: "Consultar progresso",
    description: `Retorna o progresso de um aluno em um curso da ${b.name}.`,
    kind: "read",
    icon: "monitoring",
    params: [
      { name: "student_id", type: "string", required: true, description: "Aluno alvo." },
      { name: "course_id", type: "string", required: true, description: "Curso alvo." },
    ],
  },
  {
    id: `${b.id}.grant-access`,
    integrationId: b.id,
    name: "Liberar acesso",
    description: `Concede acesso a um curso ou turma na ${b.name}.`,
    kind: "action",
    icon: "lock_open",
  },
  {
    id: `${b.id}.revoke-access`,
    integrationId: b.id,
    name: "Revogar acesso",
    description: `Remove o acesso a um curso ou turma na ${b.name}.`,
    kind: "action",
    icon: "lock",
  },
];

const marketplacesPack: Pack = (b) => [
  {
    id: `${b.id}.search-products`,
    integrationId: b.id,
    name: "Buscar produtos",
    description: `Pesquisa produtos do catálogo da ${b.name} por nome, sku ou tag.`,
    kind: "read",
    icon: "inventory_2",
    params: [{ name: "query", type: "string", required: true, description: "Termo de busca." }],
  },
  {
    id: `${b.id}.get-inventory`,
    integrationId: b.id,
    name: "Consultar estoque",
    description: `Retorna a posição de estoque atual de um produto na ${b.name}.`,
    kind: "read",
    icon: "warehouse",
    params: [{ name: "sku", type: "string", required: true, description: "SKU ou variante." }],
  },
  {
    id: `${b.id}.list-orders`,
    integrationId: b.id,
    name: "Listar pedidos",
    description: `Retorna os pedidos da ${b.name}, com filtro por status.`,
    kind: "read",
    icon: "shopping_basket",
  },
  {
    id: `${b.id}.create-draft-order`,
    integrationId: b.id,
    name: "Criar rascunho de pedido",
    description: `Monta um pedido em rascunho na ${b.name} pra fechamento manual depois.`,
    kind: "write",
    icon: "shopping_cart_checkout",
    params: [
      { name: "customer_email", type: "string", required: true, description: "Cliente alvo." },
      { name: "items", type: "array", required: true, description: "Lista de SKUs e quantidades." },
    ],
  },
];

const aiPack: Pack = (b) => [
  {
    id: `${b.id}.generate-text`,
    integrationId: b.id,
    name: "Gerar texto",
    description: `Geração livre via ${b.name} com prompt + contexto opcional.`,
    kind: "action",
    icon: "auto_awesome",
    params: [
      { name: "prompt", type: "string", required: true, description: "Instrução principal." },
      { name: "max_tokens", type: "number", description: "Limite de saída. Default 800." },
    ],
  },
  {
    id: `${b.id}.classify-intent`,
    integrationId: b.id,
    name: "Classificar intenção",
    description: `Classifica a mensagem do usuário em uma das categorias fornecidas via ${b.name}.`,
    kind: "action",
    icon: "category",
    params: [
      { name: "input", type: "string", required: true, description: "Texto a classificar." },
      { name: "labels", type: "array", required: true, description: "Categorias possíveis." },
    ],
  },
  {
    id: `${b.id}.summarize`,
    integrationId: b.id,
    name: "Resumir conversa",
    description: `Sintetiza um histórico ou documento longo via ${b.name}.`,
    kind: "action",
    icon: "compress",
  },
  {
    id: `${b.id}.extract-entities`,
    integrationId: b.id,
    name: "Extrair entidades",
    description: `Identifica nomes, e-mails, telefones, valores e datas em um texto via ${b.name}.`,
    kind: "action",
    icon: "data_object",
  },
];

const signaturesPack: Pack = (b) => [
  {
    id: `${b.id}.send-contract`,
    integrationId: b.id,
    name: "Enviar contrato",
    description: `Dispara um contrato pra assinatura via ${b.name} a partir de um modelo.`,
    kind: "action",
    icon: "draw",
    params: [
      { name: "template_id", type: "string", required: true, description: "Modelo de contrato." },
      { name: "signer_email", type: "string", required: true, description: "E-mail do signatário." },
      { name: "signer_name", type: "string", required: true, description: "Nome completo do signatário." },
    ],
  },
  {
    id: `${b.id}.check-status`,
    integrationId: b.id,
    name: "Conferir status",
    description: `Consulta o status de um contrato em andamento na ${b.name}.`,
    kind: "read",
    icon: "task",
  },
  {
    id: `${b.id}.list-pending`,
    integrationId: b.id,
    name: "Listar pendentes",
    description: `Retorna contratos aguardando assinatura na ${b.name}.`,
    kind: "read",
    icon: "pending_actions",
  },
];

const PACKS: Record<IntegrationCategory, Pack> = {
  checkouts: checkoutsPack,
  meetings: meetingsPack,
  crms: crmsPack,
  forms: formsPack,
  members: membersPack,
  marketplaces: marketplacesPack,
  ai: aiPack,
  signatures: signaturesPack,
};

/* Build the catalog by walking every integration and asking its pack
 * to materialise the tools. Done at module load — the catalog is fully
 * static at runtime. */
export const TOOLS_CATALOG: CatalogTool[] = INTEGRATION_CATALOG.flatMap(
  (integration) => PACKS[integration.cat](integration),
);

export function getToolsForIntegration(integrationId: string): CatalogTool[] {
  return TOOLS_CATALOG.filter((t) => t.integrationId === integrationId);
}

export function findTool(id: string): CatalogTool | undefined {
  return TOOLS_CATALOG.find((t) => t.id === id);
}
