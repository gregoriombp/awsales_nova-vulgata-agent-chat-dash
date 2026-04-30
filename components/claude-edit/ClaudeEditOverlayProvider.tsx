"use client"

import * as React from "react"
import { ClaudeEditOverlay } from "./ClaudeEditOverlay"
import { ElementPickerLayer } from "./ElementPickerLayer"

export function ClaudeEditOverlayProvider() {
  return (
    <>
      <ElementPickerLayer />
      <ClaudeEditOverlay />
    </>
  )
}
