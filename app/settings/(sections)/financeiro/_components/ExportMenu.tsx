"use client";

import * as React from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwFileIcon } from "@/components/ui/AwFileIcon";
import { AwModal } from "@/components/ui/AwModal";
import { Icon } from "@/components/ui/Icon";

export type ExportFormat = "pdf" | "csv";

/**
 * ExportMenu — dropdown PDF/CSV → modal de confirmação → download + aviso de
 * envio por e-mail (com nota opcional de LGPD/escopo). Encapsula o fluxo usado
 * em Faturas, Detalhamento e Auditoria pra não duplicar a mecânica.
 */
export function ExportMenu({
  label = "Exportar",
  filenameBase,
  buildContent,
  note,
  align = "end",
  size = "md",
}: {
  label?: string;
  filenameBase: string;
  /** Conteúdo do arquivo pro formato escolhido (CSV real; PDF é prévia). */
  buildContent: (format: ExportFormat) => string;
  /** Nota extra no modal — escopo do export, LGPD, etc. */
  note?: React.ReactNode;
  align?: "start" | "end";
  size?: "sm" | "md";
}) {
  const [format, setFormat] = React.useState<ExportFormat | null>(null);
  const [confirmed, setConfirmed] = React.useState(false);

  const open = (f: ExportFormat) => {
    setConfirmed(false);
    setFormat(f);
  };
  const close = () => {
    setFormat(null);
    setConfirmed(false);
  };
  const confirm = () => {
    if (!format) return;
    const isCsv = format === "csv";
    const blob = new Blob([buildContent(format)], {
      type: isCsv ? "text/csv" : "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filenameBase}.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setConfirmed(true);
  };

  return (
    <>
      <AwDropdownMenu
        align={align}
        trigger={
          <AwButton size={size} variant="ghost" iconLeft="download">
            {label}
            <Icon name="expand_more" size={16} className="ml-0.5" />
          </AwButton>
        }
        items={[
          {
            id: "pdf",
            label: "Exportar em PDF",
            icon: "picture_as_pdf",
            onSelect: () => open("pdf"),
          },
          {
            id: "csv",
            label: "Exportar em CSV",
            icon: "table_view",
            onSelect: () => open("csv"),
          },
        ]}
      />

      <AwModal
        open={format !== null}
        onClose={close}
        title={confirmed ? "Relatório a caminho" : "Exportar relatório"}
        footer={
          confirmed ? (
            <div className="flex items-center justify-end">
              <AwButton variant="primary" onClick={close}>
                Concluir
              </AwButton>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-2">
              <AwButton variant="ghost" onClick={close}>
                Cancelar
              </AwButton>
              <AwButton variant="primary" iconLeft="download" onClick={confirm}>
                Confirmar
              </AwButton>
            </div>
          )
        }
      >
        {confirmed ? (
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--aw-emerald-100) text-(--aw-emerald-700)">
              <Icon name="mark_email_read" size={18} />
            </span>
            <div className="flex flex-col gap-1">
              <p className="m-0 body-sm font-medium text-(--fg-primary)">
                Seu relatório está sendo preparado.
              </p>
              <p className="m-0 body-xs text-(--fg-secondary)">
                Enviaremos o arquivo em {format?.toUpperCase()} para o seu
                e-mail. O download no formato escolhido também começou
                automaticamente.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {format && <AwFileIcon type={format} size="md" />}
              <div className="flex flex-col gap-0.5">
                <p className="m-0 body-sm font-medium text-(--fg-primary)">
                  Exportar em {format?.toUpperCase()}
                </p>
                <p className="m-0 body-xs text-(--fg-secondary)">
                  Geramos o relatório e enviamos para o seu e-mail.
                </p>
              </div>
            </div>
            {note && (
              <div className="rounded-md border border-(--border-subtle) bg-(--bg-muted) px-3 py-2 body-xs text-(--fg-secondary)">
                {note}
              </div>
            )}
          </div>
        )}
      </AwModal>
    </>
  );
}
