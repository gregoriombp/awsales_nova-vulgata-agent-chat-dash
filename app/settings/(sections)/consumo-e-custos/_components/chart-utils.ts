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

/* ----------------------------------------------------------------------------
 * Granularidade local POR gráfico (cmt-60c4ab93): além do período geral da
 * topbar, cada gráfico de série temporal escolhe a própria agregação —
 * dia, semana ou mês.
 * ------------------------------------------------------------------------- */

export type ChartGranularity = "day" | "week" | "month";

export const GRANULARITY_OPTIONS: { value: ChartGranularity; label: string }[] = [
  { value: "day", label: "Dia" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mês" },
];

const MONTH_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/**
 * Agrega linhas de gráfico (objetos com um rótulo "dd/mm" + séries numéricas)
 * em buckets de semana (7 dias corridos) ou mês (pelo mm do rótulo), somando
 * as chaves numéricas. Em "day", devolve as linhas como estão.
 */
export function bucketRows<T extends Record<string, unknown>>(
  rows: T[],
  seriesKeys: string[],
  granularity: ChartGranularity,
  labelKey = "day",
): T[] {
  if (granularity === "day" || rows.length === 0) return rows;

  const bucketOf = (row: T, index: number): string => {
    if (granularity === "week") return String(Math.floor(index / 7));
    const label = String(row[labelKey] ?? "");
    return label.slice(3, 5) || String(index); // "dd/mm" → "mm"
  };

  const out: T[] = [];
  let currentKey: string | null = null;
  rows.forEach((row, i) => {
    const key = bucketOf(row, i);
    if (key !== currentKey) {
      currentKey = key;
      const label =
        granularity === "month"
          ? MONTH_SHORT[Math.max(0, Number(key) - 1)] ?? String(row[labelKey])
          : String(row[labelKey]); // semana: rótulo do 1º dia do bucket
      out.push({ ...row, [labelKey]: label });
    } else {
      const acc = out[out.length - 1] as Record<string, unknown>;
      seriesKeys.forEach((k) => {
        acc[k] = Math.round(((Number(acc[k]) || 0) + (Number(row[k]) || 0)) * 100) / 100;
      });
    }
  });
  return out;
}
