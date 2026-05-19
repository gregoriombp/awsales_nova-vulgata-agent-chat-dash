"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwAvatar } from "@/components/ui/AwAvatar"
import { AwCheckbox } from "@/components/ui/AwCheckbox"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { ONBOARDING_ORG, ONBOARDING_USER, authMethodLabel } from "../_data"

type Recipient = { name: string; role: string; email: string; phone: string }

function fmtPhone(input: string): string {
  const d = input.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
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

  const [name, setName] = React.useState(ONBOARDING_USER.name)
  const [phone, setPhone] = React.useState("")
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null)
  const [invoiceSelf, setInvoiceSelf] = React.useState(true)
  const [recipients, setRecipients] = React.useState<Recipient[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)

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

  const addRecipient = () =>
    setRecipients((r) => [...r, { name: "", role: "", email: "", phone: "" }])
  const updateRecipient = (i: number, key: keyof Recipient, value: string) =>
    setRecipients((r) =>
      r.map((x, idx) =>
        idx === i
          ? { ...x, [key]: key === "phone" ? fmtPhone(value) : value }
          : x
      )
    )
  const removeRecipient = (i: number) =>
    setRecipients((r) => r.filter((_, idx) => idx !== i))

  const isRecipientValid = (r: Recipient) =>
    r.name.trim().length >= 2 &&
    r.role.trim().length >= 2 &&
    r.email.includes("@") &&
    r.phone.replace(/\D/g, "").length >= 10
  const allRecipientsValid = recipients.every(isRecipientValid)
  const needsRecipient = !invoiceSelf
  const recipientCoverageOk =
    invoiceSelf || (recipients.length > 0 && allRecipientsValid)

  const valid =
    name.trim().length >= 2 &&
    phone.replace(/\D/g, "").length >= 10 &&
    allRecipientsValid &&
    recipientCoverageOk

  return (
    <AwOnboardingShell
      currentStep={2}
      org={ONBOARDING_ORG}
      authState={{
        method: authMethodLabel(metodo),
        email: ONBOARDING_USER.email,
      }}
    >
      <section>
        <h3 className="mb-2 text-fg-primary text-balance">
          Conte um pouco sobre você.
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
            <div className="body-sm font-medium text-fg-primary">
              Foto de perfil
            </div>
            <div className="mt-0.5 body-xs text-fg-tertiary">
              Opcional · PNG ou JPG, até 4 MB
            </div>
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

        <div className="flex flex-col gap-3.5">
          <Field
            label="Seu nome"
            icon="person"
            value={name}
            onChange={setName}
            placeholder="Como você gosta de ser chamado"
          />
          <Field
            label="Telefone"
            icon="phone"
            value={phone}
            onChange={(v) => setPhone(fmtPhone(v))}
            placeholder="(11) 99999-0000"
            inputMode="tel"
          />
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-border-subtle bg-bg-raised">
          <div className="aw-eyebrow px-4 pt-3.5 text-fg-tertiary">
            Quem recebe as faturas
          </div>

          <label className="flex cursor-pointer gap-3 px-4 py-3">
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

          <div className="border-t border-border-subtle px-4 py-3.5">
            <div
              className={[
                "flex items-start justify-between gap-3",
                recipients.length > 0 || needsRecipient ? "mb-3" : "",
              ].join(" ")}
            >
              <div className="min-w-0 flex-1">
                <div className="body-xs font-medium text-fg-primary">
                  Outras pessoas que recebem as faturas
                </div>
                <div
                  className={[
                    "mt-0.5 body-xs",
                    needsRecipient && recipients.length === 0
                      ? "text-aw-amber-800"
                      : "text-fg-tertiary",
                  ].join(" ")}
                >
                  {invoiceSelf
                    ? "Opcional · adicione quem mais deve receber"
                    : recipients.length === 0
                      ? "Obrigatório · você desativou seu e-mail, então ao menos uma pessoa precisa receber"
                      : "Obrigatório · preencha os 4 campos de cada pessoa"}
                </div>
              </div>
              <button
                type="button"
                onClick={addRecipient}
                className="aw-btn aw-btn--secondary aw-btn--sm flex-shrink-0"
              >
                <Icon name="add" size={12} />
                <span className="aw-btn__label">Adicionar pessoa</span>
              </button>
            </div>

            {recipients.length === 0 && needsRecipient && (
              <div className="flex items-center gap-2 rounded-md bg-aw-amber-100 px-3 py-2.5 body-xs text-aw-amber-800">
                <Icon name="error" size={14} fill={1} />
                <span>
                  Adicione ao menos uma pessoa para receber as faturas.
                </span>
              </div>
            )}

            {recipients.length > 0 && (
              <div className="flex flex-col gap-2.5">
                {recipients.map((r, i) => (
                  <RecipientCard
                    key={i}
                    index={i}
                    recipient={r}
                    onChange={(key, value) => updateRecipient(i, key, value)}
                    onRemove={() => removeRecipient(i)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
          <Link
            href={`/primeiro-acesso/conta`}
            className="aw-btn aw-btn--ghost aw-btn--md"
          >
            <Icon name="arrow_back" size={16} />
            <span className="aw-btn__label">Voltar</span>
          </Link>
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

function RecipientCard({
  index,
  recipient,
  onChange,
  onRemove,
}: {
  index: number
  recipient: Recipient
  onChange: (key: keyof Recipient, value: string) => void
  onRemove: () => void
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-3">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 aw-eyebrow text-fg-tertiary">
          <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-xs border border-border-subtle bg-bg-raised tabular-nums text-fg-secondary">
            {index + 1}
          </span>
          Destinatário
        </span>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remover destinatário"
          className="flex h-[26px] w-[26px] items-center justify-center rounded-sm text-fg-tertiary transition-colors duration-aw-fast hover:bg-bg-muted hover:text-fg-secondary"
        >
          <Icon name="close" size={14} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <Field
          compact
          label="Nome"
          icon="person"
          value={recipient.name}
          onChange={(v) => onChange("name", v)}
          placeholder="Nome completo"
        />
        <Field
          compact
          label="Cargo"
          icon="badge"
          value={recipient.role}
          onChange={(v) => onChange("role", v)}
          placeholder="Ex: Analista financeiro"
        />
        <Field
          compact
          label="E-mail"
          icon="mail"
          type="email"
          value={recipient.email}
          onChange={(v) => onChange("email", v)}
          placeholder="financeiro@empresa.com"
        />
        <Field
          compact
          label="Telefone"
          icon="phone"
          inputMode="tel"
          value={recipient.phone}
          onChange={(v) => onChange("phone", v)}
          placeholder="(11) 99999-0000"
        />
      </div>
    </div>
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
  compact = false,
}: {
  label: string
  icon: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  type?: string
  compact?: boolean
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="body-xs font-medium text-fg-secondary">{label}</span>
      <span
        className={[
          "flex items-center gap-2 rounded-md border border-border bg-bg-raised px-3.5 transition-colors duration-aw-fast focus-within:border-fg-primary",
          compact ? "h-[38px]" : "h-[42px]",
        ].join(" ")}
      >
        <Icon
          name={icon}
          size={compact ? 14 : 16}
          className="text-fg-tertiary"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          type={type}
          className={[
            "flex-1 border-0 bg-transparent outline-none focus:outline-none focus-visible:outline-none",
            compact ? "body-xs" : "body-sm",
          ].join(" ")}
        />
      </span>
    </label>
  )
}
