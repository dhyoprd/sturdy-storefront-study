export type AnnouncementConfig = {
  label: string;
  href: string;
  enabled: boolean;
};

export type HeroSlide = {
  id: number;
  image: string;
  href: string;
  alt: string;
  active: boolean;
  position: number;
};

export type ProductImageRecord = {
  src: string;
  alt: string;
  width: number;
  height: number;
  position: number;
};

export type ProductVariantRecord = {
  id: string;
  title: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  priceCents: number;
  available: boolean;
  sku: string;
};

export type ProductOptionRecord = {
  name: string;
  position: number;
  values: string[];
};

export type ProductRecord = {
  id: number;
  shopifyId: string;
  collectionHandle: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  productType: string;
  family: string;
  tags: string[];
  priceCents: number;
  color: string;
  colorCount: number;
  image: string;
  images: ProductImageRecord[];
  options: ProductOptionRecord[];
  variants: ProductVariantRecord[];
  available: boolean;
  position: number;
};

export type ProductCardData = {
  id: number;
  collectionHandle: string;
  handle: string;
  title: string;
  price: string;
  available: boolean;
  color: string;
  colorCount: number;
  image: string;
  imageAlt: string;
  hoverImage: string;
  sizes: Array<{ label: string; available: boolean; variantId: string }>;
};
