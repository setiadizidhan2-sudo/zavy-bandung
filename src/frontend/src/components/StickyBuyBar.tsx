import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/format";
import {
  getTier,
  selectionSubtotal,
  useSelectionStore,
} from "@/store/selection";
import { Link, useRouterState } from "@tanstack/react-router";
import { Ticket } from "lucide-react";

/** Routes where the purchase CTA would compete with the page's own action. */
const HIDDEN_ROUTES = ["/checkout", "/payment", "/success", "/ticket"];

/**
 * Persistent purchase affordance.
 * Desktop: floating pill anchored bottom-right.
 * Mobile: full-width sticky bar showing the live selection.
 */
export function StickyBuyBar() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const tierId = useSelectionStore((state) => state.tierId);
  const quantity = useSelectionStore((state) => state.quantity);

  if (HIDDEN_ROUTES.some((route) => pathname.startsWith(route))) return null;

  const tier = getTier(tierId);
  const subtotal = selectionSubtotal(tierId, quantity);

  return (
    <>
      {/* Desktop floating CTA */}
      <div className="pointer-events-none fixed bottom-8 right-8 z-40 hidden md:block">
        <Button
          asChild
          data-ocid="sticky.primary_button"
          className="tap-target pointer-events-auto h-14 rounded-sm border border-accent/40 bg-gradient-cta px-8 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-edge-blue transition-smooth hover:-translate-y-px hover:shadow-edge-cyan"
        >
          <Link to="/checkout">
            <Ticket />
            Buy Ticket
          </Link>
        </Button>
      </div>

      {/* Mobile sticky purchase bar */}
      <div
        data-ocid="sticky.panel"
        className="glass-panel-strong safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-white/10 px-5 pt-3 md:hidden"
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p
              data-ocid="sticky.selection"
              className="truncate font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-muted-foreground"
            >
              {tier.name} × {quantity}
            </p>
            <p className="font-display text-lg font-bold text-foreground">
              {formatIDR(subtotal)}
            </p>
          </div>
          <Button
            asChild
            data-ocid="sticky.primary_button"
            className="tap-target h-12 shrink-0 rounded-sm border border-accent/40 bg-gradient-cta px-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-edge-blue transition-smooth hover:shadow-edge-cyan"
          >
            <Link to="/checkout">Buy Ticket</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
