"use client";

import { SectionHeading } from "../../_components/shared";
import { InvoiceHistoryTable } from "../_components/InvoiceHistoryTable";

export default function HistoricoFaturasPage() {
  return (
    <div className="flex flex-col gap-10">
      <section>
        <SectionHeading
          title="Histórico de faturas"
          description="Faturas dos últimos meses, com totais brutos, descontos aplicados e o valor efetivamente cobrado."
        />
        <InvoiceHistoryTable />
      </section>
    </div>
  );
}
