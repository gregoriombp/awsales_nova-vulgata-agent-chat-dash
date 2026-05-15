"use client";

import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        <label className="body-md text-text-primary font-normal">
          {label}
        </label>
        <div className="relative w-full">
          <textarea
            ref={ref}
            className={`w-full min-h-[120px] bg-input-bg border border-input-border rounded-xl px-4 py-3 body-md placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent transition-all resize-y ${
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

Textarea.displayName = "Textarea";

export default Textarea;
