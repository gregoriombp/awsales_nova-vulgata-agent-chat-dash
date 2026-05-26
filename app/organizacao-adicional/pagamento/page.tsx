"use client"

import { PagamentoBody } from "@/app/_shared/onboarding/PagamentoBody"
import { ADDITIONAL_ORG } from "../_data"

export default function PagamentoOrgAdicionalPage() {
  return (
    <PagamentoBody
      org={ADDITIONAL_ORG}
      backHref="/organizacao-adicional/contrato"
      concluidoHrefBase="/organizacao-adicional/concluido"
      heading="Pagamento da nova organização"
      intro={
        <>
          Você vai pagar a{" "}
          <b className="font-medium text-fg-primary">implementação</b> e a{" "}
          <b className="font-medium text-fg-primary">1ª mensalidade</b> da{" "}
          {ADDITIONAL_ORG.name}. Pode escolher o método e dividir cada um em até{" "}
          {ADDITIONAL_ORG.parcelamentoMaxImplementacao}×.
        </>
      }
    />
  )
}
