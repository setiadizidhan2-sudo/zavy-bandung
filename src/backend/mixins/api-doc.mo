mixin () {
  /// Static Markdown description of this backend's public API.
  public query func getApiDoc() : async Text {
    "# ZAVY — LIVE IN BANDUNG — Backend API

This canister sells tickets for a single hard-coded event, **ZAVY — LIVE IN
BANDUNG**, at Rooftop Coffee Uber, Bandung on 21 October 2026, 19:00 WIB. It
exposes the event and its ticket tiers, creates orders that reserve live
inventory, confirms payment, and validates ticket tokens at the venue door.

## Public methods

| Method | Kind | Purpose |
| --- | --- | --- |
| `getEvent()` | query | The single event's name, date, time, timezone, venue, city, and `startsAt`. |
| `listTiers()` | query | The three ticket tiers with live remaining stock and a `soldOut` flag. |
| `createOrder(fullName, email, whatsapp, tierId, quantity)` | update | Validates the three checkout fields, reserves stock, and returns an order number and payment deadline. |
| `getOrder(orderNumber)` | query | The full order view for an order number, or `null` if unknown. |
| `confirmDemoPayment(orderNumber)` | update | Marks a pending order paid and issues its tickets. |
| `validateTicket(token)` | update | Resolves a scanned secure token to VALID / ALREADY USED / INVALID and marks the ticket used on first success. |
| `getApiDoc()` | query | This document. |

## Authentication and authorization

All methods above are callable by any caller, including anonymous ones. There
is no sign-in requirement and no owner/admin gate on the ticket-purchase and
validation flow: `createOrder`, `getOrder`, `confirmDemoPayment`, and
`validateTicket` are open so that a buyer can complete checkout and door staff
can scan without an account.

The app's frontend pins an Internet Identity derivation origin, published at
`/.well-known/ii-derivation-origin` when available. An agent already holding
the user's Internet Identity authorization derives the correct per-app
principal against that origin (for example
`icp identity link web <name> --app <host>`). Such a delegation acts with the
user's full authority in this app until it expires.

## Units and encodings

- **Money** is whole Indonesian Rupiah (`Nat`), no decimals and no minor units.
  Tier prices are 75_000 (EARLY BIRD), 100_000 (REGULAR), and 200_000 (VIP).
  Every order adds a fixed **service fee of 10_000**.
- **Timestamps** are nanoseconds since the Unix epoch, as IC time (`Int`).
  `startsAt` is the doors-open instant; `createdAt` and `paymentDeadline` are
  order instants.
- **Identifiers** are opaque text: `orderNumber` (e.g. `ZV82931`), `ticketId`
  (e.g. `ZVT82931`), `tierId` (`early-bird`, `regular`, `vip`), and `eventId`.
- **`secureToken`** is a 128-bit lowercase-hex string. It is the only value
  encoded in the QR code and carries no personal data.
- **Statuses** are variants: order `#pending | #paid | #expired | #cancelled`;
  ticket `#valid | #used | #cancelled | #refunded`.
- **`validateTicket`** returns `#validTicket`, `#alreadyUsed`, or
  `#invalidTicket`.

## Order lifecycle and payment deadline

1. `createOrder` reserves the requested quantity against live inventory and
   returns `#ok` with `orderNumber`, `subtotal`, `serviceFee`, `total`, and
   `paymentDeadline`. The order starts `#pending`.
2. `paymentDeadline` is 30 minutes after creation. Confirming after it expires
   the order and returns `#err(#orderExpired(orderNumber))`.
3. `confirmDemoPayment` moves a pending order to `#paid` and issues one ticket
   per unit. Confirming an already-paid order returns
   `#err(#alreadyPaid(orderNumber))`.
4. `validateTicket` marks a `#valid` ticket `#used` on first scan; a repeat scan
   returns `#alreadyUsed`. `#cancelled` and `#refunded` tickets return
   `#invalidTicket`.

## Polling guidance

`getOrder` is a query and is safe to poll. After `createOrder`, poll
`getOrder(orderNumber)` until `status` is `#paid` (tickets populated) or
`#expired`. Do not poll `confirmDemoPayment`; call it once and branch on the
result.

## Mutation retry safety

- `createOrder` is **not idempotent**: each call reserves stock and issues a new
  order number. Retrying after a timeout can double-reserve. Reuse the returned
  `orderNumber` rather than re-submitting.
- `confirmDemoPayment` is safe to retry: a second call on a paid order returns
  `#err(#alreadyPaid)` without issuing duplicate tickets.
- `validateTicket` is **destructive by design**: the first successful scan
  consumes the ticket. A retry after a network timeout may report
  `#alreadyUsed` for a ticket that was in fact just validated.

## Errors and limits

- `createOrder` returns `#err(#invalidInput(text))` for a missing name, an
  implausible email, an implausible WhatsApp number, or a quantity outside
  1–10; `#err(#unknownTier(tierId))` for an unknown tier; and
  `#err(#insufficientStock({ tierId; requested; remaining }))` when the
  requested quantity exceeds live stock.
- `confirmDemoPayment` returns `#err(#unknownOrder)`, `#err(#alreadyPaid)`, or
  `#err(#orderExpired)`.
- Tier capacities are fixed: EARLY BIRD 100, REGULAR 300, VIP 50. A tier with
  zero remaining reports `soldOut = true` and cannot be purchased.

## Gotchas

- **`confirmDemoPayment` is the single Midtrans integration point.** It is a
  demo path that marks an order paid without contacting a payment gateway. A
  real Midtrans or Xendit charge and webhook confirmation would replace this
  one method; no other endpoint simulates payment.
- **`getOrder` never returns the secure token.** The token is stored only in the
  internal ticket record and is never projected by any public read endpoint, so
  the QR payload cannot be recovered from `getOrder`.
- **`listTiers` reads live inventory.** `remaining` decrements as orders are
  placed and is restored by the migration chain on upgrade; `soldOut` is true
  only when `remaining` is actually zero.
- **`getEvent` and `listTiers` share the same tier catalogue**, so tier ids,
  names, prices, and capacities are consistent across both.
";
  };
};
