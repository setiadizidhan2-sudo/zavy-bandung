import { TermsPage } from "@/pages/TermsPage";
import { renderPage } from "@/test/renderPage";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

/**
 * Terms & Conditions — the seven expandable placeholder sections.
 *
 * The copy is intentionally placeholder; these tests assert the sections exist
 * and that each one expands and collapses, not the wording of any clause.
 */
describe("TermsPage", () => {
  function renderTerms() {
    return renderPage({ component: TermsPage, path: "/terms" });
  }

  it("lists all seven policy sections", async () => {
    await renderTerms();

    const list = await screen.findByTestId("terms.list");
    for (const title of [
      "Ticket policy",
      "Refund policy",
      "Entry requirements",
      "Age restrictions",
      "Venue rules",
      "Prohibited items",
      "Event cancellation policy",
    ]) {
      expect(within(list).getByText(title)).toBeInTheDocument();
    }
  });

  it("expands and collapses a section on click", async () => {
    const user = userEvent.setup();
    await renderTerms();

    const item = await screen.findByTestId("terms.item.1");
    const trigger = within(item).getByRole("button", { name: "Ticket policy" });

    // Collapsed: the placeholder body is not in the accessibility tree.
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(
      within(item).queryByText(
        /the organizer will publish the full ticket policy/i,
      ),
    ).not.toBeInTheDocument();

    await user.click(trigger);
    await waitFor(() =>
      expect(trigger).toHaveAttribute("aria-expanded", "true"),
    );
    expect(
      within(item).getByText(
        /the organizer will publish the full ticket policy/i,
      ),
    ).toBeInTheDocument();

    await user.click(trigger);
    await waitFor(() =>
      expect(trigger).toHaveAttribute("aria-expanded", "false"),
    );
  });

  it("keeps multiple sections open at once", async () => {
    const user = userEvent.setup();
    await renderTerms();

    const first = await screen.findByTestId("terms.item.1");
    const second = screen.getByTestId("terms.item.2");

    await user.click(
      within(first).getByRole("button", { name: "Ticket policy" }),
    );
    await user.click(
      within(second).getByRole("button", { name: "Refund policy" }),
    );

    await waitFor(() =>
      expect(
        within(first).getByRole("button", { name: "Ticket policy" }),
      ).toHaveAttribute("aria-expanded", "true"),
    );
    expect(
      within(second).getByRole("button", { name: "Refund policy" }),
    ).toHaveAttribute("aria-expanded", "true");
  });
});
