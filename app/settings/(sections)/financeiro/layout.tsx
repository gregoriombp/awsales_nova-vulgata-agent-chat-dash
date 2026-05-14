import { Icon } from "@/components/ui/Icon";
import { FinanceiroTabs } from "./_components/FinanceiroTabs";

export default function FinanceiroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-10 pb-20 pt-12">
      <header>
        <h1 className="m-0 mb-2 flex items-center gap-3 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-[var(--fg-primary)]">
          <Icon
            name="account_balance_wallet"
            size={36}
            weight={300}
            className="text-[var(--fg-primary)]"
          />
          Financeiro
        </h1>
        <p className="m-0 max-w-[640px] text-[13px] leading-[1.55] text-[var(--fg-secondary)]">
          Acompanhe plano, faturas, créditos disponíveis e a trilha completa
          de eventos financeiros desta organização.
        </p>
      </header>

      <FinanceiroTabs />

      {children}
    </div>
  );
}
