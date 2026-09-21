import { useEffect, useState } from "react";

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once the target moment has passed. */
  isComplete: boolean;
}

function diff(target: number): Countdown {
  const remaining = target - Date.now();
  if (remaining <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
  }
  const totalSeconds = Math.floor(remaining / 1000);
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
    isComplete: false,
  };
}

/**
 * Live countdown to the event start. Ticks once per second and cleans up on
 * unmount. Pass a stable `Date` (the event constant) as the target.
 */
export function useCountdown(target: Date): Countdown {
  const targetMs = target.getTime();
  const [countdown, setCountdown] = useState<Countdown>(() => diff(targetMs));

  useEffect(() => {
    setCountdown(diff(targetMs));
    const id = window.setInterval(() => setCountdown(diff(targetMs)), 1000);
    return () => window.clearInterval(id);
  }, [targetMs]);

  return countdown;
}
