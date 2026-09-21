import { useCountdown } from "@/hooks/useCountdown";
import { EVENT } from "@/lib/event";
import { pad2 } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CountdownUnit {
  label: string;
  value: number;
}

/**
 * Floating glass countdown to the headline set.
 * Ticks once per second through the shared `useCountdown` hook.
 */
export function CountdownTimer({ className }: { className?: string }) {
  const { days, hours, minutes, seconds, isComplete } = useCountdown(
    EVENT.startsAt,
  );

  const units: CountdownUnit[] = [
    { label: "Days", value: days },
    { label: "Hours", value: hours },
    { label: "Minutes", value: minutes },
    { label: "Seconds", value: seconds },
  ];

  return (
    <div
      data-ocid="countdown.panel"
      className={cn(
        "glass-panel-strong w-full max-w-md rounded-sm px-5 py-4 shadow-glass",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="label-eyebrow">
          {isComplete ? "Event has started" : "Event starts in"}
        </p>
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-accent animate-glow-pulse"
          />
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.18em] text-accent">
            Live
          </span>
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-4 gap-2">
        {units.map((unit) => (
          <div
            key={unit.label}
            data-ocid={`countdown.${unit.label.toLowerCase()}`}
            className="rounded-sm border border-white/10 bg-surface-0/60 px-2 py-3 text-center"
          >
            <dd
              key={unit.value}
              className="font-display text-2xl font-bold tabular-nums text-foreground animate-tick md:text-3xl"
            >
              {pad2(unit.value)}
            </dd>
            <dt className="mt-1 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-muted-foreground">
              {unit.label}
            </dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
