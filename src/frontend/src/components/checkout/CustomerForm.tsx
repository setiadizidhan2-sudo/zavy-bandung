import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import type { ChangeEvent } from "react";

export interface CustomerDraft {
  fullName: string;
  email: string;
  whatsapp: string;
}

export interface CustomerErrors {
  fullName?: string;
  email?: string;
  whatsapp?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Normalises an Indonesian WhatsApp number to `+62…` for the backend. */
export function normaliseWhatsapp(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+62")) return digits;
  if (digits.startsWith("62")) return `+${digits}`;
  if (digits.startsWith("0")) return `+62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `+62${digits}`;
  return digits;
}

/** Validates the three checkout fields. Returns an empty object when valid. */
export function validateCustomer(draft: CustomerDraft): CustomerErrors {
  const errors: CustomerErrors = {};

  if (draft.fullName.trim().length < 2) {
    errors.fullName = "Enter the full name for the ticket holder.";
  }

  if (!EMAIL_PATTERN.test(draft.email.trim())) {
    errors.email = "Enter a valid email address, e.g. name@email.com.";
  }

  const digits = normaliseWhatsapp(draft.whatsapp).replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15) {
    errors.whatsapp = "Enter a valid WhatsApp number, e.g. 0812 3456 7890.";
  }

  return errors;
}

const FIELD_CLASS =
  "tap-target h-12 rounded-sm border-input bg-surface-2/60 px-4 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:border-accent focus-visible:ring-accent/30";

interface CustomerFormProps {
  draft: CustomerDraft;
  errors: CustomerErrors;
  agreed: boolean;
  onFieldChange: (field: keyof CustomerDraft, value: string) => void;
  onAgreedChange: (agreed: boolean) => void;
}

/**
 * CUSTOMER INFORMATION — exactly three fields, plus the required
 * Terms & Conditions agreement that gates the checkout submit.
 */
export function CustomerForm({
  draft,
  errors,
  agreed,
  onFieldChange,
  onAgreedChange,
}: CustomerFormProps) {
  const handleChange =
    (field: keyof CustomerDraft) => (event: ChangeEvent<HTMLInputElement>) =>
      onFieldChange(field, event.target.value);

  return (
    <section
      data-ocid="checkout.customer_panel"
      className="glass-panel rounded-sm p-6 md:p-8"
    >
      <p className="label-eyebrow">Step 01</p>
      <h2 className="font-title mt-2 text-foreground">Customer Information</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Your e-ticket is issued to these details. Double-check them before you
        continue.
      </p>

      <div className="mt-7 space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="checkout-full-name"
            className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-muted-foreground"
          >
            Full Name
          </Label>
          <Input
            id="checkout-full-name"
            name="fullName"
            data-ocid="checkout.full_name_input"
            autoComplete="name"
            placeholder="Nadia Prameswari"
            value={draft.fullName}
            onChange={handleChange("fullName")}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={
              errors.fullName ? "checkout-full-name-error" : undefined
            }
            className={FIELD_CLASS}
          />
          {errors.fullName ? (
            <p
              id="checkout-full-name-error"
              data-ocid="checkout.full_name_error"
              className="flex items-start gap-2 text-xs text-destructive"
            >
              <AlertCircle className="mt-px size-3.5 shrink-0" />
              {errors.fullName}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="checkout-email"
            className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-muted-foreground"
          >
            Email
          </Label>
          <Input
            id="checkout-email"
            name="email"
            type="email"
            inputMode="email"
            data-ocid="checkout.email_input"
            autoComplete="email"
            placeholder="nadia@email.com"
            value={draft.email}
            onChange={handleChange("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "checkout-email-error" : undefined}
            className={FIELD_CLASS}
          />
          {errors.email ? (
            <p
              id="checkout-email-error"
              data-ocid="checkout.email_error"
              className="flex items-start gap-2 text-xs text-destructive"
            >
              <AlertCircle className="mt-px size-3.5 shrink-0" />
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="checkout-whatsapp"
            className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-muted-foreground"
          >
            WhatsApp Number
          </Label>
          <Input
            id="checkout-whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            data-ocid="checkout.whatsapp_input"
            autoComplete="tel"
            placeholder="0812 3456 7890"
            value={draft.whatsapp}
            onChange={handleChange("whatsapp")}
            aria-invalid={Boolean(errors.whatsapp)}
            aria-describedby={
              errors.whatsapp ? "checkout-whatsapp-error" : undefined
            }
            className={FIELD_CLASS}
          />
          {errors.whatsapp ? (
            <p
              id="checkout-whatsapp-error"
              data-ocid="checkout.whatsapp_error"
              className="flex items-start gap-2 text-xs text-destructive"
            >
              <AlertCircle className="mt-px size-3.5 shrink-0" />
              {errors.whatsapp}
            </p>
          ) : null}
        </div>
      </div>

      <div className="rule-hairline my-7" />

      <div className="flex items-start gap-3">
        <Checkbox
          id="checkout-terms"
          data-ocid="checkout.terms_checkbox"
          checked={agreed}
          onCheckedChange={(checked) => onAgreedChange(checked === true)}
          className="mt-0.5 size-5 rounded-sm border-input data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
        />
        <Label
          htmlFor="checkout-terms"
          className="cursor-pointer text-sm font-normal leading-relaxed text-muted-foreground"
        >
          I agree to the{" "}
          <Link
            to="/terms"
            data-ocid="checkout.terms_link"
            className="font-medium text-accent underline-offset-4 transition-smooth hover:underline"
          >
            Terms &amp; Conditions
          </Link>
        </Label>
      </div>
    </section>
  );
}
