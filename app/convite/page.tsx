"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwAvatar } from "@/components/ui/AwAvatar"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import {
  CONVITE_EXPIRA_EM,
  CONVITE_INVITEE,
  CONVITE_INVITER,
  CONVITE_ORG,
  CONVITE_ROLE,
} from "./_data"

export default function ConviteEntradaPage() {
  const router = useRouter()
  const [accepting, setAccepting] = React.useState(false)

  const aceitar = () => {
    if (accepting) return
    setAccepting(true)
    setTimeout(() => router.push("/convite/conta"), 700)
  }

  return (
    <AwOnboardingShell org={CONVITE_ORG}>
      <section>
        <h3 className="mb-2 text-fg-primary text-balance">
          Você foi convidada para a {CONVITE_ORG.name}, {CONVITE_INVITEE.firstName}
        </h3>

        <p className="mb-7 body-sm text-fg-secondary text-pretty">
          O link foi aberto a partir do e-mail{" "}
          <b className="font-medium text-fg-primary">{CONVITE_INVITEE.email}</b>
          . Em alguns passos rápidos você cria sua conta e entra direto na
          plataforma — sem código, sem senha temporária.
        </p>

        <div className="mb-3.5 flex items-center gap-3.5 rounded-xl border border-border-subtle bg-bg-raised p-4.5">
          <AwAvatar
            src={CONVITE_INVITER.photo}
            initials={CONVITE_INVITER.initials}
            alt={CONVITE_INVITER.name}
            style={{ width: 44, height: 44, fontSize: 16 }}
          />
          <div className="min-w-0 flex-1">
            <div className="body-xs text-fg-tertiary">Convidada por</div>
            <div className="body-sm font-medium text-fg-primary">
              {CONVITE_INVITER.name}
            </div>
            <div className="body-xs text-fg-tertiary">
              {CONVITE_INVITER.role} · {CONVITE_INVITER.email}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-bg-raised p-4.5">
          <div className="aw-eyebrow mb-3 text-fg-tertiary">Seu acesso</div>

          <div className="flex items-start gap-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-bg-muted text-fg-secondary">
              <Icon name="headset_mic" size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="body-sm font-medium text-fg-primary">
                  {CONVITE_ROLE.name}
                </span>
                <span className="body-xs text-aw-emerald-700">
                  {CONVITE_ROLE.permissionCount} permissões
                </span>
              </div>
              <p className="mt-0.5 body-xs text-fg-secondary text-pretty">
                {CONVITE_ROLE.description}
              </p>
            </div>
          </div>

          {CONVITE_ROLE.groups.length > 0 && (
            <div className="mt-3.5 flex flex-wrap items-center gap-1.5 border-t border-border-subtle pt-3.5">
              <span className="body-xs text-fg-tertiary">Já entra em</span>
              {CONVITE_ROLE.groups.map((g) => (
                <span
                  key={g}
                  className="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-bg-surface px-2 py-0.5 body-xs text-fg-secondary"
                >
                  <Icon name="group" size={11} />
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center gap-2 body-xs text-fg-tertiary">
          <Icon name="schedule" size={14} />
          <span>Este link expira em {CONVITE_EXPIRA_EM}.</span>
        </div>

        <footer className="mt-12 flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 body-xs text-fg-tertiary">
            <Icon name="lock" size={12} />
            Conexão criptografada
          </span>
          <span className="flex-1" />
          <button
            type="button"
            onClick={aceitar}
            disabled={accepting}
            className="aw-btn aw-btn--primary aw-btn--md"
          >
            {accepting ? (
              <span
                aria-hidden="true"
                className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-[1.5px] border-white border-r-transparent"
              />
            ) : null}
            <span className="aw-btn__label">
              {accepting ? "Validando…" : "Aceitar e continuar"}
            </span>
            {!accepting && <Icon name="arrow_forward" size={16} />}
          </button>
        </footer>
      </section>
    </AwOnboardingShell>
  )
}
