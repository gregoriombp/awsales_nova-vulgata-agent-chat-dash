"use client";

import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        <label className="text-[17.78px] text-text-primary tracking-[0.18px] font-normal">
          {label}
        </label>
        <div className="relative w-full">
          <select
            ref={ref}
            className={`w-full h-[53px] bg-input-bg border border-input-border rounded-xl px-4 text-[17.78px] tracking-[0.18px] text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent transition-all appearance-none cursor-pointer ${
              error ? "border-red-500" : ""
            } ${className || ""}`}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        {error && (
          <span className="text-red-500 text-sm mt-1">{error}</span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
