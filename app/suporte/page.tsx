"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwButton } from "@/components/ui/AwButton"
import { AwAvatar } from "@/components/ui/AwAvatar"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG } from "../primeiro-acesso/_data"

export default function SuportePage() {
  const router = useRouter()
  const am = ONBOARDING_ORG.accountManager

  return (
    <AwOnboardingShell org={ONBOARDING_ORG} showOrgCard={false}>
      <section>
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-bg-surface px-2.5 py-1 body-xs text-fg-tertiary">
          <Icon name="support_agent" size={12} />
          <span>Suporte Aswork</span>
        </div>

        <h3 className="mb-2 text-fg-primary text-balance">Fale com a gente</h3>

        <p className="mb-7 body-sm text-fg-secondary text-pretty">
          Seu time tem um contato dedicado na Aswork. Chame por e-mail ou
          telefone e a gente resolve o que você precisa — de uma dúvida no
          primeiro acesso a reabrir um convite.
        </p>

        <div className="mb-3.5 flex items-center gap-3.5 rounded-xl border border-border-subtle bg-bg-raised p-[18px]">
          <AwAvatar
            src={am.photo}
            initials={am.initials}
            alt={am.name}
            style={{ width: 44, height: 44, fontSize: 16 }}
          />
          <div className="min-w-0 flex-1">
            <div className="body-xs text-fg-tertiary">Seu contato na Aswork</div>
            <div className="body-sm font-medium text-fg-primary">{am.name}</div>
            <div className="body-xs text-fg-tertiary">{am.role}</div>
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-bg-raised p-[18px]">
          <div className="aw-eyebrow mb-3 text-fg-tertiary">Canais</div>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            <li className="flex items-center gap-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-bg-muted text-fg-secondary">
                <Icon name="mail" size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="body-sm font-medium text-fg-primary">{am.email}</div>
                <p className="mt-0.5 body-xs text-fg-secondary">
                  Resposta em até 1 dia útil
                </p>
              </div>
            </li>
            <li className="flex items-center gap-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-bg-muted text-fg-secondary">
                <Icon name="phone" size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="body-sm font-medium text-fg-primary">{am.phone}</div>
                <p className="mt-0.5 body-xs text-fg-secondary">
                  Seg a sex, 9h às 18h
                </p>
              </div>
            </li>
          </ul>
        </div>

        <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
          <AwButton
            variant="primary"
            size="md"
            iconLeft="mail"
            onClick={() => {
              window.location.href = `mailto:${am.email}`
            }}
          >
            Enviar e-mail
          </AwButton>
          <AwButton variant="ghost" size="md" onClick={() => router.push("/")}>
            Voltar para o login
          </AwButton>
        </footer>
      </section>
    </AwOnboardingShell>
  )
}
