"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "@/components/overlays/Modal";
import { formatPrice } from "@/lib/cart";
import {
  formatOrderDate,
  getOrderStats,
  getOrderStatusLabel,
  type LocalOrder,
  type OrderStatus,
} from "@/lib/orders";
import { loadOrders, ORDERS_STORAGE_KEY, updateOrderStatus } from "@/lib/orderStore";

type OrderFilter = "all" | OrderStatus;

const FILTERS: { value: OrderFilter; label: string; testId: string }[] = [
  { value: "all", label: "All", testId: "admin-filter-all" },
  { value: "placed", label: "Placed", testId: "admin-filter-placed" },
  { value: "fulfilled", label: "Fulfilled", testId: "admin-filter-fulfilled" },
  { value: "cancelled", label: "Cancelled", testId: "admin-filter-cancelled" },
];

export default function AdminPanel() {
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [filter, setFilter] = useState<OrderFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const syncOrders = useCallback(() => {
    setOrders(loadOrders());
  }, []);

  useEffect(() => {
    syncOrders();
    setReady(true);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === ORDERS_STORAGE_KEY || event.key === null) {
        syncOrders();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [syncOrders]);

  const stats = useMemo(() => getOrderStats(orders), [orders]);

  const counts = useMemo<Record<OrderFilter, number>>(
    () => ({
      all: orders.length,
      placed: orders.filter((order) => order.status === "placed").length,
      fulfilled: orders.filter((order) => order.status === "fulfilled").length,
      cancelled: orders.filter((order) => order.status === "cancelled").length,
    }),
    [orders],
  );

  const visibleOrders = useMemo(
    () => (filter === "all" ? orders : orders.filter((order) => order.status === filter)),
    [orders, filter],
  );

  const selectedOrder = orders.find((order) => order.id === selectedId) ?? null;

  const closeOrder = useCallback(() => {
    setSelectedId(null);
    setUpdateError(null);
  }, []);

  const changeStatus = useCallback(
    (status: OrderStatus) => {
      if (!selectedOrder) return;

      const nextOrders = updateOrderStatus(selectedOrder.id, status);
      if (nextOrders) {
        setOrders(nextOrders);
        setUpdateError(null);
        return;
      }

      setOrders(loadOrders());
      setUpdateError("Could not update this order. Local storage may be unavailable.");
    },
    [selectedOrder],
  );

  const refresh = useCallback(() => {
    syncOrders();
    setUpdateError(null);
  }, [syncOrders]);

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <div className="admin-header__heading">
          <p className="admin-header__eyebrow">LOCAL ADMIN</p>
          <h1 className="admin-header__title">Orders</h1>
          <p className="admin-header__note">
            Orders live in this browser. This panel reads and writes local order data only;
            nothing is sent to a server.
          </p>
        </div>
        <button
          type="button"
          className="admin-refresh"
          data-testid="admin-refresh"
          onClick={refresh}
        >
          Refresh
        </button>
      </header>

      <section className="admin-stats" aria-label="Order summary">
        <article className="admin-stat">
          <p className="admin-stat__label">Orders</p>
          <p className="admin-stat__value" data-testid="admin-stat-orders">
            {stats.orderCount}
          </p>
        </article>
        <article className="admin-stat">
          <p className="admin-stat__label">Revenue</p>
          <p className="admin-stat__value" data-testid="admin-stat-revenue">
            {formatPrice(stats.revenueCents)}
          </p>
        </article>
        <article className="admin-stat">
          <p className="admin-stat__label">Items</p>
          <p className="admin-stat__value" data-testid="admin-stat-items">
            {stats.itemCount}
          </p>
        </article>
        <article className="admin-stat">
          <p className="admin-stat__label">Open</p>
          <p className="admin-stat__value" data-testid="admin-stat-open">
            {stats.openCount}
          </p>
        </article>
      </section>

      <div className="admin-filters" role="group" aria-label="Filter orders by status">
        {FILTERS.map((entry) => (
          <button
            key={entry.value}
            type="button"
            className="admin-filter"
            data-testid={entry.testId}
            data-active={filter === entry.value}
            aria-pressed={filter === entry.value}
            onClick={() => setFilter(entry.value)}
          >
            <span>{entry.label}</span>{" "}
            <span className="admin-filter__count">{counts[entry.value]}</span>
          </button>
        ))}
      </div>

      {!ready ? (
        <p className="admin-loading" role="status">
          Loading local orders…
        </p>
      ) : orders.length === 0 ? (
        <div className="admin-empty" data-testid="admin-empty">
          <p className="admin-empty__title">No local orders yet</p>
          <p className="admin-empty__copy">
            Orders placed through checkout will appear here, stored only in this browser.
          </p>
          <Link className="admin-empty__link" href="/collections/new-arrivals">
            Shop New Arrivals
          </Link>
        </div>
      ) : visibleOrders.length === 0 ? (
        <p className="admin-no-results" role="status">
          {`No ${filter} orders.`}
        </p>
      ) : (
        <ul className="admin-orders">
          {visibleOrders.map((order) => (
            <li
              key={order.id}
              className="admin-order-row"
              data-testid="admin-order-row"
              data-status={order.status}
            >
              <div className="admin-order-row__cell">
                <span className="admin-order-row__label">Order</span>
                <span className="admin-order-row__value">{order.id}</span>
                <span className="admin-order-row__meta">
                  {formatOrderDate(order.createdAt)}
                </span>
              </div>
              <div className="admin-order-row__cell">
                <span className="admin-order-row__label">Customer</span>
                <span className="admin-order-row__value">
                  {`${order.customer.firstName} ${order.customer.lastName}`}
                </span>
                <span className="admin-order-row__meta">{order.customer.email}</span>
              </div>
              <div className="admin-order-row__cell">
                <span className="admin-order-row__label">Items</span>
                <span className="admin-order-row__value">
                  {order.lines.reduce((total, line) => total + line.quantity, 0)}
                </span>
              </div>
              <div className="admin-order-row__cell">
                <span className="admin-order-row__label">Total</span>
                <span className="admin-order-row__value">
                  {formatPrice(order.totalCents)}
                </span>
              </div>
              <div className="admin-order-row__cell">
                <span className="admin-order-row__label">Status</span>
                <span className={`admin-status admin-status--${order.status}`}>
                  {getOrderStatusLabel(order.status)}
                </span>
              </div>
              <div className="admin-order-row__cell admin-order-row__cell--action">
                <button
                  type="button"
                  className="admin-order-open"
                  data-testid="admin-order-open"
                  onClick={() => {
                    setUpdateError(null);
                    setSelectedId(order.id);
                  }}
                >
                  View
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={selectedOrder !== null}
        onClose={closeOrder}
        labelId="admin-order-title"
        testId="admin-order-modal"
      >
        {selectedOrder ? (
          <div className="admin-order">
            <button
              type="button"
              className="modal-close admin-order__close"
              data-testid="admin-order-close"
              aria-label="Close order details"
              onClick={closeOrder}
            >
              ×
            </button>

            <header className="admin-order__header">
              <p className="admin-order__eyebrow">Order</p>
              <h2 id="admin-order-title" className="admin-order__title">
                {selectedOrder.id}
              </h2>
              <p className="admin-order__meta">
                <span>{formatOrderDate(selectedOrder.createdAt)}</span>
                <span
                  className={`admin-status admin-status--${selectedOrder.status}`}
                  data-testid="admin-order-status"
                >
                  {getOrderStatusLabel(selectedOrder.status)}
                </span>
              </p>
            </header>

            {updateError ? (
              <p className="admin-order__error" role="alert">
                {updateError}
              </p>
            ) : null}

            <section className="admin-order__section">
              <h3 className="admin-order__section-title">Customer</h3>
              <p className="admin-order__text">
                {`${selectedOrder.customer.firstName} ${selectedOrder.customer.lastName}`}
              </p>
              <p className="admin-order__text admin-order__text--muted">
                {selectedOrder.customer.email}
              </p>
            </section>

            <section className="admin-order__section">
              <h3 className="admin-order__section-title">Shipping Address</h3>
              <address className="admin-order__address">
                <span>
                  {`${selectedOrder.customer.firstName} ${selectedOrder.customer.lastName}`}
                </span>
                <span>{selectedOrder.customer.address1}</span>
                {selectedOrder.customer.address2 ? (
                  <span>{selectedOrder.customer.address2}</span>
                ) : null}
                <span>
                  {`${selectedOrder.customer.city}, ${selectedOrder.customer.state} ${selectedOrder.customer.postalCode}`}
                </span>
                <span>{selectedOrder.customer.country}</span>
              </address>
            </section>

            <section className="admin-order__section">
              <h3 className="admin-order__section-title">Items</h3>
              <ul className="admin-order__items">
                {selectedOrder.lines.map((line, index) => (
                  <li className="admin-order__item" key={line.key}>
                    <div className="admin-order__item-info">
                      <p className="admin-order__item-title">{line.title}</p>
                      <p className="admin-order__item-meta">
                        {`${line.color}${line.size ? ` / ${line.size}` : ""} · ${line.quantity} × ${formatPrice(line.unitPriceCents)}`}
                      </p>
                    </div>
                    <p className="admin-order__item-price">
                      {formatPrice(line.unitPriceCents * line.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <dl className="admin-order__totals">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatPrice(selectedOrder.subtotalCents)}</dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd>
                  {selectedOrder.shippingCents === 0
                    ? "Free"
                    : formatPrice(selectedOrder.shippingCents)}
                </dd>
              </div>
              <div className="admin-order__total">
                <dt>Total</dt>
                <dd>{formatPrice(selectedOrder.totalCents)}</dd>
              </div>
            </dl>

            <div className="admin-order__actions">
              <button
                type="button"
                className="button-solid admin-order__action"
                data-testid="admin-mark-fulfilled"
                disabled={selectedOrder.status !== "placed"}
                onClick={() => changeStatus("fulfilled")}
              >
                Mark Fulfilled
              </button>
              <button
                type="button"
                className="button-outline admin-order__action"
                data-testid="admin-cancel-order"
                disabled={selectedOrder.status === "cancelled"}
                onClick={() => changeStatus("cancelled")}
              >
                Cancel Order
              </button>
            </div>

            <p className="admin-order__note">
              Status changes save to this browser immediately.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
