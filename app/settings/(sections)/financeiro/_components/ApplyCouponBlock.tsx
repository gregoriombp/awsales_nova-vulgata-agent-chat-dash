"use client";

import * as React from "react";
import { AwButton } from "@/components/ui/AwButton";
import { AwCard } from "@/components/ui/AwCard";
import { AwInput } from "@/components/ui/AwInput";
import { Icon } from "@/components/ui/Icon";

type Feedback =
  | { kind: "idle" }
  | { kind: "success"; code: string }
  | { kind: "error"; reason: string };

const ERRORS = [
  "Código não encontrado.",
  "Código expirado.",
  "Limite de uso já atingido.",
  "Moeda incompatível com sua conta.",
  "Validade do cupom já passou.",
];

export function ApplyCouponBlock() {
  const [code, setCode] = React.useState("");
  const [feedback, setFeedback] = React.useState<Feedback>({ kind: "idle" });
  const [submitting, setSubmitting] = React.useState(false);

  const apply = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setSubmitting(true);
    // mock: 50% sucesso, 50% erro aleatório
    setTimeout(() => {
      if (Math.random() < 0.5) {
        setFeedback({ kind: "success", code: trimmed.toUpperCase() });
        setCode("");
      } else {
        setFeedback({
          kind: "error",
          reason: ERRORS[Math.floor(Math.random() * ERRORS.length)],
        });
      }
      setSubmitting(false);
    }, 350);
  };

  return (
    <AwCard className="!p-0">
      <div className="flex flex-wrap items-end gap-3 px-6 py-5">
        <div className="min-w-0 flex-1">
          <p className="m-0 mb-1 body-xs font-medium text-[var(--fg-primary)]">
            Aplicar código de cupom
          </p>
          <p className="m-0 mb-3 max-w-[480px] body-xs text-[var(--fg-secondary)]">
            Cupons são validados em tempo real. Validade, moeda e limite de uso
            são checados antes da aplicação.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="min-w-[220px] flex-1">
              <AwInput
                placeholder="Ex.: BF2026"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") apply();
                }}
                aria-label="Código de cupom"
              />
            </div>
            <AwButton
              size="md"
              variant="primary"
              iconRight="arrow_forward"
              loading={submitting}
              onClick={apply}
              disabled={!code.trim()}
            >
              Aplicar
            </AwButton>
          </div>
          {feedback.kind === "success" && (
            <p
              className="mt-3 inline-flex items-center gap-1.5 body-xs text-[var(--accent-success)]"
              role="status"
            >
              <Icon name="check_circle" size={14} fill={1} />
              Cupom <strong>{feedback.code}</strong> aplicado. O desconto vai
              aparecer na sua próxima fatura.
            </p>
          )}
          {feedback.kind === "error" && (
            <p
              className="mt-3 inline-flex items-center gap-1.5 body-xs text-[var(--accent-danger)]"
              role="alert"
            >
              <Icon name="error" size={14} fill={1} />
              {feedback.reason}
            </p>
          )}
        </div>
      </div>
    </AwCard>
  );
}
