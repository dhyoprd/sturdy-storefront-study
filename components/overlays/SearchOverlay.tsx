"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/catalog/ProductCard";
import type { ProductCardData } from "@/lib/content";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useDialogFocus } from "@/hooks/useDialogFocus";

type SearchOverlayProps = {
  open: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  onClose: () => void;
};

const MOBILE_QUERY = "(max-width: 1023px)";

export default function SearchOverlay({
  open,
  query,
  onQueryChange,
  onClose,
}: SearchOverlayProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    const sync = () => setIsMobile(media.matches);

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useBodyScrollLock(open);
  useDialogFocus(open && isMobile, panelRef, onClose);

  useEffect(() => {
    if (!open || isMobile) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, onClose, open]);

  const trimmed = query.trim();

  useEffect(() => {
    if (!open || trimmed.length < 1) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setProducts([]);
    setLoading(true);
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Search failed");
        const data = (await response.json()) as { products?: ProductCardData[] };
        if (!controller.signal.aborted) {
          setProducts(Array.isArray(data.products) ? data.products : []);
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setProducts([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 120);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [open, trimmed]);

  const clearSearch = () => {
    setProducts([]);
    setLoading(false);
    onQueryChange("");
    const inputId = isMobile ? "mobile-search-input" : "desktop-search-input";
    document.getElementById(inputId)?.focus();
  };

  if (!open) return null;
  if (!isMobile && trimmed.length === 0) return null;

  return (
    <div
      ref={panelRef}
      className="search-panel"
      data-has-query={trimmed.length > 0}
      role="dialog"
      aria-label="Search"
      data-testid="search-panel"
    >
      {isMobile && (
        <form
          className="search-form"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <label className="visually-hidden" htmlFor="mobile-search-input">
            Search
          </label>
          <input
            className="search-input"
            id="mobile-search-input"
            data-testid="mobile-search-input"
            type="search"
            name="q"
            value={query}
            placeholder="SEARCH HERE"
            autoFocus
            spellCheck={false}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </form>
      )}

      {trimmed.length >= 1 ? (
        <div className="search-results" data-testid="search-results">
          <div className="search-results__actions">
            <button
              type="button"
              className="search-clear"
              data-testid="search-clear"
              onClick={clearSearch}
            >
              Clear
            </button>
            {products.length > 0 ? (
              <Link
                className="search-view-all"
                href={`/search?q=${encodeURIComponent(trimmed)}`}
                data-testid="search-view-all"
                onClick={onClose}
              >
                View All Results
              </Link>
            ) : null}
          </div>

          {products.length > 0 ? (
            <div className="search-products" onClick={onClose}>
              {products.map((product) => (
                <ProductCard
                  key={`${product.handle}-${product.id}`}
                  product={product}
                  collectionHandle={product.collectionHandle}
                />
              ))}
            </div>
          ) : loading ? (
            <p className="search-loading" role="status">
              LOADING
            </p>
          ) : (
            <p className="search-empty" data-testid="search-empty">
              NO RESULTS FOUND
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
