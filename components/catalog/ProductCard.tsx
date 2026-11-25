import Link from "next/link";
import type { ProductCardData } from "@/lib/content";

type ProductCardProps = {
  product: ProductCardData;
  collectionHandle: string;
};

export default function ProductCard({ product, collectionHandle }: ProductCardProps) {
  const productHref = `/collections/${collectionHandle}/products/${product.handle}`;

  return (
    <article
      className="product-card"
      data-testid="product-card"
      data-handle={product.handle}
      data-sold-out={!product.available}
    >
      <Link
        className="product-card__image-link"
        href={productHref}
        aria-label={`${product.color} ${product.title}`}
      >
        <div className="product-card__image">
          {product.image ? (
            <img
              className="product-card__image--desktop"
              src={product.image}
              alt={product.imageAlt}
              width={900}
              height={1125}
              loading="lazy"
            />
          ) : null}
          {product.hoverImage ? (
            <img
              className="product-card__image--mobile"
              src={product.hoverImage}
              alt={product.imageAlt}
              width={900}
              height={1125}
              loading="lazy"
            />
          ) : null}
        </div>
      </Link>

      <div className="product-card__info">
        <div className="product-card__title">
          <Link
            className="product-card__title-link"
            href={productHref}
            aria-label={`${product.color} ${product.title}`}
          >
            {product.title}
          </Link>
          {product.available && product.colorCount > 1 ? (
            <span className="product-card__colors">{product.colorCount} colors</span>
          ) : null}
        </div>
        <div className="product-card__price">
          <span>{product.available ? product.price : "Sold Out"}</span>
        </div>

        {product.available && product.sizes.length > 0 ? (
          <div className="product-card__size-variants">
            <ul>
              {product.sizes.map((size) => (
                <li key={size.label}>
                  {size.available && size.variantId ? (
                    <Link
                      href={`${productHref}?variant=${size.variantId}`}
                      aria-label={`View ${product.title}, size ${size.label}`}
                    >
                      {size.label}
                    </Link>
                  ) : (
                    <span aria-disabled="true">{size.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}
