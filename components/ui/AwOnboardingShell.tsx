"use client"

import * as React from "react"
import { AwLogo } from "./AwLogo"
import { NeuralPattern } from "@/components/playground/NeuralPattern"

export type AwOnboardingOrg = {
  name: string
  cnpj: string
  plan: string
  contractTerm: string
  /** Logotipo da organização exibido no card do brand pane. */
  logo?: string
}

export const AW_ONBOARDING_BRAND_BACKGROUND =
  "/assets/group-backgrounds/group-bg-17.jpg"

export type AwOnboardingShellProps = {
  org: AwOnboardingOrg
  children: React.ReactNode
  brandBackground?: string
  /** Hide the organization card in the brand pane (e.g. before user recognition). */
  showOrgCard?: boolean
}

export function AwOnboardingShell({
  org,
  children,
  brandBackground = AW_ONBOARDING_BRAND_BACKGROUND,
  showOrgCard = true,
}: AwOnboardingShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-canvas text-fg-primary">
      <OnboardingBrandPane
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
  org,
  background,
  showOrgCard,
}: {
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

      <div className="relative z-10 flex-1" />

      <div className="relative z-10">
        {showOrgCard ? (
          <div className="rounded-xl border border-aw-gray-1000 bg-aw-gray-1200/55 p-4 backdrop-blur-md">
            <div
              className="mb-2.5 uppercase text-aw-gray-700"
              style={{ fontSize: 10, letterSpacing: "0.06em" }}
            >
              organização
            </div>
            <div className="flex items-center gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-aw-gray-1000 bg-white/[0.06] body-sm font-medium text-aw-gray-400">
                  {org.logo ? (
                    <img
                      src={org.logo}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    org.name.charAt(0).toUpperCase()
                  )}
                </span>
                <div className="min-w-0">
                  <div className="truncate body-sm font-medium text-white">
                    {org.name}
                  </div>
                  <div
                    className="truncate text-aw-gray-500"
                    style={{ fontSize: 11 }}
                  >
                    {org.cnpj}
                  </div>
                </div>
              </div>
              <div className="flex flex-shrink-0 flex-col items-end gap-1">
                <span
                  className="rounded-xs border border-aw-gray-1000 bg-white/[0.06] px-2 py-[3px] text-aw-gray-500"
                  style={{ fontSize: 10 }}
                >
                  Plano {org.plan}
                </span>
                <span
                  className="rounded-xs border border-aw-gray-1000 bg-white/[0.06] px-2 py-[3px] text-aw-gray-500"
                  style={{ fontSize: 10 }}
                >
                  {org.contractTerm}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center gap-2.5 text-aw-gray-500"
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
      </div>
    </aside>
  )
}
