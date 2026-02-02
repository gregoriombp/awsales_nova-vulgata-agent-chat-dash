"use client";

import React from "react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            ref={ref}
            type="checkbox"
            className={`w-5 h-5 rounded border-input-border text-primary-dark focus:ring-2 focus:ring-primary-dark focus:ring-offset-2 cursor-pointer transition-colors ${
              error ? "border-red-500" : ""
            } ${className || ""}`}
            {...props}
          />
          <span className="text-[17.78px] text-text-primary tracking-[0.18px] font-normal group-hover:text-primary-dark transition-colors">
            {label}
          </span>
        </label>
        {error && (
          <span className="text-red-500 text-sm mt-1">{error}</span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
