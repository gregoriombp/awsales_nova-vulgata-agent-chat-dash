/**
 * Criação de uma base de conhecimento (Memory Base) — persistência client-side.
 * Compartilhado entre o wizard (`/memory-base/new`) e o index (que lê a lista).
 * Repo é preview de UX: sem backend, tudo em localStorage.
 */

export const MEMORY_BASES_STORAGE_KEY = "memory-bases-list";

export type NewBaseDraft = {
  name: string;
  objetivo: string;
  segmento: string;
  tipoDados: string;
};

/**
 * Grava a base nova em localStorage (padrão usado pela tela de detalhe) e
 * devolve o id pra navegar com `?new=1` — a base nasce vazia, com tour.
 */
export function createMemoryBase(draft: NewBaseDraft): string {
  const id = Math.random().toString(36).slice(2, 9);
  const { name, objetivo, segmento, tipoDados } = draft;
  try {
    const raw = window.localStorage.getItem(MEMORY_BASES_STORAGE_KEY);
    const bases = raw ? JSON.parse(raw) : [];
    bases.push({
      id,
      name,
      description: "",
      type: tipoDados || "documentos",
      objetivo,
      segmento,
      tipoDados,
      documentCount: 0,
      knowledgeLayersCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      status: "active",
    });
    window.localStorage.setItem(MEMORY_BASES_STORAGE_KEY, JSON.stringify(bases));
    window.localStorage.setItem(`memory-base-name-${id}`, name);
    window.localStorage.setItem(`memory-base-empty-${id}`, "1");
  } catch (e) {
    console.error("Erro ao criar a Memory Base:", e);
  }
  return id;
}
