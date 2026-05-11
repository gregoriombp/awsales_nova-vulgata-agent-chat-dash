import Link from "next/link"
import type { Metadata } from "next"
import { Icon } from "@/components/ui/Icon"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"

export const metadata: Metadata = {
  title: "Boas-vindas · Primeiro acesso · AwSales",
  description:
    "Ative o ambiente da sua organização na AwSales: revise dados, finalize o pagamento e escolha como vai acessar a plataforma.",
}

const MOCK_ORG = {
  name: "Magalu Pay",
  cnpj: "47.960.950/0001-21",
  plan: "Enterprise",
  contractTerm: "12 meses",
}

const MOCK_USER_FIRST_NAME = "Ricardo"

const STEPS = [
  {
    icon: "fact_check",
    title: "Revisar dados",
    description: "CNPJ, plano e valor",
  },
  {
    icon: "payments",
    title: "Finalizar pagamento",
    description: "Pix, cartão ou boleto",
  },
  {
    icon: "key",
    title: "Definir acesso",
    description: "SSO, magic-link ou senha",
  },
  {
    icon: "neurology",
    title: "Entrar no Agent Studio",
    description: "Configurar seu primeiro agente",
  },
]

export default function BoasVindasPage() {
  return (
    <AwOnboardingShell currentStep={1} org={MOCK_ORG}>
      <section>
        <div
          className="mb-3.5 font-mono uppercase text-fg-tertiary"
          style={{ fontSize: 10, letterSpacing: "0.08em" }}
        >
          primeiro acesso · etapa 1 de 4
        </div>

        <h1
          className="mb-2 font-display font-medium text-fg-primary text-balance"
          style={{
            fontSize: "var(--h3-size)",
            lineHeight: 1.15,
            letterSpacing: "-0.015em",
          }}
        >
          Olá, {MOCK_USER_FIRST_NAME}. Vamos ativar o ambiente da {MOCK_ORG.name}.
        </h1>

        <p
          className="mb-7 text-fg-secondary text-pretty"
          style={{ fontSize: "var(--body-sm-size)", lineHeight: 1.5 }}
        >
          Sua organização e plano já foram configurados pela equipe AwSales.
          Você só precisa confirmar os dados, finalizar o pagamento da
          implementação e escolher como vai acessar a plataforma.
        </p>

        <ol className="mb-6 grid grid-cols-2 gap-2.5 list-none p-0">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-raised px-4 py-3.5"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-bg-muted text-fg-primary">
                <Icon name={step.icon} size={18} />
              </span>
              <span className="min-w-0">
                <span
                  className="block font-medium text-fg-primary"
                  style={{ fontSize: 13 }}
                >
                  {i + 1}. {step.title}
                </span>
                <span
                  className="block text-fg-tertiary"
                  style={{ fontSize: 11 }}
                >
                  {step.description}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
          <span className="flex-1" />
          <span
            className="font-mono text-fg-tertiary"
            style={{ fontSize: 10, letterSpacing: "0.04em" }}
          >
            leva ~3 min
          </span>
          <Link
            href="/primeiro-acesso/revisao"
            className="aw-btn aw-btn--primary aw-btn--md"
          >
            <span className="aw-btn__label">Começar configuração</span>
            <Icon name="arrow_forward" size={16} />
          </Link>
        </footer>
      </section>
    </AwOnboardingShell>
  )
}
