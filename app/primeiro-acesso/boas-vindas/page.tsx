import Link from "next/link"
import type { Metadata } from "next"
import { AwButton } from "@/components/ui/AwButton"
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
    icon: "manage_accounts",
    title: "Configurar sua conta",
    description: "Perfil, acesso e preferências",
  },
]

export default function BoasVindasPage() {
  return (
    <AwOnboardingShell currentStep={3} org={ONBOARDING_ORG}>
      <section>
        <h3 className="mb-2 text-fg-primary text-balance">
          Olá, {ONBOARDING_USER.firstName}. Vamos ativar o ambiente da {ONBOARDING_ORG.name}.
        </h3>

        <p className="mb-7 body-sm text-fg-secondary text-pretty">
          Sua organização e plano já foram configurados pela equipe AwSales.
          Você só precisa confirmar os dados, finalizar o pagamento da
          implementação e escolher como vai acessar a plataforma.
        </p>

        <ol className="mb-6 list-none p-0">
          {STEPS.map((step, i) => {
            const isLast = i === STEPS.length - 1
            return (
              <li
                key={step.title}
                className={`relative flex gap-4 ${isLast ? "" : "pb-5"}`}
              >
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[17px] top-[34px] w-px bg-border"
                    style={{ bottom: 0 }}
                  />
                )}
                <span className="relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-fg-primary text-white shadow-sm">
                  <Icon name={step.icon} size={16} />
                </span>
                <div className="min-w-0 pt-1.5">
                  <div className="body-sm font-medium text-fg-primary">
                    {i + 1}. {step.title}
                  </div>
                  <div className="body-xs text-fg-tertiary">
                    {step.description}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>

        <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
          <span className="flex-1" />
          <AwButton asChild size="md" variant="primary" iconRight="arrow_forward">
            <Link href="/primeiro-acesso/revisao">Começar configuração</Link>
          </AwButton>
        </footer>
      </section>
    </AwOnboardingShell>
  )
}
