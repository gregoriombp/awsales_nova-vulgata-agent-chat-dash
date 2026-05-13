export const ONBOARDING_ORG = {
  name: "Fyntra Tecnologia",
  razaoSocial: "Fyntra Tecnologia LTDA",
  cnpj: "12.345.678/0001-90",
  segmento: "SaaS",
  porte: "Médio (50–500 FTE)",
  plan: "Pro",
  contractTerm: "12 meses",
  fidelidade: "12 meses · multa de 50% sobre o saldo",
  intervaloPlano: "Mensal",
  limiteUsoVariavel: "R$ 300/mês (Padrão)",
  valorImplementacao: "R$ 12.000,00",
  valorMensal: "R$ 2.500,00",
  valorMensalProrrata: "R$ 1.583,33",
  diasRestantesMesAtual: 19,
  diaVencimento: 10,
  dataPrimeiroVencimento: "10/06/2026",
  proximosVencimentos: [
    { mes: "Junho 2026", valor: "R$ 1.583,33", vencimento: "10/06/2026" },
    { mes: "Julho 2026", valor: "R$ 2.500,00", vencimento: "10/07/2026" },
    { mes: "Agosto 2026", valor: "R$ 2.500,00", vencimento: "10/08/2026" },
  ],
  metodosImplementacao: "Cartão · Pix · Boleto",
  metodosPlano: "Cartão · Boleto",
  parcelamentoImplementacao: "Até 4x no cartão · entrada à vista",
  parcelamentoMaxImplementacao: 4,
  accountManager: "Lucas Vieira",
  accountManagerPhoto: "/assets/ui-faces/male-7.jpg",
  representanteComercial: "Beatriz Andrade",
  representanteComercialPhoto: "/assets/ui-faces/female-3.jpg",
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
