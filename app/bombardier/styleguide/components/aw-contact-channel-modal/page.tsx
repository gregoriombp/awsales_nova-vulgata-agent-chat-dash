"use client"

import { useState } from "react"
import { AwButton } from "@/components/ui/AwButton"
import { AwContactChannelModal } from "@/components/ui/AwContactChannelModal"
import {
  ApiTable,
  PageHero,
  PropRow,
  Section,
  Stage,
} from "../../_primitives"

export default function AwContactChannelModalPage() {
  const [openNamed, setOpenNamed] = useState(false)
  const [openGeneric, setOpenGeneric] = useState(false)

  return (
    <>
      <PageHero title="Contact channel modal">
        Modal curto pra escolher por onde falar com o gerente de contas —
        WhatsApp ou Slack. Aberto pelo CTA do card do especialista humano.
        As cores de marca vêm de <code className="mono">lib/brandColors.ts</code>.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="demo"
            title="Demo"
            lead="Dois canais fixos. Clicar num canal dispara onSelect e fecha. Esc fecha; clique fora descarta."
          >
            <Stage label="Com nome do gerente · genérico">
              <AwButton
                variant="primary"
                iconLeft="chat"
                onClick={() => setOpenNamed(true)}
              >
                Conversar com Marina
              </AwButton>
              <AwButton
                variant="secondary"
                iconLeft="chat"
                onClick={() => setOpenGeneric(true)}
              >
                Sem nome (fallback)
              </AwButton>
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead={`Import: import { AwContactChannelModal } from "@/components/ui/AwContactChannelModal".`}
          >
            <ApiTable>
              <PropRow
                prop="open"
                type="boolean"
                doc="Controla a visibilidade. Sempre controlado."
              />
              <PropRow
                prop="onClose"
                type="() => void"
                doc="Fecha (ESC, scrim, escolha de canal). Obrigatório."
              />
              <PropRow
                prop="managerName"
                type="string"
                doc='Nome do gerente no corpo. Ausente cai em "seu gerente de contas".'
              />
              <PropRow
                prop="onSelect"
                type="(key: string) => void"
                doc="Disparado ao escolher um canal (whatsapp|slack). Por padrão só fecha."
              />
            </ApiTable>
          </Section>
        </div>
      </div>

      <AwContactChannelModal
        open={openNamed}
        onClose={() => setOpenNamed(false)}
        managerName="Marina"
      />
      <AwContactChannelModal
        open={openGeneric}
        onClose={() => setOpenGeneric(false)}
      />
    </>
  )
}
