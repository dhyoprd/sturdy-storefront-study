import { expect, test, type Locator, type Page } from "@playwright/test";

const COLLECTION_ROUTES = [
  "/collections/new-arrivals",
  "/collections/tees",
  "/collections/outerwear",
  "/collections/beanies",
  "/collections/headwear",
  "/collections/knits",
  "/collections/sweats",
  "/collections/tops-shirts",
  "/collections/bottoms",
  "/collections/denim",
  "/collections/sunglasses",
  "/collections/accessories",
] as const;

const ROUTES = [
  "/",
  ...COLLECTION_ROUTES,
  "/blogs/news",
  "/blogs/news/stussy-archive-seattle",
  "/blogs/chapters",
  "/blogs/chapters/stussy-los-angeles",
  "/blogs/chapters/stussy-amsterdam",
  "/pages/customer-support",
  "/pages/legal",
  "/pages/holiday-shipping-guide",
  "/pages/shipping-returns",
  "/pages/size-guide",
  "/pages/eyegear-warranty",
  "/pages/accessibility",
  "/products/1905216-fresh-foils-tee-red",
  "/search?q=tee",
  "/account",
  "/checkout",
] as const;

const ANCHOR_ROUTES = [
  "/",
  "/collections/tees",
  "/blogs/news",
  "/blogs/news/stussy-archive-seattle",
  "/blogs/chapters",
  "/blogs/chapters/stussy-los-angeles",
  "/blogs/chapters/stussy-amsterdam",
  "/pages/customer-support",
  "/pages/legal",
  "/pages/holiday-shipping-guide",
  "/pages/shipping-returns",
  "/pages/size-guide",
  "/pages/eyegear-warranty",
  "/pages/accessibility",
  "/products/1905216-fresh-foils-tee-red",
  "/search?q=tee",
  "/account",
  "/checkout",
] as const;

const LOCAL_HOSTS: Record<string, true> = { localhost: true, "127.0.0.1": true };

async function open(page: Page, path: string) {
  const response = await page.goto(path);
  expect(response?.status(), `expected ${path} to respond with 200`).toBe(200);
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
}

async function openHome(page: Page) {
  await open(page, "/");
  await expect(page.getByTestId("hero-image")).toBeVisible();
}

async function expectSingleHeader(page: Page, projectName: string) {
  const desktop = page.getByTestId("desktop-header");
  const mobile = page.getByTestId("mobile-header");

  if (projectName === "desktop") {
    await expect(desktop).toBeVisible();
    await expect(mobile).toBeHidden();
  } else {
    await expect(mobile).toBeVisible();
    await expect(desktop).toBeHidden();
  }

  const visibleHeaders = [await desktop.isVisible(), await mobile.isVisible()].filter(
    Boolean,
  ).length;
  expect(visibleHeaders, "expected exactly one visible site header").toBe(1);
}

async function box(locator: Locator) {
  const value = await locator.boundingBox();
  if (!value) throw new Error("Expected a visible element with a bounding box");
  return value;
}

function expectNear(actual: number, expected: number, tolerance = 2) {
  expect(
    Math.abs(actual - expected),
    `expected ${actual} to be within ${tolerance}px of ${expected}`,
  ).toBeLessThanOrEqual(tolerance);
}

test.describe("local routes", () => {
  for (const route of ROUTES) {
    test(`${route} renders locally`, async ({ page }, testInfo) => {
      const response = await page.goto(route);
      expect(response?.status(), `expected ${route} to respond with 200`).toBe(200);

      await expectSingleHeader(page, testInfo.project.name);
      await expect(page.locator("#main")).toBeVisible();
    });
  }
});

test.describe("local-only anchors", () => {
  for (const route of ANCHOR_ROUTES) {
    test(`${route} has no external anchors`, async ({ page }) => {
      await open(page, route);

      const hrefs = await page.locator("a[href]").evaluateAll((anchors) =>
        anchors.map((anchor) => anchor.getAttribute("href") ?? ""),
      );

      expect(hrefs.length, `expected anchors on ${route}`).toBeGreaterThan(0);

      const external = hrefs.filter((href) => /^(?:https?:|\/\/|mailto:)/i.test(href));
      expect(external, `external anchors found on ${route}`).toEqual([]);

      const notInternal = hrefs.filter(
        (href) => !href.startsWith("/") && !href.startsWith("#"),
      );
      expect(notInternal, `non-local hrefs found on ${route}`).toEqual([]);
    });
  }
});

test("home page makes no external network requests", async ({ page }) => {
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

  await page.goto("/");
  await expect(page.getByTestId("hero-image")).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(hosts.length, "expected the home page to issue requests").toBeGreaterThan(0);

  const externalHosts = [...new Set(hosts)].filter(
    (host) => host.includes("stussy.com") || !LOCAL_HOSTS[host],
  );
  expect(externalHosts, "external request hosts on /").toEqual([]);
});

test.describe("header navigation", () => {
  test("desktop rail Tees link opens the local collection", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop-only behavior");
    await openHome(page);

    const tees = page
      .getByTestId("desktop-header")
      .getByRole("link", { name: "Tees", exact: true });
    await expect(tees).toHaveAttribute("href", "/collections/tees");
    await tees.click();

    await expect(page).toHaveURL("/collections/tees");
    await expect(page.getByTestId("collection-grid")).toBeVisible();
    await expect(page.locator("#main")).toBeVisible();
  });

  test("mobile menu Tees link opens the local collection", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile-only behavior");
    await openHome(page);

    const drawer = page.getByTestId("nav-drawer");
    await page.getByTestId("mobile-menu-toggle").click();
    await expect(drawer).toBeVisible();

    const tees = page.getByTestId("nav-link-tees");
    await expect(tees).toHaveAttribute("href", "/collections/tees");
    await tees.click();

    await expect(page).toHaveURL("/collections/tees");
    await expect(drawer).toBeHidden();
    await expect(page.getByTestId("collection-grid")).toBeVisible();
    await expect(page.locator("#main")).toBeVisible();
  });
});

test.describe("collection browsing", () => {
  test("grid, product images, and product pages work", async ({ page }) => {
    await open(page, "/collections/tees");

    const grid = page.getByTestId("collection-grid");
    await expect(grid).toBeVisible();

    const cards = page.getByTestId("product-card");
    expect(await cards.count()).toBeGreaterThanOrEqual(100);

    const sources = await cards.locator("img").evaluateAll((images) =>
      images.map((image) => image.getAttribute("src") ?? ""),
    );
    expect(sources.length).toBeGreaterThanOrEqual(100);
    for (const source of sources) {
      expect(source, "product images must be served locally").toMatch(/^\/catalog\//);
    }

    const firstCard = cards.first();
    const title = (
      (await firstCard.locator(".product-card__title-link").innerText()) ?? ""
    ).trim();
    const price = ((await firstCard.locator(".product-card__price").innerText()) ?? "").trim();
    expect(title.length).toBeGreaterThan(0);
    expect(price.length).toBeGreaterThan(0);

    await firstCard.locator(".product-card__image-link").click();

    await expect(page).toHaveURL(/\/collections\/tees\/products\/.+/);
    await expect(page.getByTestId("pdp-title")).toHaveText(title);
    await expect(page.getByTestId("pdp-price")).toHaveText(price);
    await expect(page.getByTestId("pdp-image").first()).toBeVisible();
    await expect(page.getByTestId("add-to-bag")).toBeVisible();
  });

  test("sold-out sizes and sold-out products cannot be added to the bag", async ({
    page,
  }) => {
    await open(page, "/collections/tees/products/1905216-fresh-foils-tee-red");

    const add = page.getByTestId("add-to-bag");
    await expect(add).toHaveText("add to bag", { ignoreCase: true });
    await add.click();
    await expect(add).toHaveText("select a size", { ignoreCase: true });
    await expect(page.getByTestId("cart-drawer")).toHaveAttribute("data-open", "false");

    const xs = page.locator(".pdp-size").filter({ hasText: /^XS$/ });
    await expect(xs).toHaveAttribute("data-sold-out", "true");
    await xs.click();
    await expect(xs).toHaveAttribute("data-selected", "true");
    await expect(add).toHaveText("notify me when available", { ignoreCase: true });
    await expect(add).toBeEnabled();
    await add.click();
    await expect(page.getByTestId("pdp-notify")).toBeVisible();
    await page.getByTestId("notify-email").fill("notify@example.com");
    await page.getByTestId("pdp-notify").getByRole("button", { name: "Notify Me" }).click();
    await expect(page.getByTestId("notify-success")).toBeVisible();
    await expect(page.getByTestId("cart-drawer")).toHaveAttribute("data-open", "false");

    await open(
      page,
      "/collections/tees/products/1905216-fresh-foils-tee-red?variant=42887887257696",
    );
    await expect(page.getByTestId("add-to-bag")).toHaveText("sold out", {
      ignoreCase: true,
    });
    await expect(page.getByTestId("add-to-bag")).toBeDisabled();
    await expect(page.getByTestId("cart-drawer")).toHaveAttribute("data-open", "false");

    await open(page, "/collections/tees/products/1905208-bulldog-tee-white");
    await expect(page.getByTestId("add-to-bag")).toHaveText("sold out", {
      ignoreCase: true,
    });
    await expect(page.getByTestId("add-to-bag")).toBeDisabled();
  });

  test("collection size filters persist in the URL and across reloads", async ({
    page,
  }) => {
    await open(page, "/collections/tees");
    const allCards = await page.getByTestId("product-card").count();

    await page.getByTestId("collection-filter").click();
    await page.getByTestId("filter-size-XS").check();
    await page.getByTestId("filter-apply").click();

    await expect(page).toHaveURL(/filter\.v\.option\.size=XS/);
    await expect(page).toHaveURL(/filter\.v\.availability=1/);
    const filteredCards = await page.getByTestId("product-card").count();
    expect(filteredCards).toBeGreaterThan(0);
    expect(filteredCards).toBeLessThan(allCards);

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
    await expect(page.getByTestId("product-card")).toHaveCount(filteredCards);

    await page.getByTestId("collection-filter").click();
    await page.getByTestId("filter-clear").click();
    await page.getByTestId("filter-apply").click();
    await expect(page).not.toHaveURL(/filter\.v\./);
    await expect(page.getByTestId("product-card")).toHaveCount(allCards);
  });

  test("desktop grid uses four columns", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop-only layout");
    await open(page, "/collections/tees");

    const cards = page.getByTestId("product-card");
    await expect(cards.first()).toBeVisible();

    const first = await box(cards.nth(0));
    const second = await box(cards.nth(1));
    const fourth = await box(cards.nth(3));
    const fifth = await box(cards.nth(4));

    expectNear(second.y, first.y);
    expectNear(fourth.y, first.y);
    expect(second.x).toBeGreaterThan(first.x);
    expect(fifth.y).toBeGreaterThan(first.y + 10);
  });

  test("mobile grid uses two columns", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile-only layout");
    await open(page, "/collections/tees");

    const cards = page.getByTestId("product-card");
    await expect(cards.first()).toBeVisible();

    const first = await box(cards.nth(0));
    const second = await box(cards.nth(1));
    const third = await box(cards.nth(2));
    const fourth = await box(cards.nth(3));

    expectNear(second.y, first.y);
    expectNear(fourth.y, third.y);
    expect(second.x).toBeGreaterThan(first.x);
    expect(third.y).toBeGreaterThan(first.y + 10);
  });
});

test.describe("search navigation", () => {
  test("desktop search result navigates to a local product page", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop-only behavior");
    await openHome(page);

    await page.getByTestId("desktop-search-toggle").click();
    await page.getByTestId("desktop-search-input").fill("tee");

    const result = page.locator(".search-products .product-card").first();
    await expect(result).toBeVisible();
    const title = (
      (await result.locator(".product-card__title-link").innerText()) ?? ""
    ).trim();
    await result.locator(".product-card__image-link").click();

    await expect(page).toHaveURL(/\/collections\/.+\/products\/.+/);
    await expect(page.getByTestId("pdp-title")).toHaveText(title);
    await expect(page.getByTestId("desktop-search-input")).toHaveCount(0);
  });

  test("mobile search result navigates to a local product page", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile-only behavior");
    await openHome(page);

    await page.getByTestId("mobile-search-toggle").click();
    await page.getByTestId("mobile-search-input").fill("tee");

    const result = page.locator(".search-products .product-card").first();
    await expect(result).toBeVisible();
    const title = (
      (await result.locator(".product-card__title-link").innerText()) ?? ""
    ).trim();
    await result.locator(".product-card__image-link").click();

    await expect(page).toHaveURL(/\/collections\/.+\/products\/.+/);
    await expect(page.getByTestId("pdp-title")).toHaveText(title);
    await expect(page.getByTestId("mobile-search-input")).toHaveCount(0);
  });
});

test.describe("local documents", () => {
  test("support FAQ accordions expand", async ({ page }) => {
    await open(page, "/pages/customer-support");

    const faqs = page.getByTestId("support-faqs").locator("details");
    expect(await faqs.count()).toBeGreaterThanOrEqual(20);

    const first = faqs.first();
    await first.locator("summary").click();

    await expect(first).toHaveAttribute("open", "");
    await expect(first.locator(".document-accordion__body")).toBeVisible();
  });

  test("legal page lists its sections", async ({ page }) => {
    await open(page, "/pages/legal");

    const sections = page.getByTestId("legal-sections").locator("details");
    expect(await sections.count()).toBeGreaterThanOrEqual(3);
    await expect(sections.first().locator("summary")).toBeVisible();
  });

  test("holiday guide links to the local support page", async ({ page }) => {
    await open(page, "/pages/holiday-shipping-guide");

    const faq = page.getByRole("link", { name: "FAQ", exact: true });
    await expect(faq).toHaveAttribute("href", "/pages/customer-support");
    await faq.click();

    await expect(page).toHaveURL("/pages/customer-support");
    await expect(page.getByTestId("support-faqs")).toBeVisible();
  });

  test("account signs in, persists across reload, and signs out", async ({ page }) => {
    const email = "local@example.com";

    await open(page, "/account");

    const form = page.getByTestId("account-form");
    await expect(form).toBeVisible();

    await page.getByTestId("account-email").fill(email);
    await page.getByTestId("account-password").fill("local-password");
    await form.getByRole("button", { name: "Sign In" }).click();

    const signedIn = page.getByTestId("account-signed-in");
    await expect(signedIn).toBeVisible();
    await expect(signedIn).toContainText(email);

    await page.reload();
    await expect(signedIn).toContainText(email);

    await page.getByTestId("account-signout").click();
    await expect(page.getByTestId("account-form")).toBeVisible();
    await expect(signedIn).toHaveCount(0);
  });
});

test.describe("search and gallery parity", () => {
  test("predictive search starts at one character and links to full results", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop-only behavior");
    await openHome(page);

    await page.getByTestId("desktop-search-toggle").click();
    const input = page.getByTestId("desktop-search-input");
    await input.fill("t");

    await expect(page.locator(".search-products .product-card").first()).toBeVisible();
    await expect(page.getByTestId("search-view-all")).toHaveAttribute(
      "href",
      /^\/search\?q=t/,
    );

    await page.getByTestId("search-clear").click();
    await expect(input).toHaveValue("");
    await expect(page.getByTestId("search-results")).toHaveCount(0);

    await input.fill("tee");
    await page.getByTestId("search-view-all").click();
    await expect(page).toHaveURL(/\/search\?q=tee/);
    await expect(page.getByTestId("search-page")).toBeVisible();
    await expect(
      page.getByTestId("search-page-results").getByTestId("product-card").first(),
    ).toBeVisible();
  });

  test("search results page renders and has a local empty state", async ({ page }) => {
    await open(page, "/search?q=tee");
    await expect(page.getByTestId("search-page-results")).toBeVisible();
    await expect(page.getByTestId("product-card").first()).toBeVisible();

    await open(page, "/search?q=zzzzzz");
    await expect(page.getByTestId("search-page-empty")).toHaveText(/NO RESULTS FOUND/);
  });

  test("product gallery switches between single image and View All", async ({
    page,
  }) => {
    await open(page, "/collections/tees/products/1905216-fresh-foils-tee-red");

    await page.getByTestId("pdp-image").first().click();
    const zoom = page.getByTestId("pdp-zoom");
    await expect(zoom).toBeVisible();
    await expect(zoom).toHaveAttribute("data-mode", "single");

    await page.getByTestId("pdp-zoom-view-all").click();
    await expect(page.getByTestId("pdp-zoom-grid")).toBeVisible();
    const thumbs = page.getByTestId("pdp-zoom-thumb");
    expect(await thumbs.count()).toBeGreaterThan(1);
    await thumbs.nth(1).click();
    await expect(zoom).toHaveAttribute("data-mode", "single");

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("pdp-zoom")).toHaveCount(0);
  });

  test("per-product size guide is rendered", async ({ page }) => {
    await open(page, "/collections/tees/products/1905216-fresh-foils-tee-red");
    const guide = page
      .locator(".pdp-accordion summary")
      .filter({ hasText: "Size Guide" });
    await guide.click();
    await expect(page.locator(".pdp-size-chart table")).toBeVisible();
    await expect(page.locator(".pdp-size-chart")).toContainText(/CHEST/i);
  });

  test("news cards and chapter pages open local galleries", async ({ page }) => {
    await open(page, "/blogs/news");
    const newsGallery = page.getByTestId("news-gallery-2026-November-13");
    await newsGallery.getByTestId("news-gallery-2026-November-13-view-all").click();
    await expect(newsGallery.getByTestId("news-gallery-2026-November-13-lightbox")).toBeVisible();
    await expect(
      newsGallery.getByTestId(/news-gallery-2026-November-13-thumb-/),
    ).toHaveCount(2);
    await page.keyboard.press("Escape");

    await open(page, "/blogs/chapters/stussy-toronto");
    const chapterGallery = page.getByTestId("chapter-gallery");
    await page.getByTestId("chapter-gallery-view-all").click();
    await expect(chapterGallery.getByTestId("chapter-gallery-lightbox")).toBeVisible();
    await expect(chapterGallery.getByTestId(/chapter-gallery-thumb-/)).toHaveCount(3);
  });
});
