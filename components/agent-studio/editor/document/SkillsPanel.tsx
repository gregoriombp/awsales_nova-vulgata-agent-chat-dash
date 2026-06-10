"use client";

import * as React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { AwButton } from "@/components/ui/AwButton";
import { AwInput } from "@/components/ui/AwInput";
import { AwBrandLogo } from "@/components/ui/AwBrandLogo";
import {
  AwAddIntegrationModal,
  type AwAddIntegrationItem,
} from "@/components/ui/AwAddIntegrationModal";
import { SKILL_DRAG_MIME } from "@/components/agent-studio/editor/CheckpointRichText";
import { sanitizeVariableName } from "@/components/agent-studio/editor/checkpointTokens";
import {
  SKILL_TONE_CLASSES,
  type AgentVariable,
  type SkillGroup,
} from "@/lib/agentStudio";

/**
 * Painel lateral do editor de checkpoints — a DSL do agente em quatro
 * camadas: Tools nativas (Agente + Fluxo), Integrações, AOPs (protocolos
 * personalizados) e Variáveis (dados do agente, do lead e da conversa).
 *
 * Cada card insere o chip no texto de duas formas: clique (na posição do
 * cursor do editor ativo) ou drag and drop no ponto exato do texto.
 */

/* ─── Catálogo do modal "Adicionar integração" ─────────────────────────── */

const INTEGRATION_CATEGORIES = [
  { id: "crm", label: "CRM" },
  { id: "agenda", label: "Agenda" },
  { id: "vendas", label: "Vendas" },
  { id: "comunicacao", label: "Comunicação" },
];

const INTEGRATION_CATALOG: AwAddIntegrationItem[] = [
  {
    id: "hubspot",
    brand: "hubspot",
    name: "HubSpot",
    description: "Sincronize contatos e negócios do CRM.",
    category: "crm",
  },
  {
    id: "kommo",
    brand: "kommo",
    name: "Kommo",
    description: "Atualize leads e funis de conversa.",
    category: "crm",
  },
  {
    id: "rdstation",
    brand: "rdstation",
    name: "RD Station",
    description: "Marque oportunidades e dispare automações.",
    category: "crm",
  },
  {
    id: "calendly",
    brand: "calendly",
    name: "Calendly",
    description: "Ofereça horários e confirme reuniões.",
    category: "agenda",
  },
  {
    id: "stripe",
    brand: "stripe",
    name: "Stripe",
    description: "Consulte pagamentos e assinaturas.",
    category: "vendas",
  },
  {
    id: "hotmart",
    brand: "hotmart",
    name: "Hotmart",
    description: "Acompanhe compras e reembolsos.",
    category: "vendas",
  },
  {
    id: "typeform",
    brand: "typeform",
    name: "Typeform",
    description: "Leia respostas de formulários do lead.",
    category: "vendas",
  },
  {
    id: "slack",
    brand: "slack",
    name: "Slack",
    description: "Notifique o time sobre momentos da conversa.",
    category: "comunicacao",
  },
];

/** Habilidades default de uma integração recém-conectada (demo). */
export function defaultIntegrationGroup(
  item: AwAddIntegrationItem,
): SkillGroup {
  const ns = item.id.replace(/-/g, "");
  return {
    id: item.id,
    nome: item.name,
    descricao: `Habilidades do ${item.name} disponíveis.`,
    icon: "cable",
    tone: "blue",
    brand: item.brand,
    skills: [
      {
        id: `${ns}.sync`,
        nome: `Enviar dados ao ${item.name}`,
        descricao: "Registra o momento da conversa na integração.",
        grupo: item.id,
        icon: "upload",
      },
      {
        id: `${ns}.fetch`,
        nome: `Consultar ${item.name}`,
        descricao: "Busca dados da integração durante a conversa.",
        grupo: item.id,
        icon: "download",
      },
    ],
  };
}

/* ─── Blocos do painel ─────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-medium uppercase tracking-[0.08em] text-(--fg-tertiary)">
      {children}
    </h3>
  );
}

function SkillCard({
  skill,
  tone,
  onInsert,
}: {
  skill: SkillGroup["skills"][number];
  tone: SkillGroup["tone"];
  onInsert: (id: string) => void;
}) {
  const [dragging, setDragging] = React.useState(false);
  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(SKILL_DRAG_MIME, skill.id);
        e.dataTransfer.setData("text/plain", `@[${skill.id}]`);
        e.dataTransfer.effectAllowed = "copy";
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
      onClick={() => onInsert(skill.id)}
      title={`${skill.descricao} Clique para inserir — ou arraste para o ponto exato do texto.`}
      className={`group/skill flex w-full cursor-grab items-center gap-3 rounded-lg px-2 py-2 text-left transition-[background-color,opacity] duration-aw-fast hover:bg-(--bg-hover) active:cursor-grabbing ${
        dragging ? "opacity-40" : ""
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${SKILL_TONE_CLASSES[tone].tile}`}
      >
        <Icon name={skill.icon ?? "bolt"} size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-(--fg-primary)">
          {skill.nome}
        </span>
        <span className="block truncate text-[11px] text-(--aw-blue-600)">
          @{skill.id}
        </span>
      </span>
      <Icon
        name="drag_indicator"
        size={16}
        className="shrink-0 text-(--fg-tertiary) opacity-0 transition-opacity duration-aw-fast group-hover/skill:opacity-100"
      />
    </button>
  );
}

function SkillGroupBlock({
  group,
  expanded,
  onToggle,
  onInsert,
}: {
  group: SkillGroup;
  expanded: boolean;
  onToggle: () => void;
  onInsert: (id: string) => void;
}) {
  const sections = React.useMemo(() => {
    const bySection = new Map<string, SkillGroup["skills"]>();
    for (const s of group.skills) {
      const key = s.subgrupo ?? "";
      if (!bySection.has(key)) bySection.set(key, []);
      bySection.get(key)!.push(s);
    }
    return [...bySection.entries()];
  }, [group.skills]);

  return (
    <div>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={onToggle}
        className="-mx-2 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors duration-aw-fast hover:bg-(--bg-hover)"
      >
        {group.brand ? (
          <AwBrandLogo
            brand={group.brand}
            size="sm"
            style={{ width: 32, height: 32, borderRadius: 8 }}
          />
        ) : (
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${SKILL_TONE_CLASSES[group.tone].tile}`}
          >
            <Icon name={group.icon} size={17} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-(--fg-primary)">
            {group.nome}
          </span>
          <span className="block truncate text-xs text-(--fg-tertiary)">
            {group.descricao}
          </span>
        </span>
        <Icon
          name={expanded ? "expand_less" : "expand_more"}
          size={18}
          className="shrink-0 text-(--fg-tertiary)"
        />
      </button>

      {expanded && (
        <div className="mt-0.5 space-y-px pl-1">
          {sections.map(([label, skills]) => (
            <React.Fragment key={label || "principal"}>
              {label && (
                <p className="px-2 pb-1 pt-2.5 text-[11px] font-medium text-(--fg-tertiary)">
                  {label}
                </p>
              )}
              {skills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  tone={group.tone}
                  onInsert={onInsert}
                />
              ))}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Painel ───────────────────────────────────────────────────────────── */

export function SkillsPanel({
  agentId,
  groups,
  variaveis,
  onInsertSkill,
  onInsertVariable,
  onCreateVariable,
  onAddIntegration,
}: {
  agentId: string;
  groups: SkillGroup[];
  variaveis: AgentVariable[];
  onInsertSkill: (id: string) => void;
  onInsertVariable: (nome: string) => void;
  onCreateVariable: (nome: string) => void;
  onAddIntegration: (group: SkillGroup) => void;
}) {
  const [expanded, setExpanded] = React.useState<Set<string>>(
    () => new Set(["agente", "aops"]),
  );
  const [integrationsOpen, setIntegrationsOpen] = React.useState(false);
  const [varFormOpen, setVarFormOpen] = React.useState(false);
  const [varName, setVarName] = React.useState("");

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const tools = groups.filter((g) => !g.brand && g.id !== "aops");
  const aops = groups.find((g) => g.id === "aops");
  const integracoes = groups.filter((g) => Boolean(g.brand));

  const connectedIds = new Set(groups.map((g) => g.id));
  const catalog = INTEGRATION_CATALOG.filter((i) => !connectedIds.has(i.id));

  const variaveisPorGrupo = React.useMemo(() => {
    const byGroup = new Map<string, AgentVariable[]>();
    for (const v of variaveis) {
      const key = v.grupo ?? "Personalizadas";
      if (!byGroup.has(key)) byGroup.set(key, []);
      byGroup.get(key)!.push(v);
    }
    return [...byGroup.entries()];
  }, [variaveis]);

  const submitVariable = () => {
    const nome = sanitizeVariableName(varName);
    if (!nome) return;
    onCreateVariable(nome);
    setVarName("");
    setVarFormOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Tools nativas */}
      <section>
        <div className="flex items-baseline justify-between gap-3">
          <SectionLabel>Tools</SectionLabel>
          <p className="text-[11px] text-(--fg-tertiary)">
            clique ou arraste para o texto
          </p>
        </div>
        <div className="mt-2.5 space-y-1">
          {tools.map((group) => (
            <SkillGroupBlock
              key={group.id}
              group={group}
              expanded={expanded.has(group.id)}
              onToggle={() => toggle(group.id)}
              onInsert={onInsertSkill}
            />
          ))}
        </div>
      </section>

      {/* Integrações */}
      <section>
        <SectionLabel>Integrações</SectionLabel>
        <div className="mt-2.5 space-y-1">
          {integracoes.map((group) => (
            <SkillGroupBlock
              key={group.id}
              group={group}
              expanded={expanded.has(group.id)}
              onToggle={() => toggle(group.id)}
              onInsert={onInsertSkill}
            />
          ))}
        </div>
        <AwButton
          variant="ghost"
          size="sm"
          iconLeft="add"
          className="mt-1.5"
          onClick={() => setIntegrationsOpen(true)}
        >
          Adicionar integração
        </AwButton>
      </section>

      {/* AOPs */}
      {aops && (
        <section>
          <div className="flex items-baseline justify-between gap-3">
            <SectionLabel>AOPs</SectionLabel>
            <Link
              href={`/agent-studio/${agentId}?tab=aops`}
              className="text-[11px] font-medium text-(--fg-secondary) underline-offset-4 transition-colors duration-aw-fast hover:text-(--fg-primary) hover:underline"
            >
              Gerenciar
            </Link>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-(--fg-tertiary)">
            Protocolos personalizados da sua equipe — mencione no texto para o
            agente seguir o procedimento.
          </p>
          <div className="mt-2 space-y-px">
            {aops.skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                tone={aops.tone}
                onInsert={onInsertSkill}
              />
            ))}
          </div>
        </section>
      )}

      {/* Variáveis */}
      <section>
        <SectionLabel>Variáveis</SectionLabel>
        <p className="mt-1 text-xs leading-relaxed text-(--fg-tertiary)">
          {"Dados do lead e da conversa — clique ou digite {{ no texto."}
        </p>
        <div className="mt-2.5 space-y-3">
          {variaveisPorGrupo.map(([grupo, vars]) => (
            <div key={grupo}>
              <p className="pb-1.5 text-[11px] font-medium text-(--fg-tertiary)">
                {grupo}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {vars.map((v) => {
                  const nome = v.nome.replace(/[{}]/g, "");
                  return (
                    <button
                      key={v.nome}
                      type="button"
                      onClick={() => onInsertVariable(nome)}
                      title={v.descricao}
                      className="inline-flex items-center gap-1 rounded-md bg-(--bg-hover) px-2 py-1 text-xs font-medium text-(--fg-secondary) transition-colors duration-aw-fast hover:bg-(--bg-selected) hover:text-(--fg-primary)"
                    >
                      <Icon name="data_object" size={12} />
                      {nome}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {varFormOpen ? (
          <div className="mt-2.5 flex items-center gap-1.5">
            <AwInput
              dense
              autoFocus
              value={varName}
              onChange={(e) => setVarName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitVariable();
                if (e.key === "Escape") setVarFormOpen(false);
              }}
              placeholder="nome_da_variavel"
              aria-label="Nome da nova variável"
              className="flex-1"
            />
            <AwButton variant="secondary" size="sm" onClick={submitVariable}>
              Criar
            </AwButton>
          </div>
        ) : (
          <AwButton
            variant="ghost"
            size="sm"
            iconLeft="add"
            className="mt-2"
            onClick={() => setVarFormOpen(true)}
          >
            Adicionar variável
          </AwButton>
        )}
      </section>

      <AwAddIntegrationModal
        open={integrationsOpen}
        onClose={() => setIntegrationsOpen(false)}
        title="Adicionar integração"
        categories={INTEGRATION_CATEGORIES}
        items={catalog}
        onSelect={(id) => {
          const item = INTEGRATION_CATALOG.find((i) => i.id === id);
          if (item) onAddIntegration(defaultIntegrationGroup(item));
          setIntegrationsOpen(false);
        }}
      />
    </div>
  );
}
