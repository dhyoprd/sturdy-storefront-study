import Link from "next/link";
import type { HeroSlide } from "@/lib/content";

const FALLBACK_HERO: HeroSlide = {
  id: 0,
  image: "/images/homepage-hero.jpg",
  href: "/collections/new-arrivals",
  alt: "Stüssy Holiday 2026 campaign",
  active: true,
  position: 0,
};

export default function Hero({ hero }: { hero: HeroSlide | null }) {
  const slide = hero ?? FALLBACK_HERO;

  return (
    <main id="main" className="home-main">
      <section className="hero" aria-label="New Arrivals">
        <Link
          className="hero__link"
          href={slide.href || "/collections/new-arrivals"}
          aria-label="Shop New Arrivals"
          data-testid="hero-link"
        >
          <img
            className="hero__image"
            src={slide.image}
            alt={slide.alt}
            data-testid="hero-image"
          />
        </Link>
      </section>
    </main>
  );
}
