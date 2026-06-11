"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwAvatar } from "@/components/ui/AwAvatar"
import { AwField, AwInput } from "@/components/ui/AwInput"
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

  // Quem entrou via SSO (Google/Microsoft) já tem foto de perfil — ela vem
  // junto. Aqui mockamos isso pré-preenchendo o avatar. (captura real = backend)
  const ssoPhoto = metodo === "google" || metodo === "microsoft"
  const [cargo, setCargo] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(
    ssoPhoto ? CONVITE_INVITEE.photo ?? null : null
  )
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const initials = CONVITE_INVITEE.initials

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarUrl((ev.target?.result as string) ?? null)
    reader.readAsDataURL(file)
  }

  const valid =
    cargo.trim().length >= 2 && phone.replace(/\D/g, "").length >= 10

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

        <div className="mb-6 flex items-center gap-5">
          <div className="relative shrink-0">
            <AwAvatar
              src={avatarUrl ?? undefined}
              initials={initials}
              alt={CONVITE_INVITEE.name}
              style={{ width: 72, height: 72, fontSize: 24 }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label={avatarUrl ? "Trocar foto" : "Adicionar foto"}
              title={avatarUrl ? "Trocar foto" : "Adicionar foto"}
              className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-bg-raised text-fg-secondary shadow-xs hover:border-border-strong hover:text-fg-primary"
            >
              <Icon name="edit" size={13} />
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
          <div className="min-w-0">
            <div className="truncate body-md font-medium text-fg-primary">
              {CONVITE_INVITEE.name}
            </div>
            <div className="mt-0.5 truncate body-sm text-fg-tertiary">
              {CONVITE_INVITEE.email}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field
            label="Cargo"
            icon="badge"
            value={cargo}
            onChange={setCargo}
            placeholder="Ex.: Atendente de pré-venda"
            required
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
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-bg-muted text-fg-secondary">
            <Icon name="headset_mic" size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="body-xs text-fg-tertiary">Sua função</div>
            <div className="body-sm font-medium text-fg-primary">
              {CONVITE_ROLE.name}
            </div>
            <p className="mt-1 body-xs text-fg-secondary text-pretty">
              {CONVITE_ROLE.description}
            </p>
          </div>
        </div>

        <footer className="mt-12 flex items-center gap-3">
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

// Identity fields use the framed (notched-outline) variant — low-density,
// high-touch screen. `icon` is kept in the type so existing call sites stay
// valid, but framed fields render icon-less by design. Every field here is
// required, so the per-field asterisk is dropped (it would be on all of them).
function Field({
  label,
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
    <AwField variant="framed" label={label}>
      <AwInput
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        type={type}
        required={required}
      />
    </AwField>
  )
}
