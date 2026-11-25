import { getDb } from "@/lib/db";
import { formatPrice } from "@/lib/cart";
import type {
  AnnouncementConfig,
  HeroSlide,
  ProductCardData,
  ProductImageRecord,
  ProductOptionRecord,
  ProductRecord,
  ProductVariantRecord,
} from "@/lib/content";

type Row = Record<string, unknown>;

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function parseJsonArray<T>(value: unknown): T[] {
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function mapHero(row: Row): HeroSlide | null {
  const id = asNumber(row.id);
  const image = asString(row.image);
  const href = asString(row.href);
  if (!id || !image || !href) return null;

  return {
    id,
    image,
    href,
    alt: asString(row.alt),
    active: asNumber(row.active) === 1,
    position: asNumber(row.position),
  };
}

function mapProduct(row: Row): ProductRecord | null {
  const id = asNumber(row.id);
  const collectionHandle = asString(row.collection_handle);
  const handle = asString(row.handle);
  const title = asString(row.title);
  if (!id || !collectionHandle || !handle || !title) return null;

  const image = asString(row.image);
  let images = parseJsonArray<ProductImageRecord>(row.images_json).filter(
    (item) => item && typeof item.src === "string" && item.src,
  );
  if (images.length === 0 && image) {
    images = [{ src: image, alt: title, width: 0, height: 0, position: 1 }];
  }

  const variants = parseJsonArray<ProductVariantRecord>(row.variants_json).filter(
    (item) => item && typeof item.id === "string",
  );
  const options = parseJsonArray<ProductOptionRecord>(row.options_json).filter(
    (item) => item && typeof item.name === "string",
  );

  return {
    id,
    shopifyId: asString(row.shopify_id),
    collectionHandle,
    handle,
    title,
    descriptionHtml: asString(row.description_html),
    productType: asString(row.product_type),
    family: asString(row.family),
    tags: parseJsonArray<string>(row.tags_json),
    priceCents: asNumber(row.price_cents),
    color: asString(row.color),
    colorCount: asNumber(row.color_count, 1),
    image,
    images,
    options,
    variants,
    available: asNumber(row.available, 1) === 1,
    position: asNumber(row.position),
  };
}

function defaultVariant(input: {
  handle: string;
  title: string;
  color: string;
  priceCents: number;
}): ProductVariantRecord {
  return {
    id: `manual-${input.handle}-${Date.now()}`,
    title: `${input.color} / ONE SIZE`,
    option1: input.color,
    option2: "ONE SIZE",
    option3: null,
    priceCents: input.priceCents,
    available: true,
    sku: "",
  };
}

function defaultOptions(color: string) {
  return [
    { name: "Color", position: 1, values: [color] },
    { name: "Size", position: 2, values: ["ONE SIZE"] },
  ];
}

export function getAnnouncement(): AnnouncementConfig {
  const rows = getDb()
    .prepare("SELECT key, value FROM settings WHERE key LIKE 'announcement_%'")
    .all();

  const values = new Map<string, string>();
  for (const row of rows) {
    values.set(asString(row.key), asString(row.value));
  }

  return {
    label: values.get("announcement_label") ?? "HOLIDAY SHIPPING GUIDE",
    href: values.get("announcement_href") ?? "/pages/holiday-shipping-guide",
    enabled: values.get("announcement_enabled") !== "0",
  };
}

export function updateAnnouncement(input: AnnouncementConfig) {
  const db = getDb();
  const statement = db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  );

  db.exec("BEGIN");
  try {
    statement.run("announcement_label", input.label);
    statement.run("announcement_href", input.href);
    statement.run("announcement_enabled", input.enabled ? "1" : "0");
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function getHeroSlides(): HeroSlide[] {
  return getDb()
    .prepare("SELECT * FROM hero_slides ORDER BY position ASC, id ASC")
    .all()
    .map(mapHero)
    .filter((hero): hero is HeroSlide => hero !== null);
}

export function getActiveHero(): HeroSlide | null {
  const row = getDb()
    .prepare("SELECT * FROM hero_slides WHERE active = 1 ORDER BY position ASC, id ASC LIMIT 1")
    .get();
  return row ? mapHero(row) : null;
}

export function getHeroSlide(id: number): HeroSlide | null {
  const row = getDb().prepare("SELECT * FROM hero_slides WHERE id = ?").get(id);
  return row ? mapHero(row) : null;
}

export function setActiveHero(id: number) {
  const db = getDb();
  db.exec("BEGIN");
  try {
    db.prepare("UPDATE hero_slides SET active = 0, updated_at = ?").run(
      new Date().toISOString(),
    );
    db.prepare("UPDATE hero_slides SET active = 1, updated_at = ? WHERE id = ?").run(
      new Date().toISOString(),
      id,
    );
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function createHeroSlide(input: {
  image: string;
  href: string;
  alt: string;
  active: boolean;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const row = db.prepare("SELECT COALESCE(MAX(position), -1) + 1 AS position FROM hero_slides").get();
  const position = asNumber(row?.position);
  const result = db
    .prepare(
      `INSERT INTO hero_slides (image, href, alt, active, position, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(input.image, input.href, input.alt, input.active ? 1 : 0, position, now, now);
  const id = Number(result.lastInsertRowid);
  if (input.active) setActiveHero(id);
  return id;
}

export function updateHeroSlide(
  id: number,
  input: { image: string; href: string; alt: string; active: boolean },
) {
  getDb()
    .prepare(
      `UPDATE hero_slides
       SET image = ?, href = ?, alt = ?, updated_at = ?
       WHERE id = ?`,
    )
    .run(input.image, input.href, input.alt, new Date().toISOString(), id);
  if (input.active) setActiveHero(id);
}

export function deleteHeroSlide(id: number) {
  getDb().prepare("DELETE FROM hero_slides WHERE id = ?").run(id);
}

export function getProductsByCollection(collectionHandle: string): ProductRecord[] {
  return getDb()
    .prepare(
      "SELECT * FROM products WHERE collection_handle = ? ORDER BY position ASC, id ASC",
    )
    .all(collectionHandle)
    .map(mapProduct)
    .filter((product): product is ProductRecord => product !== null);
}

export function getProductCards(collectionHandle: string): ProductCardData[] {
  return getProductsByCollection(collectionHandle).map((product) => {
    const image = product.images.find((item) => item.src === product.image) ?? product.images[0];
    return {
      id: product.id,
      collectionHandle: product.collectionHandle,
      handle: product.handle,
      title: product.title,
      price: formatPrice(product.priceCents),
      available: product.available,
      color: product.color,
      colorCount: product.colorCount,
      image: product.image || image?.src || "",
      imageAlt: image?.alt || product.title,
      hoverImage: product.images[0]?.src !== product.image ? product.images[0]?.src ?? "" : "",
      sizes: getCardSizes(product),
    };
  });
}

function getCardSizes(product: ProductRecord) {
  const sizeOption = product.options.find((option) => option.name.toLowerCase() === "size");
  const labels: string[] = sizeOption?.values.length
    ? sizeOption.values
    : [
        ...new Set(
          product.variants
            .map((variant) => variant.option2)
            .filter((value): value is string => Boolean(value)),
        ),
      ];

  return labels.map((label) => {
    const variants = product.variants.filter((variant) => variant.option2 === label);
    const availableVariant = variants.find((variant) => variant.available) ?? variants[0];
    return {
      label,
      available: variants.some((variant) => variant.available),
      variantId: availableVariant?.id ?? "",
    };
  });
}

export function getAllProducts(): ProductRecord[] {
  return getDb()
    .prepare("SELECT * FROM products ORDER BY collection_handle ASC, position ASC, id ASC")
    .all()
    .map(mapProduct)
    .filter((product): product is ProductRecord => product !== null);
}

export function getProductById(id: number): ProductRecord | null {
  const row = getDb().prepare("SELECT * FROM products WHERE id = ?").get(id);
  return row ? mapProduct(row) : null;
}

export function getProductByHandle(
  collectionHandle: string,
  handle: string,
): ProductRecord | null {
  const row = getDb()
    .prepare("SELECT * FROM products WHERE collection_handle = ? AND handle = ?")
    .get(collectionHandle, handle);
  return row ? mapProduct(row) : null;
}

export function getProductByAnyCollection(handle: string): ProductRecord | null {
  const row = getDb()
    .prepare(
      "SELECT * FROM products WHERE handle = ? ORDER BY collection_handle ASC, position ASC LIMIT 1",
    )
    .get(handle);
  return row ? mapProduct(row) : null;
}

export function searchProductCards(query: string, limit = 8): ProductCardData[] {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  const seen = new Set<string>();
  const matches = getAllProducts().filter((product) => {
    if (seen.has(product.handle)) return false;
    if (
      !product.title.toLowerCase().includes(term) &&
      !product.handle.toLowerCase().includes(term) &&
      !product.color.toLowerCase().includes(term) &&
      !product.productType.toLowerCase().includes(term)
    ) {
      return false;
    }
    seen.add(product.handle);
    return true;
  });

  return matches.slice(0, limit).map((product) => {
    const image = product.images.find((item) => item.src === product.image) ?? product.images[0];
    return {
      id: product.id,
      collectionHandle: product.collectionHandle,
      handle: product.handle,
      title: product.title,
      price: formatPrice(product.priceCents),
      available: product.available,
      color: product.color,
      colorCount: product.colorCount,
      image: product.image || image?.src || "",
      imageAlt: image?.alt || product.title,
      hoverImage: "",
      sizes: getCardSizes(product),
    };
  });
}

export function createProduct(input: {
  collectionHandle: string;
  handle: string;
  title: string;
  priceCents: number;
  color: string;
  image: string;
}) {
  const db = getDb();
  const now = new Date().toISOString();
  const row = db
    .prepare(
      "SELECT COALESCE(MAX(position), -1) + 1 AS position FROM products WHERE collection_handle = ?",
    )
    .get(input.collectionHandle);
  const position = asNumber(row?.position);
  const variant = defaultVariant(input);
  const images: ProductImageRecord[] = [
    { src: input.image, alt: input.title, width: 0, height: 0, position: 1 },
  ];

  db.prepare(
    `INSERT INTO products (
      shopify_id, collection_handle, handle, title, description_html, product_type,
      family, tags_json, price_cents, color, color_count, image, images_json,
      options_json, variants_json, available, position, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    "",
    input.collectionHandle,
    input.handle,
    input.title,
    "",
    "",
    input.handle,
    "[]",
    input.priceCents,
    input.color,
    1,
    input.image,
    JSON.stringify(images),
    JSON.stringify(defaultOptions(input.color)),
    JSON.stringify([variant]),
    1,
    position,
    now,
    now,
  );
}

export function updateProduct(
  id: number,
  input: {
    collectionHandle: string;
    handle: string;
    title: string;
    priceCents: number;
    color: string;
    image: string;
  },
) {
  const current = getProductById(id);
  if (!current) return;

  const variants = current.variants.length
    ? current.variants.map((variant) => ({
        ...variant,
        title: `${input.color} / ${variant.option2 ?? "ONE SIZE"}`,
        option1: input.color,
        priceCents: input.priceCents,
      }))
    : [
        defaultVariant({
          handle: input.handle,
          title: input.title,
          color: input.color,
          priceCents: input.priceCents,
        }),
      ];
  const images =
    input.image === current.image && current.images.length
      ? current.images
      : [{ src: input.image, alt: input.title, width: 0, height: 0, position: 1 }];

  getDb()
    .prepare(
      `UPDATE products
       SET collection_handle = ?, handle = ?, title = ?, price_cents = ?, color = ?,
           image = ?, images_json = ?, variants_json = ?, updated_at = ?
       WHERE id = ?`,
    )
    .run(
      input.collectionHandle,
      input.handle,
      input.title,
      input.priceCents,
      input.color,
      input.image,
      JSON.stringify(images),
      JSON.stringify(variants),
      new Date().toISOString(),
      id,
    );
}

export function deleteProduct(id: number) {
  getDb().prepare("DELETE FROM products WHERE id = ?").run(id);
}

export function getContentCounts() {
  const db = getDb();
  const products = db.prepare("SELECT COUNT(*) AS count FROM products").get();
  const heroes = db.prepare("SELECT COUNT(*) AS count FROM hero_slides").get();
  return {
    products: asNumber(products?.count),
    heroes: asNumber(heroes?.count),
  };
}

export type RelatedColor = {
  handle: string;
  color: string;
  image: string;
  selected: boolean;
};

export function getRelatedColors(product: ProductRecord): RelatedColor[] {
  if (!product.family) return [];
  const seen = new Set<string>();
  return getAllProducts()
    .filter((item) => {
      if (item.family !== product.family || seen.has(item.handle)) return false;
      seen.add(item.handle);
      return true;
    })
    .map((item) => ({
      handle: item.handle,
      color: item.color,
      image: item.images[0]?.src ?? item.image,
      selected: item.handle === product.handle,
    }));
}

export function getAdminProductPage(page = 1, query = "", pageSize = 100) {
  const db = getDb();
  const term = query.trim();
  const where = term ? "WHERE title LIKE ? OR handle LIKE ?" : "";
  const params = term ? [`%${term}%`, `%${term}%`] : [];
  const countRow = db.prepare(`SELECT COUNT(*) AS count FROM products ${where}`).get(...params);
  const total = asNumber(countRow?.count);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, Math.floor(page)), pageCount);
  const offset = (currentPage - 1) * pageSize;
  const products = db
    .prepare(
      `SELECT * FROM products ${where}
       ORDER BY updated_at DESC, id DESC
       LIMIT ? OFFSET ?`,
    )
    .all(...params, pageSize, offset)
    .map(mapProduct)
    .filter((product): product is ProductRecord => product !== null);

  return { products, total, page: currentPage, pageCount, pageSize, query: term };
}
