import type { Metadata } from "next";
import legal from "@/data/legal.json";

export const metadata: Metadata = {
  title: "Legal | Stüssy",
};

export default function LegalPage() {
  return (
    <main id="main" className="document-page">
      <div className="document-page__inner">
        <h1 className="document-page__title">Legal</h1>
        <div className="document-accordions" data-testid="legal-sections">
          {legal.items.map((item) => (
            <details className="document-accordion" key={item.title}>
              <summary className="document-accordion__summary">{item.title}</summary>
              <p className="document-accordion__body">{item.body}</p>
            </details>
          ))}
        </div>
      </div>
    </main>
  );
}
