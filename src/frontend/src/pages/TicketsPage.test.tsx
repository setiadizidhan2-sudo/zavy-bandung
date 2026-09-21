import type { TicketTier } from "@/backend";
import TicketsPage from "@/pages/TicketsPage";
import { type MockActor, createMockActor } from "@/test/mockActor";
import { renderPage } from "@/test/renderPage";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * A mutable holder the hoisted mock factory can close over. `vi.hoisted` runs
 * before imports, so it must not reference anything imported; the real actor is
 * assigned in `beforeEach`.
 */
const holder = vi.hoisted(() => ({ actor: null as MockActor | null }));

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: holder.actor, isFetching: false }),
  InternetIdentityProvider: ({ children }: { children: unknown }) => children,
  useInternetIdentity: () => ({
    identity: undefined,
    isAuthenticated: false,
    login: () => {},
    clear: () => {},
    loginStatus: "idle",
    isInitializing: false,
    isLoginIdle: true,
    isLoggingIn: false,
    isLoginSuccess: false,
    isLoginError: false,
  }),
}));

/**
 * Tickets page — tier selection and the purchase handoff.
 *
 * Inventory comes from the mocked `listTiers`; the real canister is exercised
 * only by the PocketIC lane.
 */
describe("TicketsPage", () => {
  let actor: MockActor;

  beforeEach(() => {
    actor = createMockActor().actor;
    holder.actor = actor;
  });

  function renderTickets() {
    return renderPage({ component: TicketsPage, path: "/tickets" });
  }

  it("shows the three tiers with their prices and remaining stock", async () => {
    await renderTickets();

    const earlyBird = await screen.findByTestId("tickets.card.1");
    expect(earlyBird).toHaveTextContent("EARLY BIRD");
    expect(earlyBird).toHaveTextContent("Rp75.000");
    expect(earlyBird).toHaveTextContent("100 of 100 remaining");

    const regular = screen.getByTestId("tickets.card.2");
    expect(regular).toHaveTextContent("REGULAR");
    expect(regular).toHaveTextContent("Rp100.000");
    expect(regular).toHaveTextContent("300 of 300 remaining");

    const vip = screen.getByTestId("tickets.card.3");
    expect(vip).toHaveTextContent("VIP");
    expect(vip).toHaveTextContent("Rp200.000");
    expect(vip).toHaveTextContent("50 of 50 remaining");
  });

  it("disables purchase and shows SOLD OUT for a tier with no stock", async () => {
    const soldOutTiers: TicketTier[] = [
      {
        id: "early-bird",
        name: "EARLY BIRD",
        description: "Limited release.",
        price: 75_000n,
        capacity: 100n,
        remaining: 0n,
        soldOut: true,
      },
    ];
    // `createMockActor` returns plain async functions, not `vi.fn()`s, so
    // `vi.mocked` has no mock to reach. `vi.spyOn` installs one on the object.
    vi.spyOn(actor, "listTiers").mockResolvedValueOnce(soldOutTiers);

    await renderTickets();

    const card = await screen.findByTestId("tickets.card.1");
    const buy = within(card).getByTestId("tickets.buy_button.1");
    expect(buy).toBeDisabled();
    expect(buy).toHaveTextContent(/sold out/i);
    expect(card).toHaveTextContent("0 remaining");
  });

  it("carries the chosen tier and quantity into checkout", async () => {
    const user = userEvent.setup();
    await renderTickets();

    const regular = await screen.findByTestId("tickets.card.2");
    // Raise REGULAR to quantity 2, then buy.
    await user.click(within(regular).getByTestId("tickets.quantity_increment"));
    expect(
      within(regular).getByTestId("tickets.quantity_value"),
    ).toHaveTextContent("2");

    await user.click(within(regular).getByTestId("tickets.buy_button.2"));

    // The selection store is module state; assert the handoff the checkout page
    // reads from it.
    const { useSelectionStore } = await import("@/store/selection");
    await waitFor(() => {
      expect(useSelectionStore.getState().tierId).toBe("regular");
      expect(useSelectionStore.getState().quantity).toBe(2);
    });
  });
});
