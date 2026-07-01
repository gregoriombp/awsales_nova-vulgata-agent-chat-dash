import { ConsumoCustosTabs } from "../_components/ConsumoCustosTabs";

/**
 * Chrome das abas de "Consumo e custos" (Visão geral | Por ciclos | Análises).
 *
 * Route group: não muda a URL — a raiz segue /settings/consumo-e-custos e o
 * explorador (`/explorar`) fica FORA do group, sem este cabeçalho (ele toma o
 * viewport inteiro). Espelha o layout do Financeiro.
 */
export default function ConsumoCustosTabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-10 pb-20 pt-12">
      {/* PLANO FUTURO (cmt-e496ed5c, decisão do Greg): quando houver fatura não
          paga, um alerta global em vermelho deve subir em TODAS as telas do app
          ("campanhas desativadas por problema de pagamento — regularize"). A base
          já existe: PaymentPendingBanner do financeiro (3 severidades). Entra
          como passe dedicado depois que as telas do financeiro concluírem. */}
      <header>
        <h3 className="m-0 mb-2 display-sm font-medium text-(--fg-primary)">
          Consumo e custos
        </h3>
        <p className="m-0 max-w-[640px] body-xs text-(--fg-secondary)">
          Concilie o que foi usado com o que foi cobrado — por dia, por ciclo de
          fatura e em relatórios detalhados.
        </p>
      </header>

      <ConsumoCustosTabs />

      {children}
    </div>
  );
}
