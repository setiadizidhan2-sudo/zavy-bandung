import App from "@/App";
import { useSelectionStore } from "@/store/selection";
import { type MockActor, createMockActor } from "@/test/mockActor";
import { render, screen } from "@testing-library/react";
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
 * App composition — the real router tree, not a single page in isolation.
 *
 * This is the regression guard for the repaired composition: `StickyBuyBar`
 * reads `useRouterState`, so it must be mounted INSIDE the router tree. When it
 * was rendered outside, the app crashed at mount with
 * "Cannot read properties of null (reading '__store')". Rendering the real
 * `App` is the only way to catch that class of bug — a test that mounts
 * `StickyBuyBar` directly supplies the router context the broken composition
 * was missing.
 *
 * The backend is a local typed mock; the PocketIC lane exercises the real
 * canister.
 */
describe("App", () => {
  beforeEach(() => {
    holder.actor = createMockActor().actor;
    useSelectionStore.setState({ tierId: "regular", quantity: 1 });
  });

  it("mounts the default route with the sticky purchase bar inside the router tree", async () => {
    // A crash during mount would reject here rather than render a blank tree.
    render(<App />);

    // The routed page rendered.
    expect(await screen.findByTestId("home.page")).toBeInTheDocument();

    // The sticky bar rendered alongside it — the composition that used to
    // crash. Both the desktop pill and the mobile bar are in the DOM.
    expect(await screen.findByTestId("sticky.panel")).toBeInTheDocument();
    expect(
      screen.getAllByTestId("sticky.primary_button").length,
    ).toBeGreaterThan(0);
  });

  it("reflects the live selection in the sticky bar on the default route", async () => {
    useSelectionStore.setState({ tierId: "vip", quantity: 3 });

    render(<App />);

    const selection = await screen.findByTestId("sticky.selection");
    expect(selection).toHaveTextContent("VIP × 3");
    expect(screen.getByTestId("sticky.panel")).toHaveTextContent("Rp600.000");
  });
});
