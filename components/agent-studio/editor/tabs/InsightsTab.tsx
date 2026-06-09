"use client";

import { Icon } from "@/components/ui/Icon";
import {
  AwEmpty,
  AwEmptyHeader,
  AwEmptyMedia,
  AwEmptyTitle,
  AwEmptyDescription,
} from "@/components/ui/AwEmpty";
import type { AgentEditorData } from "@/lib/agentStudio";

/**
 * Insights — seção intencionalmente "Em breve".
 * Sem CTA: a página só comunica o que vai morar aqui.
 */
export function InsightsTab({ data }: { data: AgentEditorData }) {
  void data;
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <AwEmpty>
        <AwEmptyHeader>
          <AwEmptyMedia variant="icon">
            <Icon name="auto_awesome" size={24} />
          </AwEmptyMedia>
          <AwEmptyTitle>Em breve</AwEmptyTitle>
          <AwEmptyDescription>
            Confira aqui insights e recomendações para melhorar o desempenho e
            as configurações deste agente.
          </AwEmptyDescription>
        </AwEmptyHeader>
      </AwEmpty>
    </div>
  );
}
