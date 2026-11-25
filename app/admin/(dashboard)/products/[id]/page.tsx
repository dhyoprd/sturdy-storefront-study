import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteProductAction,
  updateProductAction,
} from "@/app/admin/(dashboard)/products/actions";
import { catalog } from "@/data/catalog";
import { formatPrice } from "@/lib/cart";
import { getProductById } from "@/lib/contentStore";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit Product | Stüssy Admin",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SearchParams;
}) {
  const { id } = await params;
  const productId = /^\d+$/.test(id) ? Number(id) : 0;
  const product =
    Number.isSafeInteger(productId) && productId > 0
      ? getProductById(productId)
      : null;

  if (!product) notFound();

  const query = await searchParams;
  const saved = Array.isArray(query.saved) ? query.saved[0] : query.saved;
  const error = Array.isArray(query.error) ? query.error[0] : query.error;
  const collectionTitle =
    catalog[product.collectionHandle]?.title ?? product.collectionHandle;

  return (
    <div className="admin-product-page">
      <header className="admin-page-head">
        <p className="admin-eyebrow">
          {collectionTitle} <span aria-hidden="true">/</span> Product {product.id}
        </p>
        <h1 className="admin-page-title">{product.title}</h1>
        <p className="admin-page-note">
          Saving updates the storefront collection page immediately. Leave the image
          blank to keep the current upload.
        </p>
      </header>

      {saved ? (
        <p
          className="admin-flash"
          data-flash="saved"
          data-testid="admin-flash"
          role="status"
        >
          {saved}
        </p>
      ) : null}

      {error ? (
        <p
          className="admin-flash admin-flash--error"
          data-flash="error"
          data-testid="admin-flash"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="admin-product-layout">
        <section className="admin-product-panel" aria-labelledby="product-details-title">
          <div className="admin-product-panel__head">
            <h2 className="admin-section-title" id="product-details-title">
              Product Details
            </h2>
            <p className="admin-product-panel__price">{formatPrice(product.priceCents)}</p>
          </div>

          <form
            className="admin-form"
            action={updateProductAction}
            data-testid="edit-product-form"
            noValidate
          >
            <input type="hidden" name="id" value={product.id} />

            <div className="admin-form__row">
              <label className="admin-field">
                <span className="admin-field__label">Title</span>
                <input
                  className="admin-field__input"
                  type="text"
                  name="title"
                  maxLength={160}
                  defaultValue={product.title}
                  autoComplete="off"
                  required
                  data-testid="edit-product-title"
                />
              </label>

              <label className="admin-field">
                <span className="admin-field__label">Handle</span>
                <input
                  className="admin-field__input"
                  type="text"
                  name="handle"
                  maxLength={160}
                  defaultValue={product.handle}
                  autoComplete="off"
                  required
                  data-testid="edit-product-handle"
                />
              </label>
            </div>

            <div className="admin-form__row">
              <label className="admin-field">
                <span className="admin-field__label">Collection</span>
                <select
                  className="admin-field__select"
                  name="collection"
                  defaultValue={product.collectionHandle}
                  required
                  data-testid="edit-product-collection"
                >
                  {Object.values(catalog).map((collection) => (
                    <option value={collection.handle} key={collection.handle}>
                      {collection.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-field">
                <span className="admin-field__label">Price (USD)</span>
                <input
                  className="admin-field__input"
                  type="number"
                  name="price"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  defaultValue={(product.priceCents / 100).toFixed(2)}
                  required
                  data-testid="edit-product-price"
                />
              </label>
            </div>

            <label className="admin-field">
              <span className="admin-field__label">Color</span>
              <input
                className="admin-field__input"
                type="text"
                name="color"
                maxLength={120}
                defaultValue={product.color}
                autoComplete="off"
                required
                data-testid="edit-product-color"
              />
            </label>

            <div className="admin-product-image">
              <div className="admin-product-image__field">
                <label className="admin-field">
                  <span className="admin-field__label">Replace Image (optional)</span>
                  <input
                    className="admin-field__file"
                    type="file"
                    name="image"
                    accept="image/jpeg,image/png,image/webp"
                    data-testid="edit-product-image"
                  />
                  <span className="admin-field__hint">
                    JPEG, PNG, or WebP. Maximum 5MB. Leave blank to keep the current
                    image.
                  </span>
                </label>
              </div>

              <figure className="admin-product-image__preview">
                <img
                  className="admin-media-preview"
                  src={product.image}
                  alt={`${product.title} preview`}
                  width={180}
                  height={225}
                  data-testid="edit-product-preview"
                />
                <figcaption className="admin-field__hint">Current image</figcaption>
              </figure>
            </div>

            <div className="admin-form__actions">
              <button
                className="button-solid"
                type="submit"
                data-testid="edit-product-save"
              >
                Save Product
              </button>
              <Link className="button-outline" href="/admin/products">
                Cancel
              </Link>
            </div>
          </form>
        </section>

        <aside className="admin-product-side" aria-labelledby="product-danger-title">
          <h2 className="admin-section-title" id="product-danger-title">
            Delete Product
          </h2>
          <p className="admin-page-note">
            Delete {product.title} from {collectionTitle}. This also removes it from the
            public collection page.
          </p>

          <form
            className="admin-product-delete"
            action={deleteProductAction}
            data-testid="edit-product-delete-form"
          >
            <input type="hidden" name="id" value={product.id} />
            <button
              className="button-outline admin-product-delete__button"
              type="submit"
              data-testid="edit-product-delete"
            >
              Delete Product
            </button>
          </form>

          <Link className="admin-link-button admin-product-side__back" href="/admin/products">
            Back to all products
          </Link>
        </aside>
      </div>
    </div>
  );
}
