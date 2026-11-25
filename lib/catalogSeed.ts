import catalogDocument from "@/data/catalog-live.json";
import type {
  ProductImageRecord,
  ProductOptionRecord,
  ProductVariantRecord,
} from "@/lib/content";

export type LiveProduct = {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  productType: string;
  tags: string[];
  family: string;
  color: string;
  priceCents: number;
  available: boolean;
  colorCount: number;
  options: ProductOptionRecord[];
  variants: ProductVariantRecord[];
  images: ProductImageRecord[];
  featuredImage: string;
};

type LiveCollection = {
  handle: string;
  title: string;
  products: string[];
};

type LiveCatalog = {
  generatedAt: string;
  collections: Record<string, LiveCollection>;
  products: Record<string, LiveProduct>;
};

const liveCatalog = catalogDocument as unknown as LiveCatalog;

export const liveCollections = liveCatalog.collections;
export const liveProducts = liveCatalog.products;
