import { FinanceiroTabs } from "./_components/FinanceiroTabs";
import { PaymentPendingBanner } from "./_components/PaymentPendingBanner";

export default function FinanceiroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-10 pb-20 pt-12">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h3 className="m-0 mb-2 text-(--fg-primary)">Financeiro</h3>
          <p className="m-0 max-w-[640px] body-xs text-(--fg-secondary)">
            Plano, faturas, créditos e atividade desta organização.
          </p>
        </div>
        <PaymentPendingBanner />
      </header>

      <FinanceiroTabs />

      {children}
    </div>
  );
}
