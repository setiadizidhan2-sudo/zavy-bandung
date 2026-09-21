import { Button } from "@/components/ui/button";
import { EVENT } from "@/lib/event";
import { MapPin, Navigation } from "lucide-react";

const MAP_IMAGE = "/assets/generated/map-bandung.dim_1200x675.jpg";

const MAPS_QUERY = encodeURIComponent(
  `${EVENT.venue}, ${EVENT.city}, Indonesia`,
);
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;

/**
 * Google-Maps-style location card: static map preview plus an
 * open-in-maps action that hands off to the real map app.
 */
export function LocationCard() {
  return (
    <section
      data-ocid="location.section"
      className="border-t border-white/5 bg-surface-2"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <p className="label-eyebrow">Getting There</p>
        <h2 className="font-display-xl mt-4 text-foreground">{EVENT.venue}</h2>

        <div className="glass-panel mt-8 overflow-hidden rounded-sm">
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <img
              src={MAP_IMAGE}
              alt={`Stylised night map showing the location of ${EVENT.venue} in ${EVENT.city}`}
              width={1200}
              height={675}
              loading="lazy"
              decoding="async"
              className="size-full object-cover transition-smooth hover:scale-[1.03]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"
            />
            <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-accent/30 bg-surface-0/80 px-3 py-1.5 backdrop-blur-md">
              <MapPin aria-hidden="true" className="size-3.5 text-accent" />
              <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-foreground">
                {EVENT.city}, Indonesia
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/10 p-5 md:flex-row md:items-center md:justify-between md:p-6">
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold text-foreground">
                {EVENT.venue}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Rooftop level — take the main lift to the top floor. Doors{" "}
                {EVENT.doorsLabel.replace("Doors ", "")}.
              </p>
            </div>
            <Button
              asChild
              data-ocid="location.open_maps_button"
              className="tap-target h-12 shrink-0 rounded-sm border border-accent/40 bg-gradient-cta px-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-edge-blue transition-smooth hover:-translate-y-px hover:shadow-edge-cyan"
            >
              <a href={MAPS_URL} target="_blank" rel="noreferrer">
                <Navigation />
                Open in Maps
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
