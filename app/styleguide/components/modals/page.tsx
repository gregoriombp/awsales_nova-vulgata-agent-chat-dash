import {
  PageHero,
  Section,
  Spec,
  PropRow,
  ApiTable,
  CodeExample,
  DoDont,
} from "../../_primitives"
import { ModalDemo } from "./ModalDemo"

export default function ModalsPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-10 py-14">
      <PageHero title="Modais">
        Interrupção centrada sobre scrim com blur. Animação discreta de
          entrada (8px bottom → 0), fecha no Esc e no clique do scrim — a
          menos que <code className="mono">dismissible={"{false}"}</code>.
          Largura máxima 520 px.
      </PageHero>

      <div className="flex flex-col gap-16">
        <Section
          id="demo"
          title="Demo"
          lead="Clique para abrir. Use Esc ou clique fora para fechar (exceto no não-dismissible)."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-8">
            <ModalDemo />
          </div>
        </Section>

        <Section
          id="patterns"
          title="Padrões"
          lead="Três tipos que cobrem 95% dos usos no produto."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <h5 className="m-0 mb-1">Confirmação de ação</h5>
              <p className="body-sm m-0">
                Copy curto, footer com <em>Cancelar</em> (ghost) e ação
                principal (primary).
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <h5 className="m-0 mb-1">Formulário inline</h5>
              <p className="body-sm m-0">
                2–4 campos no máximo. Mais que isso vira página — não modal.
              </p>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-5">
              <h5 className="m-0 mb-1">Ação destrutiva</h5>
              <p className="body-sm m-0">
                Ação principal vira <em>danger</em>. Nunca auto-fechar no
                sucesso — user precisa ver o efeito.
              </p>
            </div>
          </div>
        </Section>

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Scrim preto 55% com blur 8px. Sombra do modal: --shadow-overlay."
        >
          <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-raised)] p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec
              k="max width"
              v="520 px"
              d="Maior que isso é drawer ou página."
            />
            <Spec
              k="padding"
              v="32 px"
              d="Generoso — modais são momentos de foco."
            />
            <Spec
              k="radius"
              v="--radius-xl · 16 px"
              d="Levemente maior que cards."
            />
            <Spec
              k="scrim"
              v="rgba(0,0,0,.55) + blur 8px"
              d="Single focus — conteúdo atrás fica legível mas fora de foco."
            />
            <Spec
              k="shadow"
              v="--shadow-overlay"
              d="0 24px 64px rgba(0,0,0,.18)."
            />
            <Spec
              k="motion"
              v="180 ms --ease-out"
              d="Translate 8px + fade. Sem scale, sem bounce."
            />
            <Spec
              k="close button"
              v="28 px · --radius-sm"
              d="Só aparece quando há title."
            />
            <Spec
              k="esc"
              v="fecha sempre"
              d="Mesmo quando dismissible={false}, Esc permanece ativo."
            />
            <Spec
              k="scroll lock"
              v="body overflow: hidden"
              d="Restaurado ao fechar."
            />
          </div>
        </Section>

        <Section
          id="api"
          title="API"
          lead={`Import: import { AwModal } from "@/components/ui/AwModal".`}
        >
          <ApiTable>
            <PropRow
              prop="open"
              type="boolean"
              doc="Controle externo — modal renderiza apenas quando true."
            />
            <PropRow
              prop="onClose"
              type="() => void"
              doc="Invocado em Esc, clique no scrim (se dismissible) e no botão fechar."
            />
            <PropRow
              prop="title"
              type="string"
              doc="Opcional. Renderiza header com botão fechar."
            />
            <PropRow
              prop="children"
              type="ReactNode"
              doc="Corpo do modal."
            />
            <PropRow
              prop="footer"
              type="ReactNode"
              doc="Footer alinhado à direita. Normalmente AwButton ghost + primary."
            />
            <PropRow
              prop="dismissible"
              type="boolean"
              def="true"
              doc="Quando false, clique-fora não fecha."
            />
          </ApiTable>

          <CodeExample>{`"use client"
import { useState } from "react"
import { AwModal } from "@/components/ui/AwModal"
import { AwButton } from "@/components/ui/AwButton"

const [open, setOpen] = useState(false)

<AwButton onClick={() => setOpen(true)}>Publicar</AwButton>

<AwModal
  open={open}
  onClose={() => setOpen(false)}
  title="Publicar agente"
  footer={
    <>
      <AwButton variant="ghost" onClick={() => setOpen(false)}>
        Cancelar
      </AwButton>
      <AwButton variant="primary" onClick={handlePublish}>
        Publicar agora
      </AwButton>
    </>
  }
>
  O agente começa a receber tráfego real no canal conectado.
</AwModal>`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>Esc e botão fechar sempre habilitados — acessibilidade é default.</>,
              <>Ação primária no footer, do lado direito.</>,
              <>Ação destrutiva usa <em>danger</em> sempre, nunca primary.</>,
            ]}
            donts={[
              <>Modal dentro de modal — redesenhe o fluxo.</>,
              <>Formulário com rolagem vertical longa — vira página.</>,
              <>Auto-fechamento por timer. Usuário decide quando fechar.</>,
              <>Scrim transparente — perde o ponto do modal.</>,
            ]}
          />
        </Section>
      </div>
    </div>
  )
}
