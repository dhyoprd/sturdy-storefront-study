import { expect, test, type Page } from "@playwright/test";

const COLLECTION_PATH = "/collections/tees";
const CART_STORAGE_KEY = "stussy.cart.v1";

type StoredLine = { quantity?: number };

function bagCount(page: Page, projectName: string) {
  return page.getByTestId(
    projectName === "mobile" ? "mobile-bag-count" : "desktop-bag-count",
  );
}

function priceToCents(price: string) {
  const numeric = Number.parseFloat(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? Math.round(numeric * 100) : 0;
}

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2).replace(/\.00$/, "")}`;
}

async function waitForHydration(page: Page) {
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await expect(page.locator("html")).toHaveAttribute("data-cart-hydrated", "true");
}

async function openCollection(page: Page) {
  const response = await page.goto(COLLECTION_PATH);
  expect(response?.status(), `expected ${COLLECTION_PATH} to respond with 200`).toBe(200);
  await waitForHydration(page);
}

async function openBag(page: Page, projectName: string) {
  await page
    .getByTestId(projectName === "mobile" ? "mobile-bag-open" : "desktop-bag-open")
    .click();

  const drawer = page.getByTestId("cart-drawer");
  await expect(drawer).toHaveAttribute("data-open", "true");
  await expect(drawer).toBeVisible();

  // The panel slides in over 420ms; poll until it reaches its resting position.
  const viewport = page.viewportSize();
  if (!viewport) throw new Error("Expected the Playwright project to define a viewport");
  const restingX = projectName === "mobile" ? 0 : Math.round(viewport.width * 0.6);
  await expect
    .poll(async () => {
      const panelBox = await drawer.boundingBox();
      return panelBox ? Math.abs(Math.round(panelBox.x) - restingX) : null;
    })
    .toBe(0);

  return drawer;
}

async function addProduct(page: Page, index: number) {
  await page.goto(COLLECTION_PATH);
  await waitForHydration(page);

  const card = page.getByTestId("product-card").nth(index);
  const title = ((await card.locator(".product-card__title-link").innerText()) ?? "").trim();
  const price = ((await card.locator(".product-card__price").innerText()) ?? "").trim();
  expect(title, "expected the product card to show a title").not.toBe("");
  expect(price, "expected the product card to show a price").not.toBe("");

  await card.locator(".product-card__image-link").click();
  await expect(page).toHaveURL(/\/products\//);
  await expect(page.getByTestId("pdp-title")).toHaveText(title);
  await expect(page.getByTestId("pdp-price")).toHaveText(price);

  const availableSizes = page.locator('.pdp-size[data-sold-out="false"]');
  if (await availableSizes.count()) await availableSizes.first().click();

  await page.getByTestId("add-to-bag").click();
  await expect(page.getByTestId("add-to-bag-status")).toHaveText("Added to your bag.");

  const drawer = page.getByTestId("cart-drawer");
  await expect(drawer).toHaveAttribute("data-open", "true");
  await page.getByTestId("cart-close").click();
  await expect(drawer).toHaveAttribute("data-open", "false");
  return { title, price };
}

async function storedLineQuantities(page: Page) {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [] as number[];

    try {
      const parsed = JSON.parse(raw) as { lines?: StoredLine[] };
      if (!Array.isArray(parsed.lines)) return [] as number[];
      return parsed.lines.map((line) =>
        typeof line.quantity === "number" ? line.quantity : 0,
      );
    } catch {
      return [] as number[];
    }
  }, CART_STORAGE_KEY);
}

test("empty bag shows no header count and no subtotal", async ({ page }, testInfo) => {
  const projectName = testInfo.project.name;
  await openCollection(page);

  await expect(bagCount(page, projectName)).toHaveCount(0);

  await openBag(page, projectName);

  await expect(page.getByTestId("cart-empty")).toBeVisible();
  await expect(page.getByTestId("cart-line")).toHaveCount(0);
  await expect(page.getByTestId("cart-subtotal")).toHaveCount(0);
});

test("adding a product shows the status and updates the header count", async ({ page }, testInfo) => {
  const projectName = testInfo.project.name;
  await openCollection(page);

  const first = await addProduct(page, 0);
  await expect(bagCount(page, projectName)).toHaveText("(1)");

  const second = await addProduct(page, 0);
  expect(second.title).toBe(first.title);
  expect(second.price).toBe(first.price);
  await expect(bagCount(page, projectName)).toHaveText("(2)");
});

test("bag line quantity and subtotal update and removing the line empties the bag", async ({
  page,
}, testInfo) => {
  const projectName = testInfo.project.name;
  await openCollection(page);

  const { title, price } = await addProduct(page, 0);
  await addProduct(page, 0);
  const unitCents = priceToCents(price);
  expect(unitCents, "expected a numeric product price").toBeGreaterThan(0);

  await openBag(page, projectName);

  const lines = page.getByTestId("cart-line");
  await expect(lines).toHaveCount(1);

  const line = lines.first();
  await expect(line.getByTestId("cart-line-title")).toHaveText(title);
  await expect(line.getByTestId("cart-line-quantity")).toHaveText("2");
  await expect(page.getByTestId("cart-subtotal")).toContainText(formatCents(unitCents * 2));

  await line.getByTestId("cart-qty-increase").click();
  await expect(line.getByTestId("cart-line-quantity")).toHaveText("3");
  await expect(page.getByTestId("cart-subtotal")).toContainText(formatCents(unitCents * 3));

  await line.getByTestId("cart-qty-decrease").click();
  await expect(line.getByTestId("cart-line-quantity")).toHaveText("2");
  await expect(page.getByTestId("cart-subtotal")).toContainText(formatCents(unitCents * 2));

  await line.getByTestId("cart-remove").click();
  await expect(page.getByTestId("cart-line")).toHaveCount(0);
  await expect(page.getByTestId("cart-empty")).toBeVisible();
  await expect(page.getByTestId("cart-subtotal")).toHaveCount(0);
  await expect(bagCount(page, projectName)).toHaveCount(0);
});

test("multiple products can be removed individually or cleared together", async ({
  page,
}, testInfo) => {
  const projectName = testInfo.project.name;
  await openCollection(page);

  const first = await addProduct(page, 0);
  const second = await addProduct(page, 4);
  expect(second.title).not.toBe(first.title);

  await openBag(page, projectName);

  const lines = page.getByTestId("cart-line");
  await expect(lines).toHaveCount(2);

  const titles = (await lines.getByTestId("cart-line-title").allTextContents()).map((value) =>
    value.trim(),
  );
  expect(titles).toHaveLength(2);
  expect(new Set(titles).size).toBe(2);
  expect(titles).toEqual(expect.arrayContaining([first.title, second.title]));

  const firstLine = lines.filter({ hasText: first.title });
  await expect(firstLine).toHaveCount(1);
  await firstLine.getByTestId("cart-remove").click();

  await expect(lines).toHaveCount(1);
  await expect(page.getByTestId("cart-line-title")).toHaveText(second.title);
  await expect(page.getByTestId("cart-subtotal")).toBeVisible();

  await page.getByTestId("cart-clear").click();
  await expect(lines).toHaveCount(0);
  await expect(page.getByTestId("cart-empty")).toBeVisible();
  await expect(page.getByTestId("cart-subtotal")).toHaveCount(0);
  await expect(bagCount(page, projectName)).toHaveCount(0);
});

test("cart contents persist across a reload", async ({ page }, testInfo) => {
  const projectName = testInfo.project.name;
  await openCollection(page);

  const { title } = await addProduct(page, 0);
  await expect(bagCount(page, projectName)).toHaveText("(1)");
  await expect.poll(async () => (await storedLineQuantities(page)).length).toBe(1);

  await page.reload();
  await waitForHydration(page);

  await expect(bagCount(page, projectName)).toHaveText("(1)");
  await openBag(page, projectName);

  await expect(page.getByTestId("cart-line")).toHaveCount(1);
  await expect(page.getByTestId("cart-line-title")).toHaveText(title);
  await expect(page.getByTestId("cart-line-quantity")).toHaveText("1");
});

test("header count follows quantity changes in the open bag and they persist", async ({
  page,
}, testInfo) => {
  const projectName = testInfo.project.name;
  await openCollection(page);

  await addProduct(page, 0);
  await expect(bagCount(page, projectName)).toHaveText("(1)");

  const drawer = await openBag(page, projectName);
  const line = page.getByTestId("cart-line").first();
  await line.getByTestId("cart-qty-increase").click();

  await expect(line.getByTestId("cart-line-quantity")).toHaveText("2");
  await expect(drawer).toHaveAttribute("data-open", "true");
  await expect(bagCount(page, projectName)).toHaveText("(2)");
  await expect.poll(async () => (await storedLineQuantities(page))[0]).toBe(2);

  await page.reload();
  await waitForHydration(page);
  await expect.poll(async () => (await storedLineQuantities(page))[0]).toBe(2);

  await expect(bagCount(page, projectName)).toHaveText("(2)");
  await openBag(page, projectName);

  await expect(page.getByTestId("cart-line")).toHaveCount(1);
  await expect(page.getByTestId("cart-line-quantity")).toHaveText("2");
  await expect(page.getByTestId("cart-subtotal")).toBeVisible();
});
