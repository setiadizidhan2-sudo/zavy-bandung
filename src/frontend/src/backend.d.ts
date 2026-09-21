import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cell {
    value: Value;
    name: string;
}
export type ConfirmPaymentError = {
    __kind__: "alreadyPaid";
    alreadyPaid: OrderNumber;
} | {
    __kind__: "unknownOrder";
    unknownOrder: OrderNumber;
} | {
    __kind__: "orderExpired";
    orderExpired: OrderNumber;
};
export interface ConfirmPaymentResult {
    status: OrderStatus;
    tickets: Array<Ticket>;
    orderNumber: OrderNumber;
}
export type CreateOrderError = {
    __kind__: "invalidInput";
    invalidInput: string;
} | {
    __kind__: "unknownTier";
    unknownTier: TierId;
} | {
    __kind__: "insufficientStock";
    insufficientStock: {
        requested: bigint;
        tierId: TierId;
        remaining: bigint;
    };
};
export interface CreateOrderResult {
    total: Rupiah;
    paymentDeadline: Timestamp;
    serviceFee: Rupiah;
    orderNumber: OrderNumber;
    subtotal: Rupiah;
}
export interface CustomerInfo {
    whatsapp: string;
    fullName: string;
    email: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export type EventId = string;
export interface EventInfo {
    id: EventId;
    timezone: string;
    venue: string;
    tagline: string;
    city: string;
    date: string;
    startsAt: Timestamp;
    name: string;
    time: string;
}
export interface Order {
    status: OrderStatus;
    total: Rupiah;
    tickets: Array<Ticket>;
    customer: CustomerInfo;
    paymentDeadline: Timestamp;
    createdAt: Timestamp;
    lines: Array<OrderLine>;
    serviceFee: Rupiah;
    orderNumber: OrderNumber;
    subtotal: Rupiah;
}
export interface OrderLine {
    tierId: TierId;
    tierName: string;
    lineTotal: Rupiah;
    quantity: bigint;
    unitPrice: Rupiah;
}
export type OrderNumber = string;
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Rupiah = bigint;
export type ScanResult = {
    __kind__: "alreadyUsed";
    alreadyUsed: {
        ticketId: TicketId;
        ticketType: TierId;
    };
} | {
    __kind__: "invalidTicket";
    invalidTicket: null;
} | {
    __kind__: "validTicket";
    validTicket: {
        ticketId: TicketId;
        ticketType: TierId;
    };
};
export type SecureToken = string;
export interface Ticket {
    status: TicketStatus;
    eventId: EventId;
    secureToken: SecureToken;
    ticketId: TicketId;
    orderId: OrderNumber;
    ticketType: TierId;
}
export type TicketId = string;
export interface TicketTier {
    id: TierId;
    name: string;
    description: string;
    soldOut: boolean;
    remaining: bigint;
    capacity: bigint;
    price: Rupiah;
}
export type TierId = string;
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum OrderStatus {
    cancelled = "cancelled",
    expired = "expired",
    pending = "pending",
    paid = "paid"
}
export enum TicketStatus {
    cancelled = "cancelled",
    valid = "valid",
    used = "used",
    refunded = "refunded"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Demo payment confirmation — marks the order paid and issues tickets.
     * / Documented as a demo path; the single Midtrans integration point.
     */
    confirmDemoPayment(orderNumber: OrderNumber): Promise<{
        __kind__: "ok";
        ok: ConfirmPaymentResult;
    } | {
        __kind__: "err";
        err: ConfirmPaymentError;
    }>;
    /**
     * / Create an order from the three checkout fields plus tier and quantity.
     */
    createOrder(fullName: string, email: string, whatsapp: string, tierId: TierId, quantity: bigint): Promise<{
        __kind__: "ok";
        ok: CreateOrderResult;
    } | {
        __kind__: "err";
        err: CreateOrderError;
    }>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Static Markdown description of this backend's public API.
     */
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / The single hard-coded event.
     */
    getEvent(): Promise<EventInfo>;
    /**
     * / Fetch an order by its order number.
     */
    getOrder(orderNumber: OrderNumber): Promise<Order | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / All ticket tiers with live remaining stock, read from the actor's
     * / inventory map. `soldOut` is true only when remaining is actually zero.
     */
    listTiers(): Promise<Array<TicketTier>>;
    schema(): Promise<string>;
    /**
     * / Venue scan validation: resolves a scanned secure token to VALID TICKET,
     * / ALREADY USED, or INVALID TICKET, marking the ticket used on first success.
     */
    validateTicket(token: SecureToken): Promise<ScanResult>;
}
