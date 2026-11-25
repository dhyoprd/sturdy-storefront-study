import type { Metadata } from "next";
import Link from "next/link";
import { chapterIndex, chapters } from "@/data/editorial";

export const metadata: Metadata = {
  title: "Stüssy Chapter Stores – Stüssy",
};

export default function ChaptersPage() {
  return (
    <main id="main" className="chapters-page">
      <div className="chapters-page__content">
        <Link className="chapters-page__title" href="/blogs/chapters">
          Chapter Directory
        </Link>

        <div className="chapter-grid" data-testid="chapter-grid">
          {chapters.map((chapter) => {
            const href = `/blogs/chapters/${chapter.slug}`;
            return (
              <article className="chapter-card" key={chapter.name}>
                <Link className="chapter-card__media" href={href}>
                  <img src={chapter.image} alt={chapter.name} loading="lazy" />
                </Link>
                <Link className="chapter-card__name" href={href}>
                  {chapter.name} {chapter.address}
                </Link>
              </article>
            );
          })}
        </div>

        <section className="chapter-index" aria-labelledby="chapter-index-title">
          <h2 id="chapter-index-title" className="chapter-index__title">
            Index
          </h2>
          <ul className="chapter-index__list">
            {chapterIndex.map((chapter) => (
              <li className="chapter-index__item" key={chapter.name}>
                <Link
                  className="chapter-index__name"
                  href={`/blogs/chapters/${chapter.slug}`}
                >
                  {chapter.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
