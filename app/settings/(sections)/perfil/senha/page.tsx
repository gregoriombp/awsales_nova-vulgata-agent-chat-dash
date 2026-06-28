"use client";

import { useEffect, useRef, useState } from "react";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwBackupCodes } from "@/components/ui/AwBackupCodes";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import { AwButton } from "@/components/ui/AwButton";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwProgress } from "@/components/ui/AwProgress";
import { AwQrPlaceholder } from "@/components/ui/AwQrPlaceholder";
import { AwToggleRow } from "@/components/ui/AwToggle";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import {
  evaluatePassword,
  isLeakedPassword,
  PASSWORD_MIN_LENGTH,
} from "@/lib/password-policy";
import {
  submitNewPassword,
  verifyCurrentPassword,
  verifyTotpCode,
} from "@/lib/account-security";
import { SectionHeading, SettingsPageHeader } from "../../_components/shared";

/* Fixtures — substituir por dados reais */
const TOTP_CONFIG = {
  app: "Google Authenticator",
  configuredAt: "14 mar. 2026",
};

/* Tipo de credencial da conta — multi-valorado:
 *  "local"        senha local (mostra "Alterar senha")
 *  "sso+password" entra por SSO mas também tem senha local (botão + nota)
 *  "sso-only"     só SSO; a senha vive no provedor de identidade (sem botão) */
type AccountType = "local" | "sso+password" | "sso-only";
const ACCOUNT_TYPE: AccountType = "local";
/* Provedor de identidade quando a conta é SSO. */
const SSO_PROVIDER = "Google";

/* Chave manual do TOTP — mostrada quando o usuário não consegue ler o QR. */
const TOTP_SECRET_KEY = "JBSWY3DPEHPK3PXP";

const BACKUP_CODES_TOTAL = 10;
const BACKUP_CODES_REMAINING = 8;

const BACKUP_CODES_SAMPLE = [
  "7f3k-92xm",
  "p4nb-61qt",
  "8wcd-44hv",
  "r9zy-07ls",
  "n2ej-83ua",
  "k5tx-29gf",
  "d6oi-58rp",
  "c1mh-70bq",
  "a3vw-16yk",
  "e0su-35nc",
];

const ORG_REQUIRES_MFA = true;

/** OTP de 6 dígitos — uma caixa por dígito, full width no modal. Avança
 *  foco ao digitar e volta no Backspace; aceita paste do código completo. */
function OtpInput6({
  value,
  onChange,
  invalid,
  autoFocus,
}: {
  value: string;
  onChange: (next: string) => void;
  invalid?: boolean;
  autoFocus?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);
  const setChar = (i: number, char: string) => {
    const digit = char.replace(/\D/g, "").slice(0, 1);
    const next = (value + "      ").slice(0, 6).split("");
    next[i] = digit;
    onChange(next.join("").replace(/\s+$/, ""));
    if (digit && i < 5) refs.current[i + 1]?.focus();
  };
  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      e.preventDefault();
      refs.current[i - 1]?.focus();
      const next = value.split("");
      next[i - 1] = "";
      onChange(next.join("").replace(/\s+$/, ""));
    } else if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < 5) {
      e.preventDefault();
      refs.current[i + 1]?.focus();
    }
  };
  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };
  return (
    <div className="grid grid-cols-6 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          aria-label={`Dígito ${i + 1} de 6`}
          aria-invalid={invalid || undefined}
          value={value[i] ?? ""}
          onChange={(e) => setChar(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          onFocus={(e) => e.currentTarget.select()}
          className={cn(
            "aspect-square w-full rounded-md border bg-(--bg-raised) text-center font-mono text-2xl font-medium text-(--fg-primary) outline-hidden transition-colors duration-aw-fast focus:border-(--fg-primary)",
            invalid
              ? "border-(--accent-danger)"
              : "border-(--border-default)",
          )}
        />
      ))}
    </div>
  );
}

/** Linha de exigência da senha — checklist ao vivo na etapa 2. */
function PwRequirement({
  met,
  label,
  optional,
}: {
  met: boolean;
  label: string;
  optional?: boolean;
}) {
  return (
    <li className="flex items-center gap-2 body-xs">
      <Icon
        name={met ? "check_circle" : "radio_button_unchecked"}
        size={15}
        fill={met ? 1 : 0}
        weight={500}
        className={met ? "text-(--accent-success)" : "text-(--fg-tertiary)"}
      />
      <span className={met ? "text-(--fg-primary)" : "text-(--fg-secondary)"}>
        {label}
        {optional && (
          <span className="ml-1 text-(--fg-tertiary)">· recomendado</span>
        )}
      </span>
    </li>
  );
}

export default function SenhaPage() {
  /* Senha — modal em duas etapas: 1) confirmar identidade (senha atual),
   *  2) criar a nova senha (medidor + exigências). Espelha o fluxo de
   *  login/criar-senha do styleguide. */
  const [pwOpen, setPwOpen] = useState(false);
  const [pwStep, setPwStep] = useState<1 | 2>(1);
  const [pwVerifying, setPwVerifying] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  function openChangePw() {
    setPwStep(1);
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setPwError(""); setPwSaved(false); setPwVerifying(false);
    setPwOpen(true);
  }

  function closeChangePw() {
    setPwOpen(false);
    setPwStep(1);
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setPwError(""); setPwVerifying(false);
  }

  /* Etapa 1 → 2: autentica a senha atual antes de liberar a troca. */
  async function verifyCurrentPw() {
    setPwError("");
    if (!currentPw) { setPwError("Informe a senha atual."); return; }
    setPwVerifying(true);
    const ok = await verifyCurrentPassword(currentPw);
    setPwVerifying(false);
    if (!ok) {
      setPwError("Senha atual incorreta. Tente de novo.");
      return;
    }
    setPwError("");
    setPwStep(2);
  }

  /* MFA */
  const [mfaOn, setMfaOn] = useState(true);
  const [mfaDisableOpen, setMfaDisableOpen] = useState(false);

  /* Reconfigurar app autenticador (QR → código de 6 dígitos) */
  const [reconfigureOpen, setReconfigureOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);

  /* Backup codes — 2 etapas: confirmar e só então gerar/exibir. */
  const [backupOpen, setBackupOpen] = useState(false);
  const [backupStep, setBackupStep] = useState<"confirm" | "view">("confirm");
  const [backupConfirmed, setBackupConfirmed] = useState(false);

  function openBackupConfirm() {
    setBackupStep("confirm");
    setBackupConfirmed(false);
    setBackupOpen(true);
  }
  function closeBackup() {
    setBackupOpen(false);
    // Aguarda o modal fechar antes de resetar o passo, pra não ver troca.
    setTimeout(() => setBackupStep("confirm"), 250);
  }

  /* Medidor de força da nova senha (consultivo) + checagem de vazamento. */
  const pwEval = evaluatePassword(newPw);
  const pwLeaked = newPw.length > 0 && isLeakedPassword(newPw);

  async function handleChangePw() {
    setPwError("");
    if (!pwEval.longEnough) { setPwError(`A nova senha precisa ter ao menos ${PASSWORD_MIN_LENGTH} caracteres.`); return; }
    if (pwLeaked) { setPwError("Essa senha apareceu em vazamentos conhecidos. Escolha outra."); return; }
    if (newPw !== confirmPw) { setPwError("As senhas não coincidem."); return; }
    await submitNewPassword(newPw);
    setPwSaved(true);
    setTimeout(() => {
      setPwOpen(false);
      setPwStep(1);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setPwError(""); setPwSaved(false);
    }, 1200);
  }

  function openReconfigure() {
    setOtp(""); setOtpError(""); setOtpVerifying(false); setSecretCopied(false);
    setReconfigureOpen(true);
  }

  function copySecret() {
    navigator.clipboard?.writeText(TOTP_SECRET_KEY).catch(() => {});
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 1800);
  }

  async function verifyReconfigure() {
    setOtpError("");
    if (otp.length < 6) return;
    setOtpVerifying(true);
    const ok = await verifyTotpCode(otp);
    setOtpVerifying(false);
    if (!ok) {
      setOtpError("Código inválido ou expirado. Espere o app gerar um novo (a cada 30s) e confira se o relógio do celular está certo.");
      return;
    }
    setReconfigureOpen(false);
    // Encadeia direto nos novos códigos de backup, como no fluxo de setup —
    // pula a confirmação porque o usuário já estava conscientemente
    // reconfigurando o MFA.
    setBackupConfirmed(false);
    setBackupStep("view");
    setBackupOpen(true);
  }

  function handleToggleMfa(next: boolean) {
    if (!next && ORG_REQUIRES_MFA) return; // bloqueado pelo guard visual
    if (!next) { setMfaDisableOpen(true); return; }
    setMfaOn(true);
  }

  function confirmDisableMfa() {
    setMfaOn(false);
    setMfaDisableOpen(false);
  }

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Senha e acesso"
        description="Senha e verificação em duas etapas para entrar na conta."
      />

      <SecurityOverview mfaOn={mfaOn} backupRemaining={BACKUP_CODES_REMAINING} />

      {/* ── Bloco 1: Senha ── */}
      <section className="border-t border-(--border-subtle) py-6">
        {ACCOUNT_TYPE === "sso-only" ? (
          <AwAlert variant="info" icon="shield">
            <strong className="font-medium">Sua conta entra por SSO.</strong> A
            senha vive no seu provedor de identidade ({SSO_PROVIDER}) — altere
            por lá.
          </AwAlert>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div>
              <h6 className="m-0 text-(--fg-primary)">
                Senha da conta
              </h6>
              <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                {ACCOUNT_TYPE === "sso+password"
                  ? `Você também entra pelo ${SSO_PROVIDER}. Esta é a senha local — trocá-la não afeta o login pelo provedor.`
                  : "Disponível só para contas com login local. Contas via Google ou Microsoft gerenciam a senha no provedor."}
              </p>
            </div>
            <AwButton
              size="md"
              variant="ghost"
              onClick={openChangePw}
            >
              Alterar senha
            </AwButton>
          </div>
        )}
      </section>

      {/* ── Bloco 2: MFA ── */}
      <section className="border-t border-(--border-subtle) py-6">
        <SectionHeading title="Autenticação em dois fatores" />
        {ORG_REQUIRES_MFA ? (
          // Org exige MFA: o toggle viraria um controle morto (ligado +
          // desabilitado). Troca por um indicador estático read-only — o
          // alerta abaixo é a única mensagem que explica o porquê.
          <div className="flex items-start justify-between gap-4 py-1">
            <div className="min-w-0">
              <p className="m-0 body-sm font-medium text-(--fg-primary)">
                Autenticação multifator (MFA)
              </p>
              <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                Pede um código do seu app autenticador a cada login, além da
                senha.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-(--border-subtle) bg-(--bg-muted) px-2.5 py-1 body-xs font-medium text-(--fg-secondary)">
              <Icon name="lock" size={13} />
              Exigida pela organização
            </span>
          </div>
        ) : (
          <AwToggleRow
            title={
              <span className="flex items-center gap-2">
                Autenticação multifator (MFA)
                <AwPill variant={mfaOn ? "live" : "neutral"} dot={false}>
                  {mfaOn ? "Ativa" : "Inativa"}
                </AwPill>
              </span>
            }
            description="Pede um código do seu app autenticador a cada login, além da senha."
            checked={mfaOn}
            onChange={handleToggleMfa}
          />
        )}

        {mfaOn && (
          <div className="mt-2 flex flex-col divide-y divide-(--border-subtle) border-t border-(--border-subtle)">
            {ORG_REQUIRES_MFA && (
              <div className="py-4">
                <AwAlert variant="warning" icon="lock">
                  <strong className="font-medium">
                    A organização exige duas etapas.
                  </strong>{" "}
                  Você troca o método e gera novos códigos de backup, mas não
                  pode desativar.
                </AwAlert>
              </div>
            )}

            {/* App TOTP */}
            <div className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-start gap-3">
                <AwBrandLogo
                  brand="google-authenticator"
                  size="sm"
                  className="mt-0.5"
                />
                <div>
                  <p className="m-0 body-sm font-medium text-(--fg-primary)">
                    App autenticador (TOTP)
                  </p>
                  <p className="m-0 body-xs text-(--fg-secondary)">
                    Configurado em {TOTP_CONFIG.configuredAt} · {TOTP_CONFIG.app}
                  </p>
                </div>
              </div>
              <AwButton
                size="sm"
                variant="secondary"
                iconLeft="restart_alt"
                onClick={openReconfigure}
              >
                Reconfigurar
              </AwButton>
            </div>

            {/* Backup codes */}
            <div className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)">
                  <Icon name="password" size={16} />
                </span>
                <div>
                  <p className="m-0 body-sm font-medium text-(--fg-primary)">
                    Códigos de backup
                  </p>
                  <p className="m-0 body-xs text-(--fg-secondary)">
                    {BACKUP_CODES_REMAINING} de {BACKUP_CODES_TOTAL} códigos ainda
                    válidos — use se perder acesso ao app.
                  </p>
                </div>
              </div>
              <AwButton
                size="sm"
                variant="secondary"
                onClick={openBackupConfirm}
              >
                Gerar novos
              </AwButton>
            </div>
          </div>
        )}
      </section>

      {/* ── Modal: Alterar senha (2 etapas) ── */}
      <AwModal
        open={pwOpen}
        onClose={closeChangePw}
        title="Alterar senha"
        dismissible={!pwVerifying && !pwSaved}
        footer={
          pwStep === 1 ? (
            <>
              <AwButton size="sm" variant="ghost" onClick={closeChangePw}>
                Cancelar
              </AwButton>
              <AwButton
                size="sm"
                variant="primary"
                onClick={verifyCurrentPw}
                loading={pwVerifying}
                disabled={!currentPw || pwVerifying}
              >
                {pwVerifying ? "Verificando…" : "Continuar"}
              </AwButton>
            </>
          ) : (
            <>
              <AwButton
                size="sm"
                variant="ghost"
                iconLeft="arrow_back"
                onClick={() => { setPwError(""); setPwStep(1); }}
                disabled={pwSaved}
              >
                Voltar
              </AwButton>
              <AwButton
                size="sm"
                variant="primary"
                onClick={handleChangePw}
                disabled={pwSaved}
              >
                {pwSaved ? "Senha alterada" : "Alterar senha"}
              </AwButton>
            </>
          )
        }
      >
        <p className="m-0 mb-4 aw-eyebrow text-(--fg-tertiary)">
          Etapa {pwStep} de 2 ·{" "}
          {pwStep === 1 ? "Confirme sua identidade" : "Crie a nova senha"}
        </p>

        {pwStep === 1 ? (
          <div key="step-1" className="aw-wizard-step flex flex-col gap-4">
            <p className="m-0 body-sm text-(--fg-secondary)">
              Antes de trocar a senha, confirme a senha atual da sua conta.
            </p>
            {pwError && <AwAlert variant="danger">{pwError}</AwAlert>}
            <AwField label="Senha atual" htmlFor="current-pw">
              <AwInput
                id="current-pw"
                type="password"
                revealable
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                autoComplete="current-password"
                onKeyDown={(e) => {
                  if (e.key === "Enter") verifyCurrentPw();
                }}
              />
            </AwField>
          </div>
        ) : (
          <div key="step-2" className="aw-wizard-step flex flex-col gap-4">
            {pwError && <AwAlert variant="danger">{pwError}</AwAlert>}
            <AwField
              label="Nova senha"
              htmlFor="new-pw"
              helper="Frases longas valem mais que símbolos — pense em três palavras aleatórias."
            >
              <AwInput
                id="new-pw"
                type="password"
                revealable
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                autoComplete="new-password"
                invalid={pwLeaked}
              />
              {newPw.length > 0 && (
                <div className="mt-2">
                  <AwProgress
                    label={
                      <span className="text-(--fg-secondary)">
                        Força da senha
                      </span>
                    }
                    value={pwEval.score}
                    max={4}
                    valueLabel={
                      <span className="capitalize">{pwEval.label}</span>
                    }
                    variant={
                      pwEval.score <= 1
                        ? "danger"
                        : pwEval.score === 2
                          ? "warning"
                          : "success"
                    }
                  />
                </div>
              )}
            </AwField>

            {/* Exigências da senha — checklist ao vivo (forte/fraca/blá blá). */}
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              <PwRequirement
                met={pwEval.longEnough}
                label={`Pelo menos ${PASSWORD_MIN_LENGTH} caracteres`}
              />
              <PwRequirement
                met={newPw.length > 0 && !pwLeaked}
                label="Não apareceu em vazamentos conhecidos"
              />
              <PwRequirement
                met={pwEval.score >= 3}
                label="Força forte ou superior"
                optional
              />
              <PwRequirement
                met={confirmPw.length > 0 && confirmPw === newPw}
                label="As senhas coincidem"
              />
            </ul>

            <AwField label="Confirmar nova senha" htmlFor="confirm-pw">
              <AwInput
                id="confirm-pw"
                type="password"
                revealable
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                autoComplete="new-password"
                invalid={!!confirmPw && confirmPw !== newPw}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleChangePw();
                }}
              />
            </AwField>
          </div>
        )}
      </AwModal>

      {/* ── Modal: Desativar MFA ── */}
      <AwModal
        open={mfaDisableOpen}
        onClose={() => setMfaDisableOpen(false)}
        title="Desativar MFA?"
        footer={
          <>
            <AwButton
              size="sm"
              variant="ghost"
              onClick={() => setMfaDisableOpen(false)}
            >
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="danger"
              onClick={confirmDisableMfa}
            >
              Sim, desativar
            </AwButton>
          </>
        }
      >
        <p className="m-0 body-sm text-(--fg-secondary)">
          Sem o segundo fator, sua conta fica só com a senha. Mantenha ativa em
          contas com acesso administrativo.
        </p>
      </AwModal>

      {/* ── Modal: Reconfigurar app autenticador (QR → código) ── */}
      <AwModal
        open={reconfigureOpen}
        onClose={() => setReconfigureOpen(false)}
        title="Reconfigurar app autenticador"
        dismissible={!otpVerifying}
        footer={
          <>
            <AwButton
              size="sm"
              variant="ghost"
              onClick={() => setReconfigureOpen(false)}
              disabled={otpVerifying}
            >
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              onClick={verifyReconfigure}
              loading={otpVerifying}
              disabled={otp.length < 6 || otpVerifying}
            >
              {otpVerifying ? "Verificando…" : "Verificar e ativar"}
            </AwButton>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          {/* Passo 1 — QR + chave manual */}
          <div>
            <p className="m-0 mb-3 body-sm text-(--fg-secondary)">
              <span className="font-medium text-(--fg-primary)">1.</span>{" "}
              Escaneie o QR code no seu app autenticador (Google Authenticator,
              Authy, 1Password).
            </p>
            <div className="flex items-center gap-4">
              <AwQrPlaceholder px={132} ariaLabel="QR code para o app autenticador" />
              <div className="min-w-0 flex-1">
                <p className="m-0 mb-1.5 body-xs text-(--fg-tertiary)">
                  Sem câmera? Use a chave abaixo.
                </p>
                <code className="block break-all rounded-md border border-(--border-subtle) bg-(--bg-muted) px-2.5 py-1.5 font-mono body-xs tracking-wide text-(--fg-primary)">
                  {TOTP_SECRET_KEY}
                </code>
                <AwButton
                  size="sm"
                  variant="ghost"
                  iconLeft={secretCopied ? "check" : "content_copy"}
                  onClick={copySecret}
                  className="mt-1.5 -ml-2"
                >
                  {secretCopied ? "Chave copiada" : "Copiar chave"}
                </AwButton>
              </div>
            </div>
          </div>

          {/* Passo 2 — código de 6 dígitos (uma caixa por dígito, full width) */}
          <div className="border-t border-(--border-subtle) pt-5">
            <p className="m-0 mb-3 body-sm text-(--fg-secondary)">
              <span className="font-medium text-(--fg-primary)">2.</span>{" "}
              Digite o código de 6 dígitos que o app mostra.
            </p>
            <OtpInput6
              value={otp}
              invalid={!!otpError}
              onChange={(next) => {
                setOtp(next);
                if (otpError) setOtpError("");
              }}
            />
            {otpError && (
              <div className="mt-3">
                <AwAlert variant="danger">{otpError}</AwAlert>
              </div>
            )}
          </div>
        </div>
      </AwModal>

      {/* ── Modal: Gerar novos códigos de backup ── */}
      <AwModal
        open={backupOpen}
        onClose={closeBackup}
        title={
          backupStep === "confirm"
            ? "Gerar novos códigos de backup?"
            : "Novos códigos de backup"
        }
        footer={
          backupStep === "confirm" ? (
            <>
              <AwButton size="sm" variant="ghost" onClick={closeBackup}>
                Cancelar
              </AwButton>
              <AwButton
                size="sm"
                variant="danger"
                onClick={() => setBackupStep("view")}
              >
                Gerar novos códigos
              </AwButton>
            </>
          ) : (
            <>
              <AwButton size="sm" variant="ghost" onClick={closeBackup}>
                Fechar
              </AwButton>
              <AwButton
                size="sm"
                variant="primary"
                disabled={!backupConfirmed}
                onClick={closeBackup}
              >
                Concluir
              </AwButton>
            </>
          )
        }
      >
        {backupStep === "confirm" ? (
          <div className="flex flex-col gap-3">
            <p className="m-0 body-sm text-(--fg-secondary)">
              Ao gerar uma nova lista, os{" "}
              <strong className="text-(--fg-primary)">
                {BACKUP_CODES_TOTAL} códigos atuais
              </strong>{" "}
              ({BACKUP_CODES_REMAINING} ainda válidos) deixam de funcionar
              imediatamente. Você só vê os novos uma vez — precisa salvá-los na
              hora.
            </p>
            <AwAlert variant="warning">
              Se perder o acesso ao app autenticador antes de salvar os códigos
              novos, não vai conseguir entrar até que um administrador resete
              sua MFA.
            </AwAlert>
          </div>
        ) : (
          <>
            <p className="m-0 mb-5 body-xs text-(--fg-secondary)">
              Os códigos anteriores não valem mais. Guarde os novos em um lugar
              seguro — cada um vale uma vez.
            </p>
            <AwBackupCodes
              codes={BACKUP_CODES_SAMPLE}
              warning="Guarde estes códigos agora. Não vamos mostrar de novo."
              confirm={{
                checked: backupConfirmed,
                onChange: setBackupConfirmed,
                label: "Salvei os códigos em um lugar seguro.",
              }}
            />
          </>
        )}
      </AwModal>
    </div>
  );
}

function SecurityOverview({
  mfaOn,
  backupRemaining,
}: {
  mfaOn: boolean;
  backupRemaining: number;
}) {
  return (
    <div className="mb-8 grid grid-cols-3 divide-x divide-(--border-subtle) rounded-lg border border-(--border-subtle) bg-(--bg-muted)">
      <SecurityOverviewItem
        icon="password"
        label="Senha"
        value="Login local ativo"
        description="Alteração protegida por confirmação."
      />
      <SecurityOverviewItem
        icon="admin_panel_settings"
        label="MFA"
        value={mfaOn ? "Ativa" : "Inativa"}
        description={
          ORG_REQUIRES_MFA
            ? "Obrigatória pela organização."
            : "Pode ser ajustada por você."
        }
      />
      <SecurityOverviewItem
        icon="vpn_key"
        label="Backup"
        value={`${backupRemaining} códigos válidos`}
        description="Use só se perder o app autenticador."
      />
    </div>
  );
}

function SecurityOverviewItem({
  icon,
  label,
  value,
  description,
}: {
  icon: string;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--bg-raised) text-(--fg-secondary)">
        <Icon name={icon} size={18} />
      </span>
      <div className="min-w-0">
        <p className="m-0 aw-eyebrow text-(--fg-tertiary)">{label}</p>
        <p className="m-0 mt-1 body-sm font-medium text-(--fg-primary)">
          {value}
        </p>
        <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
          {description}
        </p>
      </div>
    </div>
  );
}
