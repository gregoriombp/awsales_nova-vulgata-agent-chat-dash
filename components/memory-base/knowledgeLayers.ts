/**
 * Mock dos Knowledge Layers (aba "Playbook") e dos Produtos (aba "Produtos") de
 * uma base de conhecimento. Reconstrução da Tela 10 do flow do Figma (Memory Base),
 * importada via Bombardier. Compartilhado entre a aba do detalhe da base
 * (KnowledgeLayersTab) e a página de edição de Knowledge Layer.
 *
 * Repo é preview de UX — sem backend, dados estáticos.
 */

export type KLQuality = "Muito alta" | "Alta" | "Razoável" | "Péssimo";

export type KnowledgeLayer = {
  id: string;
  title: string;
  desc: string;
  fonte: string;
  /** Agentes que consomem a layer — ids resolvem o orb via getOrbForAgent. */
  agents: string[];
  mod: string;
  q: KLQuality;
  /** Linha de "Taxa de utilização e qualidade" (ex.: "Usada 43 mil vezes…"). */
  qualityNote: string;
  /** Conteúdo editável na página de edição da layer. */
  pergunta: string;
  resposta: string;
};

/** Cor do rótulo de qualidade, mapeada aos accents do DS. */
export const QUALITY_COLOR: Record<KLQuality, string> = {
  "Muito alta": "var(--accent-success)",
  Alta: "var(--accent-success)",
  Razoável: "var(--accent-warning)",
  Péssimo: "var(--accent-danger)",
};

export const KNOWLEDGE_LAYERS: KnowledgeLayer[] = [
  {
    id: "kl1",
    title: "O que é a Fyntra?",
    desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut faucibus at dui.",
    fonte: "Market_Analysis_Q3.pdf",
    agents: ["sales"],
    mod: "04 de mar 2026",
    q: "Muito alta",
    qualityNote: "Usada 43 mil vezes, com avaliação média acima de 99%.",
    pergunta: "O que é a Fyntra?",
    resposta:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut faucibus at dui eu gravida. Etiam nec pretium est, ac suscipit nibh.",
  },
  {
    id: "kl2",
    title: "Benefícios do produto Swiss Airlines",
    desc: "Sumário dos principais argumentos para o cliente.",
    fonte: "Project_Roadmap_2024.pdf",
    agents: ["sales", "customer-support"],
    mod: "04 de mar 2026",
    q: "Alta",
    qualityNote: "Usada 15 mil vezes, com avaliação média acima de 95%.",
    pergunta: "Quais os benefícios do produto Swiss Airlines?",
    resposta:
      "Os principais benefícios incluem flexibilidade de remarcação, bagagem inclusa e atendimento prioritário nos principais aeroportos.",
  },
  {
    id: "kl3",
    title: "Política de reembolso",
    desc: "Regras e prazos de reembolso por canal.",
    fonte: "Report.pdf",
    agents: ["customer-support"],
    mod: "04 de mar 2026",
    q: "Péssimo",
    qualityNote: "Usada menos de dez vezes.",
    pergunta: "Como funciona a política de reembolso?",
    resposta:
      "Reembolsos podem ser solicitados em até 7 dias após a compra, com estorno em até 2 ciclos de fatura conforme o canal de pagamento.",
  },
  {
    id: "kl4",
    title: "Processo de onboarding",
    desc: "Passo a passo do onboarding do cliente novo.",
    fonte: "Assessment.pdf",
    agents: ["onboarding"],
    mod: "04 de mar 2026",
    q: "Razoável",
    qualityNote: "Usada 9 mil vezes, com avaliação média acima de 65%.",
    pergunta: "Como é o processo de onboarding?",
    resposta:
      "O onboarding tem três etapas: configuração da conta, importação de dados e ativação do primeiro agente, com acompanhamento do time de sucesso.",
  },
  {
    id: "kl5",
    title: "Auditoria interna 2026",
    desc: "Sumário dos achados da auditoria interna.",
    fonte: "Internal_Audit_Findings.pdf",
    agents: ["research", "data"],
    mod: "04 de mar 2026",
    q: "Muito alta",
    qualityNote: "Usada 43 mil vezes, com avaliação média acima de 99%.",
    pergunta: "O que a auditoria interna de 2026 apontou?",
    resposta:
      "A auditoria apontou conformidade nos processos críticos e recomendou ajustes pontuais no controle de acesso e na retenção de logs.",
  },
];

export function getKnowledgeLayer(id: string): KnowledgeLayer | undefined {
  return KNOWLEDGE_LAYERS.find((l) => l.id === id);
}

export type BaseProduct = {
  id: string;
  nome: string;
  sub: string;
  cat: string;
  arq: string;
  preco: string;
};

export const BASE_PRODUCTS: BaseProduct[] = [
  { id: "1233456", nome: "E-commerce platform", sub: "Produto compartilhado", cat: "Assinatura", arq: "fyntra_process.pdf +3", preco: "R$0,00" },
  { id: "789101", nome: "Chatbot inteligente", sub: "Novo produto", cat: "Assinatura", arq: "fyntra_process.pdf", preco: "R$0,00" },
  { id: "111213", nome: "Dashboard analytics", sub: "Novo produto", cat: "Assinatura", arq: "fyntra_process.pdf", preco: "R$0,00" },
  { id: "141516", nome: "App mobile banking", sub: "Novo produto", cat: "Assinatura", arq: "fyntra_process.pdf +3", preco: "R$0,00" },
  { id: "171819", nome: "Blueprint do Negócio Online", sub: "Novo produto", cat: "Assinatura", arq: "fyntra_process.pdf +3", preco: "R$0,00" },
];
