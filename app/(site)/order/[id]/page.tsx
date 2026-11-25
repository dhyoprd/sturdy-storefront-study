import type { Metadata } from "next";
import OrderConfirmation from "@/components/checkout/OrderConfirmation";

export const metadata: Metadata = {
  title: "Order Confirmation | Stüssy",
  robots: { index: false, follow: false },
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main id="main" className="order-page">
      <OrderConfirmation orderId={id} />
    </main>
  );
}
