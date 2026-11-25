import type { Metadata } from "next";
import support from "@/data/support.json";

export const metadata: Metadata = {
  title: "Customer Support | Stüssy",
};

export default function SupportPage() {
  return (
    <main id="main" className="document-page">
      <div className="document-page__inner">
        <h1 className="document-page__title">Contact Us</h1>

        <div className="support-contact">
          <div className="support-contact__block">
            <h2 className="support-contact__label">Contact</h2>
            <p className="support-contact__value">{support.email}</p>
          </div>
          <div className="support-contact__block">
            <h2 className="support-contact__label">Customer Support Hours</h2>
            {support.hours.map((line) => (
              <p className="support-contact__value" key={line}>
                {line}
              </p>
            ))}
          </div>
          <div className="support-contact__block">
            <h2 className="support-contact__label">Social</h2>
            <p className="support-contact__value">{support.socials.join(" / ")}</p>
          </div>
        </div>

        <section aria-labelledby="faq-title">
          <h2 id="faq-title" className="document-page__section-title">
            Frequently Asked Questions
          </h2>
          <div className="document-accordions" data-testid="support-faqs">
            {support.faqs.map((faq) => (
              <details className="document-accordion" key={faq.question}>
                <summary className="document-accordion__summary">{faq.question}</summary>
                <p className="document-accordion__body">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
