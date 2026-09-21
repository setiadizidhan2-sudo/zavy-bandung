import { ExperienceSection } from "@/components/home/ExperienceSection";
import { LineupSection } from "@/components/home/LineupSection";
import { LocationCard } from "@/components/home/LocationCard";
import { Button } from "@/components/ui/button";
import { EVENT } from "@/lib/event";
import { Link } from "@tanstack/react-router";
import { Ticket } from "lucide-react";

/**
 * Event Information — the same experience, facts, location and lineup as the
 * home page, presented as a dedicated page with its own page header.
 */
export default function EventPage() {
  return (
    <div data-ocid="event.page">
      <section
        data-ocid="event.header_section"
        className="relative isolate overflow-hidden border-b border-white/5 bg-surface-0"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 -z-10 h-full bg-stage"
        />
        <div
          aria-hidden="true"
          className="absolute -right-20 top-10 -z-10 size-72 rounded-full bg-primary/15 blur-3xl animate-drift"
        />

        <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-28 md:px-8 md:pb-20 md:pt-36">
          <p className="label-eyebrow animate-fade-in">Event Information</p>
          <h1 className="font-display-xl mt-4 max-w-3xl text-foreground animate-slide-up delay-100">
            {EVENT.name}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground animate-slide-up delay-200 md:text-lg">
            Everything you need before the lights go down — the set times, the
            rooftop, and how to get there.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground animate-slide-up delay-300 md:text-sm">
            <span>{EVENT.dateLabel}</span>
            <span aria-hidden="true" className="text-accent">
              /
            </span>
            <span>{EVENT.timeLabel}</span>
            <span aria-hidden="true" className="text-accent">
              /
            </span>
            <span>
              {EVENT.venue}, {EVENT.city}
            </span>
          </div>

          <div className="mt-9 animate-slide-up delay-500">
            <Button
              asChild
              data-ocid="event.primary_button"
              className="tap-target h-14 w-full rounded-sm border border-accent/40 bg-gradient-cta px-8 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-edge-blue transition-smooth hover:-translate-y-px hover:shadow-edge-cyan sm:w-auto"
            >
              <Link to="/tickets">
                <Ticket />
                Buy Ticket
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <ExperienceSection />
      <LineupSection />
      <LocationCard />
    </div>
  );
}
