"use client";

import { Icon } from "@/components/ui/Icon";
import { AwButton } from "@/components/ui/AwButton";

/* ───────── Entrevista de calibragem (passo 7 do wizard) ─────────
 * Entre a configuração e a geração do agente, o sistema faz 3 perguntas
 * de calibragem — uma por tela — geradas a partir do objetivo escolhido.
 * Card branco centrado flutuando sobre um gradiente animado (azul + pêssego).
 * A pergunta atual vive na URL (?step=7&q=1..3) pelo Review Mode escopar
 * comentários por tela; as respostas ficam no estado do wizard. */

export const INTERVIEW_OTHER_ID = "outro";

export interface InterviewAnswer {
  optionId: string | null;
  otherText: string;
}

export const EMPTY_INTERVIEW_ANSWER: InterviewAnswer = {
  optionId: null,
  otherText: "",
};

interface InterviewOption {
  id: string;
  title: string;
  /** Linha secundária: exemplo de mensagem (entre aspas) ou descrição curta. */
  detail: string;
  recommended?: boolean;
}

interface InterviewQuestion {
  title: string;
  options: InterviewOption[];
  /** Placeholder do campo livre quando "Outro..." está selecionado. */
  otherPlaceholder: string;
}

export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    title: "Como o agente deve iniciar a conversa no WhatsApp?",
    options: [
      {
        id: "empatica",
        title: "Abordagem empática",
        detail:
          "“Oi, vi que não conseguimos seu adiantamento. Ficou alguma dúvida sobre o processo?”",
        recommended: true,
      },
      {
        id: "urgencia",
        title: "Abordagem de urgência",
        detail:
          "“Olá, sua aprovação está pendente. Vamos agendar para liberar seu dinheiro em 24h?”",
      },
      {
        id: "consultiva",
        title: "Abordagem consultiva",
        detail:
          "“Olá, sou da Fyntra. Quero entender melhor o seu caso antes de aplicarmos o adiantamento.”",
      },
      {
        id: INTERVIEW_OTHER_ID,
        title: "Outro...",
        detail: "Descreva com suas palavras como o agente deve abrir a conversa.",
      },
    ],
    otherPlaceholder:
      "Ex.: cumprimentar pelo nome, citar o processo e perguntar se ainda há interesse no adiantamento.",
  },
  {
    title: "Qual argumento o agente deve priorizar para convencer o lead a agendar?",
    options: [
      {
        id: "risco-zero",
        title: "Risco zero",
        detail: "O lead só paga se receber a causa — sem resultado, sem custo.",
      },
      {
        id: "rapidez",
        title: "Rapidez e liquidez",
        detail: "Aprovação em minutos e dinheiro na conta.",
      },
      {
        id: "facilidade",
        title: "Facilidade burocrática",
        detail: "Sem verificação de crédito e sem papelada.",
      },
      {
        id: INTERVIEW_OTHER_ID,
        title: "Outro...",
        detail: "Descreva o argumento que o agente deve colocar em primeiro lugar.",
      },
    ],
    otherPlaceholder:
      "Ex.: destacar que o atendimento é acompanhado por um especialista do início ao fim.",
  },
  {
    title: "Como lidar com um lead que não tem certeza se quer o adiantamento?",
    options: [
      {
        id: "educar",
        title: "Educar sobre o processo",
        detail: "Explicar como o adiantamento funciona para gerar confiança.",
      },
      {
        id: "necessidade",
        title: "Apelar para a necessidade",
        detail: "Processos judiciais demoram anos; o adiantamento resolve agora.",
      },
      {
        id: "porta-aberta",
        title: "Desengajar com porta aberta",
        detail: "Encerrar com uma pergunta leve para retomar a conversa depois.",
      },
      {
        id: INTERVIEW_OTHER_ID,
        title: "Outro...",
        detail: "Descreva como o agente deve conduzir um lead em dúvida.",
      },
    ],
    otherPlaceholder:
      "Ex.: oferecer um resumo por escrito do processo e combinar um retorno em dois dias.",
  },
];

export const INTERVIEW_TOTAL = INTERVIEW_QUESTIONS.length;

/* ───────── Fundo: gradiente animado (azul + pêssego) ─────────
 * CSS-only: lavagem em gradiente + 3 blobs desfocados em deriva lenta e
 * contínua. Cores 100% de token (--aw-blue-*, --aw-purple-*, --aw-amber-*).
 * Keyframes locais — globals.css não tem deriva genérica reutilizável
 * (loginBgFloat e orb-float são sutis demais e escopados a outros usos). */

export function WizardInterviewBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-aw-blue-150 via-aw-purple-100 to-aw-amber-150" />
      <div className="aw-interview-blob aw-interview-blob--a absolute -top-[22%] -left-[14%] h-[720px] w-[720px] rounded-full bg-aw-blue-400 opacity-70 blur-3xl" />
      <div className="aw-interview-blob aw-interview-blob--b absolute -right-[14%] top-[26%] h-[640px] w-[640px] rounded-full bg-aw-amber-200 opacity-65 blur-3xl" />
      <div className="aw-interview-blob aw-interview-blob--c absolute -bottom-[28%] left-[18%] h-[600px] w-[600px] rounded-full bg-aw-purple-200 opacity-60 blur-3xl" />
      <div className="aw-interview-blob aw-interview-blob--d absolute left-[30%] top-[2%] h-[460px] w-[460px] rounded-full bg-aw-blue-500 opacity-35 blur-3xl" />
      <style>{`
        @keyframes aw-interview-drift-a {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(14%, 10%, 0) scale(1.18); }
        }
        @keyframes aw-interview-drift-b {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-12%, -8%, 0) scale(1.12); }
        }
        @keyframes aw-interview-drift-c {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1.08); }
          50% { transform: translate3d(10%, -12%, 0) scale(1); }
        }
        .aw-interview-blob--a { animation: aw-interview-drift-a 18s ease-in-out infinite; }
        .aw-interview-blob--b { animation: aw-interview-drift-b 24s ease-in-out infinite; }
        .aw-interview-blob--c { animation: aw-interview-drift-c 21s ease-in-out infinite; }
        .aw-interview-blob--d { animation: aw-interview-drift-b 28s ease-in-out infinite reverse; }
        @media (prefers-reduced-motion: reduce) {
          .aw-interview-blob { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ───────── Tela da entrevista ───────── */

interface WizardInterviewProps {
  /** Pergunta atual (1..3). */
  question: number;
  answers: Record<number, InterviewAnswer>;
  onAnswerChange: (question: number, answer: InterviewAnswer) => void;
  /** Pergunta 1 → volta ao passo 6; demais → pergunta anterior. */
  onBack: () => void;
  /** Pergunta 3 → segue à geração (passo 8); demais → próxima pergunta. */
  onAdvance: () => void;
}

export function WizardInterview({
  question,
  answers,
  onAnswerChange,
  onBack,
  onAdvance,
}: WizardInterviewProps) {
  const q = INTERVIEW_QUESTIONS[question - 1];
  const answer = answers[question] ?? EMPTY_INTERVIEW_ANSWER;
  const isOtherSelected = answer.optionId === INTERVIEW_OTHER_ID;
  const canAdvance =
    !!answer.optionId && (!isOtherSelected || answer.otherText.trim().length > 0);

  return (
    <div className="relative flex min-h-full w-full items-center justify-center overflow-hidden bg-white p-6">
      <WizardInterviewBackdrop />

      <div
        key={question}
        className="aw-wizard-step relative z-10 w-full max-w-[640px] rounded-2xl border border-border bg-white p-8 shadow-xl"
      >
        <p className="text-xs font-medium text-fg-tertiary">
          Pergunta {question} de {INTERVIEW_TOTAL}
        </p>
        <h1 className="mt-2 font-heading text-xl font-medium tracking-tight text-fg-primary">
          {q.title}
        </h1>

        <div className="mt-6 flex flex-col gap-2" role="radiogroup" aria-label={q.title}>
          {q.options.map((opt, idx) => {
            const sel = answer.optionId === opt.id;
            const isOther = opt.id === INTERVIEW_OTHER_ID;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={sel}
                onClick={() => onAnswerChange(question, { ...answer, optionId: opt.id })}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors duration-aw-fast ${
                  sel
                    ? "border-(--bg-inverse) bg-(--bg-inverse)"
                    : "border-border bg-white hover:border-aw-gray-400 hover:bg-bg-surface"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                    sel
                      ? "bg-(--fg-on-inverse)/10 text-(--fg-on-inverse)"
                      : "bg-bg-muted text-fg-secondary"
                  }`}
                >
                  {isOther ? <Icon name="edit" size={15} /> : idx + 1}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span
                      className={`truncate text-sm font-medium ${
                        sel ? "text-(--fg-on-inverse)" : "text-fg-primary"
                      }`}
                    >
                      {opt.title}
                    </span>
                    {opt.recommended && (
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-3xs font-medium ${
                          sel
                            ? "bg-(--fg-on-inverse)/10 text-(--fg-on-inverse)"
                            : "bg-bg-muted text-fg-secondary"
                        }`}
                      >
                        Recomendada
                      </span>
                    )}
                  </span>
                  <span
                    className={`mt-0.5 block text-xs leading-relaxed ${
                      sel ? "text-(--fg-on-inverse)/70" : "text-fg-tertiary"
                    }`}
                  >
                    {opt.detail}
                  </span>
                </span>

                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    sel
                      ? "border-(--fg-on-inverse) bg-(--fg-on-inverse)"
                      : "border-aw-gray-400"
                  }`}
                >
                  {sel && <Icon name="check" size={12} className="text-(--bg-inverse)" />}
                </span>
              </button>
            );
          })}
        </div>

        {isOtherSelected && (
          <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <textarea
              rows={3}
              value={answer.otherText}
              onChange={(e) =>
                onAnswerChange(question, { ...answer, otherText: e.target.value })
              }
              placeholder={q.otherPlaceholder}
              autoFocus
              className="w-full resize-none rounded-xl border border-border bg-white px-3.5 py-3 text-sm text-fg-primary outline-none transition-colors duration-aw-fast placeholder:text-fg-tertiary focus:border-fg-primary"
            />
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <AwButton variant="secondary" size="md" iconLeft="chevron_left" onClick={onBack}>
            Voltar
          </AwButton>
          <AwButton variant="primary" size="md" disabled={!canAdvance} onClick={onAdvance}>
            Avançar
          </AwButton>
        </div>
      </div>
    </div>
  );
}
