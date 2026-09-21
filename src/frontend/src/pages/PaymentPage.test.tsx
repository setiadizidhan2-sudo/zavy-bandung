import { PaymentPage } from "@/pages/PaymentPage";
import { type MockActor, createMockActor } from "@/test/mockActor";
import { renderPage } from "@/test/renderPage";
import { screen, waitFor } from "@testing-library/react";
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

const STORED_ORDER = {
  orderNumber: "ZV00001",
  subtotal: "200000",
  serviceFee: "10000",
  total: "210000",
  paymentDeadline: "1792001800000000000",
  tierName: "REGULAR",
  quantity: 2,
};

/**
 * Payment — the six channels, the order details, the demo-confirmation label,
 * and the demo confirmation handoff to the success screen.
 *
 * The backend is a local typed mock; the PocketIC lane exercises the real
 * canister.
 */
describe("PaymentPage", () => {
  let actor: MockActor;
  let calls: ReturnType<typeof createMockActor>["calls"];

  beforeEach(() => {
    const mock = createMockActor();
    actor = mock.actor;
    calls = mock.calls;
    holder.actor = actor;
    window.sessionStorage.setItem("zavy.order", JSON.stringify(STORED_ORDER));
  });

  function renderPayment() {
    return renderPage({ component: PaymentPage, path: "/payment" });
  }

  it("lists all six payment methods", async () => {
    await renderPayment();

    const list = await screen.findByTestId("payment.method_list");
    for (const name of [
      "QRIS",
      "GoPay",
      "DANA",
      "OVO",
      "Virtual Account",
      "Credit / Debit Card",
    ]) {
      expect(list).toHaveTextContent(name);
    }
  });

  it("shows the order number, total payment and payment deadline", async () => {
    await renderPayment();

    const page = await screen.findByTestId("payment.page");
    expect(page).toHaveTextContent("ZV00001");
    expect(page).toHaveTextContent("Rp210.000");
    expect(page).toHaveTextContent("Payment Deadline");
    // 1792001800000000000 ns → 15 Oct 2026 01:16 WIB.
    expect(page).toHaveTextContent("15 Oct, 01:16");
  });

  it("labels the confirmation as a demo and states no real charge is made", async () => {
    await renderPayment();

    const notice = await screen.findByTestId("payment.demo_notice");
    expect(notice).toHaveTextContent(/demo confirmation/i);
    expect(notice).toHaveTextContent(/no live payment gateway is charged/i);
    expect(notice).toHaveTextContent(/no real payment is taken/i);
  });

  it("confirms the demo payment and hands the order to the success screen", async () => {
    const user = userEvent.setup();
    await renderPayment();

    await user.click(await screen.findByTestId("payment.pay_button"));

    await waitFor(() => expect(calls.confirmDemoPayment).toEqual(["ZV00001"]));
  });

  it("shows an empty state when no order is in progress", async () => {
    window.sessionStorage.clear();
    await renderPayment();

    expect(
      await screen.findByTestId("payment.empty_state"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("payment.pay_button")).not.toBeInTheDocument();
  });
});
