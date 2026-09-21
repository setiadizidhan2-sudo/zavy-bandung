import { createActor } from "@/backend";
import type { CreateOrderError, CreateOrderResult } from "@/backend";
import {
  type CustomerDraft,
  type CustomerErrors,
  CustomerForm,
  normaliseWhatsapp,
  validateCustomer,
} from "@/components/checkout/CustomerForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { Button } from "@/components/ui/button";
import { EVENT } from "@/lib/event";
import { formatIDR } from "@/lib/format";
import { getTier, useSelectionStore } from "@/store/selection";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Lock } from "lucide-react";
import { useState } from "react";

/** Session-scoped handoff of the created order to the payment and success pages. */
const ORDER_STORAGE_KEY = "zavy.order";

export interface StoredOrder {
  orderNumber: string;
  subtotal: string;
  serviceFee: string;
  total: string;
  paymentDeadline: string;
  tierName: string;
  quantity: number;
}

export function readStoredOrder(): StoredOrder | null {
  try {
    const raw = window.sessionStorage.getItem(ORDER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredOrder) : null;
  } catch {
    return null;
  }
}

function writeStoredOrder(order: StoredOrder): void {
  try {
    window.sessionStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
  } catch {
    /* storage unavailable — the payment page falls back to its empty state */
  }
}

/** Turns a backend CreateOrderError into buyer-facing copy. */
function describeCreateOrderError(error: CreateOrderError): string {
  switch (error.__kind__) {
    case "insufficientStock":
      return `Only ${error.insufficientStock.remaining} ${
        getTier(error.insufficientStock.tierId as never).name
      } tickets are left. Reduce the quantity and try again.`;
    case "unknownTier":
      return "That ticket tier is no longer available. Pick another tier and try again.";
    case "invalidInput":
      return error.invalidInput;
    default:
      return "We could not create your order. Please try again.";
  }
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { actor } = useActor(createActor);

  const tierId = useSelectionStore((state) => state.tierId);
  const quantity = useSelectionStore((state) => state.quantity);
  const increment = useSelectionStore((state) => state.increment);
  const decrement = useSelectionStore((state) => state.decrement);

  const tier = getTier(tierId);

  const [draft, setDraft] = useState<CustomerDraft>({
    fullName: "",
    email: "",
    whatsapp: "",
  });
  const [errors, setErrors] = useState<CustomerErrors>({});
  const [agreed, setAgreed] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const tiersQuery = useQuery({
    queryKey: ["tiers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTiers();
    },
    enabled: !!actor,
  });

  const liveTier = tiersQuery.data?.find((entry) => entry.id === tierId);
  const remaining =
    liveTier === undefined ? undefined : Number(liveTier.remaining);

  const createOrder = useMutation({
    mutationFn: async (input: CustomerDraft) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.createOrder(
        input.fullName.trim(),
        input.email.trim(),
        normaliseWhatsapp(input.whatsapp),
        tierId,
        BigInt(quantity),
      );
      if (result.__kind__ === "err")
        throw new Error(describeCreateOrderError(result.err));
      return result.ok;
    },
    onSuccess: (result: CreateOrderResult) => {
      writeStoredOrder({
        orderNumber: result.orderNumber,
        subtotal: result.subtotal.toString(),
        serviceFee: result.serviceFee.toString(),
        total: result.total.toString(),
        paymentDeadline: result.paymentDeadline.toString(),
        tierName: tier.name,
        quantity,
      });
      void queryClient.invalidateQueries({ queryKey: ["tiers"] });
      void navigate({ to: "/payment" });
    },
    onError: (error: Error) => {
      setSubmitError(error.message);
      void queryClient.invalidateQueries({ queryKey: ["tiers"] });
    },
  });

  const handleFieldChange = (field: keyof CustomerDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError(null);
  };

  const handleSubmit = () => {
    const nextErrors = validateCustomer(draft);
    setErrors(nextErrors);
    setSubmitError(null);
    if (Object.keys(nextErrors).length > 0 || !agreed) return;
    createOrder.mutate(draft);
  };

  const isFormValid =
    Object.keys(validateCustomer(draft)).length === 0 && agreed;
  const canSubmit = isFormValid && !createOrder.isPending;

  return (
    <div
      data-ocid="checkout.page"
      className="mx-auto w-full max-w-6xl px-5 py-14 md:px-8 md:py-20"
    >
      <Link
        to="/tickets"
        data-ocid="checkout.back_link"
        className="inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground transition-smooth hover:text-accent"
      >
        <ArrowLeft className="size-3.5" />
        Back to tickets
      </Link>

      <header className="mt-8 animate-slide-up">
        <p className="label-eyebrow">Secure Checkout</p>
        <h1 className="font-display-xl mt-3 text-foreground">Checkout</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {EVENT.name} — {EVENT.dateLabel} at {EVENT.venue}, {EVENT.city}. Three
          details, one step, and your ticket is reserved.
        </p>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="animate-slide-up delay-100">
          <CustomerForm
            draft={draft}
            errors={errors}
            agreed={agreed}
            onFieldChange={handleFieldChange}
            onAgreedChange={(next) => {
              setAgreed(next);
              setSubmitError(null);
            }}
          />
        </div>

        <div className="animate-slide-up delay-200 lg:sticky lg:top-24">
          <OrderSummary
            tier={tier}
            quantity={quantity}
            remaining={remaining}
            onIncrement={increment}
            onDecrement={decrement}
          />

          {submitError ? (
            <div
              data-ocid="checkout.error_state"
              role="alert"
              className="mt-4 flex items-start gap-3 rounded-sm border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          ) : null}

          <Button
            type="button"
            data-ocid="checkout.submit_button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="tap-target mt-4 h-14 w-full rounded-sm border border-accent/40 bg-gradient-cta font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground shadow-edge-blue transition-smooth hover:shadow-edge-cyan disabled:border-white/10 disabled:bg-none disabled:bg-surface-2 disabled:text-muted-foreground disabled:shadow-none"
          >
            {createOrder.isPending
              ? "Reserving your tickets…"
              : "Continue to Payment"}
          </Button>

          <p className="mt-3 flex items-center justify-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-foreground">
            <Lock className="size-3" />
            {isFormValid
              ? `Total ${formatIDR(createOrder.data?.total ?? 0)}`
              : "Complete the form to continue"}
          </p>
        </div>
      </div>
    </div>
  );
}
