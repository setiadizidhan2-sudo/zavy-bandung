import { TicketPage } from "@/pages/TicketPage";
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

const TOKEN = "b".repeat(32);

/**
 * E-ticket — the luxury pass, its details, and the QR payload policy.
 *
 * The QR image itself is opaque in jsdom, so the "token only" contract is
 * asserted through the token plumbing (`ticketTokens.test.ts`) and by checking
 * that no personal information is rendered as the QR payload.
 */
describe("TicketPage", () => {
  beforeEach(() => {
    const mock = createMockActor({
      order: makeOrder({
        customer: {
          fullName: "Nadia Prameswari",
          email: "nadia@email.com",
          whatsapp: "+6281234567890",
        },
        tickets: [makeTicket({ ticketId: "ZVT00001", secureToken: TOKEN })],
      }),
    });
    holder.actor = mock.actor;
  });

  function renderTicket() {
    return renderPage({
      component: TicketPage,
      path: "/ticket",
      initialPath: `/ticket?order=ZV00001&token=ZVT00001:${TOKEN}`,
    });
  }

  it("shows the event details, holder name, tier and ticket id", async () => {
    await renderTicket();

    const card = await screen.findByTestId("ticket.card");
    expect(card).toHaveTextContent("ZAVY");
    expect(card).toHaveTextContent("21 October 2026");
    expect(card).toHaveTextContent("19:00 WIB");
    expect(card).toHaveTextContent("Rooftop Coffee Uber, Bandung");
    expect(card).toHaveTextContent("Nadia Prameswari");
    expect(card).toHaveTextContent("REGULAR");
    expect(screen.getByTestId("ticket.id")).toHaveTextContent("ZVT00001");
    expect(screen.getByTestId("ticket.order_number")).toHaveTextContent(
      "ZV00001",
    );
  });

  it("renders the QR and the download / wallet actions", async () => {
    await renderTicket();

    expect(await screen.findByTestId("ticket.qr")).toBeInTheDocument();
    expect(screen.getByTestId("ticket.primary_button")).toHaveTextContent(
      /download ticket/i,
    );
    expect(screen.getByTestId("ticket.secondary_button")).toHaveTextContent(
      /add to wallet/i,
    );
  });

  it("shows an explicit error state instead of a QR when the token is missing", async () => {
    await renderPage({
      component: TicketPage,
      path: "/ticket",
      initialPath: "/ticket?order=ZV00001",
    });

    expect(
      await screen.findByTestId("ticket.token_error_state"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("ticket.qr")).not.toBeInTheDocument();
  });
});
