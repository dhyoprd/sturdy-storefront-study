"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import OrderSummary from "@/components/checkout/OrderSummary";
import { formatPrice } from "@/lib/cart";
import {
  formatOrderDate,
  getOrderStatusLabel,
  type LocalOrder,
} from "@/lib/orders";
import { getOrder } from "@/lib/orderStore";

const COUNTRY_LABELS: Record<string, string> = {
  US: "United States",
  CA: "Canada",
  GB: "United Kingdom",
};

export default function OrderConfirmation({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<LocalOrder | null | undefined>(undefined);

  useEffect(() => {
    setOrder(getOrder(orderId) ?? null);
  }, [orderId]);

  if (order === undefined) {
    return (
      <div className="order-confirmation" aria-busy="true">
        <p className="order-confirmation__note">Loading order…</p>
      </div>
    );
  }

  if (order === null) {
    return (
      <div className="order-confirmation order-confirmation--missing">
        <h1 className="order-confirmation__title">Order Not Found</h1>
        <p className="order-confirmation__empty" data-testid="order-not-found">
          We couldn&rsquo;t find this order on this device.
        </p>
        <Link className="order-confirmation__link" href="/collections/new-arrivals">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const { customer } = order;
  const country = COUNTRY_LABELS[customer.country] ?? customer.country;

  return (
    <article className="order-confirmation" data-testid="order-confirmation">
      <header className="order-confirmation__header">
        <p className="order-confirmation__eyebrow">Thank You</p>
        <h1 className="order-confirmation__title">Order Confirmed</h1>
        <p className="order-confirmation__note">
          This local demo order is stored only on this device.
        </p>
      </header>

      <dl className="order-confirmation__meta">
        <div className="order-confirmation__field">
          <dt className="order-confirmation__label">Order Number</dt>
          <dd className="order-confirmation__value" data-testid="order-number">
            {order.id}
          </dd>
        </div>
        <div className="order-confirmation__field">
          <dt className="order-confirmation__label">Status</dt>
          <dd className="order-confirmation__value" data-testid="order-status">
            {getOrderStatusLabel(order.status)}
          </dd>
        </div>
        <div className="order-confirmation__field">
          <dt className="order-confirmation__label">Date</dt>
          <dd className="order-confirmation__value">{formatOrderDate(order.createdAt)}</dd>
        </div>
        <div className="order-confirmation__field">
          <dt className="order-confirmation__label">Email</dt>
          <dd className="order-confirmation__value" data-testid="order-email">
            {customer.email}
          </dd>
        </div>
        <div className="order-confirmation__field order-confirmation__field--wide">
          <dt className="order-confirmation__label">Shipping Address</dt>
          <dd>
            <address className="order-confirmation__address" data-testid="order-address">
              <span>
                {customer.firstName} {customer.lastName}
              </span>
              <span>{customer.address1}</span>
              {customer.address2 && <span>{customer.address2}</span>}
              <span>
                {customer.city}, {customer.state} {customer.postalCode}
              </span>
              <span>{country}</span>
            </address>
          </dd>
        </div>
      </dl>

      <section className="order-confirmation__section" aria-labelledby="order-items-title">
        <h2 className="order-confirmation__section-title" id="order-items-title">
          Items
        </h2>
        <div data-testid="order-items">
          <OrderSummary
            lines={order.lines}
            subtotalCents={order.subtotalCents}
            shippingCents={order.shippingCents}
            totalCents={order.totalCents}
            compact
          />
        </div>
      </section>

      <div className="order-confirmation__total">
        <span className="order-confirmation__total-label">Order Total</span>
        <span data-testid="order-total">{formatPrice(order.totalCents)}</span>
      </div>

      <Link className="order-confirmation__link" href="/collections/new-arrivals">
        Continue Shopping
      </Link>
    </article>
  );
}
