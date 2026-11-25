"use client";

import Link from "next/link";
import Drawer from "@/components/overlays/Drawer";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/cart";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { lines, subtotalCents, setQuantity, removeItem, clear } = useCart();

  return (
    <Drawer open={open} onClose={onClose} testId="cart-drawer" labelId="cart-title">
      <header className="cart-header">
        <h2 className="cart-title" id="cart-title">
          Shopping Bag
        </h2>
        <button
          className="cart-close"
          type="button"
          onClick={onClose}
          data-testid="cart-close"
        >
          Close
        </button>
      </header>
      <div className="cart-body">
        {lines.length === 0 ? (
          <p className="cart-empty" data-testid="cart-empty">
            YOU HAVE NO ITEMS IN YOUR SHOPPING BAG.
            <br />
            <br />
            FREE STANDARD SHIPPING IN US FOR ORDERS OVER $200 USD. EXCLUSIONS APPLY.
            <br />
            DUE TO A HIGH VOLUME OF ORDERS, YOUR ORDER FULFILLMENT MAY BE SLIGHTLY DELAYED. OUR
            TEAM IS WORKING HARD TO PROCESS IT AS QUICKLY AS POSSIBLE.
          </p>
        ) : (
          <>
            <ul className="cart-lines" aria-label="Shopping bag items">
              {lines.map((line) => (
                <li className="cart-line" key={line.key} data-testid="cart-line">
                  <div className="cart-line__media">
                    <img src={line.image} alt={line.title} />
                  </div>
                  <div className="cart-line__info">
                    <p className="cart-line__title" data-testid="cart-line-title">
                      {line.title}
                    </p>
                    <p className="cart-line__color">
                      {line.color}
                      {line.size ? ` / ${line.size}` : ""}
                    </p>
                    <p className="cart-line__price">{formatPrice(line.unitPriceCents)}</p>
                    <div className="cart-line__actions">
                      <div className="cart-qty">
                        <button
                          className="cart-qty__button"
                          type="button"
                          onClick={() => {
                            if (line.quantity > 1) setQuantity(line.key, line.quantity - 1);
                          }}
                          disabled={line.quantity <= 1}
                          aria-label={`Decrease quantity of ${line.title}`}
                          data-testid="cart-qty-decrease"
                        >
                          −
                        </button>
                        <span className="cart-qty__value" data-testid="cart-line-quantity">
                          {line.quantity}
                        </span>
                        <button
                          className="cart-qty__button"
                          type="button"
                          onClick={() => setQuantity(line.key, line.quantity + 1)}
                          aria-label={`Increase quantity of ${line.title}`}
                          data-testid="cart-qty-increase"
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="cart-remove"
                        type="button"
                        onClick={() => removeItem(line.key)}
                        data-testid="cart-remove"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="cart-summary">
              <div className="cart-summary__row">
                <span className="cart-summary__label">Subtotal</span>
                <span className="cart-summary__value" data-testid="cart-subtotal">
                  {formatPrice(subtotalCents)}
                </span>
              </div>
              <button
                className="cart-clear"
                type="button"
                onClick={clear}
                data-testid="cart-clear"
              >
                Clear Bag
              </button>
            </div>
          </>
        )}
      </div>
      <footer className={`cart-footer${lines.length > 0 ? " cart-footer--actions" : ""}`}>
        {lines.length > 0 && (
          <Link
            className="button-solid cart-checkout"
            href="/checkout"
            onClick={onClose}
            data-testid="cart-checkout"
          >
            Checkout
          </Link>
        )}
        <button
          className={`cart-continue ${lines.length > 0 ? "button-outline" : "button-solid"}`}
          type="button"
          onClick={onClose}
          data-testid="cart-continue"
        >
          Continue Shopping
        </button>
      </footer>
    </Drawer>
  );
}
