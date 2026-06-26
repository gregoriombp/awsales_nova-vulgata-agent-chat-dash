"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AwButton } from "@/components/ui/AwButton";
import { AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import { brl, INVOICE_HISTORY } from "../../financeiro/_components/data";
import { useConsumo, type ReportKind } from "./ConsumoContext";

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

/** Passos do modal sequencial de criação: tipo → (fatura) → nome. */
type CreateStep = "type" | "invoice" | "name";

const REPORT_TYPES: {
  kind: ReportKind;
  icon: string;
  title: string;
  desc: string;
}[] = [
  {
    kind: "exploration",
    icon: "dashboard",
    title: "Exploração de custos",
    desc: "Os gráficos completos do explorador, com a lente, o período e os filtros que você montar.",
  },
  {
    kind: "invoice",
    icon: "receipt_long",
    title: "Visualização de fatura",
    desc: "Os mesmos gráficos, mas recortados em uma única fatura — pra revisar o que entrou naquele ciclo.",
  },
];

function ReportNameDialog({
  state,
  onClose,
}: {
  state: NameDialogState | null;
  onClose: () => void;
}) {
  const { saveNewReport, renameReport } = useConsumo();
  const [name, setName] = React.useState("");
  // Fluxo sequencial (só na criação): tipo → fatura (se for fatura) → nome.
  const [step, setStep] = React.useState<CreateStep>("type");
  const [kind, setKind] = React.useState<ReportKind>("exploration");
  const [invoiceId, setInvoiceId] = React.useState<string | null>(null);

  // Semeia ao abrir: vazio + passo 1 pra criar; nome atual pra renomear.
  React.useEffect(() => {
    if (!state) return;
    if (state.kind === "rename") {
      setName(state.current);
    } else {
      setName("");
      setStep("type");
      setKind("exploration");
      setInvoiceId(null);
    }
  }, [state]);

  const open = state !== null;
  const isRename = state?.kind === "rename";
  const trimmed = name.trim();
  const selectedInvoice = INVOICE_HISTORY.find((i) => i.id === invoiceId) ?? null;

  const submit = () => {
    if (state?.kind === "rename") {
      if (!trimmed) return;
      renameReport(state.id, trimmed);
      onClose();
      return;
    }
    if (!trimmed) return;
    saveNewReport(trimmed, { kind, invoiceId: kind === "invoice" ? invoiceId : null });
    onClose();
  };

  // ----- Renomear: modal simples de um passo (inalterado) -----
  if (isRename) {
    return (
      <AwModal
        open={open}
        onClose={onClose}
        size="md"
        title="Renomear relatório"
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <AwButton variant="ghost" onClick={onClose}>
              Cancelar
            </AwButton>
            <AwButton variant="primary" disabled={!trimmed} onClick={submit}>
              Renomear
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
        </div>
      </AwModal>
    );
  }

  // ----- Criar: fluxo sequencial -----
  const stepIndex = step === "type" ? 1 : step === "invoice" ? 2 : kind === "invoice" ? 3 : 2;
  const stepTotal = kind === "invoice" ? 3 : 2;
  const goNext = () => {
    if (step === "type") setStep(kind === "invoice" ? "invoice" : "name");
    else if (step === "invoice") setStep("name");
  };
  const goBack = () => {
    if (step === "name") setStep(kind === "invoice" ? "invoice" : "type");
    else if (step === "invoice") setStep("type");
  };

  const footer = (
    <div className="flex w-full items-center justify-between gap-2">
      <span className="body-xs text-(--fg-tertiary)">
        Passo {stepIndex} de {stepTotal}
      </span>
      <div className="flex items-center gap-2">
        {step === "type" ? (
          <AwButton variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
        ) : (
          <AwButton variant="ghost" iconLeft="arrow_back" onClick={goBack}>
            Voltar
          </AwButton>
        )}
        {step === "name" ? (
          <AwButton variant="primary" disabled={!trimmed} onClick={submit}>
            Salvar
          </AwButton>
        ) : (
          <AwButton
            variant="primary"
            iconRight="arrow_forward"
            disabled={step === "invoice" && !invoiceId}
            onClick={goNext}
          >
            Continuar
          </AwButton>
        )}
      </div>
    </div>
  );

  return (
    <AwModal
      open={open}
      onClose={onClose}
      size="md"
      title="Criar novo relatório"
      footer={footer}
    >
      {step === "type" && (
        <div className="flex flex-col gap-3">
          <p className="m-0 body-sm text-(--fg-secondary)">
            O que você quer montar?
          </p>
          <div className="flex flex-col gap-2.5">
            {REPORT_TYPES.map((t) => {
              const active = kind === t.kind;
              return (
                <button
                  key={t.kind}
                  type="button"
                  onClick={() => setKind(t.kind)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors duration-aw-fast",
                    active
                      ? "border-(--accent-brand) bg-(--bg-selected)"
                      : "border-(--border-subtle) hover:border-(--border-default) hover:bg-(--bg-hover)",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      active ? "bg-(--bg-raised) text-(--accent-brand)" : "bg-(--bg-muted) text-(--fg-secondary)",
                    )}
                  >
                    <Icon name={t.icon} size={18} fill={active ? 1 : 0} />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="inline-flex items-center gap-2 body-sm font-medium text-(--fg-primary)">
                      {t.title}
                      <Icon
                        name={active ? "radio_button_checked" : "radio_button_unchecked"}
                        size={16}
                        className={active ? "text-(--accent-brand)" : "text-(--fg-muted)"}
                      />
                    </span>
                    <span className="body-xs text-(--fg-tertiary)">{t.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === "invoice" && (
        <div className="flex flex-col gap-3">
          <p className="m-0 body-sm text-(--fg-secondary)">
            Qual fatura você quer visualizar?
          </p>
          <ul className="m-0 flex max-h-72 list-none flex-col gap-2 overflow-y-auto p-0">
            {INVOICE_HISTORY.map((inv) => {
              const active = invoiceId === inv.id;
              return (
                <li key={inv.id}>
                  <button
                    type="button"
                    onClick={() => setInvoiceId(inv.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors duration-aw-fast",
                      active
                        ? "border-(--accent-brand) bg-(--bg-selected)"
                        : "border-(--border-subtle) hover:border-(--border-default) hover:bg-(--bg-hover)",
                    )}
                  >
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="inline-flex items-center gap-2 body-sm font-medium text-(--fg-primary)">
                        {inv.refMonth} · {inv.description}
                        <AwPill variant={inv.status === "Paga" ? "neutral" : "warning"}>
                          {inv.status}
                        </AwPill>
                      </span>
                      <span className="body-xs text-(--fg-tertiary)">
                        {inv.id} · vence {inv.dueAt}
                      </span>
                    </span>
                    <span className="shrink-0 body-sm font-medium tabular-nums text-(--fg-primary)">
                      {brl(inv.net)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {step === "name" && (
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
            placeholder={
              kind === "invoice" && selectedInvoice
                ? `Ex.: Fatura ${selectedInvoice.refMonth}`
                : "Ex.: Custos de Meta · últimos 30 dias"
            }
            maxLength={60}
          />
          <p className="m-0 body-xs text-(--fg-tertiary)">
            {kind === "invoice" && selectedInvoice
              ? `Recorte da fatura ${selectedInvoice.refMonth} (${selectedInvoice.id}). Guarda os gráficos, filtros e layout atuais.`
              : "Guarda a lente, o período, os filtros e o layout atuais. Você pode reabrir quando quiser."}
          </p>
        </div>
      )}
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
