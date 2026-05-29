"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Icon } from "@/components/ui/Icon"
import { AwCheckbox } from "@/components/ui/AwCheckbox"
import { AwOnboardingShell } from "@/components/ui/AwOnboardingShell"
import { CONVITE_ORG, CONVITE_INVITEE } from "../_data"

const SECRET = "JBSW Y3DP EHPK 3PXP"

const BACKUP_CODES = [
  "DEMO-A3F9X-K2L7M",
  "DEMO-B8H4P-N6Q1R",
  "DEMO-C2J7V-W3D5T",
  "DEMO-D9K1Z-Y4E8U",
  "DEMO-E6L3B-X7F2H",
  "DEMO-F4M8N-P1G9J",
  "DEMO-G7N2C-Q5H6K",
  "DEMO-H1P5V-R8J3L",
  "DEMO-J5R8D-T2M4W",
  "DEMO-K9T3F-V6N1X",
]

export default function ConviteSegurancaPage() {
  return (
    <React.Suspense fallback={null}>
      <SegurancaContent />
    </React.Suspense>
  )
}

function SegurancaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const metodo = searchParams.get("metodo")
  const concluidoHref = `/convite/concluido${metodo ? `?metodo=${metodo}` : ""}`

  const [phase, setPhase] = React.useState<"setup" | "backup">("setup")
  const [code, setCode] = React.useState("")
  const [saved, setSaved] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const codeValid = code.replace(/\D/g, "").length === 6

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(BACKUP_CODES.join("\n"))
    } catch {
      /* clipboard pode falhar em http — segue mesmo assim */
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <AwOnboardingShell org={CONVITE_ORG}>
      <section>
        {phase === "setup" ? (
          <>
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-bg-surface px-2.5 py-1 body-xs text-fg-tertiary">
              <Icon name="shield" size={12} />
              <span>
                Exigido por <b className="font-medium text-fg-primary">{CONVITE_ORG.name}</b>
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
              <FakeQR />
              <div className="min-w-0 flex-1">
                <div className="aw-eyebrow mb-1.5 text-fg-tertiary">
                  Não consegue escanear?
                </div>
                <p className="m-0 mb-3 body-xs text-fg-secondary">
                  Adicione a conta manualmente com esta chave:
                </p>
                <code className="block rounded-md border border-border bg-bg-surface px-3 py-2 font-mono text-sm tracking-wide text-fg-primary">
                  {SECRET}
                </code>
              </div>
            </div>

            <label className="mt-6 flex flex-col gap-1.5">
              <span className="body-xs font-medium text-fg-secondary">
                Código do app autenticador
              </span>
              <span className="flex h-11 items-center gap-2 rounded-md border border-border bg-bg-raised px-3.5 focus-within:border-fg-primary">
                <Icon name="pin" size={16} className="text-fg-tertiary" />
                <input
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  className="flex-1 border-0 bg-transparent body-sm tracking-[0.3em] tabular-nums outline-0"
                />
              </span>
            </label>

            <div className="mt-5 flex items-center gap-2 body-xs text-fg-tertiary">
              <Icon name="schedule" size={14} />
              <span>O código troca a cada 30 segundos.</span>
            </div>

            <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
              <Link
                href="/convite/perfil"
                className="aw-btn aw-btn--ghost aw-btn--md"
              >
                <Icon name="arrow_back" size={16} />
                <span className="aw-btn__label">Voltar</span>
              </Link>
              <span className="flex-1" />
              <button
                type="button"
                onClick={() => codeValid && setPhase("backup")}
                disabled={!codeValid}
                className="aw-btn aw-btn--primary aw-btn--md"
              >
                <span className="aw-btn__label">Confirmar e continuar</span>
                <Icon name="arrow_forward" size={16} />
              </button>
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

            <div className="mb-4 rounded-lg border border-border bg-bg-surface p-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-[13px] tabular-nums text-fg-primary">
                {BACKUP_CODES.map((c) => (
                  <code key={c} className="block">
                    {c}
                  </code>
                ))}
              </div>
            </div>

            <div className="mb-5 flex gap-2">
              <button
                type="button"
                onClick={copyAll}
                className="aw-btn aw-btn--secondary aw-btn--sm flex-1"
              >
                <Icon name={copied ? "check" : "content_copy"} size={14} />
                <span className="aw-btn__label">
                  {copied ? "Copiado" : "Copiar todos"}
                </span>
              </button>
              <button
                type="button"
                className="aw-btn aw-btn--secondary aw-btn--sm flex-1"
              >
                <Icon name="download" size={14} />
                <span className="aw-btn__label">Baixar .txt</span>
              </button>
            </div>

            <label className="flex cursor-pointer items-start gap-2.5">
              <AwCheckbox checked={saved} onChange={setSaved} className="mt-px" />
              <span className="body-sm text-fg-secondary">
                Salvei meus códigos de backup em um lugar seguro.
              </span>
            </label>

            <footer className="mt-7 flex items-center gap-3 border-t border-border-subtle pt-5">
              <button
                type="button"
                onClick={() => setPhase("setup")}
                className="aw-btn aw-btn--ghost aw-btn--md"
              >
                <Icon name="arrow_back" size={16} />
                <span className="aw-btn__label">Voltar</span>
              </button>
              <span className="flex-1" />
              {saved ? (
                <Link
                  href={concluidoHref}
                  className="aw-btn aw-btn--primary aw-btn--md"
                >
                  <span className="aw-btn__label">Concluir e entrar</span>
                  <Icon name="arrow_forward" size={16} />
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="aw-btn aw-btn--primary aw-btn--md"
                >
                  <span className="aw-btn__label">Concluir e entrar</span>
                  <Icon name="arrow_forward" size={16} />
                </button>
              )}
            </footer>
          </>
        )}
      </section>
    </AwOnboardingShell>
  )
}

/** QR fake determinístico — só visual, não decodifica nada. */
function FakeQR() {
  const size = 21
  const cells = React.useMemo(() => {
    const arr: boolean[] = []
    let s = 7
    for (let i = 0; i < size * size; i++) {
      s = (s * 9301 + 49297) % 233280
      arr.push(s / 233280 > 0.5)
    }
    return arr
  }, [])
  const isFinder = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7)
  return (
    <div
      className="grid h-[148px] w-[148px] flex-shrink-0 rounded-md border border-border-subtle bg-white p-2.5"
      style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
    >
      {cells.map((on, i) => {
        const x = i % size
        const y = Math.floor(i / size)
        let fill: string
        if (isFinder(x, y)) {
          const fx = x < 7 ? x : x - (size - 7)
          const fy = y < 7 ? y : y - (size - 7)
          const onOuter = fx === 0 || fx === 6 || fy === 0 || fy === 6
          const onInner = fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4
          fill = onOuter || onInner ? "#0D0D0D" : "#FFFFFF"
        } else {
          fill = on ? "#0D0D0D" : "#FFFFFF"
        }
        return <div key={i} style={{ background: fill, aspectRatio: "1 / 1" }} />
      })}
    </div>
  )
}
