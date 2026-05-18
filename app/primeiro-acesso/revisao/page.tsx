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
      {
        label: "Plano",
        value: ONBOARDING_ORG.plan,
        emphasized: true,
      },
      { label: "Mensalidade", value: ONBOARDING_ORG.valorMensal },
      {
        label: "+ Custos variáveis de uso",
        value: (
          <details className="group inline-flex flex-col gap-1.5">
            <summary className="inline-flex w-fit cursor-pointer items-center gap-1 body-xs font-medium text-fg-secondary hover:text-fg-primary">
              <span>Sob consumo</span>
              <Icon
                name="info"
                size={14}
                className="text-fg-tertiary group-hover:text-fg-secondary"
              />
              <span className="ml-1 body-xs underline decoration-dotted underline-offset-2 text-fg-tertiary group-hover:text-fg-secondary">
                Saiba mais
              </span>
            </summary>
            <p
              className="m-0 mt-1 body-xs text-fg-tertiary text-pretty"
              style={{ maxWidth: 360 }}
            >
              Cobrança proporcional ao volume de atendimentos e mensagens que
              excedem o pacote incluído no seu plano. O limite mensal de uso
              variável da sua conta é{" "}
              <span className="font-medium text-fg-secondary">
                {ONBOARDING_ORG.limiteUsoVariavel}
              </span>
              ; o que ultrapassar é cobrado na fatura do mês seguinte.
            </p>
          </details>
        ),
      },
    ],
  },
]

export default function RevisaoPage() {
  return (
    <AwOnboardingShell
      currentStep={4}
      org={ONBOARDING_ORG}
      brandBackground={ONBOARDING_ORG.brandBackground}
    >
      <section>
        <h3 className="mb-2 text-fg-primary text-balance">
          Revise os termos antes de prosseguir.
        </h3>

        <p className="mb-7 body-sm text-fg-secondary text-pretty">
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
                  className="aw-eyebrow text-fg-tertiary"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {section.eyebrow}
                </span>
                <h6 className="m-0 text-fg-primary">
                  {section.title}
                </h6>
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
                    <dt className="body-xs text-fg-tertiary">
                      {row.label}
                    </dt>
                    <dd
                      className={[
                        "m-0 font-medium text-fg-primary",
                        row.emphasized ? "body-sm" : "body-xs",
                      ].join(" ")}
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>

        <div className="mt-4 body-xs rounded-lg border border-border-subtle bg-bg-surface px-4 py-3.5">
          <div className="mb-1.5 aw-eyebrow text-fg-tertiary">
            Responsáveis
          </div>
          <div className="grid grid-cols-2 gap-3 text-fg-secondary">
            <div>
              <div className="mb-1.5 body-xs text-fg-tertiary">
                Time AwSales
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 font-medium text-fg-primary">
                  <AwAvatar
                    size="sm"
                    src={ONBOARDING_ORG.accountManagerPhoto}
                    initials="LV"
                    alt={ONBOARDING_ORG.accountManager}
                    style={{ width: 20, height: 20, fontSize: 9 }}
                  />
                  <span>{ONBOARDING_ORG.accountManager}</span>
                  <span className="body-xs font-normal text-fg-tertiary">
                    · Account Manager
                  </span>
                </div>
                <div className="flex items-center gap-2 font-medium text-fg-primary">
                  <AwAvatar
                    size="sm"
                    src={ONBOARDING_ORG.representanteComercialPhoto}
                    initials="BA"
                    alt={ONBOARDING_ORG.representanteComercial}
                    style={{ width: 20, height: 20, fontSize: 9 }}
                  />
                  <span>{ONBOARDING_ORG.representanteComercial}</span>
                  <span className="body-xs font-normal text-fg-tertiary">
                    · Comercial
                  </span>
                </div>
              </div>
            </div>
            <div>
              <div className="mb-1.5 body-xs text-fg-tertiary">
                Admin responsável
              </div>
              <div className="font-medium text-fg-primary">
                {ONBOARDING_USER.name}
              </div>
              <div className="body-xs text-fg-tertiary">
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
            <span className="block body-xs font-medium text-fg-primary">
              Contrato_{ONBOARDING_ORG.razaoSocial.replace(/\s+/g, "_")}.pdf
            </span>
            <span className="block body-xs text-fg-tertiary">
              PDF · {ONBOARDING_ORG.plan} · {ONBOARDING_ORG.contractTerm} · 48 KB
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-fg-secondary">
            <span className="body-xs font-medium">
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
