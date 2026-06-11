"use client";

/**
 * AwInputMessage — composer de mensagem com anexos, fila de envio e ações
 * contextuais, para chats e copilotos. Camada DS sobre o motor Fluid
 * (components/ui/fluid/input-message), já adaptado aos tokens AwSales.
 * Páginas importam SOMENTE este wrapper.
 */

import {
  InputMessage,
  type InputMessageProps,
  type InputMessageSlotContext,
  type QueuedMessage,
} from "@/components/ui/fluid/input-message";

export type AwInputMessageProps = InputMessageProps;
export type AwInputMessageSlotContext = InputMessageSlotContext;
export type AwQueuedMessage = QueuedMessage;

export function AwInputMessage(props: AwInputMessageProps) {
  return <InputMessage {...props} />;
}
