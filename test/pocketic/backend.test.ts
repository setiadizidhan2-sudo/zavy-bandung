import { PocketIc } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

/**
 * Backend behavior lane — the real canister, installed into the platform's
 * PocketIC replica and called through its generated Candid interface.
 *
 * This is the only place the app's Motoko is executed. The frontend suite mocks
 * the actor, so it passes identically against a backend whose public methods are
 * unimplemented stubs; this lane is what proves the public API actually answers.
 *
 * The runner (`run-backend-lane.mjs`) declines cleanly when the wasm, the
 * declarations, the PocketIC client, or the sidecar are unavailable, so a
 * sandbox without a replica never blocks a deployment.
 */
const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: _SERVICE;

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  // `?.` because `beforeAll` may not have got that far. A failed
  // `PocketIc.create` otherwise stacks "Cannot read properties of undefined"
  // on top of the real error and buries the one line that explains the run.
  await pic?.tearDown();
});

it("answers the empty-state reads instead of trapping", async () => {
  const event = await actor.getEvent();
  expect(event.id).toBe("zavy-live-in-bandung");
  expect(event.venue).toBe("Rooftop Coffee Uber");
  expect(event.city).toBe("Bandung");

  const tiers = await actor.listTiers();
  expect(tiers.map((tier) => tier.id)).toEqual([
    "early-bird",
    "regular",
    "vip",
  ]);
  expect(tiers.map((tier) => tier.price)).toEqual([75_000n, 100_000n, 200_000n]);
  expect(tiers.map((tier) => tier.remaining)).toEqual([100n, 300n, 50n]);
});

it("round-trips an order through createOrder and getOrder", async () => {
  const created = await actor.createOrder(
    "Nadia Prameswari",
    "nadia@email.com",
    "+6281234567890",
    "regular",
    2n,
  );
  expect(created).toHaveProperty("ok");
  if (!("ok" in created)) {
    throw new Error(`createOrder rejected: ${JSON.stringify(created)}`);
  }
  const { orderNumber, subtotal, serviceFee, total } = created.ok;
  expect(subtotal).toBe(200_000n);
  expect(serviceFee).toBe(10_000n);
  expect(total).toBe(210_000n);

  const order = await actor.getOrder(orderNumber);
  expect(order).toHaveLength(1);
  expect(order[0]?.orderNumber).toBe(orderNumber);
  expect(order[0]?.customer.fullName).toBe("Nadia Prameswari");
  expect(order[0]?.lines[0]?.quantity).toBe(2n);
});

it("reduces the selected tier's remaining stock after an order", async () => {
  const before = await actor.listTiers();
  const regularBefore = before.find((tier) => tier.id === "regular")?.remaining;

  const created = await actor.createOrder(
    "Budi Santoso",
    "budi@email.com",
    "+6281200000000",
    "regular",
    1n,
  );
  expect(created).toHaveProperty("ok");

  const after = await actor.listTiers();
  const regularAfter = after.find((tier) => tier.id === "regular")?.remaining;
  expect(regularAfter).toBe((regularBefore ?? 0n) - 1n);
});

it("rejects an order for an unknown tier", async () => {
  const created = await actor.createOrder(
    "Siti Aminah",
    "siti@email.com",
    "+6281300000000",
    "does-not-exist",
    1n,
  );
  expect(created).toHaveProperty("err");
});

it("issues tickets on demo payment and validates the token once", async () => {
  const created = await actor.createOrder(
    "Rina Wijaya",
    "rina@email.com",
    "+6281400000000",
    "vip",
    1n,
  );
  expect(created).toHaveProperty("ok");
  if (!("ok" in created)) {
    throw new Error(`createOrder rejected: ${JSON.stringify(created)}`);
  }

  const confirmed = await actor.confirmDemoPayment(created.ok.orderNumber);
  expect(confirmed).toHaveProperty("ok");
  if (!("ok" in confirmed)) {
    throw new Error(`confirmDemoPayment rejected: ${JSON.stringify(confirmed)}`);
  }
  expect(confirmed.ok.tickets).toHaveLength(1);
  const token = confirmed.ok.tickets[0]?.secureToken ?? "";
  expect(token.length).toBeGreaterThan(0);

  // First scan: valid. Second scan of the same token: already used.
  const first = await actor.validateTicket(token);
  expect(first).toHaveProperty("validTicket");
  const second = await actor.validateTicket(token);
  expect(second).toHaveProperty("alreadyUsed");

  // An unknown token is invalid.
  const unknown = await actor.validateTicket("not-a-real-token");
  expect(unknown).toHaveProperty("invalidTicket");
});
