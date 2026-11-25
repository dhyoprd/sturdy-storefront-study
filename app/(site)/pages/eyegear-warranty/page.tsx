import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eyegear Warranty | Stüssy",
};

export default function EyegearWarrantyPage() {
  return (
    <main id="main" className="document-page">
      <div className="document-page__inner">
        <h1 className="document-page__title">Eyegear Warranty</h1>
        <div className="document-copy">
          <p>
            <strong>Stussy Eyewear One-Year Warranty Policy</strong>
          </p>
          <p>
            <strong>Coverage Period:</strong>
            <br />
            1 year from Date of Purchase with Proof of Purchase. Stussy offers a one-year
            limited warranty from the date of purchase for its eyewear products. This
            limited warranty extends only to the original consumer purchaser and can’t be
            assigned or transferred to anyone else. This policy is effective for eyewear
            products purchased on or after March 21, 2025.
          </p>
          <p>
            <strong>What does the warranty cover?</strong>
            <br />
            This warranty covers defects in materials or workmanship for frames and lenses
            purchased from Stussy.com or Stussy Chapter Stores located in North America.
          </p>
          <p>
            <strong>What does this warranty not cover?</strong>
            <br />
            This warranty does not cover issues caused by: (i) commercial use, (ii) normal
            wear and tear (including scratches), or (iii) misuse, accidents, neglect, abuse,
            alterations, unusual stress, modifications, improper or unauthorized repairs,
            or improper storage. Any of the latter actions will void your warranty.
          </p>
          <p>
            <strong>How to start your warranty claim?</strong>
            <br />
            To initiate your claim, please email warranty@stussy.com with a brief
            description of the affected eyewear, proof of purchase (your order email
            confirmation or store receipt), and images and video of the affected area. Our
            eyewear specialist will review your claim and provide further instruction.
          </p>
        </div>
      </div>
    </main>
  );
}
