import { Separator } from "@/components/ui/separator";
import { EVENT } from "@/lib/event";
import { formatIDR } from "@/lib/format";
import {
  SERVICE_FEE,
  type TicketTier,
  selectionSubtotal,
  selectionTotal,
} from "@/store/selection";
import { Minus, Plus, Ticket } from "lucide-react";

interface OrderSummaryProps {
  tier: TicketTier;
  quantity: number;
  /** Live remaining stock for the selected tier, when known. */
  remaining?: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

function Row({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span
        className={
          emphasis
            ? "font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-foreground"
            : "text-sm text-muted-foreground"
        }
      >
        {label}
      </span>
      <span
        className={
          emphasis
            ? "font-display text-2xl font-bold text-foreground"
            : "font-mono text-sm text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}

/**
 * ORDER SUMMARY — the selected tier × quantity, subtotal, the flat
 * Rp10.000 service fee, and the grand total.
 */
export function OrderSummary({
  tier,
  quantity,
  remaining,
  onIncrement,
  onDecrement,
}: OrderSummaryProps) {
  const subtotal = selectionSubtotal(tier.id, quantity);
  const total = selectionTotal(tier.id, quantity);
  const atStockLimit = remaining !== undefined && quantity >= remaining;

  return (
    <aside
      data-ocid="checkout.order_summary"
      className="glass-panel-strong rounded-sm p-6 md:p-8"
    >
      <p className="label-eyebrow">Order Summary</p>
      <h2 className="font-title mt-2 text-foreground">{EVENT.name}</h2>
      <p className="mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground">
        {EVENT.dateLabel} · {EVENT.timeLabel}
      </p>

      <div className="rule-hairline my-6" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            data-ocid="checkout.tier_name"
            className="font-display text-lg font-bold tracking-[0.08em] text-foreground"
          >
            {tier.name}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {tier.blurb}
          </p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            {formatIDR(tier.price)} each
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-sm border border-white/10 bg-surface-2/70 p-1">
          <button
            type="button"
            data-ocid="checkout.quantity_decrement"
            aria-label={`Decrease ${tier.name} quantity`}
            onClick={onDecrement}
            disabled={quantity <= 1}
            className="tap-target grid size-10 place-items-center rounded-sm text-foreground transition-smooth hover:bg-surface-3 disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <span
            data-ocid="checkout.quantity_value"
            className="min-w-8 text-center font-mono text-sm font-semibold text-foreground"
          >
            {quantity}
          </span>
          <button
            type="button"
            data-ocid="checkout.quantity_increment"
            aria-label={`Increase ${tier.name} quantity`}
            onClick={onIncrement}
            disabled={atStockLimit}
            className="tap-target grid size-10 place-items-center rounded-sm text-foreground transition-smooth hover:bg-surface-3 disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {remaining !== undefined ? (
        <p
          data-ocid="checkout.stock_note"
          className="mt-3 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground"
        >
          {remaining > 0
            ? `${remaining} left in ${tier.name}`
            : `${tier.name} is sold out`}
        </p>
      ) : null}

      <div className="rule-hairline my-6" />

      <div className="space-y-3.5">
        <Row label={`${tier.name} × ${quantity}`} value={formatIDR(subtotal)} />
        <Row label="Service Fee" value={formatIDR(SERVICE_FEE)} />
      </div>

      <Separator className="my-6 bg-white/10" />

      <Row label="Total" value={formatIDR(total)} emphasis />

      <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <Ticket className="mt-px size-3.5 shrink-0 text-accent" />
        Your e-ticket is issued to the details on the left and checked at the
        door.
      </p>
    </aside>
  );
}
