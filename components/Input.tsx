import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        <label className="body-md text-text-primary font-normal">
          {label}
        </label>
        <div className="relative w-full">
          <input
            ref={ref}
            className={`w-full h-[53px] bg-input-bg border border-input-border rounded-xl px-4 body-md placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-dark focus:border-transparent transition-all ${
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

Input.displayName = "Input";

export default Input;
