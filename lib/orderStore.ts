import {
  isOrderStatus,
  parseStoredOrders,
  type LocalOrder,
  type OrderStatus,
} from "@/lib/orders";

export const ORDERS_STORAGE_KEY = "stussy.orders.v1";

export function loadOrders(): LocalOrder[] {
  if (typeof window === "undefined") return [];

  try {
    return parseStoredOrders(window.localStorage.getItem(ORDERS_STORAGE_KEY));
  } catch {
    return [];
  }
}

export function getOrder(id: string): LocalOrder | undefined {
  return loadOrders().find((order) => order.id === id);
}

export function saveOrder(order: LocalOrder): boolean {
  if (typeof window === "undefined") return false;

  try {
    const orders = loadOrders().filter((existing) => existing.id !== order.id);
    window.localStorage.setItem(
      ORDERS_STORAGE_KEY,
      JSON.stringify({ orders: [order, ...orders] }),
    );
    return true;
  } catch {
    return false;
  }
}

export function updateOrderStatus(id: string, status: OrderStatus): LocalOrder[] | null {
  if (typeof window === "undefined" || !isOrderStatus(status)) return null;

  const orders = loadOrders();
  const target = orders.find((order) => order.id === id);
  if (!target) return null;

  const updated = orders.map((order) => (order.id === id ? { ...order, status } : order));

  try {
    window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify({ orders: updated }));
    return parseStoredOrders(JSON.stringify({ orders: updated }));
  } catch {
    return null;
  }
}
