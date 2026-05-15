"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwAvatar } from "@/components/ui/AwAvatar"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG, ONBOARDING_USER } from "../_data"

type Via = "google" | "ms" | "password" | null

const OAUTH_AVATARS: Record<"google" | "ms", string> = {
  google: "/assets/ui-faces/male-2.jpg",
  ms: "/assets/ui-faces/male-7.jpg",
}

type InvoiceRecipient = {
  email: string
  name: string
  role: string
  phone: string
}

function formatPhoneBR(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export default function PerfilPage() {
  const searchParams = useSearchParams()
  const via = (searchParams.get("via") as Via) ?? "password"
  const isOAuth = via === "google" || via === "ms"
  const oauthLabel = via === "google" ? "Google" : via === "ms" ? "Microsoft" : null

  const [name, setName] = React.useState(ONBOARDING_USER.name)
  const [phone, setPhone] = React.useState("")
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(
    isOAuth ? OAUTH_AVATARS[via as "google" | "ms"] : null,
  )
  const [keepOauthAvatar, setKeepOauthAvatar] = React.useState(isOAuth)
  const [invoiceSelf, setInvoiceSelf] = React.useState(true)
  const [recipient, setRecipient] = React.useState<InvoiceRecipient>({
    email: "",
    name: "",
    role: "",
    phone: "",
  })
  const [extraEmails, setExtraEmails] = React.useState<string[]>([])
  const [termsAccepted, setTermsAccepted] = React.useState(false)
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

  const updateRecipient = (key: keyof InvoiceRecipient, value: string) => {
    setRecipient((prev) => ({
      ...prev,
      [key]: key === "phone" ? formatPhoneBR(value) : value,
    }))
  }

  const addExtraEmail = () => setExtraEmails((prev) => [...prev, ""])
  const updateExtraEmail = (i: number, value: string) =>
    setExtraEmails((prev) => prev.map((v, idx) => (idx === i ? value : v)))
  const removeExtraEmail = (i: number) =>
    setExtraEmails((prev) => prev.filter((_, idx) => idx !== i))

  const nameValid = name.trim().length >= 2
  const phoneValid = phone.replace(/\D/g, "").length >= 10
  const recipientValid =
    invoiceSelf ||
    (recipient.email.includes("@") &&
      recipient.name.trim().length >= 2 &&
      recipient.role.trim().length >= 2 &&
      recipient.phone.replace(/\D/g, "").length >= 10)
  const extrasValid = extraEmails.every(
    (e) => e.trim().length === 0 || e.includes("@"),
  )
  const formValid =
    nameValid && phoneValid && recipientValid && extrasValid && termsAccepted

  return (
    <AwOnboardingShell currentStep={8} org={ONBOARDING_ORG}>
      <section>
        <h3 className="mb-2 text-fg-primary text-balance">
          Vamos personalizar seu perfil.
        </h3>

        <p className="mb-7 body-sm text-fg-secondary text-pretty">
          {isOAuth ? (
            <>
              Trouxemos sua foto e nome da sua conta{" "}
              <span className="font-medium text-fg-primary">{oauthLabel}</span>.
              Ajuste agora ou edite depois nas configurações.
            </>
          ) : (
            <>
              Adicione uma foto e confirme como quer ser chamado por aqui.
              Você pode mudar tudo depois nas configurações da conta.
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
            <div className="body-sm font-medium text-fg-primary">
              Foto de perfil
            </div>
            <div className="mt-0.5 body-xs text-fg-tertiary">
              {isOAuth && keepOauthAvatar
                ? `Importada da sua conta ${oauthLabel}. PNG ou JPG, até 4 MB.`
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

        <div className="flex flex-col gap-4">
          <TextField
            label="Seu nome"
            icon="person"
            value={name}
            onChange={setName}
            placeholder="Como você gosta de ser chamado(a)"
            autoComplete="name"
            hint="É assim que seu nome aparece pra equipe — nos agentes, no Review Mode e nos convites que você mandar."
          />

          <TextField
            label="Telefone"
            icon="phone"
            value={phone}
            onChange={(v) => setPhone(formatPhoneBR(v))}
            placeholder="(11) 99999-0000"
            autoComplete="tel"
            inputMode="tel"
            hint="Usamos pra notificações críticas da conta e pro seu Account Manager te encontrar."
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-border-subtle bg-bg-raised">
          <label className="flex cursor-pointer items-start gap-3 px-4 py-3.5">
            <CheckboxControl
              checked={invoiceSelf}
              onChange={setInvoiceSelf}
            />
            <span className="min-w-0 flex-1">
              <span className="block body-xs font-medium text-fg-primary">
                Receber faturas e notas fiscais neste e-mail
              </span>
              <span className="mt-0.5 block body-xs text-fg-tertiary">
                {ONBOARDING_USER.email}
              </span>
            </span>
          </label>

          <div
            className={[
              "grid transition-[grid-template-rows] ease-out",
              invoiceSelf ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
            ].join(" ")}
            style={{ transitionDuration: "260ms" }}
            aria-hidden={invoiceSelf}
          >
            <div className="min-h-0 overflow-hidden">
              <div
                className={[
                  "border-t border-border-subtle transition-opacity ease-out",
                  invoiceSelf
                    ? "opacity-0 pointer-events-none"
                    : "opacity-100",
                ].join(" ")}
                style={{ transitionDuration: "240ms" }}
              >
                <div className="grid gap-3 px-4 py-4">
                  <div className="body-xs text-fg-tertiary">
                    Quem deve receber as faturas?
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <TextField
                      label="E-mail"
                      icon="mail"
                      value={recipient.email}
                      onChange={(v) => updateRecipient("email", v)}
                      placeholder="financeiro@empresa.com"
                      autoComplete="email"
                      type="email"
                      compact
                    />
                    <TextField
                      label="Nome"
                      icon="person"
                      value={recipient.name}
                      onChange={(v) => updateRecipient("name", v)}
                      placeholder="Nome completo"
                      autoComplete="name"
                      compact
                    />
                    <TextField
                      label="Cargo"
                      icon="badge"
                      value={recipient.role}
                      onChange={(v) => updateRecipient("role", v)}
                      placeholder="Ex: Analista financeiro"
                      compact
                    />
                    <TextField
                      label="Telefone"
                      icon="phone"
                      value={recipient.phone}
                      onChange={(v) => updateRecipient("phone", v)}
                      placeholder="(11) 99999-0000"
                      autoComplete="tel"
                      inputMode="tel"
                      compact
                    />
                  </div>
                </div>

                <div className="border-t border-border-subtle px-4 py-3.5">
                  <div className="mb-2 flex items-center justify-between body-xs">
                    <span className="font-medium text-fg-primary">
                      E-mails extras pra receber as faturas
                    </span>
                    <span className="body-xs text-fg-tertiary">
                      opcional
                    </span>
                  </div>
                  {extraEmails.length > 0 && (
                    <ul className="m-0 mb-2.5 flex flex-col gap-2 list-none p-0">
                      {extraEmails.map((email, i) => (
                        <li
                          key={i}
                          className="aw-fade-in flex items-center gap-2"
                        >
                          <span className="flex h-10 flex-1 items-center gap-2 rounded-md border border-border bg-bg-canvas px-3 transition-colors duration-aw-fast focus-within:border-fg-primary">
                            <Icon
                              name="mail"
                              size={16}
                              className="text-fg-tertiary"
                            />
                            <input
                              value={email}
                              onChange={(e) =>
                                updateExtraEmail(i, e.target.value)
                              }
                              placeholder="email-extra@empresa.com"
                              type="email"
                              autoComplete="email"
                              className="flex-1 border-0 bg-transparent body-xs outline-none focus:outline-none focus-visible:outline-none"
                            />
                          </span>
                          <button
                            type="button"
                            onClick={() => removeExtraEmail(i)}
                            aria-label="Remover e-mail"
                            className="flex h-10 w-10 items-center justify-center rounded-md text-fg-tertiary transition-colors duration-aw-fast hover:bg-bg-muted hover:text-fg-secondary"
                          >
                            <Icon name="delete" size={18} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    type="button"
                    onClick={addExtraEmail}
                    className="aw-btn aw-btn--ghost aw-btn--sm"
                  >
                    <Icon name="add" size={14} />
                    <span className="aw-btn__label">Adicionar e-mail</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg border border-border-subtle bg-bg-surface px-4 py-3.5">
          <CheckboxControl
            checked={termsAccepted}
            onChange={setTermsAccepted}
          />
          <span className="min-w-0 flex-1 body-xs text-fg-secondary text-pretty">
            Li e concordo com os{" "}
            <a
              href="#"
              className="font-medium text-fg-primary underline decoration-dotted underline-offset-2 hover:no-underline"
              onClick={(e) => e.stopPropagation()}
            >
              Termos de Uso
            </a>{" "}
            e a{" "}
            <a
              href="#"
              className="font-medium text-fg-primary underline decoration-dotted underline-offset-2 hover:no-underline"
              onClick={(e) => e.stopPropagation()}
            >
              Política de Privacidade
            </a>{" "}
            da AwSales.
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
          {formValid ? (
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

function TextField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  autoComplete,
  type = "text",
  inputMode,
  hint,
  compact = false,
}: {
  label: string
  icon: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
  type?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  hint?: string
  compact?: boolean
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="body-xs font-medium text-fg-secondary">
        {label}
      </span>
      <span
        className={[
          "flex items-center gap-2 rounded-md border border-border bg-bg-raised px-3.5 transition-colors duration-aw-fast focus-within:border-fg-primary",
          compact ? "h-10" : "h-11",
        ].join(" ")}
      >
        <Icon name={icon} size={compact ? 16 : 18} className="text-fg-tertiary" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          type={type}
          inputMode={inputMode}
          className={[
            "flex-1 border-0 bg-transparent outline-none focus:outline-none focus-visible:outline-none",
            compact ? "body-xs" : "body-sm",
          ].join(" ")}
          style={{ boxShadow: "none" }}
        />
      </span>
      {hint && (
        <span className="body-xs text-fg-tertiary">
          {hint}
        </span>
      )}
    </label>
  )
}

function CheckboxControl({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <span
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={(e) => {
        e.preventDefault()
        onChange(!checked)
      }}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault()
          onChange(!checked)
        }
      }}
      className={[
        "mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-sm border-[1.5px] transition-colors duration-aw-fast",
        checked
          ? "border-fg-primary bg-fg-primary text-white"
          : "border-border-strong bg-bg-canvas text-transparent",
      ].join(" ")}
    >
      <Icon name="check" size={12} weight={700} />
    </span>
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
