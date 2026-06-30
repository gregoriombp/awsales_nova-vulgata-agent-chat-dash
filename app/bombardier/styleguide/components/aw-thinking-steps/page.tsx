"use client";

import * as React from "react";
import {
  ApiTable,
  CodeExample,
  DoDont,
  PageHero,
  PropRow,
  RelatedLinks,
  Section,
  Spec,
  Stage,
  Tldr,
  Toc,
  TokensConsumed,
} from "../../_primitives";
import {
  AwThinkingSteps,
  AwThinkingStepsHeader,
  AwThinkingStepsContent,
  AwThinkingStep,
  AwThinkingStepDetails,
  AwThinkingStepSources,
  AwThinkingStepSource,
} from "@/components/ui/AwThinkingSteps";

export default function Page() {
  const [rodada, setRodada] = React.useState(0);

  return (
    <>
      <PageHero title="Thinking steps">
        Linha do tempo do raciocínio do agente: passos que entram com animação de
        altura, um passo ativo com pulso, detalhes expansíveis e fontes como
        badges. Motor Fluid adaptado aos tokens AwSales — as páginas importam
        somente os componentes <code className="mono">AwThinkingSteps*</code>.
      </PageHero>

      <div className="max-w-[1200px] mx-auto px-10 pb-14 flex flex-col gap-16">
        <Toc
          items={[
            { id: "anatomy", label: "Anatomia" },
            { id: "preview", label: "Preview base" },
            { id: "status", label: "Status do passo" },
            { id: "sources", label: "Fontes" },
            { id: "details", label: "Detalhes" },
            { id: "api", label: "API" },
            { id: "tokens", label: "Tokens" },
            { id: "code", label: "Código" },
            { id: "do-dont", label: "Do / Don't" },
          ]}
        />

        <Tldr
          use={[
            <>
              No copiloto (Cortex) e no review de execução, pra mostrar o que o
              agente está fazendo enquanto pensa.
            </>,
            <>
              Quando há etapas reais a expor — busca de contexto, consulta a
              regras, fontes consultadas — e não só um spinner.
            </>,
            <>
              Em streaming: passos viram <code className="mono">complete</code>{" "}
              conforme terminam e o próximo entra como{" "}
              <code className="mono">active</code>.
            </>,
          ]}
          dontUse={[
            <>
              Como loader genérico de página — pra &ldquo;carregando&rdquo; sem
              etapas use um spinner ou skeleton.
            </>,
            <>
              Pra um log técnico longo e cru — isto é uma narrativa curta do
              raciocínio, não o stdout do agente.
            </>,
            <>
              Fora do contexto de um agente: é a voz do agente pensando, não um
              stepper de formulário.
            </>,
          ]}
        />

        <Section
          id="anatomy"
          title="Anatomia"
          lead="Um cabeçalho colapsável e uma lista de passos conectados por uma linha vertical. Cada passo tem marcador (ícone Material Symbols ou dot), rótulo, descrição opcional e — opcionalmente — fontes ou um bloco de detalhes."
        >
          <div className="rounded-lg border border-(--border-subtle) bg-(--bg-raised) p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Spec
              k="estrutura"
              v="Steps > Header + Content"
              d="O Content guarda os AwThinkingStep; o Header é o gatilho de colapso."
            />
            <Spec
              k="marcador"
              v="ícone | dot"
              d="icon = glyph Material Symbols; sem icon, cai no dot padrão."
            />
            <Spec
              k="status"
              v="complete · active · pending"
              d="active pulsa; pending não renderiza (passo ainda não alcançado)."
            />
            <Spec
              k="entrada"
              v="altura animada"
              d="Cada passo anima de height 0 → auto; use delay pra escalonar."
            />
            <Spec
              k="colapso"
              v="defaultOpen | open/onOpenChange"
              d="Não-controlado por padrão; controle externo via open + onOpenChange."
            />
            <Spec
              k="slots por passo"
              v="Sources · Details · Image"
              d="Filhos do passo: badges de fonte, detalhes expansíveis ou imagem."
            />
          </div>
        </Section>

        <Section
          id="preview"
          title="Preview base"
          lead="Passos concluídos, um passo ativo e fontes consultadas — o padrão para o copiloto e para o review de execução do agente."
        >
          <Stage label="Composição completa" gridClassName="block">
            <div className="mx-auto w-full max-w-md" key={rodada}>
              <AwThinkingSteps defaultOpen>
                <AwThinkingStepsHeader>Pensando</AwThinkingStepsHeader>
                <AwThinkingStepsContent>
                  <AwThinkingStep
                    index={0}
                    icon="search"
                    label="Buscando contexto do lead"
                    description="Histórico de conversas e etapa do funil"
                    status="complete"
                  >
                    <AwThinkingStepSources>
                      <AwThinkingStepSource color="blue">CRM</AwThinkingStepSource>
                      <AwThinkingStepSource color="emerald" delay={0.06}>
                        Memory Base
                      </AwThinkingStepSource>
                    </AwThinkingStepSources>
                  </AwThinkingStep>
                  <AwThinkingStep
                    index={1}
                    icon="menu_book"
                    label="Consultando a política de descontos"
                    status="complete"
                  >
                    <AwThinkingStepDetails
                      summary="2 regras aplicáveis"
                      details={[
                        "Desconto máximo de 10% sem aprovação",
                        "Frete grátis somente acima de R$ 300",
                      ]}
                    />
                  </AwThinkingStep>
                  <AwThinkingStep
                    index={2}
                    label="Escrevendo a resposta"
                    status="active"
                    isLast
                  />
                </AwThinkingStepsContent>
              </AwThinkingSteps>
              <button
                type="button"
                onClick={() => setRodada((n) => n + 1)}
                className="mt-6 text-xs text-fg-muted underline underline-offset-2"
              >
                Repetir animação de entrada
              </button>
            </div>
          </Stage>
        </Section>

        <Section
          id="status"
          title="Status do passo"
          lead="complete fica estático com o marcador preenchido; active ganha o pulso enquanto o agente trabalha. pending retorna null de propósito — o passo só aparece quando é alcançado, então a lista cresce conforme o raciocínio avança."
        >
          <Stage label="complete + active (pending fica oculto)" gridClassName="block">
            <div className="mx-auto w-full max-w-md">
              <AwThinkingSteps defaultOpen>
                <AwThinkingStepsHeader>Pensando</AwThinkingStepsHeader>
                <AwThinkingStepsContent>
                  <AwThinkingStep
                    index={0}
                    icon="search"
                    label="Contexto recuperado"
                    status="complete"
                  />
                  <AwThinkingStep
                    index={1}
                    icon="bolt"
                    label="Avaliando a melhor resposta"
                    status="active"
                  />
                  <AwThinkingStep
                    index={2}
                    label="Enviando (ainda não alcançado)"
                    status="pending"
                    isLast
                  />
                </AwThinkingStepsContent>
              </AwThinkingSteps>
            </div>
          </Stage>
        </Section>

        <Section
          id="sources"
          title="Fontes"
          lead="Badges coloridas abaixo do passo, listando de onde o agente puxou contexto. A cor vem da paleta de badges (BadgeColor); escalone a entrada com delay."
        >
          <Stage label="AwThinkingStepSources" gridClassName="block">
            <div className="mx-auto w-full max-w-md">
              <AwThinkingSteps defaultOpen>
                <AwThinkingStepsHeader>Pensando</AwThinkingStepsHeader>
                <AwThinkingStepsContent>
                  <AwThinkingStep
                    index={0}
                    icon="search"
                    label="Reunindo contexto"
                    status="complete"
                    isLast
                  >
                    <AwThinkingStepSources>
                      <AwThinkingStepSource color="blue">CRM</AwThinkingStepSource>
                      <AwThinkingStepSource color="emerald" delay={0.06}>
                        Memory Base
                      </AwThinkingStepSource>
                      <AwThinkingStepSource color="purple" delay={0.12}>
                        Biblioteca
                      </AwThinkingStepSource>
                      <AwThinkingStepSource color="amber" delay={0.18}>
                        AOPs
                      </AwThinkingStepSource>
                    </AwThinkingStepSources>
                  </AwThinkingStep>
                </AwThinkingStepsContent>
              </AwThinkingSteps>
            </div>
          </Stage>
        </Section>

        <Section
          id="details"
          title="Detalhes"
          lead="Um resumo clicável que expande uma lista de itens — pra quando o passo tem substância que nem todo mundo quer ver de cara."
        >
          <Stage label="AwThinkingStepDetails" gridClassName="block">
            <div className="mx-auto w-full max-w-md">
              <AwThinkingSteps defaultOpen>
                <AwThinkingStepsHeader>Pensando</AwThinkingStepsHeader>
                <AwThinkingStepsContent>
                  <AwThinkingStep
                    index={0}
                    icon="menu_book"
                    label="Consultando a política de descontos"
                    status="complete"
                    isLast
                  >
                    <AwThinkingStepDetails
                      summary="2 regras aplicáveis"
                      details={[
                        "Desconto máximo de 10% sem aprovação",
                        "Frete grátis somente acima de R$ 300",
                      ]}
                    />
                  </AwThinkingStep>
                </AwThinkingStepsContent>
              </AwThinkingSteps>
            </div>
          </Stage>
        </Section>

        <Section
          id="api"
          title="API"
          lead="Importe sempre os wrappers AwThinkingSteps*. Abaixo, as props de cada peça da composição."
        >
          <div className="flex flex-col gap-8">
            <div>
              <div className="aw-eyebrow mb-3">AwThinkingSteps · raiz</div>
              <ApiTable>
                <PropRow
                  prop="defaultOpen"
                  type="boolean"
                  def="false"
                  doc="Abre a lista já expandida no primeiro render (não-controlado)."
                />
                <PropRow
                  prop="open"
                  type="boolean"
                  doc="Estado controlado de aberto/fechado. Use junto com onOpenChange."
                />
                <PropRow
                  prop="onOpenChange"
                  type="(open: boolean) => void"
                  doc="Callback quando o usuário colapsa/expande no modo controlado."
                />
                <PropRow
                  prop="children"
                  type="ReactNode"
                  doc="AwThinkingStepsHeader + AwThinkingStepsContent."
                />
              </ApiTable>
            </div>

            <div>
              <div className="aw-eyebrow mb-3">AwThinkingStep · passo</div>
              <ApiTable>
                <PropRow
                  prop="index"
                  type="number"
                  doc="Posição do passo (0-based). Obrigatório — ordena a animação."
                />
                <PropRow
                  prop="label"
                  type="string"
                  doc="Texto principal do passo. Obrigatório."
                />
                <PropRow
                  prop="status"
                  type='"complete" | "active" | "pending"'
                  def='"complete"'
                  doc="active pulsa; pending retorna null (passo ainda não alcançado)."
                />
                <PropRow
                  prop="icon"
                  type="string"
                  doc="Glyph Material Symbols do marcador. Sem icon, usa o dot padrão."
                />
                <PropRow
                  prop="showIcon"
                  type="boolean"
                  def="true"
                  doc="Desliga o marcador quando false."
                />
                <PropRow
                  prop="description"
                  type="string"
                  doc="Linha secundária abaixo do label."
                />
                <PropRow
                  prop="delay"
                  type="number"
                  def="0"
                  doc="Atraso (s) da animação de entrada — escalona vários passos."
                />
                <PropRow
                  prop="isLast"
                  type="boolean"
                  def="false"
                  doc="Marca o último passo; encerra a linha conectora vertical."
                />
                <PropRow
                  prop="children"
                  type="ReactNode"
                  doc="Sources, Details ou Image do passo."
                />
              </ApiTable>
            </div>

            <div>
              <div className="aw-eyebrow mb-3">
                AwThinkingStepDetails · detalhes expansíveis
              </div>
              <ApiTable>
                <PropRow
                  prop="summary"
                  type="string"
                  doc="Resumo clicável que expande a lista. Obrigatório."
                />
                <PropRow
                  prop="details"
                  type="string[]"
                  doc="Itens revelados ao expandir."
                />
                <PropRow
                  prop="defaultOpen"
                  type="boolean"
                  def="false"
                  doc="Já começa expandido."
                />
              </ApiTable>
            </div>

            <div>
              <div className="aw-eyebrow mb-3">
                AwThinkingStepSource · badge de fonte
              </div>
              <ApiTable>
                <PropRow
                  prop="color"
                  type="BadgeColor"
                  def='"gray"'
                  doc="gray · red · amber · lime · emerald · teal · blue · purple · pink · slate."
                />
                <PropRow
                  prop="delay"
                  type="number"
                  def="0"
                  doc="Atraso (s) da entrada — escalona as fontes em sequência."
                />
                <PropRow
                  prop="children"
                  type="ReactNode"
                  doc="Rótulo da fonte (ex.: CRM, Memory Base)."
                />
              </ApiTable>
            </div>

            <div>
              <div className="aw-eyebrow mb-3">AwThinkingStepImage · imagem</div>
              <ApiTable>
                <PropRow
                  prop="src"
                  type="string"
                  doc="URL da imagem (ex.: print, gráfico gerado). Obrigatório."
                />
                <PropRow prop="alt" type="string" doc="Texto alternativo." />
                <PropRow
                  prop="caption"
                  type="string"
                  doc="Legenda abaixo da imagem."
                />
                <PropRow
                  prop="delay"
                  type="number"
                  def="0"
                  doc="Atraso (s) da animação de entrada."
                />
              </ApiTable>
            </div>
          </div>
        </Section>

        <Section
          id="tokens"
          title="Tokens"
          lead="O motor Fluid já está reescrito nos tokens AwSales — nada de cor crua. As badges de fonte puxam a paleta --aw-* via BadgeColor."
        >
          <TokensConsumed
            tokens={[
              {
                token: "--fg-primary",
                role: "Rótulo do passo e marcador concluído.",
              },
              {
                token: "--fg-muted",
                role: "Descrição, marcador inativo e gatilho de detalhes.",
              },
              {
                token: "--border-subtle",
                role: "Linha conectora vertical entre os passos.",
              },
              {
                token: "--aw-{cor}-*",
                role: "Fundo e texto das badges de fonte (via BadgeColor).",
              },
            ]}
          />
        </Section>

        <Section
          id="code"
          title="Código"
          lead="Composição típica no copiloto: dois passos concluídos (um com fontes, um com detalhes) e o passo ativo no fim."
        >
          <CodeExample label="composição">{`<AwThinkingSteps defaultOpen>
  <AwThinkingStepsHeader>Pensando</AwThinkingStepsHeader>
  <AwThinkingStepsContent>
    <AwThinkingStep
      index={0}
      icon="search"
      label="Buscando contexto do lead"
      description="Histórico de conversas e etapa do funil"
      status="complete"
    >
      <AwThinkingStepSources>
        <AwThinkingStepSource color="blue">CRM</AwThinkingStepSource>
        <AwThinkingStepSource color="emerald" delay={0.06}>
          Memory Base
        </AwThinkingStepSource>
      </AwThinkingStepSources>
    </AwThinkingStep>

    <AwThinkingStep
      index={1}
      icon="menu_book"
      label="Consultando a política de descontos"
      status="complete"
    >
      <AwThinkingStepDetails
        summary="2 regras aplicáveis"
        details={[
          "Desconto máximo de 10% sem aprovação",
          "Frete grátis somente acima de R$ 300",
        ]}
      />
    </AwThinkingStep>

    <AwThinkingStep index={2} label="Escrevendo a resposta" status="active" isLast />
  </AwThinkingStepsContent>
</AwThinkingSteps>`}</CodeExample>
        </Section>

        <Section id="do-dont" title="Do / Don't">
          <DoDont
            dos={[
              <>
                Mantenha os rótulos curtos e na voz do agente — &ldquo;Buscando
                contexto do lead&rdquo;, não &ldquo;GET /leads/:id&rdquo;.
              </>,
              <>
                Deixe um único passo <code className="mono">active</code> por
                vez; os anteriores viram <code className="mono">complete</code>.
              </>,
              <>
                Use fontes pra dar transparência: mostre de onde o agente puxou o
                contexto.
              </>,
            ]}
            donts={[
              <>
                Não empilhe vários passos <code className="mono">active</code> —
                some o sentido de progresso.
              </>,
              <>
                Não jogue o log cru do agente aqui; resuma o raciocínio em poucos
                passos.
              </>,
              <>
                Não importe os componentes <code className="mono">fluid/*</code>{" "}
                direto — só os wrappers <code className="mono">AwThinkingSteps*</code>.
              </>,
            ]}
          />
        </Section>

        <RelatedLinks
          items={[
            {
              name: "Cortex synthesis",
              href: "/bombardier/styleguide/components/aw-cortex-synthesis",
              description:
                "A textura viva atrás do Cortex — onde os thinking steps costumam aparecer.",
            },
            {
              name: "Agents",
              href: "/bombardier/styleguide/components/agents",
              description:
                "Avatares e orbs de agente que dão a identidade visual ao raciocínio.",
            },
            {
              name: "User & agent",
              href: "/bombardier/styleguide/components/user-agent",
              description:
                "Bolhas de conversa onde o copiloto expõe os passos enquanto pensa.",
            },
          ]}
        />
      </div>
    </>
  );
}
