import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { liveCollections, liveProducts } from "@/lib/catalogSeed";
import { announcement } from "@/data/site";
import { hashPassword } from "@/lib/password";

const CATALOG_VERSION = "2";

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_sessions (
    token_hash TEXT PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS hero_slides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image TEXT NOT NULL,
    href TEXT NOT NULL,
    alt TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 0,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shopify_id TEXT NOT NULL DEFAULT '',
    collection_handle TEXT NOT NULL,
    handle TEXT NOT NULL,
    title TEXT NOT NULL,
    description_html TEXT NOT NULL DEFAULT '',
    product_type TEXT NOT NULL DEFAULT '',
    family TEXT NOT NULL DEFAULT '',
    tags_json TEXT NOT NULL DEFAULT '[]',
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    color TEXT NOT NULL,
    color_count INTEGER NOT NULL DEFAULT 1,
    image TEXT NOT NULL,
    images_json TEXT NOT NULL DEFAULT '[]',
    options_json TEXT NOT NULL DEFAULT '[]',
    variants_json TEXT NOT NULL DEFAULT '[]',
    available INTEGER NOT NULL DEFAULT 1,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE (collection_handle, handle)
  );

  CREATE INDEX IF NOT EXISTS products_collection_idx
    ON products (collection_handle, position, id);

  CREATE INDEX IF NOT EXISTS products_handle_idx
    ON products (handle, collection_handle);
`;

const PRODUCT_COLUMN_MIGRATIONS: Array<[string, string]> = [
  ["shopify_id", "TEXT NOT NULL DEFAULT ''"],
  ["description_html", "TEXT NOT NULL DEFAULT ''"],
  ["product_type", "TEXT NOT NULL DEFAULT ''"],
  ["family", "TEXT NOT NULL DEFAULT ''"],
  ["tags_json", "TEXT NOT NULL DEFAULT '[]'"],
  ["color_count", "INTEGER NOT NULL DEFAULT 1"],
  ["images_json", "TEXT NOT NULL DEFAULT '[]'"],
  ["options_json", "TEXT NOT NULL DEFAULT '[]'"],
  ["variants_json", "TEXT NOT NULL DEFAULT '[]'"],
  ["available", "INTEGER NOT NULL DEFAULT 1"],
];

let database: DatabaseSync | undefined;

function databasePath() {
  const configuredPath = process.env.STURDY_DB_PATH ?? ".data/sturdy.db";
  if (configuredPath === ":memory:") return configuredPath;
  return isAbsolute(configuredPath)
    ? configuredPath
    : join(/* turbopackIgnore: true */ process.cwd(), configuredPath);
}

function migrateProductColumns(db: DatabaseSync) {
  const rows = db.prepare("PRAGMA table_info(products)").all();
  const columns = new Set(rows.map((row) => String(row.name)));
  for (const [name, ddl] of PRODUCT_COLUMN_MIGRATIONS) {
    if (!columns.has(name)) {
      db.exec(`ALTER TABLE products ADD COLUMN ${name} ${ddl}`);
    }
  }
}

export function getDb() {
  if (database) return database;

  const path = databasePath();
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });

  database = new DatabaseSync(path, { timeout: 5_000 });
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec(SCHEMA);
  migrateProductColumns(database);
  seed(database);

  return database;
}

function seed(db: DatabaseSync) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const seeded = db.prepare("SELECT value FROM settings WHERE key = ?").get("seed_version");
    const version = seeded ? String(seeded.value) : "";
    const now = new Date().toISOString();
    const settings = db.prepare(
      "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING",
    );

    settings.run("announcement_label", announcement.label);
    settings.run("announcement_href", announcement.href);
    settings.run("announcement_enabled", "1");

    const heroCount = db.prepare("SELECT COUNT(*) AS count FROM hero_slides").get();
    if (!Number(heroCount?.count)) {
      db.prepare(
        `INSERT INTO hero_slides (image, href, alt, active, position, created_at, updated_at)
         VALUES (?, ?, ?, 1, 0, ?, ?)`,
      ).run(
        "/images/homepage-hero.jpg",
        "/collections/new-arrivals",
        "Stüssy Holiday 2026 campaign",
        now,
        now,
      );
    }

    if (version !== CATALOG_VERSION) {
      seedCatalog(db, now);
      settings.run("seed_version", CATALOG_VERSION);
    }

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  seedAdmin(db);
}

function seedCatalog(db: DatabaseSync, now: string) {
  db.exec("DELETE FROM products");
  const insert = db.prepare(
    `INSERT OR IGNORE INTO products (
      shopify_id, collection_handle, handle, title, description_html, product_type,
      family, tags_json, price_cents, color, color_count, image, images_json,
      options_json, variants_json, available, position, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  for (const collection of Object.values(liveCollections)) {
    collection.products.forEach((handle, index) => {
      const product = liveProducts[handle];
      if (!product) return;

      insert.run(
        product.id,
        collection.handle,
        product.handle,
        product.title,
        product.descriptionHtml,
        product.productType,
        product.family,
        JSON.stringify(product.tags),
        product.priceCents,
        product.color,
        product.colorCount,
        product.featuredImage || product.images[0]?.src || "",
        JSON.stringify(product.images),
        JSON.stringify(product.options),
        JSON.stringify(product.variants),
        product.available ? 1 : 0,
        index,
        now,
        now,
      );
    });
  }
}

function seedAdmin(db: DatabaseSync) {
  const adminCount = db.prepare("SELECT COUNT(*) AS count FROM admins").get();
  if (!adminCount || Number(adminCount.count) > 0) return;

  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn(
      "No admin account exists. Set ADMIN_EMAIL and ADMIN_PASSWORD and restart to seed one.",
    );
    return;
  }

  db.prepare(
    "INSERT OR IGNORE INTO admins (email, password_hash, created_at) VALUES (?, ?, ?)",
  ).run(email.toLowerCase(), hashPassword(password), new Date().toISOString());
}
