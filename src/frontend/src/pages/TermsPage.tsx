import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EVENT } from "@/lib/event";
import { Link } from "@tanstack/react-router";

/**
 * Terms & Conditions.
 * Every clause is intentionally placeholder copy — no legal rules are invented.
 * Organizer-specific details are marked as placeholders for the organizer to
 * replace before the event goes on sale.
 */
const SECTIONS = [
  {
    id: "ticket-policy",
    title: "Ticket policy",
    body: [
      "Placeholder — the organizer will publish the full ticket policy here, including how tickets are issued, transferred, and presented at the door.",
      "Placeholder — details on duplicate or lost tickets, and whether re-entry is permitted, will be confirmed by the organizer.",
    ],
  },
  {
    id: "refund-policy",
    title: "Refund policy",
    body: [
      "Placeholder — the organizer will state the refund and exchange conditions here, including any applicable cut-off dates.",
      "Placeholder — the process for requesting a refund and the expected processing time will be added by the organizer.",
    ],
  },
  {
    id: "entry-requirements",
    title: "Entry requirements",
    body: [
      "Placeholder — the organizer will list the identification and documentation required for entry.",
      "Placeholder — any venue-specific entry conditions, such as bag checks or accessibility arrangements, will be confirmed here.",
    ],
  },
  {
    id: "age-restrictions",
    title: "Age restrictions",
    body: [
      "Placeholder — the organizer will confirm the minimum age for entry and whether minors may attend with a guardian.",
      "Placeholder — any age-verification requirements at the door will be described here.",
    ],
  },
  {
    id: "venue-rules",
    title: "Venue rules",
    body: [
      "Placeholder — the organizer and venue will publish the rules of conduct for the event here.",
      "Placeholder — details on permitted items, smoking areas, and venue opening times will be added.",
    ],
  },
  {
    id: "prohibited-items",
    title: "Prohibited items",
    body: [
      "Placeholder — the organizer will list items that may not be brought into the venue.",
      "Placeholder — the handling of confiscated items and the venue's security screening process will be described here.",
    ],
  },
  {
    id: "cancellation-policy",
    title: "Event cancellation policy",
    body: [
      "Placeholder — the organizer will explain what happens if the event is postponed, relocated, or cancelled.",
      "Placeholder — the remedy available to ticket holders in each of those cases will be confirmed by the organizer.",
    ],
  },
] as const;

export function TermsPage() {
  return (
    <section
      data-ocid="terms.page"
      className="mx-auto w-full max-w-3xl px-5 pb-24 pt-16 md:px-8 md:pt-24"
    >
      <header>
        <p className="label-eyebrow">Legal</p>
        <h1 className="font-display-xl mt-4 text-foreground">
          Terms &amp; Conditions
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          These terms apply to {EVENT.name} at {EVENT.venue}, {EVENT.city} on{" "}
          {EVENT.dateLabel}. The text below is placeholder copy — the organizer
          will publish the final terms before tickets go on sale.
        </p>
      </header>

      <div className="rule-hairline my-8" />

      <Accordion
        type="multiple"
        data-ocid="terms.list"
        className="glass-panel rounded-sm px-6 md:px-7"
      >
        {SECTIONS.map((section, index) => (
          <AccordionItem
            key={section.id}
            value={section.id}
            data-ocid={`terms.item.${index + 1}`}
            className="border-white/10"
          >
            <AccordionTrigger className="tap-target gap-4 py-5 font-display text-base font-semibold tracking-tight text-foreground hover:no-underline data-[state=open]:text-accent">
              {section.title}
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              <div className="space-y-3">
                {section.body.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm leading-relaxed text-muted-foreground"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Questions about these terms? Contact {EVENT.organizer}.
        </p>
        <Link
          to="/tickets"
          data-ocid="terms.link"
          className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-accent transition-smooth hover:text-foreground"
        >
          Back to tickets
        </Link>
      </div>
    </section>
  );
}
