"use client"

import * as React from "react"
import { AwLogo } from "./AwLogo"
import { NeuralPattern } from "@/components/playground/NeuralPattern"

export type AwOnboardingStep = {
  id: string
  label: string
  num: string
  brandTitle: string
}

export const AW_ONBOARDING_STEPS: readonly AwOnboardingStep[] = [
  { id: "convite",      label: "convite",      num: "01", brandTitle: "Confirme que é você" },
  { id: "boas-vindas",  label: "boas-vindas",  num: "02", brandTitle: "Bem-vindo" },
  { id: "revisao",      label: "revisão",      num: "03", brandTitle: "Revise os dados" },
  { id: "pagamento",    label: "pagamento",    num: "04", brandTitle: "Forma de pagamento" },
  { id: "checkout",     label: "checkout",     num: "05", brandTitle: "Quase lá" },
  { id: "confirmado",   label: "confirmado",   num: "06", brandTitle: "Pagamento confirmado" },
  { id: "acesso",       label: "acesso",       num: "07", brandTitle: "Defina seu acesso" },
  { id: "perfil",       label: "perfil",       num: "08", brandTitle: "Personalize seu perfil" },
] as const

export type AwOnboardingOrg = {
  name: string
  cnpj: string
  plan: string
  contractTerm: string
}

export type AwOnboardingShellProps = {
  currentStep: number
  org: AwOnboardingOrg
  children: React.ReactNode
  brandTitle?: string
  brandSubtitle?: string
  brandBackground?: string
}

export function AwOnboardingShell({
  currentStep,
  org,
  children,
  brandTitle,
  brandSubtitle,
  brandBackground,
}: AwOnboardingShellProps) {
  const step = AW_ONBOARDING_STEPS[currentStep] ?? AW_ONBOARDING_STEPS[0]
  const title = brandTitle ?? step.brandTitle
  const subtitle =
    brandSubtitle ??
    `Configuração inicial da sua conta ${org.name} na plataforma AwSales.`

  return (
    <div className="flex h-screen overflow-hidden bg-bg-canvas text-fg-primary">
      <OnboardingBrandPane
        currentStep={currentStep}
        org={org}
        title={title}
        subtitle={subtitle}
        background={brandBackground}
      />
      <main className="flex-1 overflow-auto bg-bg-canvas">
        <div className="mx-auto flex min-h-full w-full max-w-[640px] items-center px-10 py-10">
          <div className="aw-step-transition w-full">{children}</div>
        </div>
      </main>
    </div>
  )
}

function OnboardingBrandPane({
  currentStep,
  org,
  title,
  subtitle,
  background,
}: {
  currentStep: number
  org: AwOnboardingOrg
  title: string
  subtitle: string
  background?: string
}) {
  const hasImage = Boolean(background)

  return (
    <aside className="relative flex w-[38%] min-w-[320px] max-w-[480px] flex-shrink-0 flex-col justify-between overflow-hidden border-r border-aw-gray-1100 bg-aw-gray-1200 p-10 text-white">
      {hasImage ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${background})`,
              filter: "saturate(0.75)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(13,13,15,0.78) 0%, rgba(13,13,15,0.85) 45%, rgba(13,13,15,0.95) 100%)",
            }}
          />
        </>
      ) : (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 opacity-[0.38]"
          style={{ transform: "translate(-50%, -52%)" }}
        >
          <NeuralPattern size={720} />
        </div>
      )}

      <div className="relative z-10 flex items-center">
        <AwLogo variant="wordmark" height={20} className="text-white" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center">
        <h1
          className="mb-3.5 font-display font-medium text-white text-balance"
          style={{
            fontSize: "var(--h1-size)",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>
        <p
          className="text-aw-gray-500"
          style={{ fontSize: "var(--body-sm-size)", lineHeight: 1.5 }}
        >
          {subtitle}
        </p>
      </div>

      <div className="relative z-10 rounded-xl border border-aw-gray-1000 bg-aw-gray-1200/55 p-5 backdrop-blur-md">
        <div
          className="mb-2.5 uppercase text-aw-gray-700"
          style={{ fontSize: 10, letterSpacing: "0.06em" }}
        >
          organização
        </div>
        <div
          className="mb-1 font-medium text-white"
          style={{ fontSize: 16 }}
        >
          {org.name}
        </div>
        <div className="text-aw-gray-500" style={{ fontSize: 11 }}>
          {org.cnpj}
        </div>
        <div className="mt-3.5 flex gap-1.5">
          <span
            className="rounded-xs border border-aw-gray-1000 bg-white/[0.06] px-2 py-[3px] text-aw-gray-500"
            style={{ fontSize: 10 }}
          >
            Plano {org.plan}
          </span>
        </div>
      </div>

    </aside>
  )
}
