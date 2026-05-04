/** Catalog of supported integrations. Single source of truth for both
 *  the integrations list (catalog modal + cards) and the detail page.
 *  Channels (whatsapp/instagram/messenger) live in /canais and are not
 *  part of this catalog. */

export type IntegrationCategory =
  | "checkouts"
  | "members"
  | "forms"
  | "meetings"
  | "crms"
  | "marketplaces"
  | "ai"
  | "signatures";

export type AuthMethod = "oauth" | "webhook" | "apiKey";

export interface IntegrationCatalogItem {
  id: string;
  cat: IntegrationCategory;
  name: string;
  domain: string;
  desc: string;
  auth: AuthMethod;
  permissions?: string[];
}

export const ADD_MODAL_CATEGORIES: { id: IntegrationCategory; label: string }[] = [
  { id: "ai", label: "Modelos de IA" },
  { id: "checkouts", label: "Checkouts" },
  { id: "members", label: "Área de membros" },
  { id: "forms", label: "Formulários" },
  { id: "meetings", label: "Reuniões" },
  { id: "crms", label: "CRMs" },
  { id: "marketplaces", label: "Marketplaces" },
  { id: "signatures", label: "Assinaturas" },
];

export const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
  checkouts: "Checkout",
  members: "Área de membros",
  forms: "Formulário",
  meetings: "Agenda",
  crms: "CRM",
  marketplaces: "Marketplace",
  ai: "IA",
  signatures: "Assinaturas",
};

export const AUTH_LABELS: Record<AuthMethod, string> = {
  oauth: "OAuth",
  webhook: "Webhook",
  apiKey: "API Key",
};

export const INTEGRATION_CATALOG: IntegrationCatalogItem[] = [
  // Checkouts
  { id: "hotmart", cat: "checkouts", name: "Hotmart", domain: "hotmart.com", desc: "Capture transações e eventos do checkout Hotmart.", auth: "apiKey" },
  { id: "stripe", cat: "checkouts", name: "Stripe", domain: "stripe.com", desc: "Pagamentos globais — cartão, PIX, assinaturas.", auth: "apiKey" },
  { id: "kiwify", cat: "checkouts", name: "Kiwify", domain: "kiwify.com.br", desc: "Sincronize vendas e abandonos do checkout Kiwify.", auth: "webhook" },
  { id: "eduzz", cat: "checkouts", name: "Eduzz", domain: "eduzz.com", desc: "Capture transações do checkout Eduzz.", auth: "webhook" },
  { id: "hubla", cat: "checkouts", name: "Hubla", domain: "hub.la", desc: "Sincronize vendas e clientes da Hubla.", auth: "webhook" },
  { id: "ticto", cat: "checkouts", name: "Ticto", domain: "ticto.com.br", desc: "Receba eventos de venda do checkout Ticto.", auth: "webhook" },
  { id: "lastlink", cat: "checkouts", name: "LastLink", domain: "lastlink.com", desc: "Capture transações e renovações da LastLink.", auth: "webhook" },
  { id: "braip", cat: "checkouts", name: "Braip", domain: "braip.com", desc: "Sincronize vendas e indicações do checkout Braip.", auth: "webhook" },
  { id: "zouti", cat: "checkouts", name: "Zouti", domain: "zouti.com.br", desc: "Capture transações e abandonos do checkout Zouti.", auth: "webhook" },
  { id: "blitzpay", cat: "checkouts", name: "BlitzPay", domain: "blitzpay.com.br", desc: "Receba eventos do checkout BlitzPay em tempo real.", auth: "webhook" },
  { id: "onprofit", cat: "checkouts", name: "OnProfit", domain: "onprofit.com.br", desc: "Sincronize vendas e assinaturas do OnProfit.", auth: "webhook" },
  { id: "greenn", cat: "checkouts", name: "Greenn", domain: "greenn.com.br", desc: "Conecte vendas e clientes do checkout Greenn.", auth: "webhook" },
  { id: "payt", cat: "checkouts", name: "Payt", domain: "payt.com.br", desc: "Receba eventos de venda do checkout Payt.", auth: "webhook" },
  { id: "pagtrust", cat: "checkouts", name: "PagTrust", domain: "pagtrust.com.br", desc: "Sincronize transações do checkout PagTrust.", auth: "webhook" },
  { id: "tmb", cat: "checkouts", name: "TMB", domain: "tmb.education", desc: "Capture eventos de venda do checkout TMB.", auth: "webhook" },
  { id: "dmg", cat: "checkouts", name: "Digital Manager Guru", domain: "digitalmanager.guru", desc: "Sincronize vendas e assinaturas do DMG.", auth: "webhook" },
  // Members
  { id: "memberkit", cat: "members", name: "MemberKit", domain: "memberkit.com.br", desc: "Sincronize alunos e progresso da área de membros.", auth: "apiKey" },
  { id: "cademi", cat: "members", name: "Cademi", domain: "cademi.com.br", desc: "Conecte sua área de membros Cademi para automações.", auth: "apiKey" },
  // Forms
  {
    id: "googleforms",
    cat: "forms",
    name: "Google Forms",
    domain: "forms.google.com",
    desc: "Receba submissões do Google Forms em tempo real.",
    auth: "oauth",
    permissions: [
      "Acessar a lista de formulários da conta",
      "Receber respostas em tempo real",
      "Ler metadados das perguntas",
    ],
  },
  {
    id: "typeform",
    cat: "forms",
    name: "Typeform",
    domain: "typeform.com",
    desc: "Capture leads dos seus formulários conversacionais.",
    auth: "oauth",
    permissions: [
      "Acessar formulários da workspace",
      "Receber novas respostas via webhook",
      "Ler informações do respondente",
    ],
  },
  { id: "tally", cat: "forms", name: "Tally", domain: "tally.so", desc: "Formulários simples — dispare ações com cada submissão.", auth: "apiKey" },
  // Meetings
  {
    id: "calendly",
    cat: "meetings",
    name: "Calendly",
    domain: "calendly.com",
    desc: "Agendamentos automáticos sincronizados com agentes.",
    auth: "oauth",
    permissions: [
      "Acessar tipos de evento e disponibilidade",
      "Criar e cancelar agendamentos",
      "Receber notificações de novos eventos",
    ],
  },
  {
    id: "googlecal",
    cat: "meetings",
    name: "Google Calendar",
    domain: "calendar.google.com",
    desc: "Reuniões e disponibilidade direto do Google Agenda.",
    auth: "oauth",
    permissions: [
      "Ler eventos e disponibilidade da agenda",
      "Criar e atualizar eventos em seu nome",
      "Acessar agendas compartilhadas",
    ],
  },
  // CRMs
  {
    id: "pipedrive",
    cat: "crms",
    name: "Pipedrive",
    domain: "pipedrive.com",
    desc: "Sincronize contatos, deals e atividades do Pipedrive.",
    auth: "oauth",
    permissions: [
      "Acessar contatos, organizações e deals",
      "Criar e atualizar atividades",
      "Mover deals entre etapas do pipeline",
    ],
  },
  {
    id: "kommo",
    cat: "crms",
    name: "Kommo",
    domain: "kommo.com",
    desc: "Conecte funis, leads e tarefas do Kommo CRM.",
    auth: "oauth",
    permissions: [
      "Acessar leads, contatos e empresas",
      "Criar e atualizar tarefas",
      "Mover leads entre etapas do funil",
    ],
  },
  {
    id: "rdstation",
    cat: "crms",
    name: "RD Station",
    domain: "rdstation.com",
    desc: "Sincronize leads, oportunidades e tags do RD Station.",
    auth: "oauth",
    permissions: [
      "Acessar leads e oportunidades",
      "Criar e atualizar tags",
      "Disparar eventos de conversão",
    ],
  },
  {
    id: "hubspot",
    cat: "crms",
    name: "HubSpot",
    domain: "hubspot.com",
    desc: "Conecte contatos, empresas e pipelines do HubSpot.",
    auth: "oauth",
    permissions: [
      "Acessar contatos e empresas",
      "Criar e atualizar deals do pipeline",
      "Disparar workflows quando uma oportunidade fechar",
    ],
  },
  // AI Providers
  { id: "claude", cat: "ai", name: "Claude", domain: "anthropic.com", desc: "Conecte sua chave da Anthropic e use Claude como cérebro dos agentes.", auth: "apiKey" },
  { id: "chatgpt", cat: "ai", name: "ChatGPT", domain: "openai.com", desc: "Use os modelos GPT da OpenAI nas execuções dos seus agentes.", auth: "apiKey" },
  { id: "deepseek", cat: "ai", name: "DeepSeek", domain: "deepseek.com", desc: "Conecte sua chave DeepSeek e habilite os modelos R1 e V3.", auth: "apiKey" },
  // Signatures
  { id: "assiny", cat: "signatures", name: "Assiny", domain: "assiny.com.br", desc: "Envie e acompanhe contratos com assinatura eletrônica.", auth: "apiKey" },
  // Marketplaces
  {
    id: "shopify",
    cat: "marketplaces",
    name: "Shopify",
    domain: "shopify.com",
    desc: "Gerencie produtos, pedidos e clientes pela IA.",
    auth: "oauth",
    permissions: [
      "Acessar catálogo de produtos e estoque",
      "Ler pedidos e clientes",
      "Criar rascunhos de pedido e cupons",
    ],
  },
  { id: "magalu", cat: "marketplaces", name: "Magalu", domain: "magalu.com", desc: "Sincronize produtos e pedidos do marketplace Magalu.", auth: "apiKey" },
];

export function findIntegration(id: string): IntegrationCatalogItem | undefined {
  return INTEGRATION_CATALOG.find((i) => i.id === id);
}
