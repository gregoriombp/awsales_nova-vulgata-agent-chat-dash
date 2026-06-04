/**
 * Metadados leves dos UX flows que vivem no styleguide.
 *
 * Propositalmente SEM importar as páginas dos flows (que arrastam o @xyflow/react
 * via FlowDiagram) — assim a galeria-índice continua um bundle leve. Os NODES/EDGES
 * de verdade só são carregados na rota do viewer, em `[slug]/flow-data.ts`.
 *
 * `screens` = contagem de telas (nós do tipo "screen") de cada flow.
 * `updatedAt` = data da última entrada do `updates[]` da página do flow.
 */

export type FlowGroup = "Acesso" | "Onboarding"

export type FlowMeta = {
  slug: string
  title: string
  description: string
  group: FlowGroup
  /** Altura do canvas usada na página do styleguide — reaproveitada no viewer. */
  height: number
  /** Telas (nós "screen") no flow. */
  screens: number
  /** Última atualização registrada no `updates[]` da página. */
  updatedAt: string
}

export const FLOW_META: FlowMeta[] = [
  {
    slug: "login-auth",
    title: "Login",
    description:
      "Acesso à plataforma de ponta a ponta: e-mail + senha com verificação, OAuth (Google e Microsoft), seletor de organização, recuperação de senha e detecção de primeiro acesso.",
    group: "Acesso",
    height: 2240,
    screens: 17,
    updatedAt: "2026-06-03",
  },
  {
    slug: "primeiro-acesso",
    title: "Primeiro acesso",
    description:
      "Onboarding do novo cliente em 6 etapas. Autentica logo no começo — antes do contrato e de qualquer pagamento — e segue até a operação configurada.",
    group: "Onboarding",
    height: 1930,
    screens: 19,
    updatedAt: "2026-06-03",
  },
  {
    slug: "convite-membro",
    title: "Convite de membro",
    description:
      "O caminho de quem clica no magic link do convite: boas-vindas, criação de conta, perfil, 2FA (se a org exige) e confirmação — sem fricção pra quem foi convidado pelo admin.",
    group: "Onboarding",
    height: 1780,
    screens: 16,
    updatedAt: "2026-06-03",
  },
  {
    slug: "organizacao-adicional",
    title: "Organização adicional",
    description:
      "Subflow disparado do login: usuário já cadastrado que comprou um plano novo pra outra organização e escolheu configurá-la agora. Mesmas etapas do primeiro acesso, menos o perfil.",
    group: "Onboarding",
    height: 1180,
    screens: 11,
    updatedAt: "2026-06-03",
  },
]

export const FLOW_GROUPS: FlowGroup[] = ["Acesso", "Onboarding"]

export function getFlowMeta(slug: string): FlowMeta | undefined {
  return FLOW_META.find((f) => f.slug === slug)
}
