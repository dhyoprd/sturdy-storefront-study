import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EditorialGallery from "@/components/editorial/EditorialGallery";
import { chapterIndex, chapterPages, chapters } from "@/data/editorial";

type Params = { slug: string };

function chapterSlug(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveChapter(slug: string) {
  return (
    chapters.find((chapter) => chapter.slug === slug) ??
    chapterIndex.find((chapter) => chapter.slug === slug) ??
    chapterIndex.find((chapter) => chapterSlug(chapter.name) === slug) ??
    null
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const chapter = resolveChapter(slug);
  return { title: chapter ? `${chapter.name} – Stüssy Chapters` : "Chapters – Stüssy" };
}

export default async function ChapterPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const chapter = resolveChapter(slug);
  if (!chapter) notFound();
  const details = chapterPages[chapter.slug];
  const featured = chapters.find((item) => item.slug === chapter.slug);
  const gallery = details?.gallery ?? featured?.gallery ?? [];

  return (
    <main id="main" className="chapter-page">
      <div className="chapter-page__inner">
        <div className="chapter-page__date">
          <Link href="/blogs/chapters">Chapter Directory</Link>
        </div>

        {gallery.length > 0 ? (
          <EditorialGallery
            className="chapter-page__media"
            images={gallery}
            fallback={featured?.image}
            alt={chapter.name}
            testId="chapter-gallery"
          />
        ) : null}

        <h1 className="chapter-page__title">
          {chapter.name} {chapter.address}
        </h1>

        <dl className="chapter-page__details">
          <div>
            <dt>Address</dt>
            <dd>{chapter.address}</dd>
          </div>
          {details?.phone ? (
            <div>
              <dt>Phone</dt>
              <dd>{details.phone}</dd>
            </div>
          ) : null}
          {details?.email ? (
            <div>
              <dt>Email</dt>
              <dd>{details.email}</dd>
            </div>
          ) : null}
          {details?.openingHours.length ? (
            <div>
              <dt>Opening Hours</dt>
              <dd>{details.openingHours.join("\n")}</dd>
            </div>
          ) : null}
        </dl>
      </div>
    </main>
  );
}
