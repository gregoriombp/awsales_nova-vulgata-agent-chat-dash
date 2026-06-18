"use client";

import { useState } from "react";
import Link from "next/link";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { SettingsPageHeader } from "../../_components/shared";

const EXPORT_RECIPIENT = "greg@awsales.io";

/** Janela mínima entre dois pedidos de exportação (proteção anti-abuso). */
const EXPORT_COOLDOWN_HOURS = 24;

type Tone = "blue" | "purple" | "amber" | "emerald";

/** Categorias que entram na cópia — cada uma com a sua cor (é mais que lista). */
const COPY_CATEGORIES: {
  icon: string;
  title: string;
  desc: string;
  tone: Tone;
}[] = [
  {
    icon: "badge",
    title: "Perfil e conta",
    desc: "Cadastro, preferências e histórico de acesso.",
    tone: "blue",
  },
  {
    icon: "forum",
    title: "Interações",
    desc: "Conversas, comentários e feedbacks que você enviou.",
    tone: "purple",
  },
  {
    icon: "monitoring",
    title: "Uso e analytics",
    desc: "Engajamento, tempo de sessão e ações no sistema.",
    tone: "amber",
  },
  {
    icon: "receipt_long",
    title: "Faturamento",
    desc: "Pagamentos, assinaturas e faturas geradas.",
    tone: "emerald",
  },
];

const TONE: Record<Tone, string> = {
  blue: "bg-(--aw-blue-100) text-(--aw-blue-600)",
  purple: "bg-(--aw-purple-100) text-(--aw-purple-600)",
  amber: "bg-(--aw-amber-100) text-(--aw-amber-700)",
  emerald: "bg-(--aw-emerald-100) text-(--aw-emerald-700)",
};

type ExportStatus = "Pronto" | "Processando" | "Expirado";

type ExportRequest = {
  id: string;
  requestedAt: string;
  status: ExportStatus;
  /** Dias até o link de download expirar — só vale quando "Pronto". */
  expiresInDays?: number;
};

const INITIAL_REQUESTS: ExportRequest[] = [
  { id: "r-1", requestedAt: "12 jun 2026 · 09:41", status: "Pronto", expiresInDays: 5 },
  { id: "r-2", requestedAt: "16 jun 2026 · 14:08", status: "Processando" },
  { id: "r-0", requestedAt: "02 jun 2026 · 11:20", status: "Expirado" },
];

function nowLabel(): string {
  return new Date()
    .toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", " ·")
    .replace(".", "");
}

function nextExportLabel(lastAt: number): string {
  const next = new Date(lastAt + EXPORT_COOLDOWN_HOURS * 3_600_000);
  const today = new Date();
  const sameDay = next.toDateString() === today.toDateString();
  const tomorrow = new Date(today.getTime() + 86_400_000);
  const isTomorrow = next.toDateString() === tomorrow.toDateString();
  const time = next
    .toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    .replace(":00", "h")
    .replace(":", "h");
  const day = sameDay
    ? "hoje"
    : isTomorrow
      ? "amanhã"
      : next.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  return `${day} às ${time}`;
}

function StatusBadge({ status }: { status: ExportStatus }) {
  const meta =
    status === "Pronto"
      ? {
          icon: "check_circle",
          className:
            "border-(--aw-emerald-300) bg-(--aw-emerald-100) text-(--aw-emerald-800)",
        }
      : status === "Expirado"
        ? {
            icon: "link_off",
            className:
              "border-(--border-subtle) bg-(--bg-muted) text-(--fg-tertiary)",
          }
        : {
            icon: "schedule",
            className:
              "border-(--aw-amber-300) bg-(--aw-amber-100) text-(--aw-amber-700)",
          };
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 body-xs font-medium " +
        meta.className
      }
    >
      <Icon name={meta.icon} size={13} />
      {status}
    </span>
  );
}

export default function MeusDadosPage() {
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"confirm" | "stepup" | "done">("confirm");

  // Confirmação de identidade antes de gerar o arquivo (passo de segurança).
  const [identity, setIdentity] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [identityError, setIdentityError] = useState<string | null>(null);

  // Anti-abuso: depois de pedir uma cópia, a próxima só libera 24h depois.
  const [lastRequestedAt, setLastRequestedAt] = useState<number | null>(null);
  const [inCooldown, setInCooldown] = useState(false);

  function openConfirm() {
    setMode("confirm");
    setIdentity("");
    setIdentityError(null);
    setOpen(true);
  }

  function goToStepUp() {
    setIdentity("");
    setIdentityError(null);
    setMode("stepup");
  }

  function submitStepUp() {
    const value = identity.trim();
    const looksValid = /^\d{6}$/.test(value) || value.length >= 6;
    if (!looksValid) {
      setIdentityError(
        "Não reconhecemos esses dados. Confira sua senha ou o código de 6 dígitos.",
      );
      return;
    }
    setVerifying(true);
    window.setTimeout(() => {
      setRequests((rs) => [
        { id: `r-${Date.now()}`, requestedAt: nowLabel(), status: "Processando" },
        ...rs,
      ]);
      setLastRequestedAt(Date.now());
      setInCooldown(true);
      setVerifying(false);
      setMode("done");
    }, 900);
  }

  const readyCount = requests.filter((r) => r.status === "Pronto").length;

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Meus dados"
        description="Gerencie suas informações e exporte uma cópia dos seus dados — separada das configurações da organização."
        trailing={
          <AwPill
            variant="neutral"
            dot={false}
            title="A LGPD garante o seu direito de acessar uma cópia dos seus dados."
          >
            <Icon name="verified_user" size={13} />
            Direito de acesso · LGPD
          </AwPill>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)_360px] items-start gap-6">
        {/* Coluna esquerda */}
        <div className="flex flex-col gap-6">
          {/* O que vem na cópia — grid 2×2 colorido */}
          <AwCard className="flex flex-col gap-5 p-6!">
            <div>
              <h6 className="m-0 body-md font-medium text-(--fg-primary)">
                O que vem na cópia
              </h6>
              <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                Tudo que é seu, reunido em um único arquivo.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              {COPY_CATEGORIES.map((cat) => (
                <div key={cat.title} className="flex items-start gap-3">
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      TONE[cat.tone],
                    )}
                  >
                    <Icon name={cat.icon} size={18} fill={1} />
                  </span>
                  <div className="min-w-0">
                    <p className="m-0 body-sm font-medium text-(--fg-primary)">
                      {cat.title}
                    </p>
                    <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                      {cat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="m-0 flex items-start gap-1.5 border-t border-(--border-subtle) pt-4 body-xs text-(--fg-tertiary)">
              <Icon name="visibility_off" size={14} className="mt-px shrink-0" />
              Nomes de colegas que aparecem nos seus registros saem anonimizados —
              viram um código, não o nome.
            </p>
          </AwCard>

          {/* Solicitações recentes — tabela */}
          <AwCard className="flex flex-col gap-4 p-6!">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h6 className="m-0 body-md font-medium text-(--fg-primary)">
                  Solicitações recentes
                </h6>
                <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                  Acompanhe o status das suas exportações.
                </p>
              </div>
              {readyCount > 0 && (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-(--aw-emerald-300) bg-(--aw-emerald-100) px-2.5 py-0.5 body-xs font-medium text-(--aw-emerald-800)">
                  <Icon name="check_circle" size={13} />
                  {readyCount} pronta{readyCount === 1 ? "" : "s"}
                </span>
              )}
            </div>

            <div>
              <div className="grid grid-cols-[1fr_auto_64px] items-center gap-x-6 border-b border-(--border-subtle) pb-2 body-xs font-medium text-(--fg-tertiary)">
                <span>Data</span>
                <span>Status</span>
                <span className="text-right">Ação</span>
              </div>
              {requests.length === 0 ? (
                <p className="m-0 py-8 text-center body-xs text-(--fg-tertiary)">
                  Nenhuma exportação ainda — peça uma cópia quando precisar.
                </p>
              ) : (
                <ul className="m-0 list-none divide-y divide-(--border-subtle) p-0">
                  {requests.map((r) => (
                    <li
                      key={r.id}
                      className="m-0 grid grid-cols-[1fr_auto_64px] items-center gap-x-6 py-3"
                    >
                      <div className="min-w-0">
                        <p className="m-0 body-sm tabular-nums text-(--fg-primary)">
                          {r.requestedAt}
                        </p>
                        {r.status === "Pronto" && r.expiresInDays !== undefined && (
                          <p className="m-0 body-xs text-(--fg-tertiary)">
                            link expira em {r.expiresInDays}{" "}
                            {r.expiresInDays === 1 ? "dia" : "dias"}
                          </p>
                        )}
                      </div>
                      <StatusBadge status={r.status} />
                      <div className="flex justify-end">
                        {r.status === "Pronto" ? (
                          <AwButton
                            size="sm"
                            variant="ghost"
                            iconOnly="download"
                            aria-label="Baixar cópia"
                            title="Baixar cópia"
                          />
                        ) : r.status === "Expirado" ? (
                          <AwButton
                            size="sm"
                            variant="ghost"
                            iconOnly="refresh"
                            aria-label="Pedir uma nova cópia"
                            title="Pedir uma nova cópia"
                            onClick={openConfirm}
                          />
                        ) : (
                          <Icon
                            name="hourglass_top"
                            size={16}
                            className="text-(--fg-tertiary)"
                          />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </AwCard>
        </div>

        {/* Coluna direita */}
        <div className="flex flex-col gap-6">
          {/* Baixar uma cópia */}
          <AwCard className="flex flex-col gap-4 p-6!">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-(--bg-inverse) text-(--fg-on-inverse)">
              <Icon name="cloud_download" size={22} />
            </span>
            <div>
              <p className="m-0 body-md font-semibold text-(--fg-primary)">
                Baixar uma cópia
              </p>
              <p className="m-0 mt-1 body-xs text-(--fg-secondary)">
                Inicie a exportação. Avisamos por e-mail assim que o arquivo
                estiver pronto — pode levar até 24h.
              </p>
            </div>
            <AwButton
              size="md"
              variant="primary"
              iconLeft={inCooldown ? "schedule" : "download"}
              className="w-full"
              onClick={openConfirm}
              disabled={inCooldown}
            >
              {inCooldown ? "Exportação solicitada" : "Solicitar exportação"}
            </AwButton>
            {inCooldown ? (
              <p className="m-0 flex items-start gap-1.5 body-xs text-(--fg-tertiary)">
                <Icon name="schedule" size={13} className="mt-px shrink-0" />
                <span>
                  Nova cópia liberada {nextExportLabel(lastRequestedAt!)} — uma a
                  cada 24h.
                </span>
              </p>
            ) : (
              <p className="m-0 flex items-center gap-1.5 body-xs text-(--fg-tertiary)">
                <Icon name="lock" size={13} />
                Só você recebe o link.
              </p>
            )}
          </AwCard>

          {/* Remover dados */}
          <AwCard className="flex flex-col gap-3 p-6!">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-(--aw-red-100) text-(--aw-red-700)">
              <Icon name="manage_accounts" size={22} />
            </span>
            <div>
              <p className="m-0 body-md font-semibold text-(--fg-primary)">
                Remover dados
              </p>
              <p className="m-0 mt-1 body-xs text-(--fg-secondary)">
                Para excluir permanentemente sua conta e os dados associados, fale
                com um administrador ou escreva para{" "}
                <a
                  href="mailto:suporte@awsales.io"
                  className="font-medium text-(--fg-primary) underline decoration-dotted underline-offset-2 transition-colors duration-aw-fast hover:text-(--accent-brand) hover:no-underline"
                >
                  suporte@awsales.io
                </a>
                .
              </p>
            </div>
            <Link
              href="/settings/seguranca"
              className="inline-flex w-fit items-center gap-1 body-xs font-medium text-(--accent-brand) underline-offset-2 hover:underline"
            >
              Privacidade e segurança
              <Icon name="arrow_forward" size={13} />
            </Link>
          </AwCard>
        </div>
      </div>

      {/* Nota de rodapé — escopo do direito e portabilidade */}
      <p className="mt-8 flex items-start gap-1.5 body-xs text-(--fg-tertiary)">
        <Icon name="gavel" size={13} className="mt-px shrink-0" />
        <span className="max-w-[680px]">
          Esta cópia é para você consultar os seus próprios dados. Enviar os dados
          direto para outro serviço ainda não está disponível — depende de regras
          que a ANPD precisa publicar.
        </span>
      </p>

      {/* Modal — confirmar exportação → confirmar identidade → sucesso */}
      <AwModal
        open={open}
        onClose={() => setOpen(false)}
        title={
          mode === "confirm"
            ? "Solicitar exportação"
            : mode === "stepup"
              ? "Confirme que é você"
              : undefined
        }
        footer={
          mode === "confirm" ? (
            <>
              <AwButton size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </AwButton>
              <AwButton
                size="sm"
                variant="primary"
                iconRight="arrow_forward"
                onClick={goToStepUp}
              >
                Continuar
              </AwButton>
            </>
          ) : mode === "stepup" ? (
            <>
              <AwButton
                size="sm"
                variant="ghost"
                onClick={() => setMode("confirm")}
                disabled={verifying}
              >
                Voltar
              </AwButton>
              <AwButton
                size="sm"
                variant="primary"
                iconLeft="download"
                onClick={submitStepUp}
                disabled={identity.trim().length === 0 || verifying}
                loading={verifying}
              >
                Confirmar e exportar
              </AwButton>
            </>
          ) : (
            <AwButton size="sm" variant="primary" onClick={() => setOpen(false)}>
              Fechar
            </AwButton>
          )
        }
      >
        {mode === "confirm" ? (
          <div className="flex flex-col gap-4">
            <p className="m-0 body-sm text-(--fg-secondary)">
              Geramos um arquivo com a sua cópia e enviamos para{" "}
              <strong className="font-medium text-(--fg-primary)">
                {EXPORT_RECIPIENT}
              </strong>
              . Fica pronto em alguns minutos.
            </p>
            <div className="flex items-start gap-3 rounded-md border border-(--border-subtle) bg-(--bg-muted) px-4 py-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-(--bg-raised) text-(--fg-primary)">
                <Icon name="lock" size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="m-0 body-xs font-medium text-(--fg-primary)">
                  O arquivo contém dados pessoais
                </p>
                <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                  Guarde em um lugar seguro e compartilhe só com quem você confia.
                </p>
              </div>
            </div>
          </div>
        ) : mode === "stepup" ? (
          <div className="flex flex-col gap-4">
            <p className="m-0 body-sm text-(--fg-secondary)">
              Antes de gerar o arquivo, confirme que é você — essa cópia reúne seu
              perfil, seu histórico de acesso e seus registros de atividade.
            </p>
            {identityError && <AwAlert variant="danger">{identityError}</AwAlert>}
            <AwField
              label="Senha ou código de verificação"
              htmlFor="export-identity"
              helper="Use a senha da sua conta ou o código de 6 dígitos do seu app de autenticação."
            >
              <AwInput
                id="export-identity"
                type="password"
                iconLeft="lock"
                inputMode="text"
                autoComplete="current-password"
                placeholder="Senha ou código de 6 dígitos"
                value={identity}
                invalid={!!identityError}
                disabled={verifying}
                onChange={(e) => {
                  setIdentity(e.target.value);
                  if (identityError) setIdentityError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && identity.trim() && !verifying) {
                    submitStepUp();
                  }
                }}
              />
            </AwField>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--aw-emerald-100) text-(--accent-success)">
              <Icon name="mark_email_read" size={26} />
            </span>
            <h6 className="m-0 text-(--fg-primary)">Estamos preparando o arquivo</h6>
            <p className="m-0 max-w-[360px] body-xs text-(--fg-secondary)">
              Avisamos em{" "}
              <strong className="font-medium text-(--fg-primary)">
                {EXPORT_RECIPIENT}
              </strong>{" "}
              quando estiver pronto. Você pode fechar — o pedido já está na lista.
            </p>
          </div>
        )}
      </AwModal>
    </div>
  );
}
