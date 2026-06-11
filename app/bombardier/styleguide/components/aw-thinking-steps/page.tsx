"use client";

import * as React from "react";
import { PageHero, Section, Stage } from "../../_primitives";
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
    <div className="flex flex-col gap-14">
      <PageHero title="Thinking steps">
        Linha do tempo do raciocínio do agente: passos que entram com animação de altura,
        detalhes expansíveis e fontes como badges. Motor Fluid adaptado aos tokens AwSales;
        importe somente os componentes AwThinkingSteps*.
      </PageHero>

      <Section
        id="raciocinio"
        title="Raciocínio em andamento"
        lead="Passos concluídos, um passo ativo e fontes consultadas — o padrão para o copiloto e para o review de execução do agente."
      >
        <Stage label="Composição completa">
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
    </div>
  );
}
