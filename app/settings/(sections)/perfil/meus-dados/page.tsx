"use client";

import { useState } from "react";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwFileIcon } from "@/components/ui/AwFileIcon";
import {
  AwEmpty,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { useToast } from "@/components/ui/AwToast";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading, SettingsPageHeader } from "../../_components/shared";

const EXPORT_RECIPIENT = "greg@awsales.io";

/** Janela mínima entre dois pedidos de exportação (proteção anti-abuso).
 *  A próxima cópia só pode ser pedida 24h depois da última. */
const EXPORT_COOLDOWN_HOURS = 24;

/** O que NÃO entra na cópia — são dados da organização, não da conta pessoal.
 *  Mostrar isso de antemão corta o ticket "meu export veio incompleto". */
const EXPORT_EXCLUDES: { icon: string; label: string }[] = [
  { icon: "chat", label: "Conversas com clientes e leads" },
  { icon: "receipt_long", label: "Dados de cobrança e faturas da organização" },
];

/** O que entra na cópia dos dados pessoais — mostrado no card de intro pra
 *  a pessoa saber exatamente o que vai receber antes de pedir. */
const EXPORT_INCLUDES: { icon: string; label: string; hint: string }[] = [
  {
    icon: "badge",
    label: "Perfil e contato",
    hint: "Nome, e-mail e a foto que você usa na AwSales.",
  },
  {
    icon: "forum",
    label: "Mensagens que você enviou",
    hint: "O que você escreveu nas conversas com os agentes.",
  },
  {
    icon: "history",
    label: "Registros de atividade da sua conta",
    hint: "Acessos, ações e mudanças feitas por você.",
  },
];

type ExportStatus = "Pronto" | "Processando" | "Expirado";

type ExportFormat = "JSON" | "JSON + CSV";

type ExportRequest = {
  id: string;
  requestedAt: string;
  status: ExportStatus;
  /** Formato do pacote gerado — pra a pessoa saber se abre num editor ou no Excel. */
  format: ExportFormat;
  /** Dias até o link de download expirar — só vale quando "Pronto". */
  expiresInDays?: number;
  /** Código de verificação do arquivo — a pessoa confere que o download
   *  chegou inteiro, sem ter caído nada no caminho. Só existe depois que
   *  o arquivo fica "Pronto". (Tecnicamente, um hash SHA-256.) */
  verifyCode?: string;
};

const INITIAL_REQUESTS: ExportRequest[] = [
  {
    id: "r-1",
    requestedAt: "12 jun 2026 · 09:41",
    status: "Pronto",
    format: "JSON + CSV",
    expiresInDays: 5,
    verifyCode:
      "a3f9b2c1e8d47a6f0b59c2d83e1f4a7b9c0d6e2f8a1b3c5d7e9f0a2b4c6d8e1f",
  },
  {
    id: "r-2",
    requestedAt: "16 jun 2026 · 14:08",
    status: "Processando",
    format: "JSON + CSV",
  },
  {
    id: "r-0",
    requestedAt: "02 jun 2026 · 11:20",
    status: "Expirado",
    format: "JSON",
    verifyCode:
      "7c1d4e9a2b6f08c3d5e7a9b1c4d6e8f0a2b5c7d9e1f3a4b6c8d0e2f5a7b9c1d3",
  },
];

/** Data legível do pedido feito agora — mesmo formato dos mocks acima. */
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

/** Quando a próxima exportação fica liberada, em linguagem do dia a dia
 *  ("amanhã às 14h"), a partir do instante do último pedido + cooldown. */
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
              "border-(--border-subtle) bg-(--bg-muted) text-(--fg-secondary)",
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
  const toast = useToast();
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"confirm" | "stepup" | "done">("confirm");

  // Confirmação de identidade antes de gerar o arquivo (passo de segurança).
  const [identity, setIdentity] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [identityError, setIdentityError] = useState<string | null>(null);

  // Anti-abuso: depois de pedir uma cópia, a próxima só libera 24h depois.
  // Guardamos o instante do último pedido; null = nunca pediu nesta sessão.
  // `inCooldown` é estado (não derivado de Date.now() em render, que é função
  // impura): o cooldown abre no momento do pedido e vale até o app recarregar.
  const [lastRequestedAt, setLastRequestedAt] = useState<number | null>(null);
  const [inCooldown, setInCooldown] = useState(false);

  function openConfirm() {
    setMode("confirm");
    setIdentity("");
    setIdentityError(null);
    setOpen(true);
  }

  /** Sai do "confirm" e pede a confirmação de identidade — não cria nada ainda. */
  function goToStepUp() {
    setIdentity("");
    setIdentityError(null);
    setMode("stepup");
  }

  /** Confirma identidade e só então gera o pedido. Mock: aceita qualquer
   *  senha (6+ caracteres) ou código de 6 dígitos — sem backend. */
  function submitStepUp() {
    const value = identity.trim();
    const looksValid = /^\d{6}$/.test(value) || value.length >= 6;
    if (!looksValid) {
      setIdentityError(
        "Não reconhecemos esses dados. Confira sua senha ou o código de 6 dígitos."
      );
      return;
    }
    setVerifying(true);
    // Simula a verificação assíncrona pra o protótipo ter o estado de loading.
    window.setTimeout(() => {
      const requestedAt = nowLabel();
      setRequests((rs) => [
        {
          id: `r-${Date.now()}`,
          requestedAt,
          status: "Processando",
          format: "JSON + CSV",
        },
        ...rs,
      ]);
      setLastRequestedAt(Date.now());
      setInCooldown(true);
      setVerifying(false);
      setMode("done");
    }, 900);
  }

  const readyCount = requests.filter((r) => r.status === "Pronto").length;

  function copyVerifyCode(code: string) {
    void navigator.clipboard?.writeText(code);
    toast.push({
      title: "Código copiado",
      description: "Use para conferir que o arquivo baixou inteiro.",
      variant: "success",
    });
  }

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Meus dados"
        description="Uma cópia dos seus dados pessoais guardados na AwSales. Peça quando precisar — separado das configurações da organização."
        trailing={
          <AwPill variant="neutral" dot={false} title="A LGPD garante o seu direito de acessar uma cópia dos seus dados.">
            <Icon name="verified_user" size={13} />
            Direito de acesso · LGPD
          </AwPill>
        }
      />

      {/* Hero — o que vem na cópia (esquerda) + painel de ação (direita) */}
      <div className="grid grid-cols-[minmax(0,1fr)_380px] items-start gap-6">
        <AwCard className="p-0!">
          <div className="px-6 py-5">
            <p className="m-0 body-sm font-semibold text-(--fg-primary)">
              O que vem na cópia
            </p>
            <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
              Tudo que é seu, reunido em um único arquivo.
            </p>
          </div>
          <ul className="m-0 list-none divide-y divide-(--border-subtle) border-t border-(--border-subtle) p-0">
            {EXPORT_INCLUDES.map((item) => (
              <li key={item.label} className="m-0 flex items-start gap-3.5 px-6 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted) text-(--fg-secondary)">
                  <Icon name={item.icon} size={18} />
                </span>
                <div className="min-w-0">
                  <p className="m-0 body-sm font-medium text-(--fg-primary)">
                    {item.label}
                  </p>
                  <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                    {item.hint}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* O que fica de fora — dados da organização, não da conta pessoal */}
          <div className="border-t border-(--border-subtle) px-6 py-5">
            <p className="m-0 flex items-center gap-1.5 body-xs font-medium text-(--fg-secondary)">
              <Icon name="info" size={14} />
              O que fica de fora
            </p>
            <p className="m-0 mt-1 body-xs text-(--fg-secondary)">
              Estes dados pertencem à sua organização, não à sua conta pessoal —
              fale com quem administra a organização para acessá-los.
            </p>
            <ul className="m-0 mt-3 list-none space-y-1.5 p-0">
              {EXPORT_EXCLUDES.map((item) => (
                <li
                  key={item.label}
                  className="m-0 flex items-center gap-2 body-xs text-(--fg-tertiary)"
                >
                  <Icon name={item.icon} size={14} />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Nota de privacidade — PII de terceiros sai anonimizada */}
          <div className="flex items-start gap-2 border-t border-(--border-subtle) px-6 py-4">
            <Icon name="visibility_off" size={14} className="mt-px text-(--fg-tertiary)" />
            <p className="m-0 body-xs text-(--fg-tertiary)">
              Para proteger outras pessoas, nomes de colegas que aparecem nos
              seus registros saem anonimizados — viram um código, não o nome.
            </p>
          </div>
        </AwCard>

        {/* Painel de ação — fica claro o que fazer */}
        <div className="rounded-xl border border-(--border-subtle) bg-(--bg-muted) p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-(--border-subtle) bg-(--bg-raised) text-(--fg-primary)">
            <Icon name="cloud_download" size={22} />
          </span>
          <p className="m-0 mt-4 text-base font-semibold text-(--fg-primary)">
            Baixar uma cópia
          </p>
          <p className="m-0 mt-1 body-xs text-(--fg-secondary)">
            Geramos o arquivo e enviamos pro seu e-mail — pronto em alguns
            minutos.
          </p>
          <AwButton
            size="md"
            variant="primary"
            iconLeft={inCooldown ? "schedule" : "download"}
            className="mt-5 w-full"
            onClick={openConfirm}
            disabled={inCooldown}
          >
            {inCooldown ? "Exportação solicitada" : "Solicitar exportação"}
          </AwButton>
          {inCooldown ? (
            <p className="m-0 mt-3 flex items-start justify-center gap-1.5 body-xs text-(--fg-tertiary)">
              <Icon name="schedule" size={13} className="mt-px shrink-0" />
              <span className="text-center">
                Você pode pedir uma nova cópia a cada 24h. A próxima fica
                disponível {nextExportLabel(lastRequestedAt!)}.
              </span>
            </p>
          ) : (
            <p className="m-0 mt-3 flex items-center justify-center gap-1.5 body-xs text-(--fg-tertiary)">
              <Icon name="lock" size={13} />
              Só você recebe o link
            </p>
          )}
        </div>
      </div>

      {/* Solicitações */}
      <div className="mt-12">
        <SectionHeading
          title="Solicitações"
          description="Cada cópia que você pediu aparece aqui — baixe enquanto o link estiver disponível."
          action={
            readyCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-(--aw-emerald-300) bg-(--aw-emerald-100) px-2.5 py-0.5 body-xs font-medium text-(--aw-emerald-800)">
                <Icon name="check_circle" size={13} />
                {readyCount} pronta{readyCount === 1 ? "" : "s"} pra baixar
              </span>
            ) : undefined
          }
        />

        {requests.length === 0 ? (
          <AwCard className="p-0!">
            <div className="px-6 py-10">
              <AwEmpty>
                <AwEmptyHeader>
                  <AwEmptyMedia variant="icon">
                    <Icon name="cloud_download" size={20} />
                  </AwEmptyMedia>
                  <AwEmptyTitle>Nenhuma exportação ainda</AwEmptyTitle>
                  <AwEmptyDescription>
                    Peça uma cópia dos seus dados quando precisar — ela aparece
                    aqui pra baixar.
                  </AwEmptyDescription>
                </AwEmptyHeader>
              </AwEmpty>
            </div>
          </AwCard>
        ) : (
          <AwCard className="p-0!">
            <ul className="m-0 list-none divide-y divide-(--border-subtle) p-0">
              {requests.map((r) => (
                <li key={r.id} className="m-0 px-6 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <AwFileIcon type="zip" size="md" className="shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="m-0 body-sm font-medium text-(--fg-primary)">
                            Exportação de dados
                          </p>
                          <AwPill
                            variant="neutral"
                            dot={false}
                            title={`Formato do arquivo: ${r.format}`}
                          >
                            {r.format}
                          </AwPill>
                        </div>
                        <p className="m-0 mt-0.5 body-xs tabular-nums text-(--fg-secondary)">
                          Pedida em {r.requestedAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-4">
                      <StatusBadge status={r.status} />
                      {r.status === "Pronto" ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <AwButton
                            size="sm"
                            variant="secondary"
                            iconLeft="download"
                          >
                            Baixar
                          </AwButton>
                          {r.expiresInDays !== undefined && (
                            <span className="body-xs text-(--fg-tertiary)">
                              o link expira em {r.expiresInDays}{" "}
                              {r.expiresInDays === 1 ? "dia" : "dias"}
                            </span>
                          )}
                        </div>
                      ) : r.status === "Expirado" ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="body-xs text-(--fg-tertiary)">
                            O link de download expirou
                          </span>
                          <button
                            type="button"
                            onClick={openConfirm}
                            className="inline-flex items-center gap-1 body-xs font-medium text-(--fg-secondary) underline decoration-dotted underline-offset-2 transition-colors duration-aw-fast hover:text-(--accent-brand) hover:no-underline"
                          >
                            <Icon name="refresh" size={13} />
                            Pedir uma nova cópia
                          </button>
                        </div>
                      ) : (
                        <span className="body-xs text-(--fg-tertiary)">
                          avisamos quando ficar pronto
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Código de verificação — confere que o download chegou inteiro */}
                  {r.verifyCode && (
                    <div className="mt-3 flex items-center gap-2 pl-13">
                      <span
                        className="body-xs text-(--fg-tertiary)"
                        title="É um código SHA-256 gerado a partir do arquivo."
                      >
                        Código de verificação
                      </span>
                      <code className="truncate font-mono body-xs text-(--fg-tertiary)">
                        {r.verifyCode.slice(0, 12)}…{r.verifyCode.slice(-4)}
                      </code>
                      <AwButton
                        size="sm"
                        variant="ghost"
                        iconOnly="content_copy"
                        aria-label="Copiar código de verificação"
                        title="Copiar código de verificação"
                        onClick={() => copyVerifyCode(r.verifyCode!)}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </AwCard>
        )}
      </div>

      {/* Remover dados / conta */}
      <div className="mt-12">
        <div className="flex items-start gap-3 rounded-xl border border-(--border-subtle) bg-(--aw-red-100) px-6 py-5">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--bg-raised) text-(--fg-secondary)">
            <Icon name="manage_accounts" size={18} />
          </span>
          <div className="min-w-0">
            <p className="m-0 body-sm font-medium text-(--fg-primary)">
              Quer remover seus dados?
            </p>
            <p className="m-0 mt-1 body-xs text-(--fg-secondary)">
              Seu e-mail, sua função e seu vínculo com a organização são
              gerenciados por ela. Por isso, remover a conta passa por um
              administrador. Fale com quem cuida da sua organização ou escreva
              para{" "}
              <a
                href="mailto:suporte@awsales.io"
                className="font-medium text-(--fg-primary) underline decoration-dotted underline-offset-2 transition-colors duration-aw-fast hover:text-(--accent-brand) hover:no-underline"
              >
                suporte@awsales.io
              </a>{" "}
              que a gente ajuda.
            </p>
          </div>
        </div>
      </div>

      {/* Nota de rodapé — escopo do direito e portabilidade */}
      <p className="mt-6 flex items-start gap-1.5 body-xs text-(--fg-tertiary)">
        <Icon name="gavel" size={13} className="mt-px shrink-0" />
        <span className="max-w-[680px]">
          Esta cópia é para você consultar os seus próprios dados. Enviar os
          dados direto para outro serviço ainda não está disponível — depende de
          regras que a ANPD precisa publicar.
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
                  Guarde em um lugar seguro e compartilhe só com quem você
                  confia.
                </p>
              </div>
            </div>
          </div>
        ) : mode === "stepup" ? (
          <div className="flex flex-col gap-4">
            <p className="m-0 body-sm text-(--fg-secondary)">
              Antes de gerar o arquivo, confirme que é você. Como essa cópia
              reúne seu perfil, seu histórico de acesso e seus registros de
              atividade, confirmamos sua identidade para manter tudo protegido.
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
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--bg-muted) text-(--accent-success)">
              <Icon name="mark_email_read" size={26} />
            </span>
            <h6 className="m-0 text-(--fg-primary)">Estamos preparando o arquivo</h6>
            <p className="m-0 max-w-[360px] body-xs text-(--fg-secondary)">
              Avisamos em{" "}
              <strong className="font-medium text-(--fg-primary)">
                {EXPORT_RECIPIENT}
              </strong>{" "}
              quando estiver pronto. Você pode fechar esta janela — o pedido já
              está na lista de solicitações.
            </p>
          </div>
        )}
      </AwModal>
    </div>
  );
}
