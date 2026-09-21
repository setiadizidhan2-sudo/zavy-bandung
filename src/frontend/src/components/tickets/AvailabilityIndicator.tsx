import { cn } from "@/lib/utils";

export type AvailabilityLevel = "sold-out" | "critical" | "low" | "available";

/** Thresholds (share of capacity remaining) that drive the emphasis level. */
const CRITICAL_RATIO = 0.1;
const LOW_RATIO = 0.25;

export function availabilityLevel(
  remaining: number,
  capacity: number,
): AvailabilityLevel {
  if (remaining <= 0) return "sold-out";
  if (capacity <= 0) return "available";
  const ratio = remaining / capacity;
  if (ratio <= CRITICAL_RATIO) return "critical";
  if (ratio <= LOW_RATIO) return "low";
  return "available";
}

const LEVEL_COPY: Record<AvailabilityLevel, string> = {
  "sold-out": "Sold out",
  critical: "Almost gone",
  low: "Selling fast",
  available: "Available",
};

const LEVEL_DOT: Record<AvailabilityLevel, string> = {
  "sold-out": "bg-destructive",
  critical: "bg-destructive",
  low: "bg-warning",
  available: "bg-success",
};

const LEVEL_TEXT: Record<AvailabilityLevel, string> = {
  "sold-out": "text-destructive",
  critical: "text-destructive",
  low: "text-warning",
  available: "text-success",
};

const LEVEL_BAR: Record<AvailabilityLevel, string> = {
  "sold-out": "bg-destructive",
  critical: "bg-destructive",
  low: "bg-warning",
  available: "bg-gradient-primary",
};

interface AvailabilityIndicatorProps {
  remaining: number;
  capacity: number;
  /** Stable id used to wire the progress bar to its label. */
  id: string;
  className?: string;
}

/**
 * Live stock readout for a tier: a labelled meter plus a status pill that
 * escalates from "Available" to "Almost gone" as inventory drains.
 */
export function AvailabilityIndicator({
  remaining,
  capacity,
  id,
  className,
}: AvailabilityIndicatorProps) {
  const level = availabilityLevel(remaining, capacity);
  const soldOut = level === "sold-out";
  const percent =
    capacity > 0
      ? Math.min(100, Math.max(0, Math.round((remaining / capacity) * 100)))
      : 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-3">
        <p
          id={id}
          data-ocid="tickets.availability"
          className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-muted-foreground"
        >
          {soldOut ? (
            "0 remaining"
          ) : (
            <>
              <span className="text-foreground">{remaining}</span> of {capacity}{" "}
              remaining
            </>
          )}
        </p>
        <span
          data-ocid="tickets.availability_status"
          className={cn(
            "inline-flex items-center gap-1.5 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.16em]",
            LEVEL_TEXT[level],
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "size-1.5 rounded-full",
              LEVEL_DOT[level],
              level === "critical" && "animate-glow-pulse",
            )}
          />
          {LEVEL_COPY[level]}
        </span>
      </div>

      <div
        role="img"
        aria-label={`${remaining} of ${capacity} tickets remaining`}
        className="h-1 w-full overflow-hidden rounded-full bg-surface-3"
      >
        <div
          className={cn(
            "h-full rounded-full transition-smooth",
            LEVEL_BAR[level],
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
