import type { ReactNode } from "react";
import Link from "next/link";
import { logoutAction } from "@/app/admin/auth-actions";
import type { AdminUser } from "@/lib/auth";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/homepage", label: "Homepage" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Local Orders" },
];

export default function AdminShell({
  admin,
  children,
}: {
  admin: AdminUser;
  children: ReactNode;
}) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <Link href="/" aria-label="Stüssy storefront">
            <img src="/stussy-logo.svg" alt="Stüssy" width={92} height={65} />
          </Link>
          <span>Admin</span>
        </div>

        <nav className="admin-nav" aria-label="Administration">
          {links.map((link) => (
            <Link className="admin-nav__link" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <p className="admin-sidebar__account" data-testid="admin-current-user">
            {admin.email}
          </p>
          <Link className="admin-sidebar__site-link" href="/">
            View Site
          </Link>
          <form action={logoutAction}>
            <button className="admin-logout" type="submit" data-testid="admin-logout">
              Log Out
            </button>
          </form>
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}
