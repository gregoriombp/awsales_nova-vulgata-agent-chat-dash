"use client";

/**
 * AwAskUserQuestions — formulário conversacional de perguntas (single/multi)
 * para wizards e fluxos guiados. Camada DS sobre o motor Fluid
 * (components/ui/fluid/ask-user-questions), já adaptado aos tokens AwSales.
 * Páginas importam SOMENTE este wrapper.
 */

import {
  AskUserQuestions,
  type AskUserQuestionsProps,
  type AskUserQuestion,
  type AskUserOption,
  type AskUserAnswer,
} from "@/components/ui/fluid/ask-user-questions";

export type AwAskUserQuestionsProps = AskUserQuestionsProps;
export type AwAskUserQuestion = AskUserQuestion;
export type AwAskUserOption = AskUserOption;
export type AwAskUserAnswer = AskUserAnswer;

export function AwAskUserQuestions(props: AwAskUserQuestionsProps) {
  return <AskUserQuestions {...props} />;
}
