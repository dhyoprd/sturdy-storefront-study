"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import {
  addToCart,
  emptyCartState,
  getCartCount,
  getCartSubtotalCents,
  parseStoredCart,
  removeCartLine,
  setCartLineQuantity,
  type CartProduct,
  type CartState,
} from "@/lib/cart";

const STORAGE_KEY = "stussy.cart.v1";

type CartAction =
  | { type: "hydrate"; state: CartState }
  | { type: "add"; product: CartProduct; quantity: number }
  | { type: "set-quantity"; key: string; quantity: number }
  | { type: "remove"; key: string }
  | { type: "clear" };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "add":
      return addToCart(state, action.product, action.quantity);
    case "set-quantity":
      return setCartLineQuantity(state, action.key, action.quantity);
    case "remove":
      return removeCartLine(state, action.key);
    case "clear":
      return emptyCartState;
  }
}

type CartContextValue = {
  lines: CartState["lines"];
  count: number;
  subtotalCents: number;
  hydrated: boolean;
  addItem: (product: CartProduct, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export default function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, emptyCartState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      dispatch({ type: "hydrate", state: parseStoredCart(localStorage.getItem(STORAGE_KEY)) });
    } catch {
      dispatch({ type: "hydrate", state: emptyCartState });
    } finally {
      setHydrated(true);
      document.documentElement.dataset.cartHydrated = "true";
    }

    return () => {
      delete document.documentElement.dataset.cartHydrated;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable in restricted browsing modes.
    }
  }, [hydrated, state]);

  const addItem = useCallback((product: CartProduct, quantity = 1) => {
    dispatch({ type: "add", product, quantity });
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    dispatch({ type: "set-quantity", key, quantity });
  }, []);

  const removeItem = useCallback((key: string) => {
    dispatch({ type: "remove", key });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: "clear" });
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines: state.lines,
      count: getCartCount(state),
      subtotalCents: getCartSubtotalCents(state),
      hydrated,
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [addItem, clear, hydrated, removeItem, setQuantity, state],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
