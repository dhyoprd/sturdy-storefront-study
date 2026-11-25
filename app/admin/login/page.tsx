import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/admin/auth-actions";
import { getCurrentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Login | Stüssy",
  robots: { index: false, follow: false },
};

const errorMessages: Record<string, string> = {
  missing: "Enter your email and password.",
  invalid: "Invalid email or password.",
  rate_limited: "Too many attempts. Try again in 15 minutes.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  const { error } = await searchParams;
  const message = error ? errorMessages[error] ?? "Sign-in failed." : null;

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <Link className="admin-login-brand" href="/" aria-label="Back to Stüssy">
          <img src="/stussy-logo.svg" alt="Stüssy" width={100} height={71} />
        </Link>

        <p className="admin-login-eyebrow">Local Admin</p>
        <h1 className="admin-login-title">Sign In</h1>
        <p className="admin-login-note">
          Manage homepage content and catalog products for this local storefront.
        </p>

        {message ? (
          <p className="admin-flash admin-flash--error" role="alert" data-testid="admin-login-error">
            {message}
          </p>
        ) : null}

        <form
          className="admin-form admin-login-form"
          action={loginAction}
          data-testid="admin-login-form"
        >
          <label className="admin-field">
            <span className="admin-field__label">Email</span>
            <input
              className="admin-field__input"
              type="email"
              name="email"
              autoComplete="username"
              required
              suppressHydrationWarning
              data-testid="admin-email"
            />
          </label>
          <label className="admin-field">
            <span className="admin-field__label">Password</span>
            <input
              className="admin-field__input"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              suppressHydrationWarning
              data-testid="admin-password"
            />
          </label>
          <button className="button-solid" type="submit" data-testid="admin-login-submit">
            Sign In
          </button>
        </form>

        <Link className="admin-login-back" href="/">
          Back to site
        </Link>
      </div>
    </main>
  );
}
