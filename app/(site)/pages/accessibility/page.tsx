import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility | Stüssy",
};

export default function AccessibilityPage() {
  return (
    <main id="main" className="document-page">
      <div className="document-page__inner">
        <h1 className="document-page__title">Accessibility</h1>
        <div className="document-copy">
          <p>
            Stüssy is committed to digital accessibility, and to conforming to the Web
            Content Accessibility Guidelines (WCAG) 2.1, Level A and AA and complying with
            Americans with Disabilities Act (ADA) effective communication requirements,
            and other applicable regulations.
          </p>
          <p>
            To accomplish this, we have partnered with eSSENTIAL Accessibility to administer
            our accessibility program and oversee its governance. Their accessibility
            program evaluates our digital products on an ongoing basis in accordance with
            best practices and is supported by a diverse team of accessibility
            professionals, including users of assistive technologies. The platform,
            moreover, goes beyond minimum compliance requirements by making an assistive CX
            technology application available to customers who have trouble typing,
            gesturing, moving a mouse, or reading. The application is free to download and
            it incorporates tools such as mouse and keyboard replacements, voice
            recognition, speech enablement, hands-free/touch-free navigation, and more. We
            want to hear from you if you encounter any accessibility barriers on our digital
            properties.
          </p>
          <p>
            <strong>Stüssy &amp; Essential Accessibility Application Download</strong>
          </p>
          <p>
            <strong>Our Contact Information</strong>
            <br />
            Regardless of your location, any questions, comments, and requests regarding
            accessibility are welcome and should be addressed to our legal department at
            support@stussy.com.
          </p>
          <p>
            Communication can also be addressed to:
            <br />
            Attn: Stüssy Web Operations
            <br />
            Stüssy, Inc.
            <br />
            17426 Daimler Street
            <br />
            Irvine, CA 92614
          </p>
        </div>
      </div>
    </main>
  );
}
