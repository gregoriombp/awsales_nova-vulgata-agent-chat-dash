"use client";

import { useState } from "react";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwBackupCodes } from "@/components/ui/AwBackupCodes";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwToggleRow } from "@/components/ui/AwToggle";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading, SettingsPageHeader } from "../../_components/shared";

/* Fixtures — substituir por dados reais */
const TOTP_CONFIG = {
  app: "Google Authenticator",
  configuredAt: "14 mar. 2026",
};

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

export default function SenhaPage() {
  /* Senha */
  const [pwOpen, setPwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);

  /* MFA */
  const [mfaOn, setMfaOn] = useState(true);
  const [mfaDisableOpen, setMfaDisableOpen] = useState(false);

  /* Backup codes */
  const [backupOpen, setBackupOpen] = useState(false);
  const [backupConfirmed, setBackupConfirmed] = useState(false);

  function handleChangePw() {
    setPwError("");
    if (!currentPw) { setPwError("Informe a senha atual."); return; }
    if (newPw.length < 8) { setPwError("A nova senha precisa ter ao menos 8 caracteres."); return; }
    if (newPw !== confirmPw) { setPwError("As senhas não coincidem."); return; }
    // TODO: submit via API
    setPwSaved(true);
    setTimeout(() => {
      setPwOpen(false);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setPwError(""); setPwSaved(false);
    }, 1200);
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
    <div className="mx-auto w-full max-w-[780px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Senha"
        description="Gerencie o acesso à sua conta — senha e verificação em dois fatores."
      />

      {/* ── Bloco 1: Senha ── */}
      <div className="mb-6">
        <SectionHeading title="Senha" />
        <AwCard className="p-0!">
          <div className="flex items-start justify-between gap-4 px-6 py-5">
            <div>
              <p className="m-0 body-sm font-medium text-(--fg-primary)">
                Senha da conta
              </p>
              <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                Disponível só para contas com login local. Contas via Google ou
                Microsoft gerenciam a senha no provedor.
              </p>
            </div>
            <AwButton
              size="sm"
              variant="secondary"
              onClick={() => setPwOpen(true)}
            >
              Alterar senha
            </AwButton>
          </div>
        </AwCard>
      </div>

      {/* ── Bloco 2: MFA ── */}
      <div className="mb-6">
        <SectionHeading title="Autenticação em dois fatores" />
        <AwCard className="p-0!">
          <div className="px-6 pt-4 pb-1">
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
          </div>

          {mfaOn && (
            <div className="flex flex-col gap-0 divide-y divide-(--border-subtle)">
              {ORG_REQUIRES_MFA && (
                <div className="px-6 py-4">
                  <AwAlert variant="warning" icon="lock">
                    <strong className="font-medium">
                      Exigida pela organização.
                    </strong>{" "}
                    Você pode trocar o método ou gerar novos códigos de backup,
                    mas não pode desativar a MFA enquanto a organização exigir.
                  </AwAlert>
                </div>
              )}

              {/* App TOTP */}
              <div className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)">
                    <Icon name="smartphone" size={16} />
                  </span>
                  <div>
                    <p className="m-0 body-sm font-medium text-(--fg-primary)">
                      App autenticador (TOTP)
                    </p>
                    <p className="m-0 body-xs text-(--fg-secondary)">
                      Configurado em {TOTP_CONFIG.configuredAt} ·{" "}
                      {TOTP_CONFIG.app}
                    </p>
                  </div>
                </div>
                <AwButton size="sm" variant="secondary">
                  Gerenciar
                </AwButton>
              </div>

              {/* Backup codes */}
              <div className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)">
                    <Icon name="password" size={16} />
                  </span>
                  <div>
                    <p className="m-0 body-sm font-medium text-(--fg-primary)">
                      Códigos de backup
                    </p>
                    <p className="m-0 body-xs text-(--fg-secondary)">
                      {BACKUP_CODES_REMAINING} de {BACKUP_CODES_TOTAL} códigos
                      ainda válidos — use se perder acesso ao app.
                    </p>
                  </div>
                </div>
                <AwButton
                  size="sm"
                  variant="secondary"
                  onClick={() => { setBackupConfirmed(false); setBackupOpen(true); }}
                >
                  Gerar novos
                </AwButton>
              </div>
            </div>
          )}
        </AwCard>
      </div>

      {/* ── Modal: Alterar senha ── */}
      <AwModal
        open={pwOpen}
        onClose={() => { setPwOpen(false); setCurrentPw(""); setNewPw(""); setConfirmPw(""); setPwError(""); }}
        title="Alterar senha"
        footer={
          <>
            <AwButton
              size="sm"
              variant="ghost"
              onClick={() => setPwOpen(false)}
            >
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              onClick={handleChangePw}
              disabled={pwSaved}
            >
              {pwSaved ? "Salvo" : "Alterar senha"}
            </AwButton>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {pwError && (
            <AwAlert variant="danger">{pwError}</AwAlert>
          )}
          <AwField label="Senha atual" htmlFor="current-pw">
            <AwInput
              id="current-pw"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              autoComplete="current-password"
            />
          </AwField>
          <AwField
            label="Nova senha"
            htmlFor="new-pw"
            helper="Mínimo 8 caracteres."
          >
            <AwInput
              id="new-pw"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              autoComplete="new-password"
            />
          </AwField>
          <AwField label="Confirmar nova senha" htmlFor="confirm-pw">
            <AwInput
              id="confirm-pw"
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              autoComplete="new-password"
              invalid={!!confirmPw && confirmPw !== newPw}
            />
          </AwField>
        </div>
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
