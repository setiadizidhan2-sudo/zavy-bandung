import { createActor } from "@/backend";
import { TicketCard } from "@/components/tickets/TicketCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EVENT } from "@/lib/event";
import { formatIDR } from "@/lib/format";
import {
  MAX_QUANTITY,
  SERVICE_FEE,
  type TicketTierId,
  useSelectionStore,
} from "@/store/selection";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

const SKELETON_IDS = Array.from(
  { length: 3 },
  (_, index) => `tier-skeleton-${index}`,
);

/**
 * CHOOSE YOUR TICKET — the single conversion surface of the site.
 * Live inventory comes from `listTiers`; the chosen tier and quantity are
 * written to the shared selection store before routing to checkout.
 */
export default function TicketsPage() {
  const navigate = useNavigate();
  const { actor, isFetching } = useActor(createActor);

  const tierId = useSelectionStore((state) => state.tierId);
  const setTier = useSelectionStore((state) => state.setTier);
  const setQuantity = useSelectionStore((state) => state.setQuantity);

  /** Per-card stepper values, keyed by tier id. */
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const tiersQuery = useQuery({
    queryKey: ["tiers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTiers();
    },
    enabled: !!actor && !isFetching,
    refetchOnMount: "always",
  });

  const tiers = tiersQuery.data ?? [];

  // Seed each card's stepper once its tier arrives, without clobbering a value
  // the buyer has already changed.
  useEffect(() => {
    if (tiers.length === 0) return;
    setQuantities((current) => {
      const next = { ...current };
      let changed = false;
      for (const tier of tiers) {
        if (next[tier.id] === undefined) {
          next[tier.id] = 1;
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [tiers]);

  const handleBuy = (id: string, qty: number) => {
    setTier(id as TicketTierId);
    setQuantity(qty);
    void navigate({ to: "/checkout" });
  };

  const isLoading = tiersQuery.isPending || (isFetching && tiers.length === 0);
  const hasError = tiersQuery.isError;

  return (
    <section
      data-ocid="tickets.page"
      className="mx-auto w-full max-w-6xl px-5 py-16 md:px-8 md:py-24"
    >
      <header className="max-w-2xl">
        <p className="label-eyebrow">ZAVY — Live in Bandung</p>
        <h1 className="font-display-xl mt-4 text-foreground">
          Choose Your Ticket
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          {EVENT.dateLabel} · {EVENT.timeLabel} · {EVENT.venue}, {EVENT.city}.
          Pick a tier, set your quantity, and lock in your spot. A{" "}
          {formatIDR(SERVICE_FEE)} service fee is added at checkout.
        </p>
      </header>

      <div className="mt-12">
        {isLoading ? (
          <div
            data-ocid="tickets.loading_state"
            className="grid gap-6 md:grid-cols-3"
          >
            {SKELETON_IDS.map((id) => (
              <div
                key={id}
                className="glass-panel space-y-5 rounded-sm p-6 md:p-7"
              >
                <Skeleton className="h-7 w-32 bg-surface-3" />
                <Skeleton className="h-4 w-full bg-surface-3" />
                <Skeleton className="h-4 w-2/3 bg-surface-3" />
                <Skeleton className="h-9 w-40 bg-surface-3" />
                <Skeleton className="h-12 w-full bg-surface-3" />
              </div>
            ))}
          </div>
        ) : hasError ? (
          <div
            data-ocid="tickets.error_state"
            className="glass-panel flex flex-col items-start gap-4 rounded-sm p-8"
          >
            <span className="grid size-11 place-items-center rounded-sm border border-destructive/40 bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                We couldn't load ticket availability
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                The ticket server did not respond. Check your connection and try
                again — your selection is not lost.
              </p>
            </div>
            <Button
              type="button"
              data-ocid="tickets.retry_button"
              onClick={() => void tiersQuery.refetch()}
              className="tap-target h-12 rounded-sm border border-accent/40 bg-gradient-cta px-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-edge-blue transition-smooth hover:shadow-edge-cyan"
            >
              <RefreshCw />
              Try Again
            </Button>
          </div>
        ) : tiers.length === 0 ? (
          <div
            data-ocid="tickets.empty_state"
            className="glass-panel rounded-sm p-8"
          >
            <h2 className="font-display text-xl font-bold text-foreground">
              Tickets are not on sale yet
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              No tiers are published for {EVENT.name}. Check back shortly — the
              on-sale announcement lands here first.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {tiers.map((tier, index) => {
              const remaining = Number(tier.remaining);
              const capacity = Number(tier.capacity);
              const soldOut = tier.soldOut || remaining <= 0;
              const cardQuantity = quantities[tier.id] ?? 1;

              return (
                <TicketCard
                  key={tier.id}
                  index={index + 1}
                  tier={{
                    id: tier.id,
                    name: tier.name,
                    description: tier.description,
                    price: Number(tier.price),
                    capacity,
                    remaining,
                    soldOut,
                  }}
                  quantity={cardQuantity}
                  maxQuantity={MAX_QUANTITY}
                  selected={tierId === tier.id && !soldOut}
                  onQuantityChange={(next) =>
                    setQuantities((current) => ({
                      ...current,
                      [tier.id]: next,
                    }))
                  }
                  onBuy={() => handleBuy(tier.id, cardQuantity)}
                />
              );
            })}
          </div>
        )}
      </div>

      <p className="mt-10 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
        Maximum {MAX_QUANTITY} tickets per order · {formatIDR(SERVICE_FEE)}{" "}
        service fee per order
      </p>
    </section>
  );
}
