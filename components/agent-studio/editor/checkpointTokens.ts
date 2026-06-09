import type { Checkpoint, HabilidadeConfigurada } from "@/lib/agentStudio";

/**
 * Tokens inline do corpo do checkpoint (e do prompt do agente).
 *
 * Serialização canônica (a que vive no `Checkpoint`):
 *   - `@[id]`     → menção a uma habilidade configurada (id estável)
 *   - `{{nome}}`  → variável do agente
 *
 * Estes helpers são puros (sem DOM) — o editor contentEditable e os renders
 * read-only em PromptCheckpointTab/VisualizacaoModularTab consomem daqui.
 */

export type TokenSegment =
  | { type: "text"; content: string }
  | { type: "mention"; id: string }
  | { type: "variable"; name: string };

function tokenRegex() {
  return /@\[([\w-]+)\]|\{\{([^{}]+)\}\}/g;
}

/** Quebra o texto serializado em segmentos de texto + tokens. */
export function parseTokenSegments(text: string): TokenSegment[] {
  const segments: TokenSegment[] = [];
  const re = tokenRegex();
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) {
      segments.push({ type: "text", content: text.slice(lastIndex, m.index) });
    }
    if (m[1]) segments.push({ type: "mention", id: m[1] });
    else segments.push({ type: "variable", name: m[2].trim() });
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }
  return segments;
}

/** Ids de habilidade mencionados via `@[…]`, na ordem em que aparecem, sem repetição. */
export function extractMentionIds(texts: string[]): string[] {
  const ids: string[] = [];
  for (const text of texts) {
    for (const seg of parseTokenSegments(text)) {
      if (seg.type === "mention" && !ids.includes(seg.id)) ids.push(seg.id);
    }
  }
  return ids;
}

/**
 * Habilidades DERIVADAS das menções `@[…]` presentes nos textos.
 * Menções a ids desconhecidos viram uma entrada de fallback (nome = id),
 * para nunca sumir conteúdo que o usuário digitou.
 */
export function deriveHabilidades(
  texts: string[],
  habilidades: HabilidadeConfigurada[],
): HabilidadeConfigurada[] {
  const byId = new Map(habilidades.map((h) => [h.id, h]));
  return extractMentionIds(texts).map(
    (id) =>
      byId.get(id) ?? {
        id,
        nome: id,
        descricao: "Habilidade não configurada neste agente.",
        grupo: "nativo" as const,
      },
  );
}

/** Textos de um checkpoint que participam da derivação de habilidades. */
export function checkpointTexts(cp: Checkpoint): string[] {
  return [cp.objetivo, ...cp.itens];
}

/** Remove as chaves de exibição de `{{nome}}` → `nome`. */
export function stripVariableBraces(nome: string): string {
  return nome.replace(/[{}]/g, "").trim();
}

/** Normaliza o texto digitado pelo usuário em um nome de variável válido. */
export function sanitizeVariableName(raw: string): string {
  return stripVariableBraces(raw)
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "")
    .toLowerCase();
}
