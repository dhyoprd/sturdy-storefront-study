"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import {
  account,
  archive,
  categories,
  chapters,
  legal,
  newArrivals,
  support,
} from "@/data/site";
import type { Country } from "@/data/countries";
import type { AnnouncementConfig } from "@/lib/content";
import { currencySymbol } from "@/lib/currency";

type SiteHeaderProps = {
  scrolled: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  query: string;
  announcement: AnnouncementConfig;
  announcementHidden: boolean;
  country: Country;
  onQueryChange: (value: string) => void;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onOpenCart: () => void;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onOpenNewsletter: () => void;
  onOpenCountry: () => void;
  onHideAnnouncement: () => void;
};


const utilityLinks = [archive, chapters, support, account];

export default function SiteHeader({
  scrolled,
  searchOpen,
  menuOpen,
  query,
  announcement,
  announcementHidden,
  country,
  onQueryChange,
  onOpenSearch,
  onCloseSearch,
  onOpenCart,
  onOpenMenu,
  onCloseMenu,
  onOpenNewsletter,
  onOpenCountry,
  onHideAnnouncement,
}: SiteHeaderProps) {

  const { count } = useCart();
  return (
    <>
      <header
        className="desktop-header"
        data-search-open={searchOpen}
        data-testid="desktop-header"
      >
        <div className="site-rail">
          <Link className="rail-logo" href="/" aria-label="Stüssy homepage">
            <img src="/stussy-logo.svg" alt="Stüssy" width={120} height={85} />
          </Link>

          <nav className="rail-nav" aria-label="Site Menu">
            <div className="rail-nav__top">
              <div className="rail-nav__new">
                <Link
                  className="rail-nav__item rail-nav__new-link"
                  href={newArrivals.href}
                  data-testid="rail-new-arrivals"
                >
                  New Arrivals
                </Link>
                <ul className="rail-nav__categories">
                  {categories.map((category) => (
                    <li key={category.handle}>
                      <Link className="rail-nav__item" href={category.href}>
                        {category.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="rail-divider" aria-hidden="true">
                  <span />
                </div>
              </div>

              {utilityLinks.map((link) => (
                <Link className="rail-nav__item" href={link.href} key={link.label}>
                  {link.label}
                </Link>
              ))}

              <button className="rail-nav__item rail-nav__button" onClick={onOpenNewsletter}>
                Newsletter
              </button>
              <Link className="rail-nav__item" href={legal.href}>
                Legal
              </Link>
              <Link className="rail-nav__item" href="/admin">
                Admin
              </Link>
              <button
                className="rail-nav__item rail-nav__button"
                onClick={onOpenCountry}
                data-testid="country-open"
              >
                {country.code} / {currencySymbol(country.currency)}
              </button>
            </div>

            <div className="rail-nav__bottom">
              <span className="rail-nav__copyright">© 2026 STÜSSY</span>
            </div>
          </nav>
        </div>

        <div className="announcement-slot">
          {announcement.enabled && !announcementHidden && (
            <div
              className="announcement"
              data-collapsed={scrolled}
              data-testid="announcement"
            >
              <Link
                className="announcement__link"
                href={announcement.href}
                data-testid="announcement-link"
              >
                {announcement.label}
              </Link>
              <span className="announcement__separator" aria-hidden="true">
                -
              </span>
              <button
                className="announcement__hide"
                onClick={onHideAnnouncement}
                data-testid="announcement-hide"
              >
                Hide
              </button>
            </div>
          )}
        </div>

        {searchOpen && (
          <div className="desktop-search-bar">
            <label className="visually-hidden" htmlFor="desktop-search-input">
              Search
            </label>
            <input
              id="desktop-search-input"
              data-testid="desktop-search-input"
              type="search"
              name="q"
              value={query}
              placeholder="SEARCH HERE"
              autoComplete="off"
              autoFocus
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </div>
        )}

        <div className="header-actions">
          <button
            className="header-action"
            data-active={searchOpen}
            onClick={searchOpen ? onCloseSearch : onOpenSearch}
            data-testid="desktop-search-toggle"
          >
            {searchOpen ? "Close" : "Search"}
          </button>
          <button
            className="header-action"
            onClick={onOpenCart}
            data-testid="desktop-bag-open"
          >
            Bag
            {count > 0 && (
              <span className="bag-count" data-testid="desktop-bag-count">
                {" "}
                ({count})
              </span>
            )}
          </button>
        </div>
      </header>

      <MobileHeader
        count={count}
        searchOpen={searchOpen}
        menuOpen={menuOpen}
        onOpenSearch={onOpenSearch}
        onCloseSearch={onCloseSearch}
        onOpenCart={onOpenCart}
        onOpenMenu={onOpenMenu}
        onCloseMenu={onCloseMenu}
      />
    </>
  );
}

type MobileHeaderProps = {
  count: number;
  searchOpen: boolean;
  menuOpen: boolean;
  onOpenSearch: () => void;
  onCloseSearch: () => void;
  onOpenCart: () => void;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
};

function MobileHeader({
  count,
  searchOpen,
  menuOpen,
  onOpenSearch,
  onCloseSearch,
  onOpenCart,
  onOpenMenu,
  onCloseMenu,
}: MobileHeaderProps) {
  return (
    <header className="mobile-header" data-testid="mobile-header">
      <Link className="mobile-logo" href="/" aria-label="Stüssy homepage">
        <img src="/stussy-logo.svg" alt="Stüssy" width={100} height={71} />
      </Link>
      <div className="mobile-actions">
        <button
          className="mobile-action"
          data-active={searchOpen}
          onClick={searchOpen ? onCloseSearch : onOpenSearch}
          data-testid="mobile-search-toggle"
        >
          {searchOpen ? "Close" : "Search"}
        </button>
        <button
          className="mobile-action"
          onClick={onOpenCart}
          data-testid="mobile-bag-open"
        >
          Bag
          {count > 0 && (
            <span className="bag-count" data-testid="mobile-bag-count">
              {" "}
              ({count})
            </span>
          )}
        </button>
        <button
          className="mobile-action"
          data-active={menuOpen}
          onClick={menuOpen ? onCloseMenu : onOpenMenu}
          data-testid="mobile-menu-toggle"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>
    </header>
  );
}
