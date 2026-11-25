import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Returns | Stüssy",
};

export default function ShippingReturnsPage() {
  return (
    <main id="main" className="document-page">
      <div className="document-page__inner">
        <h1 className="visually-hidden">Shipping &amp; Returns</h1>

        <section className="document-section">
          <h2 className="document-page__section-title">Shipping &amp; Handling</h2>
          <div className="document-copy">
            <p>
              <strong>ORDER PROCESSING</strong>
              <br />
              Orders placed on stussy.com are processed Monday–Friday and shipped within
              3-7 business days. Excluding the weekends and major holidays. Once your order
              is processed and shipped, you will receive an email notification with your
              tracking information.
              <br />
              <em>
                *Disclaimer: Cancelation and address modification requests for orders
                placed on Friday-Sunday will not be accepted.
              </em>
            </p>
            <p>
              <strong>U.S. SHIPPING</strong>
              <br />
              We offer the following domestic shipping rates in the U.S.:
              <br />
              Standard (3-7 Business days) – $9
              <br />
              Express (2-3 Business days) – $15
            </p>
            <p>
              Free standard shipping in the U.S. for all orders over $200. Exclusions
              apply.
              <br />
              *Shipping timelines begin once the order is processed by our team and handed
              off to the courier.
            </p>
            <p>
              Exclusions apply for shipping to Alaska, Hawaii, Puerto Rico, Virgin Islands,
              APO, FPO, and P.O. boxes in the U.S.:
              <br />
              Standard – $15
              <br />
              Express – $25 (excluding Puerto Rico, Virgin Islands, APO, FPO, and P.O.
              boxes)
            </p>
            <p>
              <strong>INTERNATIONAL SHIPPING</strong>
              <br />
              Stussy.com offers the following shipping rate for orders from Brazil, Chile,
              Costa Rica, Dominican Republic, Ecuador, El Salvador, Guatemala, Honduras,
              Hong Kong, Indonesia, Jamaica, Macau, Malaysia, Mexico, Panama, Peru,
              Philippines, Singapore, Taiwan, Thailand, and Vietnam:
              <br />
              DHL Express – $30
            </p>
            <p>
              For Argentina, Colombia, and Uruguay:
              <br />
              DHL Express – $35
            </p>
            <p>
              Free standard shipping is available for orders over $200 from Chile, Macau,
              Malaysia, Mexico, Philippines, and Singapore. Exclusions apply.
            </p>
            <p>
              If you receive an email from DHL or your local customs agency requesting
              additional payment, please contact support@stussy.com or Live Chat.
            </p>
            <p>
              <strong>INTERNATIONAL DUTIES &amp; TAXES</strong>
              <br />
              International orders will be subject to:
            </p>
            <ul className="document-list">
              <li>
                Terms &amp; Conditions and Privacy Policy via Global-E. This will be
                presented to you at checkout.
              </li>
              <li>Global-E will act as the seller of record for these orders.</li>
            </ul>
            <p>Payment of duties at checkout through Global-E covers the following:</p>
            <ul className="document-list">
              <li>The stated fees at checkout include customs duties and taxes.</li>
              <li>These duties and taxes are non-refundable.</li>
            </ul>
          </div>
        </section>

        <section className="document-section">
          <h2 className="document-page__section-title">Return Guidelines</h2>
          <div className="document-copy">
            <p>
              <strong>RETURN POLICY</strong>
            </p>
            <ul className="document-list">
              <li>
                You have up to 7 days upon receiving the shipment to return items
                purchased on stussy.com.
              </li>
              <li>Orders must be returned by mail only.</li>
              <li>
                Returned item(s) must be in new and unused condition with the original
                tags still attached.
              </li>
              <li>
                Undergarments and fragrances cannot be returned due to our hygiene policy.
              </li>
              <li>Once your return is delivered, allow 3-5 business days for inspection.</li>
              <li>
                After inspection, a refund to your original payment method will be
                processed in 24-48 hours.
              </li>
              <li>Shipping charges are non-refundable.</li>
              <li>
                We do not accept returns or exchanges for Stüssy products not purchased
                from stussy.com.
              </li>
            </ul>
            <p>
              <strong>VISIT OUR SELF-SERVICE RETURN PORTALS BELOW:</strong>
            </p>
            <ul className="document-list">
              <li>Returns Portal HERE</li>
              <li>
                By using our returns portal, all return submissions are reviewed for
                approval.
              </li>
              <li>
                Domestic and international returns are charged a flat rate when you use
                our pre-paid returns shipping label.
              </li>
            </ul>
            <p>
              <strong>DISCLAIMER</strong>
              <br />
              Frequent returns or unusual patterns/activities will be flagged in our
              system. If we notice that our return policy is being abused, we reserve the
              right to cancel or refuse future orders and cancellation requests. Please
              review our TERMS OF USE. Returns we receive that do not use the provided
              return shipment label will be refused. Any alterations to the label will not
              be accepted.
            </p>
            <p>
              <strong>EXCHANGES</strong>
              <br />
              Stussy.com does not offer exchanges. We ask that you return the product for a
              full refund and place a new order for the preferred item(s).
            </p>
            <p>
              <strong>SPECIAL COLLABORATIONS</strong>
              <br />
              All sales are final for any purchases on Nike, limited edition, and/or
              special collaboration products.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
