"use client"

import * as React from "react"
import { AwModal } from "@/components/ui/AwModal"
import { AwButton } from "@/components/ui/AwButton"
import { AwField, AwInput } from "@/components/ui/AwInput"

type DemoKey = "simple" | "form" | "danger" | "dismissible"

export function ModalDemo() {
  const [openKey, setOpenKey] = React.useState<DemoKey | null>(null)
  const close = () => setOpenKey(null)

  return (
    <div className="flex flex-wrap gap-3">
      <AwButton variant="secondary" onClick={() => setOpenKey("simple")}>
        Modal simples
      </AwButton>
      <AwButton
        variant="primary"
        iconLeft="bolt"
        onClick={() => setOpenKey("form")}
      >
        Modal com formulário
      </AwButton>
      <AwButton
        variant="danger"
        iconLeft="delete"
        onClick={() => setOpenKey("danger")}
      >
        Modal destrutivo
      </AwButton>
      <AwButton variant="ghost" onClick={() => setOpenKey("dismissible")}>
        Não-dismissible
      </AwButton>

      <AwModal
        open={openKey === "simple"}
        onClose={close}
        title="Publicar agente"
        footer={
          <>
            <AwButton variant="ghost" onClick={close}>
              Cancelar
            </AwButton>
            <AwButton variant="primary" onClick={close}>
              Publicar agora
            </AwButton>
          </>
        }
      >
        Ao publicar, o agente começa a receber tráfego real no canal
        conectado. Mudanças futuras entram em nova revisão.
      </AwModal>

      <AwModal
        open={openKey === "form"}
        onClose={close}
        title="Criar nova fonte"
        footer={
          <>
            <AwButton variant="ghost" onClick={close}>
              Cancelar
            </AwButton>
            <AwButton variant="primary" onClick={close}>
              Adicionar fonte
            </AwButton>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <AwField label="Nome" htmlFor="src-name">
            <AwInput id="src-name" placeholder="Playbook de atendimento" />
          </AwField>
          <AwField
            label="URL / origem"
            htmlFor="src-url"
            helper="Notion, Drive, Intercom ou link público."
          >
            <AwInput
              id="src-url"
              placeholder="https://..."
              iconLeft="link"
            />
          </AwField>
        </div>
      </AwModal>

      <AwModal
        open={openKey === "danger"}
        onClose={close}
        title="Arquivar agente?"
        footer={
          <>
            <AwButton variant="ghost" onClick={close}>
              Manter
            </AwButton>
            <AwButton variant="danger" iconLeft="delete" onClick={close}>
              Arquivar
            </AwButton>
          </>
        }
      >
        <strong>Suporte N1</strong> deixa de receber tráfego imediatamente.
        Conversas em andamento permanecem no histórico. A ação pode ser
        revertida em até 30 dias.
      </AwModal>

      <AwModal
        open={openKey === "dismissible"}
        onClose={close}
        dismissible={false}
        title="Sem clique-fora"
        footer={
          <AwButton variant="primary" onClick={close}>
            Entendi
          </AwButton>
        }
      >
        Esse modal só fecha pelo botão (ou Esc). Use para decisões críticas
        onde o clique acidental no backdrop causaria perda de contexto.
      </AwModal>
    </div>
  )
}
