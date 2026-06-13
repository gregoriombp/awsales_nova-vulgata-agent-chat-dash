"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AwButton } from "@/components/ui/AwButton";
import { AwModal } from "@/components/ui/AwModal";
import { Icon } from "@/components/ui/Icon";
import {
  ChoiceCard,
  SourcePicker,
  EMPTY_SOURCES,
  sourcesTotal,
  type SourceData,
} from "./shared";

/**
 * Passo "Playbook" (Etapa 6 — última do wizard). 10 frames → tela-base + 2 modais.
 * Quase idêntico ao Produtos, mas sem campo Nome, com as fontes agrupadas como
 * "Arquivos anexados (N)" e o CTA final "Criar base" (que conclui o wizard).
 */

type Mode = null | "novo" | "existente";
type Playbook = { id: string; files: string[]; extra: number };

const EXISTENTES = Array.from({ length: 3 }, (_, i) => ({
  id: `pb-${i}`,
  name: "Fyntra analytics",
  used: "Utilizado por 2 bases",
}));

export function PlaybookStep({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const [mode, setMode] = React.useState<Mode>(null);
  const [playbook, setPlaybook] = React.useState<Playbook | null>(null);

  const [sources, setSources] = React.useState<SourceData>(EMPTY_SOURCES);
  const [pickerKey, setPickerKey] = React.useState(0);
  const [picked, setPicked] = React.useState<string | null>(null);
  const total = sourcesTotal(sources);

  function resetNovo() {
    setSources(EMPTY_SOURCES);
    setPickerKey((k) => k + 1);
  }

  function salvar() {
    setPlaybook({
      id: "pb",
      files: sources.files.length ? sources.files : ["file-name", "file-2", "file"],
      extra: sources.urls.length + sources.snippets.length + sources.integr.length,
    });
    resetNovo();
    setMode(null);
  }

  return (
    <div className="flex w-full max-w-[680px] flex-col">
      <h1 className="flex items-center gap-2 font-heading text-[30px] font-medium tracking-[-0.01em] text-(--fg-primary)">
        Playbook
        <Icon name="info" size={20} />
      </h1>
      <p className="mt-2 text-[15px] text-(--fg-tertiary)">
        Insira fontes de conhecimento para gerar novas knowledge layers, ou selecione
        o playbook de outra base de conhecimento.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ChoiceCard icon="auto_stories" label="Novo playbook" onClick={() => setMode("novo")} />
        <ChoiceCard
          icon="folder_open"
          label="Playbook existente"
          onClick={() => setMode("existente")}
        />
      </div>

      {playbook && (
        <div className="mt-6 rounded-2xl border border-(--border-default) bg-(--bg-raised) p-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-(--bg-inverse) text-(--fg-on-inverse)">
              <Icon name="auto_stories" size={18} />
            </span>
            <div>
              <p className="text-sm font-medium">
                Arquivos anexados ({playbook.files.length + playbook.extra})
              </p>
              <p className="text-2xs text-(--fg-tertiary)">Novo</p>
            </div>
            <button
              type="button"
              onClick={() => setPlaybook(null)}
              className="ml-auto text-xs text-(--accent-danger) hover:underline"
            >
              Remover playbook
            </button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {playbook.files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-xl border border-(--border-subtle) bg-(--bg-surface) px-3 py-2.5"
              >
                <Icon name="picture_as_pdf" size={18} />
                <div className="min-w-0">
                  <p className="truncate text-sm">{f}</p>
                  <p className="text-2xs text-(--fg-tertiary)">10 MB</p>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setMode("novo")}
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-(--fg-secondary) hover:text-(--fg-primary)"
          >
            <Icon name="add" size={16} /> Adicionar mais fontes
          </button>
        </div>
      )}

      <div className="mt-10 flex items-center justify-between">
        <AwButton variant="secondary" iconLeft="chevron_left" className="w-auto" onClick={onBack}>
          Voltar
        </AwButton>
        <AwButton
          variant="primary"
          iconRight="auto_awesome"
          className="w-auto"
          disabled={!playbook}
          onClick={onNext}
        >
          Criar base
        </AwButton>
      </div>

      {/* Modal: Novo playbook */}
      <AwModal
        open={mode === "novo"}
        onClose={() => {
          resetNovo();
          setMode(null);
        }}
        size="cockpit"
        title="Novo playbook"
        footer={
          <div className="flex items-center justify-between">
            <AwButton
              variant="ghost"
              className="w-auto"
              onClick={() => {
                resetNovo();
                setMode(null);
              }}
            >
              Cancelar
            </AwButton>
            <AwButton variant="primary" className="w-auto" disabled={total === 0} onClick={salvar}>
              Salvar
            </AwButton>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm text-(--fg-secondary)">
            Adicione informações como arquivos, URLs, snippets ou integrações para
            gerar knowledge layers, ajudando a estruturar e organizar a base.
          </p>
          <SourcePicker key={pickerKey} onChange={setSources} />
        </div>
      </AwModal>

      {/* Modal: Playbooks existentes */}
      <AwModal
        open={mode === "existente"}
        onClose={() => {
          setPicked(null);
          setMode(null);
        }}
        size="cockpit"
        title="Playbooks existentes"
        footer={
          <div className="flex items-center justify-between">
            <AwButton
              variant="ghost"
              className="w-auto"
              onClick={() => {
                setPicked(null);
                setMode(null);
              }}
            >
              Fechar
            </AwButton>
            <AwButton
              variant="primary"
              className="w-auto"
              disabled={!picked}
              onClick={() => {
                setPlaybook({ id: "ex", files: ["fyntra_analytics.pdf"], extra: 2 });
                setPicked(null);
                setMode(null);
              }}
            >
              Adicionar
            </AwButton>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-(--fg-secondary)">
            Selecione entre um playbook existente na organização.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {EXISTENTES.map((e) => {
              const on = picked === e.id;
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setPicked(e.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                    on
                      ? "border-(--fg-primary) bg-(--bg-surface)"
                      : "border-(--border-default) bg-(--bg-raised) hover:border-(--border-strong)",
                  )}
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-(--bg-inverse) text-(--fg-on-inverse)">
                    <Icon name="auto_stories" size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{e.name}</span>
                    <span className="block truncate text-2xs text-(--fg-tertiary)">{e.used}</span>
                  </span>
                  <Icon
                    name={on ? "radio_button_checked" : "radio_button_unchecked"}
                    size={20}
                    fill={on ? 1 : 0}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </AwModal>
    </div>
  );
}
