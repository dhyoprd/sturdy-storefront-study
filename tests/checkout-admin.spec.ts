import { expect, test, type Page } from "@playwright/test";

const COLLECTION_PATH = "/collections/tees";
const CART_STORAGE_KEY = "stussy.cart.v1";
const ORDERS_STORAGE_KEY = "stussy.orders.v1";
const ORDER_URL_PATTERN = /\/order\/STU-[A-Z0-9]+-[A-Z0-9]+$/;
const ADMIN_EMAIL = "admin@test.local";
const ADMIN_PASSWORD = "test-password-123";

const LOCAL_HOSTS: Record<string, true> = { localhost: true, "127.0.0.1": true };

const CUSTOMER = {
  email: "local@example.com",
  firstName: "Local",
  lastName: "Shopper",
  address1: "123 Local Street",
  city: "Los Angeles",
  state: "CA",
  postalCode: "90001",
  country: "US",
};

type StoredOrder = {
  id: string;
  status: string;
  totalCents: number;
  lines: { title: string; quantity: number }[];
};

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

async function open(page: Page, path: string) {
  const response = await page.goto(path);
  expect(response?.status(), `expected ${path} to respond with 200`).toBe(200);
  await waitForHydration(page);
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

async function openCollection(page: Page) {
  const response = await page.goto(COLLECTION_PATH);
  expect(response?.status(), `expected ${COLLECTION_PATH} to respond with 200`).toBe(200);
  await waitForHydration(page);
}

async function addFirstProduct(page: Page) {
  const card = page.getByTestId("product-card").first();
  const title = ((await card.locator(".product-card__title-link").innerText()) ?? "").trim();
  const price = ((await card.locator(".product-card__price").innerText()) ?? "").trim();

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

async function storedCartLines(page: Page) {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [] as { quantity?: number }[];

    try {
      const parsed = JSON.parse(raw) as { lines?: { quantity?: number }[] };
      return Array.isArray(parsed.lines) ? parsed.lines : [];
    } catch {
      return [] as { quantity?: number }[];
    }
  }, CART_STORAGE_KEY);
}

async function storedOrders(page: Page) {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [] as StoredOrder[];

    try {
      const parsed = JSON.parse(raw) as { orders?: StoredOrder[] };
      return Array.isArray(parsed.orders) ? parsed.orders : [];
    } catch {
      return [] as StoredOrder[];
    }
  }, ORDERS_STORAGE_KEY);
}

async function placeOrder(page: Page, projectName: string) {
  await openCollection(page);
  const product = await addFirstProduct(page);

  await openBag(page, projectName);
  const subtotalText = (await page.getByTestId("cart-subtotal").innerText()).trim();
  const subtotalCents = priceToCents(subtotalText);
  expect(subtotalCents, "expected a numeric bag subtotal").toBeGreaterThan(0);

  const shippingCents = subtotalCents >= 20_000 ? 0 : 1_000;
  const totalCents = subtotalCents + shippingCents;

  await page.getByTestId("cart-checkout").click();

  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByTestId("checkout-form")).toBeVisible();
  await expect(page.getByTestId("checkout-summary")).toBeVisible();
  await expect(page.getByTestId("checkout-subtotal")).toContainText(subtotalText);
  await expect(page.getByTestId("checkout-shipping")).toContainText(
    shippingCents === 0 ? "Free" : formatCents(shippingCents),
  );
  await expect(page.getByTestId("checkout-total")).toContainText(formatCents(totalCents));

  await page.getByTestId("checkout-email").fill(CUSTOMER.email);
  await page.getByTestId("checkout-first-name").fill(CUSTOMER.firstName);
  await page.getByTestId("checkout-last-name").fill(CUSTOMER.lastName);
  await page.getByTestId("checkout-address1").fill(CUSTOMER.address1);
  await page.getByTestId("checkout-city").fill(CUSTOMER.city);
  await page.getByTestId("checkout-state").fill(CUSTOMER.state);
  await page.getByTestId("checkout-postal-code").fill(CUSTOMER.postalCode);
  await page.getByTestId("checkout-country").selectOption(CUSTOMER.country);

  await page.getByTestId("checkout-submit").click();

  await expect(page).toHaveURL(ORDER_URL_PATTERN, { timeout: 15_000 });
  const orderId = new URL(page.url()).pathname.split("/order/")[1] ?? "";
  expect(orderId, "expected a Stüssy order id in the URL").toMatch(/^STU-/);

  await expect(page.getByTestId("order-confirmation")).toBeVisible();

  return { orderId, productTitle: product.title, totalCents };
}

test.describe("checkout", () => {
  test("empty checkout shows the empty state and a local link", async ({ page }) => {
    await open(page, "/checkout");

    await expect(page.getByTestId("checkout-empty")).toBeVisible();
    await expect(page.getByTestId("checkout-form")).toHaveCount(0);
    await expect(page.getByTestId("checkout-submit")).toHaveCount(0);
    await expect(page.getByTestId("checkout-subtotal")).toHaveCount(0);
    await expect(page.getByTestId("checkout-empty-link")).toHaveAttribute(
      "href",
      "/collections/new-arrivals",
    );

    const hrefs = await page
      .locator("#main a[href]")
      .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute("href") ?? ""));

    expect(hrefs.length, "expected a link in the empty checkout state").toBeGreaterThan(0);
    expect(
      hrefs.filter((href) => href.startsWith("/")),
      "expected a local link in the empty checkout state",
    ).not.toHaveLength(0);
    expect(
      hrefs.filter((href) => !href.startsWith("/") && !href.startsWith("#")),
      "non-local hrefs in the empty checkout state",
    ).toEqual([]);
  });

  test("placing an order saves it locally and clears the bag", async ({ page }, testInfo) => {
    const { orderId, productTitle, totalCents } = await placeOrder(page, testInfo.project.name);
    await expect(page.getByTestId("order-number")).toContainText(orderId);
    await expect(page.getByTestId("order-status")).toContainText("Placed");
    await expect(page.getByTestId("order-email")).toContainText(CUSTOMER.email);
    await expect(page.getByTestId("order-address")).toContainText(CUSTOMER.address1);
    await expect(page.getByTestId("order-items")).toContainText(productTitle);
    await expect(page.getByTestId("order-total")).toContainText(formatCents(totalCents));

    await expect(bagCount(page, testInfo.project.name)).toHaveCount(0);

    await expect.poll(async () => (await storedOrders(page)).length).toBe(1);
    const [stored] = await storedOrders(page);
    expect(stored.id).toBe(orderId);
    expect(stored.status).toBe("placed");
    expect(stored.totalCents).toBe(totalCents);
    expect(stored.lines).toHaveLength(1);

    await expect.poll(async () => (await storedCartLines(page)).length).toBe(0);

    await page.reload();
    await waitForHydration(page);

    await expect(page.getByTestId("order-confirmation")).toBeVisible();
    await expect(page.getByTestId("order-number")).toContainText(orderId);
    await expect(page.getByTestId("order-status")).toContainText("Placed");
    await expect(bagCount(page, testInfo.project.name)).toHaveCount(0);
  });

  test("checkout makes no external network requests", async ({ page }, testInfo) => {
    const hosts: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      if (url.startsWith("data:") || url.startsWith("blob:")) return;

      try {
        const { hostname } = new URL(url);
        if (hostname) hosts.push(hostname);
      } catch {
        hosts.push(url);
      }
    });

    await openCollection(page);
    await addFirstProduct(page);
    await openBag(page, testInfo.project.name);
    await page.getByTestId("cart-checkout").click();
    await expect(page.getByTestId("checkout-form")).toBeVisible();
    const summaryImages = page.getByTestId("checkout-summary").locator("img");
    await expect(summaryImages).toHaveCount(1);
    await expect(summaryImages.first()).toHaveAttribute("src", /^\/catalog\//);

    await page.waitForLoadState("networkidle");

    expect(hosts.length, "expected the checkout page to issue requests").toBeGreaterThan(0);

    const externalHosts = [...new Set(hosts)].filter(
      (host) => host.includes("stussy.com") || !LOCAL_HOSTS[host],
    );
    expect(externalHosts, "external request hosts on /checkout").toEqual([]);

    const hrefs = await page
      .locator("a[href]")
      .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute("href") ?? ""));
    expect(
      hrefs.filter((href) => /^(?:https?:|\/\/|mailto:)/i.test(href)),
      "external anchors on /checkout",
    ).toEqual([]);
  });
});

test.describe("order confirmation", () => {
  test("unknown order ids show the not-found state", async ({ page }) => {
    await open(page, "/order/not-real");

    await expect(page.getByTestId("order-not-found")).toBeVisible();
    await expect(page.getByTestId("order-confirmation")).toHaveCount(0);
    await expect(page.getByTestId("order-number")).toHaveCount(0);
  });
});

test.describe("admin", () => {
  test("local order is visible and status changes persist", async ({ page }, testInfo) => {
    const { orderId } = await placeOrder(page, testInfo.project.name);

    await loginAsAdmin(page);

    await openAdmin(page, "/admin/orders");

    await expect(page.getByTestId("admin-stat-orders")).toContainText("1");

    const rows = page.getByTestId("admin-order-row");
    await expect(rows).toHaveCount(1);

    const row = rows.first();
    await expect(row).toContainText(orderId);
    await expect(row).toHaveAttribute("data-status", "placed");
    await expect(row).toContainText("Placed");

    await row.getByTestId("admin-order-open").click();

    const modal = page.getByTestId("admin-order-modal");
    await expect(modal).toHaveAttribute("data-open", "true");

    await modal.getByTestId("admin-mark-fulfilled").click();

    await expect(row).toHaveAttribute("data-status", "fulfilled");
    await expect(row).toContainText("Fulfilled");

    await page.getByTestId("admin-order-close").click();
    await expect(modal).toHaveAttribute("data-open", "false");

    await page.reload();
    await expect(page.getByTestId("admin-stat-orders")).toBeVisible();

    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toHaveAttribute("data-status", "fulfilled");
    await expect(rows.first()).toContainText("Fulfilled");

    await page.getByTestId("admin-filter-fulfilled").click();
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText(orderId);

    await rows.first().getByTestId("admin-order-open").click();
    await expect(modal).toHaveAttribute("data-open", "true");

    const cancel = modal.getByTestId("admin-cancel-order");
    await expect(cancel).toBeVisible();
    await cancel.click();

    await page.getByTestId("admin-order-close").click();
    await expect(modal).toHaveAttribute("data-open", "false");

    await page.getByTestId("admin-filter-all").click();
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toHaveAttribute("data-status", "cancelled");
    await expect(rows.first()).toContainText("Cancelled");

    await page.reload();
    await expect(page.getByTestId("admin-stat-orders")).toBeVisible();

    await page.getByTestId("admin-filter-cancelled").click();
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toHaveAttribute("data-status", "cancelled");
    await expect(rows.first()).toContainText(orderId);
  });
});
