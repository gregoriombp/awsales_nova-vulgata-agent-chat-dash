"use client"

import { ContratoBody } from "@/app/_shared/onboarding/ContratoBody"
import { ONBOARDING_USER } from "@/app/primeiro-acesso/_data"
import { ADDITIONAL_ORG } from "../_data"

export default function ContratoOrgAdicionalPage() {
  return (
    <ContratoBody
      org={ADDITIONAL_ORG}
      user={ONBOARDING_USER}
      backHref="/inicio"
      nextHref="/organizacao-adicional/pagamento"
      heading="Revise o contrato da nova organização"
      intro={
        <>
          Os termos abaixo cobrem a{" "}
          <b className="font-medium text-fg-primary">{ADDITIONAL_ORG.name}</b>,
          que está sendo adicionada à sua conta. Seu perfil pessoal já existe — não pedimos
          essas informações de novo.
        </>
      }
    />
  )
}
