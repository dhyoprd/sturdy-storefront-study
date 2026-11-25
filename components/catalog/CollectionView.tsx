"use client";

import { useEffect, useId, useMemo, useState } from "react";
import ProductCard from "@/components/catalog/ProductCard";
import type { ProductCardData } from "@/lib/content";

type CollectionViewProps = {
  collection: {
    handle: string;
    title: string;
    products: ProductCardData[];
  };
  initialSizes: string[];
};

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "ONE SIZE"];

function sizeRank(value: string) {
  const rank = SIZE_ORDER.indexOf(value.toUpperCase());
  return rank === -1 ? SIZE_ORDER.length : rank;
}

export default function CollectionView({ collection, initialSizes }: CollectionViewProps) {
  const [open, setOpen] = useState(false);
  const [draftSizes, setDraftSizes] = useState<string[]>([]);
  const [appliedSizes, setAppliedSizes] = useState<string[]>(initialSizes);
  const panelId = useId();

  const sizes = useMemo(() => {
    const values = new Set<string>();
    for (const product of collection.products) {
      for (const size of product.sizes) values.add(size.label);
    }
    return [...values].sort((left, right) => sizeRank(left) - sizeRank(right) || left.localeCompare(right));
  }, [collection.products]);

  const products = useMemo(() => {
    if (appliedSizes.length === 0) return collection.products;
    const selected = new Set(appliedSizes);
    return collection.products.filter((product) =>
      product.sizes.some((size) => selected.has(size.label) && size.available),
    );
  }, [appliedSizes, collection.products]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      setAppliedSizes(params.getAll("filter.v.option.size"));
    };
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  function toggleSize(value: string) {
    setDraftSizes((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function openFilter() {
    setDraftSizes(appliedSizes);
    setOpen(true);
  }

  function applyFilter() {
    setAppliedSizes(draftSizes);
    const params = new URLSearchParams(window.location.search);
    params.delete("filter.v.option.size");
    params.delete("filter.v.availability");
    for (const size of draftSizes) params.append("filter.v.option.size", size);
    if (draftSizes.length > 0) params.set("filter.v.availability", "1");
    const query = params.toString();
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="collection-filter-button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={open ? () => setOpen(false) : openFilter}
        data-testid="collection-filter"
      >
        Filter
      </button>

      {open ? (
        <div
          className="collection-filter"
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-label="Filter"
          data-testid="filter-drawer"
        >
          <div className="collection-filter__head">
            <p className="collection-filter__title">Filter</p>
            <button
              type="button"
              className="collection-filter__close"
              aria-label="Close"
              onClick={() => setOpen(false)}
              data-testid="filter-close"
            >
              ×
            </button>
          </div>

          <fieldset className="collection-filter__section">
            <legend className="collection-filter__legend">Filter Size</legend>
            <ul className="collection-filter__sizes">
              {sizes.map((size) => {
                const id = `${panelId}-${size}`;
                return (
                  <li key={size}>
                    <input
                      className="collection-filter__checkbox"
                      id={id}
                      type="checkbox"
                      checked={draftSizes.includes(size)}
                      onChange={() => toggleSize(size)}
                      data-testid={`filter-size-${size}`}
                    />
                    <label className="collection-filter__label" htmlFor={id}>
                      {size}
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>

          <div className="collection-filter__actions">
            <button
              type="button"
              className="collection-filter__clear"
              onClick={() => setDraftSizes([])}
              data-testid="filter-clear"
            >
              Clear ({draftSizes.length})
            </button>
            <button
              type="button"
              className="button-solid collection-filter__apply"
              onClick={applyFilter}
              data-testid="filter-apply"
            >
              Apply filters
            </button>
          </div>
        </div>
      ) : null}

      <div className="collection-grid" data-testid="collection-grid">
        {products.map((product) => (
          <ProductCard
            key={`${product.handle}-${product.id}`}
            product={product}
            collectionHandle={collection.handle}
          />
        ))}
      </div>

      {products.length === 0 ? (
        <p className="collection-empty" data-testid="collection-empty">
          NO PRODUCTS FOUND.
        </p>
      ) : null}
    </>
  );
}
