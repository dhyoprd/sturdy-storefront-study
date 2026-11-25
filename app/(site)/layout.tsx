import type { ReactNode } from "react";
import CartProvider from "@/components/cart/CartProvider";
import SiteShell from "@/components/site/SiteShell";
import { getAnnouncement } from "@/lib/contentStore";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const announcement = getAnnouncement();

  return (
    <CartProvider>
      <SiteShell announcement={announcement}>{children}</SiteShell>
    </CartProvider>
  );
}
