import { Icon } from "@/components/ui/Icon";
import { FinanceiroTabs } from "./_components/FinanceiroTabs";

export default function FinanceiroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-10 pb-20 pt-12">
      <header>
        <h3 className="m-0 mb-2 flex items-center gap-3 text-[var(--fg-primary)]">
          <Icon
            name="account_balance_wallet"
            size={36}
            weight={300}
            className="text-[var(--fg-primary)]"
          />
          Financeiro
        </h3>
        <p className="m-0 max-w-[640px] body-xs text-[var(--fg-secondary)]">
          Plano, faturas, créditos e auditoria desta organização — tudo em um
          lugar.
        </p>
      </header>

      <FinanceiroTabs />

      {children}
    </div>
  );
}
