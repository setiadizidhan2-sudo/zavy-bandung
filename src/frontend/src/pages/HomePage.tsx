import { ExperienceSection } from "@/components/home/ExperienceSection";
import { Hero } from "@/components/home/Hero";
import { LineupSection } from "@/components/home/LineupSection";
import { LocationCard } from "@/components/home/LocationCard";
import { Button } from "@/components/ui/button";
import { EVENT } from "@/lib/event";
import { Link } from "@tanstack/react-router";
import { Ticket } from "lucide-react";

/**
 * Home — the cinematic single-event landing page.
 * Hero → experience → lineup → location → closing purchase CTA.
 */
export default function HomePage() {
  return (
    <div data-ocid="home.page">
      <Hero />
      <ExperienceSection />
      <LineupSection />
      <LocationCard />

      <section
        data-ocid="home.cta_section"
        className="border-t border-white/5 bg-surface-2"
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-20 text-center md:px-8 md:py-28">
          <p className="label-eyebrow">Limited Capacity</p>
          <h2 className="font-display-xl mx-auto mt-4 max-w-2xl text-foreground">
            {EVENT.dateLabel} — be on the roof.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            One night only at {EVENT.venue}, {EVENT.city}. Secure your place
            before the rooftop fills up.
          </p>
          <div className="mt-9 flex justify-center">
            <Button
              asChild
              data-ocid="home.primary_button"
              className="tap-target h-14 w-full rounded-sm border border-accent/40 bg-gradient-cta px-10 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-edge-blue transition-smooth hover:-translate-y-px hover:shadow-edge-cyan sm:w-auto"
            >
              <Link to="/tickets">
                <Ticket />
                Buy Ticket
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
