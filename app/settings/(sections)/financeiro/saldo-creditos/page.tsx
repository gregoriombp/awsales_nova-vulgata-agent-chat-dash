"use client";

import { SectionHeading } from "../../_components/shared";
import { ApplyCouponBlock } from "../_components/ApplyCouponBlock";
import { CouponsTable } from "../_components/CouponsTable";
import { KpiRow } from "../_components/KpiRow";
import { VouchersTable } from "../_components/VouchersTable";
import { brl, CREDITS_KPIS } from "../_components/data";

export default function SaldoCreditosPage() {
  return (
    <div className="flex flex-col gap-6">
      <KpiRow
        items={[
          {
            id: "saved",
            icon: "savings",
            label: "Total economizado",
            value: brl(CREDITS_KPIS.totalSaved),
            hint: "Lifetime, somando cupons e vouchers aplicados nesta organização.",
          },
          {
            id: "available",
            icon: "redeem",
            label: "Desconto disponível",
            value: brl(CREDITS_KPIS.availableDiscount),
            hint: "Saldo de vouchers ainda não consumido.",
          },
          {
            id: "active",
            icon: "confirmation_number",
            label: "Vouchers ativos",
            value: String(CREDITS_KPIS.activeVouchers),
            hint: "Vouchers em uso, com saldo positivo.",
          },
        ]}
      />

      <section>
        <SectionHeading
          title="Vouchers"
          description="Créditos pré-definidos emitidos pela AwSales. A barra mostra o consumo em tempo real; vouchers acelerando recebem alerta."
        />
        <VouchersTable />
      </section>

      <section>
        <SectionHeading
          title="Cupons aplicados"
          description="Códigos de desconto já redimidos nesta organização."
        />
        <CouponsTable />
      </section>

      <ApplyCouponBlock />
    </div>
  );
}
