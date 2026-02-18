import { cn } from "@/lib/utils";

export interface FilterChipOption {
  label: string;
  value: string;
}

interface FilterChipsProps {
  options: FilterChipOption[];
  selected: string | string[];
  onChange: (value: string | string[]) => void;
  multiSelect?: boolean;
  className?: string;
}

/** 범용 필터 칩 컴포넌트 */
export function FilterChips({
  options,
  selected,
  onChange,
  multiSelect = false,
  className,
}: FilterChipsProps) {
  const isSelected = (value: string): boolean => {
    if (Array.isArray(selected)) return selected.includes(value);
    return selected === value;
  };

  const handleClick = (value: string) => {
    if (multiSelect) {
      const selectedArr = Array.isArray(selected) ? selected : [selected];
      if (selectedArr.includes(value)) {
        onChange(selectedArr.filter((v) => v !== value));
      } else {
        onChange([...selectedArr, value]);
      }
    } else {
      onChange(value);
    }
  };

  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto scrollbar-none",
        className,
      )}
    >
      {options.map((option) => {
        const active = isSelected(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => handleClick(option.value)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-bg"
                : "bg-subtle/50 text-text-secondary hover:text-text",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
