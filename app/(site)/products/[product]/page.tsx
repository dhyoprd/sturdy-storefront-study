import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailView from "@/components/catalog/ProductDetailView";
import { catalog } from "@/data/catalog";
import {
  getProductByAnyCollection,
  getRelatedColors,
} from "@/lib/contentStore";

export const dynamic = "force-dynamic";

type Params = { product: string };
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { product } = await params;
  const record = getProductByAnyCollection(product);
  return {
    title: record ? `${record.title} – ${record.color} | Stüssy` : "Stüssy",
  };
}

export default async function LooseProductPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: SearchParams;
}) {
  const { product } = await params;
  const record = getProductByAnyCollection(product);
  if (!record) notFound();

  const query = await searchParams;
  const rawVariant = Array.isArray(query.variant) ? query.variant[0] : query.variant;

  return (
    <ProductDetailView
      product={record}
      collectionHandle={record.collectionHandle}
      collectionTitle={catalog[record.collectionHandle]?.title ?? record.collectionHandle}
      relatedColors={getRelatedColors(record)}
      initialVariantId={typeof rawVariant === "string" ? rawVariant : undefined}
    />
  );
}
