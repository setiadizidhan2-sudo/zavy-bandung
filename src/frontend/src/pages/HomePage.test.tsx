import { EVENT } from "@/lib/event";
import HomePage from "@/pages/HomePage";
import { createMockActor } from "@/test/mockActor";
import { coreInfrastructureMock, renderPage } from "@/test/renderPage";
import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { actor } = createMockActor();

vi.mock("@caffeineai/core-infrastructure", () => coreInfrastructureMock(actor));

/**
 * Home page — the cinematic landing surface.
 *
 * These are component/integration tests over the real components with a local
 * actor mock; they do not exercise the deployed backend or a real browser.
 */
describe("HomePage", () => {
  beforeEach(() => {
    // Pin the clock so the countdown is deterministic. 21 Oct 2026 19:00 WIB
    // is 12:00 UTC; freeze 2 days, 3 hours, 4 minutes, 5 seconds before it.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-19T08:55:55.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderHome() {
    return renderPage({ component: HomePage, path: "/" });
  }

  it("renders the hero event identity and a working BUY TICKET action", async () => {
    await renderHome();

    expect(screen.getByTestId("hero.section")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: EVENT.artist }),
    ).toBeInTheDocument();
    expect(screen.getByText(/live in bandung/i)).toBeInTheDocument();
    expect(screen.getAllByText(EVENT.dateLabel).length).toBeGreaterThan(0);
    expect(screen.getAllByText(EVENT.venue).length).toBeGreaterThan(0);

    const buy = screen.getByTestId("hero.primary_button");
    expect(buy).toHaveTextContent(/buy ticket/i);
    expect(buy).toHaveAttribute("href", "/tickets");
  });

  it("shows the four countdown units ticking toward the event", async () => {
    await renderHome();

    expect(screen.getByTestId("countdown.panel")).toBeInTheDocument();
    for (const label of ["Days", "Hours", "Minutes", "Seconds"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }

    // 2 days, 3 hours, 4 minutes, 5 seconds before the headline set.
    expect(screen.getByTestId("countdown.days")).toHaveTextContent("02");
    expect(screen.getByTestId("countdown.hours")).toHaveTextContent("03");
    expect(screen.getByTestId("countdown.minutes")).toHaveTextContent("04");
    expect(screen.getByTestId("countdown.seconds")).toHaveTextContent("05");
  });

  it("renders the event information cards with the accepted facts", async () => {
    await renderHome();

    expect(screen.getByTestId("experience.card.date")).toHaveTextContent(
      EVENT.dateLabel,
    );
    expect(screen.getByTestId("experience.card.time")).toHaveTextContent(
      EVENT.timeLabel,
    );
    expect(screen.getByTestId("experience.card.venue")).toHaveTextContent(
      EVENT.venue,
    );
    expect(screen.getByTestId("experience.card.location")).toHaveTextContent(
      EVENT.city,
    );
  });

  it("renders the lineup with the headline act and both support acts", async () => {
    await renderHome();

    expect(screen.getByTestId("lineup.section")).toBeInTheDocument();
    expect(screen.getByTestId("lineup.item.1")).toHaveTextContent("ZAVY");
    expect(screen.getByTestId("lineup.item.2")).toHaveTextContent(
      /special guest/i,
    );
    expect(screen.getByTestId("lineup.item.3")).toHaveTextContent(
      /dj support/i,
    );
  });

  it("renders the location card for the venue", async () => {
    await renderHome();

    expect(screen.getByTestId("location.section")).toBeInTheDocument();
    expect(screen.getByTestId("location.open_maps_button")).toHaveAttribute(
      "href",
      expect.stringContaining("Rooftop%20Coffee%20Uber"),
    );
  });
});
