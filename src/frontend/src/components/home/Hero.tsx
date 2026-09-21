import { CountdownTimer } from "@/components/home/CountdownTimer";
import { ScrollCue } from "@/components/home/ScrollCue";
import { Button } from "@/components/ui/button";
import { EVENT } from "@/lib/event";
import { Link } from "@tanstack/react-router";
import { Ticket } from "lucide-react";

const HERO_IMAGE = "/assets/generated/hero-stage.dim_1920x1080.jpg";

/**
 * Full-screen cinematic hero: lit-stage background, oversized wordmark,
 * live countdown and the single primary purchase action.
 */
export function Hero() {
  return (
    <section
      data-ocid="hero.section"
      className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden"
    >
      {/* Stage photography */}
      <img
        src={HERO_IMAGE}
        alt="ZAVY performing on a rooftop stage bathed in electric blue and cyan light"
        width={1920}
        height={1080}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 -z-20 size-full object-cover object-center"
      />

      {/* Cinematic darkening + stage bloom */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-background/85 via-background/55 to-background"
      />
      <div aria-hidden="true" className="vignette absolute inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-stage"
      />
      <div
        aria-hidden="true"
        className="absolute -left-24 top-1/4 -z-10 size-72 rounded-full bg-primary/20 blur-3xl animate-drift"
      />
      <div
        aria-hidden="true"
        className="absolute -right-16 top-1/3 -z-10 size-64 rounded-full bg-accent/15 blur-3xl animate-drift"
      />

      <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-32 md:px-8 md:pb-24">
        <p className="label-eyebrow animate-fade-in">
          {EVENT.organizer} presents
        </p>

        <h1 className="font-hero mt-5 text-foreground animate-slide-up delay-100">
          <span className="block text-gradient">{EVENT.artist}</span>
        </h1>

        <p className="mt-4 font-display text-xl font-semibold uppercase tracking-[0.22em] text-foreground animate-slide-up delay-200 md:text-2xl">
          Live in {EVENT.city}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground animate-slide-up delay-300 md:text-sm">
          <span>{EVENT.dateLabel}</span>
          <span aria-hidden="true" className="text-accent">
            /
          </span>
          <span>{EVENT.venue}</span>
        </div>

        <div className="mt-10 flex flex-col gap-6 animate-slide-up delay-500 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              data-ocid="hero.primary_button"
              className="tap-target h-14 w-full rounded-sm border border-accent/40 bg-gradient-cta px-8 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-edge-blue transition-smooth hover:-translate-y-px hover:shadow-edge-cyan animate-glow-pulse sm:w-auto"
            >
              <Link to="/tickets">
                <Ticket />
                Buy Ticket
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              data-ocid="hero.secondary_button"
              className="tap-target h-14 w-full rounded-sm border-white/20 bg-surface-2/50 px-8 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-smooth hover:border-accent/50 hover:text-accent sm:w-auto"
            >
              <Link to="/event">Event Info</Link>
            </Button>
          </div>

          <CountdownTimer className="animate-slide-up delay-500" />
        </div>

        <div className="mt-12 flex justify-center animate-fade-in delay-500">
          <ScrollCue targetId="experience" />
        </div>
      </div>
    </section>
  );
}
