"use client";

import { useState } from "react";
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
import {
  evaluatePassword,
  isLeakedPassword,
  PASSWORD_MIN_LENGTH,
} from "@/lib/password-policy";
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

  /* Etapa 1 → 2: "autentica" a senha atual antes de liberar a troca. */
  function verifyCurrentPw() {
    setPwError("");
    if (!currentPw) { setPwError("Informe a senha atual."); return; }
    setPwVerifying(true);
    // TODO: validar a senha atual via API. Mock: "000000" falha, resto passa.
    setTimeout(() => {
      setPwVerifying(false);
      if (currentPw === "000000") {
        setPwError("Senha atual incorreta. Tente de novo.");
        return;
      }
      setPwError("");
      setPwStep(2);
    }, 700);
  }

  /* MFA */
  const [mfaOn, setMfaOn] = useState(true);
  const [mfaDisableOpen, setMfaDisableOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  /* Reconfigurar app autenticador (QR → código de 6 dígitos) */
  const [reconfigureOpen, setReconfigureOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);

  /* Backup codes */
  const [backupOpen, setBackupOpen] = useState(false);
  const [backupConfirmed, setBackupConfirmed] = useState(false);

  /* Medidor de força da nova senha (consultivo) + checagem de vazamento. */
  const pwEval = evaluatePassword(newPw);
  const pwLeaked = newPw.length > 0 && isLeakedPassword(newPw);

  function handleChangePw() {
    setPwError("");
    if (!pwEval.longEnough) { setPwError(`A nova senha precisa ter ao menos ${PASSWORD_MIN_LENGTH} caracteres.`); return; }
    if (pwLeaked) { setPwError("Essa senha apareceu em vazamentos conhecidos. Escolha outra."); return; }
    if (newPw !== confirmPw) { setPwError("As senhas não coincidem."); return; }
    // TODO: submit via API
    setPwSaved(true);
    setTimeout(() => {
      setPwOpen(false);
      setPwStep(1);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setPwError(""); setPwSaved(false);
    }, 1200);
  }

  function openReconfigure() {
    setManageOpen(false);
    setOtp(""); setOtpError(""); setOtpVerifying(false); setSecretCopied(false);
    setReconfigureOpen(true);
  }

  function copySecret() {
    navigator.clipboard?.writeText(TOTP_SECRET_KEY).catch(() => {});
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 1800);
  }

  function verifyReconfigure() {
    setOtpError("");
    if (otp.length < 6) return;
    setOtpVerifying(true);
    // TODO: validar o código via API. Mock: qualquer código exceto "000000".
    setTimeout(() => {
      setOtpVerifying(false);
      if (otp === "000000") {
        setOtpError("Código inválido ou expirado. Espere o app gerar um novo (a cada 30s) e confira se o relógio do celular está certo.");
        return;
      }
      setReconfigureOpen(false);
      // Encadeia direto nos novos códigos de backup, como no fluxo de setup.
      setBackupConfirmed(false);
      setBackupOpen(true);
    }, 1100);
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
        title="Senha"
        description="Gerencie o acesso à sua conta — senha e verificação em dois fatores."
      />

      {/* ── Bloco 1: Senha ── */}
      <div className="mb-8">
        <SectionHeading title="Senha" />
        {ACCOUNT_TYPE === "sso-only" ? (
          <AwAlert variant="info" icon="shield">
            <strong className="font-medium">Sua conta entra por SSO.</strong> A
            senha é gerenciada pelo seu provedor de identidade ({SSO_PROVIDER}).
            Para alterá-la, acesse as configurações do provedor.
          </AwAlert>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="m-0 body-sm font-medium text-(--fg-primary)">
                Senha da conta
              </p>
              <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                {ACCOUNT_TYPE === "sso+password"
                  ? `Você também entra por ${SSO_PROVIDER}. Esta é a senha local da conta — alterá-la não afeta o login via provedor.`
                  : "Disponível só para contas com login local. Contas via Google ou Microsoft gerenciam a senha no provedor."}
              </p>
            </div>
            <AwButton
              size="sm"
              variant="secondary"
              onClick={openChangePw}
            >
              Alterar senha
            </AwButton>
          </div>
        )}
      </div>

      {/* ── Bloco 2: MFA ── */}
      <div className="mb-8">
        <SectionHeading title="Autenticação em dois fatores" />
        <AwToggleRow
          title={
            <span className="flex items-center gap-2">
              Autenticação multifator (MFA)
              <AwPill variant={mfaOn ? "live" : "neutral"} dot={false}>
                {mfaOn ? "Ativa" : "Inativa"}
              </AwPill>
            </span>
          }
          description="Exige um código do seu app autenticador a cada login, além da senha."
          checked={mfaOn}
          onChange={handleToggleMfa}
          disabled={ORG_REQUIRES_MFA && mfaOn}
        />

        {mfaOn && (
          <div className="mt-2 flex flex-col divide-y divide-(--border-subtle) border-t border-(--border-subtle)">
            {ORG_REQUIRES_MFA && (
              <div className="py-4">
                <AwAlert variant="warning" icon="lock">
                  <strong className="font-medium">
                    Exigida pela organização.
                  </strong>{" "}
                  Você pode trocar o método ou gerar novos códigos de backup, mas
                  não pode desativar a MFA enquanto a organização exigir.
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
                onClick={() => setManageOpen(true)}
              >
                Gerenciar
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
                onClick={() => {
                  setBackupConfirmed(false);
                  setBackupOpen(true);
                }}
              >
                Gerar novos
              </AwButton>
            </div>
          </div>
        )}
      </div>

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
        {/* Stepper */}
        <div className="mb-4 flex items-center gap-2">
          {[1, 2].map((s) => (
            <span
              key={s}
              aria-hidden="true"
              className="h-1 flex-1 rounded-full transition-colors duration-aw-base"
              style={{
                background:
                  s <= pwStep ? "var(--fg-primary)" : "var(--border-default)",
              }}
            />
          ))}
        </div>
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
          Sem MFA, sua conta fica protegida só pela senha. Recomendamos manter
          ativa para contas com acesso administrativo.
        </p>
      </AwModal>

      {/* ── Modal: Gerenciar MFA ── */}
      <AwModal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        title="Gerenciar MFA"
        footer={
          <AwButton
            size="sm"
            variant="ghost"
            onClick={() => setManageOpen(false)}
          >
            Fechar
          </AwButton>
        }
      >
        <div className="flex flex-col gap-5">
          {/* Contexto — fator TOTP atual */}
          <div className="flex items-start gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-raised) px-4 py-3">
            <AwBrandLogo
              brand="google-authenticator"
              size="sm"
              className="mt-0.5"
            />
            <div>
              <p className="m-0 body-sm font-medium text-(--fg-primary)">
                App autenticador configurado
              </p>
              <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                {TOTP_CONFIG.app} · {TOTP_CONFIG.configuredAt}
              </p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-2">
            <AwButton
              variant="secondary"
              block
              iconLeft="restart_alt"
              onClick={openReconfigure}
            >
              Reconfigurar app autenticador
            </AwButton>
            <AwButton
              variant="secondary"
              block
              iconLeft="password"
              onClick={() => {
                setManageOpen(false);
                setBackupConfirmed(false);
                setBackupOpen(true);
              }}
            >
              Gerar novos códigos de backup
            </AwButton>
          </div>

          {/* Desativar — bloqueado pela organização */}
          {ORG_REQUIRES_MFA && (
            <div className="flex flex-col gap-2 border-t border-(--border-subtle) pt-4">
              <AwButton variant="ghost" block iconLeft="lock" disabled>
                Desativar MFA — exigida pela organização
              </AwButton>
              <p className="m-0 px-1 body-xs text-(--fg-tertiary)">
                A sua organização exige MFA de todos os membros. Você pode
                trocar o método, mas não desativá-lo.
              </p>
            </div>
          )}
        </div>
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

          {/* Passo 2 — código de 6 dígitos */}
          <div className="border-t border-(--border-subtle) pt-5">
            <p className="m-0 mb-3 body-sm text-(--fg-secondary)">
              <span className="font-medium text-(--fg-primary)">2.</span>{" "}
              Digite o código de 6 dígitos que o app mostra.
            </p>
            <AwField label="Código de 6 dígitos" htmlFor="totp-code">
              <AwInput
                id="totp-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={otp}
                invalid={!!otpError}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  if (otpError) setOtpError("");
                }}
                className="font-mono tracking-[0.4em]"
              />
            </AwField>
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
        onClose={() => setBackupOpen(false)}
        title="Novos códigos de backup"
        footer={
          <>
            <AwButton
              size="sm"
              variant="ghost"
              onClick={() => setBackupOpen(false)}
            >
              Fechar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              disabled={!backupConfirmed}
              onClick={() => setBackupOpen(false)}
            >
              Concluir
            </AwButton>
          </>
        }
      >
        <p className="m-0 mb-5 body-xs text-(--fg-secondary)">
          Os códigos anteriores foram invalidados. Salve os novos em um lugar
          seguro — cada código só pode ser usado uma vez.
        </p>
        <AwBackupCodes
          codes={BACKUP_CODES_SAMPLE}
          warning="Guarde estes códigos agora. Eles não serão exibidos novamente."
          confirm={{
            checked: backupConfirmed,
            onChange: setBackupConfirmed,
            label: "Salvei os códigos em um lugar seguro.",
          }}
        />
      </AwModal>
    </div>
  );
}
