"use client"

import * as React from "react"
import { AwLogo } from "./AwLogo"
import { Icon } from "./Icon"
import { NeuralPattern } from "@/components/playground/NeuralPattern"

export type AwOnboardingStep = {
  id: string
  label: string
  num: string
  brandTitle: string
  shortLabel: string
  icon: string
}

export const AW_ONBOARDING_STEPS: readonly AwOnboardingStep[] = [
  { id: "convite",      label: "convite",      num: "01", brandTitle: "Confirme que é você",   shortLabel: "Convite",          icon: "mark_email_read" },
  { id: "acesso",       label: "acesso",       num: "02", brandTitle: "Defina seu acesso",     shortLabel: "Acesso",           icon: "lock" },
  { id: "perfil",       label: "perfil",       num: "03", brandTitle: "Personalize seu perfil", shortLabel: "Perfil",           icon: "manage_accounts" },
  { id: "boas-vindas",  label: "boas-vindas",  num: "04", brandTitle: "Bem-vindo",             shortLabel: "Boas-vindas",      icon: "waving_hand" },
  { id: "revisao",      label: "revisão",      num: "05", brandTitle: "Revise os dados",       shortLabel: "Revisar dados",    icon: "fact_check" },
  { id: "pagamento",    label: "pagamento",    num: "06", brandTitle: "Forma de pagamento",    shortLabel: "Forma de pagto.",  icon: "credit_card" },
  { id: "checkout",     label: "checkout",     num: "07", brandTitle: "Quase lá",              shortLabel: "Pagar implementação", icon: "payments" },
  { id: "confirmado",   label: "confirmado",   num: "08", brandTitle: "Pagamento confirmado",  shortLabel: "Confirmado",       icon: "task_alt" },
  { id: "mensalidade",  label: "mensalidade",  num: "09", brandTitle: "Primeira mensalidade",  shortLabel: "Mensalidade",      icon: "event_repeat" },
] as const

export type AwOnboardingOrg = {
  name: string
  cnpj: string
  plan: string
  contractTerm: string
}

export const AW_ONBOARDING_BRAND_BACKGROUND =
  "/assets/group-backgrounds/group-bg-17.jpg"

export type AwOnboardingShellProps = {
  currentStep: number
  org: AwOnboardingOrg
  children: React.ReactNode
  brandBackground?: string
  /** Hide the organization card in the brand pane (e.g. before user recognition). */
  showOrgCard?: boolean
}

export function AwOnboardingShell({
  currentStep,
  org,
  children,
  brandBackground = AW_ONBOARDING_BRAND_BACKGROUND,
  showOrgCard = true,
}: AwOnboardingShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-canvas text-fg-primary">
      <OnboardingBrandPane
        currentStep={currentStep}
        org={org}
        background={brandBackground}
        showOrgCard={showOrgCard}
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
  background,
  showOrgCard,
}: {
  currentStep: number
  org: AwOnboardingOrg
  background?: string
  showOrgCard: boolean
}) {
  const hasImage = Boolean(background)

  return (
    <aside className="relative flex w-[38%] min-w-[320px] max-w-[480px] flex-shrink-0 flex-col overflow-hidden border-r border-aw-gray-1100 bg-aw-gray-1200 p-10 text-white">
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

      <div className="relative z-10 mb-8 flex items-center">
        <AwLogo variant="wordmark" height={20} className="text-white" />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <OnboardingTimeline currentStep={currentStep} />
      </div>

      {showOrgCard ? (
        <div className="relative z-10 mt-6 rounded-xl border border-aw-gray-1000 bg-aw-gray-1200/55 p-4 backdrop-blur-md">
          <div
            className="mb-2 uppercase text-aw-gray-700"
            style={{ fontSize: 10, letterSpacing: "0.06em" }}
          >
            organização
          </div>
          <div className="mb-0.5 body-sm font-medium text-white">
            {org.name}
          </div>
          <div className="text-aw-gray-500" style={{ fontSize: 11 }}>
            {org.cnpj}
          </div>
          <div className="mt-3 flex gap-1.5">
            <span
              className="rounded-xs border border-aw-gray-1000 bg-white/[0.06] px-2 py-[3px] text-aw-gray-500"
              style={{ fontSize: 10 }}
            >
              Plano {org.plan}
            </span>
          </div>
        </div>
      ) : (
        <div
          className="relative z-10 mt-6 flex items-center gap-2.5 text-aw-gray-500"
          style={{ fontSize: 11, letterSpacing: "0.02em" }}
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-aw-emerald-500"
          />
          <span>
            Estamos prontos para reconhecer você assim que inserir o código.
          </span>
        </div>
      )}
    </aside>
  )
}

function OnboardingTimeline({ currentStep }: { currentStep: number }) {
  const total = AW_ONBOARDING_STEPS.length
  // Progress vai do centro do primeiro círculo até o centro do current.
  // 0 step → 0% · current=last → 100%.
  const progress =
    total > 1 ? Math.min(1, Math.max(0, currentStep / (total - 1))) : 0

  return (
    <ol
      aria-label="Etapas do primeiro acesso"
      className="relative m-0 flex h-full list-none flex-col justify-between p-0"
    >
      {/* Trilha cinza de fundo — ocupa toda a altura entre primeiro e último círculo */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[13px] z-0 w-px bg-aw-gray-1000"
        style={{ top: 13, bottom: 13 }}
      />
      {/* Progresso branco — anima da altura 0 até o current */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[13px] z-0 w-px bg-white"
        style={{
          top: 13,
          height: `calc((100% - 26px) * ${progress})`,
          transition:
            "height var(--dur-slow) var(--ease-out)",
        }}
      />

      {AW_ONBOARDING_STEPS.map((step, i) => {
        const status =
          i < currentStep ? "done" : i === currentStep ? "current" : "upcoming"
        return (
          <li
            key={step.id}
            className="relative z-10 flex items-center gap-3"
            aria-current={status === "current" ? "step" : undefined}
          >
            <span
              className={[
                "flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full",
                "transition-[background-color,border-color,color,transform,box-shadow] duration-aw-base ease-aw-out",
                status === "done"
                  ? "bg-white text-aw-gray-1200"
                  : status === "current"
                    ? "scale-110 border-2 border-white bg-aw-gray-1200 text-white shadow-[0_0_0_4px_rgba(255,255,255,0.08)]"
                    : "border border-aw-gray-1000 bg-aw-gray-1200 text-aw-gray-700",
              ].join(" ")}
            >
              <Icon
                name={status === "done" ? "check" : step.icon}
                size={status === "current" ? 13 : 12}
              />
            </span>
            <div className="min-w-0">
              <div
                className={[
                  "body-xs transition-colors duration-aw-base ease-aw-out",
                  status === "current"
                    ? "font-medium text-white"
                    : status === "done"
                      ? "text-aw-gray-400"
                      : "text-aw-gray-700",
                ].join(" ")}
              >
                {step.shortLabel}
              </div>
              <div
                className="aw-eyebrow overflow-hidden text-aw-gray-500 transition-[max-height,opacity] duration-aw-base ease-aw-out"
                style={{
                  maxHeight: status === "current" ? 16 : 0,
                  opacity: status === "current" ? 1 : 0,
                }}
              >
                agora · etapa {step.num}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
