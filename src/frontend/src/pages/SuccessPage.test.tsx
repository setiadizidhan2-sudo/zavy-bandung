import { SuccessPage } from "@/pages/SuccessPage";
import { makeOrder, makeTicket } from "@/test/mockActor";
import { type MockActor, createMockActor } from "@/test/mockActor";
import { renderPage } from "@/test/renderPage";
import { screen } from "@testing-library/react";
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
 * Payment success — the confirmation mark, the order number, the event
 * details, the selection, and the total.
 *
 * The backend is a local typed mock; the PocketIC lane exercises the real
 * canister.
 */
describe("SuccessPage", () => {
  beforeEach(() => {
    const mock = createMockActor({
      order: makeOrder({
        orderNumber: "ZV00001",
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
        tickets: [makeTicket({ ticketId: "ZVT00001" })],
      }),
    });
    holder.actor = mock.actor;
  });

  function renderSuccess() {
    return renderPage({
      component: SuccessPage,
      path: "/success",
      initialPath: "/success?order=ZV00001",
    });
  }

  it("shows the confirmation mark and the order summary", async () => {
    await renderSuccess();

    expect(await screen.findByTestId("success.state")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /payment successful/i }),
    ).toBeInTheDocument();

    const panel = await screen.findByTestId("success.panel");
    expect(panel).toHaveTextContent("ZV00001");
    expect(panel).toHaveTextContent("ZAVY — LIVE IN BANDUNG");
    expect(panel).toHaveTextContent("21 October 2026");
    expect(panel).toHaveTextContent("REGULAR × 2");
    expect(panel).toHaveTextContent("Rp210.000");
  });

  it("offers the e-ticket and download actions", async () => {
    await renderSuccess();

    expect(
      await screen.findByTestId("success.primary_button"),
    ).toHaveTextContent(/view e-ticket/i);
    expect(screen.getByTestId("success.secondary_button")).toHaveTextContent(
      /download ticket/i,
    );
  });
});
