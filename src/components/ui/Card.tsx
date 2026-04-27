import { ReactNode } from "react";

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

export const Card = ({ title, subtitle, children }: CardProps) => {
  return (
    <div className="card">
      {(title || subtitle) && (
        <div className="mb-3 flex items-baseline justify-between gap-2">
          {title && (
            <h2 className="text-sm font-semibold tracking-tight text-slate-800">
              {title}
            </h2>
          )}
          {subtitle && (
            <span className="text-xs text-slate-500">{subtitle}</span>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

