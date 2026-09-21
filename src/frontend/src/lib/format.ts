/** Shared formatting helpers for currency and event date/time copy. */

const IDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Formats a rupiah amount as `Rp210.000` (Indonesian grouping, no decimals).
 * Accepts a number or a bigint so backend totals can be passed straight in.
 */
export function formatIDR(amount: number | bigint): string {
  const value = typeof amount === "bigint" ? Number(amount) : amount;
  if (!Number.isFinite(value)) return "Rp0";
  // Intl renders "Rp 210.000" with a space; the brand copy uses no space.
  return IDR.format(value).replace(/\s/g, "");
}

/** Formats a date as `21 October 2026`. */
export function formatEventDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

/** Formats a time as `19:00 WIB`. */
export function formatEventTime(date: Date): string {
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(date);
  return `${time} WIB`;
}

/** Formats a date and time together as `21 October 2026 · 19:00 WIB`. */
export function formatEventDateTime(date: Date): string {
  return `${formatEventDate(date)} · ${formatEventTime(date)}`;
}

/** Pads a countdown unit to two digits. */
export function pad2(value: number): string {
  return String(Math.max(0, Math.floor(value))).padStart(2, "0");
}
