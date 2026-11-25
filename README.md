# Stüssy local storefront study

I built this project to learn how a production storefront is put together with
Next.js 16 App Router, React 19, TypeScript, and Playwright. It is a local study copy
of the public Stüssy storefront as it looked on 24 November 2026.

The goal is education: responsive layout, shared React components, CSS systems, data
modeling, server actions, SQLite, authentication, form handling, and end-to-end tests.

I am sharing it publicly for learning about frameworks and website design, not as a
product or a store.

The project is not an official Stüssy site, is not affiliated with Stüssy, and is not
intended for commercial use. Stüssy names, logos, product photos, editorial photos, and
copy belong to Stüssy. The HelveticaNeue font files belong to their licensors.

## What this project covers

- Homepage with the desktop side rail, mobile header, announcement, hero, and footer.
- 12 collection pages with 768 unique products and 3,223 local product images.
- Collection filters saved in the URL, sold-out cards, and product size links.
- Product pages with variants, size selection, image gallery, image viewer, related
  colours, per-product size charts, and Add to Bag.
- Predictive search, a full search results page, cart drawer, and local checkout.
- Local account demo and admin login for homepage and catalogue editing.
- Five news cards with multi-image galleries and article pages.
- All 34 chapter pages with local galleries and contact details where available.
- Support, legal, shipping, size guide, warranty, accessibility, and holiday pages.
- Local SQLite storage for storefront content and an admin panel for editing it.

Everything runs from this repo. Product and editorial images are stored under
`public/catalog/live` and `public/editorial`. Fonts are under `app/fonts`. The app makes
no runtime request to stussy.com, a CDN, or a commerce API. Orders, account data, and
notify-me requests stay in the browser's local storage.

## Shopify features are simulated locally

The original site uses Shopify for commerce, accounts, inventory, checkout, newsletter
delivery, and predictive search. Those services are not connected here. This study
replaces them with local demos so the interface can still be explored:

- Checkout creates a browser-only order. No card is collected and nothing is charged.
- Account sign-in stores an email in local storage.
- Inventory comes from a static snapshot, so stock does not update live.
- Notify-me stores the email locally. It does not send a message.
- Search runs against the local SQLite database.
- Admin sessions and catalogue edits stay in the local database.

Do not use this project as a real store, collect real customer data, or deploy it as a
production commerce site.

## Requirements

- Node.js 24 or newer, because the project uses `node:sqlite`.
- npm.
- A writable project directory for `.data` and `public/uploads`.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. The admin panel is at `/admin/login`.

| Variable | Purpose |
| --- | --- |
| `STURDY_DB_PATH` | SQLite path. Defaults to `.data/sturdy.db`. Relative paths resolve from the project root. `:memory:` works for a throwaway run. |
| `ADMIN_EMAIL` | Email for the first admin account. |
| `ADMIN_PASSWORD` | Password for the first admin account. |
| `SESSION_COOKIE_SECURE` | Set to `true` behind HTTPS. It stays `false` for local http. |

The database is created on first access. It seeds the announcement, one hero slide, and
979 product collection entries covering the 768 unique products in
`data/catalog-live.json`. Seeding is guarded by `settings.seed_version`, so later admin
edits are not overwritten.

`ADMIN_EMAIL` and `ADMIN_PASSWORD` only create the first admin when the admin table is
empty. To reset that account, remove `.data/sturdy.db` or update the password hash in the
database.

The `.env.local`, `.data`, and `public/uploads` paths are gitignored. Never commit real
credentials or customer data.

## Production-style run

```bash
npm run build
npm start
```

The server needs write access to the directory holding `STURDY_DB_PATH` and to
`public/uploads`. No external database or service is required.

## Testing

```bash
npm run typecheck
npm test
```

Playwright uses the installed Chrome through `channel: "chrome"`. The test server resets
`.data/test-sturdy.db`, builds the app, and serves it on port 3210. Test admin credentials
are separate from the development account and live in `playwright.config.ts`.

The suite covers desktop at 1440x900 and mobile at 390x844. Last full run: 169 passed,
17 skipped, 0 failed.

## Routes

| Route | Content |
| --- | --- |
| `/` | Homepage with the active hero slide from SQLite. |
| `/collections/[handle]` | Catalogue grid, size filter, and 12 collection handles. |
| `/collections/[handle]/products/[product]` | Product details, variants, gallery, size guide, and Add to Bag. |
| `/products/[product]` | The same product page without a collection prefix. |
| `/search?q=` | Full local search results. |
| `/blogs/news` and `/blogs/news/[slug]` | News cards, galleries, and article pages. |
| `/blogs/chapters` and `/blogs/chapters/[slug]` | Chapter directory and 34 store pages. |
| `/pages/...` | Support, legal, shipping, size guide, warranty, accessibility, and holiday content. |
| `/account` | Local account demo. |
| `/checkout` and `/order/[id]` | Local checkout and order confirmation. |
| `/admin` | Authenticated admin area for homepage content and products. |
| `/api/search` | Local product search endpoint. |

## Data

```text
data/catalog-live.json   12 collections, 768 products, variants, galleries
data/size-charts.json    size charts captured from 575 product pages
data/news.ts             news items, article slugs, and local galleries
data/editorial.ts        chapter slugs, addresses, contact details, galleries
data/support.json        support details and FAQs
data/legal.json          legal text
public/catalog/live/     3,223 product images from the 24 November 2026 snapshot
public/editorial/        news and chapter gallery images
```

Size charts were collected from the live product pages. 575 products have a chart,
180 products were checked and have no size guide, and 13 pages could not be captured
(10 products were removed and 3 returned rate-limit responses). Those products show a
local fallback message.

## Project structure

```text
app/(site)/          public pages
app/admin/           admin login and dashboard
components/          site chrome, catalogue, editorial, checkout, admin, overlays
data/                local content and captured data
lib/                 SQLite, content store, auth, cart, orders, uploads
public/              images, logo, fonts, cursors
styles/              CSS for each surface
tests/               Playwright specs
```

## Technical notes

The admin session uses an HTTP-only cookie. Only a SHA-256 token hash is stored in
SQLite. Passwords use scrypt. The admin layout checks the session on the server, and each
mutation checks it again.

Product images uploaded through the admin are validated by MIME type and file signature,
limited to 5 MB, and stored under `public/uploads` with a random name. Images are not
re-encoded.

SQLite runs in WAL mode and assumes one local Next.js process. It has no multi-instance
coordination or backup tooling. Set `SESSION_COOKIE_SECURE=true` when serving over HTTPS.

## Credits and rights

This is an unofficial educational project. Stüssy trademarks, logo, campaign images,
product images, editorial images, and site copy belong to Stüssy. HelveticaNeue belongs to
its licensors. The third-party assets are included only to study the public site and are
not offered under an open license.

If you own rights to an asset and want it removed, open an issue in this repository.
