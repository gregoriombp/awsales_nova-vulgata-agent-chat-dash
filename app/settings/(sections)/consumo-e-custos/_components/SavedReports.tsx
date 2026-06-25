"use client";

import * as React from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { Icon } from "@/components/ui/Icon";
import { useConsumo } from "./ConsumoContext";

/* ----------------------------------------------------------------------------
 * UI dos "Relatórios salvos". O estado/CRUD vive no ConsumoContext; aqui ficam
 * só os diálogos (nomear / renomear / excluir) e um provider leve que deixa
 * tanto o trilho (criar/renomear/excluir) quanto a toolbar (salvar como novo)
 * abrirem o mesmo modal, sem duplicar markup.
 * ------------------------------------------------------------------------- */

type NameDialogState =
  | { kind: "create" }
  | { kind: "rename"; id: string; current: string };

type ReportsUIValue = {
  /** Abre o modal de nomear pra salvar o estado atual como um novo relatório. */
  openCreate: () => void;
  openRename: (id: string, current: string) => void;
  openDelete: (id: string, name: string) => void;
};

const ReportsUIContext = React.createContext<ReportsUIValue | null>(null);

export function useReportsUI(): ReportsUIValue {
  const ctx = React.useContext(ReportsUIContext);
  if (!ctx) throw new Error("useReportsUI precisa estar dentro de <ReportsUIProvider>");
  return ctx;
}

export function ReportsUIProvider({ children }: { children: React.ReactNode }) {
  const [nameDialog, setNameDialog] = React.useState<NameDialogState | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);

  const value = React.useMemo<ReportsUIValue>(
    () => ({
      openCreate: () => setNameDialog({ kind: "create" }),
      openRename: (id, current) => setNameDialog({ kind: "rename", id, current }),
      openDelete: (id, name) => setDeleteTarget({ id, name }),
    }),
    [],
  );

  return (
    <ReportsUIContext.Provider value={value}>
      {children}
      <ReportNameDialog state={nameDialog} onClose={() => setNameDialog(null)} />
      <ReportDeleteDialog target={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </ReportsUIContext.Provider>
  );
}

function ReportNameDialog({
  state,
  onClose,
}: {
  state: NameDialogState | null;
  onClose: () => void;
}) {
  const { saveNewReport, renameReport } = useConsumo();
  const [name, setName] = React.useState("");

  // Semeia o input ao abrir: vazio pra criar, nome atual pra renomear.
  React.useEffect(() => {
    if (state) setName(state.kind === "rename" ? state.current : "");
  }, [state]);

  const open = state !== null;
  const isRename = state?.kind === "rename";
  const trimmed = name.trim();

  const submit = () => {
    if (!trimmed) return;
    if (state?.kind === "rename") renameReport(state.id, trimmed);
    else saveNewReport(trimmed);
    onClose();
  };

  return (
    <AwModal
      open={open}
      onClose={onClose}
      size="md"
      title={isRename ? "Renomear relatório" : "Salvar relatório"}
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <AwButton variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton variant="primary" disabled={!trimmed} onClick={submit}>
            {isRename ? "Renomear" : "Salvar"}
          </AwButton>
        </div>
      }
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="aw-report-name" className="body-sm font-medium text-(--fg-secondary)">
          Nome do relatório
        </label>
        <AwInput
          id="aw-report-name"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="Ex.: Custos de Meta · últimos 30 dias"
          maxLength={60}
        />
        {!isRename && (
          <p className="m-0 body-xs text-(--fg-tertiary)">
            Guarda a lente, o período, os filtros e o layout atuais. Você pode reabrir quando quiser.
          </p>
        )}
      </div>
    </AwModal>
  );
}

function ReportDeleteDialog({
  target,
  onClose,
}: {
  target: { id: string; name: string } | null;
  onClose: () => void;
}) {
  const { deleteReport } = useConsumo();
  return (
    <AwModal
      open={target !== null}
      onClose={onClose}
      size="md"
      title="Excluir relatório"
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <AwButton variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton
            variant="danger"
            iconLeft="delete"
            onClick={() => {
              if (target) deleteReport(target.id);
              onClose();
            }}
          >
            Excluir
          </AwButton>
        </div>
      }
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted) text-(--accent-danger)">
          <Icon name="delete" size={18} />
        </span>
        <p className="m-0 body-sm text-(--fg-secondary)">
          Excluir <strong className="text-(--fg-primary)">{target?.name}</strong>? Essa ação não pode
          ser desfeita — o layout e os filtros salvos nesse relatório serão perdidos.
        </p>
      </div>
    </AwModal>
  );
}
