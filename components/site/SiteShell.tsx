"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import SiteHeader from "@/components/home/SiteHeader";
import MobileFooter from "@/components/home/MobileFooter";
import SearchOverlay from "@/components/overlays/SearchOverlay";
import CartDrawer from "@/components/overlays/CartDrawer";
import NavDrawer from "@/components/overlays/NavDrawer";
import NewsletterModal from "@/components/overlays/NewsletterModal";
import CountryModal from "@/components/overlays/CountryModal";
import { useScrolled } from "@/hooks/useScrolled";
import { countries } from "@/data/countries";
import type { AnnouncementConfig } from "@/lib/content";
import type { OpenPanel } from "@/lib/types";

export default function SiteShell({
  announcement,
  children,
}: {
  announcement: AnnouncementConfig;
  children: ReactNode;
}) {
  const [panel, setPanel] = useState<OpenPanel>(null);
  const [query, setQuery] = useState("");
  const [announcementHidden, setAnnouncementHidden] = useState(false);
  const [countryCode, setCountryCode] = useState("US");
  const scrolled = useScrolled();
  const pathname = usePathname();
  const country = countries.find((item) => item.code === countryCode) ?? countries[0];

  const close = useCallback(() => setPanel(null), []);

  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
    if (sessionStorage.getItem("announcementHidden") === "true") {
      setAnnouncementHidden(true);
    }

    return () => {
      delete document.documentElement.dataset.hydrated;
    };
  }, []);

  useEffect(() => {
    setPanel(null);
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    const openCart = () => setPanel("cart");
    window.addEventListener("sturdy:open-cart", openCart);
    return () => window.removeEventListener("sturdy:open-cart", openCart);
  }, []);

  const hideAnnouncement = useCallback(() => {
    setAnnouncementHidden(true);
    sessionStorage.setItem("announcementHidden", "true");
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <SiteHeader
        scrolled={scrolled}
        searchOpen={panel === "search"}
        menuOpen={panel === "nav"}
        query={query}
        announcement={announcement}
        announcementHidden={announcementHidden}
        country={country}
        onQueryChange={setQuery}
        onOpenSearch={() => setPanel("search")}
        onCloseSearch={close}
        onOpenCart={() => setPanel("cart")}
        onOpenMenu={() => setPanel("nav")}
        onCloseMenu={close}
        onOpenNewsletter={() => setPanel("newsletter")}
        onOpenCountry={() => setPanel("country")}
        onHideAnnouncement={hideAnnouncement}
      />

      {children}
      <MobileFooter />

      <SearchOverlay
        open={panel === "search"}
        query={query}
        onQueryChange={setQuery}
        onClose={close}
      />
      <CartDrawer open={panel === "cart"} onClose={close} />
      <NavDrawer
        open={panel === "nav"}
        country={country}
        onClose={close}
        onOpenCountry={() => setPanel("country")}
      />
      <NewsletterModal open={panel === "newsletter"} onClose={close} />
      <CountryModal
        open={panel === "country"}
        country={country}
        onClose={close}
        onSave={(code) => {
          setCountryCode(code);
          close();
        }}
      />
    </>
  );
}
