import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailView from "@/components/catalog/ProductDetailView";
import { catalog } from "@/data/catalog";
import {
  getProductByHandle,
  getRelatedColors,
} from "@/lib/contentStore";

export const dynamic = "force-dynamic";

type Params = { handle: string; product: string };
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { handle, product } = await params;
  const record = getProductByHandle(handle, product);
  return {
    title: record
      ? `${record.title} – ${record.color} | ${catalog[handle]?.title ?? "Stüssy"} | Stüssy`
      : "Stüssy",
  };
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: SearchParams;
}) {
  const { handle, product } = await params;
  const collection = catalog[handle];
  const record = getProductByHandle(handle, product);
  if (!collection || !record) notFound();

  const query = await searchParams;
  const rawVariant = Array.isArray(query.variant) ? query.variant[0] : query.variant;

  return (
    <ProductDetailView
      product={record}
      collectionHandle={handle}
      collectionTitle={collection.title}
      relatedColors={getRelatedColors(record)}
      initialVariantId={typeof rawVariant === "string" ? rawVariant : undefined}
    />
  );
}
