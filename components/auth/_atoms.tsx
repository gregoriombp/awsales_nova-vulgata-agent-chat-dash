"use client";

import { useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

export function PasswordInput({
  id,
  placeholder,
  invalid,
  register,
}: {
  id: string;
  placeholder: string;
  invalid?: boolean;
  register: UseFormRegisterReturn;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className={cn("aw-input", invalid && "aw-input--invalid")}>
      <input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        className="flex-1 min-w-0 border-0 outline-hidden bg-transparent body-sm"
        {...register}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={show}
        className="flex items-center justify-center w-7 h-7 rounded-md text-aw-gray-700 hover:bg-aw-gray-200 hover:text-aw-gray-1200 transition-colors shrink-0"
      >
        <Icon name={show ? "visibility_off" : "visibility"} size={18} />
      </button>
    </div>
  );
}

export function SsoButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2.5 h-11 rounded-full border border-aw-gray-300 bg-white body-sm font-medium text-aw-gray-1200 transition-colors duration-150 hover:border-aw-gray-400 hover:bg-aw-gray-150 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

export function BackButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 body-xs font-medium text-aw-gray-800 hover:text-aw-gray-1200 mb-6"
    >
      <Icon name="chevron_left" size={14} />
      {label}
    </button>
  );
}
