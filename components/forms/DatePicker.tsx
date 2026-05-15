"use client";

import React from "react";
import Input from "../Input";

interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        <label className="body-md text-text-primary font-normal">
          {label}
        </label>
        <div className="relative w-full">
          <input
            ref={ref}
            type="date"
            className={`w-full h-[53px] bg-input-bg border border-input-border rounded-xl px-4 body-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent transition-all ${
              error ? "border-red-500" : ""
            } ${className || ""}`}
            {...props}
          />
        </div>
        {error && (
          <span className="text-red-500 body-sm mt-1">{error}</span>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

export default DatePicker;
