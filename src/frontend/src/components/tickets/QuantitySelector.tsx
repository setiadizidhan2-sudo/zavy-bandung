import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  disabled?: boolean;
  /** Distinguishes the control for assistive tech across multiple cards. */
  label: string;
  className?: string;
}

/**
 * Large touch-friendly stepper. Both buttons stay at least 44px so the
 * control is usable one-handed on a phone.
 */
export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max,
  disabled = false,
  label,
  className,
}: QuantitySelectorProps) {
  const canDecrement = !disabled && value > min;
  const canIncrement = !disabled && value < max;

  return (
    <div
      data-ocid="tickets.quantity_selector"
      className={cn(
        "inline-flex items-center rounded-sm border border-white/10 bg-surface-2/80 p-1",
        disabled && "opacity-60",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Decrease ${label} quantity`}
        data-ocid="tickets.quantity_decrement"
        disabled={!canDecrement}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="tap-target size-11 rounded-sm text-foreground transition-smooth hover:bg-surface-3 hover:text-accent disabled:opacity-40"
      >
        <Minus />
      </Button>

      <span
        data-ocid="tickets.quantity_value"
        aria-live="polite"
        className="min-w-10 text-center font-display text-lg font-bold tabular-nums text-foreground"
      >
        {value}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Increase ${label} quantity`}
        data-ocid="tickets.quantity_increment"
        disabled={!canIncrement}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="tap-target size-11 rounded-sm text-foreground transition-smooth hover:bg-surface-3 hover:text-accent disabled:opacity-40"
      >
        <Plus />
      </Button>
    </div>
  );
}
