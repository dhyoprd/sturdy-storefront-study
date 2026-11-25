import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CollectionView from "@/components/catalog/CollectionView";
import { catalog } from "@/data/catalog";
import { getProductCards } from "@/lib/contentStore";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type Params = { handle: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { handle } = await params;
  const collection = catalog[handle];
  return {
    title: collection ? `${collection.title} | Stüssy` : "Stüssy",
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: SearchParams;
}) {
  const { handle } = await params;
  const collection = catalog[handle];
  if (!collection) notFound();

  const query = await searchParams;
  const rawSizes = query["filter.v.option.size"];
  const initialSizes = (
    Array.isArray(rawSizes) ? rawSizes : rawSizes ? [rawSizes] : []
  ).filter((value): value is string => Boolean(value));

  return (
    <main id="main" className="collection-page">
      <h1 className="visually-hidden">{collection.title}</h1>
      <CollectionView
        collection={{
          handle: collection.handle,
          title: collection.title,
          products: getProductCards(handle),
        }}
        initialSizes={initialSizes}
      />
    </main>
  );
}
