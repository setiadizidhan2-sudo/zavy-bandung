import { createActor } from "@/backend";
import type { ConfirmPaymentError } from "@/backend";
import {
  PAYMENT_METHODS,
  PaymentMethodList,
} from "@/components/payment/PaymentMethodList";
import { Button } from "@/components/ui/button";
import { EVENT } from "@/lib/event";
import { formatIDR } from "@/lib/format";
import {
  collectTicketTokens,
  encodeTokens,
  persistTicketTokens,
} from "@/lib/ticketTokens";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Clock, Info, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { type StoredOrder, readStoredOrder } from "./CheckoutPage";

/**
 * ============================================================================
 * MIDTRANS INTEGRATION POINT — the single place to switch on live payments.
 * ============================================================================
 * Today this page confirms the order through `confirmDemoPayment`, which marks
 * the order paid and issues tickets without contacting any gateway. That is a
 * DEMO confirmation and is labelled as such in the UI.
 *
 * To go live, supply a Midtrans Server Key and replace ONLY the `confirmPayment`
 * mutation body below with:
 *   1. Snap transaction creation — POST https://app.midtrans.com/snap/v1/transactions
 *      with the order number, gross amount, and the selected channel, then hand
 *      the returned `redirect_url` / `token` to the buyer.
 *   2. Transaction-status confirmation — poll
 *      GET https://api.midtrans.com/v2/{order_id}/status, or accept the
 *      `transaction_status` webhook, and only then call the backend to mark the
 *      order paid.
 * The Server Key must live in the backend canister, never in this bundle.
 * No live gateway call or webhook handler is built here.
 * ============================================================================
 */
function useConfirmPayment() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (orderNumber: string) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.confirmDemoPayment(orderNumber);
      if (result.__kind__ === "err")
        throw new Error(describeConfirmError(result.err));
      return result.ok;
    },
  });
}

function describeConfirmError(error: ConfirmPaymentError): string {
  switch (error.__kind__) {
    case "alreadyPaid":
      return "This order is already paid. Your e-ticket is ready.";
    case "orderExpired":
      return "The payment window for this order has closed. Please start a new order.";
    case "unknownOrder":
      return "We could not find that order. Please start a new order.";
    default:
      return "We could not confirm this payment. Please try again.";
  }
}

function formatDeadline(deadline: string | undefined): string {
  if (!deadline) return "—";
  const date = new Date(Number(BigInt(deadline) / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-sm text-foreground">{value}</span>
    </div>
  );
}

export function PaymentPage() {
  const navigate = useNavigate();
  const [order, setOrder] = useState<StoredOrder | null>(null);
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0].id);

  useEffect(() => {
    setOrder(readStoredOrder());
  }, []);

  const confirmPayment = useConfirmPayment();

  const handlePayNow = () => {
    if (!order) return;
    confirmPayment.mutate(order.orderNumber, {
      onSuccess: (result) => {
        // The backend issues each ticket with a secure token. Persist the
        // ticketId → token map and forward it to the success screen so the
        // e-ticket QR can encode the real token instead of the ticket id.
        const tokens = collectTicketTokens(result.tickets);
        persistTicketTokens(result.orderNumber, tokens);
        void navigate({
          to: "/success",
          search: {
            order: result.orderNumber,
            tokens: encodeTokens(tokens) || undefined,
          },
        });
      },
    });
  };

  if (!order) {
    return (
      <div
        data-ocid="payment.empty_state"
        className="mx-auto w-full max-w-2xl px-5 py-24 text-center md:px-8"
      >
        <p className="label-eyebrow">Payment</p>
        <h1 className="font-display-xl mt-3 text-foreground">
          No order in progress
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          Start by choosing your tickets — your order details appear here once
          checkout is complete.
        </p>
        <Button
          asChild
          data-ocid="payment.primary_button"
          className="tap-target mt-8 h-14 rounded-sm border border-accent/40 bg-gradient-cta px-8 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-edge-blue transition-smooth hover:shadow-edge-cyan"
        >
          <Link to="/tickets">Choose Tickets</Link>
        </Button>
      </div>
    );
  }

  const methodName =
    PAYMENT_METHODS.find((method) => method.id === selectedMethod)?.name ?? "";

  return (
    <div
      data-ocid="payment.page"
      className="mx-auto w-full max-w-5xl px-5 py-14 md:px-8 md:py-20"
    >
      <Link
        to="/checkout"
        data-ocid="payment.back_link"
        className="inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground transition-smooth hover:text-accent"
      >
        <ArrowLeft className="size-3.5" />
        Back to checkout
      </Link>

      <header className="mt-8 animate-slide-up">
        <p className="label-eyebrow">Final Step</p>
        <h1 className="font-display-xl mt-3 text-foreground">
          Select Payment Method
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {EVENT.name} — {order.tierName} × {order.quantity}. Complete the
          payment before the deadline to lock in your tickets.
        </p>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="animate-slide-up delay-100">
          <PaymentMethodList
            selectedId={selectedMethod}
            onSelect={setSelectedMethod}
          />
        </div>

        <aside className="glass-panel-strong animate-slide-up rounded-sm p-6 delay-200 md:p-8 lg:sticky lg:top-24">
          <p className="label-eyebrow">Order Details</p>

          <div className="mt-6 space-y-4">
            <DetailRow label="Order Number" value={order.orderNumber} />
            <DetailRow
              label="Total Payment"
              value={formatIDR(BigInt(order.total))}
            />
            <DetailRow
              label="Payment Deadline"
              value={formatDeadline(order.paymentDeadline)}
            />
          </div>

          <div className="rule-hairline my-6" />

          <div className="space-y-3.5">
            <DetailRow
              label="Subtotal"
              value={formatIDR(BigInt(order.subtotal))}
            />
            <DetailRow
              label="Service Fee"
              value={formatIDR(BigInt(order.serviceFee))}
            />
          </div>

          <div className="rule-hairline my-6" />

          <div className="flex items-baseline justify-between gap-4">
            <span className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-foreground">
              Total
            </span>
            <span className="font-display text-2xl font-bold text-foreground">
              {formatIDR(BigInt(order.total))}
            </span>
          </div>

          <div
            data-ocid="payment.demo_notice"
            className="mt-6 flex items-start gap-3 rounded-sm border border-warning/40 bg-warning/10 p-4"
          >
            <Info className="mt-0.5 size-4 shrink-0 text-warning" />
            <p className="text-xs leading-relaxed text-warning">
              <span className="font-semibold uppercase tracking-[0.12em]">
                Demo confirmation.
              </span>{" "}
              No live payment gateway is charged and no real payment is taken.
              Paying now simply marks this order as paid so you can preview the
              e-ticket flow.
            </p>
          </div>

          {confirmPayment.isError ? (
            <div
              data-ocid="payment.error_state"
              role="alert"
              className="mt-4 flex items-start gap-3 rounded-sm border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{(confirmPayment.error as Error).message}</span>
            </div>
          ) : null}

          <Button
            type="button"
            data-ocid="payment.pay_button"
            onClick={handlePayNow}
            disabled={confirmPayment.isPending}
            className="tap-target mt-4 h-14 w-full rounded-sm border border-accent/40 bg-gradient-cta font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-edge-blue transition-smooth hover:shadow-edge-cyan disabled:border-white/10 disabled:bg-none disabled:bg-surface-2 disabled:text-muted-foreground disabled:shadow-none"
          >
            {confirmPayment.isPending
              ? "Confirming…"
              : `Pay Now with ${methodName}`}
          </Button>

          <p className="mt-3 flex items-center justify-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
            <Clock className="size-3" />
            Demo mode — no charge is made
          </p>
          <p className="mt-2 flex items-center justify-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
            <ShieldCheck className="size-3" />
            Secure checkout
          </p>
        </aside>
      </div>
    </div>
  );
}
