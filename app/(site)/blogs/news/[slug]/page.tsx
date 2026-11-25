import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditorialGallery from "@/components/editorial/EditorialGallery";
import { getNewsBySlug } from "@/data/news";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getNewsBySlug(slug);
  return {
    title: item ? `${item.title || "News"} – Stüssy` : "News – Stüssy",
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const item = getNewsBySlug(slug);
  if (!item) notFound();

  return (
    <main id="main" className="news-page news-article-page">
      <article className="news-feed news-feed--article" data-testid="news-article">
        <div className="news-item__date">
          <span>{item.date}</span>
          <Link className="news-item__view" href="/blogs/news">
            Back to News
          </Link>
        </div>
        {item.title ? <h1 className="news-article__title">{item.title}</h1> : null}
        {item.caption ? <p className="news-item__caption">{item.caption}</p> : null}
        <EditorialGallery
          className="news-item__media"
          countClassName="news-item__gallery-count"
          images={item.images}
          fallback={item.image}
          alt={item.title || item.caption.split("\n")[0]}
          loading="eager"
          testId="news-article-gallery"
        />
      </article>
    </main>
  );
}
