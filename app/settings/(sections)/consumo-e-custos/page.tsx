"use client";

import { ConsumoProvider } from "./_components/ConsumoContext";
import { ReportsUIProvider } from "./_components/SavedReports";
import { ExplorerRail } from "./_components/ExplorerRail";
import { ExplorerMain } from "./_components/ExplorerMain";

/**
 * "Explorar custos" — explorador de custos em tela cheia.
 *
 * Toma 100% do viewport (escapa o shell de Configurações via o layout de
 * (sections)). Trilho esquerdo com a lente "Dividir por", filtros ativos e a
 * quebra "Por destino"; coluna principal com busca, breadcrumb de drill, o
 * "Gasto no período", o gráfico atual×anterior e a tabela de detalhamento.
 * Tudo lê do mesmo modelo derivado dos dados reais do Financeiro.
 */
export default function ConsumoECustosPage() {
  return (
    <ConsumoProvider>
      <ReportsUIProvider>
        <div className="flex h-dvh w-full overflow-hidden bg-(--bg-canvas) text-(--fg-primary)">
          <ExplorerRail />
          <ExplorerMain />
        </div>
      </ReportsUIProvider>
    </ConsumoProvider>
  );
}
