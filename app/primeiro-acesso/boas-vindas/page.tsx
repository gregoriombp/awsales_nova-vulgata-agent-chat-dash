import Link from "next/link"
import type { Metadata } from "next"
import { Icon } from "@/components/ui/Icon"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG, ONBOARDING_USER } from "../_data"

export const metadata: Metadata = {
  title: "Boas-vindas · Primeiro acesso · AwSales",
  description:
    "Ative o ambiente da sua organização na AwSales: revise dados, finalize o pagamento e escolha como vai acessar a plataforma.",
}

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
    <AwOnboardingShell currentStep={1} org={ONBOARDING_ORG}>
      <section>
        <h1
          className="mb-2 font-display font-medium text-fg-primary text-balance"
          style={{
            fontSize: "var(--h3-size)",
            lineHeight: 1.15,
            letterSpacing: "-0.015em",
          }}
        >
          Olá, {ONBOARDING_USER.firstName}. Vamos ativar o ambiente da {ONBOARDING_ORG.name}.
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
