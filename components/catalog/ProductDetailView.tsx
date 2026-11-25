"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import ProductSizeGuide from "@/components/catalog/ProductSizeGuide";
import { formatPrice } from "@/lib/cart";
import type { ProductRecord } from "@/lib/content";
import type { RelatedColor } from "@/lib/contentStore";

type ProductDetailViewProps = {
  product: ProductRecord;
  collectionHandle: string;
  collectionTitle: string;
  relatedColors: RelatedColor[];
  initialVariantId?: string;
};

const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL", "ONE SIZE"];

function sizeRank(value: string) {
  const rank = SIZE_ORDER.indexOf(value.toUpperCase());
  return rank === -1 ? SIZE_ORDER.length : rank;
}

export default function ProductDetailView({
  product,
  collectionHandle,
  collectionTitle,
  relatedColors,
  initialVariantId,
}: ProductDetailViewProps) {
  const { addItem } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(() => {
    const initial = product.variants.find((variant) => variant.id === initialVariantId);
    if (initial) return initial.id;
    if (product.variants.length === 1) return product.variants[0].id;
    return "";
  });
  const [status, setStatus] = useState("");
  const [needsSize, setNeedsSize] = useState(false);
  const [zoomIndex, setZoomIndex] = useState<number | null>(null);
  const [zoomMode, setZoomMode] = useState<"single" | "all">("single");
  const [notifyMode, setNotifyMode] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySent, setNotifySent] = useState(false);

  const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId);
  const priceCents = selectedVariant?.priceCents ?? product.priceCents;

  const sizeLabels = useMemo(() => {
    const option = product.options.find((item) => item.name.toLowerCase() === "size");
    const values = option?.values.length
      ? option.values
      : [...new Set(product.variants.map((variant) => variant.option2).filter(Boolean))];
    return values
      .filter((value): value is string => Boolean(value))
      .sort((left, right) => sizeRank(left) - sizeRank(right) || left.localeCompare(right));
  }, [product.options, product.variants]);

  const selectedSize = selectedVariant?.option2 ?? "";
  const soldOut =
    !product.available || (selectedVariant ? !selectedVariant.available : false);
  const addLabel = soldOut
    ? "Sold Out"
    : selectedVariant
      ? "Add to Bag"
      : needsSize
        ? "Select A Size"
        : "Add to Bag";
  const canNotify =
    notifyMode && product.available && Boolean(selectedVariant && !selectedVariant.available);
  const buttonLabel = canNotify ? "Notify Me When Available" : addLabel;
  const buttonDisabled = soldOut && !canNotify;

  useEffect(() => {
    if (zoomIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setZoomIndex(null);
        setZoomMode("single");
        return;
      }
      if (zoomMode !== "single") return;
      if (event.key === "ArrowLeft") {
        setZoomIndex((index) =>
          index === null ? null : (index - 1 + product.images.length) % product.images.length,
        );
      }
      if (event.key === "ArrowRight") {
        setZoomIndex((index) =>
          index === null ? null : (index + 1) % product.images.length,
        );
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [product.images.length, zoomIndex, zoomMode]);

  useEffect(() => {
    if (!notifyOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setNotifyOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [notifyOpen]);

  function selectSize(label: string) {
    setStatus("");
    setNeedsSize(false);
    const variants = product.variants.filter((variant) => variant.option2 === label);
    const next = variants.find((variant) => variant.available) ?? variants[0];
    setNotifyMode(Boolean(product.available && next && !next.available));
    if (next) setSelectedVariantId(next.id);
    setNotifyOpen(false);
  }

  function addToBag() {
    if (!selectedVariant) {
      setNeedsSize(true);
      return;
    }
    if (!selectedVariant.available) return;

    addItem({
      handle: product.handle,
      title: product.title,
      price: formatPrice(selectedVariant.priceCents),
      color: selectedVariant.option1 ?? product.color,
      image: product.images[0]?.src ?? product.image,
      category: collectionTitle,
      size: selectedVariant.option2 ?? undefined,
      variantId: selectedVariant.id,
    });
    setStatus("Added to your bag.");
    window.dispatchEvent(new CustomEvent("sturdy:open-cart"));
  }

  function openZoom(index: number) {
    setZoomIndex(index);
    setZoomMode("single");
  }

  function closeZoom() {
    setZoomIndex(null);
    setZoomMode("single");
  }

  const zoomImage = zoomIndex === null ? null : product.images[zoomIndex];

  return (
    <main id="main" className="pdp-page">
      <form className="pdp-form" onSubmit={(event) => event.preventDefault()}>
        <div className="pdp-content">
          <div className="pdp-media">
            {product.images.map((image, index) => (
              <button
                className="pdp-media__slide"
                key={`${image.src}-${index}`}
                type="button"
                aria-label={`Zoom into image ${index + 1} of ${product.images.length}: ${image.alt || product.title}`}
                aria-haspopup="dialog"
                onClick={() => openZoom(index)}
                data-testid="pdp-image"
              >
                <img
                  src={image.src}
                  alt={image.alt || `${product.title} ${image.position}`}
                  width={900}
                  height={image.height || 1125}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                />
              </button>
            ))}
          </div>

          <div className="pdp-info-wrap">
            <div className="pdp-info" id="product-info">
              <div className="pdp-info__inner">
                <h1 className="pdp-title" data-testid="pdp-title">
                  {product.title}
                </h1>
                <div className="pdp-price" data-testid="pdp-price">
                  {formatPrice(priceCents)}
                </div>
                <div className="pdp-color" data-testid="pdp-color">
                  {selectedVariant?.option1 ?? product.color}
                </div>

                {relatedColors.length > 1 ? (
                  <div className="pdp-related-colors" aria-label="Related colors">
                    {relatedColors.map((related) => (
                      <Link
                        className="pdp-related-color"
                        data-selected={related.selected}
                        href={`/products/${related.handle}`}
                        key={related.handle}
                        aria-label={`${product.title} in ${related.color} color`}
                      >
                        <img src={related.image} alt="" width={90} height={113} />
                      </Link>
                    ))}
                  </div>
                ) : null}

                {sizeLabels.length > 0 ? (
                  <fieldset className="pdp-sizes">
                    <legend className="visually-hidden">Select Size</legend>
                    {sizeLabels.map((label) => {
                      const variants = product.variants.filter(
                        (variant) => variant.option2 === label,
                      );
                      const available = variants.some((variant) => variant.available);
                      return (
                        <label
                          className="pdp-size"
                          data-sold-out={!available}
                          data-selected={selectedSize === label}
                          key={label}
                        >
                          <input
                            className="visually-hidden"
                            type="radio"
                            name="size"
                            value={label}
                            checked={selectedSize === label}
                            onChange={() => selectSize(label)}
                          />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </fieldset>
                ) : null}

                <div className="pdp-atc-slot">
                  <button
                    className="button-solid pdp-atc"
                    type="button"
                    onClick={canNotify ? () => setNotifyOpen(true) : addToBag}
                    disabled={buttonDisabled}
                    data-testid="add-to-bag"
                  >
                    {buttonLabel}
                  </button>
                </div>
                {status ? (
                  <p className="pdp-status" role="status" data-testid="add-to-bag-status">
                    {status}
                  </p>
                ) : null}

                <div className="pdp-accordions">
                  <details className="pdp-accordion" open>
                    <summary>
                      <span>Product Details</span>
                      <span className="pdp-accordion__caret" aria-hidden="true">
                        ⌄
                      </span>
                    </summary>
                    <div
                      className="pdp-description"
                      dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                    />
                  </details>

                  <details className="pdp-accordion">
                    <summary>
                      <span>Size Guide</span>
                      <span className="pdp-accordion__caret" aria-hidden="true">
                        ⌄
                      </span>
                    </summary>
                    <div className="pdp-accordion__body">
                      <ProductSizeGuide handle={product.handle} />
                    </div>
                  </details>

                  <details className="pdp-accordion">
                    <summary>
                      <span>Shipping &amp; Returns</span>
                      <span className="pdp-accordion__caret" aria-hidden="true">
                        ⌄
                      </span>
                    </summary>
                    <div className="pdp-accordion__body pdp-shipping">
                      <p>
                        Orders placed on stussy.com are processed Monday–Friday and
                        shipped within 3-7 business days, excluding weekends and major
                        holidays.
                      </p>
                      <p>
                        Free standard shipping in the U.S. for all orders over $200.
                        Exclusions apply. See our{" "}
                        <Link href="/pages/shipping-returns">return guidelines</Link>.
                      </p>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {zoomIndex !== null ? (
        <div
          className="pdp-zoom"
          role="dialog"
          aria-modal="true"
          aria-label={
            zoomMode === "all"
              ? `All images, ${product.images.length} total`
              : `Image ${zoomIndex + 1} of ${product.images.length}`
          }
          data-testid="pdp-zoom"
          data-mode={zoomMode}
        >
          <div className="pdp-zoom__bar">
            <button
              className="pdp-zoom__mode"
              type="button"
              data-active={zoomMode === "single"}
              aria-current={zoomMode === "single" ? "true" : undefined}
              onClick={() => setZoomMode("single")}
              data-testid="pdp-zoom-back"
            >
              Back to Image
            </button>
            <button
              className="pdp-zoom__mode"
              type="button"
              data-active={zoomMode === "all"}
              aria-current={zoomMode === "all" ? "true" : undefined}
              onClick={() => setZoomMode("all")}
              data-testid="pdp-zoom-view-all"
            >
              View All
            </button>
            <button
              className="pdp-zoom__close"
              type="button"
              aria-label="Close gallery"
              onClick={closeZoom}
            >
              ×
            </button>
          </div>

          {zoomMode === "all" ? (
            <ul className="pdp-zoom__grid" data-testid="pdp-zoom-grid">
              {product.images.map((image, index) => (
                <li key={`${image.src}-${index}`}>
                  <button
                    className="pdp-zoom__thumb"
                    type="button"
                    aria-label={`View image ${index + 1} of ${product.images.length}: ${image.alt || product.title}`}
                    aria-current={index === zoomIndex ? "true" : undefined}
                    onClick={() => openZoom(index)}
                    data-testid="pdp-zoom-thumb"
                  >
                    <img src={image.src} alt="" width={100} height={125} loading="lazy" />
                  </button>
                </li>
              ))}
            </ul>
          ) : zoomImage ? (
            <div className="pdp-zoom__stage">
              <button
                className="pdp-zoom__nav pdp-zoom__nav--prev"
                type="button"
                aria-label="Previous slide"
                onClick={() =>
                  setZoomIndex((index) =>
                    index === null
                      ? null
                      : (index - 1 + product.images.length) % product.images.length,
                  )
                }
              />
              <img
                src={zoomImage.src}
                alt={zoomImage.alt || product.title}
                className="pdp-zoom__image"
              />
              <button
                className="pdp-zoom__nav pdp-zoom__nav--next"
                type="button"
                aria-label="Next slide"
                onClick={() =>
                  setZoomIndex((index) =>
                    index === null ? null : (index + 1) % product.images.length,
                  )
                }
              />
              <p className="pdp-zoom__count">
                {zoomIndex + 1} / {product.images.length}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {notifyOpen ? (
        <div
          className="pdp-notify"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdp-notify-title"
          data-testid="pdp-notify"
        >
          <button
            className="pdp-notify__close"
            type="button"
            aria-label="Close"
            onClick={() => {
              setNotifyOpen(false);
              setNotifySent(false);
              setNotifyEmail("");
            }}
          >
            ×
          </button>
          <div className="pdp-notify__card">
            {notifySent ? (
              <p className="pdp-notify__success" role="status" data-testid="notify-success">
                We will email you when this size is back in stock.
              </p>
            ) : (
              <>
                <h2 className="pdp-notify__title" id="pdp-notify-title">
                  Notify Me When Available
                </h2>
                <p className="pdp-notify__product">
                  {product.title}
                  {selectedVariant?.option2 ? ` / ${selectedVariant.option2}` : ""}
                </p>
                <form
                  className="pdp-notify__form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const key = "stussy.notifications.v1";
                    try {
                      const raw = localStorage.getItem(key);
                      const parsed: unknown = raw ? JSON.parse(raw) : [];
                      const records = Array.isArray(parsed) ? parsed : [];
                      records.push({
                        email: notifyEmail,
                        handle: product.handle,
                        variantId: selectedVariant?.id,
                        size: selectedVariant?.option2,
                        createdAt: new Date().toISOString(),
                      });
                      localStorage.setItem(key, JSON.stringify(records));
                    } catch {
                      // The notification is still acknowledged without local persistence.
                    }
                    setNotifySent(true);
                  }}
                >
                  <label className="visually-hidden" htmlFor="pdp-notify-email">
                    Email address
                  </label>
                  <input
                    className="pdp-notify__input"
                    id="pdp-notify-email"
                    type="email"
                    name="email"
                    placeholder="EMAIL *"
                    autoComplete="email"
                    required
                    autoFocus
                    suppressHydrationWarning
                    value={notifyEmail}
                    onChange={(event) => setNotifyEmail(event.target.value)}
                    data-testid="notify-email"
                  />
                  <button className="button-solid pdp-notify__submit" type="submit">
                    Notify Me
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
