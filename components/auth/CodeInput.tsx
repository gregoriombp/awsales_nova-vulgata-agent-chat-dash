"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * CodeInput — grupo de campos de 1 dígito para códigos de verificação (OTP).
 * Fonte única usada pelo AuthFlow (verify, mfaVerify, mfaSetupApp) pra não
 * divergirem. Acessibilidade: o grupo é anunciado por `role="group"` +
 * `aria-label`, cada campo tem `aria-label` individual ("Dígito 1 de 6") e o
 * primeiro carrega `autocomplete="one-time-code"` pra autofill de código.
 * Mantém o paste inteligente (colar os 6 dígitos de uma vez).
 */
export function CodeInput({
  value,
  onChange,
  length = 6,
  groupLabel,
  autoFocus,
  compact,
  align = "start",
}: {
  /** Array controlado com `length` posições (ex.: ["", "", ...]). */
  value: string[];
  onChange: (next: string[]) => void;
  length?: number;
  /** Rótulo do grupo, anunciado ao leitor de tela (ex.: "Código de verificação"). */
  groupLabel: string;
  autoFocus?: boolean;
  /** Campos menores (usado no setup, onde há mais conteúdo na tela). */
  compact?: boolean;
  align?: "start" | "center";
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (idx: number, ch: string) => {
    if (!/^\d?$/.test(ch)) return;
    const next = [...value];
    next[idx] = ch;
    onChange(next);
    if (ch && idx < length - 1) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!text) return;
    e.preventDefault();
    const next = Array.from({ length }, (_, i) => text[i] ?? value[i] ?? "");
    onChange(next);
    inputsRef.current[Math.min(text.length, length - 1)]?.focus();
  };

  return (
    <div
      role="group"
      aria-label={groupLabel}
      className={cn("flex gap-2", align === "center" && "justify-center")}
    >
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Dígito ${i + 1} de ${length}`}
          maxLength={1}
          value={digit}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className={cn(
            "border rounded-lg text-center tabular-nums body-xl font-medium text-aw-gray-1200 outline-hidden transition-all duration-150",
            "focus:border-aw-blue-600 focus:ring-2 focus:ring-aw-blue-500/25",
            compact ? "w-11" : "w-12 h-14",
            digit ? "bg-aw-gray-150 border-aw-gray-300" : "bg-white border-aw-gray-300"
          )}
          style={compact ? { height: 52 } : undefined}
        />
      ))}
    </div>
  );
}
