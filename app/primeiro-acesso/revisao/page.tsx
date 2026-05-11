import Link from "next/link"
import type { Metadata } from "next"
import { Icon } from "@/components/ui/Icon"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG, ONBOARDING_USER } from "../_data"

export const metadata: Metadata = {
  title: "Revisão · Primeiro acesso · AwSales",
  description:
    "Confirme os dados do contrato cadastrados pela equipe AwSales antes de seguir para o pagamento.",
}

type Row = {
  label: string
  value: React.ReactNode
  total?: boolean
}

const ROWS: Row[] = [
  { label: "Organização", value: ONBOARDING_ORG.name },
  { label: "Razão social", value: ONBOARDING_ORG.razaoSocial },
  {
    label: "CNPJ",
    value: (
      <span className="font-mono" style={{ fontSize: 12.5, fontWeight: 400 }}>
        {ONBOARDING_ORG.cnpj}
      </span>
    ),
  },
  {
    label: "Plano",
    value: `${ONBOARDING_ORG.plan} · ${ONBOARDING_ORG.contractTerm}`,
  },
  { label: "Account Manager", value: ONBOARDING_ORG.accountManager },
  {
    label: "Admin responsável",
    value: (
      <>
        {ONBOARDING_USER.name}{" "}
        <span
          className="font-mono text-fg-tertiary"
          style={{ fontSize: 11, fontWeight: 400 }}
        >
          · {ONBOARDING_USER.email}
        </span>
      </>
    ),
  },
  {
    label: "Mensalidade",
    value: (
      <>
        {ONBOARDING_ORG.valorMensal}{" "}
        <span
          className="text-fg-tertiary"
          style={{ fontSize: 11, fontWeight: 400 }}
        >
          · a partir do 2º mês
        </span>
      </>
    ),
  },
  {
    label: "Implementação (hoje)",
    value: ONBOARDING_ORG.valorImplementacao,
    total: true,
  },
]

export default function RevisaoPage() {
  return (
    <AwOnboardingShell currentStep={2} org={ONBOARDING_ORG}>
      <section>
        <h1
          className="mb-2 font-display font-medium text-fg-primary text-balance"
          style={{
            fontSize: "var(--h3-size)",
            lineHeight: 1.15,
            letterSpacing: "-0.015em",
          }}
        >
          Confirme os dados do contrato.
        </h1>

        <p
          className="mb-7 text-fg-secondary text-pretty"
          style={{ fontSize: "var(--body-sm-size)", lineHeight: 1.5 }}
        >
          Estes dados foram cadastrados pela equipe AwSales no momento da
          contratação. Se algo estiver incorreto, fale com{" "}
          {ONBOARDING_ORG.accountManager.split(" ")[0]} antes de seguir.
        </p>

        <dl className="m-0 overflow-hidden rounded-lg border border-border-subtle bg-bg-raised">
          {ROWS.map((row, i) => (
            <div
              key={row.label}
              className={[
                "grid grid-cols-[180px_1fr] px-4 py-3.5",
                i < ROWS.length - 1 ? "border-b border-border-subtle" : "",
                row.total ? "bg-bg-surface" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ fontSize: 13 }}
            >
              <dt
                className="text-fg-tertiary"
                style={{ fontSize: 12, letterSpacing: "0.01em" }}
              >
                {row.label}
              </dt>
              <dd
                className="m-0 font-medium text-fg-primary"
                style={{ fontSize: row.total ? 16 : 13, fontWeight: row.total ? 600 : 500 }}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
          <Link
            href="/primeiro-acesso/boas-vindas"
            className="aw-btn aw-btn--ghost aw-btn--md"
          >
            <Icon name="arrow_back" size={16} />
            <span className="aw-btn__label">Voltar</span>
          </Link>
          <span className="flex-1" />
          <Link
            href="/primeiro-acesso/pagamento"
            className="aw-btn aw-btn--primary aw-btn--md"
          >
            <span className="aw-btn__label">Ir para o pagamento</span>
            <Icon name="arrow_forward" size={16} />
          </Link>
        </footer>
      </section>
    </AwOnboardingShell>
  )
}
