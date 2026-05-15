"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export interface OnboardingStep {
  /** Selector for the element to highlight (e.g. data-tour attribute). Use "final" for no highlight. */
  target: string;
  title?: string;
  description: string;
  /** Primary button label for the last step (e.g. "Adicionar fontes"). */
  primaryButtonLabel?: string;
}

export interface OnboardingTourProps {
  steps: OnboardingStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  /** Called when user clicks the primary CTA on the final step (e.g. open add sources). */
  onPrimaryAction?: () => void;
}

const SPOTLIGHT_PADDING = 8;
const MODAL_OFFSET = 16;
const OVERLAY_Z = 9998;
const MODAL_Z = 10000;

function getTargetRect(target: string): DOMRect | null {
  if (typeof document === "undefined" || target === "final") return null;
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  return el.getBoundingClientRect();
}

export default function OnboardingTour({
  steps,
  isActive,
  onComplete,
  onSkip,
  onPrimaryAction,
}: OnboardingTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<DOMRect | null>(null);
  const [modalPosition, setModalPosition] = useState<{ top: number; left: number } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const isFinalStep = step?.target === "final";

  const updateLayout = useCallback(() => {
    if (!step) return;
    const rect = getTargetRect(step.target);
    setSpotlight(rect);

    if (isFinalStep) {
      setModalPosition(null);
      return;
    }

    const modalEl = modalRef.current;
    if (rect && modalEl) {
      const modalRect = modalEl.getBoundingClientRect();
      const viewW = window.innerWidth;
      const viewH = window.innerHeight;
      const padding = MODAL_OFFSET;
      // Prefer below the spotlight, then above, then right
      let top = rect.bottom + padding;
      let left = rect.left + rect.width / 2 - modalRect.width / 2;
      if (top + modalRect.height > viewH - padding) {
        top = rect.top - modalRect.height - padding;
      }
      if (top < padding) top = padding;
      if (left < padding) left = padding;
      if (left + modalRect.width > viewW - padding) left = viewW - modalRect.width - padding;
      setModalPosition({ top, left });
    } else {
      setModalPosition(null);
    }
  }, [step?.target, isFinalStep]);

  useLayoutEffect(() => {
    if (!isActive || !step) return;
    updateLayout();
    const raf = requestAnimationFrame(updateLayout);
    return () => cancelAnimationFrame(raf);
  }, [isActive, step?.target, stepIndex, updateLayout]);

  useEffect(() => {
    if (!isActive) return;
    const onScrollOrResize = () => updateLayout();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [isActive, updateLayout]);

  useEffect(() => {
    if (!isActive) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSkip();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isActive, onSkip]);

  const goNext = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      onComplete();
      return;
    }
    setStepIndex((i) => i + 1);
  }, [stepIndex, steps.length, onComplete]);

  const goBack = useCallback(() => {
    if (stepIndex <= 0) return;
    setStepIndex((i) => i - 1);
  }, [stepIndex]);

  if (!isActive || !step) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-auto"
      style={{ zIndex: OVERLAY_Z }}
      aria-modal="true"
      role="dialog"
      aria-label="Tour de onboarding"
    >
      {/* Dark overlay with spotlight cutout */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "none" }}
        aria-hidden
      >
        <defs>
          <mask id="onboarding-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlight && (
              <rect
                x={spotlight.left - SPOTLIGHT_PADDING}
                y={spotlight.top - SPOTLIGHT_PADDING}
                width={spotlight.width + SPOTLIGHT_PADDING * 2}
                height={spotlight.height + SPOTLIGHT_PADDING * 2}
                rx="12"
                ry="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.65)"
          mask="url(#onboarding-spotlight-mask)"
        />
      </svg>
      {/* Block clicks outside modal (clicking overlay = skip) */}
      <div
        className="absolute inset-0"
        style={{ zIndex: OVERLAY_Z + 1 }}
        onClick={(e) => e.target === e.currentTarget && onSkip()}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="absolute w-[360px] max-w-[calc(100vw-24px)] rounded-2xl bg-white shadow-xl border border-[#f2f2f2] p-6 flex flex-col gap-4"
        style={{
          zIndex: MODAL_Z,
          ...(isFinalStep
            ? { left: "50%", top: "50%", transform: "translate(-50%, -50%)" }
            : modalPosition
              ? { left: modalPosition.left, top: modalPosition.top }
              : { left: "50%", top: "50%", transform: "translate(-50%, -50%)" }),
        }}
        role="document"
      >
        {step.title && (
          <h3 className="body-lg font-semibold text-[#1a1a1a] leading-tight">
            {step.title}
          </h3>
        )}
        <p className="body-sm text-[#5e5e5e] leading-relaxed">
          {step.description}
        </p>
        <div className="flex items-center justify-between gap-3 mt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSkip}
              className="body-xs font-medium text-[#737373] hover:text-[#1a1a1a] transition-colors"
            >
              Pular tour
            </button>
          </div>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={goBack}
                className="px-4 py-2 rounded-lg body-sm font-medium text-[#2f2f2f] bg-[#f2f2f2] hover:bg-[#e5e5e5] transition-colors"
              >
                Voltar
              </button>
            )}
            {isFinalStep && step.primaryButtonLabel ? (
              <button
                type="button"
                onClick={() => {
                  onComplete();
                  onPrimaryAction?.();
                }}
                className="px-4 py-2.5 rounded-lg body-sm font-medium text-white bg-[#0d0d0d] hover:bg-[#262626] transition-colors"
              >
                {step.primaryButtonLabel}
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="px-4 py-2.5 rounded-lg body-sm font-medium text-white bg-[#0d0d0d] hover:bg-[#262626] transition-colors"
              >
                {isLast ? "Concluir" : "Próximo"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
