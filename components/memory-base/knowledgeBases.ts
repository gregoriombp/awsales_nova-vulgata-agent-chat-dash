/**
 * Modelo das "bases de conhecimento" listadas na Memory Base.
 *
 * Camadas (ver arquitetura do produto):
 *   • Memory Base       → o produto (ícone pontilhado).
 *   • Base de conhecimento → cada item desta lista (ícone de instituição). Reúne
 *     fontes (arquivos, integrações, sites).
 *   • Knowledge layers  → resultado da análise de IA sobre cada fonte; a soma por
 *     base é o total de `knowledgeLayers`.
 *
 * Mock client-side — o repo é preview de UX, não fonte de verdade.
 */

export type KnowledgeBaseStatus = "ativo" | "inativo";

export type KnowledgeBase = {
  id: string;
  name: string;
  status: KnowledgeBaseStatus;
  /** Para que serve a base. Ex.: "Vendas". */
  objetivo: string;
  /** Segmento de negócio. Ex.: "Produto físico". */
  segmento: string;
  /** Natureza dos dados. Ex.: "Catálogo". */
  tipoDados: string;
  /** Itens de catálogo cobertos. */
  produtos: number;
  /** Fontes de conhecimento (arquivos, integrações, sites). */
  fontes: number;
  /** Soma dos knowledge layers gerados pela IA. */
  knowledgeLayers: number;
  /** Agentes que consomem a base — ids resolvem o orb via getOrbForAgent. */
  agents: string[];
  /** Última modificação, já formatada para exibição. */
  updatedAt: string;
};

export const MOCK_KNOWLEDGE_BASES: KnowledgeBase[] = [
  {
    id: "fyntra-produtos",
    name: "Fyntra produtos",
    status: "ativo",
    objetivo: "Vendas",
    segmento: "Produto físico",
    tipoDados: "Catálogo",
    produtos: 26,
    fontes: 5,
    knowledgeLayers: 178,
    agents: ["sales", "customer-support"],
    updatedAt: "04 de mar 2026",
  },
  {
    id: "suporte-tecnico",
    name: "Suporte técnico",
    status: "ativo",
    objetivo: "Suporte",
    segmento: "SaaS",
    tipoDados: "Documentação",
    produtos: 4,
    fontes: 12,
    knowledgeLayers: 342,
    agents: ["customer-support", "it-support", "qa"],
    updatedAt: "02 de mar 2026",
  },
  {
    id: "politicas-internas",
    name: "Políticas internas",
    status: "ativo",
    objetivo: "RH",
    segmento: "Interno",
    tipoDados: "Manual",
    produtos: 0,
    fontes: 7,
    knowledgeLayers: 96,
    agents: ["hr"],
    updatedAt: "27 de fev 2026",
  },
  {
    id: "playbook-vendas",
    name: "Playbook de vendas",
    status: "ativo",
    objetivo: "Vendas",
    segmento: "Serviços",
    tipoDados: "Scripts",
    produtos: 0,
    fontes: 9,
    knowledgeLayers: 154,
    agents: ["sales"],
    updatedAt: "21 de fev 2026",
  },
  {
    id: "base-research",
    name: "Inteligência de mercado",
    status: "inativo",
    objetivo: "Research",
    segmento: "Multi-segmento",
    tipoDados: "Relatórios",
    produtos: 0,
    fontes: 18,
    knowledgeLayers: 503,
    agents: ["research", "data"],
    updatedAt: "12 de fev 2026",
  },
  {
    id: "onboarding-clientes",
    name: "Onboarding de clientes",
    status: "ativo",
    objetivo: "Sucesso do cliente",
    segmento: "SaaS",
    tipoDados: "Tutoriais",
    produtos: 3,
    fontes: 6,
    knowledgeLayers: 121,
    agents: ["onboarding", "customer-support"],
    updatedAt: "09 de fev 2026",
  },
];

/** Rótulo de status capitalizado para exibição/filtro. */
export function statusLabel(status: KnowledgeBaseStatus): string {
  return status === "ativo" ? "Ativo" : "Inativo";
}

/** "Utilizado por N agente(s)" — trata singular/zero. */
export function agentUsageLabel(count: number): string {
  if (count === 0) return "Sem agentes";
  return `Utilizado por ${count} ${count === 1 ? "agente" : "agentes"}`;
}

/** Valores distintos de um campo (para popular os filtros). */
export function distinctValues(
  bases: KnowledgeBase[],
  key: "objetivo" | "segmento" | "tipoDados",
): string[] {
  return Array.from(new Set(bases.map((b) => b[key]))).sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}
