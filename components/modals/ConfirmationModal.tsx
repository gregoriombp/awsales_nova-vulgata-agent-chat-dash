"use client";

import React from "react";
import BaseModal from "./BaseModal";
import Button from "../Button";

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
        <h2 className="text-2xl font-heading font-bold text-text-primary mb-4">
          {title}
        </h2>
        <p className="text-text-secondary mb-6">{message}</p>
        
        <div className="flex gap-4 justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="w-auto"
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            onClick={handleConfirm}
            isLoading={isLoading}
            className="w-auto"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
