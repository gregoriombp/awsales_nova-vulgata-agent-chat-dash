"use client";

import { ExplorerRail } from "../_components/ExplorerRail";
import { ExplorerMain } from "../_components/ExplorerMain";

/**
 * Explorador de custos em tela cheia — a visualização de um relatório.
 *
 * Toma 100% do viewport (o layout de (sections) escapa o shell de Configurações
 * pra esta rota). Os providers (Consumo + Relatórios) vêm do layout de
 * consumo-e-custos, então abrir um relatório na página inicial e navegar pra cá
 * preserva o recorte. Trilho esquerdo com a lente "Dividir por", filtros e a
 * quebra "Por destino"; coluna principal com busca, breadcrumb de drill, o
 * "Uso no período", o gráfico atual×anterior e o board de gráficos.
 */
export default function ExplorarCustosPage() {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-(--bg-canvas) text-(--fg-primary)">
      <ExplorerRail />
      <ExplorerMain />
    </div>
  );
}
