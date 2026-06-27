"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { AwButton } from "@/components/ui/AwButton";
import { AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { useToast } from "@/components/ui/AwToast";
import { Icon } from "@/components/ui/Icon";
import { brl, INVOICE_HISTORY } from "../../financeiro/_components/data";
import { useConsumo } from "./ConsumoContext";
import { REPORT_TYPES, reportTypeDef, type ReportType } from "./report-types";

/* ----------------------------------------------------------------------------
 * UI dos relatórios. O estado/CRUD vive no ConsumoContext; aqui ficam os
 * diálogos e um provider leve que centraliza os fluxos.
 *
 * Fluxo (como o Greg pediu): escolher um tipo NÃO pede nome — abre direto um
 * dashboard pré-configurado (preset do board). O relatório só é salvo se o
 * usuário clicar em "Salvar" lá dentro (modal só de nome). "Detalhamento de
 * faturas" ainda pede a fatura antes de abrir.
 * ------------------------------------------------------------------------- */

const EXPLORER_PATH = "/settings/consumo-e-custos/explorar";

type CreateFlow =
  // Seletor de tipo ("Criar novo relatório") → pode ir pro passo de fatura.
  | { mode: "chooser" }
  // Direto na fatura (card "Detalhamento de faturas").
  | { mode: "invoice" };

type ReportsUIValue = {
  /** Card de tipo: abre o dashboard do tipo (faturas pede a fatura antes). */
  beginReport: (type: ReportType) => void;
  /** "Criar novo relatório": abre o seletor de tipo. */
  openTypeChooser: () => void;
  /** Abre um relatório salvo no explorador. */
  openSavedReport: (id: string) => void;
  /** "Salvar" (dentro do explorador): salva o painel atual — só pede o nome. */
  openSave: () => void;
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
  const router = useRouter();
  const { startReport, applyReport } = useConsumo();

  const [createFlow, setCreateFlow] = React.useState<CreateFlow | null>(null);
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [renameTarget, setRenameTarget] = React.useState<{ id: string; current: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);

  // Cada intenção ganha URL própria (`?tipo=`): sobrevive a refresh/nova aba e dá
  // ao review-bridge uma âncora estável por relatório (variáveis × cobranças ×
  // faturas deixam de colidir na mesma rota). Faturas leva também `?fatura=`.
  const goExplorerForType = React.useCallback(
    (type: ReportType, invoiceId?: string | null) => {
      const params = new URLSearchParams({ tipo: type });
      if (type === "faturas" && invoiceId) params.set("fatura", invoiceId);
      router.push(`${EXPLORER_PATH}?${params.toString()}`);
    },
    [router],
  );

  const value = React.useMemo<ReportsUIValue>(
    () => ({
      beginReport: (type) => {
        // Faturas precisa escolher a fatura; os outros abrem direto.
        if (type === "faturas") {
          setCreateFlow({ mode: "invoice" });
        } else {
          startReport(type);
          goExplorerForType(type);
        }
      },
      openTypeChooser: () => setCreateFlow({ mode: "chooser" }),
      openSavedReport: (id) => {
        applyReport(id);
        router.push(`${EXPLORER_PATH}?relatorio=${encodeURIComponent(id)}`);
      },
      openSave: () => setSaveOpen(true),
      openRename: (id, current) => setRenameTarget({ id, current }),
      openDelete: (id, name) => setDeleteTarget({ id, name }),
    }),
    [startReport, applyReport, goExplorerForType, router],
  );

  return (
    <ReportsUIContext.Provider value={value}>
      {children}
      <CreateFlowDialog
        flow={createFlow}
        onClose={() => setCreateFlow(null)}
        onStart={(type, invoiceId) => {
          startReport(type, { invoiceId });
          setCreateFlow(null);
          goExplorerForType(type, invoiceId);
        }}
      />
      <SaveReportDialog open={saveOpen} onClose={() => setSaveOpen(false)} />
      <RenameDialog target={renameTarget} onClose={() => setRenameTarget(null)} />
      <DeleteDialog target={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </ReportsUIContext.Provider>
  );
}

/* ---------- criar: tipo → (fatura) → abre o dashboard (sem nome) ---------- */

type CreateStep = "type" | "invoice";

function CreateFlowDialog({
  flow,
  onClose,
  onStart,
}: {
  flow: CreateFlow | null;
  onClose: () => void;
  onStart: (type: ReportType, invoiceId: string | null) => void;
}) {
  const [type, setType] = React.useState<ReportType>("variaveis");
  const [invoiceId, setInvoiceId] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<CreateStep>("type");

  React.useEffect(() => {
    if (!flow) return;
    setInvoiceId(null);
    if (flow.mode === "invoice") {
      setType("faturas");
      setStep("invoice");
    } else {
      setType("variaveis");
      setStep("type");
    }
  }, [flow]);

  const open = flow !== null;
  const def = reportTypeDef(type);
  const needsInvoice = def.kind === "invoice";
  const selectedInvoice = INVOICE_HISTORY.find((i) => i.id === invoiceId) ?? null;
  // No modo "invoice" (card de faturas) não há passo de tipo pra voltar.
  const canGoBack = step === "invoice" && flow?.mode === "chooser";

  const proceed = () => {
    if (step === "type" && needsInvoice) {
      setStep("invoice");
      return;
    }
    onStart(type, needsInvoice ? invoiceId : null);
  };

  return (
    <AwModal
      open={open}
      onClose={onClose}
      size="md"
      title={step === "invoice" ? "Detalhamento de faturas" : "Criar novo relatório"}
      stepKey={step}
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          {canGoBack ? (
            <AwButton variant="ghost" iconLeft="arrow_back" onClick={() => setStep("type")}>
              Voltar
            </AwButton>
          ) : (
            <AwButton variant="ghost" onClick={onClose}>
              Cancelar
            </AwButton>
          )}
          {step === "type" && needsInvoice ? (
            <AwButton variant="primary" iconRight="arrow_forward" onClick={proceed}>
              Continuar
            </AwButton>
          ) : (
            <AwButton
              variant="primary"
              iconRight="arrow_forward"
              disabled={step === "invoice" && !invoiceId}
              onClick={proceed}
            >
              Abrir relatório
            </AwButton>
          )}
        </div>
      }
    >
      {step === "type" && (
        <div className="flex flex-col gap-3">
          <p className="m-0 body-sm text-(--fg-secondary)">O que você quer analisar?</p>
          <div className="flex flex-col gap-2.5">
            {REPORT_TYPES.map((t) => {
              const active = type === t.type;
              return (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setType(t.type)}
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
          <p className="m-0 body-xs text-(--fg-muted)">
            O painel abre pronto, com os gráficos certos. Salve depois, se quiser guardar.
          </p>
        </div>
      )}

      {step === "invoice" && (
        <div className="flex flex-col gap-3">
          <p className="m-0 body-sm text-(--fg-secondary)">Qual fatura você quer detalhar?</p>
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
          {selectedInvoice && (
            <p className="m-0 body-xs text-(--fg-muted)">
              Abre o detalhamento da fatura {selectedInvoice.refMonth} ({selectedInvoice.id}).
            </p>
          )}
        </div>
      )}
    </AwModal>
  );
}

/* ---------- salvar: só o nome (o tipo e o painel já vêm do estado atual) ---------- */

function SaveReportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { saveNewReport, reportType } = useConsumo();
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = React.useState("");
  const def = reportType ? reportTypeDef(reportType) : null;

  React.useEffect(() => {
    if (open) setName("");
  }, [open]);

  const trimmed = name.trim();
  const submit = () => {
    if (!trimmed) return;
    const id = saveNewReport(trimmed);
    // Deixou de ser uma intenção solta e virou um salvo: a URL migra de `?tipo=`
    // pra `?relatorio=<id>` (sem empilhar histórico) — reflete o que o painel é
    // agora e ancora o review-bridge no relatório, não mais no tipo.
    router.replace(`${EXPLORER_PATH}?relatorio=${encodeURIComponent(id)}`);
    toast.push({
      variant: "success",
      title: "Relatório salvo",
      description: `"${trimmed}" está nos seus relatórios.`,
    });
    onClose();
  };

  return (
    <AwModal
      open={open}
      onClose={onClose}
      size="md"
      title="Salvar relatório"
      titleAdornment={def ? <AwPill variant="neutral">{def.title}</AwPill> : undefined}
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <AwButton variant="ghost" onClick={onClose}>
            Cancelar
          </AwButton>
          <AwButton variant="primary" iconLeft="bookmark_add" disabled={!trimmed} onClick={submit}>
            Salvar
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
          placeholder={`Ex.: ${def?.title ?? "Análise"} · ${new Date().toLocaleDateString("pt-BR", { month: "long" })}`}
          maxLength={60}
        />
        <p className="m-0 body-xs text-(--fg-tertiary)">
          Guarda este painel — a lente, o período, os filtros e os gráficos atuais. Você pode reabrir
          e ajustar quando quiser.
        </p>
      </div>
    </AwModal>
  );
}

function RenameDialog({
  target,
  onClose,
}: {
  target: { id: string; current: string } | null;
  onClose: () => void;
}) {
  const { renameReport } = useConsumo();
  const toast = useToast();
  const [name, setName] = React.useState("");

  React.useEffect(() => {
    if (target) setName(target.current);
  }, [target]);

  const trimmed = name.trim();
  const submit = () => {
    if (!trimmed || !target) return;
    renameReport(target.id, trimmed);
    toast.push({ variant: "success", title: "Relatório renomeado", description: `Agora é "${trimmed}".` });
    onClose();
  };

  return (
    <AwModal
      open={target !== null}
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
        <label htmlFor="aw-report-rename" className="body-sm font-medium text-(--fg-secondary)">
          Nome do relatório
        </label>
        <AwInput
          id="aw-report-rename"
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

function DeleteDialog({
  target,
  onClose,
}: {
  target: { id: string; name: string } | null;
  onClose: () => void;
}) {
  const { deleteReport } = useConsumo();
  const toast = useToast();
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
              if (target) {
                deleteReport(target.id);
                toast.push({ variant: "success", title: "Relatório excluído", description: `"${target.name}" foi removido.` });
              }
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
