import Link from "next/link"
import type { Metadata } from "next"
import { Icon } from "@/components/ui/Icon"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG } from "../_data"

export const metadata: Metadata = {
  title: "Pagamento confirmado · Primeiro acesso · AwSales",
}

type SearchParams = Promise<{ via?: string }>

export default async function ConfirmadoPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { via } = await searchParams
  const fromBoleto = via === "boleto"

  return (
    <AwOnboardingShell currentStep={5} org={ONBOARDING_ORG}>
      <section className="text-center">
        <div className="flex flex-col items-center gap-4">
          {fromBoleto ? (
            <>
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-aw-amber-100 text-aw-amber-700">
                <Icon name="hourglass_top" size={36} fill={1} />
              </span>
              <div>
                <h1
                  className="mb-2 font-display font-medium text-fg-primary text-balance"
                  style={{
                    fontSize: "var(--h3-size)",
                    lineHeight: 1.15,
                    letterSpacing: "-0.015em",
                  }}
                >
                  Recebemos sua confirmação.
                </h1>
                <p
                  className="m-0 text-fg-secondary text-pretty"
                  style={{ fontSize: "var(--body-sm-size)", lineHeight: 1.5 }}
                >
                  Vamos verificar a compensação do boleto da implementação.
                  Quando o banco confirmar, você receberá um e-mail — em geral,
                  2 a 3 dias úteis. Em seguida você configura a primeira
                  mensalidade ({ONBOARDING_ORG.valorMensalProrrata}, prorrata)
                  e libera o acesso.
                </p>
              </div>
              <div className="mt-2 flex justify-center gap-2.5">
                <button
                  type="button"
                  className="aw-btn aw-btn--secondary aw-btn--md"
                >
                  <Icon name="upload_file" size={16} />
                  <span className="aw-btn__label">Enviar comprovante</span>
                </button>
                <Link
                  href="/primeiro-acesso/mensalidade"
                  className="aw-btn aw-btn--primary aw-btn--md"
                >
                  <span className="aw-btn__label">
                    Adiantar — configurar mensalidade
                  </span>
                  <Icon name="arrow_forward" size={16} />
                </Link>
              </div>
              <div
                className="mt-1 text-fg-tertiary"
                style={{ fontSize: 10, letterSpacing: "0.04em" }}
              >
                você pode adiantar a configuração da mensalidade enquanto
                aguardamos a compensação do boleto
              </div>
            </>
          ) : (
            <>
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-aw-emerald-100 text-aw-emerald-700">
                <Icon name="check_circle" size={36} fill={1} />
              </span>
              <div>
                <h1
                  className="mb-2 font-display font-medium text-fg-primary text-balance"
                  style={{
                    fontSize: "var(--h3-size)",
                    lineHeight: 1.15,
                    letterSpacing: "-0.015em",
                  }}
                >
                  Pagamento da implementação confirmado.
                </h1>
                <p
                  className="m-0 text-fg-secondary text-pretty"
                  style={{ fontSize: "var(--body-sm-size)", lineHeight: 1.5 }}
                >
                  Sua conta {ONBOARDING_ORG.name} já está provisionada. Falta
                  só configurar a primeira mensalidade ({ONBOARDING_ORG.valorMensalProrrata},
                  prorrata) e definir como você vai acessar a plataforma.
                </p>
              </div>
              <div className="mt-2 flex justify-center gap-3">
                <Link
                  href="/primeiro-acesso/mensalidade"
                  className="aw-btn aw-btn--primary aw-btn--md"
                >
                  <span className="aw-btn__label">
                    Configurar mensalidade
                  </span>
                  <Icon name="arrow_forward" size={16} />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </AwOnboardingShell>
  )
}
