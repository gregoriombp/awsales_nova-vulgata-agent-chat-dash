"use client";

import { ConsumoProvider } from "./_components/ConsumoContext";
import { ReportsUIProvider } from "./_components/SavedReports";

/**
 * Layout do espaço "Análises detalhadas".
 *
 * Sobe o ConsumoProvider + ReportsUIProvider pra ESTE nível, acima da página
 * inicial (lista de relatórios) e do explorador (`/explorar`). Assim os dois
 * compartilham o mesmo estado de relatórios: criar/abrir um relatório na página
 * inicial e navegar pro explorador mantém o recorte, sem remontar o provider.
 *
 * Não impõe chrome — cada página controla seu próprio layout: a inicial roda
 * dentro do shell de Configurações; o explorador toma o viewport inteiro (o
 * layout de (sections) escapa o shell só pra `/explorar`).
 */
export default function ConsumoECustosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConsumoProvider>
      <ReportsUIProvider>{children}</ReportsUIProvider>
    </ConsumoProvider>
  );
}
