"use client";

import { useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwField } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwToggle } from "@/components/ui/AwToggle";
import { Icon } from "@/components/ui/Icon";
import type { AgentEditorData } from "@/lib/agentStudio";

type ModoTransferencia = "manual" | "automatica";

type RegraTransferencia = {
  id: string;
  condicao: string;
  ativa: boolean;
};

const REGRAS_INICIAIS: RegraTransferencia[] = [
  {
    id: "regra-pedido",
    condicao: "Lead pede para falar com um humano",
    ativa: true,
  },
  {
    id: "regra-sentimento",
    condicao: "Sentimento negativo por 2 mensagens seguidas",
    ativa: true,
  },
];

const CONDICOES_DISPONIVEIS = [
  "Lead menciona cancelamento",
  "Mais de 10 mensagens sem avanço",
  "Lead pede um orçamento personalizado",
  "Objeção fora do escopo do agente",
];

const MODOS: {
  id: ModoTransferencia;
  titulo: string;
  descricao: string;
}[] = [
  {
    id: "manual",
    titulo: "Transferência manual",
    descricao:
      "A transferência ocorre quando um atendente solicita ou o lead pede.",
  },
  {
    id: "automatica",
    titulo: "Transferência automática",
    descricao: "O agente transfere com base nas regras configuradas.",
  },
];

export function AtendimentoHumanoTab({ data }: { data: AgentEditorData }) {
  const [ativo, setAtivo] = useState(data.atendimentoHumano.ativo);
  const [modo, setModo] = useState<ModoTransferencia>(
    data.atendimentoHumano.modo
  );
  const [regras, setRegras] = useState<RegraTransferencia[]>(REGRAS_INICIAIS);
  const [addOpen, setAddOpen] = useState(false);
  const [novaCondicao, setNovaCondicao] = useState<string | null>(null);

  const toggleRegra = (id: string, next: boolean) => {
    setRegras((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ativa: next } : r))
    );
  };

  const closeAddModal = () => {
    setNovaCondicao(null);
    setAddOpen(false);
  };

  const addRegra = () => {
    if (!novaCondicao) return;
    setRegras((prev) => [
      ...prev,
      { id: `regra-${Date.now()}`, condicao: novaCondicao, ativa: true },
    ]);
    closeAddModal();
  };

  /* Condições ainda não usadas em nenhuma regra. */
  const condicoesLivres = CONDICOES_DISPONIVEIS.filter(
    (c) => !regras.some((r) => r.condicao === c)
  );

  return (
    <div className="flex max-w-[820px] flex-col gap-8">
      {/* Linha master */}
      <div className="flex items-start gap-3">
        <AwToggle
          checked={ativo}
          onChange={setAtivo}
          label="Transferência para humano"
          className="mt-0.5"
        />
        <div className="min-w-0">
          <p className="m-0 body-sm font-medium text-(--fg-primary)">
            Transferência para humano
          </p>
          <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">
            Permite que atendentes humanos assumam conversas quando
            necessário.
          </p>
        </div>
      </div>

      {/* Configurações dependentes do master */}
      <div
        aria-disabled={!ativo}
        className={`flex flex-col gap-8 transition-opacity duration-aw-fast ${
          ativo ? "" : "pointer-events-none opacity-50 select-none"
        }`}
      >
        {/* Modo de transferência */}
        <div
          role="radiogroup"
          aria-label="Modo de transferência"
          className="grid grid-cols-2 gap-6"
        >
          {MODOS.map((opcao) => {
            const selecionado = modo === opcao.id;
            return (
              <button
                key={opcao.id}
                type="button"
                role="radio"
                aria-checked={selecionado}
                onClick={() => setModo(opcao.id)}
                className="flex items-start gap-2.5 rounded-md text-left"
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors duration-aw-fast ${
                    selecionado
                      ? "border-(--fg-primary) bg-(--fg-primary)"
                      : "border-(--border-strong) bg-(--bg-surface)"
                  }`}
                >
                  {selecionado && (
                    <span className="h-1.5 w-1.5 rounded-full bg-(--bg-surface)" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block body-sm font-medium text-(--fg-primary)">
                    {opcao.titulo}
                  </span>
                  <span className="mt-0.5 block body-xs text-(--fg-tertiary)">
                    {opcao.descricao}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Regras — só no modo automático */}
        {modo === "automatica" && (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="m-0 body-sm font-medium text-(--fg-primary)">
                  Regras de transferência
                </h3>
                <p className="m-0 mt-0.5 body-xs text-(--fg-tertiary)">
                  Quando qualquer regra ativa for atendida, a conversa passa
                  para um atendente.
                </p>
              </div>
              <AwButton
                variant="secondary"
                size="sm"
                iconLeft="add"
                onClick={() => setAddOpen(true)}
              >
                Adicionar regra
              </AwButton>
            </div>

            <ul className="flex flex-col gap-2">
              {regras.map((regra) => (
                <li
                  key={regra.id}
                  className="flex items-center gap-4 rounded-xl border border-(--border-subtle) bg-(--bg-surface) px-4 py-3"
                >
                  <Icon
                    name="alt_route"
                    size={18}
                    className="shrink-0 text-(--fg-tertiary)"
                  />
                  <span className="min-w-0 flex-1 truncate body-sm text-(--fg-primary)">
                    {regra.condicao}
                  </span>
                  <AwToggle
                    checked={regra.ativa}
                    onChange={(next) => toggleRegra(regra.id, next)}
                    label={`${regra.ativa ? "Desativar" : "Ativar"} regra: ${regra.condicao}`}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Modal: adicionar regra */}
      <AwModal
        open={addOpen}
        onClose={closeAddModal}
        title="Adicionar regra de transferência"
        footer={
          <>
            <AwButton size="sm" variant="ghost" onClick={closeAddModal}>
              Cancelar
            </AwButton>
            <AwButton
              size="sm"
              variant="primary"
              disabled={!novaCondicao}
              onClick={addRegra}
            >
              Adicionar regra
            </AwButton>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="m-0 body-xs text-(--fg-secondary)">
            Escolha a condição que aciona a transferência automática para um
            atendente humano.
          </p>
          <AwField label="Condição" htmlFor="regra-condicao">
            <AwDropdownMenu
              align="start"
              trigger={
                <AwSelect
                  id="regra-condicao"
                  className="w-full justify-between"
                >
                  {novaCondicao ?? (
                    <span className="text-(--fg-tertiary)">
                      Selecione a condição
                    </span>
                  )}
                </AwSelect>
              }
              items={
                condicoesLivres.length > 0
                  ? condicoesLivres.map((c) => ({
                      id: c,
                      label: c,
                      checked: novaCondicao === c,
                      onSelect: () => setNovaCondicao(c),
                    }))
                  : [
                      {
                        id: "vazio",
                        label: "Todas as condições disponíveis já estão em uso.",
                        disabled: true,
                      },
                    ]
              }
            />
          </AwField>
        </div>
      </AwModal>
    </div>
  );
}
