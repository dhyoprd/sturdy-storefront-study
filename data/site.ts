export type Category = {
  label: string;
  handle: string;
  href: string;
};

export type UtilityLink = {
  label: string;
  href: string;
};

export const announcement = {
  label: "HOLIDAY SHIPPING GUIDE",
  href: "/pages/holiday-shipping-guide",
};

export const newArrivals: Category = {
  label: "New Arrivals",
  handle: "new-arrivals",
  href: "/collections/new-arrivals",
};

export const categories: Category[] = [
  { label: "Tees", handle: "tees", href: "/collections/tees" },
  { label: "Outerwear", handle: "outerwear", href: "/collections/outerwear" },
  { label: "Beanies", handle: "beanies", href: "/collections/beanies" },
  { label: "Headwear", handle: "headwear", href: "/collections/headwear" },
  { label: "Knits", handle: "knits", href: "/collections/knits" },
  { label: "Sweats", handle: "sweats", href: "/collections/sweats" },
  { label: "Tops & Shirts", handle: "tops-shirts", href: "/collections/tops-shirts" },
  { label: "Bottoms", handle: "bottoms", href: "/collections/bottoms" },
  { label: "Denim", handle: "denim", href: "/collections/denim" },
  { label: "Sunglasses", handle: "sunglasses", href: "/collections/sunglasses" },
  { label: "Accessories", handle: "accessories", href: "/collections/accessories" },
];

export const archive: UtilityLink = { label: "Archive", href: "/blogs/news" };
export const chapters: UtilityLink = { label: "Chapters", href: "/blogs/chapters" };
export const support: UtilityLink = {
  label: "Support",
  href: "/pages/customer-support",
};
export const account: UtilityLink = { label: "Account", href: "/account" };
export const legal: UtilityLink = { label: "Legal", href: "/pages/legal" };

export const searchIndex: Array<{ label: string; href: string; group: string }> = [
  { label: newArrivals.label, href: newArrivals.href, group: "Collection" },
  ...categories.map((category) => ({
    label: category.label,
    href: category.href,
    group: "Collection",
  })),
  { label: archive.label, href: archive.href, group: "Journal" },
  { label: chapters.label, href: chapters.href, group: "Journal" },
];
