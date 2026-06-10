"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { AwButton } from "@/components/ui/AwButton";
import { AwModal } from "@/components/ui/AwModal";
import { AwInput } from "@/components/ui/AwInput";
import { AwToggle } from "@/components/ui/AwToggle";
import { AwSelect } from "@/components/ui/AwSelect";
import { AwDropdownMenu } from "@/components/ui/AwDropdownMenu";
import { AwUserAgentOrb } from "@/components/ui/AwUserAgentOrb";
import type { TokenClick } from "@/components/agent-studio/editor/CheckpointRichText";
import { stripVariableBraces } from "@/components/agent-studio/editor/checkpointTokens";
import {
  SKILL_TONE_CLASSES,
  getSkillGroup,
  skillTone,
  type AgentVariable,
  type HabilidadeConfigurada,
} from "@/lib/agentStudio";
import type { ConsistencyCheck } from "./consistency";

/**
 * Modais do editor de checkpoints:
 *   - ChipPropertiesModal: propriedades de um chip clicado no texto
 *     (tool, AOP ou variável) com campos de configuração por tipo;
 *   - ConsistencyModal: verificação de consistência ao salvar — o agente
 *     analisa o documento e o usuário confirma a publicação do rascunho.
 */

/* ─── Propriedades por tipo de chip ────────────────────────────────────── */

type FieldDef =
  | { key: string; label: string; type: "text"; placeholder?: string }
  | { key: string; label: string; type: "select"; options: string[] }
  | { key: string; label: string; type: "toggle" };

const SKILL_FIELDS: Record<string, FieldDef[]> = {
  "agent.handoffToHuman": [
    {
      key: "equipe",
      label: "Equipe de destino",
      type: "select",
      options: ["Suporte", "Comercial", "Financeiro"],
    },
    { key: "resumo", label: "Enviar resumo da conversa", type: "toggle" },
    {
      key: "mensagem",
      label: "Mensagem de transição",
      type: "text",
      placeholder: "Vou te passar para uma pessoa do time…",
    },
  ],
  "agent.handoffToAgent": [
    {
      key: "agente",
      label: "Agente de destino",
      type: "select",
      options: ["Agente de vendas", "Agente de suporte", "Agente de RH"],
    },
    { key: "resumo", label: "Enviar resumo da conversa", type: "toggle" },
  ],
  "agent.memorize": [
    {
      key: "escopo",
      label: "Escopo da memória",
      type: "select",
      options: ["Este lead", "Todos os atendimentos"],
    },
  ],
  "agent.updateStatus": [
    {
      key: "campo",
      label: "Campo atualizado",
      type: "select",
      options: ["Status do lead", "Estágio do funil", "Ambos"],
    },
  ],
  "flow.wait": [
    {
      key: "duracao",
      label: "Tempo de espera",
      type: "text",
      placeholder: "24 horas",
    },
  ],
  "flow.waitForUser": [
    {
      key: "timeout",
      label: "Aguardar por até",
      type: "text",
      placeholder: "48 horas",
    },
    { key: "followup", label: "Acionar follow-up ao expirar", type: "toggle" },
  ],
  "googlecal.createEvent": [
    {
      key: "agenda",
      label: "Agenda",
      type: "select",
      options: ["Agenda comercial", "Agenda pessoal"],
    },
    {
      key: "duracao",
      label: "Duração padrão",
      type: "text",
      placeholder: "30 min",
    },
    { key: "convite", label: "Enviar convite ao lead", type: "toggle" },
  ],
  "googlecal.checkAvailability": [
    {
      key: "janela",
      label: "Janela de busca",
      type: "select",
      options: ["Próximos 3 dias", "Próximos 7 dias", "Próximos 14 dias"],
    },
  ],
  "pipedrive.updateDeal": [
    {
      key: "funil",
      label: "Funil",
      type: "select",
      options: ["Funil de vendas", "Funil de reativação"],
    },
  ],
};

const VARIABLE_FIELDS: FieldDef[] = [
  {
    key: "fallback",
    label: "Valor de fallback",
    type: "text",
    placeholder: "usado quando o dado não está disponível",
  },
];

/* ─── Modal de propriedades do chip ────────────────────────────────────── */

export function ChipPropertiesModal({
  token,
  habilidades,
  variaveis,
  values,
  onSave,
  onClose,
  agentId,
}: {
  token: TokenClick | null;
  habilidades: HabilidadeConfigurada[];
  variaveis: AgentVariable[];
  /** Valores atuais por id de chip (tool id ou nome de variável). */
  values: Record<string, Record<string, string>>;
  onSave: (chipId: string, values: Record<string, string>) => void;
  onClose: () => void;
  agentId: string;
}) {
  const hab =
    token?.kind === "mention"
      ? habilidades.find((h) => h.id === token.id)
      : undefined;
  const variavel =
    token?.kind === "variable"
      ? variaveis.find(
          (v) => stripVariableBraces(v.nome) === token.name,
        )
      : undefined;

  const chipId =
    token?.kind === "mention" ? token.id : token ? `var:${token.name}` : "";
  const fields =
    token?.kind === "mention"
      ? (SKILL_FIELDS[token.id] ?? [])
      : VARIABLE_FIELDS;
  const isAop = token?.kind === "mention" && token.id.startsWith("aop.");

  const [draft, setDraft] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    if (token) setDraft(values[chipId] ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chipId, token === null]);

  const grupo = hab ? getSkillGroup(hab.grupo) : undefined;
  const tone = token?.kind === "mention" ? skillTone(hab) : null;

  const titulo =
    token?.kind === "mention"
      ? (hab?.nome ?? token.id)
      : token
        ? token.name
        : "";

  return (
    <AwModal open={token !== null} onClose={onClose}>
      {token && (
        <div className="pb-1">
          {/* Header de identidade do chip */}
          <div className="flex items-center gap-3.5">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                tone
                  ? SKILL_TONE_CLASSES[tone].tile
                  : "bg-(--bg-hover) text-(--fg-secondary)"
              }`}
            >
              <Icon
                name={
                  token.kind === "mention"
                    ? (hab?.icon ?? "alternate_email")
                    : "data_object"
                }
                size={22}
              />
            </span>
            <div className="min-w-0">
              <h2 className="truncate font-heading text-lg font-medium text-(--fg-primary)">
                {titulo}
              </h2>
              <p className="truncate text-[13px] text-(--aw-blue-600)">
                {token.kind === "mention"
                  ? `@${token.id}`
                  : `{{${token.name}}}`}
                {grupo && (
                  <span className="ml-2 text-(--fg-tertiary)">
                    · {grupo.nome}
                  </span>
                )}
                {variavel && (
                  <span className="ml-2 text-(--fg-tertiary)">
                    · {variavel.tipo}
                  </span>
                )}
              </p>
            </div>
          </div>

          <p className="mt-3.5 text-sm leading-relaxed text-(--fg-secondary)">
            {token.kind === "mention"
              ? (hab?.descricao ??
                "Esta menção não está conectada a nenhuma tool do agente.")
              : (variavel?.descricao ??
                "Variável criada neste documento — fica disponível para o agente.")}
          </p>

          {/* AOP: atalho para o protocolo completo */}
          {isAop && (
            <Link
              href={`/agent-studio/${agentId}?tab=aops`}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-(--fg-primary) underline-offset-4 hover:underline"
            >
              Abrir protocolo na interface de AOPs
              <Icon name="arrow_outward" size={15} />
            </Link>
          )}

          {/* Campos de configuração */}
          {fields.length > 0 && (
            <div className="mt-5 space-y-4 border-t border-(--border-subtle) pt-5">
              {fields.map((field) => (
                <div key={field.key}>
                  {field.type === "toggle" ? (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm text-(--fg-primary)">
                        {field.label}
                      </span>
                      <AwToggle
                        checked={draft[field.key] === "sim"}
                        onChange={(next) =>
                          setDraft((d) => ({
                            ...d,
                            [field.key]: next ? "sim" : "não",
                          }))
                        }
                        aria-label={field.label}
                      />
                    </div>
                  ) : (
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium text-(--fg-secondary)">
                        {field.label}
                      </span>
                      {field.type === "select" ? (
                        <AwDropdownMenu
                          aria-label={field.label}
                          trigger={
                            <AwSelect className="w-full">
                              {draft[field.key] ?? field.options[0]}
                            </AwSelect>
                          }
                          items={field.options.map((opt) => ({
                            id: opt,
                            label: opt,
                            onSelect: () =>
                              setDraft((d) => ({ ...d, [field.key]: opt })),
                          }))}
                        />
                      ) : (
                        <AwInput
                          value={draft[field.key] ?? ""}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              [field.key]: e.target.value,
                            }))
                          }
                          placeholder={field.placeholder}
                          aria-label={field.label}
                        />
                      )}
                    </label>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-2">
            <AwButton variant="ghost" size="md" onClick={onClose}>
              Fechar
            </AwButton>
            {fields.length > 0 && (
              <AwButton
                variant="primary"
                size="md"
                onClick={() => {
                  onSave(chipId, draft);
                  onClose();
                }}
              >
                Salvar propriedades
              </AwButton>
            )}
          </div>
        </div>
      )}
    </AwModal>
  );
}

/* ─── Modal de verificação de consistência ─────────────────────────────── */

export function ConsistencyModal({
  open,
  agentId,
  checks,
  onConfirm,
  onClose,
}: {
  open: boolean;
  agentId: string;
  checks: ConsistencyCheck[];
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [phase, setPhase] = React.useState<"checking" | "done">("checking");

  React.useEffect(() => {
    if (!open) return;
    setPhase("checking");
    const timer = window.setTimeout(() => setPhase("done"), 1700);
    return () => window.clearTimeout(timer);
  }, [open]);

  const warns = checks.filter((c) => c.status === "warn").length;

  return (
    <AwModal open={open} onClose={onClose}>
      <div className="pb-1">
        <div className="flex items-center gap-3.5">
          <AwUserAgentOrb
            seed={agentId}
            size={44}
            state={phase === "checking" ? "thinking" : "idle"}
          />
          <div className="min-w-0">
            <h2 className="font-heading text-lg font-medium text-(--fg-primary)">
              {phase === "checking"
                ? "Verificando consistência…"
                : warns === 0
                  ? "Tudo consistente"
                  : `${warns} ${warns === 1 ? "ponto de atenção" : "pontos de atenção"}`}
            </h2>
            <p className="text-sm text-(--fg-tertiary)">
              {phase === "checking"
                ? "O agente está lendo as instruções, regras e menções."
                : "Ao confirmar, o fluxo fica disponível na visualização modular."}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-1">
          {phase === "checking"
            ? checks.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 rounded-lg px-2 py-2"
                >
                  <span className="h-4 w-4 shrink-0 animate-pulse rounded-full bg-(--bg-muted)" />
                  <span className="h-3.5 flex-1 animate-pulse rounded bg-(--bg-muted)" />
                </div>
              ))
            : checks.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors duration-aw-fast hover:bg-(--bg-hover)/60"
                >
                  <Icon
                    name={c.status === "ok" ? "check_circle" : "error"}
                    size={18}
                    className={`mt-px shrink-0 ${
                      c.status === "ok"
                        ? "text-(--aw-emerald-600)"
                        : "text-(--aw-amber-600)"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm leading-snug text-(--fg-primary)">
                      {c.titulo}
                    </p>
                    {c.detalhe && (
                      <p className="mt-0.5 text-xs leading-relaxed text-(--fg-tertiary)">
                        {c.detalhe}
                      </p>
                    )}
                  </div>
                </div>
              ))}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <AwButton
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={phase === "checking"}
          >
            Voltar e ajustar
          </AwButton>
          <AwButton
            variant="primary"
            size="md"
            iconLeft="check"
            onClick={onConfirm}
            disabled={phase === "checking"}
          >
            Confirmar e salvar
          </AwButton>
        </div>
      </div>
    </AwModal>
  );
}
