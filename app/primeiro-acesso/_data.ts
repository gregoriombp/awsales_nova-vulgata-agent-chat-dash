/** Formata um número como moeda brasileira (R$ 1.583,33). */
export const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

/** Rótulo legível do método de autenticação propagado pelo query param `metodo`. */
export const AUTH_METHOD_LABELS: Record<string, string> = {
  google: "Google SSO",
  microsoft: "Microsoft SSO",
  senha: "Senha",
}

export const authMethodLabel = (metodo: string | null | undefined) =>
  (metodo && AUTH_METHOD_LABELS[metodo]) || "Conta segura"

export type OnboardingContact = {
  name: string
  role: string
  email: string
  phone: string
  initials: string
  photo?: string
}

export type OnboardingVencimento = {
  mes: string
  valor: number
  vencimento: string
  /** Mês cobrado proporcionalmente aos dias restantes (1ª mensalidade). */
  prorrata?: boolean
}

export const ONBOARDING_ORG = {
  name: "Fyntra Tecnologia",
  razaoSocial: "Fyntra Tecnologia LTDA",
  logo: "/assets/icon_artificial_concord_organization.png",
  cnpj: "12.345.678/0001-90",
  segmento: "SaaS",
  porte: "Médio (50–500 FTE)",
  plan: "Pro",
  contractTerm: "12 meses",
  fidelidade: "12 meses · multa de 50% sobre o saldo",
  intervaloPlano: "Mensal",
  limiteUsoVariavel: "R$ 300/mês",
  // Valores brutos — números, para o cálculo de parcelas no pagamento.
  valorImplementacao: 12000,
  valorMensal: 2500,
  valorMensalProrrata: 1583.33,
  diasRestantesMesAtual: 19,
  diaVencimento: 10,
  dataPrimeiroVencimento: "10/06/2026",
  proximosVencimentos: [
    { mes: "Junho 2026", valor: 1583.33, vencimento: "10/06/2026", prorrata: true },
    { mes: "Julho 2026", valor: 2500, vencimento: "10/07/2026" },
    { mes: "Agosto 2026", valor: 2500, vencimento: "10/08/2026" },
    { mes: "Setembro 2026", valor: 2500, vencimento: "10/09/2026" },
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
  brandBackground: "/assets/group-backgrounds/group-bg-17.jpg",
}

export const ONBOARDING_USER: {
  name: string
  firstName: string
  email: string
  photo?: string
} = {
  name: "Ricardo Almeida",
  firstName: "Ricardo",
  email: "ricardo.almeida@fyntra.com.br",
}
