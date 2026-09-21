import { createActor } from "@/backend";
import { ETicketCard } from "@/components/ticket/ETicketCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EVENT } from "@/lib/event";
import { decodeTokens, readPersistedTicketTokens } from "@/lib/ticketTokens";
import { cn } from "@/lib/utils";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Download, Wallet } from "lucide-react";
import { toast } from "sonner";

const PRIMARY_CTA =
  "tap-target h-14 w-full rounded-sm border border-accent/40 bg-gradient-cta px-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-edge-blue transition-smooth hover:-translate-y-px hover:shadow-edge-cyan";

const SECONDARY_CTA =
  "tap-target h-14 w-full rounded-sm border border-white/15 bg-surface-2/70 px-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-smooth hover:border-accent/40 hover:text-accent";

/**
 * E-ticket page.
 *
 * QR payload policy: the QR encodes ONLY the ticket's secure token. The token
 * is issued by the backend at payment confirmation and threaded here through
 * the `?token=` search param (and the session store, so a refresh keeps
 * working). When no token is available the page shows an explicit error state
 * rather than rendering a QR that would fail at the venue — the ticket id is
 * never used as a substitute.
 */
export function TicketPage() {
  // Read the order number and secure token straight off the URL. The route's
  // `validateSearch` is owned by the router shell, so this stays untyped here.
  const { orderNumber, tokenParam } = useRouterState({
    select: (state) => {
      const search = state.location.search as Record<string, unknown>;
      return {
        orderNumber: typeof search.order === "string" ? search.order : "",
        tokenParam: typeof search.token === "string" ? search.token : "",
      };
    },
  });
  const { actor, isFetching } = useActor(createActor);

  const orderQuery = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: async () => {
      if (!actor || !orderNumber) return null;
      return actor.getOrder(orderNumber);
    },
    enabled: !!actor && !isFetching && !!orderNumber,
  });

  const order = orderQuery.data ?? null;
  const tickets = order?.tickets ?? [];
  const customerName = order?.customer.fullName ?? "Guest";

  // The URL token is authoritative for the ticket being viewed; the session
  // store covers a refresh or a direct revisit.
  const persistedTokens = readPersistedTicketTokens(orderNumber);
  const urlTokens = decodeTokens(tokenParam);
  const tokenFor = (ticketId: string): string =>
    urlTokens[ticketId] ?? persistedTokens[ticketId] ?? "";

  const missingToken =
    tickets.length > 0 && tickets.some((t) => !tokenFor(t.ticketId));

  const handleDownload = () => {
    toast("Save your ticket", {
      description:
        "Use your device's share or save action to keep a copy of this pass.",
    });
  };

  const handleWallet = () => {
    toast("Wallet passes coming soon", {
      description:
        "Apple Wallet and Google Wallet support is not available yet. Your QR pass works at the door.",
    });
  };

  return (
    <section
      data-ocid="ticket.page"
      className="mx-auto w-full max-w-xl px-5 pb-24 pt-10 md:px-8 md:pt-16"
    >
      <Link
        to="/success"
        search={{ order: orderNumber }}
        data-ocid="ticket.link"
        className="inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted-foreground transition-smooth hover:text-accent"
      >
        <ArrowLeft className="size-3.5" />
        Back to order
      </Link>

      <header className="mt-6">
        <p className="label-eyebrow">Your e-ticket</p>
        <h1 className="font-display-xl mt-3 text-foreground">{EVENT.artist}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {EVENT.dateLabel} · {EVENT.timeLabel} · {EVENT.venue}, {EVENT.city}
        </p>
      </header>

      <div className="mt-8 space-y-6">
        {orderQuery.isLoading ? (
          <div data-ocid="ticket.loading_state" className="space-y-4">
            <Skeleton className="h-72 w-full rounded-sm bg-surface-3" />
            <Skeleton className="h-40 w-full rounded-sm bg-surface-3" />
          </div>
        ) : tickets.length === 0 ? (
          <div
            data-ocid="ticket.empty_state"
            className="glass-panel rounded-sm p-8 text-center"
          >
            <p className="font-display text-xl font-bold text-foreground">
              No ticket found
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              We could not load a ticket for this order. Head back to the
              success screen to try again.
            </p>
            <Button asChild className={cn(PRIMARY_CTA, "mt-6")}>
              <Link to="/success" search={{ order: orderNumber }}>
                Back to order
              </Link>
            </Button>
          </div>
        ) : missingToken ? (
          <div
            data-ocid="ticket.token_error_state"
            role="alert"
            className="glass-panel rounded-sm p-8 text-center"
          >
            <AlertCircle className="mx-auto size-6 text-warning" />
            <p className="mt-4 font-display text-xl font-bold text-foreground">
              Ticket code could not be loaded
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              We could not load the secure code for this ticket, so the QR is
              not shown. Reopen your e-ticket from the payment success screen to
              try again.
            </p>
            <Button asChild className={cn(PRIMARY_CTA, "mt-6")}>
              <Link to="/success" search={{ order: orderNumber }}>
                Back to order
              </Link>
            </Button>
          </div>
        ) : (
          tickets.map((ticket, index) => (
            <ETicketCard
              key={ticket.ticketId}
              orderNumber={order?.orderNumber ?? orderNumber}
              customerName={customerName}
              tierName={ticket.ticketType.toUpperCase()}
              ticketId={ticket.ticketId}
              qrToken={tokenFor(ticket.ticketId)}
              index={index + 1}
              total={tickets.length}
            />
          ))
        )}
      </div>

      {tickets.length > 0 && !missingToken ? (
        <div className="mt-8 flex flex-col gap-3">
          <Button
            type="button"
            onClick={handleDownload}
            data-ocid="ticket.primary_button"
            className={cn(PRIMARY_CTA)}
          >
            <Download />
            Download Ticket
          </Button>
          <Button
            type="button"
            onClick={handleWallet}
            data-ocid="ticket.secondary_button"
            className={cn(SECONDARY_CTA)}
          >
            <Wallet />
            Add to Wallet
          </Button>
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            Wallet passes are not available yet — this button is a placeholder.
            Your QR code is all you need at the door.
          </p>
        </div>
      ) : null}
    </section>
  );
}
