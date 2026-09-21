import { EVENT } from "@/lib/event";
import { Building2, CalendarDays, Clock, MapPin } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface InfoCard {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}

const INFO_CARDS: InfoCard[] = [
  {
    label: "Date",
    value: EVENT.dateLabel,
    detail: "Wednesday night",
    icon: CalendarDays,
  },
  {
    label: "Time",
    value: EVENT.timeLabel,
    detail: EVENT.doorsLabel,
    icon: Clock,
  },
  {
    label: "Venue",
    value: EVENT.venue,
    detail: "Rooftop open-air stage",
    icon: Building2,
  },
  {
    label: "Location",
    value: EVENT.city,
    detail: "West Java, Indonesia",
    icon: MapPin,
  },
];

/**
 * THE EXPERIENCE — the concert description plus the four key facts.
 * Shared by the home page and the dedicated event information page.
 */
export function ExperienceSection() {
  return (
    <section
      id="experience"
      data-ocid="experience.section"
      className="scroll-mt-20 border-t border-white/5 bg-surface-1"
    >
      <div className="mx-auto w-full max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <p className="label-eyebrow">The Experience</p>
        <h2 className="font-display-xl mt-4 max-w-3xl text-foreground">
          One rooftop. One night. Lights down at seven.
        </h2>

        <div className="mt-8 grid gap-10 md:grid-cols-[1.15fr_1fr] md:gap-16">
          <div className="space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            <p>
              {EVENT.artist} brings a full live production to the rooftop of{" "}
              {EVENT.venue} — a single headline set built for the open air,
              framed by a wall of electric blue light and a skyline that never
              quite goes dark.
            </p>
            <p>
              Doors open at 18:00 WIB. The headline set starts at 19:00 WIB and
              runs without a support break, so arrive early, take the lift to
              the top, and stay for the whole thing. {EVENT.tagline}
            </p>
          </div>

          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {INFO_CARDS.map((card) => (
              <div
                key={card.label}
                data-ocid={`experience.card.${card.label.toLowerCase()}`}
                className="glass-panel rounded-sm p-5 transition-smooth hover:-translate-y-px hover:shadow-edge-blue"
              >
                <card.icon aria-hidden="true" className="size-5 text-accent" />
                <dt className="label-eyebrow mt-4">{card.label}</dt>
                <dd className="mt-2 font-display text-lg font-semibold leading-tight text-foreground">
                  {card.value}
                </dd>
                <dd className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {card.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
