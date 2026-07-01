"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AwModal } from "@/components/ui/AwModal";
import { Icon } from "@/components/ui/Icon";
import type { WidgetInstanceConfig } from "./report-types";

/* ----------------------------------------------------------------------------
 * Card "Adicionar gráfico" — sempre o último item do board.
 *
 * É uma casca/placeholder (borda tracejada, ícone "add" centralizado) com o mesmo
 * footprint de um widget. Clicar abre um modal (AwModal) com a lista dos gráficos
 * DISPONÍVEIS pra adicionar — que são os widgets escondidos desta visualização.
 * Escolher um chama `onAdd(id)` (no provider, `toggleWidgetHidden`), que o re-exibe.
 *
 * É código de feature (consome Aw*, mas não é um componente do DS), então mora
 * aqui em _components junto dos outros widgets do explorador.
 * ------------------------------------------------------------------------- */

/** Gráfico que pode ser adicionado de volta ao board (um widget escondido). */
export type AddableWidget = {
  id: string;
  /** Nome amigável (bate com o título do card). */
  label: string;
  /** Ícone Material Symbols (bate com o ícone do card). */
  icon: string;
  /** Aceita recorte por tipo de uso/cobrança ao adicionar (Notion). */
  configurable?: boolean;
};

const USO_OPTIONS: { value: NonNullable<WidgetInstanceConfig["uso"]>; label: string }[] = [
  { value: "all", label: "Tudo" },
  { value: "disparos", label: "Disparos" },
  { value: "mensagens", label: "Mensagens" },
  { value: "leads", label: "Leads" },
  { value: "tokens", label: "Tokens" },
];

const COBRANCA_OPTIONS: { value: NonNullable<WidgetInstanceConfig["cobranca"]>; label: string }[] = [
  { value: "all", label: "Tudo" },
  { value: "aswork", label: "Só Aswork" },
  { value: "meta", label: "Só Meta" },
];

export function AddWidgetCard({
  available,
  onAdd,
}: {
  available: AddableWidget[];
  onAdd: (id: string, config?: WidgetInstanceConfig) => void;
}) {
  const [open, setOpen] = React.useState(false);
  // Passo 2: gráfico configurável escolhido — mostra o recorte antes de adicionar.
  const [configuring, setConfiguring] = React.useState<AddableWidget | null>(null);
  const [uso, setUso] = React.useState<NonNullable<WidgetInstanceConfig["uso"]>>("all");
  const [cobranca, setCobranca] = React.useState<NonNullable<WidgetInstanceConfig["cobranca"]>>("all");
  const hasAvailable = available.length > 0;

  const close = () => {
    setOpen(false);
    setConfiguring(null);
    setUso("all");
    setCobranca("all");
  };

  const add = (w: AddableWidget) => {
    if (w.configurable) {
      setConfiguring(w);
      return;
    }
    onAdd(w.id);
    close();
  };

  const confirmConfigured = () => {
    if (!configuring) return;
    onAdd(configuring.id, uso === "all" && cobranca === "all" ? undefined : { uso, cobranca });
    close();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Adicionar gráfico ao painel"
        className={cn(
          "group/add flex h-full min-h-48 w-full flex-col items-center justify-center gap-3 rounded-2xl",
          "border-2 border-dashed border-(--border-default) bg-transparent px-5 py-8 text-center",
          "transition-colors duration-aw-fast",
          "hover:border-(--accent-brand) hover:bg-(--bg-hover)",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring-focus)",
        )}
      >
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-(--border-subtle) bg-(--bg-raised) text-(--fg-tertiary) transition-colors duration-aw-fast group-hover/add:border-(--fg-primary) group-hover/add:bg-(--fg-primary) group-hover/add:text-(--bg-raised)">
          <Icon name="add" size={24} />
        </span>
        <span className="flex flex-col items-center gap-1">
          <span className="body-sm font-medium text-(--fg-secondary) transition-colors duration-aw-fast group-hover/add:text-(--fg-primary)">
            Adicionar gráfico
          </span>
          <span className="body-xs text-(--fg-tertiary)">
            {hasAvailable
              ? available.length === 1
                ? "1 gráfico disponível"
                : `${available.length} gráficos disponíveis`
              : "Todos já estão no painel"}
          </span>
        </span>
      </button>

      <AwModal
        open={open}
        onClose={close}
        title={configuring ? `Adicionar ${configuring.label}` : "Adicionar gráfico"}
      >
        {configuring ? (
          <div className="flex flex-col gap-4">
            <p className="m-0 body-sm text-(--fg-secondary)">
              Escolha o recorte deste gráfico — dá pra olhar só um tipo de uso,
              só um tipo de cobrança, ou tudo.
            </p>
            <ConfigChips
              label="Tipo de uso"
              options={USO_OPTIONS}
              value={uso}
              onChange={setUso}
            />
            <ConfigChips
              label="Tipo de cobrança"
              options={COBRANCA_OPTIONS}
              value={cobranca}
              onChange={setCobranca}
            />
            <p className="m-0 body-xs text-(--fg-tertiary)">
              O recorte vale na lente Serviço e fica salvo com o relatório.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfiguring(null)}
                className="inline-flex h-9 items-center rounded-lg px-3 body-sm font-medium text-(--fg-secondary) transition-colors duration-aw-fast hover:bg-(--bg-hover) hover:text-(--fg-primary)"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={confirmConfigured}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-(--fg-primary) px-3.5 body-sm font-medium text-(--fg-on-inverse) transition-opacity duration-aw-fast hover:opacity-90"
              >
                <Icon name="add" size={16} />
                Adicionar ao painel
              </button>
            </div>
          </div>
        ) : hasAvailable ? (
          <div className="flex flex-col gap-3">
            <p className="m-0 body-sm text-(--fg-secondary)">
              Escolha um gráfico para adicionar ao painel.
            </p>
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
              {available.map((w) => (
                <li key={w.id}>
                  <button
                    type="button"
                    onClick={() => add(w)}
                    className="group/opt flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors duration-aw-fast hover:bg-(--bg-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring-focus)"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--bg-muted) text-(--fg-secondary) transition-colors duration-aw-fast group-hover/opt:text-(--fg-primary)">
                      <Icon name={w.icon} size={18} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate body-sm font-medium text-(--fg-primary)">
                        {w.label}
                      </span>
                      {w.configurable && (
                        <span className="truncate body-xs text-(--fg-tertiary)">
                          Configurável por tipo de uso e de cobrança
                        </span>
                      )}
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 body-xs font-medium text-(--fg-tertiary) transition-colors duration-aw-fast group-hover/opt:text-(--accent-brand)">
                      <Icon name={w.configurable ? "tune" : "add"} size={18} />
                      {w.configurable ? "Configurar" : "Adicionar"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-(--bg-muted) text-(--fg-tertiary)">
              <Icon name="done_all" size={24} />
            </span>
            <div className="flex flex-col gap-1">
              <p className="m-0 body-sm font-medium text-(--fg-primary)">
                Todos os gráficos já estão no painel
              </p>
              <p className="m-0 body-xs text-(--fg-tertiary)">
                Remova um gráfico pelo menu de opções do card para trazê-lo de volta aqui.
              </p>
            </div>
          </div>
        )}
      </AwModal>
    </>
  );
}

/** Linha de chips de escolha única do recorte (uso/cobrança). */
function ConfigChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
      <legend className="mb-1 aw-eyebrow text-(--fg-tertiary)">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt.value)}
              className={cn(
                "inline-flex h-8 items-center rounded-full border px-3 body-xs font-medium transition-colors duration-aw-fast",
                active
                  ? "border-(--border-strong) bg-(--bg-muted) text-(--fg-primary)"
                  : "border-(--border-subtle) text-(--fg-secondary) hover:bg-(--bg-hover) hover:text-(--fg-primary)",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
