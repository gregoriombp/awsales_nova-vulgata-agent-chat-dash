"use client";

import { useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import {
  AwEmpty,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty";
import { AwModal } from "@/components/ui/AwModal";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading, SettingsPageHeader } from "../../_components/shared";

const EXPORT_RECIPIENT = "greg@awsales.io";

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

type ExportStatus = "Pronto" | "Processando";

type ExportRequest = {
  id: string;
  requestedAt: string;
  status: ExportStatus;
  /** Dias até o link de download expirar — só vale quando "Pronto". */
  expiresInDays?: number;
};

const INITIAL_REQUESTS: ExportRequest[] = [
  {
    id: "r-1",
    requestedAt: "12 jun 2026 · 09:41",
    status: "Pronto",
    expiresInDays: 5,
  },
  {
    id: "r-2",
    requestedAt: "16 jun 2026 · 14:08",
    status: "Processando",
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

function StatusBadge({ status }: { status: ExportStatus }) {
  const meta =
    status === "Pronto"
      ? {
          icon: "check_circle",
          className:
            "border-(--aw-emerald-300) bg-(--aw-emerald-100) text-(--aw-emerald-800)",
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
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"confirm" | "done">("confirm");

  function openConfirm() {
    setMode("confirm");
    setOpen(true);
  }

  function confirmExport() {
    setRequests((rs) => [
      { id: `r-${Date.now()}`, requestedAt: nowLabel(), status: "Processando" },
      ...rs,
    ]);
    setMode("done");
  }

  const readyCount = requests.filter((r) => r.status === "Pronto").length;

  return (
    <div className="mx-auto w-full max-w-[1120px] px-10 pt-14 pb-32">
      <SettingsPageHeader
        title="Meus dados"
        description="Uma cópia dos seus dados pessoais guardados na AwSales. Peça quando precisar — separado das configurações da organização."
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
            iconLeft="download"
            className="mt-5 w-full"
            onClick={openConfirm}
          >
            Solicitar exportação
          </AwButton>
          <p className="m-0 mt-3 flex items-center justify-center gap-1.5 body-xs text-(--fg-tertiary)">
            <Icon name="lock" size={13} />
            Só você recebe o link
          </p>
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
                <li
                  key={r.id}
                  className="m-0 flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-(--border-subtle) bg-(--bg-raised) text-(--fg-secondary)">
                      <Icon name="folder_zip" size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="m-0 body-sm font-medium text-(--fg-primary)">
                        Exportação de dados
                      </p>
                      <p className="m-0 mt-0.5 body-xs tabular-nums text-(--fg-secondary)">
                        Pedida em {r.requestedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    <StatusBadge status={r.status} />
                    {r.status === "Pronto" ? (
                      <div className="flex flex-col items-end gap-0.5">
                        <AwButton size="sm" variant="secondary" iconLeft="download">
                          Baixar
                        </AwButton>
                        {r.expiresInDays !== undefined && (
                          <span className="body-xs text-(--fg-tertiary)">
                            o link expira em {r.expiresInDays}{" "}
                            {r.expiresInDays === 1 ? "dia" : "dias"}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="body-xs text-(--fg-tertiary)">
                        avisamos quando ficar pronto
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </AwCard>
        )}
      </div>

      {/* Remover dados / conta */}
      <div className="mt-12">
        <div className="flex items-start gap-3 rounded-xl border border-(--border-subtle) bg-(--bg-muted) px-6 py-5">
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

      {/* Modal — confirmar exportação → estado de sucesso */}
      <AwModal
        open={open}
        onClose={() => setOpen(false)}
        title={mode === "confirm" ? "Solicitar exportação" : undefined}
        footer={
          mode === "confirm" ? (
            <>
              <AwButton size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Cancelar
              </AwButton>
              <AwButton
                size="sm"
                variant="primary"
                iconLeft="download"
                onClick={confirmExport}
              >
                Solicitar exportação
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
