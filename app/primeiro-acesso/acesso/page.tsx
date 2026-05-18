import AuthFlow from "@/components/auth/AuthFlow"

// A etapa de acesso do primeiro acesso reusa o mesmo fluxo de login do app.
// Em modo "primeiro-acesso" o AuthFlow, ao concluir, segue para o perfil em
// vez do dashboard — autenticação acontece antes de termos e pagamentos.
export default function AcessoPage() {
  return <AuthFlow mode="primeiro-acesso" />
}
