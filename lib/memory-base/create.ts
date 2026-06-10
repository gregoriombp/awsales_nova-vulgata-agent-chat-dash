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

export type MemoryBasePatch = Partial<
  Pick<NewBaseDraft, "objetivo" | "segmento" | "tipoDados">
> & {
  name?: string;
  status?: "active" | "inactive";
};

/**
 * Atualiza uma base já criada — classificação (objetivo / segmento / tipo de
 * dados), nome e status. Usado pelo passo de "Configurar" do fluxo de criação
 * e pela página de Configurações da base. O nome também sincroniza a chave
 * `memory-base-name-{id}` (lida pelo detalhe e pelos breadcrumbs). Sem efeito
 * na lista se o id não existir nela (bases mock), mas o nome sincroniza mesmo
 * assim.
 */
export function updateMemoryBase(id: string, patch: MemoryBasePatch): void {
  try {
    if (typeof patch.name === "string" && patch.name.trim()) {
      window.localStorage.setItem(`memory-base-name-${id}`, patch.name.trim());
    }
    const raw = window.localStorage.getItem(MEMORY_BASES_STORAGE_KEY);
    const bases = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(bases)) return;
    const next = bases.map((b) =>
      b && b.id === id
        ? { ...b, ...patch, ...(patch.tipoDados ? { type: patch.tipoDados } : {}) }
        : b,
    );
    window.localStorage.setItem(MEMORY_BASES_STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.error("Erro ao atualizar a Memory Base:", e);
  }
}

/**
 * Remove uma base criada e as chaves satélites dela (nome, fontes, pastas,
 * flag de vazia). No-op para bases mock — elas não vivem no localStorage.
 */
export function deleteMemoryBase(id: string): void {
  try {
    const raw = window.localStorage.getItem(MEMORY_BASES_STORAGE_KEY);
    const bases = raw ? JSON.parse(raw) : [];
    if (Array.isArray(bases)) {
      window.localStorage.setItem(
        MEMORY_BASES_STORAGE_KEY,
        JSON.stringify(bases.filter((b) => !b || b.id !== id)),
      );
    }
    for (const key of [
      `memory-base-name-${id}`,
      `memory-base-empty-${id}`,
      `memory-base-sources-${id}`,
      `memory-base-folders-${id}`,
      `memory-base-recent-searches-${id}`,
    ]) {
      window.localStorage.removeItem(key);
    }
  } catch (e) {
    console.error("Erro ao excluir a Memory Base:", e);
  }
}
