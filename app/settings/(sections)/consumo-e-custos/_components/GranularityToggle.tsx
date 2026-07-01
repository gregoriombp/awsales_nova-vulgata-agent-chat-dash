"use client";

import { SegmentedToggle } from "./controls";
import { GRANULARITY_OPTIONS, type ChartGranularity } from "./chart-utils";

/** Controle temporal LOCAL de um gráfico (cmt-60c4ab93): dia | semana | mês.
 *  Convive com o período geral da topbar — este muda só a agregação do card. */
export function GranularityToggle({
  value,
  onChange,
}: {
  value: ChartGranularity;
  onChange: (g: ChartGranularity) => void;
}) {
  return (
    <SegmentedToggle
      ariaLabel="Agregação do gráfico"
      value={value}
      onChange={onChange}
      options={GRANULARITY_OPTIONS}
    />
  );
}
