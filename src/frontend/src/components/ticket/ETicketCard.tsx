import { QrCode } from "@/components/ticket/QrCode";
import { EVENT } from "@/lib/event";
import { cn } from "@/lib/utils";
import { CalendarDays, Clock, MapPin, User } from "lucide-react";

export interface ETicketCardProps {
  /** Human-readable order reference, e.g. `ZAVY-4F2A91`. */
  orderNumber: string;
  /** Ticket holder name as entered at checkout. */
  customerName: string;
  /** Tier label, e.g. `VIP`. */
  tierName: string;
  /** Per-ticket identifier shown under the QR. */
  ticketId: string;
  /**
   * Secure token encoded into the QR. This is the ONLY payload the QR carries.
   * Never pass personal information here.
   */
  qrToken: string;
  /** 1-based position of this ticket within the order. */
  index?: number;
  /** Total tickets in the order, used for the "1 of 2" label. */
  total?: number;
  className?: string;
}

function Field({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="label-eyebrow flex items-center gap-1.5">
        <span aria-hidden="true" className="text-accent">
          {icon}
        </span>
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 truncate text-sm font-semibold text-foreground",
          mono && "font-mono tracking-[0.08em]",
        )}
      >
        {value}
      </p>
    </div>
  );
}

/**
 * Premium digital concert pass.
 * Full-bleed glass ticket with a perforated stub, glow edge, and the QR
 * payload rendered from the secure token only.
 */
export function ETicketCard({
  orderNumber,
  customerName,
  tierName,
  ticketId,
  qrToken,
  index,
  total,
  className,
}: ETicketCardProps) {
  const seatLabel =
    index !== undefined && total !== undefined
      ? `Ticket ${index} of ${total}`
      : "Admit one";

  return (
    <article
      data-ocid="ticket.card"
      className={cn(
        "glass-panel relative overflow-hidden rounded-sm shadow-glass",
        className,
      )}
    >
      {/* Stage light wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-stage"
      />

      {/* ---- Header band ---- */}
      <header className="relative border-b border-dashed border-white/15 px-6 pb-6 pt-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="label-eyebrow">Digital pass</p>
            <h2 className="font-display mt-2 text-4xl font-bold leading-none tracking-[0.16em] text-foreground">
              {EVENT.artist}
            </h2>
            <p className="mt-2 text-sm font-medium text-accent">{EVENT.name}</p>
          </div>
          <span className="shrink-0 rounded-sm border border-accent/40 bg-accent/10 px-3 py-1.5 font-mono text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-accent">
            {tierName}
          </span>
        </div>
      </header>

      {/* ---- Details ---- */}
      <div className="relative grid grid-cols-2 gap-x-4 gap-y-5 px-6 py-6">
        <Field
          icon={<CalendarDays className="size-3.5" />}
          label="Date"
          value={EVENT.dateLabel}
        />
        <Field
          icon={<Clock className="size-3.5" />}
          label="Doors"
          value={EVENT.timeLabel}
        />
        <Field
          icon={<MapPin className="size-3.5" />}
          label="Venue"
          value={`${EVENT.venue}, ${EVENT.city}`}
        />
        <Field
          icon={<User className="size-3.5" />}
          label="Ticket holder"
          value={customerName}
        />
      </div>

      {/* ---- Perforation ---- */}
      <div className="relative flex items-center gap-3 px-6">
        <span
          aria-hidden="true"
          className="absolute -left-3 size-6 rounded-full bg-background"
        />
        <span className="rule-hairline flex-1" />
        <span
          aria-hidden="true"
          className="absolute -right-3 size-6 rounded-full bg-background"
        />
      </div>

      {/* ---- QR stub ---- */}
      <div className="relative flex flex-col items-center px-6 pb-7 pt-6">
        <p className="label-eyebrow">{seatLabel}</p>
        <div className="mt-4">
          <QrCode value={qrToken} />
        </div>
        <p className="mt-4 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground">
          Ticket ID
        </p>
        <p
          data-ocid="ticket.id"
          className="mt-1 break-all text-center font-mono text-sm font-semibold tracking-[0.1em] text-foreground"
        >
          {ticketId}
        </p>
        <p className="mt-4 max-w-xs text-center text-xs leading-relaxed text-muted-foreground">
          Present this code at the door. Screenshots are accepted.
        </p>
      </div>

      {/* ---- Footer strip ---- */}
      <footer className="relative flex items-center justify-between gap-3 border-t border-white/10 bg-surface-0/60 px-6 py-3.5">
        <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted-foreground">
          Order
        </span>
        <span
          data-ocid="ticket.order_number"
          className="truncate font-mono text-[0.6875rem] font-semibold tracking-[0.1em] text-foreground"
        >
          {orderNumber}
        </span>
      </footer>
    </article>
  );
}
