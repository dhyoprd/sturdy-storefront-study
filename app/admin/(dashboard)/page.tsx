import Link from "next/link";
import { getContentCounts } from "@/lib/contentStore";

export default function AdminDashboardPage() {
  const counts = getContentCounts();

  return (
    <div className="admin-dashboard">
      <header className="admin-page-head">
        <p className="admin-eyebrow">Overview</p>
        <h1 className="admin-page-title">Administration</h1>
        <p className="admin-page-note">
          Content changes publish immediately to this locally hosted storefront.
        </p>
      </header>

      <section className="admin-dashboard__grid" aria-label="Store content">
        <article className="admin-dashboard__card">
          <p className="admin-dashboard__label">Products</p>
          <p className="admin-dashboard__value" data-testid="admin-product-count">
            {counts.products}
          </p>
          <Link className="admin-dashboard__link" href="/admin/products">
            Manage Products
          </Link>
        </article>

        <article className="admin-dashboard__card">
          <p className="admin-dashboard__label">Hero Slides</p>
          <p className="admin-dashboard__value" data-testid="admin-hero-count">
            {counts.heroes}
          </p>
          <Link className="admin-dashboard__link" href="/admin/homepage">
            Manage Homepage
          </Link>
        </article>

        <article className="admin-dashboard__card">
          <p className="admin-dashboard__label">Orders</p>
          <p className="admin-dashboard__value admin-dashboard__value--small">Local</p>
          <Link className="admin-dashboard__link" href="/admin/orders">
            View Local Orders
          </Link>
        </article>
      </section>

      <section className="admin-dashboard__section">
        <h2 className="admin-section-title">Publishing</h2>
        <p className="admin-page-note">
          The homepage hero, announcement, and collection products are served from the
          local SQLite database. Orders remain device-local until payments are added.
        </p>
      </section>
    </div>
  );
}
