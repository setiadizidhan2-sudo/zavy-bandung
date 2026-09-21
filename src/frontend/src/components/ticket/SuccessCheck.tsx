import { cn } from "@/lib/utils";

interface SuccessCheckProps {
  /** Diameter of the badge in pixels. */
  size?: number;
  className?: string;
}

/**
 * Large animated confirmation mark.
 * The ring scales in, then the tick strokes itself on via `animate-check-draw`
 * (both are disabled under `prefers-reduced-motion` by the global reset).
 */
export function SuccessCheck({ size = 132, className }: SuccessCheckProps) {
  return (
    <div
      data-ocid="success.state"
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Outer glow halo */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-accent/20 blur-2xl animate-glow-pulse"
      />
      {/* Rotating conic ring */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full opacity-70"
        style={{
          background:
            "conic-gradient(from 140deg, transparent 0deg, oklch(var(--accent) / 0.55) 120deg, transparent 260deg)",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
        }}
      />
      {/* Glass disc */}
      <span className="glass-panel-strong absolute inset-[10%] rounded-full shadow-edge-cyan" />
      <svg
        viewBox="0 0 64 64"
        width={size * 0.44}
        height={size * 0.44}
        fill="none"
        role="img"
        aria-label="Payment confirmed"
        className="relative"
      >
        <path
          d="M16 33.5 L27 44.5 L48 21"
          stroke="oklch(var(--accent))"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="120"
          className="animate-check-draw"
        />
      </svg>
    </div>
  );
}
