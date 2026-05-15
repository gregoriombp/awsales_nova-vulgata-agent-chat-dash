import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "w-full inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20";

  const sizeStyles = {
    sm: "h-8 px-4 body-sm tracking-[-0.1px] rounded-lg",
    md: "h-10 px-4 body-sm tracking-[-0.1px] rounded-lg",
    lg: "h-12 px-6 body-md tracking-[-0.1px] rounded-xl",
  };

  const variantStyles = {
    primary:
      "bg-gray-1200 text-white hover:bg-[#111111] active:bg-black",
    secondary:
      "bg-[#f2f2f2] text-gray-1200 hover:bg-[#eaeaea] active:bg-[#e0e0e0]",
    tertiary:
      "bg-transparent text-[#999999] hover:bg-[#f2f2f2] active:bg-[#eaeaea]",
    danger:
      "bg-[#ff3e4c] text-white hover:bg-[#e53642] active:bg-[#c92f3a]",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""
      } ${className || ""}`}
      disabled={disabled || isLoading}
      aria-busy={isLoading ? true : undefined}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Carregando...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
