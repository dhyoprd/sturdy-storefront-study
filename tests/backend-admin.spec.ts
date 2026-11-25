import { expect, test, type Page } from "@playwright/test";
import { DatabaseSync } from "node:sqlite";

const ADMIN_EMAIL = "admin@test.local";
const ADMIN_PASSWORD = "test-password-123";
const TEST_DB_PATH = ".data/test-sturdy.db";

const SEED_ANNOUNCEMENT = {
  label: "HOLIDAY SHIPPING GUIDE",
  href: "/pages/holiday-shipping-guide",
  enabled: "1",
};
const SEED_HERO_IMAGE = "/images/homepage-hero.jpg";

const TEST_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

let sequence = 0;

function unique(prefix: string) {
  sequence += 1;
  return `${prefix} ${Date.now()}-${sequence}`;
}

function uniqueHandle(prefix: string) {
  sequence += 1;
  return `${prefix}-${Date.now()}-${sequence}`;
}

function testImage(name: string) {
  return { name, mimeType: "image/png", buffer: TEST_PNG };
}

function withTestDb<T>(work: (db: DatabaseSync) => T): T {
  const db = new DatabaseSync(TEST_DB_PATH, { timeout: 5_000 });
  try {
    return work(db);
  } finally {
    db.close();
  }
}

function restoreHomepageContent() {
  withTestDb((db) => {
    db.exec("BEGIN");
    try {
      const setSetting = db.prepare(
        `INSERT INTO settings (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      );
      setSetting.run("announcement_label", SEED_ANNOUNCEMENT.label);
      setSetting.run("announcement_href", SEED_ANNOUNCEMENT.href);
      setSetting.run("announcement_enabled", SEED_ANNOUNCEMENT.enabled);

      db.prepare("DELETE FROM hero_slides WHERE alt LIKE 'TEST HERO%'").run();
      db.prepare(
        `UPDATE hero_slides
         SET active = CASE WHEN image = ? THEN 1 ELSE 0 END`,
      ).run(SEED_HERO_IMAGE);

      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  });
}

function deleteTestProducts() {
  withTestDb((db) => {
    db.prepare("DELETE FROM products WHERE handle LIKE 'test-%'").run();
  });
}

async function openAdmin(page: Page, path: string) {
  const response = await page.goto(path);
  expect(response?.status(), `expected ${path} to respond with 200`).toBe(200);
  await page.waitForLoadState("networkidle");
}

async function loginAsAdmin(page: Page) {
  await openAdmin(page, "/admin/login");
  await page.getByTestId("admin-email").fill(ADMIN_EMAIL);
  await page.getByTestId("admin-password").fill(ADMIN_PASSWORD);
  await Promise.all([
    page.waitForURL(/\/admin$/),
    page.getByTestId("admin-login-submit").click(),
  ]);
  await expect(page.getByTestId("admin-current-user")).toHaveText(ADMIN_EMAIL);
}

async function expectSavedFlash(page: Page) {
  const flash = page.getByTestId("admin-flash");
  await expect(flash).toBeVisible();
  await expect(flash).toHaveAttribute("data-flash", "saved");
}

async function expectProductSaved(page: Page, text: string) {
  const flash = page.getByTestId("admin-flash");
  await expect(flash).toBeVisible();
  await expect(flash).toHaveAttribute("data-flash", "saved");
  await expect(flash).toContainText(text);
}

test.describe("admin auth", () => {
  test("unauthenticated admin redirects to login and a wrong password is rejected", async ({
    page,
  }) => {
    await openAdmin(page, "/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByTestId("admin-login-form")).toBeVisible();
    await expect(page.getByTestId("admin-current-user")).toHaveCount(0);

    await openAdmin(page, "/admin/products");
    await expect(page).toHaveURL(/\/admin\/login$/);

    await openAdmin(page, "/admin/homepage");
    await expect(page).toHaveURL(/\/admin\/login$/);

    await page.getByTestId("admin-email").fill(ADMIN_EMAIL);
    await page.getByTestId("admin-password").fill("definitely-the-wrong-password");
    await Promise.all([
      page.waitForURL(/\/admin\/login\?error=invalid$/),
      page.getByTestId("admin-login-submit").click(),
    ]);

    await expect(page.getByTestId("admin-login-error")).toHaveText(
      "Invalid email or password.",
    );
    await expect(page.getByTestId("admin-login-form")).toBeVisible();
  });

  test("signing in, visiting the login page while signed in, and signing out", async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await expect(page.getByTestId("admin-product-count")).toBeVisible();

    await openAdmin(page, "/admin/login");
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByTestId("admin-login-form")).toHaveCount(0);

    await Promise.all([
      page.waitForURL(/\/admin\/login$/),
      page.getByTestId("admin-logout").click(),
    ]);
    await expect(page.getByTestId("admin-login-form")).toBeVisible();
    await expect(page.getByTestId("admin-current-user")).toHaveCount(0);

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});

test.describe("admin homepage", () => {
  test.afterEach(() => {
    restoreHomepageContent();
  });

  test("announcement update publishes to the storefront", async ({ page }, testInfo) => {
    const label = unique("TEST ANNOUNCEMENT");
    const href = "/pages/legal";

    await loginAsAdmin(page);
    await openAdmin(page, "/admin/homepage");

    const form = page.getByTestId("announcement-form");
    await expect(form.getByTestId("announcement-label")).toHaveValue(
      SEED_ANNOUNCEMENT.label,
    );
    await form.getByTestId("announcement-label").fill(label);
    await form.getByTestId("announcement-href").fill(href);

    const enabled = form.getByTestId("announcement-enabled");
    if (!(await enabled.isChecked())) await enabled.check();

    await Promise.all([
      page.waitForURL(/[?&]saved=/),
      form.getByTestId("announcement-submit").click(),
    ]);
    await expectSavedFlash(page);

    await page.goto("/");
    const announcement = page.getByTestId("announcement-link");
    await expect(announcement).toHaveText(label);
    await expect(announcement).toHaveAttribute("href", href);
    if (testInfo.project.name === "desktop") {
      await expect(announcement).toBeVisible();
    }
  });

  test("hero slides can be created, edited, activated, and deleted", async ({ page }) => {
    const heroAlt = unique("TEST HERO");
    const heroHref = "/collections/new-arrivals";
    const editedAlt = `${heroAlt} EDITED`;
    const editedHref = "/collections/tees";

    await loginAsAdmin(page);
    await openAdmin(page, "/admin/homepage");

    const createForm = page.getByTestId("hero-create-form");
    await createForm
      .getByTestId("hero-create-image")
      .setInputFiles(testImage(`${heroAlt}.png`));
    await createForm.getByTestId("hero-create-href").fill(heroHref);
    await createForm.getByTestId("hero-create-alt").fill(heroAlt);
    await createForm.getByTestId("hero-create-active").check();
    await Promise.all([
      page.waitForURL(/[?&]saved=/),
      createForm.getByTestId("hero-create-submit").click(),
    ]);
    await expectSavedFlash(page);

    const heroRow = page.getByTestId("hero-slide-row").filter({ hasText: heroAlt });
    await expect(heroRow).toBeVisible();
    const heroId = Number(await heroRow.getAttribute("data-hero-id"));
    expect(Number.isInteger(heroId) && heroId > 0, "hero slide id").toBe(true);

    await page.goto("/");
    const heroImage = page.getByTestId("hero-image");
    await expect(heroImage).toHaveAttribute("src", /^\/uploads\//);
    await expect(heroImage).toHaveAttribute("alt", heroAlt);
    await expect(page.getByTestId("hero-link")).toHaveAttribute("href", heroHref);

    await openAdmin(page, "/admin/homepage");
    await expect(page.getByTestId(`hero-alt-${heroId}`)).toHaveValue(heroAlt);
    await page.getByTestId(`hero-alt-${heroId}`).fill(editedAlt);
    await page.getByTestId(`hero-href-${heroId}`).fill(editedHref);
    await Promise.all([
      page.waitForURL(/[?&]saved=/),
      page.getByTestId(`hero-save-${heroId}`).click(),
    ]);
    await expectSavedFlash(page);

    await page.goto("/");
    await expect(heroImage).toHaveAttribute("alt", editedAlt);
    await expect(page.getByTestId("hero-link")).toHaveAttribute("href", editedHref);
    await expect(heroImage).toHaveAttribute("src", /^\/uploads\//);

    await openAdmin(page, "/admin/homepage");
    const secondAlt = unique("TEST HERO");
    const secondHref = "/collections/outerwear";
    await createForm
      .getByTestId("hero-create-image")
      .setInputFiles(testImage(`${secondAlt}.png`));
    await createForm.getByTestId("hero-create-href").fill(secondHref);
    await createForm.getByTestId("hero-create-alt").fill(secondAlt);
    await createForm.getByTestId("hero-create-active").uncheck();
    await Promise.all([
      page.waitForURL(/[?&]saved=/),
      createForm.getByTestId("hero-create-submit").click(),
    ]);
    await expectSavedFlash(page);

    const secondRow = page.getByTestId("hero-slide-row").filter({ hasText: secondAlt });
    await expect(secondRow).toBeVisible();
    const secondId = Number(await secondRow.getAttribute("data-hero-id"));
    expect(Number.isInteger(secondId) && secondId > 0, "second hero slide id").toBe(
      true,
    );

    await openAdmin(page, "/admin/homepage");
    await Promise.all([
      page.waitForURL(/[?&]saved=/),
      page.getByTestId(`hero-activate-${secondId}`).click(),
    ]);
    await expectSavedFlash(page);
    await expect(page.getByTestId("hero-active-summary")).toContainText(
      `Slide ${secondId}`,
    );

    await page.goto("/");
    await expect(heroImage).toHaveAttribute("alt", secondAlt);
    await expect(page.getByTestId("hero-link")).toHaveAttribute("href", secondHref);
    await expect(heroImage).toHaveAttribute("src", /^\/uploads\//);

    await openAdmin(page, "/admin/homepage");
    await Promise.all([
      page.waitForURL(/[?&]saved=/),
      page.getByTestId(`hero-delete-${heroId}`).click(),
    ]);
    await expectSavedFlash(page);
    await expect(
      page.getByTestId("hero-slide-row").filter({ hasText: editedAlt }),
    ).toHaveCount(0);
    await expect(
      page.getByTestId("hero-slide-row").filter({ hasText: secondAlt }),
    ).toBeVisible();
  });
});

test.describe("admin products", () => {
  test.afterEach(() => {
    deleteTestProducts();
  });

  test("product create, edit, and delete publish to the collection page", async ({
    page,
  }) => {
    const base = unique("TEST TEE");
    const title = `${base} ALPHA`;
    const editedTitle = `${base} BETA`;
    const handle = uniqueHandle("test-tee");
    const collectionPath = "/collections/tees";

    await loginAsAdmin(page);
    await openAdmin(page, "/admin/products");

    const createForm = page.getByTestId("product-create-form");
    await createForm.getByTestId("product-title").fill(title);
    await createForm.getByTestId("product-handle").fill(handle);
    await createForm.getByTestId("product-collection").selectOption("tees");
    await createForm.getByTestId("product-price").fill("45");
    await createForm.getByTestId("product-color").fill("Black");
    await createForm
      .getByTestId("product-image")
      .setInputFiles(testImage(`${handle}.png`));
    await Promise.all([
      page.waitForURL(/[?&]saved=/),
      createForm.getByTestId("product-submit").click(),
    ]);
    await expectProductSaved(page, "Product created");

    const row = page.getByTestId("product-row").filter({ hasText: title });
    await expect(row).toBeVisible();
    await expect(row).toContainText("$45");
    await expect(row).toContainText("Black");
    await expect(row.locator("img")).toHaveAttribute("src", /^\/uploads\//);

    const editHref = await row.getByTestId("product-edit").getAttribute("href");
    expect(editHref, "product edit link").toMatch(/^\/admin\/products\/\d+$/);

    await page.goto(collectionPath);
    const card = page.getByTestId("product-card").filter({ hasText: title });
    await expect(card).toBeVisible();
    await expect(card).toContainText("$45");
    await expect(card.locator("img")).toHaveAttribute("src", /^\/uploads\//);

    await openAdmin(page, editHref as string);
    await expect(page.getByTestId("edit-product-form")).toBeVisible();
    await expect(page.getByTestId("edit-product-title")).toHaveValue(title);
    await expect(page.getByTestId("edit-product-price")).toHaveValue(/^45(?:\.0+)?$/);
    await page.getByTestId("edit-product-title").fill(editedTitle);
    await page.getByTestId("edit-product-price").fill("55");
    await Promise.all([
      page.waitForURL(/[?&]saved=/),
      page.getByTestId("edit-product-save").click(),
    ]);
    await expectProductSaved(page, "Product saved");

    await page.goto(collectionPath);
    await expect(
      page.getByTestId("product-card").filter({ hasText: editedTitle }),
    ).toContainText("$55");
    await expect(page.getByTestId("product-card").filter({ hasText: title }))
      .toHaveCount(0);

    await openAdmin(page, "/admin/products");
    const editedRow = page.getByTestId("product-row").filter({ hasText: editedTitle });
    await expect(editedRow).toBeVisible();
    await expect(editedRow).toContainText("$55");
    await Promise.all([
      page.waitForURL(/[?&]saved=/),
      editedRow.getByTestId("product-delete").click(),
    ]);
    await expectProductSaved(page, "Product deleted");
    await expect(
      page.getByTestId("product-row").filter({ hasText: editedTitle }),
    ).toHaveCount(0);

    await page.goto(collectionPath);
    await expect(
      page.getByTestId("product-card").filter({ hasText: editedTitle }),
    ).toHaveCount(0);
  });
});
