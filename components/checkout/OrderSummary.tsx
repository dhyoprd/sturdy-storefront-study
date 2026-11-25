import { formatPrice, type CartLine } from "@/lib/cart";

type OrderSummaryProps = {
  lines: CartLine[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  compact?: boolean;
};

export default function OrderSummary({
  lines,
  subtotalCents,
  shippingCents,
  totalCents,
  compact = false,
}: OrderSummaryProps) {
  return (
    <section
      className={`order-summary${compact ? " order-summary--compact" : ""}`}
      aria-label="Order summary"
    >
      <ul className="order-summary__lines">
        {lines.map((line) => (
          <li className="order-summary__line" key={line.key} data-testid="checkout-line">
            <div className="order-summary__media">
              <img src={line.image} alt={line.title} />
            </div>
            <div className="order-summary__info">
              <p className="order-summary__title">{line.title}</p>
              <p className="order-summary__meta">
                {line.color}
                {line.size ? ` / ${line.size}` : ""}
              </p>
              <p className="order-summary__meta">Qty {line.quantity}</p>
            </div>
            <p className="order-summary__line-total">
              {formatPrice(line.unitPriceCents * line.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <dl className="order-summary__totals">
        <div className="order-summary__row">
          <dt>Subtotal</dt>
          <dd data-testid="checkout-subtotal">{formatPrice(subtotalCents)}</dd>
        </div>
        <div className="order-summary__row">
          <dt>Shipping</dt>
          <dd data-testid="checkout-shipping">
            {shippingCents === 0 ? "Free" : formatPrice(shippingCents)}
          </dd>
        </div>
        <div className="order-summary__row order-summary__row--total">
          <dt>Total</dt>
          <dd data-testid="checkout-total">{formatPrice(totalCents)}</dd>
        </div>
      </dl>
    </section>
  );
}
