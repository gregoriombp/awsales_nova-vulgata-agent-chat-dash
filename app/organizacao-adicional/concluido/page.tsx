"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { ConcluidoBody } from "@/app/_shared/onboarding/ConcluidoBody"
import { ONBOARDING_USER } from "@/app/primeiro-acesso/_data"
import { ADDITIONAL_ORG } from "../_data"

export default function ConcluidoOrgAdicionalPage() {
  return (
    <React.Suspense fallback={null}>
      <ConcluidoWrapper />
    </React.Suspense>
  )
}

function ConcluidoWrapper() {
  const searchParams = useSearchParams()
  return (
    <ConcluidoBody
      org={ADDITIONAL_ORG}
      user={ONBOARDING_USER}
      retornoHref="/inicio"
      retornoLabel="Voltar para a plataforma"
      heading={<>{ADDITIONAL_ORG.name} está ativa</>}
      intro={
        <>
          Recebemos o pagamento e adicionamos a {ADDITIONAL_ORG.name} à sua conta.
          Você já pode alternar entre as suas organizações dentro da plataforma.
        </>
      }
      searchParams={new URLSearchParams(searchParams.toString())}
    />
  )
}
