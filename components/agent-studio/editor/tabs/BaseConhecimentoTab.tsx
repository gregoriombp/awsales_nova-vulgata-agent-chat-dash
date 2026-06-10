"use client";

import * as React from "react";
import Link from "next/link";
import { AwButton } from "@/components/ui/AwButton";
import { AwPill } from "@/components/ui/AwPill";
import { Icon } from "@/components/ui/Icon";
import type { AgentEditorData } from "@/lib/agentStudio";

/**
 * Base de conhecimento — seção do editor de agente.
 *
 * Card escuro de destaque com a base atualmente conectada (mesmo idioma de
 * superfície inversa usado no memory-base: --bg-inverse + --dark-*) e uma
 * lista expansível com as demais bases disponíveis. Trocar a seleção só
 * altera o estado local e sinaliza "Alteração pendente" — a publicação real
 * acontece no fluxo de revisão.
 */
export function BaseConhecimentoTab({ data }: { data: AgentEditorData }) {
  const originalId =
    data.basesDisponiveis.find((b) => b.nome === data.kb.nome)?.id ??
    data.basesDisponiveis[0]?.id ??
    null;

  const [selectedId, setSelectedId] = React.useState<string | null>(originalId);
  const [listOpen, setListOpen] = React.useState(false);

  const selecionada = data.basesDisponiveis.find((b) => b.id === selectedId);
  const isPending = selectedId !== originalId;

  const atual = selecionada
    ? {
        nome: selecionada.nome,
        fontes: selecionada.fontes,
        knowledgeLayers: selecionada.knowledgeLayers,
      }
    : {
        nome: data.kb.nome,
        fontes: data.kb.fontes,
        knowledgeLayers: data.kb.knowledgeLayers,
      };

  return (
    <div className="mx-auto w-full max-w-[800px]">
      {/* ── Base atual ─────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-medium text-(--fg-primary)">
              Base de conhecimento atual
            </h2>
            {isPending && <AwPill variant="draft">Alteração pendente</AwPill>}
          </div>
          {isPending && (
            <AwButton
              variant="ghost"
              size="sm"
              iconLeft="undo"
              onClick={() => setSelectedId(originalId)}
            >
              Desfazer
            </AwButton>
          )}
        </div>

        <div className="mt-4 rounded-xl bg-(--bg-inverse) p-6">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-(--dark-border) bg-(--dark-bg-raised) text-(--fg-on-inverse)">
                <Icon name="account_balance" size={20} />
              </span>

              <div className="mt-4 flex items-center gap-3">
                <h3 className="truncate text-base font-medium text-(--fg-on-inverse)">
                  {atual.nome}
                </h3>
                <AwPill variant="live">Ativo</AwPill>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-(--dark-fg-secondary)">
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="description" size={14} />
                  {atual.fontes} fontes de conhecimento
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="layers" size={14} />
                  {atual.knowledgeLayers} Knowledge Layers
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="smart_toy" size={14} />
                  Utilizado por {data.kb.usadoPorAgentes}{" "}
                  {data.kb.usadoPorAgentes === 1 ? "agente" : "agentes"}
                </span>
              </div>
            </div>

            <Link
              href="/memory-base"
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-(--dark-border) bg-(--dark-bg-raised) px-4 py-2 text-sm font-medium text-(--fg-on-inverse) transition-colors duration-aw-fast hover:bg-(--dark-bg-hover)"
            >
              Ver na Memory base
              <Icon name="arrow_outward" size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bases disponíveis ──────────────────────────────────────── */}
      <section className="mt-8 rounded-xl border border-(--border-subtle) bg-(--bg-canvas)">
        <button
          type="button"
          onClick={() => setListOpen((v) => !v)}
          aria-expanded={listOpen}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-aw-fast hover:bg-(--bg-hover)"
        >
          <span className="text-sm font-medium text-(--fg-primary)">
            Todas as bases de conhecimento disponíveis
          </span>
          <Icon
            name="expand_more"
            size={20}
            className={`shrink-0 text-(--fg-tertiary) transition-transform duration-aw-fast ${
              listOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {listOpen && (
          <div
            role="radiogroup"
            aria-label="Bases de conhecimento disponíveis"
            className="border-t border-(--border-subtle)"
          >
            {data.basesDisponiveis.map((base, i) => {
              const checked = base.id === selectedId;
              return (
                <button
                  key={base.id}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => setSelectedId(base.id)}
                  className={`flex w-full items-center gap-4 px-5 py-4 text-left transition-colors duration-aw-fast hover:bg-(--bg-hover) ${
                    i > 0 ? "border-t border-(--border-subtle)" : ""
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-aw-fast ${
                      checked
                        ? "border-(--fg-primary)"
                        : "border-(--border-strong)"
                    }`}
                  >
                    {checked && (
                      <span className="h-2 w-2 rounded-full bg-(--fg-primary)" />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-(--fg-primary)">
                      {base.nome}
                    </span>
                    <span className="mt-0.5 flex items-center gap-4 text-xs text-(--fg-tertiary)">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="description" size={13} />
                        {base.fontes} fontes de conhecimento
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="layers" size={13} />
                        {base.knowledgeLayers} Knowledge Layers
                      </span>
                    </span>
                  </span>

                  {base.id === originalId && (
                    <AwPill variant="neutral" dot={false}>
                      Em uso
                    </AwPill>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {isPending && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-(--fg-tertiary)">
          <Icon name="info" size={14} />
          A nova base passa a valer depois que você revisar e publicar o
          agente.
        </p>
      )}
    </div>
  );
}
