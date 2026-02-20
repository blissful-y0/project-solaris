import { cn } from "@/lib/utils";

export interface FilterChipOption<T extends string = string> {
  label: string;
  value: T;
}

type SingleSelectProps<T extends string> = {
  options: readonly FilterChipOption<T>[];
  selected: T;
  onChange: (value: T) => void;
  multiSelect?: false;
  className?: string;
};

type MultiSelectProps<T extends string> = {
  options: readonly FilterChipOption<T>[];
  selected: T[];
  onChange: (value: T[]) => void;
  multiSelect: true;
  className?: string;
};

type FilterChipsProps<T extends string> =
  | SingleSelectProps<T>
  | MultiSelectProps<T>;

/** 범용 필터 칩 컴포넌트 */
export function FilterChips<T extends string>({
  ...props
}: FilterChipsProps<T>) {
  const { options, className } = props;

  const isSelected = (value: T): boolean => {
    const { selected } = props;
    if (Array.isArray(selected)) return selected.includes(value);
    return selected === value;
  };

  const handleClick = (value: T) => {
    if (props.multiSelect) {
      const selectedArr = props.selected;
      if (selectedArr.includes(value)) {
        props.onChange(selectedArr.filter((v) => v !== value));
      } else {
        props.onChange([...selectedArr, value]);
      }
    } else {
      props.onChange(value);
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
