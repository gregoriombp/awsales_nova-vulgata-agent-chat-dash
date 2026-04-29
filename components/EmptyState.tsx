"use client";

import React from "react";
import { AwButton } from "./ui/AwButton";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon && <div className="mb-4 text-text-secondary">{icon}</div>}
      <h3 className="text-xl font-heading font-bold text-text-primary mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-text-secondary text-center max-w-md mb-6">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <AwButton variant="primary" onClick={onAction}>
          {actionLabel}
        </AwButton>
      )}
    </div>
  );
}
