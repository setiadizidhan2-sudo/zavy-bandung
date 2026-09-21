import { createActor } from "@/backend";
import { SuccessCheck } from "@/components/ticket/SuccessCheck";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EVENT } from "@/lib/event";
import { formatIDR } from "@/lib/format";
import { decodeTokens, readPersistedTicketTokens } from "@/lib/ticketTokens";
import { cn } from "@/lib/utils";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { Download, Ticket } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";

const PRIMARY_CTA =
  "tap-target h-14 w-full rounded-sm border border-accent/40 bg-gradient-cta px-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-edge-blue transition-smooth hover:-translate-y-px hover:shadow-edge-cyan";

const SECONDARY_CTA =
  "tap-target h-14 w-full rounded-sm border border-white/15 bg-surface-2/70 px-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-smooth hover:border-accent/40 hover:text-accent";

/**
 * Payment success screen.
 * Reads the order number from the `?order=` search param, then re-reads the
 * order from the backend so the summary survives a refresh.
 */
export function SuccessPage() {
  // Read the order number and issued secure tokens straight off the URL. The
  // route's `validateSearch` is owned by the router shell, so this stays
  // untyped here.
  const { orderNumber, tokensParam } = useRouterState({
    select: (state) => {
      const search = state.location.search as Record<string, unknown>;
      return {
        orderNumber: typeof search.order === "string" ? search.order : "",
        tokensParam: typeof search.tokens === "string" ? search.tokens : "",
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
  const line = order?.lines[0];
  const tierLabel = line?.tierName ?? "Ticket";
  const quantity = line ? Number(line.quantity) : 0;

  // Tokens arrive on the URL after payment; the session store keeps them
  // available across a refresh. The first ticket is the one the primary CTA
  // opens, so its token is the one forwarded to the e-ticket route.
  const tokens = {
    ...readPersistedTicketTokens(orderNumber),
    ...decodeTokens(tokensParam),
  };
  const firstTicket = order?.tickets[0];
  const firstTicketToken = firstTicket
    ? (tokens[firstTicket.ticketId] ?? "")
    : "";

  const handleDownload = () => {
    if (!order || !firstTicket) {
      toast("Ticket not ready", {
        description: "We could not load your ticket yet. Please try again.",
      });
      return;
    }
    if (!firstTicketToken) {
      toast("Ticket code unavailable", {
        description:
          "We could not load the secure code for this ticket. Please reopen it from the e-ticket screen.",
      });
      return;
    }

    // Render the pass to an offscreen canvas and export it as a PNG download.
    const canvas = document.createElement("canvas");
    const width = 720;
    const height = 1120;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      toast("Download unavailable", {
        description: "Your browser blocked the download. Try again.",
      });
      return;
    }

    ctx.fillStyle = "#05070d";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 64px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(EVENT.artist, width / 2, 120);

    ctx.fillStyle = "#22d3ee";
    ctx.font = "600 26px sans-serif";
    ctx.fillText(EVENT.name, width / 2, 168);

    ctx.fillStyle = "#ffffff";
    ctx.font = "500 24px sans-serif";
    ctx.fillText(`${EVENT.dateLabel} · ${EVENT.timeLabel}`, width / 2, 230);
    ctx.fillText(`${EVENT.venue}, ${EVENT.city}`, width / 2, 268);

    ctx.font = "600 28px sans-serif";
    ctx.fillText(`${tierLabel} × ${quantity}`, width / 2, 330);

    // Draw the QR from the secure token only, using an offscreen QRCodeCanvas
    // so the download never depends on what happens to be mounted on screen.
    const qrSize = 420;
    const qrHost = document.createElement("div");
    qrHost.style.position = "fixed";
    qrHost.style.left = "-10000px";
    qrHost.style.top = "0";
    document.body.appendChild(qrHost);
    const root = createRoot(qrHost);
    root.render(
      <QRCodeCanvas
        value={firstTicketToken}
        size={qrSize}
        level="M"
        marginSize={0}
        bgColor="#ffffff"
        fgColor="#05070d"
      />,
    );

    // Give React a frame to paint the QR canvas before compositing it.
    window.requestAnimationFrame(() => {
      const qrCanvas = qrHost.querySelector("canvas");
      if (qrCanvas) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect((width - qrSize) / 2 - 16, 400, qrSize + 32, qrSize + 32);
        ctx.drawImage(qrCanvas, (width - qrSize) / 2, 416, qrSize, qrSize);
      }
      root.unmount();
      qrHost.remove();
      finishDownload(ctx, canvas, width, height, order.orderNumber);
    });
  };

  const finishDownload = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    orderNumberValue: string,
  ) => {
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 22px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`ORDER ${orderNumberValue}`, width / 2, height - 90);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "400 18px sans-serif";
    ctx.fillText("Present this code at the door.", width / 2, height - 50);

    canvas.toBlob((blob) => {
      if (!blob) {
        toast("Download unavailable", {
          description: "Your browser blocked the download. Try again.",
        });
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `zavy-ticket-${orderNumberValue}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast("Ticket downloaded", {
        description: "Your e-ticket image has been saved.",
      });
    }, "image/png");
  };

  return (
    <section
      data-ocid="success.page"
      className="mx-auto w-full max-w-2xl px-5 pb-24 pt-16 md:px-8 md:pt-24"
    >
      <div className="flex flex-col items-center text-center">
        <SuccessCheck />
        <h1 className="font-display-xl mt-8 text-foreground">
          PAYMENT SUCCESSFUL
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Your ticket is ready.
        </p>
      </div>

      {/* ---- Order summary ---- */}
      <div
        data-ocid="success.panel"
        className="glass-panel mt-10 rounded-sm p-6 md:p-7"
      >
        <p className="label-eyebrow">Order summary</p>

        {orderQuery.isLoading ? (
          <div data-ocid="success.loading_state" className="mt-5 space-y-4">
            {Array.from({ length: 4 }, (_, i) => `success-skeleton-${i}`).map(
              (id) => (
                <Skeleton key={id} className="h-5 w-full bg-surface-3" />
              ),
            )}
          </div>
        ) : (
          <dl className="mt-5 space-y-4">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="label-eyebrow">Order</dt>
              <dd
                data-ocid="success.order_number"
                className="truncate font-mono text-sm font-semibold tracking-[0.1em] text-foreground"
              >
                {orderNumber || "—"}
              </dd>
            </div>

            <div className="rule-hairline" />

            <div className="flex items-baseline justify-between gap-4">
              <dt className="label-eyebrow">Event</dt>
              <dd className="text-right text-sm font-semibold text-foreground">
                {EVENT.name}
              </dd>
            </div>

            <div className="flex items-baseline justify-between gap-4">
              <dt className="label-eyebrow">Date</dt>
              <dd className="text-right text-sm font-semibold text-foreground">
                {EVENT.dateLabel}
              </dd>
            </div>

            <div className="rule-hairline" />

            <div className="flex items-baseline justify-between gap-4">
              <dt className="label-eyebrow">Selection</dt>
              <dd
                data-ocid="success.selection"
                className="text-right text-sm font-semibold text-foreground"
              >
                {quantity > 0 ? `${tierLabel} × ${quantity}` : "—"}
              </dd>
            </div>

            <div className="flex items-baseline justify-between gap-4">
              <dt className="label-eyebrow">Total</dt>
              <dd
                data-ocid="success.total"
                className="font-display text-2xl font-bold text-foreground"
              >
                {order ? formatIDR(order.total) : "—"}
              </dd>
            </div>
          </dl>
        )}
      </div>

      {/* ---- Actions ---- */}
      <div className="mt-8 flex flex-col gap-3">
        <Button asChild className={cn(PRIMARY_CTA)}>
          <Link
            to="/ticket"
            search={{
              order: orderNumber,
              token: firstTicketToken || undefined,
            }}
            data-ocid="success.primary_button"
          >
            <Ticket />
            View E-Ticket
          </Link>
        </Button>
        <Button
          type="button"
          onClick={handleDownload}
          data-ocid="success.secondary_button"
          className={cn(SECONDARY_CTA)}
        >
          <Download />
          Download Ticket
        </Button>
      </div>

      <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
        A copy of this order stays available on this device. Keep your order
        number handy for entry.
      </p>
    </section>
  );
}
