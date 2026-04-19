"use client"

import * as React from "react"
import { AwModal } from "@/components/ui/AwModal"
import { AwButton } from "@/components/ui/AwButton"
import { AwField, AwInput } from "@/components/ui/AwInput"

type DemoKey = "simple" | "form" | "danger" | "dismissible" | "cockpit"

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
      <AwButton
        variant="secondary"
        iconLeft="settings"
        onClick={() => setOpenKey("cockpit")}
      >
        Cockpit (760px)
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

      <AwModal
        open={openKey === "cockpit"}
        onClose={close}
        size="cockpit"
        title="Configurações · atendimento-faq"
        footer={
          <>
            <AwButton variant="ghost" onClick={close}>
              Cancelar
            </AwButton>
            <AwButton variant="primary" onClick={close}>
              Salvar e publicar
            </AwButton>
          </>
        }
      >
        <div className="grid grid-cols-[200px_1fr] gap-6">
          <nav className="flex flex-col gap-1 text-sm">
            {["Geral", "Fontes", "Tools", "Webhooks", "Rastro", "Segurança"].map(
              (item, i) => (
                <button
                  key={item}
                  type="button"
                  className={`text-left px-3 py-2 rounded-[var(--radius-sm)] ${
                    i === 0
                      ? "bg-[var(--bg-surface)] text-[var(--fg-primary)] font-medium"
                      : "text-[var(--fg-secondary)] hover:bg-[var(--bg-surface)]"
                  }`}
                >
                  {item}
                </button>
              )
            )}
          </nav>
          <div className="flex flex-col gap-4">
            <AwField label="Nome do agente" htmlFor="c-name">
              <AwInput id="c-name" defaultValue="atendimento-faq" />
            </AwField>
            <AwField
              label="Descrição"
              htmlFor="c-desc"
              helper="Exibida na listagem e no handoff."
            >
              <AwInput
                id="c-desc"
                defaultValue="Suporte N1 para dúvidas recorrentes."
              />
            </AwField>
            <AwField label="Modelo" htmlFor="c-model">
              <AwInput id="c-model" defaultValue="gpt-4.1-mini" />
            </AwField>
          </div>
        </div>
      </AwModal>
    </div>
  )
}
