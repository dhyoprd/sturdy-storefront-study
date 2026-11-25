"use client";

import Link from "next/link";
import { useRef, useState } from "react";
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
import { currencySymbol } from "@/lib/currency";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useDialogFocus } from "@/hooks/useDialogFocus";

type NavDrawerProps = {
  open: boolean;
  country: Country;
  onClose: () => void;
  onOpenCountry: () => void;
};

export default function NavDrawer({ open, country, onClose, onOpenCountry }: NavDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [supportOpen, setSupportOpen] = useState(false);

  useBodyScrollLock(open);
  useDialogFocus(open, panelRef, onClose);

  return (
    <div
      ref={panelRef}
      className="nav-drawer"
      data-open={open}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
      inert={!open}
      data-testid="nav-drawer"
    >
      <nav className="nav-drawer-nav" aria-label="Mobile">
        <ul className="nav-drawer-list">
          <li>
            <Link
              className="nav-drawer-link"
              href={newArrivals.href}
              onClick={onClose}
              data-testid="nav-link-new-arrivals"
            >
              {newArrivals.label}
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.handle}>
              <Link
                className="nav-drawer-link"
                href={category.href}
                onClick={onClose}
                data-testid={category.handle === "tees" ? "nav-link-tees" : undefined}
              >
                {category.label}
              </Link>
            </li>
          ))}
          <li className="nav-drawer-divider" aria-hidden="true" />
          <li>
            <Link className="nav-drawer-link" href={archive.href} onClick={onClose}>
              {archive.label}
            </Link>
          </li>
          <li>
            <Link className="nav-drawer-link" href={chapters.href} onClick={onClose}>
              {chapters.label}
            </Link>
          </li>
          <li>
            <button
              type="button"
              className="nav-drawer-link"
              aria-expanded={supportOpen}
              aria-controls="nav-drawer-support-menu"
              data-testid="nav-support-toggle"
              onClick={() => setSupportOpen((current) => !current)}
              style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
              {support.label}
              <svg
                width="7"
                height="5"
                viewBox="0 0 7.75 5.09"
                aria-hidden="true"
                focusable="false"
                style={{
                  marginTop: -1,
                  transform: supportOpen ? "rotate(180deg)" : undefined,
                  transition: "transform 150ms",
                }}
              >
                <polygon points="3.88 0 7.75 4.43 7 5.09 3.88 1.52 .75 5.09 0 4.43 3.88 0" />
              </svg>
            </button>
            <ul
              id="nav-drawer-support-menu"
              hidden={!supportOpen}
              style={{
                display: supportOpen ? "flex" : undefined,
                flexDirection: "column",
                gap: 8,
                paddingTop: 8,
                paddingLeft: 14,
              }}
            >
              {supportOpen ? (
                <li>
                  <Link className="nav-drawer-link" href={support.href} onClick={onClose}>
                    Customer Support
                  </Link>
                </li>
              ) : null}
            </ul>
          </li>
          <li>
            <Link
              className="nav-drawer-link"
              href="/pages/shipping-returns"
              onClick={onClose}
            >
              Shipping &amp; Returns
            </Link>
          </li>
          <li>
            <Link
              className="nav-drawer-link"
              href="/pages/holiday-shipping-guide"
              onClick={onClose}
            >
              Holiday Shipping Guide
            </Link>
          </li>
          <li>
            <Link className="nav-drawer-link" href="/pages/size-guide" onClick={onClose}>
              Size Guide
            </Link>
          </li>
          <li>
            <Link
              className="nav-drawer-link"
              href="/pages/eyegear-warranty"
              onClick={onClose}
            >
              Warranty
            </Link>
          </li>
          <li>
            <Link
              className="nav-drawer-link"
              href="/pages/accessibility"
              onClick={onClose}
            >
              Accessibility
            </Link>
          </li>
          <li className="nav-drawer-divider nav-drawer-divider--spaced" aria-hidden="true" />
          <li>
            <Link className="nav-drawer-link" href={account.href} onClick={onClose}>
              {account.label}
            </Link>
          </li>
          <li>
            <Link className="nav-drawer-link" href={legal.href} onClick={onClose}>
              {legal.label}
            </Link>
          </li>
          <li>
            <button
              type="button"
              className="nav-drawer-country"
              onClick={onOpenCountry}
              data-testid="nav-country"
            >
              {country.currency} / {currencySymbol(country.currency)}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
