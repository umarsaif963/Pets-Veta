import type { InputHTMLAttributes, ReactNode } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon: ReactNode;
  headerRight?: ReactNode;
  rightSlot?: ReactNode;
  error?: string;
}

const FormInput = ({
  id,
  label,
  icon,
  headerRight,
  rightSlot,
  error,
  className = "",
  ...props
}: FormInputProps) => {
  const borderClass = error
    ? "border-[#e4666b] focus:border-[#e4666b] focus:ring-[#e4666b]/15"
    : "border-[#E2E8F0] focus:border-[#009f9d] focus:ring-[#009f9d]/15";

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-[13px] font-bold text-[#07182c]"
        >
          {label}
        </label>

        {headerRight}
      </div>

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>

        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-[52px] w-full rounded-xl border bg-white pl-12 pr-4 text-[14px] font-medium text-[#07182c] shadow-[0_1px_2px_rgba(7,24,44,0.05)] outline-none transition-colors placeholder:text-slate-400 focus:ring-4 ${
            borderClass
          } ${rightSlot ? "pr-14" : ""} ${className}`}
          {...props}
        />

        {rightSlot && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightSlot}
          </span>
        )}
      </div>

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-[12px] font-semibold text-[#d64545]"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;