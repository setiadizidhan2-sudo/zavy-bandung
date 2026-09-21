import { cn } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";

interface QrCodeProps {
  /**
   * The ONLY value encoded into the QR image.
   * Callers must pass the ticket's secure token — never a name, email,
   * phone number, order number, or any other personal information.
   */
  value: string;
  size?: number;
  className?: string;
}

/**
 * Ticket QR renderer.
 * Encodes `value` verbatim as a single SVG module matrix and reveals itself
 * with the `animate-qr-reveal` entrance (blur + scale, opacity only).
 */
export function QrCode({ value, size = 208, className }: QrCodeProps) {
  return (
    <div
      data-ocid="ticket.qr"
      className={cn(
        "relative grid place-items-center rounded-sm bg-white p-3 shadow-edge-cyan animate-qr-reveal",
        className,
      )}
    >
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        marginSize={0}
        bgColor="#ffffff"
        fgColor="#05070d"
        title="Ticket QR code"
      />
      {/* Corner registration marks — pure decoration, never over the modules */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-sm ring-1 ring-inset ring-black/10"
      />
    </div>
  );
}
