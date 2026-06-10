import type { AgentVariable, Checkpoint, SkillGroup } from "@/lib/agentStudio";

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
