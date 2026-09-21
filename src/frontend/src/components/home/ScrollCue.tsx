import { ChevronDown } from "lucide-react";

/**
 * Scroll affordance that leads from the hero into the event information.
 * Renders as a real anchor so keyboard users can jump straight to the section.
 */
export function ScrollCue({ targetId }: { targetId: string }) {
  return (
    <a
      href={`#${targetId}`}
      data-ocid="hero.scroll_cue"
      className="group inline-flex flex-col items-center gap-2 rounded-sm px-4 py-2 transition-smooth hover:text-accent"
    >
      <span className="label-eyebrow transition-smooth group-hover:text-accent">
        Scroll
      </span>
      <span className="grid size-9 place-items-center rounded-full border border-white/15 bg-surface-2/60 transition-smooth group-hover:border-accent/50 group-hover:shadow-edge-cyan">
        <ChevronDown
          aria-hidden="true"
          className="size-4 animate-drift text-accent"
        />
      </span>
    </a>
  );
}
