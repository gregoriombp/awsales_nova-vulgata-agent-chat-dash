"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwAvatar } from "@/components/ui/AwAvatar"
import { AwCheckbox } from "@/components/ui/AwCheckbox"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG, ONBOARDING_USER } from "../_data"

type ExtraEmail = { id: string; value: string }

function fmtPhone(input: string): string {
  const d = input.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

const isEmailValid = (email: string) => {
  const e = email.trim()
  return e.length > 3 && e.includes("@") && e.includes(".")
}

export default function PerfilPage() {
  return (
    <React.Suspense fallback={null}>
      <PerfilContent />
    </React.Suspense>
  )
}

function PerfilContent() {
  const searchParams = useSearchParams()
  const metodo = searchParams.get("metodo")
  const nextHref = `/primeiro-acesso/contrato${
    metodo ? `?metodo=${metodo}` : ""
  }`

  // Quem entrou via SSO (Google/Microsoft) já tem foto de perfil — ela vem
  // junto. Aqui mockamos isso pré-preenchendo o avatar. (captura real = backend)
  const ssoPhoto = metodo === "google" || metodo === "microsoft"
  const [name, setName] = React.useState(ONBOARDING_USER.name)
  const [cargo, setCargo] = React.useState("")
  const [email, setEmail] = React.useState(ONBOARDING_USER.email)
  const [phone, setPhone] = React.useState("")
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(
    ssoPhoto ? ONBOARDING_USER.photo ?? "/assets/ui-faces/male-7.jpg" : null
  )
  const [invoiceSelf, setInvoiceSelf] = React.useState(true)
  const [extraEmails, setExtraEmails] = React.useState<ExtraEmail[]>([])
  const [pendingEmail, setPendingEmail] = React.useState("")
  const [addingEmail, setAddingEmail] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const emailIdRef = React.useRef(0)

  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarUrl((ev.target?.result as string) ?? null)
    reader.readAsDataURL(file)
  }

  const canAddPending = isEmailValid(pendingEmail) &&
    !extraEmails.some((e) => e.value.toLowerCase() === pendingEmail.trim().toLowerCase())

  const commitPendingEmail = () => {
    if (!canAddPending) return
    setExtraEmails((list) => [
      ...list,
      { id: `e${emailIdRef.current++}`, value: pendingEmail.trim() },
    ])
    setPendingEmail("")
  }
  const removeEmail = (id: string) =>
    setExtraEmails((list) => list.filter((e) => e.id !== id))

  const needsRecipient = !invoiceSelf
  const recipientCoverageOk = invoiceSelf || extraEmails.length > 0

  const valid =
    name.trim().length >= 2 &&
    cargo.trim().length >= 2 &&
    isEmailValid(email) &&
    phone.replace(/\D/g, "").length >= 10 &&
    recipientCoverageOk

  return (
    <AwOnboardingShell org={ONBOARDING_ORG}>
      <section>
        <h3 className="mb-2 text-fg-primary text-balance">
          Conte um pouco sobre você
        </h3>

        <p className="mb-7 body-sm text-fg-secondary text-pretty">
          Como você quer ser chamado por aqui e para quem mandamos as faturas.
          Pode ajustar depois nas configurações.
        </p>

        <div className="mb-5 flex items-center gap-5 rounded-xl border border-border-subtle bg-bg-raised p-[18px]">
          <AwAvatar
            src={avatarUrl ?? undefined}
            initials={initials}
            alt={name}
            style={{ width: 72, height: 72, fontSize: 24 }}
          />
          <div className="min-w-0 flex-1">
            {ssoPhoto ? (
              <>
                <div className="truncate body-sm font-medium text-fg-primary">
                  {name}
                </div>
                <div className="mt-0.5 truncate body-xs text-fg-tertiary">
                  {email}
                </div>
              </>
            ) : (
              <>
                <div className="body-sm font-medium text-fg-primary">
                  Foto de perfil
                </div>
                <div className="mt-0.5 body-xs text-fg-tertiary">
                  Opcional · PNG ou JPG, até 4 MB
                </div>
              </>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aw-btn aw-btn--secondary aw-btn--sm mt-2.5"
            >
              <Icon name="upload" size={12} />
              <span className="aw-btn__label">
                {avatarUrl ? "Trocar foto" : "Adicionar foto"}
              </span>
            </button>
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

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {/* Em SSO (Google/Microsoft) nome e e-mail vêm do provedor e aparecem
              como identidade no card acima — aqui só os campos editáveis. */}
          {!ssoPhoto && (
            <Field
              label="Seu nome"
              icon="person"
              value={name}
              onChange={setName}
              placeholder="Como você gosta de ser chamado"
              required
            />
          )}
          <Field
            label="Cargo"
            icon="badge"
            value={cargo}
            onChange={setCargo}
            placeholder="Ex.: Gerente Comercial"
            required
          />
          {!ssoPhoto && (
            <Field
              label="E-mail"
              icon="mail"
              value={email}
              onChange={setEmail}
              placeholder="seu@email.com"
              type="email"
              inputMode="email"
              required
            />
          )}
          <Field
            label="Celular"
            icon="phone"
            value={phone}
            onChange={(v) => setPhone(fmtPhone(v))}
            placeholder="(11) 99999-0000"
            inputMode="tel"
            required
          />
        </div>

        <div className="mt-6 rounded-xl border border-border-subtle bg-bg-raised p-4">
          <label className="flex cursor-pointer gap-3">
            <AwCheckbox
              checked={invoiceSelf}
              onChange={setInvoiceSelf}
              className="mt-px"
            />
            <span className="flex-1">
              <span className="block body-xs font-medium text-fg-primary">
                Receber faturas e notas fiscais no meu e-mail
              </span>
              <span className="mt-0.5 block body-xs text-fg-tertiary">
                {ONBOARDING_USER.email}
              </span>
            </span>
          </label>
        </div>

        <div className="mt-3">
          {(() => {
            // O campo fica escondido atrás de um botão discreto. Aparece — com
            // transição suave pra baixo — quando o usuário clica em "adicionar",
            // quando já há e-mails, ou quando a caixa "no meu e-mail" é desmarcada
            // (aí precisa de destinatário e o campo chama atenção).
            const needsAttention = needsRecipient && extraEmails.length === 0
            const showField = addingEmail || extraEmails.length > 0 || needsAttention
            return (
              <>
                {!showField && (
                  <button
                    type="button"
                    onClick={() => setAddingEmail(true)}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 body-xs font-medium text-fg-secondary transition-colors hover:bg-bg-muted hover:text-fg-primary"
                  >
                    <Icon name="add" size={15} />
                    Adicionar e-mail para receber faturas
                  </button>
                )}
                <div
                  className="grid transition-[grid-template-rows,opacity] duration-aw-base ease-aw-out"
                  style={{
                    gridTemplateRows: showField ? "1fr" : "0fr",
                    opacity: showField ? 1 : 0,
                  }}
                >
                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "flex h-[38px] flex-1 items-center gap-2 rounded-md border bg-bg-raised px-3 transition-colors duration-aw-fast focus-within:border-fg-primary",
                          needsAttention ? "border-aw-amber-500 bg-aw-amber-100" : "border-border",
                        ].join(" ")}
                      >
                        <Icon name="mail" size={14} className="text-fg-tertiary" />
                        <input
                          type="email"
                          inputMode="email"
                          value={pendingEmail}
                          onChange={(e) => setPendingEmail(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              commitPendingEmail()
                            }
                          }}
                          placeholder="financeiro@empresa.com"
                          className="flex-1 border-0 bg-transparent body-xs outline-none focus:outline-none focus-visible:outline-none"
                        />
                      </span>
                      <button
                        type="button"
                        onClick={commitPendingEmail}
                        disabled={!canAddPending}
                        aria-label="Adicionar e-mail"
                        className={[
                          "flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-md transition-colors duration-aw-fast",
                          canAddPending
                            ? "bg-fg-primary text-white hover:opacity-90"
                            : "bg-bg-muted text-fg-tertiary",
                        ].join(" ")}
                      >
                        <Icon name="add" size={16} />
                      </button>
                    </div>

                    <p className="mt-2 flex items-start gap-1.5 body-xs text-fg-tertiary">
                      <Icon name="info" size={12} className="mt-px flex-shrink-0" />
                      <span>
                        Cada e-mail recebe um convite para entrar na organização. A pessoa
                        precisa confirmar o convite para começar a receber as faturas.
                      </span>
                    </p>
                  </div>
                </div>
              </>
            )
          })()}

          {extraEmails.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1.5">
              {extraEmails.map((e) => (
                <InvitedEmailRow
                  key={e.id}
                  value={e.value}
                  onRemove={() => removeEmail(e.id)}
                />
              ))}
            </ul>
          )}

          {needsRecipient && extraEmails.length === 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-md bg-aw-amber-100 px-3 py-2.5 body-xs text-aw-amber-800">
              <Icon name="error" size={14} fill={1} />
              <span>
                Adicione ao menos um e-mail para receber as faturas.
              </span>
            </div>
          )}
        </div>

        <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
          <span className="flex-1" />
          {valid ? (
            <Link href={nextHref} className="aw-btn aw-btn--primary aw-btn--md">
              <span className="aw-btn__label">Continuar</span>
              <Icon name="arrow_forward" size={16} />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="aw-btn aw-btn--primary aw-btn--md"
            >
              <span className="aw-btn__label">Continuar</span>
              <Icon name="arrow_forward" size={16} />
            </button>
          )}
        </footer>
      </section>
    </AwOnboardingShell>
  )
}

/** Chip com e-mail convidado — apresentado em lista após confirmar o "+". */
function InvitedEmailRow({
  value,
  onRemove,
}: {
  value: string
  onRemove: () => void
}) {
  const [shown, setShown] = React.useState(false)

  React.useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <li
      className="grid transition-[grid-template-rows,opacity] duration-aw-base ease-aw-out"
      style={{
        gridTemplateRows: shown ? "1fr" : "0fr",
        opacity: shown ? 1 : 0,
      }}
    >
      <div className="overflow-hidden">
        <div className="flex items-center gap-2 rounded-md border border-border-subtle bg-bg-raised px-3 py-2">
          <Icon name="mail" size={14} className="text-fg-tertiary" />
          <span className="flex-1 truncate body-xs text-fg-primary">
            {value}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-aw-amber-100 px-2 py-px text-[10px] font-medium text-aw-amber-800">
            <Icon name="schedule" size={10} />
            convite pendente
          </span>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remover ${value}`}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-fg-tertiary transition-colors duration-aw-fast hover:bg-bg-muted hover:text-fg-secondary"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      </div>
    </li>
  )
}

function Field({
  label,
  icon,
  value,
  onChange,
  placeholder,
  inputMode,
  type = "text",
  required,
}: {
  label: string
  icon: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  type?: string
  required?: boolean
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1 body-xs font-medium text-fg-secondary">
        {label}
        {required && <span className="text-[var(--accent-danger)]">*</span>}
      </span>
      <span className="flex h-[42px] items-center gap-2 rounded-md border border-border bg-bg-raised px-3.5 transition-colors duration-aw-fast focus-within:border-fg-primary">
        <Icon name={icon} size={16} className="text-fg-tertiary" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          type={type}
          required={required}
          className="flex-1 border-0 bg-transparent body-sm outline-none focus:outline-none focus-visible:outline-none"
        />
      </span>
    </label>
  )
}
