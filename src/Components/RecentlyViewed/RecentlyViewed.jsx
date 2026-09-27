import React from "react";
import { useShop } from "../../Context/ShopContext";
import ProductGrid from "../ProductGrid/ProductGrid";
import { RevealOnScroll } from "../Motion/Reveal";
import "./RecentlyViewed.css";

/**
 * Recently viewed rail. Renders nothing at all on a first visit — an empty
 * "Recently viewed" heading would be worse than no section.
 */
const RecentlyViewed = ({
    excludeId,
    index = "07",
    limit = 4,
    title = "Recently viewed",
}) => {
    const { recentlyViewedProducts } = useShop();

    const products = recentlyViewedProducts
        .filter((product) => product.id !== Number(excludeId))
        .slice(0, limit);

    if (products.length === 0) return null;

    return (
        <section className="recently-viewed" aria-labelledby="recent-heading">
            <RevealOnScroll className="section-head">
                <span className="cat-index">{index} / YOUR HISTORY</span>
                <h2 id="recent-heading">{title}</h2>
                <span className="sku-tag">
                    {products.length} {products.length === 1 ? "PIECE" : "PIECES"}
                </span>
            </RevealOnScroll>
            <hr className="rule" />
            <ProductGrid
                products={products}
                status="success"
                className="product-grid-rail"
            />
        </section>
    );
};

export default RecentlyViewed;
