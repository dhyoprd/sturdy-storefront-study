import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="not-found__code">404</p>
      <h1 className="not-found__title">Page not found</h1>
      <Link className="not-found__link" href="/">
        Return home
      </Link>
    </main>
  );
}
