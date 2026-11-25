import type { Metadata } from "next";
import ProductCard from "@/components/catalog/ProductCard";
import { searchProductCards } from "@/lib/contentStore";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readQuery(params: Record<string, string | string[] | undefined>) {
  const raw = params.q;
  return (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const query = readQuery(await searchParams);
  return { title: query ? `Search: ${query} – Stüssy` : "Search – Stüssy" };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = readQuery(await searchParams);
  const products = searchProductCards(query, 48);

  return (
    <main id="main" className="search-page" data-testid="search-page">
      <h1 className="search-page__heading">
        {query ? `Search results for ${query}` : "Search"}
      </h1>

      <form className="search-page__form" action="/search" method="get" role="search">
        <label className="visually-hidden" htmlFor="search-page-input">
          Search
        </label>
        <input
          className="search-page__input"
          id="search-page-input"
          data-testid="search-page-input"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="SEARCH HERE"
          autoComplete="off"
          spellCheck={false}
        />
        <button className="search-page__submit" type="submit">
          Search
        </button>
      </form>

      {products.length > 0 ? (
        <div className="search-products" data-testid="search-page-results">
          {products.map((product) => (
            <ProductCard
              key={`${product.handle}-${product.id}`}
              product={product}
              collectionHandle={product.collectionHandle}
            />
          ))}
        </div>
      ) : (
        <p className="search-page__empty" data-testid="search-page-empty">
          NO RESULTS FOUND
        </p>
      )}
    </main>
  );
}
