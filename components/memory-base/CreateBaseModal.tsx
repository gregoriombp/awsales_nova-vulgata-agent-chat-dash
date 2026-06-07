"use client";

import { useMemo, useState } from "react";
import { AwModal } from "@/components/ui/AwModal";
import { AwButton } from "@/components/ui/AwButton";
import { AwInput, AwField } from "@/components/ui/AwInput";
import { AwSelect } from "@/components/ui/AwSelect";
import { Icon } from "@/components/ui/Icon";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  MOCK_KNOWLEDGE_BASES,
  distinctValues,
} from "./knowledgeBases";

export type NewBaseDraft = {
  name: string;
  objetivo: string;
  segmento: string;
  tipoDados: string;
};

/* ─────────────────────────────────────────────────────────────────────────
 * CreateBaseModal — fluxo de criação GUIADO em 2 passos.
 *
 *   Passo 1 → Nome (foco único, "como vamos chamar a base?")
 *   Passo 2 → Classificação (Objetivo · Segmento · Tipo de dados)
 *
 * O Figma tinha mais telas (config + upload de playbook + upload de produto).
 * Enxugamos: a criação só nomeia e classifica; adicionar fontes (playbook,
 * produto…) acontece DENTRO da base, no "Adicione Fontes". Sequencial, mas curto.
 * ───────────────────────────────────────────────────────────────────────── */
export function CreateBaseModal({
  open,
  onClose,
  onCreate,
  creating,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (draft: NewBaseDraft) => void;
  creating: boolean;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [segmento, setSegmento] = useState("");
  const [tipoDados, setTipoDados] = useState("");

  const objetivos = useMemo(() => distinctValues(MOCK_KNOWLEDGE_BASES, "objetivo"), []);
  const segmentos = useMemo(() => distinctValues(MOCK_KNOWLEDGE_BASES, "segmento"), []);
  const tipos = useMemo(() => distinctValues(MOCK_KNOWLEDGE_BASES, "tipoDados"), []);

  const trimmed = name.trim();

  const reset = () => {
    setStep(1);
    setName("");
    setObjetivo("");
    setSegmento("");
    setTipoDados("");
  };

  const close = () => {
    if (creating) return;
    reset();
    onClose();
  };

  const next = () => {
    if (trimmed) setStep(2);
  };

  const submit = () => {
    if (!trimmed || creating) return;
    onCreate({ name: trimmed, objetivo, segmento, tipoDados });
  };

  return (
    <AwModal
      open={open}
      onClose={close}
      title="Criar base de conhecimento"
      footer={
        step === 1 ? (
          <>
            <AwButton variant="ghost" onClick={close} disabled={creating}>
              Cancelar
            </AwButton>
            <AwButton
              variant="primary"
              iconRight="arrow_forward"
              onClick={next}
              disabled={!trimmed}
            >
              Avançar
            </AwButton>
          </>
        ) : (
          <>
            <AwButton variant="ghost" iconLeft="arrow_back" onClick={() => setStep(1)} disabled={creating}>
              Voltar
            </AwButton>
            <AwButton
              variant="primary"
              iconLeft="add"
              onClick={submit}
              disabled={!trimmed}
              loading={creating}
            >
              Criar base
            </AwButton>
          </>
        )
      }
    >
      {/* Indicador de passo */}
      <div className="mb-5 flex items-center gap-2">
        <StepDot active={step >= 1} done={step > 1} n={1} />
        <span className="h-px flex-1 bg-[var(--border-subtle)]" />
        <StepDot active={step >= 2} done={false} n={2} />
        <span className="ml-2 text-[12px] text-[var(--fg-tertiary)]">Passo {step} de 2</span>
      </div>

      {step === 1 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-[15px] font-medium text-[var(--fg-primary)]">
            Como vamos chamar a base?
          </h3>
          <p className="mb-2 text-[13.5px] leading-relaxed text-[var(--fg-secondary)]">
            Depois você adiciona fontes — arquivos, URLs, snippets, integrações —
            que a IA analisa para gerar os Knowledge Layers que o agente usa.
          </p>
          <AwField label="Nome da base">
            <AwInput
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Catálogo de produtos"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  next();
                }
              }}
            />
          </AwField>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-[15px] font-medium text-[var(--fg-primary)]">
              Classifique a base
            </h3>
            <p className="text-[13.5px] leading-relaxed text-[var(--fg-secondary)]">
              Ajuda a organizar e filtrar suas bases. Dá pra mudar depois.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Objetivo" value={objetivo} options={objetivos} onChange={setObjetivo} placeholder="Selecionar" />
            <SelectField label="Segmento" value={segmento} options={segmentos} onChange={setSegmento} placeholder="Selecionar" />
          </div>
          <SelectField label="Tipo de dados" value={tipoDados} options={tipos} onChange={setTipoDados} placeholder="Ex.: Catálogo" />
        </div>
      )}
    </AwModal>
  );
}

function StepDot({ active, done, n }: { active: boolean; done: boolean; n: number }) {
  return (
    <span
      className={
        "flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-medium transition-colors " +
        (active
          ? "bg-[var(--fg-primary)] text-[var(--bg-raised)]"
          : "bg-[var(--bg-muted)] text-[var(--fg-tertiary)]")
      }
    >
      {done ? <Icon name="check" size={14} /> : n}
    </span>
  );
}

/* Campo de seleção (single) — trigger estilo AwSelect + lista em Popover.
 * Permite digitar um valor novo além das opções do catálogo. */
function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const customTrimmed = custom.trim();

  return (
    <AwField label={label}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <AwSelect className="w-full justify-between">
            <span className={value ? "" : "text-[var(--fg-tertiary)]"}>
              {value || placeholder}
            </span>
          </AwSelect>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] rounded-[var(--radius-lg)] border-[var(--border-subtle)] p-1"
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-2 rounded-[var(--radius-md)] px-2.5 py-2 text-left text-[13px] text-[var(--fg-primary)] transition-colors hover:bg-[var(--bg-hover)]"
            >
              <span className="truncate">{opt}</span>
              {value === opt && (
                <Icon name="check" size={16} className="flex-shrink-0 text-[var(--accent-brand)]" />
              )}
            </button>
          ))}
          <div className="my-1 h-px bg-[var(--border-subtle)]" />
          <div className="flex items-center gap-1 px-1 pb-1">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Outro…"
              className="min-w-0 flex-1 rounded-[var(--radius-md)] bg-transparent px-2 py-1.5 text-[13px] text-[var(--fg-primary)] outline-none placeholder:text-[var(--fg-tertiary)]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && customTrimmed) {
                  e.preventDefault();
                  onChange(customTrimmed);
                  setCustom("");
                  setOpen(false);
                }
              }}
            />
            {customTrimmed && (
              <button
                type="button"
                onClick={() => {
                  onChange(customTrimmed);
                  setCustom("");
                  setOpen(false);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-md)] text-[var(--fg-secondary)] hover:bg-[var(--bg-hover)]"
                aria-label="Usar valor"
              >
                <Icon name="add" size={16} />
              </button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </AwField>
  );
}
