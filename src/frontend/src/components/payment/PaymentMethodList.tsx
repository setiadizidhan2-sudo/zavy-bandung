import { cn } from "@/lib/utils";
import { Banknote, CreditCard, QrCode, Smartphone, Wallet } from "lucide-react";
import type { ComponentType } from "react";

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

/**
 * The six selectable payment channels. Selection is local UI state only —
 * no gateway is contacted until the Midtrans integration point is switched on.
 */
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "qris",
    name: "QRIS",
    description: "Scan one QR from any Indonesian banking or e-wallet app.",
    icon: QrCode,
  },
  {
    id: "gopay",
    name: "GoPay",
    description: "Pay from your GoPay balance inside the Gojek app.",
    icon: Wallet,
  },
  {
    id: "dana",
    name: "DANA",
    description: "Confirm the payment request in your DANA app.",
    icon: Smartphone,
  },
  {
    id: "ovo",
    name: "OVO",
    description: "Pay with your OVO cash balance in a single tap.",
    icon: Smartphone,
  },
  {
    id: "va",
    name: "Virtual Account",
    description: "Transfer from any bank to a dedicated account number.",
    icon: Banknote,
  },
  {
    id: "card",
    name: "Credit / Debit Card",
    description: "Visa, Mastercard, and JCB issued in Indonesia.",
    icon: CreditCard,
  },
];

interface PaymentMethodListProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

/** SELECT PAYMENT METHOD — a single-select list of the six channels. */
export function PaymentMethodList({
  selectedId,
  onSelect,
}: PaymentMethodListProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Select payment method"
      data-ocid="payment.method_list"
      className="grid gap-3 sm:grid-cols-2"
    >
      {PAYMENT_METHODS.map((method, index) => {
        const Icon = method.icon;
        const selected = method.id === selectedId;

        return (
          <label
            key={method.id}
            data-ocid={`payment.method.${index + 1}`}
            className={cn(
              "tap-target group flex cursor-pointer items-start gap-4 rounded-sm border p-4 text-left transition-smooth",
              selected
                ? "border-accent/60 bg-surface-3/80 shadow-edge-cyan"
                : "border-white/10 bg-surface-2/50 hover:border-white/20 hover:bg-surface-3/60",
            )}
          >
            <input
              type="radio"
              name="payment-method"
              value={method.id}
              checked={selected}
              onChange={() => onSelect(method.id)}
              className="sr-only"
            />
            <span
              className={cn(
                "grid size-11 shrink-0 place-items-center rounded-sm border transition-smooth",
                selected
                  ? "border-accent/50 bg-accent/15 text-accent"
                  : "border-white/10 bg-surface-1 text-muted-foreground group-hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-3">
                <span className="font-display text-base font-semibold tracking-[0.04em] text-foreground">
                  {method.name}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded-full border transition-smooth",
                    selected ? "border-accent" : "border-white/25",
                  )}
                >
                  {selected ? (
                    <span className="size-2 rounded-full bg-accent" />
                  ) : null}
                </span>
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                {method.description}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
