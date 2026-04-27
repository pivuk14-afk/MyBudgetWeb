import { forwardRef, SelectHTMLAttributes, ReactNode } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, children, className = "", ...rest }, ref) => {
    return (
      <label className="block text-sm">
        <span className="mb-1 inline-block font-medium text-slate-700">
          {label}
        </span>
        <select
          ref={ref}
          className={`block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/60 ${
            error ? "border-rose-400" : "border-slate-200"
          } ${className}`}
          {...rest}
        >
          {children}
        </select>
        {error && (
          <span className="mt-1 block text-xs text-rose-500">{error}</span>
        )}
      </label>
    );
  }
);

Select.displayName = "Select";

