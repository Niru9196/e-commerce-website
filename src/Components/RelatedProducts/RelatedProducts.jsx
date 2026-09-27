import React, { useCallback } from "react";
import "./RelatedProducts.css";
import { getRelated } from "../../api/products";
import useAsync from "../../hooks/useAsync";
import ProductGrid from "../ProductGrid/ProductGrid";
import { RevealOnScroll } from "../Motion/Reveal";
import { categoryLabel } from "../../data/catalog";

/**
 * Related products are now derived from the product being viewed —
 * same category, excluding itself, ranked by shared tags then price
 * proximity. Previously this always rendered the same four women's items
 * regardless of what you were looking at.
 */
const RelatedProducts = ({ product }) => {
    const productId = product?.id;

    const fetchRelated = useCallback(
        ({ signal }) =>
            productId ? getRelated(productId, 4, { signal }) : Promise.resolve([]),
        [productId]
    );

    const { data, status, error, retry } = useAsync(fetchRelated, [productId]);
    const products = data || [];

    if (!productId) return null;

    return (
        <section className="relatedproducts" aria-labelledby="related-heading">
            <RevealOnScroll className="section-head">
                <span className="cat-index">06 / YOU MAY ALSO LIKE</span>
                <h1 id="related-heading">Related products</h1>
                <span className="sku-tag">
                    MORE IN {categoryLabel(product.category).toUpperCase()}
                </span>
            </RevealOnScroll>
            <hr className="rule" />
            <ProductGrid
                products={products}
                status={status}
                error={error}
                onRetry={retry}
                skeletonCount={4}
                className="product-grid-rail relatedproducts-item"
            />
        </section>
    );
};

export default RelatedProducts;
