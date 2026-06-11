"use client";

/**
 * AwThinkingSteps — linha do tempo de raciocínio do agente (passos, detalhes,
 * fontes e imagens) com entrada animada. Camada DS sobre o motor Fluid
 * (components/ui/fluid/thinking-steps), já adaptado aos tokens AwSales.
 * Ícones dos passos usam nomes Material Symbols. Páginas importam SOMENTE
 * este wrapper.
 */

import {
  ThinkingSteps,
  ThinkingStepsHeader,
  ThinkingStepsContent,
  ThinkingStep,
  ThinkingStepDetails,
  ThinkingStepSources,
  ThinkingStepSource,
  ThinkingStepImage,
  type ThinkingStepsProps,
  type ThinkingStepProps,
  type ThinkingStepDetailsProps,
  type ThinkingStepSourceProps,
  type StepStatus,
} from "@/components/ui/fluid/thinking-steps";

export const AwThinkingSteps = ThinkingSteps;
export const AwThinkingStepsHeader = ThinkingStepsHeader;
export const AwThinkingStepsContent = ThinkingStepsContent;
export const AwThinkingStep = ThinkingStep;
export const AwThinkingStepDetails = ThinkingStepDetails;
export const AwThinkingStepSources = ThinkingStepSources;
export const AwThinkingStepSource = ThinkingStepSource;
export const AwThinkingStepImage = ThinkingStepImage;

export type AwThinkingStepsProps = ThinkingStepsProps;
export type AwThinkingStepProps = ThinkingStepProps;
export type AwThinkingStepDetailsProps = ThinkingStepDetailsProps;
export type AwThinkingStepSourceProps = ThinkingStepSourceProps;
export type AwStepStatus = StepStatus;
