import { expect, test, type Locator, type Page } from "@playwright/test";

const EMPTY_CART_SHIPPING = "FREE STANDARD SHIPPING IN US FOR ORDERS OVER $200 USD";
const NEWSLETTER_SUCCESS = "THANK YOU FOR SUBSCRIBING TO STÜSSY.";

async function openHome(page: Page) {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await expect(page.getByTestId("hero-image")).toBeVisible();
}

async function box(locator: Locator) {
  const value = await locator.boundingBox();
  if (!value) throw new Error("Expected a visible element with a bounding box");
  return value;
}

async function expectsAt(locator: Locator, x: number, y: number) {
  await expect
    .poll(async () => {
      const value = await locator.boundingBox();
      return value ? [Math.round(value.x), Math.round(value.y)] : null;
    })
    .toEqual([x, y]);
}

function near(actual: number, expected: number, tolerance = 2) {
  expect(
    Math.abs(actual - expected),
    `expected ${actual} to be within ${tolerance}px of ${expected}`,
  ).toBeLessThanOrEqual(tolerance);
}

async function bodyOverflow(page: Page) {
  return page.evaluate(() => getComputedStyle(document.body).overflow);
}

async function documentHeight(page: Page) {
  return page.evaluate(() => document.documentElement.scrollHeight);
}

test.describe("responsive shell", () => {
  test("loads without runtime errors and uses the right chrome", async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto("/");
    await expect(page).toHaveTitle("Stüssy");
    await expect(page.getByTestId("hero-image")).toBeVisible();
    await page.waitForTimeout(300);

    const desktopVisible = await page.getByTestId("desktop-header").isVisible();
    const mobileVisible = await page.getByTestId("mobile-header").isVisible();

    if (testInfo.project.name === "desktop") {
      expect(desktopVisible).toBe(true);
      expect(mobileVisible).toBe(false);
    } else {
      expect(desktopVisible).toBe(false);
      expect(mobileVisible).toBe(true);
    }

    const widths = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
    expect(errors).toEqual([]);
  });

  test("desktop layout matches the reference geometry", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop-only layout");
    await openHome(page);

    const header = await box(page.getByTestId("desktop-header"));
    near(header.x, 0);
    near(header.y, 0);
    near(header.width, 1440);
    near(header.height, 54);

    const logo = await box(page.locator(".rail-logo"));
    near(logo.x, 20);
    near(logo.y, 20);
    near(logo.width, 120);
    near(logo.height, 85);

    const hero = await box(page.getByTestId("hero-image"));
    near(hero.x, 252);
    near(hero.y, 0);
    near(hero.width, 936);
    near(hero.height, 1224);
    near(await documentHeight(page), 1224);

    await expect(page.getByTestId("mobile-footer")).toBeHidden();
    await expect(page.getByTestId("announcement")).toBeVisible();
    await expect(page.locator(".rail-nav__copyright")).toHaveText("© 2026 STÜSSY");

    const search = await box(page.getByTestId("desktop-search-toggle"));
    const bag = await box(page.getByTestId("desktop-bag-open"));
    near(search.x, 1343);
    near(bag.x, 1399);
  });

  test("mobile layout matches the reference geometry", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile-only layout");
    await openHome(page);

    const header = await box(page.getByTestId("mobile-header"));
    near(header.x, 0);
    near(header.y, 0);
    near(header.width, 390);
    near(header.height, 81);

    const logo = await box(page.locator(".mobile-logo"));
    near(logo.x, 10);
    near(logo.y, 10);
    near(logo.width, 100);
    near(logo.height, 71);

    const hero = await box(page.getByTestId("hero-image"));
    near(hero.x, 0);
    near(hero.y, 167);
    near(hero.width, 390);
    near(hero.height, 510);

    const footer = await box(page.getByTestId("mobile-footer"));
    near(footer.y, 844);
    near(await documentHeight(page), 954);

    const search = await box(page.getByTestId("mobile-search-toggle"));
    const bag = await box(page.getByTestId("mobile-bag-open"));
    const menu = await box(page.getByTestId("mobile-menu-toggle"));
    near(search.x, 215);
    near(bag.x, 284);
    near(menu.x, 330);

    await expect(page.getByTestId("desktop-header")).toBeHidden();
    await expect(page.locator(".rail-nav__copyright")).toBeHidden();
  });
});

test.describe("scrolling", () => {
  test("desktop announcement collapses on scroll and can be hidden", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop-only behavior");
    await openHome(page);

    const announcement = page.getByTestId("announcement");
    await expect(announcement).toHaveAttribute("data-collapsed", "false");
    const transition = await announcement.evaluate(
      (element) => getComputedStyle(element).transitionDuration,
    );
    expect(Number.parseFloat(transition)).toBeGreaterThan(0);

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
    await expect(announcement).toHaveAttribute("data-collapsed", "true");
    await expect
      .poll(() =>
        page
          .getByTestId("announcement")
          .evaluate((element) => getComputedStyle(element).opacity),
      )
      .toBe("0");

    const header = await box(page.getByTestId("desktop-header"));
    near(header.y, 0);
    near(header.height, 54);

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(announcement).toHaveAttribute("data-collapsed", "false");
    await page.getByTestId("announcement-hide").click();
    await expect(page.getByTestId("announcement")).toHaveCount(0);

    await page.reload();
    await expect(page.getByTestId("hero-image")).toBeVisible();
    await expect(page.getByTestId("announcement")).toHaveCount(0);
  });

  test("mobile header stays fixed while the hero scrolls", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile-only behavior");
    await openHome(page);

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThanOrEqual(105);
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThanOrEqual(115);

    const header = await box(page.getByTestId("mobile-header"));
    near(header.y, 0);
    near(header.height, 81);

    const hero = await box(page.getByTestId("hero-image"));
    near(hero.y, 167 - scrollY);
  });
});

test.describe("desktop overlays", () => {
  test("search filters locally, shows empty state, and restores the page", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop-only behavior");
    await openHome(page);

    await page.getByTestId("desktop-search-toggle").click();
    const input = page.getByTestId("desktop-search-input");
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();
    await expect.poll(() => bodyOverflow(page)).toBe("hidden");

    await input.fill("tee");
    await expect(page.getByTestId("search-results")).toBeVisible();
    await expect(page.locator(".search-products .product-card").first()).toBeVisible();
    const background = await page
      .getByTestId("search-panel")
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(background).toBe("rgb(255, 255, 255)");

    await input.fill("zzz");
    await expect(page.getByTestId("search-empty")).toHaveText(/NO RESULTS FOUND/);

    await page.keyboard.press("Escape");
    await expect(page.getByTestId("desktop-search-input")).toHaveCount(0);
    await expect.poll(() => bodyOverflow(page)).not.toBe("hidden");
  });

  test("bag opens with the reference empty state and closes", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop-only behavior");
    await openHome(page);

    await page.getByTestId("desktop-bag-open").click();
    const drawer = page.getByTestId("cart-drawer");
    await expect(drawer).toBeVisible();
    await expectsAt(drawer, 864, 0);
    const drawerBox = await box(drawer);
    near(drawerBox.x, 864);
    near(drawerBox.width, 576);
    near(drawerBox.height, 900);

    await expect(drawer.locator("h2")).toHaveText(/shopping bag/i);
    await expect(page.getByTestId("cart-empty")).toContainText(
      "YOU HAVE NO ITEMS IN YOUR SHOPPING BAG.",
    );
    await expect(page.getByTestId("cart-empty")).toContainText(EMPTY_CART_SHIPPING);
    await expect.poll(() => bodyOverflow(page)).toBe("hidden");

    const transition = await drawer.evaluate(
      (element) => getComputedStyle(element).transitionDuration,
    );
    expect(Number.parseFloat(transition)).toBeGreaterThan(0);

    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect.poll(() => bodyOverflow(page)).not.toBe("hidden");

    await page.getByTestId("desktop-bag-open").click();
    await expect(drawer).toBeVisible();
    await page.getByTestId("cart-continue").click();
    await expect(drawer).toBeHidden();
  });

  test("newsletter modal succeeds and country selection updates the rail", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "desktop-only behavior");
    await openHome(page);

    await page.getByRole("button", { name: "Newsletter", exact: true }).click();
    const newsletter = page.getByTestId("newsletter-modal");
    await expect(newsletter).toBeVisible();
    near((await box(newsletter)).width, 480);

    await page.getByTestId("modal-newsletter-input").fill("test@example.com");
    await page.getByTestId("modal-newsletter-submit").click();
    await expect(page.getByTestId("modal-newsletter-success")).toHaveText(
      NEWSLETTER_SUCCESS,
    );

    await page.getByTestId("newsletter-close").click();
    await expect(newsletter).toBeHidden();

    await page.getByTestId("country-open").click();
    const countryModal = page.getByTestId("country-modal");
    await expect(countryModal).toBeVisible();
    await expect(page.getByTestId("country-select").locator("option")).toHaveCount(76);
    await page.getByTestId("country-select").selectOption("CA");
    await page.getByTestId("country-save").click();
    await expect(countryModal).toBeHidden();
    await expect(page.getByTestId("country-open")).toHaveText("CA / CAD");
  });
});

test.describe("mobile overlays", () => {
  test("navigation drawer matches the reference link order", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile-only behavior");
    await openHome(page);

    await page.getByTestId("mobile-menu-toggle").click();
    const drawer = page.getByTestId("nav-drawer");
    await expect(drawer).toBeVisible();
    await expectsAt(drawer, 0, 80);
    near((await box(drawer)).y, 80);
    near((await box(page.getByTestId("nav-link-new-arrivals"))).y, 91);

    const labels = (await page.locator(".nav-drawer-link").allInnerTexts()).map((label) =>
      label.trim().toUpperCase(),
    );
    expect(labels).toEqual([
      "NEW ARRIVALS",
      "TEES",
      "OUTERWEAR",
      "BEANIES",
      "HEADWEAR",
      "KNITS",
      "SWEATS",
      "TOPS & SHIRTS",
      "BOTTOMS",
      "DENIM",
      "SUNGLASSES",
      "ACCESSORIES",
      "ARCHIVE",
      "CHAPTERS",
      "SUPPORT",
      "SHIPPING & RETURNS",
      "HOLIDAY SHIPPING GUIDE",
      "SIZE GUIDE",
      "WARRANTY",
      "ACCESSIBILITY",
      "ACCOUNT",
      "LEGAL",
    ]);
    await expect(page.getByTestId("nav-country")).toHaveText("USD / $");
    await expect(page.getByTestId("mobile-menu-toggle")).toHaveText(/close/i);
    await expect.poll(() => bodyOverflow(page)).toBe("hidden");

    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(page.getByTestId("mobile-menu-toggle")).toHaveText(/menu/i);

    await page.getByTestId("mobile-menu-toggle").click();
    await expect(drawer).toBeVisible();
    await page.getByTestId("mobile-menu-toggle").click();
    await expect(drawer).toBeHidden();
    await expect.poll(() => bodyOverflow(page)).not.toBe("hidden");
  });

  test("search panel focuses the input, filters, and closes", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile-only behavior");
    await openHome(page);

    const hero = page.getByTestId("hero-image");
    await page.getByTestId("mobile-search-toggle").click();
    const panel = page.getByTestId("search-panel");
    await expect(panel).toBeVisible();
    await expect(page.getByTestId("mobile-search-input")).toBeFocused();
    await expect(page.getByTestId("mobile-search-toggle")).toHaveText(/close/i);
    await expect(hero).toBeVisible();

    const animation = await panel.evaluate(
      (element) => getComputedStyle(element).animationName,
    );
    expect(animation).toBe("search-panel-in");
    expect(
      await panel.evaluate((element) => getComputedStyle(element).backgroundColor),
    ).toBe("rgba(0, 0, 0, 0)");

    await page.getByTestId("mobile-search-input").fill("tee");
    await expect(page.locator(".search-products .product-card").first()).toBeVisible();
    expect(
      await panel.evaluate((element) => getComputedStyle(element).backgroundColor),
    ).toBe("rgb(255, 255, 255)");

    await page.getByTestId("mobile-search-input").fill("zzz");
    await expect(page.getByTestId("search-empty")).toHaveText(/NO RESULTS FOUND/);

    await page.getByTestId("mobile-search-toggle").click();
    await expect(page.getByTestId("search-panel")).toHaveCount(0);
    await expect.poll(() => bodyOverflow(page)).not.toBe("hidden");
  });

  test("full-screen bag and footer newsletter work", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile", "mobile-only behavior");
    await openHome(page);

    await page.getByTestId("mobile-bag-open").click();
    const drawer = page.getByTestId("cart-drawer");
    await expect(drawer).toBeVisible();
    await expectsAt(drawer, 0, 0);
    const drawerBox = await box(drawer);
    near(drawerBox.x, 0);
    near(drawerBox.y, 0);
    near(drawerBox.width, 390);
    near(drawerBox.height, 844);
    await expect(page.getByTestId("cart-empty")).toContainText(
      "YOU HAVE NO ITEMS IN YOUR SHOPPING BAG.",
    );
    await expect.poll(() => bodyOverflow(page)).toBe("hidden");

    await page.getByTestId("cart-continue").click();
    await expect(drawer).toBeHidden();
    await expect.poll(() => bodyOverflow(page)).not.toBe("hidden");

    const footer = page.getByTestId("mobile-footer");
    await footer.scrollIntoViewIfNeeded();
    await page.getByTestId("footer-newsletter-input").fill("test@example.com");
    await page.getByTestId("footer-newsletter-submit").click();
    await expect(page.getByTestId("footer-newsletter-success")).toHaveText(
      NEWSLETTER_SUCCESS,
    );
  });
});
