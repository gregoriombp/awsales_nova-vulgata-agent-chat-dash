"use client";

import { useState } from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import {
  AwEmpty,
  AwEmptyContent,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty";
import { AwField, AwInput } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { AwPill } from "@/components/ui/AwPill";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwToggle } from "@/components/ui/AwToggle";
import { Icon } from "@/components/ui/Icon";
import type { AgentEditorData, FollowUpRule } from "@/lib/agentStudio";

const GATILHOS = ["Lead sem resposta", "Reunião agendada", "Pagamento pendente"];
const ESPERAS = ["1 hora", "24 horas", "3 dias"];
const CANAL_FIXO = "WhatsApp";

const COMO_FUNCIONA_PASSOS = [
  {
    icon: "bolt",
    titulo: "Gatilho",
    descricao:
      "Você escolhe o evento que inicia o follow-up — por exemplo, um lead que parou de responder ou uma reunião agendada.",
  },
  {
    icon: "schedule",
    titulo: "Espera",
    descricao:
      "O agente aguarda o intervalo definido antes de agir, evitando mensagens repetitivas ou fora de hora.",
  },
  {
    icon: "send",
    titulo: "Mensagem",
    descricao:
      "Ao fim da espera, o agente envia a mensagem de reengajamento pelo canal configurado e acompanha a resposta.",
  },
];

/* Modal de criação — formulário enxuto com canal fixo. */
function CreateFollowUpModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (rule: Omit<FollowUpRule, "id">) => void;
}) {
  const [nome, setNome] = useState("");
  const [gatilho, setGatilho] = useState<string | null>(null);
  const [espera, setEspera] = useState<string | null>(null);

  const canSubmit = nome.trim().length > 0 && gatilho !== null && espera !== null;

  const reset = () => {
    setNome("");
    setGatilho(null);
    setEspera(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!canSubmit || gatilho === null || espera === null) return;
    onCreate({
      nome: nome.trim(),
      gatilho,
      espera,
      canal: CANAL_FIXO,
      status: "ativo",
      mensagens: 1,
    });
    handleClose();
  };

  return (
    <AwModal
      open={open}
      onClose={handleClose}
      title="Criar follow-up"
      footer={
        <>
          <AwButton size="sm" variant="ghost" onClick={handleClose}>
            Cancelar
          </AwButton>
          <AwButton
            size="sm"
            variant="primary"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            Criar follow-up
          </AwButton>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <AwField label="Nome" htmlFor="followup-nome">
          <AwInput
            id="followup-nome"
            placeholder="Ex.: Sequência de inatividade"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </AwField>

        <AwField label="Gatilho" htmlFor="followup-gatilho">
          <AwDropdownMenu
            align="start"
            trigger={
              <AwSelect id="followup-gatilho" className="w-full justify-between">
                {gatilho ?? (
                  <span className="text-(--fg-tertiary)">
                    Selecione o gatilho
                  </span>
                )}
              </AwSelect>
            }
            items={GATILHOS.map((g) => ({
              id: g,
              label: g,
              checked: gatilho === g,
              onSelect: () => setGatilho(g),
            }))}
          />
        </AwField>

        <AwField label="Espera" htmlFor="followup-espera">
          <AwDropdownMenu
            align="start"
            trigger={
              <AwSelect id="followup-espera" className="w-full justify-between">
                {espera ?? (
                  <span className="text-(--fg-tertiary)">
                    Selecione o tempo de espera
                  </span>
                )}
              </AwSelect>
            }
            items={ESPERAS.map((e) => ({
              id: e,
              label: e,
              checked: espera === e,
              onSelect: () => setEspera(e),
            }))}
          />
        </AwField>

        <AwField
          label="Canal"
          helper="O envio acontece pelo canal conectado ao agente."
        >
          <div className="flex items-center gap-2 rounded-md border border-(--border-subtle) bg-(--bg-muted) px-3 py-2">
            <Icon name="chat" size={16} className="text-(--fg-tertiary)" />
            <span className="body-sm text-(--fg-primary)">{CANAL_FIXO}</span>
          </div>
        </AwField>
      </div>
    </AwModal>
  );
}

export function FollowUpTab({ data }: { data: AgentEditorData }) {
  const [rules, setRules] = useState<FollowUpRule[]>(data.followUps);
  const [createOpen, setCreateOpen] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FollowUpRule | null>(null);

  const addRule = (rule: Omit<FollowUpRule, "id">) => {
    setRules((prev) => [...prev, { ...rule, id: `fu-${Date.now()}` }]);
  };

  const toggleRule = (id: string, next: boolean) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: next ? "ativo" : "pausado" } : r
      )
    );
  };

  const duplicateRule = (rule: FollowUpRule) => {
    setRules((prev) => [
      ...prev,
      { ...rule, id: `fu-${Date.now()}`, nome: `${rule.nome} (cópia)` },
    ]);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setRules((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <>
      {rules.length === 0 ? (
        /* Estado vazio — centro da área da seção */
        <div className="flex min-h-[420px] items-center justify-center">
          <AwEmpty>
            <AwEmptyHeader>
              <AwEmptyTitle className="font-heading text-2xl font-medium tracking-tight text-(--fg-primary)">
                Crie seu primeiro follow-up
              </AwEmptyTitle>
              <AwEmptyDescription>
                Automatize o reengajamento de leads com inteligência
                artificial.
              </AwEmptyDescription>
            </AwEmptyHeader>
            <AwEmptyContent>
              <div className="flex flex-col items-center gap-3">
                <AwButton
                  variant="primary"
                  size="md"
                  onClick={() => setCreateOpen(true)}
                >
                  Criar follow-up
                </AwButton>
                <AwButton
                  variant="secondary"
                  size="md"
                  iconLeft="help"
                  onClick={() => setHowOpen(true)}
                >
                  Como funciona
                </AwButton>
              </div>
            </AwEmptyContent>
          </AwEmpty>
        </div>
      ) : (
        /* Estado populado — lista de regras */
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-4">
            <p className="body-sm text-(--fg-tertiary)">
              {rules.length} {rules.length === 1 ? "regra ativa" : "regras"} de
              follow-up neste agente.
            </p>
            <div className="flex items-center gap-2">
              <AwButton
                variant="ghost"
                size="sm"
                iconLeft="help"
                onClick={() => setHowOpen(true)}
              >
                Como funciona
              </AwButton>
              <AwButton
                variant="primary"
                size="sm"
                iconLeft="add"
                onClick={() => setCreateOpen(true)}
              >
                Criar follow-up
              </AwButton>
            </div>
          </div>

          <ul className="flex flex-col gap-3">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className="flex items-center gap-5 rounded-xl border border-(--border-subtle) bg-(--bg-surface) px-5 py-4 transition-colors duration-aw-fast hover:border-(--border-default)"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2.5">
                    <span className="truncate body-sm font-medium text-(--fg-primary)">
                      {rule.nome}
                    </span>
                    <AwPill
                      variant={rule.status === "ativo" ? "live" : "neutral"}
                    >
                      {rule.status === "ativo" ? "Ativo" : "Pausado"}
                    </AwPill>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 body-xs text-(--fg-tertiary)">
                    <span className="inline-flex items-center gap-1">
                      <Icon name="bolt" size={14} />
                      {rule.gatilho}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Icon name="schedule" size={14} />
                      {rule.espera}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Icon name="chat" size={14} />
                      {rule.canal}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Icon name="forum" size={14} />
                      {rule.mensagens}{" "}
                      {rule.mensagens === 1 ? "mensagem" : "mensagens"}
                    </span>
                  </div>
                </div>

                <AwToggle
                  checked={rule.status === "ativo"}
                  onChange={(next) => toggleRule(rule.id, next)}
                  label={`${rule.status === "ativo" ? "Pausar" : "Ativar"} ${rule.nome}`}
                />

                <AwDropdownMenu
                  aria-label={`Ações de ${rule.nome}`}
                  trigger={
                    <AwButton
                      variant="ghost"
                      size="sm"
                      iconOnly="more_vert"
                      aria-label={`Abrir ações de ${rule.nome}`}
                    />
                  }
                  items={[
                    {
                      id: "duplicar",
                      label: "Duplicar",
                      icon: "content_copy",
                      onSelect: () => duplicateRule(rule),
                    },
                    { id: "sep", separator: true as const },
                    {
                      id: "excluir",
                      label: "Excluir",
                      icon: "delete",
                      danger: true,
                      onSelect: () => setDeleteTarget(rule),
                    },
                  ]}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <CreateFollowUpModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={addRule}
      />

      {/* Como funciona — 3 passos */}
      <AwModal
        open={howOpen}
        onClose={() => setHowOpen(false)}
        title="Como funcionam os follow-ups"
        footer={
          <AwButton
            size="sm"
            variant="primary"
            onClick={() => setHowOpen(false)}
          >
            Entendi
          </AwButton>
        }
      >
        <div className="flex flex-col gap-5">
          <p className="m-0 body-xs text-(--fg-secondary)">
            Cada regra de follow-up segue três etapas. Você define os
            parâmetros e o agente conduz o reengajamento sozinho.
          </p>
          <ol className="m-0 flex list-none flex-col gap-4 p-0">
            {COMO_FUNCIONA_PASSOS.map((passo, i) => (
              <li key={passo.titulo} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--bg-muted) text-(--fg-primary)">
                  <Icon name={passo.icon} size={18} />
                </span>
                <div className="min-w-0">
                  <p className="m-0 body-sm font-medium text-(--fg-primary)">
                    {i + 1}. {passo.titulo}
                  </p>
                  <p className="m-0 mt-0.5 body-xs text-(--fg-secondary)">
                    {passo.descricao}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </AwModal>

      {/* Confirmação de exclusão */}
      <AwModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Excluir follow-up"
        footer={
          <>
            <AwButton
              size="sm"
              variant="ghost"
              onClick={() => setDeleteTarget(null)}
            >
              Cancelar
            </AwButton>
            <AwButton size="sm" variant="danger" onClick={confirmDelete}>
              Excluir
            </AwButton>
          </>
        }
      >
        <p className="m-0 body-sm text-(--fg-secondary)">
          A regra{" "}
          <strong className="font-medium text-(--fg-primary)">
            {deleteTarget?.nome}
          </strong>{" "}
          deixará de ser executada e será removida deste agente. Essa ação não
          pode ser desfeita.
        </p>
      </AwModal>
    </>
  );
}
