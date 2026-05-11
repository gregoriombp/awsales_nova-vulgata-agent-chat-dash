"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwAvatar } from "@/components/ui/AwAvatar"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG, ONBOARDING_USER } from "../_data"

type Via = "google" | "ms" | "magic" | "password" | null

const OAUTH_AVATARS: Record<"google" | "ms", string> = {
  google: "/assets/ui-faces/male-2.jpg",
  ms: "/assets/ui-faces/male-7.jpg",
}

export default function PerfilPage() {
  const searchParams = useSearchParams()
  const via = (searchParams.get("via") as Via) ?? "password"
  const isOAuth = via === "google" || via === "ms"
  const oauthLabel = via === "google" ? "Google" : via === "ms" ? "Microsoft" : null

  const [name, setName] = React.useState(ONBOARDING_USER.name)
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(
    isOAuth ? OAUTH_AVATARS[via as "google" | "ms"] : null,
  )
  const [keepOauthAvatar, setKeepOauthAvatar] = React.useState(isOAuth)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")

  const pickFile = () => fileInputRef.current?.click()

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setAvatarUrl((ev.target?.result as string) ?? null)
      setKeepOauthAvatar(false)
    }
    reader.readAsDataURL(file)
  }

  const removeAvatar = () => {
    setAvatarUrl(null)
    setKeepOauthAvatar(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const nameValid = name.trim().length >= 2

  return (
    <AwOnboardingShell currentStep={7} org={ONBOARDING_ORG}>
      <section>
        <h1
          className="mb-2 font-display font-medium text-fg-primary text-balance"
          style={{
            fontSize: "var(--h3-size)",
            lineHeight: 1.15,
            letterSpacing: "-0.015em",
          }}
        >
          Vamos personalizar seu perfil.
        </h1>

        <p
          className="mb-7 text-fg-secondary text-pretty"
          style={{ fontSize: "var(--body-sm-size)", lineHeight: 1.5 }}
        >
          {isOAuth ? (
            <>
              Importamos sua foto e nome da sua conta{" "}
              <span className="font-medium text-fg-primary">{oauthLabel}</span>.
              Você pode editar agora ou deixar pra depois nas configurações.
            </>
          ) : (
            <>
              Adicione uma foto e confirme como quer ser chamado por aqui.
              Tudo isso pode mudar depois nas configurações da conta.
            </>
          )}
        </p>

        <div className="mb-6 flex items-center gap-5 rounded-xl border border-border-subtle bg-bg-raised p-5">
          <div className="relative">
            <AwAvatar
              src={avatarUrl ?? undefined}
              initials={initials || "?"}
              alt={name}
              style={{ width: 88, height: 88, fontSize: 30 }}
            />
            {isOAuth && keepOauthAvatar && (
              <span
                aria-hidden="true"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-bg-raised bg-bg-surface"
              >
                {via === "google" ? <GoogleBadge /> : <MsBadge />}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div
              className="font-medium text-fg-primary"
              style={{ fontSize: 14 }}
            >
              Foto de perfil
            </div>
            <div
              className="mt-0.5 text-fg-tertiary"
              style={{ fontSize: 12, lineHeight: 1.5 }}
            >
              {isOAuth && keepOauthAvatar
                ? `Importado da sua conta ${oauthLabel}. PNG ou JPG, até 4 MB.`
                : avatarUrl
                ? "PNG ou JPG, até 4 MB."
                : "PNG ou JPG, até 4 MB. Quadrada de preferência."}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={pickFile}
                className="aw-btn aw-btn--secondary aw-btn--sm"
              >
                <Icon name="upload" size={14} />
                <span className="aw-btn__label">
                  {avatarUrl ? "Trocar foto" : "Adicionar foto"}
                </span>
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="aw-btn aw-btn--ghost aw-btn--sm"
                >
                  <span className="aw-btn__label">Remover</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={onFileChange}
              className="hidden"
              aria-hidden="true"
            />
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span
            className="font-medium text-fg-secondary"
            style={{ fontSize: 12 }}
          >
            Seu nome
          </span>
          <span className="flex h-11 items-center gap-2 rounded-md border border-border bg-bg-raised px-3.5 focus-within:border-fg-primary">
            <Icon name="person" size={18} className="text-fg-tertiary" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como você gosta de ser chamado(a)"
              autoComplete="name"
              className="flex-1 border-0 bg-transparent font-sans outline-0"
              style={{ fontSize: 14 }}
            />
          </span>
          <span
            className="text-fg-tertiary"
            style={{ fontSize: 11, lineHeight: 1.4 }}
          >
            É assim que seu nome aparece nos agentes, no Review Mode e nos
            convites que você enviar pro time.
          </span>
        </label>

        <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
          <Link
            href="/primeiro-acesso/acesso"
            className="aw-btn aw-btn--ghost aw-btn--md"
          >
            <Icon name="arrow_back" size={16} />
            <span className="aw-btn__label">Voltar</span>
          </Link>
          <span className="flex-1" />
          {nameValid ? (
            <Link
              href="/inicio?welcome=1"
              className="aw-btn aw-btn--primary aw-btn--md"
            >
              <span className="aw-btn__label">Continuar pra plataforma</span>
              <Icon name="arrow_forward" size={16} />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="aw-btn aw-btn--primary aw-btn--md"
            >
              <span className="aw-btn__label">Continuar pra plataforma</span>
              <Icon name="arrow_forward" size={16} />
            </button>
          )}
        </footer>
      </section>
    </AwOnboardingShell>
  )
}

function GoogleBadge() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} aria-hidden="true">
      <path fill="#4285F4" d="M22.5 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.22-4.74 3.22-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.99 10.99 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  )
}

function MsBadge() {
  return (
    <svg viewBox="0 0 24 24" width={14} height={14} aria-hidden="true">
      <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
      <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
      <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
      <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
    </svg>
  )
}
