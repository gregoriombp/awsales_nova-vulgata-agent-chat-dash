"use client"

import * as React from "react"
import Link from "next/link"
import { Icon } from "@/components/ui/Icon"
import { AwAvatar } from "@/components/ui/AwAvatar"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import {
  CONVITE_INVITEE,
  CONVITE_INVITER,
  CONVITE_ORG,
  CONVITE_ROLE,
} from "../_data"

export default function ConviteConcluidoPage() {
  return (
    <AwOnboardingShell org={CONVITE_ORG}>
      <section className="pt-4 text-center">
        <span className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-aw-emerald-100 text-aw-emerald-700">
          <Icon name="check_circle" size={40} fill={1} />
        </span>

        <h2 className="mb-2.5 text-fg-primary text-balance">
          Bem-vinda à {CONVITE_ORG.name}, {CONVITE_INVITEE.firstName}
        </h2>

        <p className="mx-auto mb-7 max-w-[460px] body-md text-fg-secondary text-pretty">
          Sua conta está ativa e seu acesso foi liberado com base na função
          definida pelo admin.
        </p>

        <div className="mx-auto mb-6 max-w-[480px] rounded-xl border border-border-subtle bg-bg-surface p-[18px] text-left">
          <div className="aw-eyebrow mb-3 text-fg-tertiary">Seu acesso</div>

          <div className="mb-2.5 flex items-baseline justify-between">
            <div>
              <div className="body-sm font-medium text-fg-primary">Função</div>
              <div className="mt-px body-xs text-fg-tertiary">
                {CONVITE_ROLE.permissionCount} permissões habilitadas
              </div>
            </div>
            <div className="body-sm font-medium text-fg-primary">
              {CONVITE_ROLE.name}
            </div>
          </div>

          {CONVITE_ROLE.groups.length > 0 && (
            <div className="mt-3.5 border-t border-border pt-3.5">
              <div className="mb-2 body-xs text-fg-tertiary">Grupos</div>
              <div className="flex flex-wrap gap-1.5">
                {CONVITE_ROLE.groups.map((g) => (
                  <span
                    key={g}
                    className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-bg-raised px-2 py-0.5 body-xs text-fg-secondary"
                  >
                    <Icon name="group" size={11} />
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Link href="/inicio" className="aw-btn aw-btn--primary aw-btn--md">
            <span className="aw-btn__label">Entrar na plataforma</span>
            <Icon name="arrow_forward" size={16} />
          </Link>
        </div>

        <div className="mx-auto mt-8 flex max-w-[460px] items-center gap-3 rounded-xl border border-border-subtle p-4 text-left">
          <AwAvatar
            src={CONVITE_INVITER.photo}
            initials={CONVITE_INVITER.initials}
            alt={CONVITE_INVITER.name}
            style={{ width: 36, height: 36, fontSize: 13 }}
          />
          <div className="min-w-0 flex-1">
            <div className="body-xs text-fg-tertiary">
              Quem te convidou
            </div>
            <div className="body-sm font-medium text-fg-primary">
              {CONVITE_INVITER.name}
            </div>
            <div className="body-xs text-fg-tertiary">
              {CONVITE_INVITER.role}
            </div>
          </div>
          <span className="inline-flex flex-shrink-0 items-center gap-1.5 body-xs text-fg-tertiary">
            <Icon name="check_circle" size={14} fill={1} className="text-aw-emerald-700" />
            Avisado
          </span>
        </div>
      </section>
    </AwOnboardingShell>
  )
}
