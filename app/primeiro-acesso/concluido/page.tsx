"use client"

import * as React from "react"
import { useSearchParams } from "next/navigation"
import { ConcluidoBody } from "@/app/_shared/onboarding/ConcluidoBody"
import { ONBOARDING_ORG, ONBOARDING_USER } from "../_data"

export default function ConcluidoPage() {
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
      org={ONBOARDING_ORG}
      user={ONBOARDING_USER}
      retornoHref="/inicio?welcome=1"
      searchParams={new URLSearchParams(searchParams.toString())}
    />
  )
}
