"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwButton } from "@/components/ui/AwButton"
import { AwInput, AwField } from "@/components/ui/AwInput"
import { AwQrPlaceholder } from "@/components/ui/AwQrPlaceholder"
import { AwBackupCodes } from "@/components/ui/AwBackupCodes"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { CONVITE_ORG } from "../_data"

const SECRET = "JBSW Y3DP EHPK 3PXP"

const BACKUP_CODES = [
  "A3F9X-K2L7M",
  "B8H4P-N6Q1R",
  "C2J7V-W3D5T",
  "D9K1Z-Y4E8U",
  "E6L3B-X7F2H",
  "F4M8N-P1G9J",
  "G7N2C-Q5H6K",
  "H1P5V-R8J3L",
  "J5R8D-T2M4W",
  "K9T3F-V6N1X",
]

export default function ConviteSegurancaPage() {
  return (
    <React.Suspense fallback={null}>
      <SegurancaContent />
    </React.Suspense>
  )
}

function SegurancaContent() {
  const searchParams = useSearchParams()
  const metodo = searchParams.get("metodo")
  const concluidoHref = `/convite/concluido${metodo ? `?metodo=${metodo}` : ""}`

  const [phase, setPhase] = React.useState<"setup" | "backup">("setup")
  const [code, setCode] = React.useState("")
  const [saved, setSaved] = React.useState(false)

  const codeValid = code.replace(/\D/g, "").length === 6

  return (
    <AwOnboardingShell org={CONVITE_ORG}>
      <section>
        {phase === "setup" ? (
          <>
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-bg-surface px-2.5 py-1 body-xs text-fg-tertiary">
              <Icon name="shield" size={12} />
              <span>
                Exigido por{" "}
                <b className="font-medium text-fg-primary">{CONVITE_ORG.name}</b>
              </span>
            </div>

            <h3 className="mb-2 text-fg-primary text-balance">
              Ative a verificação em duas etapas
            </h3>
            <p className="mb-7 body-sm text-fg-secondary text-pretty">
              A {CONVITE_ORG.name} exige um segundo fator para todo mundo entrar.
              Escaneie o código com seu app autenticador (Google Authenticator,
              1Password, Authy) e confirme o código de 6 dígitos.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <AwQrPlaceholder ariaLabel="QR code do app autenticador" />
              <div className="min-w-0 flex-1">
                <div className="aw-eyebrow mb-1.5 text-fg-tertiary">
                  Não consegue escanear?
                </div>
                <p className="m-0 mb-3 body-xs text-fg-secondary">
                  Adicione a conta manualmente com esta chave:
                </p>
                <code className="block rounded-md border border-border bg-bg-surface px-3 py-2 text-sm tracking-wide tabular-nums text-fg-primary">
                  {SECRET}
                </code>
              </div>
            </div>

            <div className="mt-6">
              <AwField label="Código do app autenticador" htmlFor="totp-code">
                <AwInput
                  id="totp-code"
                  iconLeft="pin"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  style={{
                    letterSpacing: "0.3em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                />
              </AwField>
            </div>

            <div className="mt-5 flex items-center gap-2 body-xs text-fg-tertiary">
              <Icon name="schedule" size={14} />
              <span>O código troca a cada 30 segundos.</span>
            </div>

            <footer className="mt-12 flex items-center gap-3">
              <AwButton asChild variant="ghost" iconLeft="arrow_back">
                <Link href="/convite/perfil">Voltar</Link>
              </AwButton>
              <span className="flex-1" />
              <AwButton
                variant="primary"
                iconRight="arrow_forward"
                onClick={() => codeValid && setPhase("backup")}
                disabled={!codeValid}
              >
                Confirmar e continuar
              </AwButton>
            </footer>
          </>
        ) : (
          <>
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-aw-emerald-200 bg-aw-emerald-100 px-2.5 py-1 body-xs text-aw-emerald-800">
              <Icon name="check_circle" size={12} fill={1} />
              <span>App autenticador conectado</span>
            </div>

            <h3 className="mb-2 text-fg-primary text-balance">
              Guarde seus códigos de backup
            </h3>
            <p className="mb-5 body-sm text-fg-secondary text-pretty">
              Use um destes códigos para entrar se perder o acesso ao app
              autenticador. Cada código vale uma única vez — guarde em um lugar
              seguro.
            </p>

            <AwBackupCodes
              codes={BACKUP_CODES}
              confirm={{
                checked: saved,
                onChange: setSaved,
                label: "Salvei meus códigos de backup em um lugar seguro.",
              }}
            />

            <footer className="mt-12 flex items-center gap-3">
              <AwButton
                variant="ghost"
                iconLeft="arrow_back"
                onClick={() => setPhase("setup")}
              >
                Voltar
              </AwButton>
              <span className="flex-1" />
              {saved ? (
                <AwButton asChild variant="primary" iconRight="arrow_forward">
                  <Link href={concluidoHref}>Concluir e entrar</Link>
                </AwButton>
              ) : (
                <AwButton variant="primary" iconRight="arrow_forward" disabled>
                  Concluir e entrar
                </AwButton>
              )}
            </footer>
          </>
        )}
      </section>
    </AwOnboardingShell>
  )
}
