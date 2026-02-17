import { type InputHTMLAttributes, type ReactNode, useId } from "react";

import { cn } from "@/lib/utils";

type InputProps = {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className">;

export function Input({
  label,
  error,
  helperText,
  icon,
  className,
  id: idProp,
  ...rest
}: InputProps) {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs uppercase tracking-widest text-text-secondary mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
            {icon}
          </span>
        )}
        <input
          id={id}
          className={cn(
            "w-full min-h-[44px] bg-bg-secondary border border-border rounded-md px-3 py-2 text-text placeholder:text-text-secondary/50",
            "focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50",
            "transition-colors",
            error && "border-accent/50 focus:ring-accent/30 focus:border-accent/50",
            icon && "pl-9",
          )}
          {...rest}
        />
      </div>
      {error && (
        <p className="text-xs text-accent mt-1">{error}</p>
      )}
      {!error && helperText && (
        <p className="text-xs text-text-secondary mt-1">{helperText}</p>
      )}
    </div>
  );
}
