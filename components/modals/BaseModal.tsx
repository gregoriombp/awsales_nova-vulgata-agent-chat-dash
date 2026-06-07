"use client";

import React, { useEffect } from "react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * BaseModal — shell dos modais de fonte (enviar arquivo / URL / snippet /
 * integrações + pastas). Alinhado ao styleguide: usa a MESMA casca visual do
 * AwModal (scrim com blur + cor de superfície `--bg-raised`, raio `--radius-xl`,
 * sombra `--shadow-overlay` e a mesma animação de entrada `aw-modal-in`).
 *
 * Mantém a API legada (`isOpen/onClose/size/children`) pra não tocar nos modais
 * que o consomem — eles trazem o próprio header/body/footer dentro de children.
 */
export default function BaseModal({
  isOpen,
  onClose,
  children,
  size = "md",
}: BaseModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6"
      onClick={onClose}
      style={{
        background: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: "aw-scrim-in 180ms var(--ease-out)",
      }}
    >
      <div
        className={`relative flex max-h-[90vh] w-full ${sizeClasses[size]} flex-col overflow-hidden rounded-[var(--radius-xl)] bg-[var(--bg-raised)] text-[var(--fg-primary)]`}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: "var(--shadow-overlay)",
          animation: "aw-modal-in 180ms var(--ease-out)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
