"use client"

import * as React from "react"
import { AwButton } from "@/components/ui/AwButton"
import { useToast } from "@/components/ui/AwToast"

export function ToastDemo() {
  const { push } = useToast()

  return (
    <div className="flex flex-wrap gap-2">
      <AwButton
        variant="primary"
        size="sm"
        iconLeft="check_circle"
        onClick={() =>
          push({
            variant: "success",
            title: "Agente publicado",
            description: "Live em Web e WhatsApp.",
          })
        }
      >
        Success
      </AwButton>

      <AwButton
        variant="ai"
        size="sm"
        iconLeft="auto_awesome"
        onClick={() =>
          push({
            variant: "ai",
            title: "6 respostas reescritas",
            description: "Revise antes de publicar",
            action: {
              label: "desfazer",
              onClick: () => console.log("undo"),
            },
          })
        }
      >
        AI + undo (8s)
      </AwButton>

      <AwButton
        variant="danger"
        size="sm"
        iconLeft="error"
        onClick={() =>
          push({
            variant: "error",
            title: "Não foi possível salvar",
            description: "Conexão caiu.",
            action: {
              label: "tentar novamente",
              onClick: () => console.log("retry"),
            },
          })
        }
      >
        Error + retry
      </AwButton>

      <AwButton
        variant="secondary"
        size="sm"
        iconLeft="warning"
        onClick={() =>
          push({
            variant: "warning",
            title: "Quota de mensagens em 85%",
            description: "Revisar plano antes do fim do ciclo.",
          })
        }
      >
        Warning
      </AwButton>

      <AwButton
        variant="ghost"
        size="sm"
        iconLeft="info"
        onClick={() =>
          push({
            variant: "info",
            title: "Rascunho salvo",
          })
        }
      >
        Info (só título)
      </AwButton>

      <AwButton
        variant="ghost"
        size="sm"
        onClick={() => {
          push({ variant: "success", title: "Toast 1" })
          setTimeout(
            () => push({ variant: "ai", title: "Toast 2" }),
            250
          )
          setTimeout(
            () => push({ variant: "error", title: "Toast 3" }),
            500
          )
          setTimeout(
            () => push({ variant: "info", title: "Toast 4 (aguarda stack)" }),
            750
          )
        }}
      >
        Empilhar 4
      </AwButton>
    </div>
  )
}
