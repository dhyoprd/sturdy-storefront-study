import type { Metadata } from "next";
import CheckoutView from "@/components/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "Checkout | Stüssy",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <main id="main" className="checkout-page">
      <CheckoutView />
    </main>
  );
}
