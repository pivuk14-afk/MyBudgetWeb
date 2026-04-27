import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
  leftIcon?: ReactNode;
}

export const Button = ({
  children,
  variant = "primary",
  fullWidth,
  leftIcon,
  className = "",
  ...rest
}: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 disabled:cursor-not-allowed";

  const variants: Record<typeof variant, string> = {
    primary:
      "border-transparent bg-primary text-white hover:bg-primary/90 active:bg-primary/95",
    secondary:
      "border-slate-200 bg-white text-slate-800 hover:bg-slate-50 active:bg-slate-100",
    ghost:
      "border-transparent bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200"
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${
        fullWidth ? "w-full" : ""
      } px-4 py-2 ${className}`}
      {...rest}
    >
      {leftIcon && <span className="h-4 w-4">{leftIcon}</span>}
      <span>{children}</span>
    </button>
  );
};

