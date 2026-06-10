import type { Checkpoint, HabilidadeConfigurada } from "@/lib/agentStudio";

/**
 * Tokens inline do corpo do checkpoint (e do prompt do agente).
 *
 * Serialização canônica (a que vive no `Checkpoint`):
 *   - `@[id]`      → menção a uma habilidade do catálogo (id namespaced,
 *                    ex.: `agent.thinkOutLoud`)
 *   - `{{nome}}`   → variável do agente
 *   - `**texto**`  → negrito · `*texto*` → itálico
 *
 * Estes helpers são puros (sem DOM) — o editor contentEditable e os renders
 * read-only consomem daqui.
 */

export type TokenSegment =
  | { type: "text"; content: string }
  | { type: "bold"; content: string }
  | { type: "italic"; content: string }
  | { type: "mention"; id: string }
  | { type: "variable"; name: string };

function tokenRegex() {
  return /@\[([\w.-]+)\]|\{\{([^{}]+)\}\}|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g;
}

/** Quebra o texto serializado em segmentos de texto, formatação e tokens. */
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
    else if (m[2]) segments.push({ type: "variable", name: m[2].trim() });
    else if (m[3]) segments.push({ type: "bold", content: m[3] });
    else segments.push({ type: "italic", content: m[4] });
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
        grupo: "agente",
      },
  );
}

/** Textos de um checkpoint que participam da derivação de habilidades. */
export function checkpointTexts(cp: Checkpoint): string[] {
  return [
    cp.objetivo,
    cp.corpo,
    ...(cp.marque?.opcoes.flatMap((o) => [o.texto, o.acoes ?? ""]) ?? []),
    ...(cp.regras?.flatMap((r) => [r.se, r.entao]) ?? []),
  ];
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
