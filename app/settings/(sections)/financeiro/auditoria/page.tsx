"use client";

import { AuditTrail } from "../_components/AuditTrail";
import { SectionHeading } from "../../_components/shared";

export default function AuditoriaPage() {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeading
        title="Auditoria financeira"
        description="Trilha de eventos de plano, cartão, fatura, cupom e voucher desta organização. Atos do próprio AwSales, do cliente e do sistema aparecem aqui."
      />
      <AuditTrail />
    </div>
  );
}
