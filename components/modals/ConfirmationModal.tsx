"use client";

import React from "react";
import BaseModal from "./BaseModal";
import { AwButton } from "@/components/ui/AwButton";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmVariant = "primary",
  isLoading = false,
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6">
        <h2 className=" font-heading font-bold text-text-primary mb-4">
          {title}
        </h2>
        <p className="text-text-secondary mb-6">{message}</p>
        
        <div className="flex gap-4 justify-end">
          <AwButton
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="w-auto"
          >
            {cancelText}
          </AwButton>
          <AwButton
            variant={confirmVariant}
            size="sm"
            onClick={handleConfirm}
            loading={isLoading}
            className="w-auto"
          >
            {confirmText}
          </AwButton>
        </div>
      </div>
    </BaseModal>
  );
}
