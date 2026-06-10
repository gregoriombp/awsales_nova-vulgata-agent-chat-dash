"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AwButton } from "@/components/ui/AwButton";
import { AwInput, AwField } from "@/components/ui/AwInput";
import { AwModal } from "@/components/ui/AwModal";
import { useToast } from "@/components/ui/AwToast";
import {
  type AgentEditorData,
  type AgentStatus,
} from "@/lib/agentStudio";
import {
  clearAgentDraft,
  loadAgentListOverrides,
  saveAgentListOverrides,
  type AgentListOverrides,
} from "@/lib/agentStudioStore";

/**
 * Preferências — configurações gerais do agente.
 *
 * Linhas de configuração (rótulo + descrição à esquerda, controle à direita):
 * status inicial, informações sociais e zona de risco. "Salvar alterações"
 * só habilita quando algo diverge dos valores salvos.
 */

type StatusInicial = "ativo" | "suspenso" | "inativo";

const STATUS_OPTIONS: {
  id: StatusInicial;
  label: string;
  descricao: string;
}[] = [
  {
    id: "ativo",
    label: "Ativo",
    descricao:
      "O agente opera normalmente. Se houver uma programação de início configurada, ela é executada de forma automática.",
  },
  {
    id: "suspenso",
    label: "Suspenso",
    descricao:
      "O agente não inicia novos contatos, mas continua respondendo as conversas que já estavam em andamento.",
  },
  {
    id: "inativo",
    label: "Inativo",
    descricao:
      "O agente fica totalmente desativado: não inicia novas conversas nem responde as existentes.",
  },
];

function statusInicialFrom(status: AgentStatus): StatusInicial {
  if (status === "active") return "ativo";
  if (status === "paused") return "suspenso";
  return "inativo";
}

// O registry só tem active/draft/paused — na listagem, suspenso e inativo
// aparecem ambos como "Pausado".
const STATUS_PARA_LISTAGEM: Record<StatusInicial, AgentStatus> = {
  ativo: "active",
  suspenso: "paused",
  inativo: "paused",
};

function mutateListOverrides(
  fn: (o: AgentListOverrides) => AgentListOverrides,
): void {
  saveAgentListOverrides(fn(loadAgentListOverrides()));
}

export function PreferenciasTab({ data }: { data: AgentEditorData }) {
  const router = useRouter();
  const { push } = useToast();
  const defaults = React.useMemo(
    () => ({
      status: statusInicialFrom(data.agent.status),
      nomeSocial: data.social.nomeSocial,
      empresa: data.social.empresa,
    }),
    [data]
  );

  // Baseline = último estado salvo (começa nos dados do agente).
  const [baseline, setBaseline] = React.useState(defaults);
  const [status, setStatus] = React.useState(defaults.status);
  const [nomeSocial, setNomeSocial] = React.useState(defaults.nomeSocial);
  const [empresa, setEmpresa] = React.useState(defaults.empresa);

  const [saved, setSaved] = React.useState(false);
  const savedTimer = React.useRef<number | null>(null);
  React.useEffect(
    () => () => {
      if (savedTimer.current !== null) window.clearTimeout(savedTimer.current);
    },
    []
  );

  const [archiveOpen, setArchiveOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const dirty =
    status !== baseline.status ||
    nomeSocial !== baseline.nomeSocial ||
    empresa !== baseline.empresa;

  function handleSave() {
    setBaseline({ status, nomeSocial, empresa });
    // Reflete o status salvo na listagem (/agent-studio).
    mutateListOverrides((o) => ({
      ...o,
      statusOverrides: {
        ...o.statusOverrides,
        [data.agent.id]: STATUS_PARA_LISTAGEM[status],
      },
    }));
    setSaved(true);
    if (savedTimer.current !== null) window.clearTimeout(savedTimer.current);
    savedTimer.current = window.setTimeout(() => setSaved(false), 2000);
  }

  function handleArchive() {
    setArchiveOpen(false);
    mutateListOverrides((o) => ({
      ...o,
      archived: [...o.archived, data.agent.id],
    }));
    push({
      title: "Agente arquivado",
      description: `“${data.agent.title}” saiu da listagem e parou de operar.`,
      action: {
        label: "Desfazer",
        onClick: () =>
          mutateListOverrides((o) => ({
            ...o,
            archived: o.archived.filter((id) => id !== data.agent.id),
          })),
      },
    });
    router.push("/agent-studio");
  }

  function handleDelete() {
    setDeleteOpen(false);
    clearAgentDraft(data.agent.id);
    mutateListOverrides((o) => ({
      ...o,
      removed: [...o.removed, data.agent.id],
    }));
    // Sem "Desfazer": o modal promete exclusão permanente — arquivar é o
    // caminho restaurável.
    push({
      title: "Agente excluído",
      description: `“${data.agent.title}” e todas as configurações dele foram removidos.`,
    });
    router.push("/agent-studio");
  }

  return (
    <div>
      {/* Status inicial */}
      <SettingRow
        title="Status inicial do agente"
        description="Defina como o agente entra em operação. Você pode alterar este status a qualquer momento."
      >
        <div
          role="radiogroup"
          aria-label="Status inicial do agente"
          className="space-y-5"
        >
          {STATUS_OPTIONS.map((option) => {
            const checked = status === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => setStatus(option.id)}
                className="group flex w-full items-start gap-3 text-left"
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-(--bg-raised) transition-colors duration-aw-fast ${
                    checked
                      ? "border-(--fg-primary)"
                      : "border-(--border-default) group-hover:border-(--fg-primary)"
                  }`}
                >
                  {checked && (
                    <span className="h-2 w-2 rounded-full bg-(--fg-primary)" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-(--fg-primary)">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-(--fg-tertiary)">
                    {option.descricao}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </SettingRow>

      {/* Informações sociais */}
      <SettingRow
        title="Informações sociais"
        description="Configure o nome do agente e o nome da empresa exibidos nas conversas."
      >
        <div className="max-w-[480px] space-y-6">
          <AwField
            label="Nome social do agente"
            htmlFor="pref-nome-social"
            helper="Este nome será utilizado nas conversas do seu agente."
          >
            <AwInput
              id="pref-nome-social"
              value={nomeSocial}
              onChange={(e) => setNomeSocial(e.target.value)}
              placeholder="Insira o nome social do agente"
            />
          </AwField>
          <AwField
            label="Nome da empresa"
            htmlFor="pref-empresa"
            helper="Este nome será utilizado nas conversas do seu agente."
          >
            <AwInput
              id="pref-empresa"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              placeholder="Insira o nome da empresa"
            />
          </AwField>
        </div>
      </SettingRow>

      {/* Salvar */}
      <div className="flex justify-end border-t border-(--border-subtle) py-6">
        <AwButton
          variant="primary"
          size="md"
          iconLeft={saved ? "check" : undefined}
          disabled={!dirty}
          onClick={handleSave}
        >
          {saved ? "Salvo" : "Salvar alterações"}
        </AwButton>
      </div>

      {/* Zona de risco */}
      <section className="mt-10 rounded-xl border border-(--border-subtle) bg-(--bg-surface) p-6">
        <h3 className="text-sm font-medium text-(--fg-primary)">
          Zona de risco
        </h3>
        <p className="mt-1 text-sm text-(--fg-tertiary)">
          Ações permanentes ou de grande impacto sobre este agente.
        </p>

        <div className="mt-5 divide-y divide-(--border-subtle)">
          <RiskRow
            title="Arquivar agente"
            description="O agente sai da listagem e para de operar. Você pode restaurá-lo quando quiser."
            action={
              <AwButton
                variant="secondary"
                size="sm"
                iconLeft="archive"
                onClick={() => setArchiveOpen(true)}
              >
                Arquivar
              </AwButton>
            }
          />
          <RiskRow
            title="Excluir agente"
            description="Remove o agente e todas as configurações dele de forma permanente. Esta ação não pode ser desfeita."
            action={
              <AwButton
                variant="danger"
                size="sm"
                iconLeft="delete"
                onClick={() => setDeleteOpen(true)}
              >
                Excluir
              </AwButton>
            }
          />
        </div>
      </section>

      {/* Confirmação — arquivar */}
      <AwModal
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        title="Arquivar agente"
        footer={
          <>
            <AwButton variant="ghost" onClick={() => setArchiveOpen(false)}>
              Cancelar
            </AwButton>
            <AwButton
              variant="primary"
              iconLeft="archive"
              onClick={handleArchive}
            >
              Arquivar agente
            </AwButton>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-(--fg-secondary)">
          O agente <strong>{data.agent.title}</strong> sai da listagem e para
          de operar. As configurações ficam guardadas e você pode restaurá-lo
          quando quiser.
        </p>
      </AwModal>

      {/* Confirmação — excluir */}
      <AwModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Excluir agente"
        footer={
          <>
            <AwButton variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </AwButton>
            <AwButton
              variant="danger"
              iconLeft="delete"
              onClick={handleDelete}
            >
              Excluir agente
            </AwButton>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-(--fg-secondary)">
          O agente <strong>{data.agent.title}</strong> e todas as configurações
          dele serão removidos de forma permanente. Esta ação não pode ser
          desfeita.
        </p>
      </AwModal>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
 * Blocos internos
 * ───────────────────────────────────────────────────────────────────────── */

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-12 border-b border-(--border-subtle) py-8 first:pt-2">
      <div>
        <h3 className="text-sm font-medium text-(--fg-primary)">{title}</h3>
        <p className="mt-1 max-w-[320px] text-sm leading-relaxed text-(--fg-tertiary)">
          {description}
        </p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function RiskRow({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-(--fg-primary)">{title}</p>
        <p className="mt-0.5 text-sm text-(--fg-tertiary)">{description}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}
