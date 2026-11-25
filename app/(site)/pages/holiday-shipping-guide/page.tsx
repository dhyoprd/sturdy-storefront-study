import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Holiday Shipping Guide | Stüssy",
};

const countries = [
  "AE", "AR", "BH", "BR", "CO", "CR", "DO", "EC", "EG", "GT", "HK", "HU", "ID", "IL",
  "JM", "KW", "KZ", "LB", "MN", "MY", "MX", "NG", "PA", "PH", "PK", "QA", "RU", "SA",
  "SG", "SV", "TR", "TW", "UA", "UY", "VE", "VN", "ZA",
];

export default function HolidayShippingPage() {
  return (
    <main id="main" className="document-page">
      <div className="document-page__inner">
        <h1 className="document-page__title">Holiday Shipping Guide</h1>

        <div className="document-copy">
          <section>
            <h2 className="document-page__section-title">Holiday Shipping</h2>
            <p>
              To have your orders shipped in time for the Holidays, we recommend placing
              your order by 12/11/2026.
            </p>
            <p>
              *Please note that transit times are subject to change based on the
              carrier&rsquo;s ability/capacity to transport packages and unforeseeable
              weather conditions.
            </p>
          </section>

          <section>
            <h2 className="document-page__section-title">
              International Countries Supported (Shipped Via DHL Express)
            </h2>
            <p className="document-copy__countries">{countries.join(", ")}</p>
          </section>

          <section>
            <h2 className="document-page__section-title">
              Customer Support Will Be Closed On The Following Days
            </h2>
            <p>11/26-11/29</p>
            <p>12/25</p>
          </section>

          <section>
            <h2 className="document-page__section-title">Holiday Return Policy</h2>
            <p>Holiday returns are extended 21 days for orders placed after 11/23/2026.</p>
            <p>*Please note we do not offer exchanges or gift receipts.</p>
            <p>
              If you have any questions please visit our{" "}
              <Link href="/pages/customer-support" className="document-link">
                FAQ
              </Link>
              , or contact us at support@stussy.com. Customer Support hours are
              Monday-Friday 8am-4pm (PST).
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
