import { create } from "zustand";

/**
 * Ticket tiers for ZAVY — LIVE IN BANDUNG.
 * Prices are in rupiah; the service fee is added at checkout.
 */
export type TicketTierId = "early-bird" | "regular" | "vip";

export interface TicketTier {
  id: TicketTierId;
  name: string;
  price: number;
  capacity: number;
  blurb: string;
  perks: string[];
}

export const SERVICE_FEE = 10_000;

export const TICKET_TIERS: TicketTier[] = [
  {
    id: "early-bird",
    name: "EARLY BIRD",
    price: 75_000,
    capacity: 100,
    blurb: "Limited first-release pricing for the fastest fans.",
    perks: ["Standing floor", "Full headline set", "Event wristband"],
  },
  {
    id: "regular",
    name: "REGULAR",
    price: 100_000,
    capacity: 300,
    blurb: "Standing floor access to the full headline set.",
    perks: ["Standing floor", "Full headline set", "Event wristband"],
  },
  {
    id: "vip",
    name: "VIP",
    price: 200_000,
    capacity: 50,
    blurb: "Elevated viewing deck with a dedicated entry lane.",
    perks: ["Elevated deck", "Priority entry lane", "Commemorative lanyard"],
  },
];

export const MAX_QUANTITY = 10;

export function getTier(id: TicketTierId): TicketTier {
  return TICKET_TIERS.find((tier) => tier.id === id) ?? TICKET_TIERS[0];
}

interface SelectionState {
  tierId: TicketTierId;
  quantity: number;
  setTier: (tierId: TicketTierId) => void;
  setQuantity: (quantity: number) => void;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

/**
 * Shared selection state consumed by the sticky buy bar, the tickets page,
 * and checkout. Local UI state only — orders live in the backend.
 */
export const useSelectionStore = create<SelectionState>((set) => ({
  tierId: "regular",
  quantity: 1,
  setTier: (tierId) => set({ tierId }),
  setQuantity: (quantity) =>
    set({
      quantity: Math.min(MAX_QUANTITY, Math.max(1, Math.floor(quantity) || 1)),
    }),
  increment: () =>
    set((state) => ({ quantity: Math.min(MAX_QUANTITY, state.quantity + 1) })),
  decrement: () =>
    set((state) => ({ quantity: Math.max(1, state.quantity - 1) })),
  reset: () => set({ tierId: "regular", quantity: 1 }),
}));

/** Subtotal for the current selection, before the service fee. */
export function selectionSubtotal(
  tierId: TicketTierId,
  quantity: number,
): number {
  return getTier(tierId).price * quantity;
}

/** Grand total for the current selection, including the service fee. */
export function selectionTotal(tierId: TicketTierId, quantity: number): number {
  return selectionSubtotal(tierId, quantity) + SERVICE_FEE;
}
