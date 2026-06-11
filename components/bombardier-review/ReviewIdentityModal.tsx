"use client"

import * as React from "react"
import { AwButton } from "@/components/ui/AwButton"
import { AwInput } from "@/components/ui/AwInput"
import { AwModal } from "@/components/ui/AwModal"
import { useReviewStore } from "@/lib/bombardier-review/store"
import { OVERLAY_DATA_ATTR, REVIEW_PALETTE, REVIEW_Z } from "./constants"

export function ReviewIdentityModal() {
  const open = useReviewStore((s) => s.identityModalOpen)
  const identity = useReviewStore((s) => s.identity)
  const setIdentity = useReviewStore((s) => s.setIdentity)
  const closeIdentityModal = useReviewStore((s) => s.closeIdentityModal)

  const [name, setName] = React.useState(identity?.name ?? "")
  const [colorToken, setColorToken] = React.useState(
    identity?.colorToken ?? REVIEW_PALETTE[0].token
  )

  React.useEffect(() => {
    if (open) {
      setName(identity?.name ?? "")
      setColorToken(identity?.colorToken ?? REVIEW_PALETTE[0].token)
    }
  }, [open, identity])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await setIdentity(name, colorToken)
  }

  return (
    <AwModal
      open={open}
      onClose={closeIdentityModal}
      zIndex={REVIEW_Z.modal}
      title={identity ? "Editar revisor" : "Quem está revisando?"}
      footer={
        <div
          {...{ [OVERLAY_DATA_ATTR]: "" }}
          className="flex items-center justify-end gap-2"
        >
          <AwButton variant="ghost" onClick={closeIdentityModal}>
            Cancelar
          </AwButton>
          <AwButton
            variant="primary"
            onClick={submit}
            disabled={!name.trim()}
          >
            {identity ? "Salvar" : "Começar"}
          </AwButton>
        </div>
      }
    >
      <form
        {...{ [OVERLAY_DATA_ATTR]: "" }}
        onSubmit={submit}
        className="flex flex-col gap-5"
      >
        <p className="body-sm text-(--fg-secondary) leading-relaxed">
          Seu nome aparece em cada comentário e nas respostas do agente. Fica
          salvo só no seu navegador.
        </p>

        <label className="flex flex-col gap-2">
          <span className="body-xs font-medium text-(--fg-secondary)">
            Nome
          </span>
          <AwInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Greg"
            autoFocus
            maxLength={40}
          />
        </label>

        <fieldset className="flex flex-col gap-2">
          <legend className="body-xs font-medium text-(--fg-secondary) mb-1">
            Cor do seu marcador
          </legend>
          <div className="flex flex-wrap gap-2">
            {REVIEW_PALETTE.map((c) => {
              const selected = colorToken === c.token
              return (
                <button
                  key={c.token}
                  type="button"
                  onClick={() => setColorToken(c.token)}
                  aria-label={c.label}
                  aria-pressed={selected}
                  className="h-9 w-9 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    background: c.token,
                    borderColor: selected
                      ? "var(--fg-primary)"
                      : "transparent",
                  }}
                  title={c.label}
                />
              )
            })}
          </div>
        </fieldset>

        <button type="submit" hidden />
      </form>
    </AwModal>
  )
}
