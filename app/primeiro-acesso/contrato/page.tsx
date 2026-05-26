"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { ContratoBody } from "@/app/_shared/onboarding/ContratoBody"
import { ONBOARDING_ORG, ONBOARDING_USER } from "../_data"

export default function ContratoPage() {
  return (
    <React.Suspense fallback={null}>
      <ContratoWrapper />
    </React.Suspense>
  )
}

function ContratoWrapper() {
  const searchParams = useSearchParams()
  const metodo = searchParams.get("metodo")
  const suffix = metodo ? `?metodo=${metodo}` : ""

  return (
    <ContratoBody
      org={ONBOARDING_ORG}
      user={ONBOARDING_USER}
      backHref={`/primeiro-acesso/perfil${suffix}`}
      nextHref={`/primeiro-acesso/pagamento${suffix}`}
    />
  )
}
