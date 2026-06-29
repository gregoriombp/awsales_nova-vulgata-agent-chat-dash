"use client";

/**
 * AgentReasoning — a linha de pensamento de uma resposta do agente. Mesma peça
 * para os dois modos da tela:
 *   • histórico → recolhida (defaultOpen=false), todos os passos concluídos;
 *   • ao vivo   → aberta, passos entrando um a um, o atual em "active".
 *
 * Camada de feature: compõe AwThinkingSteps* + AwSourceChip. Não é DS.
 */

import {
  AwThinkingSteps,
  AwThinkingStepsHeader,
  AwThinkingStepsContent,
  AwThinkingStep,
  AwThinkingStepDetails,
  AwThinkingStepSources,
  AwThinkingStepSource,
} from "@/components/ui/AwThinkingSteps";
import { Icon } from "@/components/ui/Icon";
import type { ReasoningStep } from "@/lib/conversations";

export function AgentReasoning({
  steps,
  /** Quantos passos exibir (modo ao vivo). Default: todos. */
  revealed,
  /** Índice do passo "active" (modo ao vivo). -1 → todos concluídos. */
  activeIndex = -1,
  defaultOpen = false,
  live = false,
}: {
  steps: ReasoningStep[];
  revealed?: number;
  activeIndex?: number;
  defaultOpen?: boolean;
  live?: boolean;
}) {
  const count = revealed ?? steps.length;
  const visible = steps.slice(0, count);

  if (visible.length === 0) return null;

  return (
    <AwThinkingSteps
      defaultOpen={defaultOpen}
      className="w-full rounded-lg bg-(--bg-canvas) px-2.5 py-1.5"
    >
      <AwThinkingStepsHeader>
        <span className="inline-flex items-center gap-1.5">
          <Icon
            name="neurology"
            size={15}
            className={live ? "text-(--accent-brand)" : "text-(--fg-tertiary)"}
          />
          {live ? "Raciocinando" : "Linha de pensamento"}
          <span className="text-(--fg-tertiary)">· {steps.length}</span>
        </span>
      </AwThinkingStepsHeader>
      <AwThinkingStepsContent>
        {visible.map((step, i) => {
          const status = i === activeIndex ? "active" : "complete";
          const isLast = i === visible.length - 1;
          const hasChildren = !!step.sources?.length || !!step.details;
          return (
            <AwThinkingStep
              key={i}
              index={i}
              icon={step.icon}
              label={step.label}
              description={step.description}
              status={status}
              isLast={isLast}
            >
              {hasChildren && (
                <>
                  {step.sources && step.sources.length > 0 && (
                    <AwThinkingStepSources>
                      {step.sources.map((s, si) => (
                        <AwThinkingStepSource
                          key={si}
                          color={s.color ?? "gray"}
                          delay={si * 0.06}
                        >
                          {s.label}
                        </AwThinkingStepSource>
                      ))}
                    </AwThinkingStepSources>
                  )}
                  {step.details && (
                    <AwThinkingStepDetails
                      summary={step.details.summary}
                      details={step.details.items}
                    />
                  )}
                </>
              )}
            </AwThinkingStep>
          );
        })}
      </AwThinkingStepsContent>
    </AwThinkingSteps>
  );
}
