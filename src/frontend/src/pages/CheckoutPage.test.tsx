import { CheckoutPage } from "@/pages/CheckoutPage";
import { useSelectionStore } from "@/store/selection";
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
 * Checkout — the three-field form, the order summary math, and the
 * Terms & Conditions gate on CONTINUE TO PAYMENT.
 *
 * The backend is a local typed mock; the PocketIC lane exercises the real
 * canister.
 */
describe("CheckoutPage", () => {
  let actor: MockActor;
  let calls: ReturnType<typeof createMockActor>["calls"];

  beforeEach(() => {
    const mock = createMockActor();
    actor = mock.actor;
    calls = mock.calls;
    holder.actor = actor;
    // REGULAR × 2 is the accepted acceptance-criteria selection.
    useSelectionStore.setState({ tierId: "regular", quantity: 2 });
  });

  function renderCheckout() {
    return renderPage({ component: CheckoutPage, path: "/checkout" });
  }

  async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
    await user.type(
      screen.getByTestId("checkout.full_name_input"),
      "Nadia Prameswari",
    );
    await user.type(
      screen.getByTestId("checkout.email_input"),
      "nadia@email.com",
    );
    await user.type(
      screen.getByTestId("checkout.whatsapp_input"),
      "081234567890",
    );
  }

  it("shows REGULAR × 2 with subtotal, service fee and total", async () => {
    await renderCheckout();

    const summary = await screen.findByTestId("checkout.order_summary");
    expect(summary).toHaveTextContent("REGULAR");
    expect(summary).toHaveTextContent("REGULAR × 2");
    expect(summary).toHaveTextContent("Rp200.000");
    expect(summary).toHaveTextContent("Service Fee");
    expect(summary).toHaveTextContent("Rp10.000");
    expect(summary).toHaveTextContent("Total");
    expect(summary).toHaveTextContent("Rp210.000");
  });

  it("keeps CONTINUE TO PAYMENT blocked until the form and terms are complete", async () => {
    const user = userEvent.setup();
    await renderCheckout();

    const submit = await screen.findByTestId("checkout.submit_button");
    expect(submit).toBeDisabled();

    // Fields filled but terms unchecked — still blocked.
    await fillValidForm(user);
    expect(submit).toBeDisabled();

    // Terms checked — now enabled.
    await user.click(screen.getByTestId("checkout.terms_checkbox"));
    await waitFor(() => expect(submit).toBeEnabled());
  });

  it("keeps the submit blocked and creates no order for an invalid email", async () => {
    const user = userEvent.setup();
    await renderCheckout();

    await user.type(screen.getByTestId("checkout.email_input"), "not-an-email");
    await user.click(screen.getByTestId("checkout.terms_checkbox"));

    // An invalid email keeps CONTINUE TO PAYMENT disabled, so no order is
    // created and the buyer cannot reach payment with bad details.
    const submit = await screen.findByTestId("checkout.submit_button");
    expect(submit).toBeDisabled();
    expect(calls.createOrder).toHaveLength(0);
  });

  it("creates the order with the normalised WhatsApp number and the selection", async () => {
    const user = userEvent.setup();
    await renderCheckout();

    await fillValidForm(user);
    await user.click(screen.getByTestId("checkout.terms_checkbox"));
    await user.click(screen.getByTestId("checkout.submit_button"));

    await waitFor(() => expect(calls.createOrder).toHaveLength(1));
    expect(calls.createOrder[0]).toEqual({
      fullName: "Nadia Prameswari",
      email: "nadia@email.com",
      whatsapp: "+6281234567890",
      tierId: "regular",
      quantity: 2n,
    });
  });

  it("surfaces a backend rejection as a buyer-facing error", async () => {
    const user = userEvent.setup();
    const mock = createMockActor({
      createOrderError: {
        __kind__: "insufficientStock",
        insufficientStock: { tierId: "regular", requested: 2n, remaining: 1n },
      },
    });
    holder.actor = mock.actor;

    await renderCheckout();
    await fillValidForm(user);
    await user.click(screen.getByTestId("checkout.terms_checkbox"));
    await user.click(screen.getByTestId("checkout.submit_button"));

    const alert = await screen.findByTestId("checkout.error_state");
    expect(alert).toHaveTextContent(/only 1 regular tickets are left/i);
  });

  it("lets the buyer change quantity from the order summary", async () => {
    const user = userEvent.setup();
    await renderCheckout();

    const summary = await screen.findByTestId("checkout.order_summary");
    await user.click(
      within(summary).getByTestId("checkout.quantity_increment"),
    );

    expect(useSelectionStore.getState().quantity).toBe(3);
    await waitFor(() => expect(summary).toHaveTextContent("REGULAR × 3"));
    expect(summary).toHaveTextContent("Rp300.000");
    expect(summary).toHaveTextContent("Rp310.000");
  });
});
