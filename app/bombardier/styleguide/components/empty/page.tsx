"use client"

import { AwButton } from "@/components/ui/AwButton"
import {
  AwEmpty,
  AwEmptyContent,
  AwEmptyDescription,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
} from "@/components/ui/AwEmpty"
import { Icon } from "@/components/ui/Icon"
import {
  PageHero,
  Section,
  Stage,
  PropRow,
  ApiTable,
  CodeExample,
  DoDont,
} from "../../_primitives"

export default function EmptyPage() {
  return (
    <>
      <PageHero title="Empty">
        Zero-state composto — header com mídia opcional, título,
        descrição, e content area para CTAs. Port direto da receita do
        shadcn <code className="mono">Empty</code>, adaptado aos tokens
        AwSales.
      </PageHero>
      <div className="max-w-[1200px] mx-auto px-10 pb-14">
        <div className="flex flex-col gap-16">
          <Section
            id="basic"
            title="Básico"
            lead="Composição mínima — header com título e descrição."
          >
            <Stage label="AwEmpty + AwEmptyHeader" gridClassName="block">
              <AwEmpty>
                <AwEmptyHeader>
                  <AwEmptyTitle>Sem dados ainda</AwEmptyTitle>
                  <AwEmptyDescription>
                    Quando houver atividade, ela aparece aqui.
                  </AwEmptyDescription>
                </AwEmptyHeader>
              </AwEmpty>
            </Stage>
          </Section>

          <Section
            id="with-media"
            title="Com mídia (icon)"
            lead="AwEmptyMedia variant='icon' embrulha o ícone num círculo de superfície."
          >
            <Stage label="Search-off · ícone com tile" gridClassName="block">
              <AwEmpty>
                <AwEmptyHeader>
                  <AwEmptyMedia variant="icon">
                    <Icon name="search_off" size={28} />
                  </AwEmptyMedia>
                  <AwEmptyTitle>Nenhuma integração encontrada</AwEmptyTitle>
                  <AwEmptyDescription>
                    Tente outro termo ou troque a categoria.
                  </AwEmptyDescription>
                </AwEmptyHeader>
              </AwEmpty>
            </Stage>
          </Section>

          <Section
            id="with-cta"
            title="Com ação"
            lead="AwEmptyContent recebe os CTAs. Normalmente um primário e um secundário."
          >
            <Stage label="Content · 2 botões" gridClassName="block">
              <AwEmpty>
                <AwEmptyHeader>
                  <AwEmptyMedia variant="icon">
                    <Icon name="folder_open" size={28} />
                  </AwEmptyMedia>
                  <AwEmptyTitle>Nenhum projeto criado</AwEmptyTitle>
                  <AwEmptyDescription>
                    Comece criando seu primeiro projeto ou importe um existente.
                  </AwEmptyDescription>
                </AwEmptyHeader>
                <AwEmptyContent>
                  <AwButton variant="primary" iconLeft="add">
                    Criar projeto
                  </AwButton>
                  <AwButton variant="secondary" iconLeft="upload">
                    Importar
                  </AwButton>
                </AwEmptyContent>
              </AwEmpty>
            </Stage>
          </Section>

          <Section
            id="api"
            title="API"
            lead={`Import: import { AwEmpty, AwEmptyHeader, AwEmptyMedia, AwEmptyTitle, AwEmptyDescription, AwEmptyContent } from "@/components/ui/AwEmpty".`}
          >
            <ApiTable>
              <PropRow
                prop="AwEmpty"
                type="HTMLAttributes<HTMLDivElement>"
                doc="Container raiz. Padding 64×24, gap 16."
              />
              <PropRow
                prop="AwEmptyHeader"
                type="HTMLAttributes<HTMLDivElement>"
                doc="Stack vertical centralizado com gap 8 — segura mídia, título e descrição."
              />
              <PropRow
                prop="AwEmptyMedia"
                type='{ variant?: "default" | "icon" }'
                def='"default"'
                doc="icon embrulha em círculo --bg-surface 56×56."
              />
              <PropRow
                prop="AwEmptyTitle"
                type="HTMLAttributes<HTMLHeadingElement>"
                doc="<h3> 16px / 600. Cor --fg-primary."
              />
              <PropRow
                prop="AwEmptyDescription"
                type="HTMLAttributes<HTMLParagraphElement>"
                doc="<p> 13.5px / 1.5. Cor --fg-secondary."
              />
              <PropRow
                prop="AwEmptyContent"
                type="HTMLAttributes<HTMLDivElement>"
                doc="Slot para CTAs. Flex row centralizado, gap 8."
              />
            </ApiTable>
            <CodeExample>{`import {
  AwEmpty, AwEmptyHeader, AwEmptyMedia,
  AwEmptyTitle, AwEmptyDescription, AwEmptyContent
} from "@/components/ui/AwEmpty"
import { Icon } from "@/components/ui/Icon"
import { AwButton } from "@/components/ui/AwButton"

<AwEmpty>
  <AwEmptyHeader>
    <AwEmptyMedia variant="icon">
      <Icon name="folder_open" size={28} />
    </AwEmptyMedia>
    <AwEmptyTitle>Nenhum projeto</AwEmptyTitle>
    <AwEmptyDescription>Crie ou importe.</AwEmptyDescription>
  </AwEmptyHeader>
  <AwEmptyContent>
    <AwButton variant="primary">Criar</AwButton>
  </AwEmptyContent>
</AwEmpty>`}</CodeExample>
          </Section>

          <Section id="do-dont" title="Do / Don't">
            <DoDont
              dos={[
                <>Mantenha a hierarquia título → descrição → ação.</>,
                <>Use mídia icon para reforçar contexto, não decorar.</>,
                <>Botão primário sozinho ou primário + ghost — máximo dois.</>,
              ]}
              donts={[
                <>Empty state sem ação quando há ação possível.</>,
                <>Texto longo na descrição — uma frase resolve.</>,
                <>Empty states encadeados na mesma página.</>,
              ]}
            />
          </Section>
        </div>
      </div>
    </>
  )
}
