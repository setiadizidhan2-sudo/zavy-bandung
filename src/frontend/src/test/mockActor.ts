import type {
  ConfirmPaymentResult,
  CreateOrderResult,
  Order,
  ScanResult,
  Ticket,
  TicketTier,
} from "@/backend";
import { OrderStatus, TicketStatus } from "@/backend";

/**
 * A typed, in-memory stand-in for the generated `Backend` actor.
 *
 * It implements only the public methods the frontend actually calls, with the
 * same signatures the generated bindings expose. Tests assert against the
 * calls it records, so a component that stops calling the backend fails here.
 *
 * This is a local mock: it proves nothing about the real canister. The PocketIC
 * lane in `app/test/pocketic` is what exercises the deployed backend.
 */
export interface MockActor {
  listTiers: () => Promise<TicketTier[]>;
  getEvent: () => Promise<{
    id: string;
    name: string;
    tagline: string;
    date: string;
    time: string;
    timezone: string;
    venue: string;
    city: string;
    startsAt: bigint;
  }>;
  createOrder: (
    fullName: string,
    email: string,
    whatsapp: string,
    tierId: string,
    quantity: bigint,
  ) => Promise<
    | { __kind__: "ok"; ok: CreateOrderResult }
    | { __kind__: "err"; err: unknown }
  >;
  getOrder: (orderNumber: string) => Promise<Order | null>;
  confirmDemoPayment: (
    orderNumber: string,
  ) => Promise<
    | { __kind__: "ok"; ok: ConfirmPaymentResult }
    | { __kind__: "err"; err: unknown }
  >;
  validateTicket: (token: string) => Promise<ScanResult>;
}

export interface MockActorOptions {
  tiers?: TicketTier[];
  order?: Order | null;
  createOrderResult?: CreateOrderResult;
  confirmResult?: ConfirmPaymentResult;
  createOrderError?: unknown;
  confirmError?: unknown;
}

export const DEFAULT_TIERS: TicketTier[] = [
  {
    id: "early-bird",
    name: "EARLY BIRD",
    description: "Limited release.",
    price: 75_000n,
    capacity: 100n,
    remaining: 100n,
    soldOut: false,
  },
  {
    id: "regular",
    name: "REGULAR",
    description: "General admission.",
    price: 100_000n,
    capacity: 300n,
    remaining: 300n,
    soldOut: false,
  },
  {
    id: "vip",
    name: "VIP",
    description: "Premium viewing.",
    price: 200_000n,
    capacity: 50n,
    remaining: 50n,
    soldOut: false,
  },
];

export function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    ticketId: "ZVT00001",
    eventId: "zavy-live-in-bandung",
    ticketType: "regular",
    orderId: "ZV00001",
    secureToken: "a".repeat(32),
    status: TicketStatus.valid,
    ...overrides,
  };
}

export function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    orderNumber: "ZV00001",
    status: OrderStatus.paid,
    customer: {
      fullName: "Nadia Prameswari",
      email: "nadia@email.com",
      whatsapp: "+6281234567890",
    },
    lines: [
      {
        tierId: "regular",
        tierName: "REGULAR",
        unitPrice: 100_000n,
        quantity: 2n,
        lineTotal: 200_000n,
      },
    ],
    subtotal: 200_000n,
    serviceFee: 10_000n,
    total: 210_000n,
    createdAt: 1_792_000_000_000_000_000n,
    paymentDeadline: 1_792_001_800_000_000_000n,
    tickets: [makeTicket()],
    ...overrides,
  };
}

export function makeCreateOrderResult(
  overrides: Partial<CreateOrderResult> = {},
): CreateOrderResult {
  return {
    orderNumber: "ZV00001",
    subtotal: 200_000n,
    serviceFee: 10_000n,
    total: 210_000n,
    paymentDeadline: 1_792_001_800_000_000_000n,
    ...overrides,
  };
}

export function makeConfirmResult(
  overrides: Partial<ConfirmPaymentResult> = {},
): ConfirmPaymentResult {
  return {
    orderNumber: "ZV00001",
    status: OrderStatus.paid,
    tickets: [makeTicket()],
    ...overrides,
  };
}

/** Records every call so tests can assert the frontend/backend contract. */
export interface MockActorCalls {
  createOrder: Array<{
    fullName: string;
    email: string;
    whatsapp: string;
    tierId: string;
    quantity: bigint;
  }>;
  confirmDemoPayment: string[];
  validateTicket: string[];
}

export function createMockActor(options: MockActorOptions = {}): {
  actor: MockActor;
  calls: MockActorCalls;
} {
  const calls: MockActorCalls = {
    createOrder: [],
    confirmDemoPayment: [],
    validateTicket: [],
  };

  const actor: MockActor = {
    listTiers: async () => options.tiers ?? DEFAULT_TIERS,
    getEvent: async () => ({
      id: "zavy-live-in-bandung",
      name: "ZAVY — LIVE IN BANDUNG",
      tagline: "One night. One stage. Live in Bandung.",
      date: "2026-10-21",
      time: "19:00",
      timezone: "WIB",
      venue: "Rooftop Coffee Uber",
      city: "Bandung",
      startsAt: 1_792_670_400_000_000_000n,
    }),
    createOrder: async (fullName, email, whatsapp, tierId, quantity) => {
      calls.createOrder.push({ fullName, email, whatsapp, tierId, quantity });
      if (options.createOrderError !== undefined) {
        return { __kind__: "err", err: options.createOrderError };
      }
      return {
        __kind__: "ok",
        ok: options.createOrderResult ?? makeCreateOrderResult(),
      };
    },
    getOrder: async () => options.order ?? null,
    confirmDemoPayment: async (orderNumber) => {
      calls.confirmDemoPayment.push(orderNumber);
      if (options.confirmError !== undefined) {
        return { __kind__: "err", err: options.confirmError };
      }
      return {
        __kind__: "ok",
        ok: options.confirmResult ?? makeConfirmResult(),
      };
    },
    validateTicket: async (token) => {
      calls.validateTicket.push(token);
      return { __kind__: "invalidTicket", invalidTicket: null };
    },
  };

  return { actor, calls };
}
