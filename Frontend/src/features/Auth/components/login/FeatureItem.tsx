import type { ReactNode } from "react";

interface FeatureItemProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  tone?: string;
}

const FeatureItem = ({
  icon,
  title,
  subtitle,
  tone = "bg-[#d9f7f6]",
}: FeatureItemProps) => {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tone} text-[#008f8d]`}
      >
        {icon}
      </span>

      <div>
        <p className="text-[14px] font-bold leading-tight text-[#07182c]">
          {title}
        </p>

        {subtitle && (
          <p className="mt-0.5 text-[12px] font-medium leading-tight text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default FeatureItem;