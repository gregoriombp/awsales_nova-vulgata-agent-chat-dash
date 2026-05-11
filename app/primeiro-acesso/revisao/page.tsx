import Link from "next/link"
import type { Metadata } from "next"
import { Icon } from "@/components/ui/Icon"
import { AwAvatar } from "@/components/ui/AwAvatar"
import { AwFileIcon } from "@/components/ui/AwFileIcon"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG, ONBOARDING_USER } from "../_data"

export const metadata: Metadata = {
  title: "Revisão · Primeiro acesso · AwSales",
  description:
    "Confirme os termos contratuais cadastrados pela equipe AwSales antes de prosseguir para o pagamento.",
}

type Row = {
  label: string
  value: React.ReactNode
  emphasized?: boolean
}

type Section = {
  id: string
  eyebrow: string
  title: string
  rows: Row[]
}

const SECTIONS: Section[] = [
  {
    id: "empresa",
    eyebrow: "01",
    title: "Dados da empresa",
    rows: [
      { label: "Razão social", value: ONBOARDING_ORG.razaoSocial },
      {
        label: "CNPJ",
        value: (
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {ONBOARDING_ORG.cnpj}
          </span>
        ),
      },
      { label: "Segmento", value: ONBOARDING_ORG.segmento },
      { label: "Porte", value: ONBOARDING_ORG.porte },
    ],
  },
  {
    id: "condicoes",
    eyebrow: "02",
    title: "Condições comerciais",
    rows: [
      {
        label: "Implementação",
        value: ONBOARDING_ORG.valorImplementacao,
        emphasized: true,
      },
      { label: "Parcelamento", value: ONBOARDING_ORG.parcelamentoImplementacao },
      {
        label: "Plano",
        value: ONBOARDING_ORG.plan,
        emphasized: true,
      },
      { label: "Mensalidade", value: ONBOARDING_ORG.valorMensal },
    ],
  },
]

export default function RevisaoPage() {
  return (
    <AwOnboardingShell
      currentStep={2}
      org={ONBOARDING_ORG}
      brandBackground={ONBOARDING_ORG.brandBackground}
    >
      <section>
        <h1
          className="mb-2 font-display font-medium text-fg-primary text-balance"
          style={{
            fontSize: "var(--h3-size)",
            lineHeight: 1.15,
            letterSpacing: "-0.015em",
          }}
        >
          Revise os termos antes de prosseguir.
        </h1>

        <p
          className="mb-7 text-fg-secondary text-pretty"
          style={{ fontSize: "var(--body-sm-size)", lineHeight: 1.5 }}
        >
          Os dados abaixo refletem o contrato firmado com a AwSales. Confira
          cada seção com atenção; divergências devem ser tratadas com{" "}
          {ONBOARDING_ORG.accountManager} antes do pagamento.
        </p>

        <div className="flex flex-col gap-4">
          {SECTIONS.map((section) => (
            <article
              key={section.id}
              className="overflow-hidden rounded-lg border border-border-subtle bg-bg-raised"
            >
              <header className="flex items-baseline gap-2.5 border-b border-border-subtle px-4 pb-3 pt-3.5">
                <span
                  className="uppercase text-fg-tertiary"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {section.eyebrow}
                </span>
                <h2
                  className="m-0 font-medium text-fg-primary"
                  style={{ fontSize: 13, letterSpacing: "-0.005em" }}
                >
                  {section.title}
                </h2>
              </header>

              <dl className="m-0">
                {section.rows.map((row, i) => (
                  <div
                    key={row.label}
                    className={[
                      "grid grid-cols-[200px_1fr] px-4 py-3",
                      i < section.rows.length - 1
                        ? "border-b border-border-subtle"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <dt
                      className="text-fg-tertiary"
                      style={{ fontSize: 12, letterSpacing: "0.005em" }}
                    >
                      {row.label}
                    </dt>
                    <dd
                      className="m-0 text-fg-primary"
                      style={{
                        fontSize: row.emphasized ? 14 : 13,
                        fontWeight: row.emphasized ? 600 : 500,
                        letterSpacing: row.emphasized ? "-0.005em" : "0",
                      }}
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>

        <div
          className="mt-4 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3.5"
          style={{ fontSize: 12, lineHeight: 1.55 }}
        >
          <div
            className="mb-1.5 uppercase text-fg-tertiary"
            style={{ fontSize: 10, letterSpacing: "0.08em" }}
          >
            Responsáveis
          </div>
          <div className="grid grid-cols-2 gap-3 text-fg-secondary">
            <div>
              <div
                className="mb-0.5 text-fg-tertiary"
                style={{ fontSize: 11 }}
              >
                Account Manager AwSales
              </div>
              <div className="flex items-center gap-2 text-fg-primary" style={{ fontWeight: 500 }}>
                <AwAvatar
                  size="sm"
                  src={ONBOARDING_ORG.accountManagerPhoto}
                  initials="LV"
                  alt={ONBOARDING_ORG.accountManager}
                  style={{ width: 20, height: 20, fontSize: 9 }}
                />
                {ONBOARDING_ORG.accountManager}
              </div>
            </div>
            <div>
              <div
                className="mb-0.5 text-fg-tertiary"
                style={{ fontSize: 11 }}
              >
                Admin responsável
              </div>
              <div className="text-fg-primary" style={{ fontWeight: 500 }}>
                {ONBOARDING_USER.name}
              </div>
              <div className="text-fg-tertiary" style={{ fontSize: 11 }}>
                {ONBOARDING_USER.email}
              </div>
            </div>
          </div>
        </div>

        <a
          href="#"
          download
          className="mt-3 flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-raised px-4 py-3 transition-colors duration-aw-fast hover:border-border-strong hover:bg-bg-surface"
        >
          <AwFileIcon type="pdf" size="md" alt="Contrato em PDF" />
          <span className="min-w-0 flex-1">
            <span
              className="block font-medium text-fg-primary"
              style={{ fontSize: 13 }}
            >
              Contrato_{ONBOARDING_ORG.razaoSocial.replace(/\s+/g, "_")}.pdf
            </span>
            <span
              className="block text-fg-tertiary"
              style={{ fontSize: 12 }}
            >
              PDF · {ONBOARDING_ORG.plan} · {ONBOARDING_ORG.contractTerm} · 48 KB
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-fg-secondary">
            <span style={{ fontSize: 12 }} className="font-medium">
              Baixar
            </span>
            <Icon name="download" size={16} />
          </span>
        </a>

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
            <span className="aw-btn__label">Prosseguir para pagamento</span>
            <Icon name="arrow_forward" size={16} />
          </Link>
        </footer>
      </section>
    </AwOnboardingShell>
  )
}
