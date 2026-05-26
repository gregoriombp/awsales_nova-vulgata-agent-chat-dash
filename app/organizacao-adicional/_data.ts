import type { OnboardingContact, OnboardingVencimento } from "../primeiro-acesso/_data"

/**
 * Organização sendo configurada num segundo plano comprado pelo mesmo usuário.
 * Estrutura idêntica a ONBOARDING_ORG — preview mostra dados distintos pra
 * deixar claro que é uma segunda org sendo adicionada.
 */
export const ADDITIONAL_ORG = {
  name: "Núcleo Performance",
  razaoSocial: "Núcleo Performance Consultoria LTDA",
  logo: "/assets/icon_artificial_concord_organization.png",
  cnpj: "98.765.432/0001-21",
  segmento: "Consultoria",
  porte: "Pequeno (10–50 FTE)",
  plan: "Starter",
  contractTerm: "12 meses",
  fidelidade: "12 meses · multa de 50% sobre o saldo",
  intervaloPlano: "Mensal",
  limiteUsoVariavel: "R$ 150/mês",
  valorImplementacao: 6000,
  valorMensal: 1200,
  valorMensalProrrata: 760,
  diasRestantesMesAtual: 19,
  diaVencimento: 10,
  dataPrimeiroVencimento: "10/06/2026",
  proximosVencimentos: [
    { mes: "Junho 2026", valor: 760, vencimento: "10/06/2026", prorrata: true },
    { mes: "Julho 2026", valor: 1200, vencimento: "10/07/2026" },
    { mes: "Agosto 2026", valor: 1200, vencimento: "10/08/2026" },
    { mes: "Setembro 2026", valor: 1200, vencimento: "10/09/2026" },
  ] as OnboardingVencimento[],
  parcelamentoMaxImplementacao: 4,
  accountManager: {
    name: "Lucas Vieira",
    role: "Account Manager",
    email: "lucas.vieira@awsales.com.br",
    phone: "+55 11 98765-4321",
    initials: "LV",
    photo: "/assets/ui-faces/male-7.jpg",
  } satisfies OnboardingContact,
  representanteComercial: {
    name: "Beatriz Andrade",
    role: "Representante Comercial",
    email: "beatriz.andrade@awsales.com.br",
    phone: "+55 11 91234-5678",
    initials: "BA",
    photo: "/assets/ui-faces/female-3.jpg",
  } satisfies OnboardingContact,
  brandBackground: "/assets/group-backgrounds/group-bg-09.jpg",
}
