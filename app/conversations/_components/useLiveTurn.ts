"use client";

/**
 * useLiveTurn — toca o `pendingTurn` da conversa aberta em tempo real: revela os
 * passos de raciocínio um a um e, ao terminar de "pensar", digita a resposta.
 *
 * O frame é função do tempo decorrido. O relógio vive no efeito (que pode ter
 * efeitos colaterais), nunca no render — o render é puro: sem `pendingTurn`
 * devolve IDLE; com turno novo (ainda sem tick) devolve o frame inicial estático
 * (frameAt 0); senão, o último frame calculado pelo intervalo. O id da conversa
 * carimba o estado para não vazar o texto de uma conversa na outra. Mock do
 * Execution Engine; em produção isto viria por stream do backend.
 */

import { useEffect, useState } from "react";
import type { Conversation, PendingTurn } from "@/lib/conversations";

export type LivePhase = "idle" | "thinking" | "answering" | "done";

export type LiveTurn = {
  phase: LivePhase;
  revealedSteps: number;
  activeStepIndex: number;
  answerText: string;
};

const STEP_MS = 820; // duração de cada passo de raciocínio
const PRE_ANSWER_MS = 380; // respiro entre terminar de pensar e começar a digitar
const CHAR_MS = 11; // velocidade de digitação

const IDLE: LiveTurn = {
  phase: "idle",
  revealedSteps: 0,
  activeStepIndex: -1,
  answerText: "",
};

function totalMs(pending: PendingTurn) {
  return STEP_MS * pending.thinking.length + PRE_ANSWER_MS + CHAR_MS * pending.answer.length;
}

function frameAt(pending: PendingTurn, elapsed: number): LiveTurn {
  const stepCount = pending.thinking.length;
  const thinkDur = STEP_MS * stepCount;
  const answerStart = thinkDur + PRE_ANSWER_MS;
  const answer = pending.answer;
  const total = answerStart + CHAR_MS * answer.length;

  if (elapsed < thinkDur) {
    const idx = Math.min(stepCount - 1, Math.floor(elapsed / STEP_MS));
    return { phase: "thinking", revealedSteps: idx + 1, activeStepIndex: idx, answerText: "" };
  }
  if (elapsed < answerStart) {
    return { phase: "thinking", revealedSteps: stepCount, activeStepIndex: -1, answerText: "" };
  }
  if (elapsed < total) {
    const chars = Math.min(answer.length, Math.floor((elapsed - answerStart) / CHAR_MS));
    return { phase: "answering", revealedSteps: stepCount, activeStepIndex: -1, answerText: answer.slice(0, chars) };
  }
  return { phase: "done", revealedSteps: stepCount, activeStepIndex: -1, answerText: answer };
}

export function useLiveTurn(conv: Conversation | undefined): LiveTurn {
  const pending = conv?.pendingTurn;
  const [st, setSt] = useState<{ id?: string; frame: LiveTurn }>({ frame: IDLE });

  useEffect(() => {
    const c = conv;
    const p = c?.pendingTurn;
    if (!c || !p) return;
    const start = performance.now();
    const total = totalMs(p);
    const id = window.setInterval(() => {
      const elapsed = performance.now() - start;
      setSt({ id: c.id, frame: frameAt(p, elapsed) });
      if (elapsed >= total) window.clearInterval(id);
    }, 1000 / 30);
    return () => window.clearInterval(id);
  }, [conv]);

  if (!pending) return IDLE;
  // Turno recém-aberto, antes do primeiro tick: frame inicial estático.
  if (st.id !== conv?.id) return frameAt(pending, 0);
  return st.frame;
}
