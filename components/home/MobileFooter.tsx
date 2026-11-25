import Link from "next/link";
import NewsletterForm from "@/components/ui/NewsletterForm";

export default function MobileFooter() {
  return (
    <footer className="mobile-footer" role="contentinfo" data-testid="mobile-footer">
      <div className="mobile-footer__form">
        <NewsletterForm idPrefix="footer" />
      </div>
      <div className="mobile-footer__row">
        <span className="mobile-footer__copyright">© 2026 STÜSSY</span>
        <Link className="mobile-footer__admin" href="/admin">
          Admin
        </Link>
      </div>
    </footer>
  );
}
