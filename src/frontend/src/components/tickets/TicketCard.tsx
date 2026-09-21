import { AvailabilityIndicator } from "@/components/tickets/AvailabilityIndicator";
import { QuantitySelector } from "@/components/tickets/QuantitySelector";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Check, Ticket as TicketIcon } from "lucide-react";

export interface TicketCardTier {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  remaining: number;
  soldOut: boolean;
}

interface TicketCardProps {
  tier: TicketCardTier;
  quantity: number;
  maxQuantity: number;
  /** True when this tier is the one currently held in the selection store. */
  selected: boolean;
  onQuantityChange: (quantity: number) => void;
  onBuy: () => void;
  index: number;
}

/**
 * One purchasable tier: identity, price, live stock, quantity stepper and the
 * primary purchase action. Sold-out tiers keep their layout but disable every
 * control and explain why.
 */
export function TicketCard({
  tier,
  quantity,
  maxQuantity,
  selected,
  onQuantityChange,
  onBuy,
  index,
}: TicketCardProps) {
  const soldOut = tier.soldOut || tier.remaining <= 0;
  const availabilityId = `tier-availability-${tier.id}`;
  const maxForTier = Math.max(1, Math.min(maxQuantity, tier.remaining));

  return (
    <article
      data-ocid={`tickets.card.${index}`}
      aria-labelledby={`tier-name-${tier.id}`}
      className={cn(
        "glass-panel relative flex flex-col overflow-hidden rounded-sm p-6 transition-smooth md:p-7",
        soldOut && "opacity-70",
        selected && !soldOut
          ? "border-accent/40 shadow-edge-cyan"
          : "hover:border-white/20 hover:shadow-night-md",
      )}
    >
      {selected && !soldOut ? (
        <span
          data-ocid={`tickets.selected_badge.${index}`}
          className="absolute right-0 top-0 inline-flex items-center gap-1.5 rounded-bl-sm border-b border-l border-accent/40 bg-accent/15 px-3 py-1.5 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-accent"
        >
          <Check className="size-3" />
          Selected
        </span>
      ) : null}

      <header className="pr-20">
        <h3
          id={`tier-name-${tier.id}`}
          className="font-display text-2xl font-bold tracking-[0.06em] text-foreground"
        >
          {tier.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {tier.description}
        </p>
      </header>

      <p className="mt-5 flex items-baseline gap-2">
        <span className="font-display text-3xl font-bold text-foreground">
          {formatIDR(tier.price)}
        </span>
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground">
          / ticket
        </span>
      </p>

      <AvailabilityIndicator
        id={availabilityId}
        remaining={tier.remaining}
        capacity={tier.capacity}
        className="mt-5"
      />

      <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <QuantitySelector
          value={soldOut ? 1 : quantity}
          onChange={onQuantityChange}
          max={maxForTier}
          disabled={soldOut}
          label={tier.name}
        />

        <Button
          type="button"
          data-ocid={`tickets.buy_button.${index}`}
          disabled={soldOut}
          onClick={onBuy}
          className={cn(
            "tap-target h-12 w-full rounded-sm border px-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] transition-smooth sm:w-auto",
            soldOut
              ? "border-white/10 bg-surface-3 text-muted-foreground"
              : "border-accent/40 bg-gradient-cta text-primary-foreground shadow-edge-blue hover:-translate-y-px hover:shadow-edge-cyan",
          )}
        >
          {soldOut ? (
            "Sold Out"
          ) : (
            <>
              <TicketIcon />
              Buy Ticket
            </>
          )}
        </Button>
      </div>

      {soldOut ? (
        <p
          data-ocid={`tickets.sold_out_note.${index}`}
          className="mt-3 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground"
        >
          This tier has sold out. Choose another tier to continue.
        </p>
      ) : null}
    </article>
  );
}
