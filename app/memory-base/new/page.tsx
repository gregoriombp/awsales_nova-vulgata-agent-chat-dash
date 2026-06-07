"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AwSidebar } from "@/components/ui/AwSidebar";
import { AwButton } from "@/components/ui/AwButton";
import { AwInput } from "@/components/ui/AwInput";
import { Icon } from "@/components/ui/Icon";
import { createMemoryBase } from "@/lib/memory-base/create";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────────────────
 * Wizard de criação de base de conhecimento — full-screen (/memory-base/new).
 *
 * Versão enxuta do fluxo do Figma (8 telas → 3 + loading):
 *   1. Nome            (Tela 02 Intro)
 *   2. Classificação   (Objetivo + Tipo de segmento + Envio — Telas 03-05)
 *   3. Fontes-âncora   (Produto + Catálogo/XLS + Playbook — Telas 06-08)
 *   → Loading          (Tela 09) → base criada (/memory-base/[id]).
 *
 * Fontes são decorativas (repo é preview, sem backend). Ver
 * docs/memory-base-creation-wizard.md.
 * ───────────────────────────────────────────────────────────────────────── */

type Opt = { id: string; icon: string; desc?: string };

const OBJETIVOS: Opt[] = [
  { id: "Vendas", icon: "sell" },
  { id: "Onboarding", icon: "rocket_launch" },
  { id: "Suporte e Atendimento", icon: "support_agent" },
  { id: "CS / Lançamento", icon: "campaign" },
  { id: "Captação de Lead", icon: "ads_click" },
];

const SEGMENTOS: Opt[] = [
  { id: "Educação", icon: "school" },
  { id: "Produto físico", icon: "inventory_2" },
  { id: "Serviços", icon: "handshake" },
];

const ENVIOS: Opt[] = [
  { id: "Padrão", icon: "article", desc: "Dados enviados individualmente, por links e documentos de cada item — estruturados produto a produto." },
  { id: "Catálogo", icon: "dataset", desc: "Dados enviados em lote, por arquivo CSV ou integração — estrutura padronizada." },
];

const STEPS = ["Nome", "Classificação", "Fontes-âncora"] as const;
type SourceMode = "novo" | "existente";

export default function CreateMemoryBaseWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [creating, setCreating] = useState(false);

  // Identidade
  const [name, setName] = useState("");
  // Classificação
  const [objetivo, setObjetivo] = useState("");
  const [segmento, setSegmento] = useState("");
  const [envio, setEnvio] = useState("");
  // Fontes-âncora (decorativas)
  const [produtoMode, setProdutoMode] = useState<SourceMode>("novo");
  const [catalogoMode, setCatalogoMode] = useState<SourceMode>("novo");
  const [playbookMode, setPlaybookMode] = useState<SourceMode>("novo");

  const nameOk = name.trim().length > 0;
  const classOk = objetivo && segmento && envio;
  const canAdvance = step === 1 ? nameOk : step === 2 ? classOk : true;

  const goNext = () => {
    if (!canAdvance) return;
    if (step < 3) setStep((s) => (s + 1) as 1 | 2 | 3);
    else handleCreate();
  };
  const goBack = () => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));

  const handleCreate = () => {
    if (creating) return;
    setCreating(true);
    const tipoDados = envio === "Catálogo" ? "Catálogo" : "Documentação";
    const id = createMemoryBase({ name: name.trim(), objetivo, segmento, tipoDados });
    // Tela de loading (IA arquitetando) antes de cair na base.
    window.setTimeout(() => {
      router.push(`/memory-base/${id}?new=1&name=${encodeURIComponent(name.trim())}`);
    }, 2200);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-surface)]">
      <AwSidebar />
      <div className="flex flex-1 min-w-0 flex-col overflow-hidden bg-[var(--bg-raised)]">
        {creating ? (
          <LoadingScene />
        ) : (
          <>
            {/* Stepper */}
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] px-12 py-4">
              {STEPS.map((label, i) => {
                const n = (i + 1) as 1 | 2 | 3;
                const active = n === step;
                const done = n < step;
                return (
                  <div key={label} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-medium transition-colors",
                        active
                          ? "bg-[var(--fg-primary)] text-[var(--bg-raised)]"
                          : done
                            ? "bg-[var(--fg-primary)] text-[var(--bg-raised)]"
                            : "bg-[var(--bg-muted)] text-[var(--fg-tertiary)]",
                      )}
                    >
                      {done ? <Icon name="check" size={14} /> : n}
                    </span>
                    <span
                      className={cn(
                        "text-[13px]",
                        active ? "font-medium text-[var(--fg-primary)]" : "text-[var(--fg-tertiary)]",
                      )}
                    >
                      {label}
                    </span>
                    {i < STEPS.length - 1 && (
                      <span className="mx-2 h-px w-8 bg-[var(--border-subtle)]" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Conteúdo */}
            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto flex min-h-full w-full max-w-[860px] flex-col px-8 py-12">
                <div className="flex-1">
                  {step === 1 && <StepNome name={name} setName={setName} onEnter={goNext} />}
                  {step === 2 && (
                    <StepClassificacao
                      objetivo={objetivo}
                      setObjetivo={setObjetivo}
                      segmento={segmento}
                      setSegmento={setSegmento}
                      envio={envio}
                      setEnvio={setEnvio}
                    />
                  )}
                  {step === 3 && (
                    <StepFontes
                      produtoMode={produtoMode}
                      setProdutoMode={setProdutoMode}
                      catalogoMode={catalogoMode}
                      setCatalogoMode={setCatalogoMode}
                      playbookMode={playbookMode}
                      setPlaybookMode={setPlaybookMode}
                    />
                  )}
                </div>

                {/* Rodapé */}
                <div className="mt-12 flex items-center justify-between">
                  {step > 1 ? (
                    <AwButton variant="secondary" iconLeft="arrow_back" className="w-auto" onClick={goBack}>
                      Voltar
                    </AwButton>
                  ) : (
                    <button
                      type="button"
                      onClick={() => router.push("/memory-base")}
                      className="text-[13px] text-[var(--fg-tertiary)] transition-colors hover:text-[var(--fg-secondary)]"
                    >
                      Cancelar
                    </button>
                  )}
                  <AwButton
                    variant="primary"
                    iconRight={step < 3 ? "arrow_forward" : undefined}
                    iconLeft={step === 3 ? "add" : undefined}
                    className="w-auto"
                    onClick={goNext}
                    disabled={!canAdvance}
                  >
                    {step < 3 ? "Avançar" : "Criar base"}
                  </AwButton>
                </div>
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Passo 1 — Nome ───────────────────────────────────────────────────── */
function StepNome({
  name,
  setName,
  onEnter,
}: {
  name: string;
  setName: (v: string) => void;
  onEnter: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-8 pt-12 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--fg-primary)] text-[var(--bg-raised)]">
        <Icon name="account_balance" size={40} weight={300} />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-medium tracking-[-0.01em] text-[var(--fg-primary)]">
          Vamos criar sua base de conhecimento
        </h1>
        <p className="text-[15px] text-[var(--fg-secondary)]">
          Comece dando um nome. Depois você classifica e adiciona as fontes.
        </p>
      </div>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && name.trim()) {
            e.preventDefault();
            onEnter();
          }
        }}
        placeholder="Ex.: Fyntra produtos"
        className="w-full max-w-[420px] border-0 border-b border-[var(--border-default)] bg-transparent pb-2 text-center text-[22px] font-medium text-[var(--fg-primary)] outline-none transition-colors placeholder:font-normal placeholder:text-[var(--fg-tertiary)] focus:border-[var(--fg-primary)]"
      />
    </div>
  );
}

/* ── Passo 2 — Classificação ──────────────────────────────────────────── */
function StepClassificacao({
  objetivo,
  setObjetivo,
  segmento,
  setSegmento,
  envio,
  setEnvio,
}: {
  objetivo: string;
  setObjetivo: (v: string) => void;
  segmento: string;
  setSegmento: (v: string) => void;
  envio: string;
  setEnvio: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-10">
      <FieldBlock
        title="Qual o objetivo da sua base de conhecimento?"
        subtitle="Define o objetivo principal pra começar a configurar."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {OBJETIVOS.map((o) => (
            <OptionCard key={o.id} opt={o} selected={objetivo === o.id} onClick={() => setObjetivo(o.id)} />
          ))}
        </div>
      </FieldBlock>

      <FieldBlock title="Qual o tipo de segmento?" subtitle="O segmento de negócio da base.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SEGMENTOS.map((o) => (
            <OptionCard key={o.id} opt={o} selected={segmento === o.id} onClick={() => setSegmento(o.id)} />
          ))}
        </div>
      </FieldBlock>

      <FieldBlock
        title="Como os dados serão enviados?"
        subtitle="Escolha como os dados dos seus produtos chegam à base."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ENVIOS.map((o) => (
            <OptionCard key={o.id} opt={o} selected={envio === o.id} onClick={() => setEnvio(o.id)} tall />
          ))}
        </div>
      </FieldBlock>
    </div>
  );
}

/* ── Passo 3 — Fontes-âncora (decorativas) ────────────────────────────── */
function StepFontes({
  produtoMode,
  setProdutoMode,
  catalogoMode,
  setCatalogoMode,
  playbookMode,
  setPlaybookMode,
}: {
  produtoMode: SourceMode;
  setProdutoMode: (m: SourceMode) => void;
  catalogoMode: SourceMode;
  setCatalogoMode: (m: SourceMode) => void;
  playbookMode: SourceMode;
  setPlaybookMode: (m: SourceMode) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[24px] font-medium tracking-[-0.01em] text-[var(--fg-primary)]">
          Fontes-âncora
        </h1>
        <p className="text-[14px] text-[var(--fg-secondary)]">
          As fontes que a IA analisa pra gerar os Knowledge Layers. Dá pra
          adicionar mais depois, dentro da base.
        </p>
      </div>

      <SourceBlock
        icon="inventory_2"
        title="Produto"
        desc="Vincule um produto à base."
        mode={produtoMode}
        onMode={setProdutoMode}
        novoLabel="Arraste arquivos do produto ou clique para selecionar"
        existenteLabel="Selecione um produto já cadastrado"
      />
      <SourceBlock
        icon="dataset"
        title="Catálogo (base de produtos)"
        desc="Suba uma planilha de produtos (.xlsx/.csv) — vira o catálogo da base."
        mode={catalogoMode}
        onMode={setCatalogoMode}
        novoLabel="Arraste a planilha (.xlsx/.csv) ou clique para selecionar"
        existenteLabel="Selecione um catálogo já importado"
      />
      <SourceBlock
        icon="menu_book"
        title="Playbook"
        desc="Perguntas e respostas que orientam o agente nas conversas."
        mode={playbookMode}
        onMode={setPlaybookMode}
        novoLabel="Arraste o playbook ou clique para selecionar"
        existenteLabel="Selecione o playbook de outra base"
      />
    </div>
  );
}

/* ── Componentes auxiliares ───────────────────────────────────────────── */

function FieldBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[18px] font-medium tracking-[-0.01em] text-[var(--fg-primary)]">{title}</h2>
        <p className="text-[13.5px] text-[var(--fg-secondary)]">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function OptionCard({
  opt,
  selected,
  onClick,
  tall,
}: {
  opt: Opt;
  selected: boolean;
  onClick: () => void;
  tall?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col gap-2 rounded-[var(--radius-lg)] border p-4 text-left transition-colors",
        tall ? "items-start" : "items-center justify-center text-center",
        selected
          ? "border-[var(--fg-primary)] bg-[var(--fg-primary)] text-[var(--bg-raised)]"
          : "border-[var(--border-subtle)] bg-[var(--bg-raised)] text-[var(--fg-primary)] hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)]",
      )}
    >
      <Icon name={opt.icon} size={tall ? 22 : 24} weight={300} />
      <span className="text-[14px] font-medium">{opt.id}</span>
      {opt.desc && (
        <span className={cn("text-[12.5px] leading-relaxed", selected ? "opacity-80" : "text-[var(--fg-tertiary)]")}>
          {opt.desc}
        </span>
      )}
    </button>
  );
}

function SourceBlock({
  icon,
  title,
  desc,
  mode,
  onMode,
  novoLabel,
  existenteLabel,
}: {
  icon: string;
  title: string;
  desc: string;
  mode: SourceMode;
  onMode: (m: SourceMode) => void;
  novoLabel: string;
  existenteLabel: string;
}) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--bg-surface)] text-[var(--fg-secondary)]">
            <Icon name={icon} size={20} weight={300} />
          </span>
          <div className="flex flex-col">
            <h3 className="text-[15px] font-medium text-[var(--fg-primary)]">{title}</h3>
            <p className="text-[13px] text-[var(--fg-tertiary)]">{desc}</p>
          </div>
        </div>
        {/* Toggle novo / existente */}
        <div className="flex flex-shrink-0 items-center gap-0.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] p-0.5">
          {(["novo", "existente"] as SourceMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onMode(m)}
              className={cn(
                "rounded-[var(--radius-sm)] px-3 py-1.5 text-[12.5px] font-medium capitalize transition-colors",
                mode === m
                  ? "bg-[var(--bg-raised)] text-[var(--fg-primary)] shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  : "text-[var(--fg-tertiary)] hover:text-[var(--fg-secondary)]",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        {mode === "novo" ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-[var(--border-default)] bg-[var(--bg-canvas)] px-4 py-8 text-center">
            <Icon name="upload_file" size={24} weight={300} className="text-[var(--fg-tertiary)]" />
            <span className="text-[13px] text-[var(--fg-secondary)]">{novoLabel}</span>
          </div>
        ) : (
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-canvas)] px-4 py-3 text-left text-[13px] text-[var(--fg-secondary)] transition-colors hover:bg-[var(--bg-hover)]"
          >
            {existenteLabel}
            <Icon name="expand_more" size={18} className="text-[var(--fg-tertiary)]" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Loading (Tela 09 — IA arquitetando) ──────────────────────────────── */
function LoadingScene() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
      <Icon name="auto_awesome" size={40} weight={300} className="text-[var(--fg-primary)] animate-pulse" />
      <h1 className="text-[22px] font-medium tracking-[-0.01em] text-[var(--fg-primary)]">
        Construindo sua base de conhecimento…
      </h1>
      <p className="max-w-[460px] text-[14px] leading-relaxed text-[var(--fg-secondary)]">
        Arquitetamos sua base de conhecimento, consolidando as informações para
        gerar os briefings prontos para seus agentes de IA.
      </p>
    </div>
  );
}
