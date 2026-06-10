import {
  getAgentById,
  type Agent,
  type AgentStatus,
  type AgentVariable,
  type Checkpoint,
  type SkillGroup,
} from "@/lib/agentStudio";

/**
 * Rascunho local do editor de agente — compartilha prompt/checkpoints entre
 * a página do editor (/agent-studio/[id]) e o editor de documento de
 * checkpoints (/agent-studio/[id]/checkpoints).
 *
 * Protótipo: persiste em localStorage por agente. A versão do schema invalida
 * rascunhos antigos quando os dados padrão do registry mudam de shape.
 */

const SCHEMA_VERSION = 3;

export type AgentDocDraft = {
  v: number;
  prompt: string;
  checkpoints: Checkpoint[];
  /** Variáveis criadas no editor (além das padrão do agente). */
  variaveisCriadas: AgentVariable[];
  /** Integrações conectadas pelo painel do editor de checkpoints. */
  gruposExtras: SkillGroup[];
  /** Propriedades editadas nos modais dos chips (por id de tool/variável). */
  chipProps?: Record<string, Record<string, string>>;
};

function storageKey(agentId: string): string {
  return `aw:agent-studio:${agentId}:draft`;
}

export function loadAgentDraft(agentId: string): AgentDocDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(agentId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AgentDocDraft;
    if (parsed.v !== SCHEMA_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAgentDraft(
  agentId: string,
  draft: Omit<AgentDocDraft, "v">,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      storageKey(agentId),
      JSON.stringify({ v: SCHEMA_VERSION, ...draft }),
    );
  } catch {
    // Quota/privado — rascunho local é melhor-esforço no protótipo.
  }
}

export function clearAgentDraft(agentId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey(agentId));
}

/* ─────────────────────────────────────────────────────────────────────────
 * Overrides da listagem — ações de Duplicar / Pausar / Arquivar / Excluir.
 *
 * Overlay aplicado sobre o registry mock: em produção essas mutações vivem
 * no backend; no protótipo ficam em localStorage para as ações da listagem
 * e das Preferências terem efeito real e persistente entre páginas.
 * ───────────────────────────────────────────────────────────────────────── */

const LIST_KEY = "aw:agent-studio:list:v1";

/**
 * Evento same-tab disparado a cada save — "storage" só dispara entre abas.
 * Quem renderiza a lista (ex.: /agent-studio) assina para refletir mutações
 * feitas por outros componentes (ex.: "Desfazer" de um toast das Preferências
 * clicado depois do redirect).
 */
export const AGENT_LIST_OVERRIDES_EVENT = "aw:agent-studio:list-overrides";

export type AgentListOverrides = {
  /** Excluídos de forma permanente. */
  removed: string[];
  /** Arquivados — fora da listagem, mas restauráveis. */
  archived: string[];
  /** Status alterado depois da criação (pausar/reativar, Preferências). */
  statusOverrides: Record<string, AgentStatus>;
  /** Cópias criadas na listagem; o shape vem de getAgentById(id). */
  duplicates: { sourceId: string; id: string; createdAt: string }[];
};

export function emptyAgentListOverrides(): AgentListOverrides {
  return { removed: [], archived: [], statusOverrides: {}, duplicates: [] };
}

export function loadAgentListOverrides(): AgentListOverrides {
  if (typeof window === "undefined") return emptyAgentListOverrides();
  try {
    const raw = window.localStorage.getItem(LIST_KEY);
    if (!raw) return emptyAgentListOverrides();
    return { ...emptyAgentListOverrides(), ...(JSON.parse(raw) as object) };
  } catch {
    return emptyAgentListOverrides();
  }
}

export function saveAgentListOverrides(overrides: AgentListOverrides): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LIST_KEY, JSON.stringify(overrides));
  } catch {
    // Quota/privado — overlay local é melhor-esforço no protótipo.
  }
  window.dispatchEvent(new Event(AGENT_LIST_OVERRIDES_EVENT));
}

/** Lista final da listagem: aplica exclusões, arquivamentos, status e cópias. */
export function applyAgentListOverrides(
  base: Agent[],
  overrides: AgentListOverrides,
): Agent[] {
  const hidden = new Set([...overrides.removed, ...overrides.archived]);
  const withStatus = (agent: Agent): Agent => {
    const status = overrides.statusOverrides[agent.id];
    return status ? { ...agent, status } : agent;
  };

  const list: Agent[] = [];
  for (const agent of base) {
    if (!hidden.has(agent.id)) list.push(withStatus(agent));
    for (const dup of overrides.duplicates) {
      if (dup.sourceId !== agent.id || hidden.has(dup.id)) continue;
      list.push(withStatus({ ...getAgentById(dup.id), createdAt: dup.createdAt }));
    }
  }
  return list;
}
