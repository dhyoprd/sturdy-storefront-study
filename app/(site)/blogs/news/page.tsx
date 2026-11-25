import type { Metadata } from "next";
import Link from "next/link";
import EditorialGallery from "@/components/editorial/EditorialGallery";
import { news } from "@/data/news";

export const metadata: Metadata = {
  title: "News – Stüssy",
};

export default function NewsPage() {
  return (
    <main id="main" className="news-page">
      <h1 className="visually-hidden">News</h1>
      <div className="news-feed" data-testid="news-feed">
        {news.map((item) => (
          <article className="news-item" key={`${item.date}-${item.image}`}>
            <div className="news-item__date">
              <span>{item.date}</span>
              {item.slug ? (
                <Link
                  className="news-item__view"
                  href={`/blogs/news/${item.slug}`}
                  aria-label={`View Article - ${item.title || item.caption.split("\n")[0]}`}
                >
                  View Article
                </Link>
              ) : null}
            </div>

            <EditorialGallery
              className="news-item__media"
              countClassName="news-item__gallery-count"
              images={item.images}
              fallback={item.image}
              alt={item.title || item.caption.split("\n")[0]}
              testId={`news-gallery-${item.date}`}
            />

            {item.caption ? (
              <p className="news-item__caption">{item.caption}</p>
            ) : null}

            {item.cta ? (
              <Link className="news-item__cta" href={item.cta.href}>
                {item.cta.label}
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </main>
  );
}
