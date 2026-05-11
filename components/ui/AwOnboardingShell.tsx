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
  { id: "convite",      label: "convite",      num: "01", brandTitle: "Convite enviado" },
  { id: "boas-vindas",  label: "boas-vindas",  num: "02", brandTitle: "Bem-vindo" },
  { id: "revisao",      label: "revisão",      num: "03", brandTitle: "Revise os dados" },
  { id: "pagamento",    label: "pagamento",    num: "04", brandTitle: "Forma de pagamento" },
  { id: "checkout",     label: "checkout",     num: "05", brandTitle: "Quase lá" },
  { id: "confirmado",   label: "confirmado",   num: "06", brandTitle: "Pagamento confirmado" },
  { id: "acesso",       label: "acesso",       num: "07", brandTitle: "Defina seu acesso" },
  { id: "agent-studio", label: "agent studio", num: "08", brandTitle: "Pronto" },
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
}

export function AwOnboardingShell({
  currentStep,
  org,
  children,
  brandTitle,
  brandSubtitle,
}: AwOnboardingShellProps) {
  const step = AW_ONBOARDING_STEPS[currentStep] ?? AW_ONBOARDING_STEPS[0]
  const title = brandTitle ?? step.brandTitle
  const subtitle =
    brandSubtitle ??
    `Configuração inicial da sua conta ${org.name} na plataforma AwSales.`

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg-canvas text-fg-primary">
      <OnboardingStepper currentStep={currentStep} />
      <div className="flex flex-1 overflow-hidden">
        <OnboardingBrandPane
          currentStep={currentStep}
          org={org}
          title={title}
          subtitle={subtitle}
        />
        <main className="flex-1 overflow-auto bg-bg-canvas">
          <div className="mx-auto flex min-h-full w-full max-w-[640px] items-center px-10 py-10">
            <div className="w-full">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}

function OnboardingStepper({ currentStep }: { currentStep: number }) {
  return (
    <nav className="flex flex-shrink-0 items-center gap-1 overflow-x-auto border-b border-border-subtle bg-bg-canvas px-6 py-3.5">
      {AW_ONBOARDING_STEPS.map((step, i) => {
        const active = i === currentStep
        const done = i < currentStep
        const pipClass = [
          "flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono whitespace-nowrap transition-colors duration-aw-fast",
          active
            ? "border-border-subtle bg-bg-muted text-fg-primary"
            : done
            ? "border-transparent text-fg-secondary"
            : "border-transparent text-fg-tertiary",
        ].join(" ")
        const dotClass = [
          "inline-flex h-4 w-4 items-center justify-center rounded-full border",
          active
            ? "border-fg-primary bg-fg-primary text-bg-canvas"
            : done
            ? "border-bg-muted bg-bg-muted text-fg-primary"
            : "border-border",
        ].join(" ")
        return (
          <React.Fragment key={step.id}>
            <div className={pipClass} style={{ fontSize: 10, letterSpacing: "0.04em" }}>
              <span className={dotClass} style={{ fontSize: 9 }}>
                {done ? "✓" : step.num}
              </span>
              <span>{step.label}</span>
            </div>
            {i < AW_ONBOARDING_STEPS.length - 1 && (
              <span className="h-px w-3 flex-shrink-0 bg-border" />
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

function OnboardingBrandPane({
  currentStep,
  org,
  title,
  subtitle,
}: {
  currentStep: number
  org: AwOnboardingOrg
  title: string
  subtitle: string
}) {
  return (
    <aside className="relative flex w-[38%] min-w-[320px] max-w-[480px] flex-shrink-0 flex-col justify-between overflow-hidden border-r border-aw-gray-1100 bg-aw-gray-1200 p-10 text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 opacity-[0.38]"
        style={{ transform: "translate(-50%, -52%)" }}
      >
        <NeuralPattern size={720} />
      </div>

      <div className="relative z-10">
        <div className="mb-7 flex items-center">
          <AwLogo variant="wordmark" height={20} className="text-white" />
        </div>
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
          className="mb-2.5 font-mono uppercase text-aw-gray-700"
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
        <div className="font-mono text-aw-gray-500" style={{ fontSize: 11 }}>
          {org.cnpj}
        </div>
        <div className="mt-3.5 flex gap-1.5">
          <span
            className="rounded-xs border border-aw-gray-1000 bg-white/[0.06] px-2 py-[3px] font-mono text-aw-gray-500"
            style={{ fontSize: 10 }}
          >
            {org.plan}
          </span>
          <span
            className="rounded-xs border border-aw-gray-1000 bg-white/[0.06] px-2 py-[3px] font-mono text-aw-gray-500"
            style={{ fontSize: 10 }}
          >
            {org.contractTerm}
          </span>
        </div>
      </div>

      <div
        className="relative z-10 flex flex-col gap-2 font-mono text-aw-gray-700"
        style={{ fontSize: 10, letterSpacing: "0.04em" }}
      >
        <div>etapa {String(currentStep + 1).padStart(2, "0")} / 08</div>
        <div>passo: {AW_ONBOARDING_STEPS[currentStep]?.label}</div>
      </div>
    </aside>
  )
}
