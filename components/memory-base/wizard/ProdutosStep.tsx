"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AwButton } from "@/components/ui/AwButton";
import { AwInput } from "@/components/ui/AwInput";
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
 * Passo "Produtos" (Etapa 5 — ramo Padrão) do wizard de criação. No Figma eram 20
 * frames (tela-base + estados de 3 modais); aqui viram modais interativos:
 *   • "Novo produto"        — Nome + fontes (Arquivos/URL/Snippet/Integração)
 *   • "Produtos existentes" — busca + grid multi-seleção
 *   • "Você perderá seu progresso" — confirmação de descarte ao fechar com dados
 */

type Mode = null | "novo" | "existente" | "discard";
type Produto = { id: string; name: string; fontes: number };

const EXISTENTES = Array.from({ length: 6 }, (_, i) => ({
  id: `ex-${i}`,
  name: "Fyntra analytics",
  meta: "fyntra_analytics.pdf  ·  +3",
  used: "Utilizado por 2 bases de conhecimento",
}));

export function ProdutosStep({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const [mode, setMode] = React.useState<Mode>(null);
  const [produtos, setProdutos] = React.useState<Produto[]>([]);

  // Modal "Novo produto"
  const [name, setName] = React.useState("");
  const [sources, setSources] = React.useState<SourceData>(EMPTY_SOURCES);
  const [pickerKey, setPickerKey] = React.useState(0);
  const fontes = sourcesTotal(sources);
  const novoDirty = name.trim().length > 0 || fontes > 0;

  // Modal "Produtos existentes"
  const [search, setSearch] = React.useState("");
  const [picked, setPicked] = React.useState<string[]>([]);

  function resetNovo() {
    setName("");
    setSources(EMPTY_SOURCES);
    setPickerKey((k) => k + 1);
  }

  function closeNovo() {
    if (novoDirty) setMode("discard");
    else {
      resetNovo();
      setMode(null);
    }
  }

  function salvarNovo() {
    setProdutos((p) => [
      ...p,
      { id: `np-${p.length}`, name: name.trim() || "Novo produto", fontes },
    ]);
    resetNovo();
    setMode(null);
  }

  function selecionarExistentes() {
    setProdutos((p) => [
      ...p,
      ...picked.map((id, i) => ({
        id: `ex-${p.length}-${i}`,
        name: EXISTENTES.find((e) => e.id === id)?.name ?? "Produto",
        fontes: 4,
      })),
    ]);
    setPicked([]);
    setSearch("");
    setMode(null);
  }

  return (
    <div className="flex w-full max-w-[680px] flex-col">
      <h1 className="font-heading text-[30px] font-medium tracking-heading text-(--fg-primary)">
        Produtos
      </h1>
      <p className="mt-2 text-base text-(--fg-tertiary)">
        Selecione produtos já utilizados na organização ou crie novos itens para
        adicioná-los a esta base de conhecimento.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ChoiceCard icon="add_box" label="Novo produto" onClick={() => setMode("novo")} />
        <ChoiceCard
          icon="inventory_2"
          label="Produto existente"
          onClick={() => setMode("existente")}
        />
      </div>

      {produtos.length > 0 && (
        <div className="mt-6 flex flex-col gap-2">
          {produtos.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-xl border border-(--border-default) bg-(--bg-raised) px-4 py-3"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-(--bg-surface)">
                <Icon name="inventory_2" size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-2xs text-(--fg-tertiary)">
                  {p.fontes} {p.fontes === 1 ? "fonte" : "fontes"} de conhecimento
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProdutos((list) => list.filter((x) => x.id !== p.id))}
                className="ml-auto text-(--fg-tertiary) hover:text-(--fg-primary)"
                aria-label={`Remover ${p.name}`}
              >
                <Icon name="close" size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 flex items-center justify-between">
        <AwButton variant="secondary" iconLeft="chevron_left" className="w-auto" onClick={onBack}>
          Voltar
        </AwButton>
        <AwButton
          variant="primary"
          className="w-auto"
          disabled={produtos.length === 0}
          onClick={onNext}
        >
          Avançar
        </AwButton>
      </div>

      {/* Modal: Novo produto */}
      <AwModal
        open={mode === "novo"}
        onClose={closeNovo}
        size="cockpit"
        title="Novo produto"
        footer={
          <div className="flex items-center justify-between">
            <AwButton variant="ghost" className="w-auto" onClick={closeNovo}>
              Cancelar
            </AwButton>
            <AwButton variant="primary" className="w-auto" disabled={!name.trim()} onClick={salvarNovo}>
              Salvar
            </AwButton>
          </div>
        }
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm text-(--fg-secondary)">
            Adicione informações do produto com arquivos, URLs, snippets ou
            integrações. Para mais precisão, envie apenas conteúdos relacionados ao
            produto.
          </p>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Nome</span>
            <AwInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do produto"
            />
          </label>
          <SourcePicker key={pickerKey} onChange={setSources} />
        </div>
      </AwModal>

      {/* Modal: Produtos existentes */}
      <AwModal
        open={mode === "existente"}
        onClose={() => {
          setPicked([]);
          setSearch("");
          setMode(null);
        }}
        size="cockpit"
        title="Produtos existentes"
        footer={
          <div className="flex items-center justify-between">
            <AwButton
              variant="ghost"
              className="w-auto"
              onClick={() => {
                setPicked([]);
                setSearch("");
                setMode(null);
              }}
            >
              Cancelar
            </AwButton>
            <AwButton
              variant="primary"
              className="w-auto"
              disabled={picked.length === 0}
              onClick={selecionarExistentes}
            >
              Selecionar{picked.length > 0 ? ` (${picked.length})` : ""}
            </AwButton>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-(--fg-secondary)">
            Selecione um produto já criado em outra base para vinculá-lo a esta. Os
            arquivos associados são mantidos.
          </p>
          <AwInput
            iconLeft="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {EXISTENTES.filter((e) =>
              e.name.toLowerCase().includes(search.toLowerCase()),
            ).map((e) => {
              const on = picked.includes(e.id);
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() =>
                    setPicked((list) =>
                      on ? list.filter((x) => x !== e.id) : [...list, e.id],
                    )
                  }
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                    on
                      ? "border-(--fg-primary) bg-(--bg-surface)"
                      : "border-(--border-default) bg-(--bg-raised) hover:border-(--border-strong)",
                  )}
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-(--bg-inverse) text-(--fg-on-inverse)">
                    <Icon name="inventory_2" size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{e.name}</span>
                    <span className="block truncate text-2xs text-(--fg-tertiary)">
                      {e.meta}
                    </span>
                    <span className="block truncate text-2xs text-(--fg-tertiary)">
                      {e.used}
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
        </div>
      </AwModal>

      {/* Modal: confirmação de descarte */}
      <AwModal
        open={mode === "discard"}
        onClose={() => setMode("novo")}
        size="md"
        dismissible={false}
        footer={
          <div className="flex items-center justify-end gap-3">
            <AwButton
              variant="ghost"
              className="w-auto"
              onClick={() => {
                resetNovo();
                setMode(null);
              }}
            >
              Sair e perder dados
            </AwButton>
            <AwButton variant="primary" className="w-auto" onClick={() => setMode("novo")}>
              Permanecer
            </AwButton>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <span className="text-(--accent-warning)">
            <Icon name="error" size={32} fill={1} />
          </span>
          <h2 className="text-lg font-semibold">Você perderá seu progresso</h2>
          <p className="max-w-sm text-sm text-(--fg-secondary)">
            Os dados e produtos adicionados ainda não foram salvos. Tem certeza que
            deseja interromper o preenchimento?
          </p>
        </div>
      </AwModal>
    </div>
  );
}
