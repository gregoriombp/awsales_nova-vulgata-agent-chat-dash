"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AwAlert } from "@/components/ui/AwAlert";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwTable } from "@/components/ui/AwTable";
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
          className: "bg-(--aw-emerald-100) text-(--aw-emerald-800)",
        }
      : status === "Expirado"
        ? {
            icon: "link_off",
            className: "bg-(--bg-muted) text-(--fg-tertiary)",
          }
        : {
            icon: "schedule",
            className: "bg-(--aw-amber-100) text-(--aw-amber-700)",
          };
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 body-xs font-medium " +
        meta.className
      }
    >
      <Icon name={meta.icon} size={13} />
      {status}
    </span>
  );
}

export default function MeusDadosPage() {
  const router = useRouter();
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
        description="Veja e exporte uma cópia dos seus dados — separada das configurações da organização."
      />

      {/* Ação primária — baixar uma cópia, o herói da página (destaque ↑). */}
      <AwCard className="flex flex-col gap-5 border-(--border-strong) p-7! sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-(--bg-inverse) text-(--fg-on-inverse)">
            <Icon name="cloud_download" size={24} />
          </span>
          <div className="min-w-0">
            <p className="m-0 body-lg font-semibold text-(--fg-primary)">
              Baixar uma cópia
            </p>
            <p className="m-0 mt-1 max-w-[520px] body-xs text-(--fg-secondary)">
              Peça a exportação. Avisamos por e-mail quando o arquivo estiver
              pronto — leva até 24h. Só você recebe o link.
            </p>
            {inCooldown && (
              <p className="m-0 mt-2 flex items-center gap-1.5 body-xs text-(--fg-tertiary)">
                <Icon name="schedule" size={13} className="shrink-0" />
                Próxima cópia disponível {nextExportLabel(lastRequestedAt!)} —
                uma a cada 24h.
              </p>
            )}
          </div>
        </div>
        <AwButton
          size="md"
          variant="primary"
          iconLeft={inCooldown ? "schedule" : "download"}
          className="shrink-0"
          onClick={openConfirm}
          disabled={inCooldown}
        >
          {inCooldown ? "Exportação solicitada" : "Solicitar exportação"}
        </AwButton>
      </AwCard>

      {/* Histórico de pedidos — seção flat: título + descrição como cabeçalho e
       *  a tabela do styleguide logo abaixo (sem card aninhado). A breakdown de
       *  "o que vem na cópia" vive no modal de Solicitar exportação. */}
      <section className="mt-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h6 className="m-0 body-md font-medium text-(--fg-primary)">
              Solicitações recentes
            </h6>
            <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
              Status das exportações solicitadas.
            </p>
          </div>
          {readyCount > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-(--aw-emerald-100) px-2.5 py-0.5 body-xs font-medium text-(--aw-emerald-800)">
              <Icon name="check_circle" size={13} />
              {readyCount} pronta{readyCount === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {requests.length === 0 ? (
          <p className="m-0 mt-4 border-t border-(--border-subtle) py-10 text-center body-xs text-(--fg-tertiary)">
            Nenhuma exportação ainda — peça uma cópia quando precisar.
          </p>
        ) : (
          <AwTable className="mt-3">
            <thead>
              <tr>
                <th>Solicitação</th>
                <th>Status</th>
                <th>Disponibilidade</th>
                {/* Coluna de ação sem título (pedido do Greg — cmt-f106757c). */}
                <th className="w-48" aria-label="Ação" />
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td className="body-sm tabular-nums text-(--fg-primary)">
                    {r.requestedAt}
                  </td>
                  <td>
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="body-sm text-(--fg-secondary)">
                    {r.status === "Pronto"
                      ? `Expira em ${r.expiresInDays ?? 0} ${
                          (r.expiresInDays ?? 0) === 1 ? "dia" : "dias"
                        }`
                      : r.status === "Processando"
                        ? "Avisaremos por e-mail"
                        : "Link indisponível"}
                  </td>
                  <td>
                    {r.status === "Pronto" ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 whitespace-nowrap body-sm font-medium text-(--fg-primary) transition-colors duration-aw-fast hover:text-(--accent-brand)"
                      >
                        <Icon name="outgoing_mail" size={15} />
                        Reenviar link
                      </button>
                    ) : r.status === "Expirado" ? (
                      <button
                        type="button"
                        onClick={openConfirm}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap body-sm font-medium text-(--fg-primary) transition-colors duration-aw-fast hover:text-(--accent-brand)"
                      >
                        <Icon name="refresh" size={15} />
                        Solicitar novamente
                      </button>
                    ) : (
                      <span className="body-sm text-(--fg-tertiary)">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </AwTable>
        )}
      </section>

      {/* Excluir conta e dados — card sem stroke, bg vermelho bem claro (pedido
          do Greg / cmt-d7ee82e7). Ícone em círculo + ação à direita, seguindo o DS. */}
      <div className="mt-8 flex flex-col gap-4 rounded-xl bg-(--aw-red-100) p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--bg-raised) text-(--aw-red-600)">
            <Icon name="delete" size={20} />
          </span>
          <div className="min-w-0">
            <p className="m-0 body-sm font-semibold text-(--fg-primary)">
              Excluir conta e dados
            </p>
            <p className="m-0 mt-0.5 max-w-[560px] body-xs text-(--fg-secondary)">
              A exclusão é permanente e não pode ser desfeita. Para solicitar a
              exclusão da sua conta e dos dados associados, fale com o
              administrador da organização ou escreva para{" "}
              <a
                href="mailto:suporte@awsales.io"
                className="font-medium text-(--fg-primary) underline decoration-dotted underline-offset-2 transition-colors duration-aw-fast hover:no-underline"
              >
                suporte@awsales.io
              </a>
              .
            </p>
          </div>
        </div>
        <AwButton
          size="sm"
          variant="secondary"
          iconRight="arrow_forward"
          className="shrink-0"
          onClick={() => router.push("/settings/seguranca")}
        >
          Entender exclusão de dados e privacidade
        </AwButton>
      </div>

      {/* Nota de rodapé — escopo do direito e portabilidade */}
      <p className="mt-8 flex items-start gap-1.5 body-xs text-(--fg-tertiary)">
        <Icon name="gavel" size={13} className="mt-px shrink-0" />
        <span className="max-w-[680px]">
          Esta cópia é para você consultar. Enviar direto para outro serviço
          ainda não dá — depende de regras que a ANPD precisa publicar.
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
          <div className="flex flex-col gap-5">
            <p className="m-0 body-sm text-(--fg-secondary)">
              Geramos um arquivo com a sua cópia e enviamos para{" "}
              <strong className="font-medium text-(--fg-primary)">
                {EXPORT_RECIPIENT}
              </strong>
              . Fica pronto em alguns minutos.
            </p>
            {/* O que vem na cópia — categoriza o que o usuário vai receber.
             *  Mora aqui (no modal sequencial) e não na página, pra aparecer
             *  no momento em que ele realmente quer agir. */}
            <div>
              <p className="m-0 mb-3 aw-eyebrow normal-case text-(--fg-tertiary)">
                O que vem na cópia
              </p>
              <ul className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-3 p-0">
                {COPY_CATEGORIES.map((cat) => (
                  <li key={cat.title} className="m-0 flex items-start gap-2.5">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                        TONE[cat.tone],
                      )}
                    >
                      <Icon name={cat.icon} size={16} fill={1} />
                    </span>
                    <div className="min-w-0">
                      <p className="m-0 body-xs font-medium text-(--fg-primary)">
                        {cat.title}
                      </p>
                      <p className="m-0 mt-0.5 body-xs leading-snug text-(--fg-tertiary)">
                        {cat.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
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
