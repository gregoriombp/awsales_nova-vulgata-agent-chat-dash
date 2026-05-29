"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwAvatar } from "@/components/ui/AwAvatar"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { CONVITE_INVITEE, CONVITE_ORG, CONVITE_ROLE } from "../_data"

function fmtPhone(input: string): string {
  const d = input.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export default function ConvitePerfilPage() {
  return (
    <React.Suspense fallback={null}>
      <PerfilContent />
    </React.Suspense>
  )
}

function PerfilContent() {
  const searchParams = useSearchParams()
  const metodo = searchParams.get("metodo")
  const nextHref = `/convite/seguranca${metodo ? `?metodo=${metodo}` : ""}`

  const [name, setName] = React.useState(CONVITE_INVITEE.name)
  const [cargo, setCargo] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null)
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

  const valid =
    name.trim().length >= 2 &&
    cargo.trim().length >= 2 &&
    phone.replace(/\D/g, "").length >= 10

  return (
    <AwOnboardingShell org={CONVITE_ORG}>
      <section>
        <h3 className="mb-2 text-fg-primary text-balance">
          Conte um pouco sobre você
        </h3>

        <p className="mb-7 body-sm text-fg-secondary text-pretty">
          Esses dados aparecem no seu perfil interno e ajudam o time a te
          encontrar. Pode ajustar depois nas configurações.
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

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field
            label="Seu nome"
            icon="person"
            value={name}
            onChange={setName}
            placeholder="Como você gosta de ser chamada"
            required
          />
          <Field
            label="Cargo"
            icon="badge"
            value={cargo}
            onChange={setCargo}
            placeholder="Ex.: Atendente de pré-venda"
            required
          />
          <Field
            label="E-mail"
            icon="mail"
            value={CONVITE_INVITEE.email}
            onChange={() => {}}
            readOnly
            hint="Veio do convite — só o admin pode trocar."
          />
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

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-border-subtle bg-bg-raised p-4">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-bg-muted text-fg-secondary">
            <Icon name="headset_mic" size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="body-xs text-fg-tertiary">Sua função</div>
            <div className="body-sm font-medium text-fg-primary">
              {CONVITE_ROLE.name}
              <span className="ml-2 body-xs font-normal text-fg-tertiary">
                · definido pelo admin
              </span>
            </div>
            <p className="mt-1 body-xs text-fg-secondary text-pretty">
              {CONVITE_ROLE.description}
            </p>
          </div>
        </div>

        <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
          <Link href="/convite/conta" className="aw-btn aw-btn--ghost aw-btn--md">
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

function Field({
  label,
  icon,
  value,
  onChange,
  placeholder,
  inputMode,
  type = "text",
  required,
  readOnly,
  hint,
}: {
  label: string
  icon: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]
  type?: string
  required?: boolean
  readOnly?: boolean
  hint?: string
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1 body-xs font-medium text-fg-secondary">
        {label}
        {required && <span className="text-[var(--accent-danger)]">*</span>}
      </span>
      <span
        className={`flex h-[42px] items-center gap-2 rounded-md border border-border px-3.5 transition-colors duration-aw-fast focus-within:border-fg-primary ${
          readOnly ? "bg-bg-surface" : "bg-bg-raised"
        }`}
      >
        <Icon name={icon} size={16} className="text-fg-tertiary" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          type={type}
          required={required}
          readOnly={readOnly}
          className={`flex-1 border-0 bg-transparent body-sm outline-none focus:outline-none focus-visible:outline-none ${
            readOnly ? "text-fg-secondary" : ""
          }`}
        />
        {readOnly && (
          <Icon name="lock" size={14} className="text-fg-tertiary" />
        )}
      </span>
      {hint && <span className="body-xs text-fg-tertiary">{hint}</span>}
    </label>
  )
}
