/** Dados de mock do fluxo de aceitação de convite. Espelha o membro com
 * `status: "invited"` que existe em settings/equipe-permissoes — Beatriz
 * Mendes — e o inviter Gregório Pinheiro (Administrador). */

export type ConviteOrg = {
  name: string
  cnpj: string
  plan: string
  contractTerm: string
  logo?: string
  brandBackground: string
}

export type ConvitePerson = {
  name: string
  firstName: string
  email: string
  role: string
  initials: string
  photo?: string
}

export type ConviteRole = {
  name: string
  description: string
  permissionCount: number
  /** Grupos/squads em que o membro já vai entrar — propagados pelo inviter. */
  groups: string[]
}

export const CONVITE_ORG: ConviteOrg = {
  name: "Fyntra Tecnologia",
  cnpj: "12.345.678/0001-90",
  plan: "Pro",
  contractTerm: "12 meses",
  logo: "/assets/icon_artificial_concord_organization.png",
  brandBackground: "/assets/group-backgrounds/group-bg-17.jpg",
}

export const CONVITE_INVITER: ConvitePerson = {
  name: "Gregório Pinheiro",
  firstName: "Gregório",
  email: "greg@awsales.io",
  role: "Administrador",
  initials: "GP",
  photo: "/assets/users/greg.jpg",
}

export const CONVITE_INVITEE: ConvitePerson = {
  name: "Beatriz Mendes",
  firstName: "Beatriz",
  email: "beatriz@awsales.io",
  role: "Operador",
  initials: "BM",
  photo: "/assets/ui-faces/female-6.jpg",
}

export const CONVITE_ROLE: ConviteRole = {
  name: "Operador",
  description:
    "Acesso básico focado em monitoramento e suporte. Visualiza a maioria das áreas e usa o playground para testes.",
  permissionCount: 18,
  groups: ["Atendimento · Pré-venda", "Plantão WhatsApp"],
}

/** Hora em que o link expira (mock — 48h após o envio). */
export const CONVITE_EXPIRA_EM = "48 horas"
