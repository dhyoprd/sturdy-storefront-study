"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import OrderSummary from "@/components/checkout/OrderSummary";
import { useCart } from "@/components/cart/CartProvider";
import { buildOrder, createOrderId, getShippingCents } from "@/lib/orders";
import { saveOrder } from "@/lib/orderStore";

type CheckoutFields = {
  email: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const initialFields: CheckoutFields = {
  email: "",
  firstName: "",
  lastName: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
};

export default function CheckoutView() {
  const router = useRouter();
  const { lines, subtotalCents, hydrated, clear } = useCart();
  const [fields, setFields] = useState<CheckoutFields>(initialFields);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  function updateField(field: keyof CheckoutFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;

    if (lines.length === 0) {
      setError("Your shopping bag is empty.");
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setError(null);

    try {
      const order = buildOrder({
        id: createOrderId(),
        createdAt: new Date().toISOString(),
        customer: {
          email: fields.email.trim(),
          firstName: fields.firstName.trim(),
          lastName: fields.lastName.trim(),
          address1: fields.address1.trim(),
          address2: fields.address2.trim() || undefined,
          city: fields.city.trim(),
          state: fields.state.trim(),
          postalCode: fields.postalCode.trim(),
          country: fields.country,
        },
        lines,
      });

      if (!saveOrder(order)) {
        setError("We couldn't save your order. Please try again.");
        submittingRef.current = false;
        setSubmitting(false);
        return;
      }

      clear();
      router.push(`/order/${order.id}`);
    } catch {
      setError("We couldn't save your order. Please try again.");
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return <div className="checkout-view" aria-busy="true" />;
  }

  if (lines.length === 0) {
    if (submitting) {
      return <div className="checkout-view" aria-busy="true" />;
    }

    return (
      <div className="checkout-view">
        <h1 className="checkout-view__title">Checkout</h1>
        <div className="checkout-empty">
          <p className="checkout-empty__message" data-testid="checkout-empty">
            Your shopping bag is empty.
          </p>
          <Link
            className="checkout-empty__link"
            href="/collections/new-arrivals"
            data-testid="checkout-empty-link"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const shippingCents = getShippingCents(subtotalCents);
  const totalCents = subtotalCents + shippingCents;

  return (
    <div className="checkout-view">
      <h1 className="checkout-view__title">Checkout</h1>

      <div className="checkout-view__layout">
        <form
          className="checkout-form"
          onSubmit={handleSubmit}
          data-testid="checkout-form"
        >
          <div className="checkout-form__group">
            <h2 className="checkout-form__legend">Contact</h2>
            <label className="checkout-field">
              <span className="checkout-field__label">Email</span>
              <input
                className="checkout-field__input"
                id="checkout-email"
                name="email"
                type="email"
                autoComplete="email"
                value={fields.email}
                onChange={(event) => updateField("email", event.target.value)}
                required
                suppressHydrationWarning
                data-testid="checkout-email"
              />
            </label>
          </div>

          <div className="checkout-form__group">
            <h2 className="checkout-form__legend">Shipping Address</h2>

            <div className="checkout-form__row checkout-form__row--split">
              <label className="checkout-field">
                <span className="checkout-field__label">First Name</span>
                <input
                  className="checkout-field__input"
                  id="checkout-first-name"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={fields.firstName}
                  onChange={(event) => updateField("firstName", event.target.value)}
                  required
                  data-testid="checkout-first-name"
                />
              </label>
              <label className="checkout-field">
                <span className="checkout-field__label">Last Name</span>
                <input
                  className="checkout-field__input"
                  id="checkout-last-name"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={fields.lastName}
                  onChange={(event) => updateField("lastName", event.target.value)}
                  required
                  data-testid="checkout-last-name"
                />
              </label>
            </div>

            <label className="checkout-field">
              <span className="checkout-field__label">Address</span>
              <input
                className="checkout-field__input"
                id="checkout-address1"
                name="address1"
                type="text"
                autoComplete="address-line1"
                value={fields.address1}
                onChange={(event) => updateField("address1", event.target.value)}
                required
                data-testid="checkout-address1"
              />
            </label>

            <label className="checkout-field">
              <span className="checkout-field__label">Address 2 (Optional)</span>
              <input
                className="checkout-field__input"
                id="checkout-address2"
                name="address2"
                type="text"
                autoComplete="address-line2"
                value={fields.address2}
                onChange={(event) => updateField("address2", event.target.value)}
                data-testid="checkout-address2"
              />
            </label>

            <div className="checkout-form__row checkout-form__row--split">
              <label className="checkout-field">
                <span className="checkout-field__label">City</span>
                <input
                  className="checkout-field__input"
                  id="checkout-city"
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  value={fields.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  required
                  data-testid="checkout-city"
                />
              </label>
              <label className="checkout-field">
                <span className="checkout-field__label">State</span>
                <input
                  className="checkout-field__input"
                  id="checkout-state"
                  name="state"
                  type="text"
                  autoComplete="address-level1"
                  value={fields.state}
                  onChange={(event) => updateField("state", event.target.value)}
                  required
                  data-testid="checkout-state"
                />
              </label>
            </div>

            <div className="checkout-form__row checkout-form__row--split">
              <label className="checkout-field">
                <span className="checkout-field__label">Postal Code</span>
                <input
                  className="checkout-field__input"
                  id="checkout-postal-code"
                  name="postalCode"
                  type="text"
                  autoComplete="postal-code"
                  value={fields.postalCode}
                  onChange={(event) => updateField("postalCode", event.target.value)}
                  required
                  data-testid="checkout-postal-code"
                />
              </label>
              <label className="checkout-field">
                <span className="checkout-field__label">Country</span>
                <select
                  className="checkout-field__input checkout-field__select"
                  id="checkout-country"
                  name="country"
                  autoComplete="country"
                  value={fields.country}
                  onChange={(event) => updateField("country", event.target.value)}
                  required
                  data-testid="checkout-country"
                >
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="GB">United Kingdom</option>
                </select>
              </label>
            </div>
          </div>

          <p className="checkout-view__note">
            Demo checkout — no payment is processed.
          </p>

          {error && (
            <p className="checkout-error" role="alert" data-testid="checkout-error">
              {error}
            </p>
          )}

          <button
            className="button-solid checkout-submit"
            type="submit"
            disabled={submitting}
            data-testid="checkout-submit"
          >
            {submitting ? "Placing Order…" : "Place Order"}
          </button>
        </form>

        <aside className="checkout-view__summary" data-testid="checkout-summary">
          <h2 className="checkout-view__summary-title">Order Summary</h2>
          <OrderSummary
            lines={lines}
            subtotalCents={subtotalCents}
            shippingCents={shippingCents}
            totalCents={totalCents}
          />
        </aside>
      </div>
    </div>
  );
}
