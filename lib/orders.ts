import { parseCartLines, type CartLine } from "@/lib/cart";

export type OrderStatus = "placed" | "fulfilled" | "cancelled";

export type OrderCustomer = {
  email: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type LocalOrder = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  customer: OrderCustomer;
  lines: CartLine[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
};

export type OrderStats = {
  orderCount: number;
  openCount: number;
  revenueCents: number;
  itemCount: number;
};

export const FREE_SHIPPING_THRESHOLD_CENTS = 20_000;
export const STANDARD_SHIPPING_CENTS = 1_000;

export function getShippingCents(subtotalCents: number) {
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_SHIPPING_CENTS;
}

export function buildOrder(input: {
  id: string;
  createdAt: string;
  customer: OrderCustomer;
  lines: CartLine[];
}): LocalOrder {
  const subtotalCents = input.lines.reduce(
    (total, line) => total + line.unitPriceCents * line.quantity,
    0,
  );
  const shippingCents = subtotalCents > 0 ? getShippingCents(subtotalCents) : 0;

  return {
    id: input.id,
    createdAt: input.createdAt,
    status: "placed",
    customer: input.customer,
    lines: input.lines,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
  };
}

export function createOrderId(now = Date.now()) {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `STU-${now.toString(36).toUpperCase()}-${suffix}`;
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return value === "placed" || value === "fulfilled" || value === "cancelled";
}

export function getOrderStatusLabel(status: OrderStatus) {
  switch (status) {
    case "placed":
      return "Placed";
    case "fulfilled":
      return "Fulfilled";
    case "cancelled":
      return "Cancelled";
  }
}

export function formatOrderDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function getOrderStats(orders: LocalOrder[]): OrderStats {
  const active = orders.filter((order) => order.status !== "cancelled");

  return {
    orderCount: orders.length,
    openCount: orders.filter((order) => order.status === "placed").length,
    revenueCents: active.reduce((total, order) => total + order.totalCents, 0),
    itemCount: active.reduce(
      (total, order) =>
        total + order.lines.reduce((lineTotal, line) => lineTotal + line.quantity, 0),
      0,
    ),
  };
}

export function parseStoredOrders(raw: string | null): LocalOrder[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed) ||
      !("orders" in parsed) ||
      !Array.isArray(parsed.orders)
    ) {
      return [];
    }

    const orders = parsed.orders
      .map(parseOrder)
      .filter((order): order is LocalOrder => order !== null)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

    return orders;
  } catch {
    return [];
  }
}

function parseOrder(value: unknown): LocalOrder | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (
    !("id" in value) ||
    typeof value.id !== "string" ||
    !value.id ||
    !("createdAt" in value) ||
    typeof value.createdAt !== "string" ||
    !("status" in value) ||
    !isOrderStatus(value.status) ||
    !("customer" in value) ||
    !("lines" in value)
  ) {
    return null;
  }

  const customer = parseCustomer(value.customer);
  const lines = parseCartLines(value.lines);
  if (!customer || lines.length === 0) return null;

  const order = buildOrder({
    id: value.id,
    createdAt: value.createdAt,
    customer,
    lines,
  });

  return { ...order, status: value.status };
}

function parseCustomer(value: unknown): OrderCustomer | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (
    !("email" in value) ||
    typeof value.email !== "string" ||
    !("firstName" in value) ||
    typeof value.firstName !== "string" ||
    !("lastName" in value) ||
    typeof value.lastName !== "string" ||
    !("address1" in value) ||
    typeof value.address1 !== "string" ||
    !("city" in value) ||
    typeof value.city !== "string" ||
    !("state" in value) ||
    typeof value.state !== "string" ||
    !("postalCode" in value) ||
    typeof value.postalCode !== "string" ||
    !("country" in value) ||
    typeof value.country !== "string"
  ) {
    return null;
  }

  const address2 =
    "address2" in value && typeof value.address2 === "string" ? value.address2 : undefined;

  return {
    email: value.email,
    firstName: value.firstName,
    lastName: value.lastName,
    address1: value.address1,
    address2,
    city: value.city,
    state: value.state,
    postalCode: value.postalCode,
    country: value.country,
  };
}
