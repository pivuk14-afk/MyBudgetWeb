import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...rest }, ref) => {
    return (
      <label className="block text-sm">
        <span className="mb-1 inline-block font-medium text-slate-700">
          {label}
        </span>
        <input
          ref={ref}
          className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/60 ${
            error ? "border-rose-400" : "border-slate-200"
          } ${className}`}
          {...rest}
        />
        {error && (
          <span className="mt-1 block text-xs text-rose-500">{error}</span>
        )}
      </label>
    );
  }
);

Input.displayName = "Input";

