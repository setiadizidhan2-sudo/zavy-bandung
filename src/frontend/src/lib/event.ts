/**
 * Single-event constants for ZAVY — LIVE IN BANDUNG.
 * Every surface (hero, sticky bar, checkout, ticket) reads from here so the
 * event identity never drifts between pages.
 */

export const EVENT = {
  name: "ZAVY — LIVE IN BANDUNG",
  artist: "ZAVY",
  tagline: "One night. One rooftop. No encore.",
  dateLabel: "21 October 2026",
  timeLabel: "19:00 WIB",
  venue: "Rooftop Coffee Uber",
  city: "Bandung",
  /** Doors open 60 minutes before the headline set. */
  doorsLabel: "Doors 18:00 WIB",
  organizer: "ZAVY Live Productions",
  /** 21 October 2026, 19:00 WIB (UTC+7) → 12:00 UTC. */
  startsAt: new Date("2026-10-21T12:00:00.000Z"),
} as const;

export const EVENT_START_ISO = EVENT.startsAt.toISOString();

export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "TikTok", href: "https://tiktok.com" },
  { label: "X", href: "https://x.com" },
] as const;

export const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Event Info", to: "/event" },
  { label: "Tickets", to: "/tickets" },
  { label: "Terms", to: "/terms" },
] as const;
