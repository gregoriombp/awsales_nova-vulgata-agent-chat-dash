"use client";

import * as React from "react";
import BaseModal from "./BaseModal";
import { Icon } from "@/components/ui/Icon";
import { AwButton } from "@/components/ui/AwButton";
import { AwInput } from "@/components/ui/AwInput";
import { AwPill } from "@/components/ui/AwPill";
import { AwTabs } from "@/components/ui/AwTabs";
import { AwSheet } from "@/components/ui/AwSheet";
import { AwDropzone } from "@/components/ui/AwDropzone";
import { cn } from "@/lib/utils";

/**
 * AddCatalogModal — fluxo de "Novo catálogo" (envio em lote por CSV ou
 * integração). Net-new no produto: o wizard de criação já marca a base como
 * `tipoDados: "Catálogo"`, mas não havia onde agir. Reconstruído no DS atual a
 * partir da tela do workbench, usando a casca real (BaseModal) + AwDropzone +
 * AwTabs + AwSheet (instruções do CSV, empilhado por cima do modal).
 */

export type NewCatalog = {
  name: string;
  via: "csv" | "integracao";
  fileName?: string;
};

interface AddCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (catalog: NewCatalog) => void;
}

const INTEGRACOES = [
  { id: "slack", name: "Slack", desc: "Importe mensagens e conteúdos de canais da sua equipe." },
  { id: "hotmart", name: "Hotmart", desc: "Importe informações dos seus produtos e conteúdos." },
  { id: "assiny", name: "Assiny", desc: "Acesse informações sobre suas assinaturas e produtos." },
  { id: "calendly", name: "Calendly", desc: "Acesse informações sobre agendamentos e eventos." },
  { id: "stripe", name: "Stripe", desc: "Acesse informações sobre pagamentos, clientes e assinaturas." },
];

const COLUNAS = [
  { col: "codigo_produto_unico", req: true, desc: "Identificador único do produto." },
  { col: "descricao", req: true, desc: "Descrição do produto." },
  { col: "unidade", req: true, desc: "Unidade de venda (ex: 'UN', 'CX', 'KG')." },
  { col: "unidade_metrica", req: true, desc: "Quantidade por unidade (ex: '1', '12', '0.5')." },
  { col: "grupo", req: true, desc: "Nome da categoria principal." },
  { col: "grupo_id", req: true, desc: "ID da categoria." },
  { col: "link_imagem", req: false, desc: "URL da imagem do produto." },
  { col: "tags", req: false, desc: "Palavras-chave que facilitam a localização do produto." },
];

const VARIAVEIS = ["preço (coluna D)", "estoque (coluna F)", "link_produto (coluna H)"];

export default function AddCatalogModal({
  isOpen,
  onClose,
  onComplete,
}: AddCatalogModalProps) {
  const [step, setStep] = React.useState<"form" | "variaveis">("form");
  const [tab, setTab] = React.useState<"arquivos" | "integracao">("arquivos");
  const [name, setName] = React.useState("");
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [integr, setIntegr] = React.useState<string[]>([]);
  const [showInstr, setShowInstr] = React.useState(false);

  const reset = () => {
    setStep("form");
    setTab("arquivos");
    setName("");
    setFileName(null);
    setIntegr([]);
    setShowInstr(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const finalize = (via: "csv" | "integracao") => {
    onComplete?.({ name: name.trim() || "Catálogo", via, fileName: fileName ?? undefined });
    reset();
    onClose();
  };

  const canAdvance = name.trim().length > 0 && (!!fileName || integr.length > 0);

  if (!isOpen) return null;

  return (
    <>
      <BaseModal isOpen={isOpen} onClose={handleClose} size="lg">
        <div className="flex max-h-[90vh] flex-col p-6">
          <div className="mb-2 flex shrink-0 items-start justify-between">
            <h2 className="text-[20px] font-medium tracking-[-0.01em] text-(--fg-primary)">
              Novo catálogo
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="-mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-sm text-(--fg-tertiary) transition-colors hover:bg-(--bg-surface) hover:text-(--fg-primary)"
              aria-label="Fechar"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          {step === "form" ? (
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto">
              <p className="text-[14px] leading-relaxed text-(--fg-secondary)">
                Envie os dados do catálogo por meio de um único arquivo CSV ou de
                uma integração. As informações devem estar organizadas e
                estruturadas para garantir o melhor processamento.
              </p>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Nome do catálogo</span>
                <AwInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Catálogo Fyntra"
                  autoFocus
                />
              </label>

              <AwTabs
                variant="underline"
                value={tab}
                onChange={(v) => setTab(v as "arquivos" | "integracao")}
                items={[
                  { value: "arquivos", label: "Arquivo CSV" },
                  { value: "integracao", label: "Integração" },
                ]}
              />

              {tab === "arquivos" ? (
                <div className="flex flex-col gap-3">
                  <AwDropzone
                    variant="compact"
                    accept=".csv"
                    multiple={false}
                    maxSizeMb={30}
                    icon="dataset"
                    title="Sincronize vários produtos de uma vez"
                    hint="um arquivo .csv de até 30 MB"
                    ctaLabel="Escolher arquivo CSV"
                    onChange={(files) => setFileName(files[0]?.name ?? null)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowInstr(true)}
                    className="inline-flex w-fit items-center gap-1.5 text-sm text-(--fg-secondary) hover:text-(--fg-primary)"
                  >
                    <Icon name="help" size={16} /> Instruções para o arquivo CSV
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {INTEGRACOES.map((it) => {
                    const on = integr.includes(it.id);
                    return (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() =>
                          setIntegr((l) =>
                            on ? l.filter((x) => x !== it.id) : [...l, it.id],
                          )
                        }
                        className={cn(
                          "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                          on
                            ? "border-(--fg-primary) bg-(--bg-surface)"
                            : "border-(--border-default) bg-(--bg-raised) hover:border-(--border-strong)",
                        )}
                      >
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-(--bg-muted) text-xs font-semibold">
                          {it.name[0]}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">{it.name}</span>
                          <span className="block truncate text-xs text-(--fg-tertiary)">
                            {it.desc}
                          </span>
                        </span>
                        <Icon
                          name={on ? "check_box" : "check_box_outline_blank"}
                          size={20}
                          fill={on ? 1 : 0}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
              <h3 className="text-base font-semibold">Dados variáveis detectados</h3>
              <p className="text-sm text-(--fg-secondary)">
                Identificamos colunas que tendem a mudar com frequência:
              </p>
              <ul className="flex flex-col gap-1.5">
                {VARIAVEIS.map((v) => (
                  <li key={v} className="flex items-center gap-2 text-sm">
                    <Icon name="bolt" size={16} /> {v}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-(--fg-tertiary)">
                Para mantê-las sempre atualizadas, configure uma Tool que consulte
                esses dados em tempo real. Se mudam raramente, pode mantê-las no CSV
                como dados estáticos.
              </p>
            </div>
          )}

          <div className="mt-6 flex shrink-0 items-center justify-between gap-3">
            {step === "form" ? (
              <>
                <AwButton variant="ghost" onClick={handleClose}>
                  Cancelar
                </AwButton>
                <AwButton
                  variant="primary"
                  disabled={!canAdvance}
                  onClick={() => (fileName ? setStep("variaveis") : finalize("integracao"))}
                >
                  Avançar
                </AwButton>
              </>
            ) : (
              <>
                <AwButton variant="ghost" iconLeft="arrow_back" onClick={() => setStep("form")}>
                  Voltar
                </AwButton>
                <div className="flex items-center gap-2">
                  <AwButton variant="secondary" onClick={() => finalize("csv")}>
                    Manter dados estáticos
                  </AwButton>
                  <AwButton variant="primary" iconLeft="build" onClick={() => finalize("csv")}>
                    Configurar tool
                  </AwButton>
                </div>
              </>
            )}
          </div>
        </div>
      </BaseModal>

      {/* Instruções do CSV — drawer lateral por cima do modal */}
      <AwSheet
        open={showInstr}
        onClose={() => setShowInstr(false)}
        size="default"
        title="Instruções para o arquivo CSV"
        zIndex={1100}
        footer={
          <AwButton variant="secondary" block iconLeft="download">
            Baixar modelo CSV
          </AwButton>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-(--fg-secondary)">
            Para evitar erros no processamento, use o modelo disponibilizado. O
            arquivo deve ter no máximo 30 mil produtos.
          </p>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-(--fg-tertiary)">
              Colunas
            </p>
            {COLUNAS.map((c) => (
              <div
                key={c.col}
                className="rounded-xl border border-(--border-subtle) bg-(--bg-raised) px-3 py-2.5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{c.col}</span>
                  {c.req ? (
                    <AwPill variant="warning">obrigatória</AwPill>
                  ) : (
                    <AwPill variant="neutral">opcional</AwPill>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-(--fg-tertiary)">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </AwSheet>
    </>
  );
}
