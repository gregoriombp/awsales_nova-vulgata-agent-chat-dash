/**
 * Avatares visuais (orbs) dos agentes IA.
 *
 * 20 modelos coloridos principais (`orb_model-a_01.png` … `_20.png`),
 * cada um com sua paleta/textura. Subsets têm variantes alternativas:
 *   - `-1` (escala de cinza / muted) → existe nos modelos 01–12
 *   - `-s` (azul-acinzentado / soft)  → existe nos modelos 01–05
 *
 * Quando a variante pedida não existir pro modelo sorteado, o helper
 * cai pra variante "mais alta" disponível (soft → muted → active).
 */

const ORB_DIR = "/assets/agent_imgs/orbs";

export type AgentOrbState = "active" | "muted" | "soft";

const MODEL_COUNT = 20;
const MODELS: readonly number[] = Array.from(
  { length: MODEL_COUNT },
  (_, i) => i + 1
);

const MUTED_MODELS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
const SOFT_MODELS = new Set([1, 2, 3, 4, 5]);

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function orbPath(model: number, state: AgentOrbState): string {
  if (state === "soft" && SOFT_MODELS.has(model)) {
    return `${ORB_DIR}/orb_model-a_${pad2(model)}-s.png`;
  }
  if (state === "muted" && MUTED_MODELS.has(model)) {
    return `${ORB_DIR}/orb_model-a_${pad2(model)}-1.png`;
  }
  return `${ORB_DIR}/orb_model-a_${pad2(model)}.png`;
}

/** 20 caminhos dos modelos principais (estado ativo). */
export const AGENT_ORBS: readonly string[] = MODELS.map((m) =>
  orbPath(m, "active")
);

/** Variantes muted (grayscale) — apenas modelos 01–12. */
export const AGENT_ORBS_MUTED: readonly string[] = [...MUTED_MODELS]
  .sort((a, b) => a - b)
  .map((m) => orbPath(m, "muted"));

/** Variantes soft (azul-acinzentado) — apenas modelos 01–05. */
export const AGENT_ORBS_SOFT: readonly string[] = [...SOFT_MODELS]
  .sort((a, b) => a - b)
  .map((m) => orbPath(m, "soft"));

function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Resolve um orb estável a partir de um id de agente.
 * Mesmo id sempre devolve o mesmo modelo; quando a variante
 * pedida não existe pro modelo, cai pro `active`.
 */
export function getOrbForAgent(
  id: string,
  state: AgentOrbState = "active"
): string {
  const model = (hashStr(id) % MODEL_COUNT) + 1;
  return orbPath(model, state);
}

/**
 * Resolve um orb por índice posicional (substitui o padrão legado
 * `AGENT_IMGS[i % AGENT_IMGS.length]`). Tolera índices negativos.
 */
export function getOrbByIndex(
  index: number,
  state: AgentOrbState = "active"
): string {
  const model = (((index % MODEL_COUNT) + MODEL_COUNT) % MODEL_COUNT) + 1;
  return orbPath(model, state);
}
