export type CartProduct = {
  handle: string;
  title: string;
  price: string;
  color: string;
  image: string;
  category: string;
  size?: string;
  variantId?: string;
};

export type CartLine = CartProduct & {
  key: string;
  unitPriceCents: number;
  quantity: number;
};

export type CartState = {
  lines: CartLine[];
};

export const emptyCartState: CartState = { lines: [] };

const MAX_QUANTITY = 99;

export function parsePriceToCents(price: string) {
  const numeric = Number.parseFloat(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? Math.round(numeric * 100) : 0;
}

export function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2).replace(/\.00$/, "")}`;
}

export function getCartLineKey(product: Pick<CartProduct, "handle" | "variantId" | "size">) {
  if (product.variantId) return `${product.handle}::${product.variantId}`;
  if (product.size) return `${product.handle}::${product.size}`;
  return product.handle;
}

export function getCartCount(state: CartState) {
  return state.lines.reduce((total, line) => total + line.quantity, 0);
}

export function getCartSubtotalCents(state: CartState) {
  return state.lines.reduce((total, line) => total + line.unitPriceCents * line.quantity, 0);
}

export function addToCart(state: CartState, product: CartProduct, quantity = 1): CartState {
  if (quantity <= 0) return state;

  const key = getCartLineKey(product);
  const existing = state.lines.find((line) => line.key === key);
  if (existing) {
    return {
      lines: state.lines.map((line) =>
        line.key === key
          ? { ...line, quantity: Math.min(MAX_QUANTITY, line.quantity + Math.floor(quantity)) }
          : line,
      ),
    };
  }

  return {
    lines: [
      ...state.lines,
      {
        ...product,
        key,
        unitPriceCents: parsePriceToCents(product.price),
        quantity: Math.min(MAX_QUANTITY, Math.floor(quantity)),
      },
    ],
  };
}

export function setCartLineQuantity(state: CartState, key: string, quantity: number): CartState {
  const nextQuantity = Math.min(MAX_QUANTITY, Math.floor(quantity));
  if (nextQuantity <= 0) return removeCartLine(state, key);

  return {
    lines: state.lines.map((line) =>
      line.key === key ? { ...line, quantity: nextQuantity } : line,
    ),
  };
}

export function removeCartLine(state: CartState, key: string): CartState {
  return { lines: state.lines.filter((line) => line.key !== key) };
}

export function parseCartLine(value: unknown): CartLine | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (
    !("handle" in value) ||
    typeof value.handle !== "string" ||
    !value.handle ||
    !("title" in value) ||
    typeof value.title !== "string" ||
    !("price" in value) ||
    typeof value.price !== "string" ||
    !("color" in value) ||
    typeof value.color !== "string" ||
    !("image" in value) ||
    typeof value.image !== "string" ||
    !("category" in value) ||
    typeof value.category !== "string" ||
    !("quantity" in value) ||
    !("unitPriceCents" in value)
  ) {
    return null;
  }

  const quantity = Math.min(MAX_QUANTITY, Math.floor(Number(value.quantity)));
  const unitPriceCents = Math.round(Number(value.unitPriceCents));
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  if (!Number.isFinite(unitPriceCents) || unitPriceCents < 0) return null;

  const size = "size" in value && typeof value.size === "string" ? value.size : undefined;
  const variantId =
    "variantId" in value && typeof value.variantId === "string" ? value.variantId : undefined;
  const key =
    "key" in value && typeof value.key === "string" && value.key
      ? value.key
      : getCartLineKey({ handle: value.handle, size, variantId });

  return {
    key,
    handle: value.handle,
    title: value.title,
    price: value.price,
    color: value.color,
    image: value.image,
    category: value.category,
    size,
    variantId,
    unitPriceCents,
    quantity,
  };
}

export function parseCartLines(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  return value.map(parseCartLine).filter((line): line is CartLine => line !== null);
}

export function parseStoredCart(raw: string | null): CartState {
  if (!raw) return emptyCartState;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed) ||
      !("lines" in parsed)
    ) {
      return emptyCartState;
    }

    return { lines: parseCartLines(parsed.lines) };
  } catch {
    return emptyCartState;
  }
}
