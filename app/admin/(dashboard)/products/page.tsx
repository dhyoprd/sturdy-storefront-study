import type { Metadata } from "next";
import Link from "next/link";
import {
  createProductAction,
  deleteProductAction,
} from "@/app/admin/(dashboard)/products/actions";
import { catalog } from "@/data/catalog";
import { formatPrice } from "@/lib/cart";
import { getAdminProductPage } from "@/lib/contentStore";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products | Stüssy Admin",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function pageHref(page: number, query: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (query) params.set("q", query);
  const suffix = params.toString();
  return suffix ? `/admin/products?${suffix}` : "/admin/products";
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const saved = first(params.saved);
  const error = first(params.error);
  const rawPage = Number(first(params.page) ?? "1");
  const query = first(params.q) ?? "";
  const catalogPage = getAdminProductPage(Number.isFinite(rawPage) ? rawPage : 1, query);
  const rangeStart = catalogPage.total === 0 ? 0 : (catalogPage.page - 1) * catalogPage.pageSize + 1;
  const rangeEnd = Math.min(
    catalogPage.total,
    catalogPage.page * catalogPage.pageSize,
  );

  return (
    <div className="admin-products-page">
      <header className="admin-page-head">
        <p className="admin-eyebrow">Catalog</p>
        <h1 className="admin-page-title">Products</h1>
        <p className="admin-page-note">
          Add and edit collection products. Images are uploaded to this machine and
          published to the storefront immediately.
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

      <div className="admin-products-layout">
        <section className="admin-products-list" aria-label="Catalog products">
          <div className="admin-products-group__head">
            <h2 className="admin-products-group__title">All Products</h2>
            <p className="admin-products-group__count">
              {catalogPage.total} {catalogPage.total === 1 ? "product" : "products"}
            </p>
          </div>

          <form className="admin-products-search" method="get" action="/admin/products">
            <label className="visually-hidden" htmlFor="admin-product-search">
              Search products
            </label>
            <input
              id="admin-product-search"
              className="admin-field__input"
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search by title or handle"
              data-testid="admin-product-search"
            />
            <button className="admin-link-button" type="submit">
              Search
            </button>
            {query ? (
              <Link className="admin-link-button" href="/admin/products">
                Clear
              </Link>
            ) : null}
          </form>

          {catalogPage.products.length === 0 ? (
            <p className="admin-products-empty" data-testid="products-empty">
              No products match this view.
            </p>
          ) : (
            <ul className="admin-products-rows">
              {catalogPage.products.map((product) => (
                <li
                  className="admin-products-row"
                  key={product.id}
                  data-testid="product-row"
                  data-collection={product.collectionHandle}
                  data-product-id={product.id}
                >
                  <img
                    className="admin-products-row__thumb"
                    src={product.image}
                    alt={`${product.title} thumbnail`}
                    width={64}
                    height={80}
                    loading="lazy"
                  />

                  <div className="admin-products-row__body">
                    <div className="admin-products-row__heading">
                      <p className="admin-products-row__title">{product.title}</p>
                      <p className="admin-products-row__price">
                        {formatPrice(product.priceCents)}
                      </p>
                    </div>
                    <p className="admin-products-row__meta">
                      {catalog[product.collectionHandle]?.title ??
                        product.collectionHandle}{" "}
                      <span aria-hidden="true">/</span> {product.color}
                    </p>

                    <div className="admin-products-row__actions">
                      <Link
                        className="admin-link-button"
                        href={`/admin/products/${product.id}`}
                        data-testid="product-edit"
                      >
                        Edit
                      </Link>

                      <form
                        className="admin-inline-form"
                        action={deleteProductAction}
                        data-testid="product-delete-form"
                      >
                        <input type="hidden" name="id" value={product.id} />
                        <button
                          className="admin-link-button admin-danger"
                          type="submit"
                          data-testid="product-delete"
                          aria-label={`Delete ${product.title}`}
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <nav className="admin-pagination" aria-label="Catalog pages">
            {catalogPage.page > 1 ? (
              <Link
                className="admin-link-button"
                href={pageHref(catalogPage.page - 1, query)}
              >
                Previous
              </Link>
            ) : (
              <span className="admin-pagination__disabled">Previous</span>
            )}
            <span>
              {rangeStart}–{rangeEnd} of {catalogPage.total} · Page {catalogPage.page} of{" "}
              {catalogPage.pageCount}
            </span>
            {catalogPage.page < catalogPage.pageCount ? (
              <Link
                className="admin-link-button"
                href={pageHref(catalogPage.page + 1, query)}
              >
                Next
              </Link>
            ) : (
              <span className="admin-pagination__disabled">Next</span>
            )}
          </nav>
        </section>

        <aside className="admin-products-create" aria-labelledby="products-create-title">
          <h2 className="admin-products-create__title" id="products-create-title">
            Add Product
          </h2>
          <p className="admin-products-create__note">
            The handle is generated from the title when left blank.
          </p>

          <form
            className="admin-form"
            action={createProductAction}
            data-testid="product-create-form"
            noValidate
          >
            <label className="admin-field">
              <span className="admin-field__label">Title</span>
              <input
                className="admin-field__input"
                type="text"
                name="title"
                maxLength={160}
                required
                autoComplete="off"
                data-testid="product-title"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Handle (optional)</span>
              <input
                className="admin-field__input"
                type="text"
                name="handle"
                maxLength={160}
                autoComplete="off"
                placeholder="Derived from title"
                data-testid="product-handle"
              />
            </label>

            <label className="admin-field">
              <span className="admin-field__label">Collection</span>
              <select
                className="admin-field__select"
                name="collection"
                required
                defaultValue=""
                data-testid="product-collection"
              >
                <option value="">Select collection</option>
                {Object.values(catalog).map((collection) => (
                  <option value={collection.handle} key={collection.handle}>
                    {collection.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="admin-form__row">
              <label className="admin-field">
                <span className="admin-field__label">Price (USD)</span>
                <input
                  className="admin-field__input"
                  type="number"
                  name="price"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="45.00"
                  required
                  data-testid="product-price"
                />
              </label>

              <label className="admin-field">
                <span className="admin-field__label">Color</span>
                <input
                  className="admin-field__input"
                  type="text"
                  name="color"
                  maxLength={120}
                  autoComplete="off"
                  required
                  data-testid="product-color"
                />
              </label>
            </div>

            <label className="admin-field">
              <span className="admin-field__label">Image</span>
              <input
                className="admin-field__file"
                type="file"
                name="image"
                accept="image/jpeg,image/png,image/webp"
                required
                data-testid="product-image"
              />
              <span className="admin-field__hint">
                JPEG, PNG, or WebP. Maximum 5MB.
              </span>
            </label>

            <div className="admin-form__actions">
              <button className="button-solid" type="submit" data-testid="product-submit">
                Add Product
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
