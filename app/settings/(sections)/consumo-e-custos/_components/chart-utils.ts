/* ----------------------------------------------------------------------------
 * Regras compartilhadas dos gráficos de consumo.
 *
 * "Outros" SEMPRE no topo da pilha (pedido do Greg, cmt-750ce724): o agregado
 * de cauda longa nunca fica na base nem no meio — é o último a renderizar.
 * Todo stacked novo passa por aqui em vez de reimplementar a ordenação.
 * ------------------------------------------------------------------------- */

/** Ids que representam o agregado "Outros" nas séries do consumo. */
export function isOthersSeries(id: string): boolean {
  return id === "__others__" || id === "outros";
}

/**
 * Ordena séries de um stacked chart: maiores primeiro (base da pilha) e
 * QUALQUER série "Outros" por último — no Recharts, a última série renderiza
 * no TOPO da pilha. `total` opcional refina o ranking; sem ele, preserva a
 * ordem de entrada (estável).
 */
export function othersOnTop<T extends { id: string }>(
  series: T[],
  totalOf?: (item: T) => number,
): T[] {
  return [...series].sort((a, b) => {
    const aOthers = isOthersSeries(a.id);
    const bOthers = isOthersSeries(b.id);
    if (aOthers && !bOthers) return 1;
    if (!aOthers && bOthers) return -1;
    if (totalOf) return totalOf(b) - totalOf(a);
    return 0;
  });
}
