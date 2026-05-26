"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { PagamentoBody } from "@/app/_shared/onboarding/PagamentoBody"
import { ONBOARDING_ORG } from "../_data"

export default function PagamentoPage() {
  return (
    <React.Suspense fallback={null}>
      <PagamentoWrapper />
    </React.Suspense>
  )
}

function PagamentoWrapper() {
  const searchParams = useSearchParams()
  const metodo = searchParams.get("metodo")
  const suffix = metodo ? `?metodo=${metodo}` : ""

  return (
    <PagamentoBody
      org={ONBOARDING_ORG}
      backHref={`/primeiro-acesso/contrato${suffix}`}
      concluidoHrefBase="/primeiro-acesso/concluido"
      concluidoExtraParams={{ metodo }}
    />
  )
}
