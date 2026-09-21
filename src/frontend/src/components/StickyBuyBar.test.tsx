import { StickyBuyBar } from "@/components/StickyBuyBar";
import { useSelectionStore } from "@/store/selection";
import { renderPage } from "@/test/renderPage";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

/**
 * Sticky purchase affordance.
 *
 * The desktop pill and the mobile bar are both rendered (CSS decides which is
 * visible), so both are asserted here. The bar reflects the live selection from
 * the shared store.
 */
describe("StickyBuyBar", () => {
  beforeEach(() => {
    useSelectionStore.setState({ tierId: "regular", quantity: 1 });
  });

  function renderBar(path = "/") {
    return renderPage({ component: StickyBuyBar, path });
  }

  it("shows the live selection and links to checkout", async () => {
    useSelectionStore.setState({ tierId: "vip", quantity: 3 });
    await renderBar();

    const selection = await screen.findByTestId("sticky.selection");
    expect(selection).toHaveTextContent("VIP × 3");
    expect(screen.getByTestId("sticky.panel")).toHaveTextContent("Rp600.000");

    const buttons = screen.getAllByTestId("sticky.primary_button");
    expect(buttons.length).toBeGreaterThan(0);
    for (const button of buttons) {
      expect(button).toHaveAttribute("href", "/checkout");
    }
  });

  it("hides the purchase bar on checkout and payment routes", async () => {
    await renderBar("/checkout");
    expect(screen.queryByTestId("sticky.panel")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("sticky.primary_button"),
    ).not.toBeInTheDocument();
  });
});
